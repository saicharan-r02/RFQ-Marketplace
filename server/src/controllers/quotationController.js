import prisma from '../lib/prisma.js';
import { sendToUser } from '../sockets/index.js';

// POST /api/rfqs/:rfqId/quotations (Supplier only)
export const submitQuotation = async (req, res, next) => {
    try {
        const rfqId = parseInt(req.params.rfqId, 10);
        const supplierId = req.user.id;
        const { price, deliveryDays, validUntil, notes } = req.body;

        if (isNaN(rfqId)) {
            return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
        }

        // Check if RFQ exists and is open
        const rfq = await prisma.rFQ.findUnique({
            where: { id: rfqId },
            include: { buyer: true },
        });

        if (!rfq) {
            return res.status(404).json({ success: false, message: 'RFQ not found.' });
        }

        if (rfq.status !== 'OPEN') {
            return res.status(400).json({
                success: false,
                message: `Cannot submit quote. This RFQ is ${rfq.status.toLowerCase()}.`,
            });
        }

        // Check if RFQ deadline has passed
        if (new Date() > new Date(rfq.deadline)) {
            return res.status(400).json({
                success: false,
                message: 'The deadline for submitting quotations on this RFQ has expired.',
            });
        }

        // Prevent buyers from quoting on their own RFQs
        if (rfq.buyerId === supplierId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot submit a quote for your own RFQ.',
            });
        }

        // Upsert quotation: Create or update existing quote
        const quotation = await prisma.quotation.upsert({
            where: {
                rfqId_supplierId: {
                    rfqId,
                    supplierId,
                },
            },
            update: {
                price,
                deliveryDays,
                validUntil: validUntil ? new Date(validUntil) : null,
                notes,
                status: 'PENDING',
            },
            create: {
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
            },
        });

        // Real-time notification: Send live alert directly to the buyer
        sendToUser(rfq.buyerId, 'new_quotation', {
            message: `New quotation of $${price} received for "${rfq.title}" from ${req.user.companyName}`,
            rfqId,
            quotation,
        });

        res.status(201).json({
            success: true,
            message: 'Quotation submitted successfully.',
            data: { quotation },
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/quotations/:id/status (Buyer only: Accept or Reject)
export const updateQuotationStatus = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const buyerId = req.user.id;
        const { status } = req.body; // 'ACCEPTED' or 'REJECTED'

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
            },
        });

        if (!quotation) {
            return res.status(404).json({ success: false, message: 'Quotation not found.' });
        }

        // Ensure the buyer owns the RFQ being quoted
        if (quotation.rfq.buyerId !== buyerId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You do not own the RFQ for this quotation.',
            });
        }

        // If accepted, update the quotation and mark RFQ as AWARDED
        const [updatedQuotation] = await prisma.$transaction([
            prisma.quotation.update({
                where: { id },
                data: { status },
            }),
            ...(status === 'ACCEPTED'
                ? [
                    prisma.rFQ.update({
                        where: { id: quotation.rfqId },
                        data: { status: 'AWARDED' },
                    }),
                ]
                : []),
        ]);

        // Real-time notification: Alert the supplier that their quote was accepted/rejected
        sendToUser(quotation.supplierId, 'quotation_status_updated', {
            message: `Your quotation for "${quotation.rfq.title}" was ${status.toLowerCase()}!`,
            quotationId: id,
            rfqId: quotation.rfqId,
            status,
        });

        res.status(200).json({
            success: true,
            message: `Quotation ${status.toLowerCase()} successfully.`,
            data: { quotation: updatedQuotation },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/supplier/quotations (Supplier only: View all my quotes)
export const getSupplierQuotations = async (req, res, next) => {
    try {
        const supplierId = req.user.id;

        const quotations = await prisma.quotation.findMany({
            where: { supplierId },
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
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: { quotations },
        });
    } catch (error) {
        next(error);
    }
};
