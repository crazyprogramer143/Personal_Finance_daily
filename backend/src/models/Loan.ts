import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Company from './Company';
import Customer from './Customer';
import LoanProduct from './LoanProduct';

interface LoanAttributes {
  id: string;
  companyId: string;
  customerId: string;
  loanProductId: string;
  principalAmount: number;
  heldAmount: number;
  disbursedAmount: number;
  totalScheduledRepayment: number;
  durationDays: number;
  collectionFrequency: 'daily' | 'weekly' | 'monthly';
  startDate?: Date;
  endDate?: Date;
  status: 'draft' | 'approved' | 'active' | 'closed';
  closureReason?: string;
  approvedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LoanCreationAttributes extends Optional<LoanAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Loan extends Model<LoanAttributes, LoanCreationAttributes> {
  public id!: string;
  public companyId!: string;
  public customerId!: string;
  public loanProductId!: string;
  public principalAmount!: number;
  public heldAmount!: number;
  public disbursedAmount!: number;
  public totalScheduledRepayment!: number;
  public durationDays!: number;
  public collectionFrequency!: 'daily' | 'weekly' | 'monthly';
  public startDate?: Date;
  public endDate?: Date;
  public status!: 'draft' | 'approved' | 'active' | 'closed';
  public closureReason?: string;
  public approvedAt?: Date;
  public disbursedAt?: Date;
  public closedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Loan.init(
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
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    loanProductId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: LoanProduct,
        key: 'id',
      },
    },
    principalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Total principal customer must repay',
    },
    heldAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Business capital held as collateral',
    },
    disbursedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Actual cash given to customer (principal - held)',
    },
    totalScheduledRepayment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Total customer must repay (with interest)',
    },
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    collectionFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When collection starts',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When collection ends (scheduled)',
    },
    status: {
      type: DataTypes.ENUM('draft', 'approved', 'active', 'closed'),
      allowNull: false,
      defaultValue: 'draft',
    },
    closureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for early closure (if any)',
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    disbursedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'loans',
    timestamps: true,
  }
);

// Associations
Loan.belongsTo(Company, { foreignKey: 'companyId' });
Loan.belongsTo(Customer, { foreignKey: 'customerId' });
Loan.belongsTo(LoanProduct, { foreignKey: 'loanProductId' });
Company.hasMany(Loan, { foreignKey: 'companyId' });

export default Loan;
