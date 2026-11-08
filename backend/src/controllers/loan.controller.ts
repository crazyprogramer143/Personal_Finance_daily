import { Request, Response } from 'express';
import loanService from '../services/loan.service';
import auditService from '../services/audit.service';

export class LoanController {
  async createLoan(_req: Request, res: Response): Promise<any> {
    try {
      const { customerId, loanProductId, principalAmount, heldAmount, durationDays } = _req.body;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.id;

      const loan = await loanService.createLoan(companyId, {
        customerId,
        loanProductId,
        principalAmount,
        heldAmount,
        durationDays,
      });

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'Loan',
        loan.id,
        { principalAmount, heldAmount }
      );

      res.status(201).json(loan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async approveLoan(_req: Request, res: Response): Promise<any> {
    try {
      const { loanId } = _req.params;
      const userId = (_req as any).user.id;
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
      const { disbursementDate, disbursementMethod } = _req.body;
      const userId = (_req as any).user.id;
      const companyId = (_req as any).user.companyId;

      const disbursement = await loanService.disburseLoan(loanId, new Date(disbursementDate));

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
      const userId = (_req as any).user.id;
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
