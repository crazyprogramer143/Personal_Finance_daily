import Expense from '../models/Expense';
interface CreateExpenseRequest {
    category: string;
    amount: number;
    description: string;
    expenseDate: Date;
}
export declare class ExpenseService {
    createExpense(companyId: string, userId: string, data: CreateExpenseRequest): Promise<Expense>;
    getCompanyExpenses(companyId: string, fromDate?: Date, toDate?: Date, status?: string): Promise<Expense[]>;
    getUserExpenses(userId: string, companyId: string): Promise<Expense[]>;
    approveExpense(expenseId: string, approvedBy: string): Promise<Expense>;
    rejectExpense(expenseId: string): Promise<Expense>;
    getExpenseStats(companyId: string, fromDate?: Date, toDate?: Date): Promise<any>;
    getPendingExpensesCount(companyId: string): Promise<number>;
}
declare const _default: ExpenseService;
export default _default;
//# sourceMappingURL=expense.service.d.ts.map