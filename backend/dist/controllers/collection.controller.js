"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionController = void 0;
const collection_service_1 = __importDefault(require("../services/collection.service"));
const audit_service_1 = __importDefault(require("../services/audit.service"));
class CollectionController {
    async getDueSchedules(_req, res) {
        try {
            const collectorId = _req.user.id;
            const companyId = _req.user.companyId;
            const date = _req.query.date ? new Date(_req.query.date) : undefined;
            const schedules = await collection_service_1.default.getDueSchedules(collectorId, companyId, date);
            res.json(schedules);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCustomerDueLoans(_req, res) {
        try {
            const { customerId } = _req.params;
            const loans = await collection_service_1.default.getCustomerDueLoans(customerId);
            res.json(loans);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCollectionStats(_req, res) {
        try {
            const collectorId = _req.user.id;
            const companyId = _req.user.companyId;
            const date = _req.query.date ? new Date(_req.query.date) : undefined;
            const stats = await collection_service_1.default.getCollectionStats(collectorId, companyId, date);
            res.json(stats);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCollectorPerformance(_req, res) {
        try {
            const collectorId = _req.user.id;
            const companyId = _req.user.companyId;
            const fromDate = new Date(_req.query.fromDate);
            const toDate = new Date(_req.query.toDate);
            const performance = await collection_service_1.default.getCollectorPerformance(collectorId, companyId, fromDate, toDate);
            res.json(performance);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async waiverInstallment(_req, res) {
        try {
            const { scheduleId } = _req.params;
            const { reason } = _req.body;
            const userId = _req.user.id;
            const companyId = _req.user.companyId;
            const schedule = await collection_service_1.default.waiverInstallment(scheduleId, reason, userId);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'LoanSchedule', scheduleId, { status: 'waived', reason });
            res.json(schedule);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async applyGracePeriod(_req, res) {
        try {
            const { scheduleId } = _req.params;
            const { graceDays, reason } = _req.body;
            const userId = _req.user.id;
            const companyId = _req.user.companyId;
            const schedule = await collection_service_1.default.applyGracePeriod(scheduleId, graceDays, reason);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'LoanSchedule', scheduleId, { graceDaysAdded: graceDays, reason });
            res.json(schedule);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getOverdueStats(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const stats = await collection_service_1.default.getOverdueStats(companyId);
            res.json(stats);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCollectorAssignments(_req, res) {
        try {
            const collectorId = _req.user.id;
            const companyId = _req.user.companyId;
            const customers = await collection_service_1.default.getCollectorAssignments(collectorId, companyId);
            res.json(customers);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.CollectionController = CollectionController;
exports.default = new CollectionController();
//# sourceMappingURL=collection.controller.js.map