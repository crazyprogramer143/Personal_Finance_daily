import { Model, Optional } from 'sequelize';
interface LedgerTransactionAttributes {
    id: string;
    companyId: string;
    accountId: string;
    transactionDate: Date;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
    runningBalance: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface LedgerTransactionCreationAttributes extends Optional<LedgerTransactionAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class LedgerTransaction extends Model<LedgerTransactionAttributes, LedgerTransactionCreationAttributes> {
    id: string;
    companyId: string;
    accountId: string;
    transactionDate: Date;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
    runningBalance: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default LedgerTransaction;
//# sourceMappingURL=LedgerTransaction.d.ts.map