import { Router } from 'express';
import { getAllRfqs, getRfqById, createRfq, updateRfq, deleteRfq, getBuyerRfqs } from '../controllers/rfqController.js';
import { submitQuotation } from '../controllers/quotationController.js';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth.js';
import { validate, rfqSchema, quotationSchema } from '../validators/index.js';

const router = Router();
// Public routes (optionalAuth so logged-in users get role-specific data)
router.get('/', optionalAuth, getAllRfqs);
router.get('/buyer/my-rfqs', authenticateToken, requireRole(['BUYER']), getBuyerRfqs);
router.get('/:id', optionalAuth, getRfqById); // Buyers see quotations, suppliers see their quote
// Protected routes
router.post('/', authenticateToken, requireRole(['BUYER']), validate(rfqSchema), createRfq);
router.put('/:id', authenticateToken, requireRole(['BUYER']), updateRfq);
router.delete('/:id', authenticateToken, requireRole(['BUYER']), deleteRfq);
router.post('/:rfqId/quotations', authenticateToken, requireRole(['SUPPLIER']), validate(quotationSchema), submitQuotation);
export default router;
