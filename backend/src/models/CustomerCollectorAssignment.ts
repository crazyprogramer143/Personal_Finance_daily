import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Customer from './Customer';
import User from './User';
import Company from './Company';

interface CustomerCollectorAssignmentAttributes {
  id: string;
  customerId: string;
  collectorId: string;
  companyId: string;
  assignedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomerCollectorAssignmentCreationAttributes extends Optional<CustomerCollectorAssignmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CustomerCollectorAssignment extends Model<CustomerCollectorAssignmentAttributes, CustomerCollectorAssignmentCreationAttributes> {
  public id!: string;
  public customerId!: string;
  public collectorId!: string;
  public companyId!: string;
  public assignedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CustomerCollectorAssignment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Customer,
        key: 'id',
      },
    },
    collectorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Company,
        key: 'id',
      },
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'customer_collector_assignments',
    timestamps: true,
  }
);

CustomerCollectorAssignment.belongsTo(Customer, { foreignKey: 'customerId' });
CustomerCollectorAssignment.belongsTo(User, { foreignKey: 'collectorId' });
CustomerCollectorAssignment.belongsTo(Company, { foreignKey: 'companyId' });
Customer.hasMany(CustomerCollectorAssignment, { foreignKey: 'customerId' });

export default CustomerCollectorAssignment;
