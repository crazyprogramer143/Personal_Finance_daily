import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Company from './Company';

interface AccountAttributes {
  id: string;
  companyId: string;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  balance: number;
  heldAmount: number;
  currency: string;
  bankName?: string;
  accountNumber?: string;
  upiId?: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

interface AccountCreationAttributes extends Optional<AccountAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Account extends Model<AccountAttributes, AccountCreationAttributes> {
  public id!: string;
  public companyId!: string;
  public name!: string;
  public type!: 'cash' | 'bank' | 'upi';
  public balance!: number;
  public heldAmount!: number;
  public currency!: string;
  public bankName?: string;
  public accountNumber?: string;
  public upiId?: string;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Account.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Account display name',
    },
    type: {
      type: DataTypes.ENUM('cash', 'bank', 'upi'),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Available balance',
    },
    heldAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount held for collateral',
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'INR',
    },
    bankName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    accountNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    upiId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'accounts',
    timestamps: true,
  }
);

Account.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(Account, { foreignKey: 'companyId' });

export default Account;
