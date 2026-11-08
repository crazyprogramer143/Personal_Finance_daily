import { Request, Response } from 'express';
import collectionService from '../services/collection.service';
import auditService from '../services/audit.service';

export class CollectionController {
  async getDueSchedules(_req: Request, res: Response): Promise<any> {
    try {
      const userId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;
      const role = (_req as any).user.role;
      const date = _req.query.date ? new Date(_req.query.date as string) : undefined;

      let assignedCustomerIds: string[] | undefined;
      if (role === 'collector') {
        assignedCustomerIds = await collectionService.getAssignedCustomerIds(userId, companyId);
      }

      const schedules = await collectionService.getDueSchedules(userId, companyId, date, role, assignedCustomerIds);
      res.json(schedules);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCustomerDueLoans(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const loans = await collectionService.getCustomerDueLoans(customerId);
      res.json(loans);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCollectionStats(_req: Request, res: Response): Promise<any> {
    try {
      const collectorId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;
      const date = _req.query.date ? new Date(_req.query.date as string) : undefined;

      const stats = await collectionService.getCollectionStats(collectorId, companyId, date);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCollectorPerformance(_req: Request, res: Response): Promise<any> {
    try {
      const collectorId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;
      const fromDate = new Date(_req.query.fromDate as string);
      const toDate = new Date(_req.query.toDate as string);

      const performance = await collectionService.getCollectorPerformance(
        collectorId,
        companyId,
        fromDate,
        toDate
      );
      res.json(performance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async waiverInstallment(_req: Request, res: Response): Promise<any> {
    try {
      const { scheduleId } = _req.params;
      const { reason } = _req.body;
      const userId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;

      const schedule = await collectionService.waiverInstallment(scheduleId, reason, userId);

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'LoanSchedule',
        scheduleId,
        { status: 'waived', reason }
      );

      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async skipInstallment(_req: Request, res: Response): Promise<any> {
    try {
      const { scheduleId } = _req.params;
      const { reason } = _req.body;
      const userId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;

      const result = await collectionService.skipInstallment(scheduleId, reason, userId);

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'LoanSchedule',
        scheduleId,
        { status: 'skipped', reason }
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async applyGracePeriod(_req: Request, res: Response): Promise<any> {
    try {
      const { scheduleId } = _req.params;
      const { graceDays, reason } = _req.body;
      const userId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;

      const schedule = await collectionService.applyGracePeriod(scheduleId, graceDays, reason);

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'LoanSchedule',
        scheduleId,
        { graceDaysAdded: graceDays, reason }
      );

      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getOverdueStats(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const stats = await collectionService.getOverdueStats(companyId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCollectorAssignments(_req: Request, res: Response): Promise<any> {
    try {
      const collectorId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;

      const customers = await collectionService.getCollectorAssignments(collectorId, companyId);
      res.json(customers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CollectionController();
