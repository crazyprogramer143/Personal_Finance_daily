import { Model, Optional } from 'sequelize';
interface DisbursementAttributes {
    id: string;
    loanId: string;
    principalAmount: number;
    heldAmount: number;
    disbursedAmount: number;
    disbursementDate: Date;
    disbursementMethod: 'cash' | 'upi' | 'bank_transfer';
    referenceNumber?: string;
    status: 'pending' | 'completed' | 'reversed';
    reversedAt?: Date;
    reversalReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface DisbursementCreationAttributes extends Optional<DisbursementAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Disbursement extends Model<DisbursementAttributes, DisbursementCreationAttributes> {
    id: string;
    loanId: string;
    principalAmount: number;
    heldAmount: number;
    disbursedAmount: number;
    disbursementDate: Date;
    disbursementMethod: 'cash' | 'upi' | 'bank_transfer';
    referenceNumber?: string;
    status: 'pending' | 'completed' | 'reversed';
    reversedAt?: Date;
    reversalReason?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Disbursement;
//# sourceMappingURL=Disbursement.d.ts.map