import Payment from '../models/Payment';
interface CreatePaymentRequest {
    loanId: string;
    collectorId?: string;
    amountReceived: number;
    paymentMethod: 'cash' | 'upi' | 'bank_transfer';
    referenceNumber?: string;
    paymentDate: Date;
}
interface PaymentAllocationData {
    scheduleId: string;
    amountAllocated: number;
}
export declare class PaymentService {
    recordPayment(data: CreatePaymentRequest, allocations?: PaymentAllocationData[]): Promise<Payment>;
    private allocatePaymentToSchedules;
    reversePayment(paymentId: string, reason: string): Promise<Payment>;
    getPaymentDetails(paymentId: string): Promise<any>;
    getLoanPayments(loanId: string): Promise<Payment[]>;
    getCollectorPayments(collectorId: string, fromDate?: Date, toDate?: Date): Promise<Payment[]>;
}
declare const _default: PaymentService;
export default _default;
//# sourceMappingURL=payment.service.d.ts.map