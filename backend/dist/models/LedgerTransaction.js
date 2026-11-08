"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Company_1 = __importDefault(require("./Company"));
const Account_1 = __importDefault(require("./Account"));
class LedgerTransaction extends sequelize_1.Model {
}
LedgerTransaction.init({
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
    accountId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Account_1.default,
            key: 'id',
        },
    },
    transactionDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('credit', 'debit'),
        allowNull: false,
        comment: 'credit = money in, debit = money out',
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    referenceType: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        comment: 'payment, disbursement, expense, etc.',
    },
    referenceId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        comment: 'ID of the referenced entity (paymentId, disbursementId, expenseId, etc.)',
    },
    runningBalance: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Balance in account after this transaction',
    },
}, {
    sequelize: connection_1.default,
    tableName: 'ledger_transactions',
    timestamps: true,
});
LedgerTransaction.belongsTo(Company_1.default, { foreignKey: 'companyId' });
LedgerTransaction.belongsTo(Account_1.default, { foreignKey: 'accountId' });
Company_1.default.hasMany(LedgerTransaction, { foreignKey: 'companyId' });
Account_1.default.hasMany(LedgerTransaction, { foreignKey: 'accountId' });
exports.default = LedgerTransaction;
//# sourceMappingURL=LedgerTransaction.js.map