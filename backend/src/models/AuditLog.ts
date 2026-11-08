import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Company from './Company';
import User from './User';

interface AuditLogAttributes {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  createdAt?: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'createdAt'> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> {
  public id!: string;
  public companyId!: string;
  public userId!: string;
  public action!: string;
  public entityType!: string;
  public entityId!: string;
  public previousValues?: Record<string, any>;
  public newValues?: Record<string, any>;
  public reason?: string;
  public ipAddress?: string;
  public readonly createdAt!: Date;
}

AuditLog.init(
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
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // Values: CREATE, READ, UPDATE, DELETE, REVERSE, APPROVE, etc.
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // Values: USER, CUSTOMER, LOAN, PAYMENT, DISBURSEMENT, etc.
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    previousValues: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    newValues: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['company_id'] },
      { fields: ['user_id'] },
      { fields: ['entity_type', 'entity_id'] },
      { fields: ['created_at'] },
    ],
  }
);

// Associations
AuditLog.belongsTo(Company, { foreignKey: 'companyId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });
Company.hasMany(AuditLog, { foreignKey: 'companyId' });

export default AuditLog;
