import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import collectionController from '../controllers/collection.controller';

const router = express.Router();

// Due schedules and customer lookups
router.get('/due-schedules', validateToken, collectionController.getDueSchedules);
router.get('/customer/:customerId/due-loans', validateToken, collectionController.getCustomerDueLoans);
router.get('/assignments', validateToken, requireRole('collector'), collectionController.getCollectorAssignments);

// Collection statistics and performance
router.get('/stats', validateToken, collectionController.getCollectionStats);
router.get('/performance', validateToken, collectionController.getCollectorPerformance);
router.get('/overdue-stats', validateToken, collectionController.getOverdueStats);

// Installment management
router.post('/schedules/:scheduleId/waiver', validateToken, requireRole('accountant'), collectionController.waiverInstallment);
router.post('/schedules/:scheduleId/grace-period', validateToken, requireRole('accountant'), collectionController.applyGracePeriod);

export default router;
