"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const Account_1 = __importDefault(require("../models/Account"));
const LedgerTransaction_1 = __importDefault(require("../models/LedgerTransaction"));
const connection_1 = require("../database/connection");
class AccountService {
    async createAccount(data) {
        const account = await Account_1.default.create({
            companyId: data.companyId,
            name: data.name,
            type: data.type,
            currency: data.currency || 'INR',
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            upiId: data.upiId,
            balance: 0,
            heldAmount: 0,
            status: 'active',
        });
        return account;
    }
    async getCompanyAccounts(companyId) {
        return Account_1.default.findAll({
            where: { companyId },
            order: [['name', 'ASC']],
        });
    }
    async getAccountDetails(accountId) {
        return Account_1.default.findByPk(accountId);
    }
    async recordTransaction(data) {
        return connection_1.sequelize.transaction(async (transaction) => {
            const account = await Account_1.default.findByPk(data.accountId);
            if (!account) {
                throw new Error('Account not found');
            }
            let newBalance = Number(account.balance);
            if (data.type === 'credit') {
                newBalance += data.amount;
            }
            else {
                if (newBalance < data.amount) {
                    throw new Error('Insufficient balance');
                }
                newBalance -= data.amount;
            }
            await account.update({ balance: newBalance }, { transaction });
            const ledgerTransaction = await LedgerTransaction_1.default.create({
                companyId: data.companyId,
                accountId: data.accountId,
                transactionDate: data.transactionDate,
                type: data.type,
                amount: data.amount,
                description: data.description,
                referenceType: data.referenceType,
                referenceId: data.referenceId,
                runningBalance: newBalance,
            }, { transaction });
            return ledgerTransaction;
        });
    }
    async holdAmount(accountId, amount) {
        const account = await Account_1.default.findByPk(accountId);
        if (!account) {
            throw new Error('Account not found');
        }
        const availableBalance = Number(account.balance) - Number(account.heldAmount);
        if (availableBalance < amount) {
            throw new Error('Insufficient available balance to hold');
        }
        await account.update({
            heldAmount: Number(account.heldAmount) + amount,
        });
    }
    async releaseHeldAmount(accountId, amount) {
        const account = await Account_1.default.findByPk(accountId);
        if (!account) {
            throw new Error('Account not found');
        }
        if (Number(account.heldAmount) < amount) {
            throw new Error('Cannot release more than held amount');
        }
        await account.update({
            heldAmount: Number(account.heldAmount) - amount,
        });
    }
    async getAccountLedger(accountId, limit = 100) {
        return LedgerTransaction_1.default.findAll({
            where: { accountId },
            order: [['transactionDate', 'DESC']],
            limit,
        });
    }
    async getCompanyLedger(companyId, limit = 100) {
        return LedgerTransaction_1.default.findAll({
            where: { companyId },
            order: [['transactionDate', 'DESC']],
            limit,
        });
    }
    async updateAccountStatus(accountId, status) {
        const account = await Account_1.default.findByPk(accountId);
        if (!account) {
            throw new Error('Account not found');
        }
        await account.update({ status });
        return account;
    }
}
exports.AccountService = AccountService;
exports.default = new AccountService();
//# sourceMappingURL=account.service.js.map