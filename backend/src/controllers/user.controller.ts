import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import CustomerCollectorAssignment from '../models/CustomerCollectorAssignment';
import Customer from '../models/Customer';
import auditService from '../services/audit.service';

export class UserController {
  async createCollector(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;
      const { username, password } = _req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const existing = await User.findOne({ where: { username } });
      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const collector = await User.create({
        companyId,
        username,
        passwordHash,
        role: 'collector',
      });

      await auditService.logAction(companyId, userId, 'CREATE', 'User', collector.id, { username, role: 'collector' });

      res.status(201).json({
        id: collector.id,
        username: collector.username,
        role: collector.role,
        createdAt: collector.createdAt,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCollectors(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;

      const collectors = await User.findAll({
        where: { companyId, role: 'collector' },
        attributes: ['id', 'username', 'role', 'createdAt'],
        order: [['createdAt', 'DESC']],
      });

      const collectorIds = collectors.map((c) => c.id);
      const assignments = await CustomerCollectorAssignment.findAll({
        where: { companyId, collectorId: collectorIds },
        include: [{ model: Customer, attributes: ['id', 'name', 'code'] }],
      });

      const assignmentMap: Record<string, any[]> = {};
      for (const a of assignments) {
        if (!assignmentMap[a.collectorId]) assignmentMap[a.collectorId] = [];
        assignmentMap[a.collectorId].push((a as any).Customer);
      }

      const result = collectors.map((c) => ({
        ...c.toJSON(),
        assignedCustomers: assignmentMap[c.id] || [],
        customerCount: (assignmentMap[c.id] || []).length,
      }));

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCollector(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const { collectorId } = _req.params;

      const collector = await User.findOne({
        where: { id: collectorId, companyId, role: 'collector' },
      });

      if (!collector) {
        return res.status(404).json({ error: 'Collector not found' });
      }

      await CustomerCollectorAssignment.destroy({
        where: { collectorId, companyId },
      });

      await collector.destroy();

      res.json({ message: 'Collector deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async assignCollector(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const { customerId } = _req.params;
      const { collectorId } = _req.body;

      const customer = await Customer.findOne({ where: { id: customerId, companyId } });
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const collector = await User.findOne({ where: { id: collectorId, companyId, role: 'collector' } });
      if (!collector) {
        return res.status(404).json({ error: 'Collector not found' });
      }

      const existing = await CustomerCollectorAssignment.findOne({
        where: { customerId, collectorId, companyId },
      });

      if (existing) {
        return res.status(400).json({ error: 'This collector is already assigned to this customer' });
      }

      await CustomerCollectorAssignment.create({
        customerId,
        collectorId,
        companyId,
        assignedAt: new Date(),
      });

      res.json({ message: 'Collector assigned successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyAssignedCustomers(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;

      const assignments = await CustomerCollectorAssignment.findAll({
        where: { collectorId: userId, companyId },
        include: [{ model: Customer, attributes: ['id', 'name', 'code', 'shopName', 'mobileNumber', 'status'] }],
      });

      const customers = assignments
        .map((a) => (a as any).Customer)
        .filter((c: any) => c && c.status === 'active');

      res.json(customers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async unassignCollector(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const { customerId } = _req.params;
      const { collectorId } = _req.body;

      const where: any = { customerId, companyId };
      if (collectorId) {
        where.collectorId = collectorId;
      }

      await CustomerCollectorAssignment.destroy({ where });

      res.json({ message: 'Collector unassigned successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new UserController();
