import { Response } from 'express';
import Joi from 'joi';
import AuthService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation schemas
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

const ownerLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const collectorLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export class AuthController {
  /**
   * Company signup endpoint
   * POST /api/auth/signup
   */
  static async signup(req: any, res: Response): Promise<any> {
    try {
      const { error, value } = signupSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await AuthService.signup(value);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(400).json({ error: error.message || 'Signup failed' });
    }
  }

  /**
   * Owner login endpoint
   * POST /api/auth/login/owner
   */
  static async loginOwner(req: any, res: Response): Promise<any> {
    try {
      const { error, value } = ownerLoginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await AuthService.login({
        email: value.email,
        password: value.password,
      });
      res.json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }

  /**
   * Collector login endpoint
   * POST /api/auth/login/collector
   */
  static async loginCollector(req: any, res: Response): Promise<any> {
    try {
      const { error, value } = collectorLoginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await AuthService.login({
        username: value.username,
        password: value.password,
      });
      res.json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }

  /**
   * Login endpoint (auto-detect owner or collector)
   * POST /api/auth/login
   */
  static async login(req: any, res: Response): Promise<any> {
    try {
      const { email, username, password } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      if (!email && !username) {
        return res.status(400).json({ error: 'Email or username is required' });
      }

      const result = await AuthService.login({
        email,
        username,
        password,
      });
      res.json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }

  /**
   * Verify token endpoint
   * GET /api/auth/me
   */
  static async me(req: AuthRequest, res: Response): Promise<any> {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error verifying token' });
    }
  }
}

export default AuthController;
