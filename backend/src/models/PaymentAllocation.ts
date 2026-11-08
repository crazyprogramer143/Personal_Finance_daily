import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Payment from './Payment';
import LoanSchedule from './LoanSchedule';

interface PaymentAllocationAttributes {
  id: string;
  paymentId: string;
  scheduleId: string;
  amountAllocated: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentAllocationCreationAttributes extends Optional<PaymentAllocationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PaymentAllocation extends Model<PaymentAllocationAttributes, PaymentAllocationCreationAttributes> {
  public id!: string;
  public paymentId!: string;
  public scheduleId!: string;
  public amountAllocated!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentAllocation.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Payment,
        key: 'id',
      },
    },
    scheduleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: LoanSchedule,
        key: 'id',
      },
    },
    amountAllocated: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Amount from this payment allocated to this installment',
    },
  },
  {
    sequelize,
    tableName: 'payment_allocations',
    timestamps: true,
  }
);

PaymentAllocation.belongsTo(Payment, { foreignKey: 'paymentId' });
PaymentAllocation.belongsTo(LoanSchedule, { foreignKey: 'scheduleId' });
Payment.hasMany(PaymentAllocation, { foreignKey: 'paymentId' });

export default PaymentAllocation;
