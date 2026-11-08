import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import accountController from '../controllers/account.controller';

const router = express.Router();

router.post('/', validateToken, requireRole('accountant'), accountController.createAccount);
router.get('/', validateToken, accountController.getCompanyAccounts);
router.get('/:accountId', validateToken, accountController.getAccountDetails);
router.post('/:accountId/transactions', validateToken, requireRole('accountant'), accountController.recordTransaction);
router.post('/:accountId/hold', validateToken, requireRole('accountant'), accountController.holdAmount);
router.post('/:accountId/release', validateToken, requireRole('accountant'), accountController.releaseHeldAmount);
router.get('/:accountId/ledger', validateToken, accountController.getAccountLedger);
router.get('/company/ledger', validateToken, requireRole('accountant'), accountController.getCompanyLedger);
router.put('/:accountId/status', validateToken, requireRole('accountant'), accountController.updateAccountStatus);

export default router;
