import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Company from '../models/Company';
import User from '../models/User';
import AuditLog from '../models/AuditLog';

interface SignupPayload {
  email: string;
  name: string;
  password: string;
}

interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

interface AuthResponse {
  token: string;
  userId: string;
  companyId: string;
  role: 'accountant' | 'collector';
  assignedCustomers?: string[];
  name?: string;
  email?: string;
  username?: string;
}

export class AuthService {
  /**
   * Company signup - Create new company and owner account
   */
  static async signup(payload: SignupPayload): Promise<AuthResponse> {
    const { email, name, password } = payload;

    // Check if company already exists
    const existingCompany = await Company.findOne({ where: { email } });
    if (existingCompany) {
      throw new Error('Company with this email already exists');
    }

    // Create company
    const company = await Company.create({
      email,
      name,
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create owner account (accountant role)
    const owner = await User.create({
      companyId: company.id,
      email,
      passwordHash,
      role: 'accountant',
    });

    // Log audit
    await AuditLog.create({
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
  static async login(payload: LoginPayload): Promise<AuthResponse> {
    const { email, username, password } = payload;

    if (!password) {
      throw new Error('Password is required');
    }

    let user: User | null = null;
    let company: Company | null = null;

    // Owner login (by email)
    if (email) {
      // First find company by email
      company = await Company.findOne({ where: { email } });
      if (!company) {
        throw new Error('Company not found');
      }

      // Find user (owner) in this company
      user = await User.findOne({
        where: { companyId: company.id, email, role: 'accountant' },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }
    }

    // Collector login (by username)
    if (username) {
      user = await User.findOne({
        where: { username, role: 'collector' },
        include: [{ model: Company }],
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      company = await Company.findByPk(user.companyId);
    }

    if (!user || !company) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Log audit
    await AuditLog.create({
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
  static generateToken(
    userId: string,
    companyId: string,
    role: 'accountant' | 'collector',
    assignedCustomers: string[] = []
  ): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      {
        userId,
        companyId,
        role,
        assignedCustomers,
      },
      secret as string,
      {
        expiresIn: process.env.JWT_EXPIRY || '7d',
      } as any
    );

    return token;
  }

  /**
   * Validate token
   */
  static validateToken(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.verify(token, secret);
  }
}

export default AuthService;
