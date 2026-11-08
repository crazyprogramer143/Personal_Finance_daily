"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Customer_1 = __importDefault(require("./Customer"));
const User_1 = __importDefault(require("./User"));
const Company_1 = __importDefault(require("./Company"));
class CustomerCollectorAssignment extends sequelize_1.Model {
}
CustomerCollectorAssignment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    },
    customerId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Customer_1.default,
            key: 'id',
        },
    },
    collectorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    companyId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Company_1.default,
            key: 'id',
        },
    },
    assignedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: 'customer_collector_assignments',
    timestamps: true,
});
CustomerCollectorAssignment.belongsTo(Customer_1.default, { foreignKey: 'customerId' });
CustomerCollectorAssignment.belongsTo(User_1.default, { foreignKey: 'collectorId' });
CustomerCollectorAssignment.belongsTo(Company_1.default, { foreignKey: 'companyId' });
Customer_1.default.hasMany(CustomerCollectorAssignment, { foreignKey: 'customerId' });
exports.default = CustomerCollectorAssignment;
//# sourceMappingURL=CustomerCollectorAssignment.js.map