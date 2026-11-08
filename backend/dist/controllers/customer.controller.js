"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const Customer_1 = __importDefault(require("../models/Customer"));
const audit_service_1 = __importDefault(require("../services/audit.service"));
class CustomerController {
    async createCustomer(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { code, name, shopName, mobileNumber, address, language } = _req.body;
            const customer = await Customer_1.default.create({
                companyId,
                code,
                name,
                shopName,
                mobileNumber,
                address,
                language: language || 'en',
                status: 'active',
                verificationStatus: 'unverified',
            });
            await audit_service_1.default.logAction(companyId, userId, 'CREATE', 'Customer', customer.id, { code, name });
            res.status(201).json(customer);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCustomers(_req, res) {
        try {
            const companyId = _req.user.companyId;
            const customers = await Customer_1.default.findAll({
                where: { companyId },
            });
            res.json(customers);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCustomerDetails(_req, res) {
        try {
            const { customerId } = _req.params;
            const customer = await Customer_1.default.findByPk(customerId);
            res.json(customer);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateCustomer(_req, res) {
        try {
            const { customerId } = _req.params;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const { name, shopName, mobileNumber, address, language, status } = _req.body;
            const customer = await Customer_1.default.findByPk(customerId);
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            const oldValues = customer.toJSON();
            await customer.update({
                name: name || customer.name,
                shopName: shopName || customer.shopName,
                mobileNumber: mobileNumber || customer.mobileNumber,
                address: address || customer.address,
                language: language || customer.language,
                status: status || customer.status,
            });
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Customer', customerId, customer.toJSON(), oldValues);
            res.json(customer);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async verifyCustomer(_req, res) {
        try {
            const { customerId } = _req.params;
            const companyId = _req.user.companyId;
            const userId = _req.user.id;
            const customer = await Customer_1.default.findByPk(customerId);
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            await customer.update({ verificationStatus: 'verified' });
            await audit_service_1.default.logAction(companyId, userId, 'UPDATE', 'Customer', customerId, { verificationStatus: 'verified' });
            res.json(customer);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.CustomerController = CustomerController;
exports.default = new CustomerController();
//# sourceMappingURL=customer.controller.js.map