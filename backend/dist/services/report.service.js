"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const Loan_1 = __importDefault(require("../models/Loan"));
const Customer_1 = __importDefault(require("../models/Customer"));
const User_1 = __importDefault(require("../models/User"));
const LoanSchedule_1 = __importDefault(require("../models/LoanSchedule"));
class ReportService {
    async getCollectionPerformanceReport(companyId, fromDate, toDate) {
        const payments = await Payment_1.default.findAll({
            where: {
                paymentDate: {
                    $gte: fromDate,
                    $lte: toDate,
                },
                status: 'completed',
            },
            include: [
                {
                    model: Loan_1.default,
                    where: { companyId },
                    include: [{ model: Customer_1.default }],
                },
                { model: User_1.default },
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
    async getCollectorComparisonReport(companyId, fromDate, toDate) {
        const payments = await Payment_1.default.findAll({
            where: {
                paymentDate: {
                    $gte: fromDate,
                    $lte: toDate,
                },
                status: 'completed',
            },
            include: [
                {
                    model: Loan_1.default,
                    where: { companyId },
                },
                { model: User_1.default },
            ],
        });
        const collectorStats = new Map();
        payments.forEach((payment) => {
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
    async getCustomerCollectionHistoryReport(customerId) {
        const loans = await Loan_1.default.findAll({
            where: { customerId },
        });
        const payments = await Payment_1.default.findAll({
            where: {
                loanId: loans.map((l) => l.id),
                status: 'completed',
            },
            include: [{ model: User_1.default }],
            order: [['paymentDate', 'DESC']],
        });
        const history = payments.map((payment) => ({
            loanId: payment.loanId,
            paymentDate: payment.paymentDate,
            amountReceived: payment.amountReceived,
            paymentMethod: payment.paymentMethod,
            collectorName: payment.User?.username || 'N/A',
            status: payment.status,
        }));
        const customer = loans[0] ? await Customer_1.default.findByPk(loans[0].customerId) : null;
        return {
            customerId,
            customerName: customer?.name,
            totalLoans: loans.length,
            totalPayments: history.length,
            totalPaid: history.reduce((sum, h) => sum + Number(h.amountReceived), 0),
            payments: history,
        };
    }
    async getLoanPortfolioReport(companyId) {
        const loans = await Loan_1.default.findAll({
            where: { companyId },
        });
        const schedules = await LoanSchedule_1.default.findAll({
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
            stats.loansByStatus[loan.status] += 1;
        });
        schedules.forEach((schedule) => {
            stats.totalOutstanding += Number(schedule.remainingDue);
        });
        return stats;
    }
    async getOverdueAnalysisReport(companyId) {
        const overdueSchedules = await LoanSchedule_1.default.findAll({
            where: {
                status: ['overdue', 'partially_paid'],
            },
            include: [
                {
                    model: Loan_1.default,
                    where: { companyId, status: 'active' },
                    include: [{ model: Customer_1.default }],
                },
            ],
        });
        const totalOverdue = overdueSchedules.reduce((sum, s) => sum + Number(s.remainingDue), 0);
        const overdueByDays = new Map();
        overdueSchedules.forEach((schedule) => {
            const today = new Date();
            const dueDate = new Date(schedule.dueDate);
            const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            let bucket = '0-7';
            if (daysOverdue > 30)
                bucket = '30+';
            else if (daysOverdue > 14)
                bucket = '14-30';
            else if (daysOverdue > 7)
                bucket = '7-14';
            overdueByDays.set(bucket, (overdueByDays.get(bucket) || 0) + Number(schedule.remainingDue));
        });
        return {
            totalOverdueAmount: totalOverdue,
            totalOverdueCount: overdueSchedules.length,
            overdueByDays: Object.fromEntries(overdueByDays),
            overdueSchedules: overdueSchedules.slice(0, 100),
        };
    }
    groupByDate(payments) {
        const grouped = new Map();
        payments.forEach((payment) => {
            const date = new Date(payment.paymentDate).toISOString().split('T')[0];
            grouped.set(date, (grouped.get(date) || 0) + Number(payment.amountReceived));
        });
        return Object.fromEntries(grouped);
    }
}
exports.ReportService = ReportService;
exports.default = new ReportService();
//# sourceMappingURL=report.service.js.map