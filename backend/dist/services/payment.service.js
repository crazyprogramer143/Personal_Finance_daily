"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const PaymentAllocation_1 = __importDefault(require("../models/PaymentAllocation"));
const LoanSchedule_1 = __importDefault(require("../models/LoanSchedule"));
const Loan_1 = __importDefault(require("../models/Loan"));
const connection_1 = require("../database/connection");
class PaymentService {
    async recordPayment(data, allocations) {
        const loan = await Loan_1.default.findByPk(data.loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }
        const payment = await Payment_1.default.create({
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
        return payment;
    }
    async allocatePaymentToSchedules(paymentId, allocations) {
        for (const allocation of allocations) {
            const schedule = await LoanSchedule_1.default.findByPk(allocation.scheduleId);
            if (!schedule) {
                throw new Error(`Schedule ${allocation.scheduleId} not found`);
            }
            if (allocation.amountAllocated > schedule.remainingDue) {
                throw new Error(`Allocation amount exceeds remaining due for schedule ${allocation.scheduleId}`);
            }
            await PaymentAllocation_1.default.create({
                paymentId,
                scheduleId: allocation.scheduleId,
                amountAllocated: allocation.amountAllocated,
            });
            const newAllocated = Number(schedule.amountAllocated) + allocation.amountAllocated;
            const newRemaining = Number(schedule.scheduledAmount) - newAllocated;
            let status = 'upcoming';
            if (newRemaining === 0) {
                status = 'paid';
            }
            else if (newAllocated > 0) {
                status = 'partially_paid';
            }
            await schedule.update({
                amountAllocated: newAllocated,
                remainingDue: newRemaining,
                status,
            });
        }
    }
    async reversePayment(paymentId, reason) {
        const payment = await Payment_1.default.findByPk(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }
        if (payment.status === 'reversed') {
            throw new Error('Payment is already reversed');
        }
        await connection_1.sequelize.transaction(async (transaction) => {
            const allocations = await PaymentAllocation_1.default.findAll({
                where: { paymentId },
            });
            for (const allocation of allocations) {
                const schedule = await LoanSchedule_1.default.findByPk(allocation.scheduleId);
                if (schedule) {
                    const newAllocated = Number(schedule.amountAllocated) - Number(allocation.amountAllocated);
                    const newRemaining = Number(schedule.scheduledAmount) - newAllocated;
                    await schedule.update({
                        amountAllocated: newAllocated,
                        remainingDue: newRemaining,
                        status: newAllocated === 0 ? 'upcoming' : 'partially_paid',
                    }, { transaction });
                }
                await allocation.destroy({ transaction });
            }
            await payment.update({
                status: 'reversed',
                reversedAt: new Date(),
                reversalReason: reason,
            }, { transaction });
        });
        return payment;
    }
    async getPaymentDetails(paymentId) {
        return Payment_1.default.findByPk(paymentId, {
            include: [
                {
                    model: PaymentAllocation_1.default,
                    include: [{ model: LoanSchedule_1.default }],
                },
            ],
        });
    }
    async getLoanPayments(loanId) {
        return Payment_1.default.findAll({
            where: { loanId },
            include: [{ model: PaymentAllocation_1.default }],
            order: [['paymentDate', 'DESC']],
        });
    }
    async getCollectorPayments(collectorId, fromDate, toDate) {
        const whereClause = { collectorId };
        if (fromDate || toDate) {
            whereClause.paymentDate = {};
            if (fromDate)
                whereClause.paymentDate.$gte = fromDate;
            if (toDate)
                whereClause.paymentDate.$lte = toDate;
        }
        return Payment_1.default.findAll({
            where: whereClause,
            order: [['paymentDate', 'DESC']],
        });
    }
}
exports.PaymentService = PaymentService;
exports.default = new PaymentService();
//# sourceMappingURL=payment.service.js.map