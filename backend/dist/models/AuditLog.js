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
class AuditLog extends sequelize_1.Model {
}
AuditLog.init({
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
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    action: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        // Values: CREATE, READ, UPDATE, DELETE, REVERSE, APPROVE, etc.
    },
    entityType: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        // Values: USER, CUSTOMER, LOAN, PAYMENT, DISBURSEMENT, etc.
    },
    entityId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    previousValues: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    newValues: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
});
// Associations
AuditLog.belongsTo(Company_1.default, { foreignKey: 'companyId' });
AuditLog.belongsTo(User_1.default, { foreignKey: 'userId' });
Company_1.default.hasMany(AuditLog, { foreignKey: 'companyId' });
exports.default = AuditLog;
//# sourceMappingURL=AuditLog.js.map