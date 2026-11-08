import { Request, Response } from 'express';
export declare class ReportController {
    getCollectionPerformanceReport(_req: Request, res: Response): Promise<any>;
    getCollectorComparisonReport(_req: Request, res: Response): Promise<any>;
    getCustomerCollectionHistoryReport(_req: Request, res: Response): Promise<any>;
    getLoanPortfolioReport(_req: Request, res: Response): Promise<any>;
    getOverdueAnalysisReport(_req: Request, res: Response): Promise<any>;
}
declare const _default: ReportController;
export default _default;
//# sourceMappingURL=report.controller.d.ts.map