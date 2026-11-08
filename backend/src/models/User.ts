import { DataTypes, Model, Optional, ForeignKey } from 'sequelize';
import sequelize from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import Company from './Company';

interface UserAttributes {
  id: string;
  companyId: string;
  username?: string | null;
  email?: string | null;
  passwordHash: string;
  role: 'accountant' | 'collector';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: string;
  public companyId!: string;
  public username!: string | null;
  public email!: string | null;
  public passwordHash!: string;
  public role!: 'accountant' | 'collector';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
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
    username: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: 'unique_username_per_company',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: 'unique_email_per_company',
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('accountant', 'collector'),
      allowNull: false,
      defaultValue: 'collector',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        name: 'unique_username_per_company',
        unique: true,
        fields: ['company_id', 'username'],
        where: {
          username: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
      {
        name: 'unique_email_per_company',
        unique: true,
        fields: ['company_id', 'email'],
        where: {
          email: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
    ],
  }
);

// Associations
User.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(User, { foreignKey: 'companyId' });

export default User;
