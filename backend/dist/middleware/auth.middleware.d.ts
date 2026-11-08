import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        companyId: string;
        role: 'accountant' | 'collector';
        assignedCustomers?: string[];
    };
}
export declare const validateToken: (req: AuthRequest, res: Response, next: NextFunction) => any;
export declare const requireRole: (role: "accountant" | "collector" | "any") => (req: AuthRequest, res: Response, next: NextFunction) => any;
export declare const requireAccountant: (req: AuthRequest, res: Response, next: NextFunction) => any;
export declare const requireCollector: (req: AuthRequest, res: Response, next: NextFunction) => any;
//# sourceMappingURL=auth.middleware.d.ts.map