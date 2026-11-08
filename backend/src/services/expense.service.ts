import { Op } from 'sequelize';
import Expense from '../models/Expense';
import { sequelize } from '../database/connection';

interface CreateExpenseRequest {
  category: string;
  amount: number;
  description: string;
  expenseDate: Date;
}

export class ExpenseService {
  async createExpense(
    companyId: string,
    userId: string,
    data: CreateExpenseRequest
  ): Promise<Expense> {
    return Expense.create({
      companyId,
      userId,
      category: data.category,
      amount: data.amount,
      description: data.description,
      expenseDate: data.expenseDate,
      status: 'pending',
    });
  }

  async getCompanyExpenses(
    companyId: string,
    fromDate?: Date,
    toDate?: Date,
    status?: string
  ): Promise<Expense[]> {
    const where: any = { companyId };

    if (fromDate || toDate) {
      where.expenseDate = {};
      if (fromDate) where.expenseDate[Op.gte] = fromDate;
      if (toDate) where.expenseDate[Op.lte] = toDate;
    }

    if (status) {
      where.status = status;
    }

    return Expense.findAll({
      where,
      include: [{ model: (await import('../models/User')).default, attributes: ['id', 'username'] }],
      order: [['expenseDate', 'DESC']],
    });
  }

  async getUserExpenses(userId: string, companyId: string): Promise<Expense[]> {
    return Expense.findAll({
      where: { userId, companyId },
      order: [['expenseDate', 'DESC']],
    });
  }

  async approveExpense(expenseId: string, approvedBy: string): Promise<Expense> {
    return sequelize.transaction(async () => {
      const expense = await Expense.findByPk(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.status !== 'pending') {
        throw new Error('Only pending expenses can be approved');
      }

      await expense.update({
        status: 'approved',
        approvedBy: approvedBy as any,
      });

      return expense;
    });
  }

  async rejectExpense(expenseId: string): Promise<Expense> {
    const expense = await Expense.findByPk(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }

    if (expense.status !== 'pending') {
      throw new Error('Only pending expenses can be rejected');
    }

    await expense.update({ status: 'rejected' });
    return expense;
  }

  async getExpenseStats(companyId: string, fromDate?: Date, toDate?: Date): Promise<any> {
    const where: any = { companyId, status: 'approved' };

    if (fromDate || toDate) {
      where.expenseDate = {};
      if (fromDate) where.expenseDate[Op.gte] = fromDate;
      if (toDate) where.expenseDate[Op.lte] = toDate;
    }

    const expenses = await Expense.findAll({ where });

    const byCategory = new Map<string, number>();
    let totalExpenses = 0;

    expenses.forEach((expense) => {
      totalExpenses += Number(expense.amount);
      byCategory.set(
        expense.category,
        (byCategory.get(expense.category) || 0) + Number(expense.amount)
      );
    });

    return {
      totalExpenses,
      expenseCount: expenses.length,
      byCategory: Object.fromEntries(byCategory),
      averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
    };
  }

  async getPendingExpensesCount(companyId: string): Promise<number> {
    return Expense.count({ where: { companyId, status: 'pending' } });
  }
}

export default new ExpenseService();
