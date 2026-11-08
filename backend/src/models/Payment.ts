import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Loan from './Loan';
import User from './User';

interface PaymentAttributes {
  id: string;
  loanId: string;
  collectorId?: string;
  amountReceived: number;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer';
  referenceNumber?: string;
  paymentDate: Date;
  status: 'completed' | 'reversed';
  reversedAt?: Date;
  reversalReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> {
  public id!: string;
  public loanId!: string;
  public collectorId?: string;
  public amountReceived!: number;
  public paymentMethod!: 'cash' | 'upi' | 'bank_transfer';
  public referenceNumber?: string;
  public paymentDate!: Date;
  public status!: 'completed' | 'reversed';
  public reversedAt?: Date;
  public reversalReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
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
    collectorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
      comment: 'Who collected this payment',
    },
    amountReceived: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'upi', 'bank_transfer'),
      allowNull: false,
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('completed', 'reversed'),
      allowNull: false,
      defaultValue: 'completed',
    },
    reversedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reversalReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: true,
  }
);

Payment.belongsTo(Loan, { foreignKey: 'loanId' });
Payment.belongsTo(User, { foreignKey: 'collectorId' });
Loan.hasMany(Payment, { foreignKey: 'loanId' });

export default Payment;
