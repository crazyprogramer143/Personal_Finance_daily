import { Request, Response } from 'express';
export declare class CollectionController {
    getDueSchedules(_req: Request, res: Response): Promise<any>;
    getCustomerDueLoans(_req: Request, res: Response): Promise<any>;
    getCollectionStats(_req: Request, res: Response): Promise<any>;
    getCollectorPerformance(_req: Request, res: Response): Promise<any>;
    waiverInstallment(_req: Request, res: Response): Promise<any>;
    applyGracePeriod(_req: Request, res: Response): Promise<any>;
    getOverdueStats(_req: Request, res: Response): Promise<any>;
    getCollectorAssignments(_req: Request, res: Response): Promise<any>;
}
declare const _default: CollectionController;
export default _default;
//# sourceMappingURL=collection.controller.d.ts.map