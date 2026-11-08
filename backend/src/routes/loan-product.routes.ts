import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import loanProductController from '../controllers/loan-product.controller';

const router = express.Router();

router.post('/', validateToken, requireRole('accountant'), loanProductController.createLoanProduct);
router.get('/', validateToken, loanProductController.getLoanProducts);
router.get('/:productId', validateToken, loanProductController.getLoanProductDetails);
router.put('/:productId', validateToken, requireRole('accountant'), loanProductController.updateLoanProduct);
router.post('/:productId/deactivate', validateToken, requireRole('accountant'), loanProductController.deactivateLoanProduct);

export default router;
