"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Company_1 = __importDefault(require("./Company"));
class Customer extends sequelize_1.Model {
}
Customer.init({
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
    code: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        comment: 'Unique customer code per company (e.g., C001)',
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        comment: 'Customer name in their preferred language',
    },
    shopName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: 'Shop/business name',
    },
    businessType: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    mobileNumber: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Shop/business address',
    },
    language: {
        type: sequelize_1.DataTypes.ENUM('en', 'ta'),
        allowNull: true,
        defaultValue: 'en',
        comment: 'Preferred language for reports/receipts',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'blocked'),
        allowNull: false,
        defaultValue: 'active',
    },
    verificationStatus: {
        type: sequelize_1.DataTypes.ENUM('unverified', 'verified'),
        allowNull: true,
        defaultValue: 'unverified',
    },
}, {
    sequelize: connection_1.default,
    tableName: 'customers',
    timestamps: true,
});
// Associations
Customer.belongsTo(Company_1.default, { foreignKey: 'companyId' });
Company_1.default.hasMany(Customer, { foreignKey: 'companyId' });
exports.default = Customer;
//# sourceMappingURL=Customer.js.map