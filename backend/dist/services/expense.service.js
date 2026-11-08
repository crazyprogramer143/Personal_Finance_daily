"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseService = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
const connection_1 = require("../database/connection");
class ExpenseService {
    async createExpense(companyId, userId, data) {
        return Expense_1.default.create({
            companyId,
            userId,
            category: data.category,
            amount: data.amount,
            description: data.description,
            expenseDate: data.expenseDate,
            status: 'pending',
        });
    }
    async getCompanyExpenses(companyId, fromDate, toDate, status) {
        const where = { companyId };
        if (fromDate || toDate) {
            where.expenseDate = {};
            if (fromDate)
                where.expenseDate.$gte = fromDate;
            if (toDate)
                where.expenseDate.$lte = toDate;
        }
        if (status) {
            where.status = status;
        }
        return Expense_1.default.findAll({
            where,
            order: [['expenseDate', 'DESC']],
        });
    }
    async getUserExpenses(userId, companyId) {
        return Expense_1.default.findAll({
            where: { userId, companyId },
            order: [['expenseDate', 'DESC']],
        });
    }
    async approveExpense(expenseId, approvedBy) {
        return connection_1.sequelize.transaction(async () => {
            const expense = await Expense_1.default.findByPk(expenseId);
            if (!expense) {
                throw new Error('Expense not found');
            }
            if (expense.status !== 'pending') {
                throw new Error('Only pending expenses can be approved');
            }
            await expense.update({
                status: 'approved',
                approvedBy: approvedBy,
            });
            return expense;
        });
    }
    async rejectExpense(expenseId) {
        const expense = await Expense_1.default.findByPk(expenseId);
        if (!expense) {
            throw new Error('Expense not found');
        }
        if (expense.status !== 'pending') {
            throw new Error('Only pending expenses can be rejected');
        }
        await expense.update({ status: 'rejected' });
        return expense;
    }
    async getExpenseStats(companyId, fromDate, toDate) {
        const where = { companyId, status: 'approved' };
        if (fromDate || toDate) {
            where.expenseDate = {};
            if (fromDate)
                where.expenseDate.$gte = fromDate;
            if (toDate)
                where.expenseDate.$lte = toDate;
        }
        const expenses = await Expense_1.default.findAll({ where });
        const byCategory = new Map();
        let totalExpenses = 0;
        expenses.forEach((expense) => {
            totalExpenses += Number(expense.amount);
            byCategory.set(expense.category, (byCategory.get(expense.category) || 0) + Number(expense.amount));
        });
        return {
            totalExpenses,
            expenseCount: expenses.length,
            byCategory: Object.fromEntries(byCategory),
            averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
        };
    }
    async getPendingExpensesCount(companyId) {
        return Expense_1.default.count({ where: { companyId, status: 'pending' } });
    }
}
exports.ExpenseService = ExpenseService;
exports.default = new ExpenseService();
//# sourceMappingURL=expense.service.js.map