import DailyClosing from '../models/DailyClosing';
interface CreateClosingRequest {
    closingDate: Date;
    notes?: string;
}
export declare class DailyClosingService {
    createDailyClosing(companyId: string, userId: string, data: CreateClosingRequest): Promise<DailyClosing>;
    submitClosing(closingId: string): Promise<DailyClosing>;
    approveClosing(closingId: string, approvedBy: string): Promise<DailyClosing>;
    rejectClosing(closingId: string): Promise<DailyClosing>;
    getCompanyClosings(companyId: string, limit?: number): Promise<DailyClosing[]>;
    getClosingDetails(closingId: string): Promise<any>;
}
declare const _default: DailyClosingService;
export default _default;
//# sourceMappingURL=daily-closing.service.d.ts.map