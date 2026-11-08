"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const account_service_1 = __importDefault(require("../services/account.service"));
const audit_service_1 = __importDefault(require("../services/audit.service"));
class AccountController {
    async createAccount(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { name, type, bankName, accountNumber, upiId, currency } = _req.body;
            const account = await account_service_1.default.createAccount({
                companyId,
                name,
                type,
                bankName,
                accountNumber,
                upiId,
                currency,
            });
            await audit_service_1.default.logAction(companyId, userId, 'CREATE', 'Account', account.id, { name, type });
            res.status(201).json(account);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCompanyAccounts(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const accounts = await account_service_1.default.getCompanyAccounts(companyId);
            res.json(accounts);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAccountDetails(_req, res) {
        try {
            const { accountId } = _req.params;
            const account = await account_service_1.default.getAccountDetails(accountId);
            res.json(account);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async recordTransaction(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { accountId, type, amount, description, referenceType, referenceId, transactionDate } = _req.body;
            const transaction = await account_service_1.default.recordTransaction({
                companyId,
                accountId,
                type,
                amount,
                description,
                referenceType,
                referenceId,
                transactionDate: new Date(transactionDate),
            });
            await audit_service_1.default.logAction(companyId, userId, 'CREATE', 'LedgerTransaction', transaction.id, { type, amount });
            res.status(201).json(transaction);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async holdAmount(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { accountId, amount } = _req.body;
            await account_service_1.default.holdAmount(accountId, amount);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Account', accountId, { action: 'hold_amount', amount });
            res.json({ success: true, message: 'Amount held successfully' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async releaseHeldAmount(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { accountId, amount } = _req.body;
            await account_service_1.default.releaseHeldAmount(accountId, amount);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Account', accountId, { action: 'release_held_amount', amount });
            res.json({ success: true, message: 'Held amount released successfully' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAccountLedger(_req, res) {
        try {
            const { accountId } = _req.params;
            const limit = _req.query.limit ? parseInt(_req.query.limit) : 100;
            const ledger = await account_service_1.default.getAccountLedger(accountId, limit);
            res.json(ledger);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCompanyLedger(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const limit = _req.query.limit ? parseInt(_req.query.limit) : 100;
            const ledger = await account_service_1.default.getCompanyLedger(companyId, limit);
            res.json(ledger);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateAccountStatus(_req, res) {
        try {
            const { accountId } = _req.params;
            const { status } = _req.body;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const account = await account_service_1.default.updateAccountStatus(accountId, status);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Account', accountId, { status });
            res.json(account);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.AccountController = AccountController;
exports.default = new AccountController();
//# sourceMappingURL=account.controller.js.map