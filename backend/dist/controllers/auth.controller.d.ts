import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class AuthController {
    /**
     * Company signup endpoint
     * POST /api/auth/signup
     */
    static signup(req: any, res: Response): Promise<any>;
    /**
     * Owner login endpoint
     * POST /api/auth/login/owner
     */
    static loginOwner(req: any, res: Response): Promise<any>;
    /**
     * Collector login endpoint
     * POST /api/auth/login/collector
     */
    static loginCollector(req: any, res: Response): Promise<any>;
    /**
     * Login endpoint (auto-detect owner or collector)
     * POST /api/auth/login
     */
    static login(req: any, res: Response): Promise<any>;
    /**
     * Verify token endpoint
     * GET /api/auth/me
     */
    static me(req: AuthRequest, res: Response): Promise<any>;
}
export default AuthController;
//# sourceMappingURL=auth.controller.d.ts.map