"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Company_1 = __importDefault(require("./Company"));
const User_1 = __importDefault(require("./User"));
class DailyClosing extends sequelize_1.Model {
}
DailyClosing.init({
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
    closedBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    closingDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: 'Date for which the closing is done',
    },
    totalCashReceived: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
    },
    totalUpiReceived: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
    },
    totalBankTransfer: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
    },
    totalExpenses: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
    },
    netAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total received - total expenses',
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'draft',
    },
    approvedBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    approvedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: 'daily_closings',
    timestamps: true,
});
DailyClosing.belongsTo(Company_1.default, { foreignKey: 'companyId' });
DailyClosing.belongsTo(User_1.default, { foreignKey: 'closedBy' });
Company_1.default.hasMany(DailyClosing, { foreignKey: 'companyId' });
exports.default = DailyClosing;
//# sourceMappingURL=DailyClosing.js.map