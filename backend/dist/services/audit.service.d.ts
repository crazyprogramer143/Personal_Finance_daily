import AuditLog from '../models/AuditLog';
export declare class AuditService {
    logAction(companyId: string, userId: string, action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE', entityType: string, entityId: string, changes?: any, previousValues?: any): Promise<AuditLog>;
    getEntityAuditLog(companyId: string, entityType: string, entityId: string): Promise<AuditLog[]>;
    getUserAuditLog(companyId: string, userId: string, limit?: number): Promise<AuditLog[]>;
    getCompanyAuditLog(companyId: string, limit?: number): Promise<AuditLog[]>;
}
declare const _default: AuditService;
export default _default;
//# sourceMappingURL=audit.service.d.ts.map