import { Router } from 'express';
import { getStats, getAllOrders, getAdminProducts } from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.get('/products', getAdminProducts);

export default router;
