"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const loan_product_controller_1 = __importDefault(require("../controllers/loan-product.controller"));
const router = express_1.default.Router();
router.post('/', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), loan_product_controller_1.default.createLoanProduct);
router.get('/', auth_middleware_1.validateToken, loan_product_controller_1.default.getLoanProducts);
router.get('/:productId', auth_middleware_1.validateToken, loan_product_controller_1.default.getLoanProductDetails);
router.put('/:productId', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), loan_product_controller_1.default.updateLoanProduct);
router.post('/:productId/deactivate', auth_middleware_1.validateToken, (0, auth_middleware_1.requireRole)('accountant'), loan_product_controller_1.default.deactivateLoanProduct);
exports.default = router;
//# sourceMappingURL=loan-product.routes.js.map