import prisma from '../lib/prisma.js';
import { broadcastRole, broadcastAll } from '../sockets/index.js';

export const getAllRfqs = async (req, res, next) => {
  try {
    const { search, category, status, sortBy = 'createdAt', order = 'desc', page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
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
          [sortBy]: order === 'asc' ? 'asc' : 'desc',
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

export const getRfqById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
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
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    let quotations = [];
    let myQuotation = null;

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
        orderBy: { price: 'asc' },
      });
    } else if (currentUserId && currentUserRole === 'SUPPLIER') {
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

export const createRfq = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { title, description, category, quantity, unit, deliveryLocation, deadline, targetBudget } = req.body;

    const newRfq = await prisma.rFQ.create({
      data: {
        title,
        description,
        category,
        quantity: parseInt(quantity, 10),
        unit,
        deliveryLocation,
        deadline: new Date(deadline),
        targetBudget: targetBudget ? parseFloat(targetBudget) : null,
        status: 'OPEN',
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

export const updateRfq = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const buyerId = req.user.id;

    const rfq = await prisma.rFQ.findUnique({ where: { id } });
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    if (rfq.buyerId !== buyerId) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this RFQ.' });
    }

    const { title, description, category, quantity, unit, deliveryLocation, deadline, targetBudget, status } = req.body;

    const updatedRfq = await prisma.rFQ.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(quantity && { quantity: parseInt(quantity, 10) }),
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

export const deleteRfq = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const buyerId = req.user.id;

    const rfq = await prisma.rFQ.findUnique({ where: { id } });
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    if (rfq.buyerId !== buyerId) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this RFQ.' });
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

export const getBuyerRfqs = async (req, res, next) => {
  try {
    const buyerId = req.user.id;

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