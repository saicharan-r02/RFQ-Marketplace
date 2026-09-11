import { Router } from 'express';
import { updateQuotationStatus, getSupplierQuotations } from '../controllers/quotationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
const router = Router();
router.get('/my-quotes', authenticateToken, requireRole(['SUPPLIER']), getSupplierQuotations);
router.patch('/:id/status', authenticateToken, requireRole(['BUYER']), updateQuotationStatus);
export default router;