"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * POST /api/auth/signup
 * Create new company and owner account
 */
router.post('/signup', auth_controller_1.default.signup);
/**
 * POST /api/auth/login
 * Login endpoint (auto-detect owner or collector)
 */
router.post('/login', auth_controller_1.default.login);
/**
 * POST /api/auth/login/owner
 * Owner login (email-based)
 */
router.post('/login/owner', auth_controller_1.default.loginOwner);
/**
 * POST /api/auth/login/collector
 * Collector login (username-based)
 */
router.post('/login/collector', auth_controller_1.default.loginCollector);
/**
 * GET /api/auth/me
 * Verify token and get current user info
 */
router.get('/me', auth_middleware_1.validateToken, auth_controller_1.default.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map