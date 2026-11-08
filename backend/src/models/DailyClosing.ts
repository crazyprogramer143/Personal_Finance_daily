import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Company from './Company';
import User from './User';

interface DailyClosingAttributes {
  id: string;
  companyId: string;
  closedBy: string;
  closingDate: Date;
  totalCashReceived: number;
  totalUpiReceived: number;
  totalBankTransfer: number;
  totalExpenses: number;
  netAmount: number;
  notes?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DailyClosingCreationAttributes extends Optional<DailyClosingAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class DailyClosing extends Model<DailyClosingAttributes, DailyClosingCreationAttributes> {
  public id!: string;
  public companyId!: string;
  public closedBy!: string;
  public closingDate!: Date;
  public totalCashReceived!: number;
  public totalUpiReceived!: number;
  public totalBankTransfer!: number;
  public totalExpenses!: number;
  public netAmount!: number;
  public notes?: string;
  public status!: 'draft' | 'submitted' | 'approved' | 'rejected';
  public approvedBy?: string;
  public approvedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DailyClosing.init(
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
    closedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    closingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Date for which the closing is done',
    },
    totalCashReceived: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalUpiReceived: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalBankTransfer: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalExpenses: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    netAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Total received - total expenses',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'draft',
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'daily_closings',
    timestamps: true,
  }
);

DailyClosing.belongsTo(Company, { foreignKey: 'companyId' });
DailyClosing.belongsTo(User, { foreignKey: 'closedBy' });
Company.hasMany(DailyClosing, { foreignKey: 'companyId' });

export default DailyClosing;
