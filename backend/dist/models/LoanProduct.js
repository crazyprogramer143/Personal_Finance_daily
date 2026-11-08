"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Company_1 = __importDefault(require("./Company"));
class LoanProduct extends sequelize_1.Model {
}
LoanProduct.init({
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
    },
    interestRatePercent: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Interest rate as percentage (e.g., 15.50 for 15.5%)',
    },
    totalRepaymentAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Total repayment for reference (principal + interest)',
    },
    minPrincipal: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    maxPrincipal: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    durationDays: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: 'Total collection days for this product',
    },
    collectionFrequency: {
        type: sequelize_1.DataTypes.ENUM('daily', 'weekly', 'monthly'),
        allowNull: false,
        defaultValue: 'daily',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: 'loan_products',
    timestamps: true,
});
// Associations
LoanProduct.belongsTo(Company_1.default, { foreignKey: 'companyId' });
Company_1.default.hasMany(LoanProduct, { foreignKey: 'companyId' });
exports.default = LoanProduct;
//# sourceMappingURL=LoanProduct.js.map