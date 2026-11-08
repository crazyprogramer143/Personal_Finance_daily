import { Request, Response } from 'express';
import LoanProduct from '../models/LoanProduct';
import auditService from '../services/audit.service';

export class LoanProductController {
  async createLoanProduct(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;
      const {
        name,
        interestRatePercent,
        minPrincipal,
        maxPrincipal,
        durationDays,
        collectionFrequency,
      } = _req.body;

      const product = await LoanProduct.create({
        companyId,
        name,
        interestRatePercent,
        minPrincipal,
        maxPrincipal,
        durationDays,
        collectionFrequency,
        status: 'active',
      });

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'LoanProduct',
        product.id,
        { name, interestRatePercent }
      );

      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLoanProducts(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const products = await LoanProduct.findAll({
        where: { companyId },
      });
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLoanProductDetails(_req: Request, res: Response): Promise<any> {
    try {
      const { productId } = _req.params;
      const product = await LoanProduct.findByPk(productId);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateLoanProduct(_req: Request, res: Response): Promise<any> {
    try {
      const { productId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;
      const {
        name,
        interestRatePercent,
        minPrincipal,
        maxPrincipal,
        durationDays,
        collectionFrequency,
        status,
      } = _req.body;

      const product = await LoanProduct.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Loan product not found' });
      }

      const oldValues = product.toJSON();

      await product.update({
        name: name || product.name,
        interestRatePercent: interestRatePercent !== undefined ? interestRatePercent : product.interestRatePercent,
        minPrincipal: minPrincipal || product.minPrincipal,
        maxPrincipal: maxPrincipal || product.maxPrincipal,
        durationDays: durationDays || product.durationDays,
        collectionFrequency: collectionFrequency || product.collectionFrequency,
        status: status || product.status,
      });

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'LoanProduct',
        productId,
        product.toJSON(),
        oldValues
      );

      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deactivateLoanProduct(_req: Request, res: Response): Promise<any> {
    try {
      const { productId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;

      const product = await LoanProduct.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Loan product not found' });
      }

      await product.update({ status: 'inactive' });

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'LoanProduct',
        productId,
        { status: 'inactive' }
      );

      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new LoanProductController();
