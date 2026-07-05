import { Router } from 'express';
import { register, login, logout, getMe, updateMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

router.post('/register', validateBody(['name', 'email', 'password']), register);
router.post('/login', validateBody(['email', 'password']), login);
router.post('/logout', logout);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
