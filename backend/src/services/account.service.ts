import Account from '../models/Account';
import LedgerTransaction from '../models/LedgerTransaction';
import { sequelize } from '../database/connection';

interface CreateAccountRequest {
  companyId: string;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  currency?: string;
  bankName?: string;
  accountNumber?: string;
  upiId?: string;
}

interface TransactionRequest {
  companyId: string;
  accountId: string;
  transactionDate: Date;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
}

export class AccountService {
  async createAccount(data: CreateAccountRequest): Promise<Account> {
    const account = await Account.create({
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

  async getCompanyAccounts(companyId: string): Promise<Account[]> {
    return Account.findAll({
      where: { companyId },
      order: [['name', 'ASC']],
    });
  }

  async getAccountDetails(accountId: string): Promise<Account | null> {
    return Account.findByPk(accountId);
  }

  async recordTransaction(data: TransactionRequest): Promise<LedgerTransaction> {
    return sequelize.transaction(async (transaction) => {
      const account = await Account.findByPk(data.accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      let newBalance = Number(account.balance);
      if (data.type === 'credit') {
        newBalance += data.amount;
      } else {
        if (newBalance < data.amount) {
          throw new Error('Insufficient balance');
        }
        newBalance -= data.amount;
      }

      await account.update({ balance: newBalance }, { transaction });

      const ledgerTransaction = await LedgerTransaction.create(
        {
          companyId: data.companyId,
          accountId: data.accountId,
          transactionDate: data.transactionDate,
          type: data.type,
          amount: data.amount,
          description: data.description,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          runningBalance: newBalance,
        },
        { transaction }
      );

      return ledgerTransaction;
    });
  }

  async holdAmount(accountId: string, amount: number): Promise<void> {
    const account = await Account.findByPk(accountId);
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

  async releaseHeldAmount(accountId: string, amount: number): Promise<void> {
    const account = await Account.findByPk(accountId);
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

  async getAccountLedger(accountId: string, limit: number = 100): Promise<LedgerTransaction[]> {
    return LedgerTransaction.findAll({
      where: { accountId },
      order: [['transactionDate', 'DESC']],
      limit,
    });
  }

  async getCompanyLedger(companyId: string, limit: number = 100): Promise<LedgerTransaction[]> {
    return LedgerTransaction.findAll({
      where: { companyId },
      order: [['transactionDate', 'DESC']],
      limit,
    });
  }

  async updateAccountStatus(accountId: string, status: 'active' | 'inactive'): Promise<Account> {
    const account = await Account.findByPk(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    await account.update({ status });
    return account;
  }
}

export default new AccountService();
