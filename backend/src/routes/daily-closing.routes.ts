import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import dailyClosingController from '../controllers/daily-closing.controller';

const router = express.Router();

router.post('/', validateToken, requireRole('accountant'), dailyClosingController.createDailyClosing);
router.post('/:closingId/submit', validateToken, requireRole('accountant'), dailyClosingController.submitClosing);
router.post('/:closingId/approve', validateToken, requireRole('accountant'), dailyClosingController.approveClosing);
router.post('/:closingId/reject', validateToken, requireRole('accountant'), dailyClosingController.rejectClosing);
router.get('/', validateToken, requireRole('accountant'), dailyClosingController.getCompanyClosings);
router.get('/:closingId', validateToken, requireRole('accountant'), dailyClosingController.getClosingDetails);

export default router;
