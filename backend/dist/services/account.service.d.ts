import Account from '../models/Account';
import LedgerTransaction from '../models/LedgerTransaction';
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
export declare class AccountService {
    createAccount(data: CreateAccountRequest): Promise<Account>;
    getCompanyAccounts(companyId: string): Promise<Account[]>;
    getAccountDetails(accountId: string): Promise<Account | null>;
    recordTransaction(data: TransactionRequest): Promise<LedgerTransaction>;
    holdAmount(accountId: string, amount: number): Promise<void>;
    releaseHeldAmount(accountId: string, amount: number): Promise<void>;
    getAccountLedger(accountId: string, limit?: number): Promise<LedgerTransaction[]>;
    getCompanyLedger(companyId: string, limit?: number): Promise<LedgerTransaction[]>;
    updateAccountStatus(accountId: string, status: 'active' | 'inactive'): Promise<Account>;
}
declare const _default: AccountService;
export default _default;
//# sourceMappingURL=account.service.d.ts.map