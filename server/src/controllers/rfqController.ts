import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { broadcastRole, broadcastAll } from '../sockets';
import { RFQStatus, Prisma } from '@prisma/client';

export const getAllRfqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, status, sortBy = 'createdAt', order = 'desc', page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.RFQWhereInput = {};

    // Filter by status (default to OPEN if not explicitly searching all)
    if (status && status !== 'ALL') {
      where.status = status as RFQStatus;
    }

    // Filter by category
    if (category && category !== 'ALL') {
      where.category = category as string;
    }

    // Search query in title, description, or deliveryLocation
    if (search && (search as string).trim() !== '') {
      const q = (search as string).trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { deliveryLocation: { contains: q } },
      ];
    }

    const [total, rfqs] = await Promise.all([
      prisma.rFQ.count({ where }),
      prisma.rFQ.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy as string]: order === 'asc' ? 'asc' : 'desc',
        },
        include: {
          buyer: {
            select: {
              id: true,
              companyName: true,
              name: true,
            },
          },
          _count: {
            select: { quotations: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        rfqs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRfqById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
      return;
    }

    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    if (!rfq) {
      res.status(404).json({ success: false, message: 'RFQ not found.' });
      return;
    }

    let quotations: any[] = [];
    let myQuotation: any = null;

    // If viewer is the buyer owner of this RFQ, provide all received quotations
    if (currentUserId && rfq.buyerId === currentUserId) {
      quotations = await prisma.quotation.findMany({
        where: { rfqId: id },
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
        orderBy: { price: 'asc' }, // default rank by best price
      });
    } else if (currentUserId && currentUserRole === 'SUPPLIER') {
      // If viewer is a supplier, check if they already submitted a quote for this RFQ
      myQuotation = await prisma.quotation.findUnique({
        where: {
          rfqId_supplierId: {
            rfqId: id,
            supplierId: currentUserId,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        rfq,
        quotations,
        myQuotation,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createRfq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const buyerId = req.user!.id;
    const { title, description, category, quantity, unit, deliveryLocation, deadline, targetBudget } = req.body;

    const newRfq = await prisma.rFQ.create({
      data: {
        title,
        description,
        category,
        quantity,
        unit,
        deliveryLocation,
        deadline: new Date(deadline),
        targetBudget: targetBudget ? parseFloat(targetBudget) : null,
        status: RFQStatus.OPEN,
        buyerId,
      },
      include: {
        buyer: {
          select: {
            id: true,
            companyName: true,
            name: true,
          },
        },
      },
    });

    // Real-time broadcast to all connected suppliers
    broadcastRole('SUPPLIER', 'rfq_created', {
      message: `New RFQ posted: "${newRfq.title}" in ${newRfq.category}`,
      rfq: newRfq,
    });

    res.status(201).json({
      success: true,
      message: 'RFQ created successfully.',
      data: { rfq: newRfq },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRfq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const buyerId = req.user!.id;

    const rfq = await prisma.rFQ.findUnique({ where: { id } });
    if (!rfq) {
      res.status(404).json({ success: false, message: 'RFQ not found.' });
      return;
    }

    if (rfq.buyerId !== buyerId) {
      res.status(403).json({ success: false, message: 'Forbidden. You do not own this RFQ.' });
      return;
    }

    const { title, description, category, quantity, unit, deliveryLocation, deadline, targetBudget, status } = req.body;

    const updatedRfq = await prisma.rFQ.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(quantity && { quantity }),
        ...(unit && { unit }),
        ...(deliveryLocation && { deliveryLocation }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(targetBudget !== undefined && { targetBudget: targetBudget ? parseFloat(targetBudget) : null }),
        ...(status && { status }),
      },
    });

    broadcastAll('rfq_updated', updatedRfq);

    res.status(200).json({
      success: true,
      message: 'RFQ updated successfully.',
      data: { rfq: updatedRfq },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRfq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const buyerId = req.user!.id;

    const rfq = await prisma.rFQ.findUnique({ where: { id } });
    if (!rfq) {
      res.status(404).json({ success: false, message: 'RFQ not found.' });
      return;
    }

    if (rfq.buyerId !== buyerId) {
      res.status(403).json({ success: false, message: 'Forbidden. You do not own this RFQ.' });
      return;
    }

    await prisma.rFQ.delete({ where: { id } });

    broadcastAll('rfq_deleted', { id });

    res.status(200).json({
      success: true,
      message: 'RFQ deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getBuyerRfqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const buyerId = req.user!.id;

    const rfqs = await prisma.rFQ.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { quotations: true },
        },
        quotations: {
          select: {
            id: true,
            price: true,
            status: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { rfqs },
    });
  } catch (error) {
    next(error);
  }
};
