import express from 'express';
import { validateToken, requireRole } from '../middleware/auth.middleware';
import customerController from '../controllers/customer.controller';
import userController from '../controllers/user.controller';

const router = express.Router();

router.post('/', validateToken, requireRole('accountant'), customerController.createCustomer);
router.get('/', validateToken, customerController.getCustomers);
router.get('/:customerId', validateToken, customerController.getCustomerDetails);
router.put('/:customerId', validateToken, requireRole('accountant'), customerController.updateCustomer);
router.delete('/:customerId', validateToken, requireRole('accountant'), customerController.deleteCustomer);
router.post('/:customerId/verify', validateToken, requireRole('accountant'), customerController.verifyCustomer);
router.post('/:customerId/assign-collector', validateToken, requireRole('accountant'), userController.assignCollector);
router.post('/:customerId/unassign-collector', validateToken, requireRole('accountant'), userController.unassignCollector);

export default router;
