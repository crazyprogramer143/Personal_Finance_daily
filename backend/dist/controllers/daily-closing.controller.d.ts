import { Request, Response } from 'express';
export declare class DailyClosingController {
    createDailyClosing(_req: Request, res: Response): Promise<any>;
    submitClosing(_req: Request, res: Response): Promise<any>;
    approveClosing(_req: Request, res: Response): Promise<any>;
    rejectClosing(_req: Request, res: Response): Promise<any>;
    getCompanyClosings(_req: Request, res: Response): Promise<any>;
    getClosingDetails(_req: Request, res: Response): Promise<any>;
}
declare const _default: DailyClosingController;
export default _default;
//# sourceMappingURL=daily-closing.controller.d.ts.map