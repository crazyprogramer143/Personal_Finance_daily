"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const report_controller_1 = __importDefault(require("../controllers/report.controller"));
const router = express_1.default.Router();
router.get('/collection-performance', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), report_controller_1.default.getCollectionPerformanceReport);
router.get('/collector-comparison', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), report_controller_1.default.getCollectorComparisonReport);
router.get('/customer-history/:customerId', auth_middleware_1.validateToken, report_controller_1.default.getCustomerCollectionHistoryReport);
router.get('/loan-portfolio', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), report_controller_1.default.getLoanPortfolioReport);
router.get('/overdue-analysis', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), report_controller_1.default.getOverdueAnalysisReport);
exports.default = router;
//# sourceMappingURL=report.routes.js.map