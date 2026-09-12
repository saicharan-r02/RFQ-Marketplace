import prisma from '../lib/prisma.js';
import { sendToUser } from '../sockets/index.js';

export const submitQuotation = async (req, res, next) => {
    try {
        const rfqId = parseInt(req.params.rfqId, 10);
        const supplierId = req.user.id;
        const { price, deliveryDays, validUntil, notes } = req.body;

        if (isNaN(rfqId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid RFQ ID.',
            });
        }

        const rfq = await prisma.rFQ.findUnique({
            where: { id: rfqId },
            include: {
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                        email: true,
                    },
                },
            },
        });

        if (!rfq) {
            return res.status(404).json({
                success: false,
                message: 'RFQ not found.',
            });
        }

        if (rfq.status !== 'OPEN') {
            return res.status(400).json({
                success: false,
                message: `Cannot submit quote. This RFQ is ${rfq.status.toLowerCase()}.`,
            });
        }

        if (new Date() > new Date(rfq.deadline)) {
            return res.status(400).json({
                success: false,
                message:
                    'The deadline for submitting quotations on this RFQ has expired.',
            });
        }

        if (Number(rfq.buyerId) === Number(supplierId)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot submit a quote for your own RFQ.',
            });
        }

        const existingQuotation = await prisma.quotation.findUnique({
            where: {
                rfqId_supplierId: {
                    rfqId,
                    supplierId,
                },
            },
        });

        if (existingQuotation) {
            return res.status(409).json({
                success: false,
                message:
                    'You already submitted a quotation for this RFQ. Visit the RFQ details page to review it.',
            });
        }

        const quotation = await prisma.quotation.create({
            data: {
                rfqId,
                supplierId,
                price,
                deliveryDays,
                validUntil: validUntil ? new Date(validUntil) : null,
                notes,
                status: 'PENDING',
            },
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                        email: true,
                        phone: true,
                    },
                },
                rfq: {
                    select: {
                        id: true,
                        title: true,
                        buyerId: true,
                        status: true,
                    },
                },
            },
        });

        sendToUser(rfq.buyerId, 'new_quotation', {
            message: `New quotation of $${price} received for "${rfq.title}" from ${req.user.companyName}`,
            quotationId: quotation.id,
            rfqId: quotation.rfqId,
            quotation,
        });

        return res.status(201).json({
            success: true,
            message: 'Quotation submitted successfully.',
            data: {
                quotation,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateQuotationStatus = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const buyerId = req.user.id;
        const { status } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quotation ID.',
            });
        }

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either ACCEPTED or REJECTED.',
            });
        }

        const quotation = await prisma.quotation.findUnique({
            where: { id },
            include: {
                rfq: true,
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                        email: true,
                    },
                },
            },
        });

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found.',
            });
        }

        if (Number(quotation.rfq.buyerId) !== Number(buyerId)) {
            return res.status(403).json({
                success: false,
                message:
                    'Forbidden. You do not own the RFQ for this quotation.',
            });
        }

        let rfqUpdateData = null;

        if (status === 'ACCEPTED') {
            rfqUpdateData = {
                status: 'AWARDED',
            };
        }

        if (
            status === 'REJECTED' &&
            quotation.status === 'ACCEPTED'
        ) {
            const otherAccepted = await prisma.quotation.findFirst({
                where: {
                    rfqId: quotation.rfqId,
                    id: {
                        not: id,
                    },
                    status: 'ACCEPTED',
                },
            });

            if (!otherAccepted) {
                rfqUpdateData = {
                    status: 'OPEN',
                };
            }
        }

        const transactionResult = await prisma.$transaction(
            async (tx) => {
                const updatedQuotation = await tx.quotation.update({
                    where: {
                        id,
                    },
                    data: {
                        status,
                    },
                    include: {
                        supplier: {
                            select: {
                                id: true,
                                name: true,
                                companyName: true,
                                email: true,
                                phone: true,
                            },
                        },
                        rfq: {
                            select: {
                                id: true,
                                title: true,
                                buyerId: true,
                                status: true,
                            },
                        },
                    },
                });

                let updatedRfq = quotation.rfq;

                if (rfqUpdateData) {
                    updatedRfq = await tx.rFQ.update({
                        where: {
                            id: quotation.rfqId,
                        },
                        data: rfqUpdateData,
                    });
                }

                return {
                    updatedQuotation,
                    updatedRfq,
                };
            }
        );

        const {
            updatedQuotation,
            updatedRfq,
        } = transactionResult;

        sendToUser(
            updatedQuotation.supplierId,
            'quotation_status_updated',
            {
                message:
                    status === 'ACCEPTED'
                        ? `Your quotation for "${updatedRfq.title}" was accepted!`
                        : `Your quotation for "${updatedRfq.title}" was rejected.`,
                quotationId: updatedQuotation.id,
                rfqId: updatedQuotation.rfqId,
                status: updatedQuotation.status,
                rfqStatus: updatedRfq.status,
                quotation: updatedQuotation,
                rfq: updatedRfq,
            }
        );

        return res.status(200).json({
            success: true,
            message: `Quotation ${status.toLowerCase()} successfully.`,
            data: {
                quotation: updatedQuotation,
                rfq: updatedRfq,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getSupplierQuotations = async (req, res, next) => {
    try {
        const supplierId = req.user.id;

        const quotations = await prisma.quotation.findMany({
            where: {
                supplierId,
            },
            include: {
                rfq: {
                    include: {
                        buyer: {
                            select: {
                                id: true,
                                companyName: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.status(200).json({
            success: true,
            data: {
                quotations,
            },
        });
    } catch (error) {
        next(error);
    }
};