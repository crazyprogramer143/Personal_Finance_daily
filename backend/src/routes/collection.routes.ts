import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import collectionController from '../controllers/collection.controller';

const router = express.Router();

// Due schedules and customer lookups
router.get('/due-schedules', validateToken, requireRole('collector'), collectionController.getDueSchedules);
router.get('/customer/:customerId/due-loans', validateToken, requireRole('collector'), collectionController.getCustomerDueLoans);
router.get('/assignments', validateToken, requireRole('collector'), collectionController.getCollectorAssignments);

// Collection statistics and performance
router.get('/stats', validateToken, requireRole('collector'), collectionController.getCollectionStats);
router.get('/performance', validateToken, requireRole('collector'), collectionController.getCollectorPerformance);
router.get('/overdue-stats', validateToken, requireRole('accountant'), collectionController.getOverdueStats);

// Installment management
router.post('/schedules/:scheduleId/waiver', validateToken, requireRole('accountant'), collectionController.waiverInstallment);
router.post('/schedules/:scheduleId/grace-period', validateToken, requireRole('accountant'), collectionController.applyGracePeriod);

export default router;
