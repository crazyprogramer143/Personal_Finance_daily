import AuditLog from '../models/AuditLog';

export class AuditService {
  async logAction(
    companyId: string,
    userId: string,
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    entityType: string,
    entityId: string,
    changes?: any,
    previousValues?: any
  ): Promise<AuditLog> {
    return AuditLog.create({
      companyId,
      userId,
      action,
      entityType,
      entityId,
      newValues: changes,
      previousValues,
    });
  }

  async getEntityAuditLog(companyId: string, entityType: string, entityId: string): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: { companyId, entityType, entityId },
      order: [['createdAt', 'DESC']],
    });
  }

  async getUserAuditLog(companyId: string, userId: string, limit: number = 100): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: { companyId, userId },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  async getCompanyAuditLog(companyId: string, limit: number = 100): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: { companyId },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}

export default new AuditService();
