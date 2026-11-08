import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Company from './Company';

interface LoanProductAttributes {
  id: string;
  companyId: string;
  name: string;
  interestRatePercent?: number;
  totalRepaymentAmount?: number;
  minPrincipal?: number;
  maxPrincipal?: number;
  durationDays: number;
  collectionFrequency: 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LoanProductCreationAttributes extends Optional<LoanProductAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class LoanProduct extends Model<LoanProductAttributes, LoanProductCreationAttributes> {
  public id!: string;
  public companyId!: string;
  public name!: string;
  public interestRatePercent?: number;
  public totalRepaymentAmount?: number;
  public minPrincipal?: number;
  public maxPrincipal?: number;
  public durationDays!: number;
  public collectionFrequency!: 'daily' | 'weekly' | 'monthly';
  public status!: 'active' | 'inactive';
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LoanProduct.init(
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
    },
    interestRatePercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Interest rate as percentage (e.g., 15.50 for 15.5%)',
    },
    totalRepaymentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Total repayment for reference (principal + interest)',
    },
    minPrincipal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    maxPrincipal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Total collection days for this product',
    },
    collectionFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
      allowNull: false,
      defaultValue: 'daily',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'loan_products',
    timestamps: true,
  }
);

// Associations
LoanProduct.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(LoanProduct, { foreignKey: 'companyId' });

export default LoanProduct;
