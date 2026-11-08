"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyClosingController = void 0;
const daily_closing_service_1 = __importDefault(require("../services/daily-closing.service"));
const audit_service_1 = __importDefault(require("../services/audit.service"));
class DailyClosingController {
    async createDailyClosing(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { closingDate, notes } = _req.body;
            const closing = await daily_closing_service_1.default.createDailyClosing(companyId, userId, {
                closingDate: new Date(closingDate),
                notes,
            });
            await audit_service_1.default.logAction(companyId, userId, 'CREATE', 'DailyClosing', closing.id, { closingDate });
            res.status(201).json(closing);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async submitClosing(_req, res) {
        try {
            const { closingId } = _req.params;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const closing = await daily_closing_service_1.default.submitClosing(closingId);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'DailyClosing', closingId, {
                status: 'submitted',
            });
            res.json(closing);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async approveClosing(_req, res) {
        try {
            const { closingId } = _req.params;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const closing = await daily_closing_service_1.default.approveClosing(closingId, userId);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'DailyClosing', closingId, {
                status: 'approved',
            });
            res.json(closing);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async rejectClosing(_req, res) {
        try {
            const { closingId } = _req.params;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const closing = await daily_closing_service_1.default.rejectClosing(closingId);
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'DailyClosing', closingId, {
                status: 'rejected',
            });
            res.json(closing);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCompanyClosings(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const limit = _req.query.limit ? parseInt(_req.query.limit) : 100;
            const closings = await daily_closing_service_1.default.getCompanyClosings(companyId, limit);
            res.json(closings);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getClosingDetails(_req, res) {
        try {
            const { closingId } = _req.params;
            const details = await daily_closing_service_1.default.getClosingDetails(closingId);
            res.json(details);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.DailyClosingController = DailyClosingController;
exports.default = new DailyClosingController();
//# sourceMappingURL=daily-closing.controller.js.map