"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Payment_1 = __importDefault(require("./Payment"));
const LoanSchedule_1 = __importDefault(require("./LoanSchedule"));
class PaymentAllocation extends sequelize_1.Model {
}
PaymentAllocation.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    paymentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Payment_1.default,
            key: 'id',
        },
    },
    scheduleId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: LoanSchedule_1.default,
            key: 'id',
        },
    },
    amountAllocated: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Amount from this payment allocated to this installment',
    },
}, {
    sequelize: connection_1.default,
    tableName: 'payment_allocations',
    timestamps: true,
});
PaymentAllocation.belongsTo(Payment_1.default, { foreignKey: 'paymentId' });
PaymentAllocation.belongsTo(LoanSchedule_1.default, { foreignKey: 'scheduleId' });
Payment_1.default.hasMany(PaymentAllocation, { foreignKey: 'paymentId' });
exports.default = PaymentAllocation;
//# sourceMappingURL=PaymentAllocation.js.map