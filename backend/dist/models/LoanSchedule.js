"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Loan_1 = __importDefault(require("./Loan"));
class LoanSchedule extends sequelize_1.Model {
}
LoanSchedule.init({
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
    dueDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: 'When this installment is due',
    },
    scheduledAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Original scheduled amount',
    },
    amountAllocated: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Amount already paid towards this installment',
    },
    remainingDue: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Remaining amount due (scheduled - allocated)',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('upcoming', 'due', 'partially_paid', 'paid', 'overdue', 'waived'),
        allowNull: false,
        defaultValue: 'upcoming',
    },
    paidAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'When this installment was fully paid',
    },
}, {
    sequelize: connection_1.default,
    tableName: 'loan_schedules',
    timestamps: true,
});
// Associations
LoanSchedule.belongsTo(Loan_1.default, { foreignKey: 'loanId' });
Loan_1.default.hasMany(LoanSchedule, { foreignKey: 'loanId' });
exports.default = LoanSchedule;
//# sourceMappingURL=LoanSchedule.js.map