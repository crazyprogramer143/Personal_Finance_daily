import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import paymentController from '../controllers/payment.controller';

const router = express.Router();

router.post('/', validateToken, requireRole('collector'), paymentController.recordPayment);
router.post('/:paymentId/reverse', validateToken, requireRole('accountant'), paymentController.reversePayment);
router.get('/:paymentId', validateToken, paymentController.getPaymentDetails);
router.get('/loan/:loanId', validateToken, paymentController.getLoanPayments);
router.get('/collector/payments', validateToken, requireRole('collector'), paymentController.getCollectorPayments);

export default router;
