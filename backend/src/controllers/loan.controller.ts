import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Loan from '../models/Loan';
import Customer from '../models/Customer';
import LoanProduct from '../models/LoanProduct';
import CustomerCollectorAssignment from '../models/CustomerCollectorAssignment';
import loanService from '../services/loan.service';
import auditService from '../services/audit.service';

export class LoanController {
  async getLoans(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const role = (_req as any).user.role;
      const userId = (_req as any).user.userId;
      const { search, status, customerId, collectorId } = _req.query;

      const where: any = { companyId };

      if (role === 'collector') {
        const assignments = await CustomerCollectorAssignment.findAll({
          where: { collectorId: userId, companyId },
          attributes: ['customerId'],
        });
        const assignedIds = assignments.map(a => a.customerId);
        where.customerId = { [Op.in]: assignedIds };
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (collectorId) {
        const collectorAssignments = await CustomerCollectorAssignment.findAll({
          where: { collectorId: collectorId as string, companyId },
          attributes: ['customerId'],
        });
        const collectorCustomerIds = collectorAssignments.map(a => a.customerId);
        if (where.customerId) {
          const existing = Array.isArray(where.customerId[Op.in]) ? where.customerId[Op.in] : [where.customerId];
          where.customerId = { [Op.in]: existing.filter((id: string) => collectorCustomerIds.includes(id)) };
        } else {
          where.customerId = { [Op.in]: collectorCustomerIds };
        }
      }

      if (status && status !== 'all') {
        where.status = status;
      }

      const include: any[] = [
        { model: Customer, attributes: ['id', 'name', 'code', 'shopName', 'mobileNumber'] },
        { model: LoanProduct, attributes: ['id', 'name', 'interestRatePercent', 'collectionFrequency'] },
      ];

      if (search) {
        const searchLower = `%${search}%`;
        where[Op.or] = [
          { '$Customer.name$': { [Op.iLike]: searchLower } },
          { '$Customer.code$': { [Op.iLike]: searchLower } },
          { '$Customer.shopName$': { [Op.iLike]: searchLower } },
        ];
      }

      const loans = await Loan.findAll({
        where,
        include,
        order: [['createdAt', 'DESC']],
        subQuery: false,
      });

      res.json(loans);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createLoan(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId, loanProductId, principalAmount, heldAmount, durationDays, startDate } = _req.body;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;
      const role = (_req as any).user.role;

      if (role === 'collector') {
        const assignment = await CustomerCollectorAssignment.findOne({
          where: { customerId, collectorId: userId, companyId },
        });
        if (!assignment) {
          return res.status(403).json({ error: 'You can only create loans for your assigned customers' });
        }
      }

      const loan = await loanService.createLoan(companyId, {
        customerId,
        loanProductId,
        principalAmount,
        heldAmount,
        durationDays,
        startDate,
      }, userId);

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'Loan',
        loan.id,
        { principalAmount, heldAmount, createdBy: userId }
      );

      res.status(201).json(loan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateLoan(_req: Request, res: Response): Promise<any> {
    try {
      const { loanId } = _req.params;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.userId;

      const loan = await Loan.findOne({ where: { id: loanId, companyId } });
      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      if (loan.status !== 'draft') {
        return res.status(400).json({ error: 'Only draft loans can be edited' });
      }

      const { principalAmount, heldAmount, durationDays, startDate } = _req.body;
      const updates: any = {};
      if (principalAmount !== undefined) updates.principalAmount = principalAmount;
      if (heldAmount !== undefined) updates.heldAmount = heldAmount;
      if (durationDays !== undefined) updates.durationDays = durationDays;
      if (startDate !== undefined) updates.startDate = new Date(startDate);

      if (updates.principalAmount !== undefined || updates.heldAmount !== undefined) {
        const p = updates.principalAmount ?? Number(loan.principalAmount);
        const h = updates.heldAmount ?? Number(loan.heldAmount);
        updates.disbursedAmount = p - h;
        updates.totalScheduledRepayment = p;
      }

      if (updates.durationDays !== undefined && updates.startDate) {
        const end = new Date(updates.startDate);
        end.setDate(end.getDate() + updates.durationDays);
        updates.endDate = end;
      } else if (updates.durationDays !== undefined) {
        const s = loan.startDate ? new Date(loan.startDate) : new Date();
        const end = new Date(s);
        end.setDate(end.getDate() + updates.durationDays);
        updates.endDate = end;
      } else if (updates.startDate) {
        const end = new Date(updates.startDate);
        end.setDate(end.getDate() + loan.durationDays);
        updates.endDate = end;
      }

      await loan.update(updates);

      // Regenerate schedule if amounts or dates changed
      const LoanSchedule = (await import('../models/LoanSchedule')).default;
      const LoanProduct = (await import('../models/LoanProduct')).default;
      await LoanSchedule.destroy({ where: { loanId } });
      const product = await LoanProduct.findByPk(loan.loanProductId);
      if (product) {
        const updatedLoan = await Loan.findByPk(loanId);
        if (updatedLoan) {
          const frequency = product.collectionFrequency;
          const dur = updatedLoan.durationDays;
          let numberOfInstallments = 1;
          let daysBetweenPayments = dur;
          if (frequency === 'daily') { numberOfInstallments = dur; daysBetweenPayments = 1; }
          else if (frequency === 'weekly') { numberOfInstallments = Math.ceil(dur / 7); daysBetweenPayments = 7; }
          else if (frequency === 'monthly') { numberOfInstallments = Math.ceil(dur / 30); daysBetweenPayments = 30; }

          const principal = Number(updatedLoan.principalAmount);
          const installmentAmount = Number((principal / numberOfInstallments).toFixed(2));
          const sDate = updatedLoan.startDate ? new Date(updatedLoan.startDate) : new Date();

          const schedules: any[] = [];
          let totalAllocated = 0;
          for (let i = 0; i < numberOfInstallments; i++) {
            const dueDate = new Date(sDate);
            dueDate.setDate(dueDate.getDate() + (i + 1) * daysBetweenPayments);
            const isLast = i === numberOfInstallments - 1;
            const amount = isLast ? Number((principal - totalAllocated).toFixed(2)) : installmentAmount;
            totalAllocated += amount;
            schedules.push({ loanId, dueDate, scheduledAmount: amount, amountAllocated: 0, remainingDue: amount, status: 'upcoming' });
          }
          await LoanSchedule.bulkCreate(schedules);
        }
      }

      await auditService.logAction(companyId, userId, 'UPDATE', 'Loan', loanId, updates);

      const result = await loanService.getLoanDetails(loanId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approveLoan(_req: Request, res: Response): Promise<any> {
    try {
      const { loanId } = _req.params;
      const userId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;

      const loan = await loanService.approveLoan(loanId);

      await auditService.logAction(companyId, userId, 'UPDATE', 'Loan', loanId, { status: 'approved' });

      res.json(loan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async disburseLoan(_req: Request, res: Response): Promise<any> {
    try {
      const { loanId } = _req.params;
      const { disbursementDate, disbursementMethod, accountId } = _req.body;
      const userId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;

      const disbursement = await loanService.disburseLoan(loanId, new Date(disbursementDate), accountId, companyId, disbursementMethod);

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'Disbursement',
        disbursement.id,
        { disbursementMethod }
      );

      res.status(201).json(disbursement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLoanDetails(_req: Request, res: Response): Promise<any> {
    try {
      const { loanId } = _req.params;
      const loan = await loanService.getLoanDetails(loanId);
      res.json(loan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCustomerLoans(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId } = _req.params;
      const companyId = (_req as any).user.companyId;

      const loans = await loanService.getCustomerLoans(customerId, companyId);
      res.json(loans);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async closeLoan(_req: Request, res: Response): Promise<any> {
    try {
      const { loanId } = _req.params;
      const userId = (_req as any).user.userId;
      const companyId = (_req as any).user.companyId;

      const loan = await loanService.closeLoan(loanId);

      await auditService.logAction(companyId, userId, 'UPDATE', 'Loan', loanId, { status: 'closed' });

      res.json(loan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new LoanController();
