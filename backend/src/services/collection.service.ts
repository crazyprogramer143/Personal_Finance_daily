import { sequelize } from '../database/connection';
import { Op } from 'sequelize';
import Loan from '../models/Loan';
import LoanSchedule from '../models/LoanSchedule';
import Customer from '../models/Customer';
import Payment from '../models/Payment';
import CustomerCollectorAssignment from '../models/CustomerCollectorAssignment';

export class CollectionService {
  async getDueSchedules(_collectorId: string, companyId: string, date?: Date, role?: string, assignedCustomerIds?: string[]): Promise<any[]> {
    const checkDate = date || new Date();
    checkDate.setHours(23, 59, 59, 999);

    const loanWhere: any = { companyId, status: { [Op.in]: ['active', 'approved'] } };
    if (role === 'collector' && assignedCustomerIds) {
      loanWhere.customerId = { [Op.in]: assignedCustomerIds };
    }

    const schedules = await LoanSchedule.findAll({
      where: {
        dueDate: { [Op.lte]: checkDate },
        status: { [Op.in]: ['upcoming', 'due', 'overdue', 'partially_paid'] },
      },
      include: [
        {
          model: Loan,
          where: loanWhere,
          include: [
            { model: Customer },
          ],
        },
      ],
    });

    const loanIds = [...new Set(schedules.map(s => s.loanId))];
    const allSchedules = loanIds.length > 0 ? await LoanSchedule.findAll({
      where: { loanId: { [Op.in]: loanIds } },
      order: [['dueDate', 'ASC']],
      attributes: ['id', 'loanId'],
    }) : [];

    const installmentMap: Record<string, number> = {};
    const loanScheduleCounters: Record<string, number> = {};
    for (const s of allSchedules) {
      if (!loanScheduleCounters[s.loanId]) loanScheduleCounters[s.loanId] = 0;
      loanScheduleCounters[s.loanId]++;
      installmentMap[s.id] = loanScheduleCounters[s.loanId];
    }

    const totalScheduleMap: Record<string, number> = {};
    for (const lid of loanIds) {
      totalScheduleMap[lid] = loanScheduleCounters[lid] || 0;
    }

    return schedules.map(s => {
      const json = s.toJSON() as any;
      json.installmentNumber = installmentMap[s.id] || 0;
      json.totalInstallments = totalScheduleMap[s.loanId] || 0;
      json.loanCode = json.Loan?.loanCode;
      return json;
    });
  }

  async getCustomerDueLoans(customerId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const loans = await Loan.findAll({
      where: { customerId, status: { [Op.in]: ['active', 'approved'] } },
      include: [
        {
          model: LoanSchedule,
          where: {
            dueDate: { [Op.lte]: today },
            status: { [Op.in]: ['upcoming', 'due', 'overdue', 'partially_paid'] },
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
          [Op.gte]: new Date(checkDate.getTime() - 24 * 60 * 60 * 1000),
          [Op.lte]: checkDate,
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
          [Op.gte]: fromDate,
          [Op.lte]: toDate,
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

    if (schedule.status === 'waived' || schedule.status === 'skipped') {
      return;
    }

    let status: 'upcoming' | 'due' | 'partially_paid' | 'paid' | 'overdue' | 'waived' | 'skipped' = 'upcoming';

    if (Number(schedule.remainingDue) === 0) {
      status = 'paid';
    } else if (Number(schedule.amountAllocated) > 0 && schedule.dueDate < today) {
      status = 'overdue';
    } else if (schedule.dueDate < today && Number(schedule.remainingDue) > 0) {
      status = 'overdue';
    } else if (Number(schedule.amountAllocated) > 0) {
      status = 'partially_paid';
    } else {
      const dueDay = new Date(schedule.dueDate);
      dueDay.setHours(0, 0, 0, 0);
      if (dueDay.getTime() === today.getTime()) {
        status = 'due';
      }
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

  async skipInstallment(
    scheduleId: string,
    reason: string,
    _approvedBy: string
  ): Promise<{ skipped: LoanSchedule; newSchedule: LoanSchedule }> {
    return sequelize.transaction(async (t) => {
      const schedule = await LoanSchedule.findByPk(scheduleId, { transaction: t });
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      if (schedule.status === 'paid' || schedule.status === 'waived' || schedule.status === 'skipped') {
        throw new Error(`Cannot skip a ${schedule.status} installment`);
      }

      const skipAmount = Number(schedule.remainingDue);

      await schedule.update({
        status: 'skipped',
        skipReason: reason,
        remainingDue: 0,
      }, { transaction: t });

      const lastSchedule = await LoanSchedule.findOne({
        where: { loanId: schedule.loanId, status: { [Op.ne]: 'skipped' } },
        order: [['dueDate', 'DESC']],
        transaction: t,
      });

      const lastDate = lastSchedule ? new Date(lastSchedule.dueDate) : new Date(schedule.dueDate);
      const newDueDate = new Date(lastDate);
      newDueDate.setDate(newDueDate.getDate() + 1);

      const newSchedule = await LoanSchedule.create({
        loanId: schedule.loanId,
        dueDate: newDueDate,
        scheduledAmount: skipAmount,
        amountAllocated: 0,
        remainingDue: skipAmount,
        status: 'upcoming',
      }, { transaction: t });

      const loan = await Loan.findByPk(schedule.loanId, { transaction: t });
      if (loan) {
        await loan.update({
          endDate: newDueDate,
          durationDays: loan.durationDays + 1,
        }, { transaction: t });
      }

      return { skipped: schedule, newSchedule };
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

  async getOverdueStats(companyId: string, date?: Date): Promise<any> {
    const asOfDate = date || new Date();
    asOfDate.setHours(0, 0, 0, 0);

    const schedules = await LoanSchedule.findAll({
      where: {
        dueDate: { [Op.lt]: asOfDate },
        remainingDue: { [Op.gt]: 0 },
        status: { [Op.notIn]: ['paid', 'waived', 'skipped'] },
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

    const loanIds = [...new Set(schedules.map(s => s.loanId))];
    const allSchedules = loanIds.length > 0 ? await LoanSchedule.findAll({
      where: { loanId: { [Op.in]: loanIds } },
      order: [['dueDate', 'ASC']],
      attributes: ['id', 'loanId'],
    }) : [];

    const installmentMap: Record<string, number> = {};
    const loanScheduleCounters: Record<string, number> = {};
    for (const s of allSchedules) {
      if (!loanScheduleCounters[s.loanId]) loanScheduleCounters[s.loanId] = 0;
      loanScheduleCounters[s.loanId]++;
      installmentMap[s.id] = loanScheduleCounters[s.loanId];
    }

    const totalScheduleMap: Record<string, number> = {};
    for (const lid of loanIds) {
      totalScheduleMap[lid] = loanScheduleCounters[lid] || 0;
    }

    const enriched = schedules.map(s => {
      const json = s.toJSON() as any;
      json.installmentNumber = installmentMap[s.id] || 0;
      json.totalInstallments = totalScheduleMap[s.loanId] || 0;
      json.loanCode = json.Loan?.loanCode;
      return json;
    });

    return {
      totalOverdueAmount: totalOverdue,
      overdueInstallmentCount: overdueCount,
      overdueSchedules: enriched,
    };
  }

  async getCollectorAssignments(collectorId: string, companyId: string): Promise<Customer[]> {
    const assignments = await CustomerCollectorAssignment.findAll({
      where: { collectorId, companyId },
      include: [{ model: Customer }],
    });

    return assignments.map((a: any) => a.Customer);
  }

  async getAssignedCustomerIds(collectorId: string, companyId: string): Promise<string[]> {
    const assignments = await CustomerCollectorAssignment.findAll({
      where: { collectorId, companyId },
      attributes: ['customerId'],
    });
    return assignments.map((a: any) => a.customerId);
  }
}

export default new CollectionService();
