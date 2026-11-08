"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseController = void 0;
const expense_service_1 = __importDefault(require("../services/expense.service"));
const audit_service_1 = __importDefault(require("../services/audit.service"));
class ExpenseController {
    async createExpense(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { category, amount, description, expenseDate } = _req.body;
            const expense = await expense_service_1.default.createExpense(companyId, userId, {
                category,
                amount,
                description,
                expenseDate: new Date(expenseDate),
            });
            await audit_service_1.default.logAction(companyId, userId, 'CREATE', 'Expense', expense.id, { category, amount });
            res.status(201).json(expense);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCompanyExpenses(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const fromDate = _req.query.fromDate ? new Date(_req.query.fromDate) : undefined;
            const toDate = _req.query.toDate ? new Date(_req.query.toDate) : undefined;
            const status = _req.query.status;
            const expenses = await expense_service_1.default.getCompanyExpenses(companyId, fromDate, toDate, status);
            res.json(expenses);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async approveExpense(_req, res) {
        try {
            const { expenseId } = _req.params;
            const userId = _req.user.id;
            const companyId = _req.user.companyId;
            const expense = await expense_service_1.default.approveExpense(expenseId, userId);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Expense', expenseId, {
                status: 'approved',
            });
            res.json(expense);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async rejectExpense(_req, res) {
        try {
            const { expenseId } = _req.params;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const expense = await expense_service_1.default.rejectExpense(expenseId);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Expense', expenseId, {
                status: 'rejected',
            });
            res.json(expense);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getExpenseStats(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const fromDate = _req.query.fromDate ? new Date(_req.query.fromDate) : undefined;
            const toDate = _req.query.toDate ? new Date(_req.query.toDate) : undefined;
            const stats = await expense_service_1.default.getExpenseStats(companyId, fromDate, toDate);
            res.json(stats);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getPendingExpensesCount(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const count = await expense_service_1.default.getPendingExpensesCount(companyId);
            res.json({ pendingCount: count });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.ExpenseController = ExpenseController;
exports.default = new ExpenseController();
//# sourceMappingURL=expense.controller.js.map