"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Company_1 = __importDefault(require("../models/Company"));
const User_1 = __importDefault(require("../models/User"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
class AuthService {
    /**
     * Company signup - Create new company and owner account
     */
    static async signup(payload) {
        const { email, name, password } = payload;
        // Check if company already exists
        const existingCompany = await Company_1.default.findOne({ where: { email } });
        if (existingCompany) {
            throw new Error('Company with this email already exists');
        }
        // Create company
        const company = await Company_1.default.create({
            email,
            name,
        });
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create owner account (accountant role)
        const owner = await User_1.default.create({
            companyId: company.id,
            email,
            passwordHash,
            role: 'accountant',
        });
        // Log audit
        await AuditLog_1.default.create({
            companyId: company.id,
            userId: owner.id,
            action: 'CREATE',
            entityType: 'COMPANY',
            entityId: company.id,
            newValues: { email, name },
        });
        // Generate token
        const token = this.generateToken(owner.id, company.id, 'accountant');
        return {
            token,
            userId: owner.id,
            companyId: company.id,
            role: 'accountant',
            name,
            email,
        };
    }
    /**
     * Login - Owner (email) or Collector (username)
     */
    static async login(payload) {
        const { email, username, password } = payload;
        if (!password) {
            throw new Error('Password is required');
        }
        let user = null;
        let company = null;
        // Owner login (by email)
        if (email) {
            // First find company by email
            company = await Company_1.default.findOne({ where: { email } });
            if (!company) {
                throw new Error('Company not found');
            }
            // Find user (owner) in this company
            user = await User_1.default.findOne({
                where: { companyId: company.id, email, role: 'accountant' },
            });
            if (!user) {
                throw new Error('Invalid credentials');
            }
        }
        // Collector login (by username)
        if (username) {
            user = await User_1.default.findOne({
                where: { username, role: 'collector' },
                include: [{ model: Company_1.default }],
            });
            if (!user) {
                throw new Error('Invalid credentials');
            }
            company = await Company_1.default.findByPk(user.companyId);
        }
        if (!user || !company) {
            throw new Error('Invalid credentials');
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        // Log audit
        await AuditLog_1.default.create({
            companyId: company.id,
            userId: user.id,
            action: 'LOGIN',
            entityType: 'USER',
            entityId: user.id,
        });
        // Generate token
        const token = this.generateToken(user.id, company.id, user.role);
        return {
            token,
            userId: user.id,
            companyId: company.id,
            role: user.role,
            email: user.email || undefined,
            username: user.username || undefined,
            name: company.name || undefined,
        };
    }
    /**
     * Generate JWT token
     */
    static generateToken(userId, companyId, role, assignedCustomers = []) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const token = jsonwebtoken_1.default.sign({
            userId,
            companyId,
            role,
            assignedCustomers,
        }, secret, {
            expiresIn: process.env.JWT_EXPIRY || '7d',
        });
        return token;
    }
    /**
     * Validate token
     */
    static validateToken(token) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        return jsonwebtoken_1.default.verify(token, secret);
    }
}
exports.AuthService = AuthService;
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map