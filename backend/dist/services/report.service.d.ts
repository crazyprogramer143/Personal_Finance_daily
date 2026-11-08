export declare class ReportService {
    getCollectionPerformanceReport(companyId: string, fromDate: Date, toDate: Date): Promise<any>;
    getCollectorComparisonReport(companyId: string, fromDate: Date, toDate: Date): Promise<any>;
    getCustomerCollectionHistoryReport(customerId: string): Promise<any>;
    getLoanPortfolioReport(companyId: string): Promise<any>;
    getOverdueAnalysisReport(companyId: string): Promise<any>;
    private groupByDate;
}
declare const _default: ReportService;
export default _default;
//# sourceMappingURL=report.service.d.ts.map