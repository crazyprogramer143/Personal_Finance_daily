import LoanSchedule from '../models/LoanSchedule';
import Customer from '../models/Customer';
export declare class CollectionService {
    getDueSchedules(_collectorId: string, companyId: string, date?: Date): Promise<any[]>;
    getCustomerDueLoans(customerId: string): Promise<any[]>;
    getCollectionStats(collectorId: string, _companyId: string, date?: Date): Promise<any>;
    getCollectorPerformance(collectorId: string, _companyId: string, fromDate: Date, toDate: Date): Promise<any>;
    updateScheduleStatus(scheduleId: string): Promise<void>;
    waiverInstallment(scheduleId: string, _reason: string, _approvedBy: string): Promise<LoanSchedule>;
    applyGracePeriod(scheduleId: string, graceDays: number, _reason: string): Promise<LoanSchedule>;
    getOverdueStats(companyId: string): Promise<any>;
    getCollectorAssignments(collectorId: string, companyId: string): Promise<Customer[]>;
}
declare const _default: CollectionService;
export default _default;
//# sourceMappingURL=collection.service.d.ts.map