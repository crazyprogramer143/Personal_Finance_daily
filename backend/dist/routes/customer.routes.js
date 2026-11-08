"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const customer_controller_1 = __importDefault(require("../controllers/customer.controller"));
const router = express_1.default.Router();
router.post('/', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), customer_controller_1.default.createCustomer);
router.get('/', auth_middleware_1.validateToken, customer_controller_1.default.getCustomers);
router.get('/:customerId', auth_middleware_1.validateToken, customer_controller_1.default.getCustomerDetails);
router.put('/:customerId', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), customer_controller_1.default.updateCustomer);
router.post('/:customerId/verify', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), customer_controller_1.default.verifyCustomer);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map