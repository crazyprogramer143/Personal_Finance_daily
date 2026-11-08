import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import auditService from '../services/audit.service';

export class PaymentController {
  async recordPayment(_req: Request, res: Response): Promise<any> {
    try {
      const { loanId, amountReceived, paymentMethod, referenceNumber, paymentDate, allocations } =
        _req.body;
      const userId = (_req as any).user.id;
      const companyId = (_req as any).user.companyId;

      const payment = await paymentService.recordPayment(
        {
          loanId,
          collectorId: userId,
          amountReceived,
          paymentMethod,
          referenceNumber,
          paymentDate: new Date(paymentDate),
        },
        allocations
      );

      await auditService.logAction(
        companyId,
        userId,
        'CREATE',
        'Payment',
        payment.id,
        { amountReceived, paymentMethod }
      );

      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async reversePayment(_req: Request, res: Response): Promise<any> {
    try {
      const { paymentId } = _req.params;
      const { reason } = _req.body;
      const userId = (_req as any).user.id;
      const companyId = (_req as any).user.companyId;

      const payment = await paymentService.reversePayment(paymentId, reason);

      await auditService.logAction(
        companyId,
        userId,
        'UPDATE',
        'Payment',
        paymentId,
        { status: 'reversed', reason }
      );

      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPaymentDetails(_req: Request, res: Response): Promise<any> {
    try {
      const { paymentId } = _req.params;
      const payment = await paymentService.getPaymentDetails(paymentId);
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLoanPayments(_req: Request, res: Response): Promise<any> {
    try {
      const { loanId } = _req.params;
      const payments = await paymentService.getLoanPayments(loanId);
      res.json(payments);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCollectorPayments(_req: Request, res: Response): Promise<any> {
    try {
      const collectorId = (_req as any).user.id;
      const { fromDate, toDate } = _req.query;

      const payments = await paymentService.getCollectorPayments(
        collectorId,
        fromDate ? new Date(fromDate as string) : undefined,
        toDate ? new Date(toDate as string) : undefined
      );

      res.json(payments);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new PaymentController();
