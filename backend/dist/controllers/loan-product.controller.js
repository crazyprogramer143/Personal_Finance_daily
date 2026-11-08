"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanProductController = void 0;
const LoanProduct_1 = __importDefault(require("../models/LoanProduct"));
const audit_service_1 = __importDefault(require("../services/audit.service"));
class LoanProductController {
    async createLoanProduct(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { name, interestRatePercent, minPrincipal, maxPrincipal, durationDays, collectionFrequency, } = _req.body;
            const product = await LoanProduct_1.default.create({
                companyId,
                name,
                interestRatePercent,
                minPrincipal,
                maxPrincipal,
                durationDays,
                collectionFrequency,
                status: 'active',
            });
            await audit_service_1.default.logAction(companyId, userId, 'CREATE', 'LoanProduct', product.id, { name, interestRatePercent });
            res.status(201).json(product);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getLoanProducts(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const products = await LoanProduct_1.default.findAll({
                where: { companyId },
            });
            res.json(products);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getLoanProductDetails(_req, res) {
        try {
            const { productId } = _req.params;
            const product = await LoanProduct_1.default.findByPk(productId);
            res.json(product);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateLoanProduct(_req, res) {
        try {
            const { productId } = _req.params;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { name, interestRatePercent, minPrincipal, maxPrincipal, durationDays, collectionFrequency, status, } = _req.body;
            const product = await LoanProduct_1.default.findByPk(productId);
            if (!product) {
                return res.status(404).json({ error: 'Loan product not found' });
            }
            const oldValues = product.toJSON();
            await product.update({
                name: name || product.name,
                interestRatePercent: interestRatePercent !== undefined ? interestRatePercent : product.interestRatePercent,
                minPrincipal: minPrincipal || product.minPrincipal,
                maxPrincipal: maxPrincipal || product.maxPrincipal,
                durationDays: durationDays || product.durationDays,
                collectionFrequency: collectionFrequency || product.collectionFrequency,
                status: status || product.status,
            });
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'LoanProduct', productId, product.toJSON(), oldValues);
            res.json(product);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deactivateLoanProduct(_req, res) {
        try {
            const { productId } = _req.params;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const product = await LoanProduct_1.default.findByPk(productId);
            if (!product) {
                return res.status(404).json({ error: 'Loan product not found' });
            }
            await product.update({ status: 'inactive' });
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'LoanProduct', productId, { status: 'inactive' });
            res.json(product);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.LoanProductController = LoanProductController;
exports.default = new LoanProductController();
//# sourceMappingURL=loan-product.controller.js.map