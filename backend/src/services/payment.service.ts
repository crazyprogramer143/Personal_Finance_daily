import Payment from '../models/Payment';
import PaymentAllocation from '../models/PaymentAllocation';
import LoanSchedule from '../models/LoanSchedule';
import Loan from '../models/Loan';
import Customer from '../models/Customer';
import { Op } from 'sequelize';
import { sequelize } from '../database/connection';
import accountService from './account.service';

interface CreatePaymentRequest {
  loanId: string;
  collectorId?: string;
  amountReceived: number;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer';
  referenceNumber?: string;
  paymentDate: Date;
  accountId?: string;
  companyId?: string;
}

interface PaymentAllocationData {
  scheduleId: string;
  amountAllocated: number;
}

export class PaymentService {
  async recordPayment(data: CreatePaymentRequest, allocations?: PaymentAllocationData[]): Promise<Payment> {
    const loan = await Loan.findByPk(data.loanId, { include: [{ model: Customer }] });
    if (!loan) {
      throw new Error('Loan not found');
    }

    const payment = await Payment.create({
      loanId: data.loanId,
      collectorId: data.collectorId,
      amountReceived: data.amountReceived,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      paymentDate: data.paymentDate,
      status: 'completed',
    });

    if (allocations && allocations.length > 0) {
      await this.allocatePaymentToSchedules(payment.id, allocations);
    }

    if (data.accountId && data.companyId) {
      await accountService.recordTransaction({
        companyId: data.companyId,
        accountId: data.accountId,
        transactionDate: data.paymentDate,
        type: 'credit',
        amount: data.amountReceived,
        description: `Loan repayment${loan.loanCode ? ` (${loan.loanCode})` : ''} from ${(loan as any).Customer?.name || 'Unknown'}`,
        referenceType: 'payment',
        referenceId: payment.id,
      });
    }

    return payment;
  }

  private async allocatePaymentToSchedules(
    paymentId: string,
    allocations: PaymentAllocationData[]
  ): Promise<void> {
    for (const allocation of allocations) {
      const schedule = await LoanSchedule.findByPk(allocation.scheduleId);
      if (!schedule) {
        throw new Error(`Schedule ${allocation.scheduleId} not found`);
      }

      if (allocation.amountAllocated > schedule.remainingDue) {
        throw new Error(`Allocation amount exceeds remaining due for schedule ${allocation.scheduleId}`);
      }

      await PaymentAllocation.create({
        paymentId,
        scheduleId: allocation.scheduleId,
        amountAllocated: allocation.amountAllocated,
      });

      const newAllocated = Number(schedule.amountAllocated) + allocation.amountAllocated;
      const newRemaining = Number(schedule.scheduledAmount) - newAllocated;
      let status: 'upcoming' | 'due' | 'partially_paid' | 'paid' | 'overdue' | 'waived' | 'skipped' = schedule.status;

      if (newRemaining <= 0) {
        status = 'paid';
      } else if (newAllocated > 0) {
        status = 'partially_paid';
      }

      await schedule.update({
        amountAllocated: newAllocated,
        remainingDue: Math.max(0, newRemaining),
        status,
        paidAt: status === 'paid' ? new Date() : undefined,
      });
    }
  }

  async reversePayment(paymentId: string, reason: string): Promise<Payment> {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'reversed') {
      throw new Error('Payment is already reversed');
    }

    await sequelize.transaction(async (transaction) => {
      const allocations = await PaymentAllocation.findAll({
        where: { paymentId },
      });

      for (const allocation of allocations) {
        const schedule = await LoanSchedule.findByPk(allocation.scheduleId);
        if (schedule) {
          const newAllocated = Number(schedule.amountAllocated) - Number(allocation.amountAllocated);
          const newRemaining = Number(schedule.scheduledAmount) - newAllocated;

          await schedule.update(
            {
              amountAllocated: newAllocated,
              remainingDue: newRemaining,
              status: newAllocated === 0 ? 'upcoming' : 'partially_paid',
            },
            { transaction }
          );
        }

        await allocation.destroy({ transaction });
      }

      await payment.update(
        {
          status: 'reversed',
          reversedAt: new Date(),
          reversalReason: reason,
        },
        { transaction }
      );
    });

    return payment;
  }

  async getPaymentDetails(paymentId: string): Promise<any> {
    return Payment.findByPk(paymentId, {
      include: [
        {
          model: PaymentAllocation,
          include: [{ model: LoanSchedule }],
        },
      ],
    });
  }

  async getLoanPayments(loanId: string): Promise<Payment[]> {
    return Payment.findAll({
      where: { loanId },
      include: [{ model: PaymentAllocation }],
      order: [['paymentDate', 'DESC']],
    });
  }

  async getCollectorPayments(collectorId: string, fromDate?: Date, toDate?: Date): Promise<Payment[]> {
    const whereClause: any = { collectorId };

    if (fromDate || toDate) {
      whereClause.paymentDate = {};
      if (fromDate) whereClause.paymentDate[Op.gte] = fromDate;
      if (toDate) whereClause.paymentDate[Op.lte] = toDate;
    }

    return Payment.findAll({
      where: whereClause,
      order: [['paymentDate', 'DESC']],
    });
  }
}

export default new PaymentService();
