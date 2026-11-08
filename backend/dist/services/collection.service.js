"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = void 0;
const connection_1 = require("../database/connection");
const Loan_1 = __importDefault(require("../models/Loan"));
const LoanSchedule_1 = __importDefault(require("../models/LoanSchedule"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Payment_1 = __importDefault(require("../models/Payment"));
class CollectionService {
    async getDueSchedules(_collectorId, companyId, date) {
        const checkDate = date || new Date();
        checkDate.setHours(0, 0, 0, 0);
        const schedules = await LoanSchedule_1.default.findAll({
            where: {
                dueDate: { $lte: checkDate },
                status: ['upcoming', 'due', 'overdue', 'partially_paid'],
            },
            include: [
                {
                    model: Loan_1.default,
                    where: { companyId, status: 'active' },
                    include: [
                        { model: Customer_1.default },
                    ],
                },
            ],
        });
        return schedules;
    }
    async getCustomerDueLoans(customerId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const loans = await Loan_1.default.findAll({
            where: { customerId, status: 'active' },
            include: [
                {
                    model: LoanSchedule_1.default,
                    where: {
                        dueDate: { $lte: today },
                        status: ['upcoming', 'due', 'overdue', 'partially_paid'],
                    },
                },
            ],
        });
        return loans;
    }
    async getCollectionStats(collectorId, _companyId, date) {
        const checkDate = date || new Date();
        checkDate.setHours(0, 0, 0, 0);
        checkDate.setDate(checkDate.getDate() + 1);
        checkDate.setHours(0, 0, 0, -1);
        const payments = await Payment_1.default.findAll({
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
    async getCollectorPerformance(collectorId, _companyId, fromDate, toDate) {
        const payments = await Payment_1.default.findAll({
            where: {
                collectorId,
                paymentDate: {
                    $gte: fromDate,
                    $lte: toDate,
                },
                status: 'completed',
            },
            include: [{ model: Loan_1.default }],
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
    async updateScheduleStatus(scheduleId) {
        const schedule = await LoanSchedule_1.default.findByPk(scheduleId);
        if (!schedule) {
            throw new Error('Schedule not found');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let status = 'upcoming';
        if (Number(schedule.remainingDue) === 0) {
            status = 'paid';
        }
        else if (schedule.dueDate < today && Number(schedule.remainingDue) > 0) {
            status = 'overdue';
        }
        else if (schedule.dueDate.getTime() === today.getTime()) {
            status = 'due';
        }
        else if (Number(schedule.amountAllocated) > 0) {
            status = 'partially_paid';
        }
        await schedule.update({ status });
    }
    async waiverInstallment(scheduleId, _reason, _approvedBy) {
        return connection_1.sequelize.transaction(async () => {
            const schedule = await LoanSchedule_1.default.findByPk(scheduleId);
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
    async applyGracePeriod(scheduleId, graceDays, _reason) {
        const schedule = await LoanSchedule_1.default.findByPk(scheduleId);
        if (!schedule) {
            throw new Error('Schedule not found');
        }
        const newDueDate = new Date(schedule.dueDate);
        newDueDate.setDate(newDueDate.getDate() + graceDays);
        await schedule.update({ dueDate: newDueDate });
        return schedule;
    }
    async getOverdueStats(companyId) {
        const schedules = await LoanSchedule_1.default.findAll({
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
        const totalOverdue = schedules.reduce((sum, s) => sum + Number(s.remainingDue), 0);
        const overdueCount = schedules.length;
        return {
            totalOverdueAmount: totalOverdue,
            overdueInstallmentCount: overdueCount,
            overdueSchedules: schedules,
        };
    }
    async getCollectorAssignments(collectorId, companyId) {
        const { CustomerCollectorAssignment } = require('../models/CustomerCollectorAssignment');
        const assignments = await CustomerCollectorAssignment.findAll({
            where: { collectorId, companyId },
            include: [{ model: Customer_1.default }],
        });
        return assignments.map((a) => a.Customer);
    }
}
exports.CollectionService = CollectionService;
exports.default = new CollectionService();
//# sourceMappingURL=collection.service.js.map