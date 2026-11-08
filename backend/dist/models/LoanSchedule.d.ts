import { Model, Optional } from 'sequelize';
interface LoanScheduleAttributes {
    id: string;
    loanId: string;
    dueDate: Date;
    scheduledAmount: number;
    amountAllocated: number;
    remainingDue: number;
    status: 'upcoming' | 'due' | 'partially_paid' | 'paid' | 'overdue' | 'waived';
    paidAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface LoanScheduleCreationAttributes extends Optional<LoanScheduleAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class LoanSchedule extends Model<LoanScheduleAttributes, LoanScheduleCreationAttributes> {
    id: string;
    loanId: string;
    dueDate: Date;
    scheduledAmount: number;
    amountAllocated: number;
    remainingDue: number;
    status: 'upcoming' | 'due' | 'partially_paid' | 'paid' | 'overdue' | 'waived';
    paidAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default LoanSchedule;
//# sourceMappingURL=LoanSchedule.d.ts.map