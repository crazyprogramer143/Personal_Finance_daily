"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Company_1 = __importDefault(require("./Company"));
const Customer_1 = __importDefault(require("./Customer"));
const LoanProduct_1 = __importDefault(require("./LoanProduct"));
class Loan extends sequelize_1.Model {
}
Loan.init({
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
    customerId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'id',
        },
    },
    loanProductId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: LoanProduct_1.default,
            key: 'id',
        },
    },
    principalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Total principal customer must repay',
    },
    heldAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Business capital held as collateral',
    },
    disbursedAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Actual cash given to customer (principal - held)',
    },
    totalScheduledRepayment: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Total customer must repay (with interest)',
    },
    durationDays: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    collectionFrequency: {
        type: sequelize_1.DataTypes.ENUM('daily', 'weekly', 'monthly'),
        allowNull: false,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'When collection starts',
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'When collection ends (scheduled)',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('draft', 'approved', 'active', 'closed'),
        allowNull: false,
        defaultValue: 'draft',
    },
    closureReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for early closure (if any)',
    },
    approvedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    disbursedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    closedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: 'loans',
    timestamps: true,
});
// Associations
Loan.belongsTo(Company_1.default, { foreignKey: 'companyId' });
Loan.belongsTo(Customer_1.default, { foreignKey: 'customerId' });
Loan.belongsTo(LoanProduct_1.default, { foreignKey: 'loanProductId' });
Company_1.default.hasMany(Loan, { foreignKey: 'companyId' });
exports.default = Loan;
//# sourceMappingURL=Loan.js.map