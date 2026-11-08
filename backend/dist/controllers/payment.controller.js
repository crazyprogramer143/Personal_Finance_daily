"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = __importDefault(require("../services/payment.service"));
const audit_service_1 = __importDefault(require("../services/audit.service"));
class PaymentController {
    async recordPayment(_req, res) {
        try {
            const { loanId, amountReceived, paymentMethod, referenceNumber, paymentDate, allocations } = _req.body;
            const userId = _req.user.id;
            const companyId = _req.user.companyId;
            const payment = await payment_service_1.default.recordPayment({
                loanId,
                collectorId: userId,
                amountReceived,
                paymentMethod,
                referenceNumber,
                paymentDate: new Date(paymentDate),
            }, allocations);
            await audit_service_1.default.logAction(companyId, userId, 'CREATE', 'Payment', payment.id, { amountReceived, paymentMethod });
            res.status(201).json(payment);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async reversePayment(_req, res) {
        try {
            const { paymentId } = _req.params;
            const { reason } = _req.body;
            const userId = _req.user.id;
            const companyId = _req.user.companyId;
            const payment = await payment_service_1.default.reversePayment(paymentId, reason);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Payment', paymentId, { status: 'reversed', reason });
            res.json(payment);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getPaymentDetails(_req, res) {
        try {
            const { paymentId } = _req.params;
            const payment = await payment_service_1.default.getPaymentDetails(paymentId);
            res.json(payment);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getLoanPayments(_req, res) {
        try {
            const { loanId } = _req.params;
            const payments = await payment_service_1.default.getLoanPayments(loanId);
            res.json(payments);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCollectorPayments(_req, res) {
        try {
            const collectorId = _req.user.id;
            const { fromDate, toDate } = _req.query;
            const payments = await payment_service_1.default.getCollectorPayments(collectorId, fromDate ? new Date(fromDate) : undefined, toDate ? new Date(toDate) : undefined);
            res.json(payments);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.PaymentController = PaymentController;
exports.default = new PaymentController();
//# sourceMappingURL=payment.controller.js.map