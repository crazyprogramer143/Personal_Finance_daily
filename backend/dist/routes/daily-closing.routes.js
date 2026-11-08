"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const daily_closing_controller_1 = __importDefault(require("../controllers/daily-closing.controller"));
const router = express_1.default.Router();
router.post('/', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), daily_closing_controller_1.default.createDailyClosing);
router.post('/:closingId/submit', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), daily_closing_controller_1.default.submitClosing);
router.post('/:closingId/approve', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), daily_closing_controller_1.default.approveClosing);
router.post('/:closingId/reject', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), daily_closing_controller_1.default.rejectClosing);
router.get('/', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), daily_closing_controller_1.default.getCompanyClosings);
router.get('/:closingId', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), daily_closing_controller_1.default.getClosingDetails);
exports.default = router;
//# sourceMappingURL=daily-closing.routes.js.map