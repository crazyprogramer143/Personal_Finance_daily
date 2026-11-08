import { Model, Optional } from 'sequelize';
interface DailyClosingAttributes {
    id: string;
    companyId: string;
    closedBy: string;
    closingDate: Date;
    totalCashReceived: number;
    totalUpiReceived: number;
    totalBankTransfer: number;
    totalExpenses: number;
    netAmount: number;
    notes?: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface DailyClosingCreationAttributes extends Optional<DailyClosingAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class DailyClosing extends Model<DailyClosingAttributes, DailyClosingCreationAttributes> {
    id: string;
    companyId: string;
    closedBy: string;
    closingDate: Date;
    totalCashReceived: number;
    totalUpiReceived: number;
    totalBankTransfer: number;
    totalExpenses: number;
    netAmount: number;
    notes?: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default DailyClosing;
//# sourceMappingURL=DailyClosing.d.ts.map