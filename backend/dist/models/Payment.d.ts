import { Model, Optional } from 'sequelize';
interface PaymentAttributes {
    id: string;
    loanId: string;
    collectorId?: string;
    amountReceived: number;
    paymentMethod: 'cash' | 'upi' | 'bank_transfer';
    referenceNumber?: string;
    paymentDate: Date;
    status: 'completed' | 'reversed';
    reversedAt?: Date;
    reversalReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> {
    id: string;
    loanId: string;
    collectorId?: string;
    amountReceived: number;
    paymentMethod: 'cash' | 'upi' | 'bank_transfer';
    referenceNumber?: string;
    paymentDate: Date;
    status: 'completed' | 'reversed';
    reversedAt?: Date;
    reversalReason?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Payment;
//# sourceMappingURL=Payment.d.ts.map