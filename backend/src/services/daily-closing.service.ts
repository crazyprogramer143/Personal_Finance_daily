import DailyClosing from '../models/DailyClosing';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import { sequelize } from '../database/connection';

interface CreateClosingRequest {
  closingDate: Date;
  notes?: string;
}

export class DailyClosingService {
  async createDailyClosing(
    companyId: string,
    userId: string,
    data: CreateClosingRequest
  ): Promise<DailyClosing> {
    const closingDate = new Date(data.closingDate);
    closingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(closingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const payments = await Payment.findAll({
      where: {
        paymentDate: {
          $gte: closingDate,
          $lt: nextDay,
        },
        status: 'completed',
      },
    });

    const expenses = await Expense.findAll({
      where: {
        companyId,
        expenseDate: {
          $gte: closingDate,
          $lt: nextDay,
        },
        status: 'approved',
      },
    });

    const cashPayments = payments
      .filter((p) => p.paymentMethod === 'cash')
      .reduce((sum, p) => sum + Number(p.amountReceived), 0);

    const upiPayments = payments
      .filter((p) => p.paymentMethod === 'upi')
      .reduce((sum, p) => sum + Number(p.amountReceived), 0);

    const bankPayments = payments
      .filter((p) => p.paymentMethod === 'bank_transfer')
      .reduce((sum, p) => sum + Number(p.amountReceived), 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalReceived = cashPayments + upiPayments + bankPayments;
    const netAmount = totalReceived - totalExpenses;

    return DailyClosing.create({
      companyId,
      closedBy: userId,
      closingDate,
      totalCashReceived: cashPayments,
      totalUpiReceived: upiPayments,
      totalBankTransfer: bankPayments,
      totalExpenses,
      netAmount,
      notes: data.notes,
      status: 'draft',
    });
  }

  async submitClosing(closingId: string): Promise<DailyClosing> {
    const closing = await DailyClosing.findByPk(closingId);
    if (!closing) {
      throw new Error('Daily closing not found');
    }

    if (closing.status !== 'draft') {
      throw new Error('Only draft closings can be submitted');
    }

    await closing.update({ status: 'submitted' });
    return closing;
  }

  async approveClosing(closingId: string, approvedBy: string): Promise<DailyClosing> {
    return sequelize.transaction(async () => {
      const closing = await DailyClosing.findByPk(closingId);
      if (!closing) {
        throw new Error('Daily closing not found');
      }

      if (closing.status !== 'submitted') {
        throw new Error('Only submitted closings can be approved');
      }

      await closing.update({
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
      });

      return closing;
    });
  }

  async rejectClosing(closingId: string): Promise<DailyClosing> {
    const closing = await DailyClosing.findByPk(closingId);
    if (!closing) {
      throw new Error('Daily closing not found');
    }

    if (closing.status !== 'submitted') {
      throw new Error('Only submitted closings can be rejected');
    }

    await closing.update({ status: 'rejected' });
    return closing;
  }

  async getCompanyClosings(companyId: string, limit: number = 100): Promise<DailyClosing[]> {
    return DailyClosing.findAll({
      where: { companyId },
      order: [['closingDate', 'DESC']],
      limit,
    });
  }

  async getClosingDetails(closingId: string): Promise<any> {
    const closing = await DailyClosing.findByPk(closingId);
    if (!closing) {
      throw new Error('Daily closing not found');
    }

    const closingDate = new Date(closing.closingDate);
    closingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(closingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const payments = await Payment.findAll({
      where: {
        paymentDate: {
          $gte: closingDate,
          $lt: nextDay,
        },
        status: 'completed',
      },
    });

    const expenses = await Expense.findAll({
      where: {
        companyId: closing.companyId,
        expenseDate: {
          $gte: closingDate,
          $lt: nextDay,
        },
        status: 'approved',
      },
    });

    return {
      closing: closing.toJSON(),
      payments,
      expenses,
      summary: {
        totalPayments: payments.length,
        totalExpenses: expenses.length,
        paymentsByMethod: {
          cash: payments.filter((p) => p.paymentMethod === 'cash').length,
          upi: payments.filter((p) => p.paymentMethod === 'upi').length,
          bank_transfer: payments.filter((p) => p.paymentMethod === 'bank_transfer').length,
        },
      },
    };
  }
}

export default new DailyClosingService();
