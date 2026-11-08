"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const Loan_1 = __importDefault(require("../models/Loan"));
const LoanProduct_1 = __importDefault(require("../models/LoanProduct"));
const LoanSchedule_1 = __importDefault(require("../models/LoanSchedule"));
const Disbursement_1 = __importDefault(require("../models/Disbursement"));
const Customer_1 = __importDefault(require("../models/Customer"));
class LoanService {
    async createLoan(companyId, data) {
        const product = await LoanProduct_1.default.findByPk(data.loanProductId);
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
        const loan = await Loan_1.default.create({
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
    async generateRepaymentSchedule(loan, product, disbursedAmount) {
        const frequency = product.collectionFrequency;
        const durationDays = loan.durationDays;
        let numberOfInstallments = 1;
        let daysBetweenPayments = durationDays;
        if (frequency === 'daily') {
            numberOfInstallments = durationDays;
            daysBetweenPayments = 1;
        }
        else if (frequency === 'weekly') {
            numberOfInstallments = Math.ceil(durationDays / 7);
            daysBetweenPayments = 7;
        }
        else if (frequency === 'monthly') {
            numberOfInstallments = Math.ceil(durationDays / 30);
            daysBetweenPayments = 30;
        }
        const installmentAmount = Number((disbursedAmount / numberOfInstallments).toFixed(2));
        const startDate = new Date();
        const schedules = [];
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
            });
        }
        await LoanSchedule_1.default.bulkCreate(schedules);
    }
    async approveLoan(loanId) {
        const loan = await Loan_1.default.findByPk(loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }
        if (loan.status !== 'draft') {
            throw new Error('Only draft loans can be approved');
        }
        await loan.update({ status: 'approved' });
        return loan;
    }
    async disburseLoan(loanId, disbursementDate) {
        const loan = await Loan_1.default.findByPk(loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }
        if (loan.status !== 'approved') {
            throw new Error('Only approved loans can be disbursed');
        }
        const disbursement = await Disbursement_1.default.create({
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
    async getLoanDetails(loanId) {
        const loan = await Loan_1.default.findByPk(loanId, {
            include: [
                { model: Customer_1.default },
                { model: LoanProduct_1.default },
                { model: LoanSchedule_1.default },
                { model: Disbursement_1.default },
            ],
        });
        if (!loan) {
            throw new Error('Loan not found');
        }
        return loan;
    }
    async getCustomerLoans(customerId, companyId) {
        return Loan_1.default.findAll({
            where: { customerId, companyId },
            include: [
                { model: LoanProduct_1.default },
                { model: LoanSchedule_1.default },
            ],
        });
    }
    async closeLoan(loanId) {
        const loan = await Loan_1.default.findByPk(loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }
        await loan.update({ status: 'closed' });
        return loan;
    }
}
exports.LoanService = LoanService;
exports.default = new LoanService();
//# sourceMappingURL=loan.service.js.map