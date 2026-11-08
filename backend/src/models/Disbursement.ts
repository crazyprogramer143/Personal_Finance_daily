import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Loan from './Loan';

interface DisbursementAttributes {
  id: string;
  loanId: string;
  principalAmount: number;
  heldAmount: number;
  disbursedAmount: number;
  disbursementDate: Date;
  disbursementMethod: 'cash' | 'upi' | 'bank_transfer';
  referenceNumber?: string;
  status: 'pending' | 'completed' | 'reversed';
  reversedAt?: Date;
  reversalReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DisbursementCreationAttributes extends Optional<DisbursementAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Disbursement extends Model<DisbursementAttributes, DisbursementCreationAttributes> {
  public id!: string;
  public loanId!: string;
  public principalAmount!: number;
  public heldAmount!: number;
  public disbursedAmount!: number;
  public disbursementDate!: Date;
  public disbursementMethod!: 'cash' | 'upi' | 'bank_transfer';
  public referenceNumber?: string;
  public status!: 'pending' | 'completed' | 'reversed';
  public reversedAt?: Date;
  public reversalReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Disbursement.init(
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
    principalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    heldAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    disbursedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'principal - held',
    },
    disbursementDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    disbursementMethod: {
      type: DataTypes.ENUM('cash', 'upi', 'bank_transfer'),
      allowNull: false,
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'reversed'),
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
    tableName: 'disbursements',
    timestamps: true,
  }
);

Disbursement.belongsTo(Loan, { foreignKey: 'loanId' });
Loan.hasMany(Disbursement, { foreignKey: 'loanId' });

export default Disbursement;
