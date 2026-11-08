import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import reportController from '../controllers/report.controller';

const router = express.Router();

router.get(
  '/collection-performance',
  validateToken,
  requireRole('accountant'),
  reportController.getCollectionPerformanceReport
);
router.get(
  '/collector-comparison',
  validateToken,
  requireRole('accountant'),
  reportController.getCollectorComparisonReport
);
router.get(
  '/customer-history/:customerId',
  validateToken,
  reportController.getCustomerCollectionHistoryReport
);
router.get(
  '/loan-portfolio',
  validateToken,
  requireRole('accountant'),
  reportController.getLoanPortfolioReport
);
router.get(
  '/overdue-analysis',
  validateToken,
  requireRole('accountant'),
  reportController.getOverdueAnalysisReport
);

export default router;
