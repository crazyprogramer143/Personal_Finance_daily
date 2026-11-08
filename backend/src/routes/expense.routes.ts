import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import expenseController from '../controllers/expense.controller';

const router = express.Router();

router.post('/', validateToken, expenseController.createExpense);
router.get('/', validateToken, requireRole('accountant'), expenseController.getCompanyExpenses);
router.post('/:expenseId/approve', validateToken, requireRole('accountant'), expenseController.approveExpense);
router.post('/:expenseId/reject', validateToken, requireRole('accountant'), expenseController.rejectExpense);
router.get('/stats', validateToken, requireRole('accountant'), expenseController.getExpenseStats);
router.get('/pending/count', validateToken, requireRole('accountant'), expenseController.getPendingExpensesCount);

export default router;
