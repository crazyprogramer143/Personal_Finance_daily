"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const payment_controller_1 = __importDefault(require("../controllers/payment.controller"));
const router = express_1.default.Router();
router.post('/', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('collector'), payment_controller_1.default.recordPayment);
router.post('/:paymentId/reverse', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), payment_controller_1.default.reversePayment);
router.get('/:paymentId', auth_middleware_1.validateToken, payment_controller_1.default.getPaymentDetails);
router.get('/loan/:loanId', auth_middleware_1.validateToken, payment_controller_1.default.getLoanPayments);
router.get('/collector/payments', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('collector'), payment_controller_1.default.getCollectorPayments);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map