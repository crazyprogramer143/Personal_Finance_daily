"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
class AuditService {
    async logAction(companyId, userId, action, entityType, entityId, changes, previousValues) {
        return AuditLog_1.default.create({
            companyId,
            userId,
            action,
            entityType,
            entityId,
            newValues: changes,
            previousValues,
        });
    }
    async getEntityAuditLog(companyId, entityType, entityId) {
        return AuditLog_1.default.findAll({
            where: { companyId, entityType, entityId },
            order: [['createdAt', 'DESC']],
        });
    }
    async getUserAuditLog(companyId, userId, limit = 100) {
        return AuditLog_1.default.findAll({
            where: { companyId, userId },
            order: [['createdAt', 'DESC']],
            limit,
        });
    }
    async getCompanyAuditLog(companyId, limit = 100) {
        return AuditLog_1.default.findAll({
            where: { companyId },
            order: [['createdAt', 'DESC']],
            limit,
        });
    }
}
exports.AuditService = AuditService;
exports.default = new AuditService();
//# sourceMappingURL=audit.service.js.map