import { Request, Response } from 'express';
export declare class LoanController {
    createLoan(_req: Request, res: Response): Promise<any>;
    approveLoan(_req: Request, res: Response): Promise<any>;
    disburseLoan(_req: Request, res: Response): Promise<any>;
    getLoanDetails(_req: Request, res: Response): Promise<any>;
    getCustomerLoans(_req: Request, res: Response): Promise<any>;
    closeLoan(_req: Request, res: Response): Promise<any>;
}
declare const _default: LoanController;
export default _default;
//# sourceMappingURL=loan.controller.d.ts.map