"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const joi_1 = __importDefault(require("joi"));
const auth_service_1 = __importDefault(require("../services/auth.service"));
// Validation schemas
const signupSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    name: joi_1.default.string().required(),
    password: joi_1.default.string().min(8).required(),
});
const ownerLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
const collectorLoginSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
});
class AuthController {
    /**
     * Company signup endpoint
     * POST /api/auth/signup
     */
    static async signup(req, res) {
        try {
            const { error, value } = signupSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const result = await auth_service_1.default.signup(value);
            res.status(201).json(result);
        }
        catch (error) {
            console.error('Signup error:', error);
            res.status(400).json({ error: error.message || 'Signup failed' });
        }
    }
    /**
     * Owner login endpoint
     * POST /api/auth/login/owner
     */
    static async loginOwner(req, res) {
        try {
            const { error, value } = ownerLoginSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const result = await auth_service_1.default.login({
                email: value.email,
                password: value.password,
            });
            res.json(result);
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message || 'Login failed' });
        }
    }
    /**
     * Collector login endpoint
     * POST /api/auth/login/collector
     */
    static async loginCollector(req, res) {
        try {
            const { error, value } = collectorLoginSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const result = await auth_service_1.default.login({
                username: value.username,
                password: value.password,
            });
            res.json(result);
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message || 'Login failed' });
        }
    }
    /**
     * Login endpoint (auto-detect owner or collector)
     * POST /api/auth/login
     */
    static async login(req, res) {
        try {
            const { email, username, password } = req.body;
            if (!password) {
                return res.status(400).json({ error: 'Password is required' });
            }
            if (!email && !username) {
                return res.status(400).json({ error: 'Email or username is required' });
            }
            const result = await auth_service_1.default.login({
                email,
                username,
                password,
            });
            res.json(result);
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message || 'Login failed' });
        }
    }
    /**
     * Verify token endpoint
     * GET /api/auth/me
     */
    static async me(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            res.json({
                userId: req.user.userId,
                companyId: req.user.companyId,
                role: req.user.role,
                assignedCustomers: req.user.assignedCustomers,
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Error verifying token' });
        }
    }
}
exports.AuthController = AuthController;
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map