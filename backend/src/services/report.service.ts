import { Op } from 'sequelize';
import Payment from '../models/Payment';
import Loan from '../models/Loan';
import Customer from '../models/Customer';
import User from '../models/User';
import LoanSchedule from '../models/LoanSchedule';
import Disbursement from '../models/Disbursement';
import Expense from '../models/Expense';

export class ReportService {
  async getCollectionPerformanceReport(
    companyId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any> {
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.gte]: fromDate,
          [Op.lte]: endOfDay,
        },
        status: 'completed',
      },
      include: [
        {
          model: Loan,
          where: { companyId },
          include: [{ model: Customer }],
        },
        { model: User },
      ],
    });

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amountReceived), 0);
    const collectionCount = payments.length;
    const paymentMethods = {
      cash: payments.filter((p) => p.paymentMethod === 'cash').length,
      upi: payments.filter((p) => p.paymentMethod === 'upi').length,
      bank_transfer: payments.filter((p) => p.paymentMethod === 'bank_transfer').length,
    };

    return {
      fromDate,
      toDate,
      totalCollected,
      collectionCount,
      averagePerCollection: collectionCount > 0 ? totalCollected / collectionCount : 0,
      paymentMethods,
      paymentsByDate: this.groupByDateDetailed(payments),
    };
  }

  async getCollectorComparisonReport(
    companyId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any> {
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.gte]: fromDate,
          [Op.lte]: endOfDay,
        },
        status: 'completed',
      },
      include: [
        {
          model: Loan,
          where: { companyId },
        },
        { model: User },
      ],
    });

    const collectorStats = new Map<string, any>();

    payments.forEach((payment: any) => {
      const collectorId = payment.collectorId || 'unassigned';
      const collectorName = payment.User?.username || 'Unassigned';

      if (!collectorStats.has(collectorId)) {
        collectorStats.set(collectorId, {
          collectorId,
          collectorName,
          totalCollected: 0,
          collectionCount: 0,
          averagePerCollection: 0,
        });
      }

      const stats = collectorStats.get(collectorId);
      stats.totalCollected += Number(payment.amountReceived);
      stats.collectionCount += 1;
      stats.averagePerCollection = stats.totalCollected / stats.collectionCount;
    });

    return Array.from(collectorStats.values()).sort((a, b) => b.totalCollected - a.totalCollected);
  }

  async getCustomerCollectionHistoryReport(customerId: string): Promise<any> {
    const loans = await Loan.findAll({
      where: { customerId },
    });

    const payments = await Payment.findAll({
      where: {
        loanId: loans.map((l) => l.id),
        status: 'completed',
      },
      include: [{ model: User }],
      order: [['paymentDate', 'DESC']],
    });

    const history = payments.map((payment: any) => ({
      loanId: payment.loanId,
      paymentDate: payment.paymentDate,
      amountReceived: payment.amountReceived,
      paymentMethod: payment.paymentMethod,
      collectorName: payment.User?.username || 'N/A',
      status: payment.status,
    }));

    const customer = loans[0] ? await Customer.findByPk(loans[0].customerId) : null;

    return {
      customerId,
      customerName: customer?.name,
      totalLoans: loans.length,
      totalPayments: history.length,
      totalPaid: history.reduce((sum: number, h: any) => sum + Number(h.amountReceived), 0),
      payments: history,
    };
  }

  async getLoanPortfolioReport(companyId: string): Promise<any> {
    const loans = await Loan.findAll({
      where: { companyId },
    });

    const schedules = await LoanSchedule.findAll({
      where: {
        loanId: loans.map((l) => l.id),
      },
    });

    const stats = {
      totalLoans: loans.length,
      activeLoans: loans.filter((l) => l.status === 'active').length,
      closedLoans: loans.filter((l) => l.status === 'closed').length,
      totalPrincipal: 0,
      totalDisbursed: 0,
      totalOutstanding: 0,
      loansByStatus: {
        draft: 0,
        approved: 0,
        active: 0,
        closed: 0,
      },
    };

    loans.forEach((loan) => {
      stats.totalPrincipal += Number(loan.principalAmount);
      stats.totalDisbursed += Number(loan.principalAmount) - Number(loan.heldAmount);
      stats.loansByStatus[loan.status as keyof typeof stats.loansByStatus] += 1;
    });

    schedules.forEach((schedule) => {
      stats.totalOutstanding += Number(schedule.remainingDue);
    });

    return stats;
  }

  async getOverdueAnalysisReport(companyId: string): Promise<any> {
    const overdueSchedules = await LoanSchedule.findAll({
      where: {
        status: ['overdue', 'partially_paid'],
      },
      include: [
        {
          model: Loan,
          where: { companyId, status: 'active' },
          include: [{ model: Customer }],
        },
      ],
    });

    const totalOverdue = overdueSchedules.reduce((sum, s) => sum + Number(s.remainingDue), 0);
    const overdueByDays = new Map<string, number>();

    overdueSchedules.forEach((schedule) => {
      const today = new Date();
      const dueDate = new Date(schedule.dueDate);
      const daysOverdue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let bucket = '0-7';
      if (daysOverdue > 30) bucket = '30+';
      else if (daysOverdue > 14) bucket = '14-30';
      else if (daysOverdue > 7) bucket = '7-14';

      overdueByDays.set(bucket, (overdueByDays.get(bucket) || 0) + Number(schedule.remainingDue));
    });

    return {
      totalOverdueAmount: totalOverdue,
      totalOverdueCount: overdueSchedules.length,
      overdueByDays: Object.fromEntries(overdueByDays),
      overdueSchedules: overdueSchedules.slice(0, 100),
    };
  }

  async getDayBookReport(
    companyId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any> {
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dateFilter = { [Op.gte]: fromDate, [Op.lte]: endOfDay };

    const [collections, disbursements, expenses] = await Promise.all([
      Payment.findAll({
        where: { paymentDate: dateFilter, status: 'completed' },
        include: [
          { model: Loan, where: { companyId }, include: [{ model: Customer }] },
          { model: User },
        ],
        order: [['paymentDate', 'DESC']],
      }),
      Disbursement.findAll({
        where: { disbursementDate: dateFilter, status: 'completed' },
        include: [
          { model: Loan, where: { companyId }, include: [{ model: Customer }] },
        ],
        order: [['disbursementDate', 'DESC']],
      }),
      Expense.findAll({
        where: { companyId, expenseDate: dateFilter, status: 'approved' },
        include: [{ model: User }],
        order: [['expenseDate', 'DESC']],
      }),
    ]);

    const totalCollections = collections.reduce((sum, p) => sum + Number(p.amountReceived), 0);
    const totalDisbursements = disbursements.reduce((sum, d: any) => sum + Number(d.disbursedAmount), 0);
    const totalExpenses = expenses.reduce((sum, e: any) => sum + Number(e.amount), 0);

    const collectionsByMethod = {
      cash: { count: 0, amount: 0 },
      upi: { count: 0, amount: 0 },
      bank_transfer: { count: 0, amount: 0 },
    };
    collections.forEach((p) => {
      const method = p.paymentMethod as keyof typeof collectionsByMethod;
      if (collectionsByMethod[method]) {
        collectionsByMethod[method].count += 1;
        collectionsByMethod[method].amount += Number(p.amountReceived);
      }
    });

    return {
      summary: {
        totalCollections,
        totalDisbursements,
        totalExpenses,
        netCashFlow: totalCollections - totalDisbursements - totalExpenses,
        collectionsCount: collections.length,
        disbursementsCount: disbursements.length,
        expensesCount: expenses.length,
        collectionsByMethod,
      },
      collections: collections.map((p: any) => ({
        id: p.id,
        paymentDate: p.paymentDate,
        amountReceived: p.amountReceived,
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber,
        loanCode: p.Loan?.loanCode,
        customerName: p.Loan?.Customer?.name,
        customerCode: p.Loan?.Customer?.code,
        collectorName: p.User?.username,
      })),
      disbursements: disbursements.map((d: any) => ({
        id: d.id,
        disbursementDate: d.disbursementDate,
        principalAmount: d.principalAmount,
        heldAmount: d.heldAmount,
        disbursedAmount: d.disbursedAmount,
        disbursementMethod: d.disbursementMethod,
        loanCode: d.Loan?.loanCode,
        customerName: d.Loan?.Customer?.name,
        customerCode: d.Loan?.Customer?.code,
      })),
      expenses: expenses.map((e: any) => ({
        id: e.id,
        expenseDate: e.expenseDate,
        category: e.category,
        description: e.description,
        amount: e.amount,
        createdBy: e.User?.username,
      })),
    };
  }

  private groupByDateDetailed(payments: Payment[]): any {
    const grouped = new Map<string, { total: number; byMethod: Record<string, { count: number; amount: number }>; byCollector: Record<string, { name: string; count: number; amount: number }>; payments: any[] }>();

    payments.forEach((payment: any) => {
      const date = new Date(payment.paymentDate).toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, {
          total: 0,
          byMethod: { cash: { count: 0, amount: 0 }, upi: { count: 0, amount: 0 }, bank_transfer: { count: 0, amount: 0 } },
          byCollector: {},
          payments: [],
        });
      }
      const day = grouped.get(date)!;
      const amt = Number(payment.amountReceived);
      day.total += amt;

      const method = payment.paymentMethod as string;
      if (day.byMethod[method]) {
        day.byMethod[method].count += 1;
        day.byMethod[method].amount += amt;
      }

      const collectorId = payment.collectorId || 'owner';
      const collectorName = payment.User?.username || 'Owner';
      if (!day.byCollector[collectorId]) {
        day.byCollector[collectorId] = { name: collectorName, count: 0, amount: 0 };
      }
      day.byCollector[collectorId].count += 1;
      day.byCollector[collectorId].amount += amt;

      day.payments.push({
        id: payment.id,
        amountReceived: payment.amountReceived,
        paymentMethod: payment.paymentMethod,
        customerName: payment.Loan?.Customer?.name,
        loanCode: payment.Loan?.loanCode,
        collectorName,
      });
    });

    return Object.fromEntries(grouped);
  }
}

export default new ReportService();
