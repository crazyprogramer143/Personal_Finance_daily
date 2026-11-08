import { Request, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import Customer from '../models/Customer';
import Loan from '../models/Loan';
import User from '../models/User';
import CustomerCollectorAssignment from '../models/CustomerCollectorAssignment';
import auditService from '../services/audit.service';

export class CustomerController {
  async createCustomer(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;
      const { code, name, shopName, mobileNumber, address, businessType, language } = _req.body;

      const customer = await Customer.create({
        companyId,
        code,
        name,
        shopName,
        mobileNumber,
        address,
        businessType,
        language: language || 'en',
        status: 'active',
        verificationStatus: 'unverified',
      });

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'Customer',
        customer.id,
        { code, name }
      );

      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCustomers(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const { search, status } = _req.query;

      const where: any = { companyId };

      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where[Op.or] = [
          { code: { [Op.iLike]: `%${search}%` } },
          { name: { [Op.iLike]: `%${search}%` } },
          { shopName: { [Op.iLike]: `%${search}%` } },
          { mobileNumber: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const customers = await Customer.findAll({
        where,
        order: [['createdAt', 'DESC']],
      });

      const customerIds = customers.map((c) => c.id);

      let loanCounts: any[] = [];
      if (customerIds.length > 0) {
        loanCounts = await Loan.findAll({
          attributes: [
            'customerId',
            'status',
            [fn('COUNT', col('id')), 'count'],
          ],
          where: {
            customerId: { [Op.in]: customerIds },
            companyId,
          },
          group: ['customerId', 'status'],
          raw: true,
        });
      }

      const loanCountMap: Record<string, { active: number; closed: number; total: number }> = {};
      for (const row of loanCounts) {
        const cid = row.customerId;
        if (!loanCountMap[cid]) {
          loanCountMap[cid] = { active: 0, closed: 0, total: 0 };
        }
        const count = parseInt(row.count, 10);
        loanCountMap[cid].total += count;
        if (row.status === 'active' || row.status === 'approved' || row.status === 'draft') {
          loanCountMap[cid].active += count;
        } else if (row.status === 'closed') {
          loanCountMap[cid].closed += count;
        }
      }

      const assignments = await CustomerCollectorAssignment.findAll({
        where: { companyId },
        include: [{ model: User, attributes: ['id', 'username'] }],
      });

      const assignmentMap: Record<string, { collectorId: string; collectorName: string }[]> = {};
      for (const a of assignments) {
        if (!assignmentMap[a.customerId]) assignmentMap[a.customerId] = [];
        assignmentMap[a.customerId].push({
          collectorId: a.collectorId,
          collectorName: (a as any).User?.username || 'Unknown',
        });
      }

      const result = customers.map((c) => {
        const json = c.toJSON();
        return {
          ...json,
          loanCounts: loanCountMap[c.id] || { active: 0, closed: 0, total: 0 },
          collectors: assignmentMap[c.id] || [],
        };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCustomerDetails(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const companyId = (_req as any).user.companyId;

      const customer = await Customer.findOne({
        where: { id: customerId, companyId },
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const loans = await Loan.findAll({
        where: { customerId, companyId },
        order: [['createdAt', 'DESC']],
      });

      res.json({ ...customer.toJSON(), loans });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCustomer(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;
      const { name, shopName, mobileNumber, address, businessType, language, status } = _req.body;

      const customer = await Customer.findOne({
        where: { id: customerId, companyId },
      });
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const oldValues = customer.toJSON();

      await customer.update({
        name: name !== undefined ? name : customer.name,
        shopName: shopName !== undefined ? shopName : customer.shopName,
        mobileNumber: mobileNumber !== undefined ? mobileNumber : customer.mobileNumber,
        address: address !== undefined ? address : customer.address,
        businessType: businessType !== undefined ? businessType : customer.businessType,
        language: language !== undefined ? language : customer.language,
        status: status !== undefined ? status : customer.status,
      });

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'Customer',
        customerId,
        customer.toJSON(),
        oldValues
      );

      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCustomer(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;

      const customer = await Customer.findOne({
        where: { id: customerId, companyId },
      });
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const activeLoans = await Loan.count({
        where: {
          customerId,
          companyId,
          status: { [Op.in]: ['active', 'approved', 'draft'] },
        },
      });

      if (activeLoans > 0) {
        return res.status(400).json({
          error: 'Cannot deactivate customer with active loans',
        });
      }

      const oldValues = customer.toJSON();
      await customer.update({ status: 'inactive' });

      await auditService.logAction(
        companyId,
        userId,
        'DELETE',
        'Customer',
        customerId,
        { status: 'inactive' },
        oldValues
      );

      res.json({ message: 'Customer deactivated successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyCustomer(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;

      const customer = await Customer.findOne({
        where: { id: customerId, companyId },
      });
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      await customer.update({ verificationStatus: 'verified' });

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'Customer',
        customerId,
        { verificationStatus: 'verified' }
      );

      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CustomerController();
