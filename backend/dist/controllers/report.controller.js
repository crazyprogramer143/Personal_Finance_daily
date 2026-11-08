"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = __importDefault(require("../services/report.service"));
class ReportController {
    async getCollectionPerformanceReport(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const fromDate = new Date(_req.query.fromDate);
            const toDate = new Date(_req.query.toDate);
            const report = await report_service_1.default.getCollectionPerformanceReport(companyId, fromDate, toDate);
            res.json(report);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCollectorComparisonReport(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const fromDate = new Date(_req.query.fromDate);
            const toDate = new Date(_req.query.toDate);
            const report = await report_service_1.default.getCollectorComparisonReport(companyId, fromDate, toDate);
            res.json(report);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCustomerCollectionHistoryReport(_req, res) {
        try {
            const { customerId } = _req.params;
            const report = await report_service_1.default.getCustomerCollectionHistoryReport(customerId);
            res.json(report);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getLoanPortfolioReport(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const report = await report_service_1.default.getLoanPortfolioReport(companyId);
            res.json(report);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getOverdueAnalysisReport(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const report = await report_service_1.default.getOverdueAnalysisReport(companyId);
            res.json(report);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.ReportController = ReportController;
exports.default = new ReportController();
//# sourceMappingURL=report.controller.js.map