"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const expense_controller_1 = __importDefault(require("../controllers/expense.controller"));
const router = express_1.default.Router();
router.post('/', auth_middleware_1.validateToken, expense_controller_1.default.createExpense);
router.get('/', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), expense_controller_1.default.getCompanyExpenses);
router.post('/:expenseId/approve', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), expense_controller_1.default.approveExpense);
router.post('/:expenseId/reject', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), expense_controller_1.default.rejectExpense);
router.get('/stats', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), expense_controller_1.default.getExpenseStats);
router.get('/pending/count', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), expense_controller_1.default.getPendingExpensesCount);
exports.default = router;
//# sourceMappingURL=expense.routes.js.map