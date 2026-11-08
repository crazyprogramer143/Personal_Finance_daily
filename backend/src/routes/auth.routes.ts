import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { validateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/signup
 * Create new company and owner account
 */
router.post('/signup', AuthController.signup);

/**
 * POST /api/auth/login
 * Login endpoint (auto-detect owner or collector)
 */
router.post('/login', AuthController.login);

/**
 * POST /api/auth/login/owner
 * Owner login (email-based)
 */
router.post('/login/owner', AuthController.loginOwner);

/**
 * POST /api/auth/login/collector
 * Collector login (username-based)
 */
router.post('/login/collector', AuthController.loginCollector);

/**
 * GET /api/auth/me
 * Verify token and get current user info
 */
router.get('/me', validateToken, AuthController.me);

export default router;
