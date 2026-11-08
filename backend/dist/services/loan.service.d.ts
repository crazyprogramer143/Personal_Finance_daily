import Loan from '../models/Loan';
import Disbursement from '../models/Disbursement';
interface CreateLoanRequest {
    customerId: string;
    loanProductId: string;
    principalAmount: number;
    heldAmount: number;
    durationDays?: number;
}
export declare class LoanService {
    createLoan(companyId: string, data: CreateLoanRequest): Promise<Loan>;
    private generateRepaymentSchedule;
    approveLoan(loanId: string): Promise<Loan>;
    disburseLoan(loanId: string, disbursementDate: Date): Promise<Disbursement>;
    getLoanDetails(loanId: string): Promise<any>;
    getCustomerLoans(customerId: string, companyId: string): Promise<Loan[]>;
    closeLoan(loanId: string): Promise<Loan>;
}
declare const _default: LoanService;
export default _default;
//# sourceMappingURL=loan.service.d.ts.map