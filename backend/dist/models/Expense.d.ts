import { Model, Optional } from 'sequelize';
interface ExpenseAttributes {
    id: string;
    companyId: string;
    userId: string;
    category: string;
    amount: number;
    description: string;
    expenseDate: Date;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> {
    id: string;
    companyId: string;
    userId: string;
    category: string;
    amount: number;
    description: string;
    expenseDate: Date;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Expense;
//# sourceMappingURL=Expense.d.ts.map