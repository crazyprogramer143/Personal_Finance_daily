"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const collection_controller_1 = __importDefault(require("../controllers/collection.controller"));
const router = express_1.default.Router();
// Due schedules and customer lookups
router.get('/due-schedules', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('collector'), collection_controller_1.default.getDueSchedules);
router.get('/customer/:customerId/due-loans', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('collector'), collection_controller_1.default.getCustomerDueLoans);
router.get('/assignments', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('collector'), collection_controller_1.default.getCollectorAssignments);
// Collection statistics and performance
router.get('/stats', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('collector'), collection_controller_1.default.getCollectionStats);
router.get('/performance', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('collector'), collection_controller_1.default.getCollectorPerformance);
router.get('/overdue-stats', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), collection_controller_1.default.getOverdueStats);
// Installment management
router.post('/schedules/:scheduleId/waiver', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), collection_controller_1.default.waiverInstallment);
router.post('/schedules/:scheduleId/grace-period', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), collection_controller_1.default.applyGracePeriod);
exports.default = router;
//# sourceMappingURL=collection.routes.js.map