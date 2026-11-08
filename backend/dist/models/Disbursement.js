"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Loan_1 = __importDefault(require("./Loan"));
class Disbursement extends sequelize_1.Model {
}
Disbursement.init({
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
    principalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    heldAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    disbursedAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'principal - held',
    },
    disbursementDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    disbursementMethod: {
        type: sequelize_1.DataTypes.ENUM('cash', 'upi', 'bank_transfer'),
        allowNull: false,
    },
    referenceNumber: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'reversed'),
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
    tableName: 'disbursements',
    timestamps: true,
});
Disbursement.belongsTo(Loan_1.default, { foreignKey: 'loanId' });
Loan_1.default.hasMany(Disbursement, { foreignKey: 'loanId' });
exports.default = Disbursement;
//# sourceMappingURL=Disbursement.js.map