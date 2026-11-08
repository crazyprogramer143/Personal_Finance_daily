import { Request, Response } from 'express';
export declare class ExpenseController {
    createExpense(_req: Request, res: Response): Promise<any>;
    getCompanyExpenses(_req: Request, res: Response): Promise<any>;
    approveExpense(_req: Request, res: Response): Promise<any>;
    rejectExpense(_req: Request, res: Response): Promise<any>;
    getExpenseStats(_req: Request, res: Response): Promise<any>;
    getPendingExpensesCount(_req: Request, res: Response): Promise<any>;
}
declare const _default: ExpenseController;
export default _default;
//# sourceMappingURL=expense.controller.d.ts.map