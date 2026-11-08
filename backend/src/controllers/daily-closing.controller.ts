import { Request, Response } from 'express';
import dailyClosingService from '../services/daily-closing.service';
import auditService from '../services/audit.service';

export class DailyClosingController {
  async createDailyClosing(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;
      const { closingDate, notes } = _req.body;

      const closing = await dailyClosingService.createDailyClosing(companyId, userId, {
        closingDate: new Date(closingDate),
        notes,
      });

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'DailyClosing',
        closing.id,
        { closingDate }
      );

      res.status(201).json(closing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async submitClosing(_req: Request, res: Response): Promise<any> {
    try {
      const { closingId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;

      const closing = await dailyClosingService.submitClosing(closingId);

      await auditService.logAction(companyId, userId, 'UPDATE', 'DailyClosing', closingId, {
        status: 'submitted',
      });

      res.json(closing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approveClosing(_req: Request, res: Response): Promise<any> {
    try {
      const { closingId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;

      const closing = await dailyClosingService.approveClosing(closingId, userId);

      await auditService.logAction(companyId, userId, 'UPDATE', 'DailyClosing', closingId, {
        status: 'approved',
      });

      res.json(closing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async rejectClosing(_req: Request, res: Response): Promise<any> {
    try {
      const { closingId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;

      const closing = await dailyClosingService.rejectClosing(closingId);

      await auditService.logAction(companyId, userId, 'UPDATE', 'DailyClosing', closingId, {
        status: 'rejected',
      });

      res.json(closing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCompanyClosings(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const limit = _req.query.limit ? parseInt(_req.query.limit as string) : 100;

      const closings = await dailyClosingService.getCompanyClosings(companyId, limit);
      res.json(closings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getClosingDetails(_req: Request, res: Response): Promise<any> {
    try {
      const { closingId } = _req.params;
      const details = await dailyClosingService.getClosingDetails(closingId);
      res.json(details);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new DailyClosingController();
