import { Request, Response } from 'express';
import reportService from '../services/report.service';

export class ReportController {
  async getCollectionPerformanceReport(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const fromDate = new Date(_req.query.fromDate as string);
      const toDate = new Date(_req.query.toDate as string);

      const report = await reportService.getCollectionPerformanceReport(
        companyId,
        fromDate,
        toDate
      );
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCollectorComparisonReport(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const fromDate = new Date(_req.query.fromDate as string);
      const toDate = new Date(_req.query.toDate as string);

      const report = await reportService.getCollectorComparisonReport(
        companyId,
        fromDate,
        toDate
      );
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCustomerCollectionHistoryReport(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const report = await reportService.getCustomerCollectionHistoryReport(customerId);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLoanPortfolioReport(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const report = await reportService.getLoanPortfolioReport(companyId);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getOverdueAnalysisReport(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const report = await reportService.getOverdueAnalysisReport(companyId);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  async getDayBookReport(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const fromDate = new Date(_req.query.fromDate as string);
      const toDate = new Date(_req.query.toDate as string);

      const report = await reportService.getDayBookReport(companyId, fromDate, toDate);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new ReportController();
