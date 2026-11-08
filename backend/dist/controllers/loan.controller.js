"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanController = void 0;
const loan_service_1 = __importDefault(require("../services/loan.service"));
const audit_service_1 = __importDefault(require("../services/audit.service"));
class LoanController {
    async createLoan(_req, res) {
        try {
            const { customerId, loanProductId, principalAmount, heldAmount, durationDays } = _req.body;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const loan = await loan_service_1.default.createLoan(companyId, {
                customerId,
                loanProductId,
                principalAmount,
                heldAmount,
                durationDays,
            });
            await audit_service_1.default.logAction(companyId, userId, 'CREATE', 'Loan', loan.id, { principalAmount, heldAmount });
            res.status(201).json(loan);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async approveLoan(_req, res) {
        try {
            const { loanId } = _req.params;
            const userId = _req.user.id;
            const companyId = _req.user.companyId;
            const loan = await loan_service_1.default.approveLoan(loanId);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Loan', loanId, { status: 'approved' });
            res.json(loan);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async disburseLoan(_req, res) {
        try {
            const { loanId } = _req.params;
            const { disbursementDate, disbursementMethod } = _req.body;
            const userId = _req.user.id;
            const companyId = _req.user.companyId;
            const disbursement = await loan_service_1.default.disburseLoan(loanId, new Date(disbursementDate));
            await audit_service_1.default.logAction(companyId, userId, 'CREATE', 'Disbursement', disbursement.id, { disbursementMethod });
            res.status(201).json(disbursement);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getLoanDetails(_req, res) {
        try {
            const { loanId } = _req.params;
            const loan = await loan_service_1.default.getLoanDetails(loanId);
            res.json(loan);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCustomerLoans(_req, res) {
        try {
            const { customerId } = _req.params;
            const companyId = _req.user.companyId;
            const loans = await loan_service_1.default.getCustomerLoans(customerId, companyId);
            res.json(loans);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async closeLoan(_req, res) {
        try {
            const { loanId } = _req.params;
            const userId = _req.user.id;
            const companyId = _req.user.companyId;
            const loan = await loan_service_1.default.closeLoan(loanId);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Loan', loanId, { status: 'closed' });
            res.json(loan);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.LoanController = LoanController;
exports.default = new LoanController();
//# sourceMappingURL=loan.controller.js.map