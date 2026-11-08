import { Model, Optional } from 'sequelize';
interface AuditLogAttributes {
    id: string;
    companyId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    reason?: string;
    ipAddress?: string;
    createdAt?: Date;
}
interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'createdAt'> {
}
declare class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> {
    id: string;
    companyId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    reason?: string;
    ipAddress?: string;
    readonly createdAt: Date;
}
export default AuditLog;
//# sourceMappingURL=AuditLog.d.ts.map