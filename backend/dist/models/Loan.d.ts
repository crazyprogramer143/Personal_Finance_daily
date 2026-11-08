import { Model, Optional } from 'sequelize';
interface LoanAttributes {
    id: string;
    companyId: string;
    customerId: string;
    loanProductId: string;
    principalAmount: number;
    heldAmount: number;
    disbursedAmount: number;
    totalScheduledRepayment: number;
    durationDays: number;
    collectionFrequency: 'daily' | 'weekly' | 'monthly';
    startDate?: Date;
    endDate?: Date;
    status: 'draft' | 'approved' | 'active' | 'closed';
    closureReason?: string;
    approvedAt?: Date;
    disbursedAt?: Date;
    closedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface LoanCreationAttributes extends Optional<LoanAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Loan extends Model<LoanAttributes, LoanCreationAttributes> {
    id: string;
    companyId: string;
    customerId: string;
    loanProductId: string;
    principalAmount: number;
    heldAmount: number;
    disbursedAmount: number;
    totalScheduledRepayment: number;
    durationDays: number;
    collectionFrequency: 'daily' | 'weekly' | 'monthly';
    startDate?: Date;
    endDate?: Date;
    status: 'draft' | 'approved' | 'active' | 'closed';
    closureReason?: string;
    approvedAt?: Date;
    disbursedAt?: Date;
    closedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Loan;
//# sourceMappingURL=Loan.d.ts.map