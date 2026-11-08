"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const account_controller_1 = __importDefault(require("../controllers/account.controller"));
const router = express_1.default.Router();
router.post('/', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), account_controller_1.default.createAccount);
router.get('/', auth_middleware_1.validateToken, account_controller_1.default.getCompanyAccounts);
router.get('/:accountId', auth_middleware_1.validateToken, account_controller_1.default.getAccountDetails);
router.post('/:accountId/transactions', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), account_controller_1.default.recordTransaction);
router.post('/:accountId/hold', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), account_controller_1.default.holdAmount);
router.post('/:accountId/release', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), account_controller_1.default.releaseHeldAmount);
router.get('/:accountId/ledger', auth_middleware_1.validateToken, account_controller_1.default.getAccountLedger);
router.get('/company/ledger', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), account_controller_1.default.getCompanyLedger);
router.put('/:accountId/status', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), account_controller_1.default.updateAccountStatus);
exports.default = router;
//# sourceMappingURL=account.routes.js.map