import Loan from '../models/Loan';
import LoanProduct from '../models/LoanProduct';
import LoanSchedule from '../models/LoanSchedule';
import Disbursement from '../models/Disbursement';
import Customer from '../models/Customer';

interface CreateLoanRequest {
  customerId: string;
  loanProductId: string;
  principalAmount: number;
  heldAmount: number;
  durationDays?: number;
}

export class LoanService {
  async createLoan(companyId: string, data: CreateLoanRequest): Promise<Loan> {
    const product = await LoanProduct.findByPk(data.loanProductId);
    if (!product) {
      throw new Error('Loan product not found');
    }

    const minPrincipal = product.minPrincipal || 0;
    const maxPrincipal = product.maxPrincipal || 0;
    if (data.principalAmount < minPrincipal || data.principalAmount > maxPrincipal) {
      throw new Error(`Principal must be between ${minPrincipal} and ${maxPrincipal}`);
    }

    if (data.heldAmount > data.principalAmount) {
      throw new Error('Held amount cannot exceed principal amount');
    }

    const durationDays = data.durationDays || (product.durationDays || 30);
    const disbursedAmount = data.principalAmount - data.heldAmount;
    const interestRate = product.interestRatePercent || 0;
    const totalScheduledRepayment = data.principalAmount + (data.principalAmount * interestRate) / 100;

    const loan = await Loan.create({
      companyId,
      customerId: data.customerId,
      loanProductId: data.loanProductId,
      principalAmount: data.principalAmount,
      heldAmount: data.heldAmount,
      disbursedAmount,
      totalScheduledRepayment,
      durationDays,
      collectionFrequency: product.collectionFrequency || 'daily',
      status: 'draft',
    });

    // Calculate and create repayment schedule
    await this.generateRepaymentSchedule(loan, product, disbursedAmount);

    return loan;
  }

  private async generateRepaymentSchedule(
    loan: Loan,
    product: LoanProduct,
    disbursedAmount: number
  ): Promise<void> {
    const frequency = product.collectionFrequency;
    const durationDays = loan.durationDays;
    let numberOfInstallments = 1;
    let daysBetweenPayments = durationDays;

    if (frequency === 'daily') {
      numberOfInstallments = durationDays;
      daysBetweenPayments = 1;
    } else if (frequency === 'weekly') {
      numberOfInstallments = Math.ceil(durationDays / 7);
      daysBetweenPayments = 7;
    } else if (frequency === 'monthly') {
      numberOfInstallments = Math.ceil(durationDays / 30);
      daysBetweenPayments = 30;
    }

    const installmentAmount = Number((disbursedAmount / numberOfInstallments).toFixed(2));
    const startDate = new Date();

    const schedules: Omit<LoanSchedule, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (i + 1) * daysBetweenPayments);

      schedules.push({
        loanId: loan.id,
        dueDate,
        scheduledAmount: installmentAmount,
        amountAllocated: 0,
        remainingDue: installmentAmount,
        status: 'upcoming',
      } as any);
    }

    await LoanSchedule.bulkCreate(schedules);
  }

  async approveLoan(loanId: string): Promise<Loan> {
    const loan = await Loan.findByPk(loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status !== 'draft') {
      throw new Error('Only draft loans can be approved');
    }

    await loan.update({ status: 'approved' });
    return loan;
  }

  async disburseLoan(loanId: string, disbursementDate: Date): Promise<Disbursement> {
    const loan = await Loan.findByPk(loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status !== 'approved') {
      throw new Error('Only approved loans can be disbursed');
    }

    const disbursement = await Disbursement.create({
      loanId,
      principalAmount: loan.principalAmount,
      heldAmount: loan.heldAmount,
      disbursedAmount: loan.principalAmount - loan.heldAmount,
      disbursementDate,
      disbursementMethod: 'cash',
      status: 'completed',
    });

    await loan.update({ status: 'active' });

    return disbursement;
  }

  async getLoanDetails(loanId: string): Promise<any> {
    const loan = await Loan.findByPk(loanId, {
      include: [
        { model: Customer },
        { model: LoanProduct },
        { model: LoanSchedule },
        { model: Disbursement },
      ],
    });

    if (!loan) {
      throw new Error('Loan not found');
    }

    return loan;
  }

  async getCustomerLoans(customerId: string, companyId: string): Promise<Loan[]> {
    return Loan.findAll({
      where: { customerId, companyId },
      include: [
        { model: LoanProduct },
        { model: LoanSchedule },
      ],
    });
  }

  async closeLoan(loanId: string): Promise<Loan> {
    const loan = await Loan.findByPk(loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    await loan.update({ status: 'closed' });
    return loan;
  }
}

export default new LoanService();
