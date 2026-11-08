import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Company from './Company';
import User from './User';

interface ExpenseAttributes {
  id: string;
  companyId: string;
  userId: string;
  category: string;
  amount: number;
  description: string;
  expenseDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> {
  public id!: string;
  public companyId!: string;
  public userId!: string;
  public category!: string;
  public amount!: number;
  public description!: string;
  public expenseDate!: Date;
  public status!: 'pending' | 'approved' | 'rejected';
  public approvedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Expense.init(
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      comment: 'Who created this expense',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Travel, Rent, Salary, etc.',
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expenseDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'expenses',
    timestamps: true,
  }
);

Expense.belongsTo(Company, { foreignKey: 'companyId' });
Expense.belongsTo(User, { foreignKey: 'userId' });
Company.hasMany(Expense, { foreignKey: 'companyId' });

export default Expense;
