import { Request, Response } from 'express';
export declare class AccountController {
    createAccount(_req: Request, res: Response): Promise<any>;
    getCompanyAccounts(_req: Request, res: Response): Promise<any>;
    getAccountDetails(_req: Request, res: Response): Promise<any>;
    recordTransaction(_req: Request, res: Response): Promise<any>;
    holdAmount(_req: Request, res: Response): Promise<any>;
    releaseHeldAmount(_req: Request, res: Response): Promise<any>;
    getAccountLedger(_req: Request, res: Response): Promise<any>;
    getCompanyLedger(_req: Request, res: Response): Promise<any>;
    updateAccountStatus(_req: Request, res: Response): Promise<any>;
}
declare const _default: AccountController;
export default _default;
//# sourceMappingURL=account.controller.d.ts.map