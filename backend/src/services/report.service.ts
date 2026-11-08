import Payment from '../models/Payment';
import Loan from '../models/Loan';
import Customer from '../models/Customer';
import User from '../models/User';
import LoanSchedule from '../models/LoanSchedule';

export class ReportService {
  async getCollectionPerformanceReport(
    companyId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any> {
    const payments = await Payment.findAll({
      where: {
        paymentDate: {
          $gte: fromDate,
          $lte: toDate,
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
      paymentsByDate: this.groupByDate(payments),
    };
  }

  async getCollectorComparisonReport(
    companyId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any> {
    const payments = await Payment.findAll({
      where: {
        paymentDate: {
          $gte: fromDate,
          $lte: toDate,
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

  private groupByDate(payments: Payment[]): any {
    const grouped = new Map<string, number>();

    payments.forEach((payment) => {
      const date = new Date(payment.paymentDate).toISOString().split('T')[0];
      grouped.set(date, (grouped.get(date) || 0) + Number(payment.amountReceived));
    });

    return Object.fromEntries(grouped);
  }
}

export default new ReportService();
