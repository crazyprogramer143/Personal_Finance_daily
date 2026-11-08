import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import customerController from '../controllers/customer.controller';

const router = express.Router();

router.post('/', validateToken, requireRole('accountant'), customerController.createCustomer);
router.get('/', validateToken, customerController.getCustomers);
router.get('/:customerId', validateToken, customerController.getCustomerDetails);
router.put('/:customerId', validateToken, requireRole('accountant'), customerController.updateCustomer);
router.post('/:customerId/verify', validateToken, requireRole('accountant'), customerController.verifyCustomer);

export default router;
