import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Company from './Company';

interface CustomerAttributes {
  id: string;
  companyId: string;
  code: string;
  name: string;
  shopName?: string;
  businessType?: string;
  mobileNumber?: string;
  address?: string;
  language?: 'en' | 'ta';
  status: 'active' | 'inactive' | 'blocked';
  verificationStatus?: 'unverified' | 'verified';
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> {
  public id!: string;
  public companyId!: string;
  public code!: string;
  public name!: string;
  public shopName?: string;
  public businessType?: string;
  public mobileNumber?: string;
  public address?: string;
  public language?: 'en' | 'ta';
  public status!: 'active' | 'inactive' | 'blocked';
  public verificationStatus?: 'unverified' | 'verified';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Customer.init(
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
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Unique customer code per company (e.g., C001)',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Customer name in their preferred language',
    },
    shopName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Shop/business name',
    },
    businessType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    mobileNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Shop/business address',
    },
    language: {
      type: DataTypes.ENUM('en', 'ta'),
      allowNull: true,
      defaultValue: 'en',
      comment: 'Preferred language for reports/receipts',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blocked'),
      allowNull: false,
      defaultValue: 'active',
    },
    verificationStatus: {
      type: DataTypes.ENUM('unverified', 'verified'),
      allowNull: true,
      defaultValue: 'unverified',
    },
  },
  {
    sequelize,
    tableName: 'customers',
    timestamps: true,
  }
);

// Associations
Customer.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(Customer, { foreignKey: 'companyId' });

export default Customer;
