import { Request, Response } from 'express';
import expenseService from '../services/expense.service';
import accountService from '../services/account.service';
import auditService from '../services/audit.service';

export class ExpenseController {
  async createExpense(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;
      const { category, amount, description, expenseDate } = _req.body;

      const expense = await expenseService.createExpense(companyId, userId, {
        category,
        amount,
        description,
        expenseDate: new Date(expenseDate),
      });

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'Expense',
        expense.id,
        { category, amount }
      );

      res.status(201).json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyExpenses(_req: Request, res: Response): Promise<any> {
    try {
      const userId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;
      const expenses = await expenseService.getUserExpenses(userId, companyId);
      res.json(expenses);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCompanyExpenses(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const fromDate = _req.query.fromDate ? new Date(_req.query.fromDate as string) : undefined;
      const toDate = _req.query.toDate ? new Date(_req.query.toDate as string) : undefined;
      const status = _req.query.status as string | undefined;

      const expenses = await expenseService.getCompanyExpenses(
        companyId,
        fromDate,
        toDate,
        status
      );
      res.json(expenses);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approveExpense(_req: Request, res: Response): Promise<any> {
    try {
      const { expenseId } = _req.params;
      const userId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;
      const { accountId } = _req.body;

      const expense = await expenseService.approveExpense(expenseId, userId);

      if (accountId) {
        await accountService.recordTransaction({
          companyId,
          accountId,
          transactionDate: new Date(expense.expenseDate),
          type: 'debit',
          amount: Number(expense.amount),
          description: `Expense: ${expense.category} - ${expense.description}`,
          referenceType: 'expense',
          referenceId: expense.id,
        });
      }

      await auditService.logAction(companyId, userId, 'UPDATE', 'Expense', expenseId, {
        status: 'approved',
        accountId,
      });

      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async rejectExpense(_req: Request, res: Response): Promise<any> {
    try {
      const { expenseId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;

      const expense = await expenseService.rejectExpense(expenseId);

      await auditService.logAction(companyId, userId, 'UPDATE', 'Expense', expenseId, {
        status: 'rejected',
      });

      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getExpenseStats(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const fromDate = _req.query.fromDate ? new Date(_req.query.fromDate as string) : undefined;
      const toDate = _req.query.toDate ? new Date(_req.query.toDate as string) : undefined;

      const stats = await expenseService.getExpenseStats(companyId, fromDate, toDate);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPendingExpensesCount(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const count = await expenseService.getPendingExpensesCount(companyId);
      res.json({ pendingCount: count });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new ExpenseController();
