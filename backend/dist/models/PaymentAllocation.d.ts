import { Model, Optional } from 'sequelize';
interface PaymentAllocationAttributes {
    id: string;
    paymentId: string;
    scheduleId: string;
    amountAllocated: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface PaymentAllocationCreationAttributes extends Optional<PaymentAllocationAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class PaymentAllocation extends Model<PaymentAllocationAttributes, PaymentAllocationCreationAttributes> {
    id: string;
    paymentId: string;
    scheduleId: string;
    amountAllocated: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default PaymentAllocation;
//# sourceMappingURL=PaymentAllocation.d.ts.map