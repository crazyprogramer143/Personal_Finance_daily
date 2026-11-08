"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const uuid_1 = require("uuid");
const Company_1 = __importDefault(require("./Company"));
class User extends sequelize_1.Model {
}
User.init({
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
    username: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('accountant', 'collector'),
        allowNull: false,
        defaultValue: 'collector',
    },
}, {
    sequelize: connection_1.default,
    tableName: 'users',
    timestamps: true,
});
// Associations
User.belongsTo(Company_1.default, { foreignKey: 'companyId' });
Company_1.default.hasMany(User, { foreignKey: 'companyId' });
exports.default = User;
//# sourceMappingURL=User.js.map