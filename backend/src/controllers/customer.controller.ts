import { Request, Response } from 'express';
import Customer from '../models/Customer';
import auditService from '../services/audit.service';

export class CustomerController {
  async createCustomer(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.id;
      const { code, name, shopName, mobileNumber, address, language } = _req.body;

      const customer = await Customer.create({
        companyId,
        code,
        name,
        shopName,
        mobileNumber,
        address,
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
      const customers = await Customer.findAll({
        where: { companyId },
      });
      res.json(customers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCustomerDetails(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const customer = await Customer.findByPk(customerId);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCustomer(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.id;
      const { name, shopName, mobileNumber, address, language, status } = _req.body;

      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const oldValues = customer.toJSON();

      await customer.update({
        name: name || customer.name,
        shopName: shopName || customer.shopName,
        mobileNumber: mobileNumber || customer.mobileNumber,
        address: address || customer.address,
        language: language || customer.language,
        status: status || customer.status,
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

  async verifyCustomer(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.id;

      const customer = await Customer.findByPk(customerId);
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
