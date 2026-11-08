import { Request, Response } from 'express';
import accountService from '../services/account.service';
import auditService from '../services/audit.service';

export class AccountController {
  async createAccount(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.id;
      const { name, type, bankName, accountNumber, upiId, currency } = _req.body;

      const account = await accountService.createAccount({
        companyId,
        name,
        type,
        bankName,
        accountNumber,
        upiId,
        currency,
      });

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'Account',
        account.id,
        { name, type }
      );

      res.status(201).json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCompanyAccounts(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const accounts = await accountService.getCompanyAccounts(companyId);
      res.json(accounts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAccountDetails(_req: Request, res: Response): Promise<any> {
    try {
      const { accountId } = _req.params;
      const account = await accountService.getAccountDetails(accountId);
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async recordTransaction(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.id;
      const { accountId, type, amount, description, referenceType, referenceId, transactionDate } =
        _req.body;

      const transaction = await accountService.recordTransaction({
        companyId,
        accountId,
        type,
        amount,
        description,
        referenceType,
        referenceId,
        transactionDate: new Date(transactionDate),
      });

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'LedgerTransaction',
        transaction.id,
        { type, amount }
      );

      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async holdAmount(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.id;
      const { accountId, amount } = _req.body;

      await accountService.holdAmount(accountId, amount);

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'Account',
        accountId,
        { action: 'hold_amount', amount }
      );

      res.json({ success: true, message: 'Amount held successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async releaseHeldAmount(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.id;
      const { accountId, amount } = _req.body;

      await accountService.releaseHeldAmount(accountId, amount);

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'Account',
        accountId,
        { action: 'release_held_amount', amount }
      );

      res.json({ success: true, message: 'Held amount released successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAccountLedger(_req: Request, res: Response): Promise<any> {
    try {
      const { accountId } = _req.params;
      const limit = _req.query.limit ? parseInt(_req.query.limit as string) : 100;

      const ledger = await accountService.getAccountLedger(accountId, limit);
      res.json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCompanyLedger(_req: Request, res: Response): Promise<any> {
    try {
      const companyId = (_req as any).user.companyId;
      const limit = _req.query.limit ? parseInt(_req.query.limit as string) : 100;

      const ledger = await accountService.getCompanyLedger(companyId, limit);
      res.json(ledger);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateAccountStatus(_req: Request, res: Response): Promise<any> {
    try {
      const { accountId } = _req.params;
      const { status } = _req.body;
      const companyId = (_req as any).user.companyId;
      const userId = (_req as any).user.id;

      const account = await accountService.updateAccountStatus(accountId, status);

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'Account',
        accountId,
        { status }
      );

      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new AccountController();
