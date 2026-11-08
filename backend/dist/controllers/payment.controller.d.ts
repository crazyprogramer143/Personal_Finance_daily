import { Request, Response } from 'express';
export declare class PaymentController {
    recordPayment(_req: Request, res: Response): Promise<any>;
    reversePayment(_req: Request, res: Response): Promise<any>;
    getPaymentDetails(_req: Request, res: Response): Promise<any>;
    getLoanPayments(_req: Request, res: Response): Promise<any>;
    getCollectorPayments(_req: Request, res: Response): Promise<any>;
}
declare const _default: PaymentController;
export default _default;
//# sourceMappingURL=payment.controller.d.ts.map