"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Loan_1 = __importDefault(require("./Loan"));
const User_1 = __importDefault(require("./User"));
class Payment extends sequelize_1.Model {
}
Payment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    loanId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Loan_1.default,
            key: 'id',
        },
    },
    collectorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: User_1.default,
            key: 'id',
        },
        comment: 'Who collected this payment',
    },
    amountReceived: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.ENUM('cash', 'upi', 'bank_transfer'),
        allowNull: false,
    },
    referenceNumber: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    paymentDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('completed', 'reversed'),
        allowNull: false,
        defaultValue: 'completed',
    },
    reversedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    reversalReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: 'payments',
    timestamps: true,
});
Payment.belongsTo(Loan_1.default, { foreignKey: 'loanId' });
Payment.belongsTo(User_1.default, { foreignKey: 'collectorId' });
Loan_1.default.hasMany(Payment, { foreignKey: 'loanId' });
exports.default = Payment;
//# sourceMappingURL=Payment.js.map