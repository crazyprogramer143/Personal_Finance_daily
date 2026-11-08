import { sequelize } from '../database/connection';
import Loan from '../models/Loan';
import LoanSchedule from '../models/LoanSchedule';
import Customer from '../models/Customer';
import Payment from '../models/Payment';

export class CollectionService {
  async getDueSchedules(_collectorId: string, companyId: string, date?: Date): Promise<any[]> {
    const checkDate = date || new Date();
    checkDate.setHours(0, 0, 0, 0);

    const schedules = await LoanSchedule.findAll({
      where: {
        dueDate: { $lte: checkDate },
        status: ['upcoming', 'due', 'overdue', 'partially_paid'],
      },
      include: [
        {
          model: Loan,
          where: { companyId, status: 'active' },
          include: [
            { model: Customer },
          ],
        },
      ],
    });

    return schedules;
  }

  async getCustomerDueLoans(customerId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loans = await Loan.findAll({
      where: { customerId, status: 'active' },
      include: [
        {
          model: LoanSchedule,
          where: {
            dueDate: { $lte: today },
            status: ['upcoming', 'due', 'overdue', 'partially_paid'],
          },
        },
      ],
    });

    return loans;
  }

  async getCollectionStats(collectorId: string, _companyId: string, date?: Date): Promise<any> {
    const checkDate = date || new Date();
    checkDate.setHours(0, 0, 0, 0);
    checkDate.setDate(checkDate.getDate() + 1);
    checkDate.setHours(0, 0, 0, -1);

    const payments = await Payment.findAll({
      where: {
        collectorId,
        paymentDate: {
          $gte: new Date(checkDate.getTime() - 24 * 60 * 60 * 1000),
          $lte: checkDate,
        },
        status: 'completed',
      },
    });

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amountReceived), 0);
    const collectionCount = payments.length;

    return {
      totalCollected,
      collectionCount,
      averageCollection: collectionCount > 0 ? totalCollected / collectionCount : 0,
      date: checkDate,
    };
  }

  async getCollectorPerformance(
    collectorId: string,
    _companyId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any> {
    const payments = await Payment.findAll({
      where: {
        collectorId,
        paymentDate: {
          $gte: fromDate,
          $lte: toDate,
        },
        status: 'completed',
      },
      include: [{ model: Loan }],
    });

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amountReceived), 0);
    const collectionCount = payments.length;
    const uniqueLoans = new Set(payments.map((p) => p.loanId)).size;

    return {
      collectorId,
      totalCollected,
      collectionCount,
      uniqueLoans,
      averagePerCollection: collectionCount > 0 ? totalCollected / collectionCount : 0,
      fromDate,
      toDate,
    };
  }

  async updateScheduleStatus(scheduleId: string): Promise<void> {
    const schedule = await LoanSchedule.findByPk(scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let status: 'upcoming' | 'due' | 'partially_paid' | 'paid' | 'overdue' | 'waived' = 'upcoming';

    if (Number(schedule.remainingDue) === 0) {
      status = 'paid';
    } else if (schedule.dueDate < today && Number(schedule.remainingDue) > 0) {
      status = 'overdue';
    } else if (schedule.dueDate.getTime() === today.getTime()) {
      status = 'due';
    } else if (Number(schedule.amountAllocated) > 0) {
      status = 'partially_paid';
    }

    await schedule.update({ status });
  }

  async waiverInstallment(
    scheduleId: string,
    _reason: string,
    _approvedBy: string
  ): Promise<LoanSchedule> {
    return sequelize.transaction(async () => {
      const schedule = await LoanSchedule.findByPk(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      if (schedule.status === 'paid') {
        throw new Error('Cannot waive a paid installment');
      }

      await schedule.update({
        status: 'waived',
        remainingDue: 0,
        amountAllocated: Number(schedule.scheduledAmount),
      });

      return schedule;
    });
  }

  async applyGracePeriod(
    scheduleId: string,
    graceDays: number,
    _reason: string
  ): Promise<LoanSchedule> {
    const schedule = await LoanSchedule.findByPk(scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const newDueDate = new Date(schedule.dueDate);
    newDueDate.setDate(newDueDate.getDate() + graceDays);

    await schedule.update({ dueDate: newDueDate });

    return schedule;
  }

  async getOverdueStats(companyId: string): Promise<any> {
    const schedules = await LoanSchedule.findAll({
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

    const totalOverdue = schedules.reduce((sum, s) => sum + Number(s.remainingDue), 0);
    const overdueCount = schedules.length;

    return {
      totalOverdueAmount: totalOverdue,
      overdueInstallmentCount: overdueCount,
      overdueSchedules: schedules,
    };
  }

  async getCollectorAssignments(collectorId: string, companyId: string): Promise<Customer[]> {
    const { CustomerCollectorAssignment } = require('../models/CustomerCollectorAssignment');

    const assignments = await CustomerCollectorAssignment.findAll({
      where: { collectorId, companyId },
      include: [{ model: Customer }],
    });

    return assignments.map((a: any) => a.Customer);
  }
}

export default new CollectionService();
