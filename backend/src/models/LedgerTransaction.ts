import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Company from './Company';
import Account from './Account';

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

interface LedgerTransactionCreationAttributes extends Optional<LedgerTransactionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class LedgerTransaction extends Model<LedgerTransactionAttributes, LedgerTransactionCreationAttributes> {
  public id!: string;
  public companyId!: string;
  public accountId!: string;
  public transactionDate!: Date;
  public type!: 'credit' | 'debit';
  public amount!: number;
  public description!: string;
  public referenceType?: string;
  public referenceId?: string;
  public runningBalance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LedgerTransaction.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Company,
        key: 'id',
      },
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Account,
        key: 'id',
      },
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('credit', 'debit'),
      allowNull: false,
      comment: 'credit = money in, debit = money out',
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    referenceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'payment, disbursement, expense, etc.',
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the referenced entity (paymentId, disbursementId, expenseId, etc.)',
    },
    runningBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Balance in account after this transaction',
    },
  },
  {
    sequelize,
    tableName: 'ledger_transactions',
    timestamps: true,
  }
);

LedgerTransaction.belongsTo(Company, { foreignKey: 'companyId' });
LedgerTransaction.belongsTo(Account, { foreignKey: 'accountId' });
Company.hasMany(LedgerTransaction, { foreignKey: 'companyId' });
Account.hasMany(LedgerTransaction, { foreignKey: 'accountId' });

export default LedgerTransaction;
