import { Router } from 'express';
import { getMyOrders, getOrder } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// All order routes require authentication
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);

export default router;
