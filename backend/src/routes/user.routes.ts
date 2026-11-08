import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import userController from '../controllers/user.controller';

const router = express.Router();

router.post('/collectors', validateToken, requireRole('accountant'), userController.createCollector);
router.get('/collectors', validateToken, requireRole('accountant'), userController.getCollectors);
router.delete('/collectors/:collectorId', validateToken, requireRole('accountant'), userController.deleteCollector);
router.get('/me/assigned-customers', validateToken, userController.getMyAssignedCustomers);

export default router;
