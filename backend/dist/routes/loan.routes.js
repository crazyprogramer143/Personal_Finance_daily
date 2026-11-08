"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const loan_controller_1 = __importDefault(require("../controllers/loan.controller"));
const router = express_1.default.Router();
router.post('/', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), loan_controller_1.default.createLoan);
router.post('/:loanId/approve', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), loan_controller_1.default.approveLoan);
router.post('/:loanId/disburse', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), loan_controller_1.default.disburseLoan);
router.post('/:loanId/close', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), loan_controller_1.default.closeLoan);
router.get('/:loanId', auth_middleware_1.validateToken, loan_controller_1.default.getLoanDetails);
router.get('/customer/:customerId', auth_middleware_1.validateToken, loan_controller_1.default.getCustomerLoans);
exports.default = router;
//# sourceMappingURL=loan.routes.js.map