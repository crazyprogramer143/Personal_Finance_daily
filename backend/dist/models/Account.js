"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Company_1 = __importDefault(require("./Company"));
class Account extends sequelize_1.Model {
}
Account.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    companyId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Company_1.default,
            key: 'id',
        },
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        comment: 'Account display name',
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('cash', 'bank', 'upi'),
        allowNull: false,
    },
    balance: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Available balance',
    },
    heldAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Amount held for collateral',
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'INR',
    },
    bankName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    accountNumber: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    upiId: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    sequelize: connection_1.default,
    tableName: 'accounts',
    timestamps: true,
});
Account.belongsTo(Company_1.default, { foreignKey: 'companyId' });
Company_1.default.hasMany(Account, { foreignKey: 'companyId' });
exports.default = Account;
//# sourceMappingURL=Account.js.map