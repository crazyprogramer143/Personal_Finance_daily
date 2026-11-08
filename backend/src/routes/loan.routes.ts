import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import loanController from '../controllers/loan.controller';

const router = express.Router();

router.get('/', validateToken, loanController.getLoans);
router.post('/', validateToken, loanController.createLoan);
router.put('/:loanId', validateToken, requireRole('accountant'), loanController.updateLoan);
router.post('/:loanId/approve', validateToken, requireRole('accountant'), loanController.approveLoan);
router.post('/:loanId/disburse', validateToken, requireRole('accountant'), loanController.disburseLoan);
router.post('/:loanId/close', validateToken, requireRole('accountant'), loanController.closeLoan);
router.get('/:loanId', validateToken, loanController.getLoanDetails);
router.get('/customer/:customerId', validateToken, loanController.getCustomerLoans);

export default router;
