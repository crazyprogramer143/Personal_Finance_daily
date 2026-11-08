import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Loan from './Loan';

interface LoanScheduleAttributes {
  id: string;
  loanId: string;
  dueDate: Date;
  scheduledAmount: number;
  amountAllocated: number;
  remainingDue: number;
  status: 'upcoming' | 'due' | 'partially_paid' | 'paid' | 'overdue' | 'waived';
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LoanScheduleCreationAttributes extends Optional<LoanScheduleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class LoanSchedule extends Model<LoanScheduleAttributes, LoanScheduleCreationAttributes> {
  public id!: string;
  public loanId!: string;
  public dueDate!: Date;
  public scheduledAmount!: number;
  public amountAllocated!: number;
  public remainingDue!: number;
  public status!: 'upcoming' | 'due' | 'partially_paid' | 'paid' | 'overdue' | 'waived';
  public paidAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LoanSchedule.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    loanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Loan,
        key: 'id',
      },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When this installment is due',
    },
    scheduledAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Original scheduled amount',
    },
    amountAllocated: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount already paid towards this installment',
    },
    remainingDue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Remaining amount due (scheduled - allocated)',
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'due', 'partially_paid', 'paid', 'overdue', 'waived'),
      allowNull: false,
      defaultValue: 'upcoming',
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When this installment was fully paid',
    },
  },
  {
    sequelize,
    tableName: 'loan_schedules',
    timestamps: true,
  }
);

// Associations
LoanSchedule.belongsTo(Loan, { foreignKey: 'loanId' });
Loan.hasMany(LoanSchedule, { foreignKey: 'loanId' });

export default LoanSchedule;
