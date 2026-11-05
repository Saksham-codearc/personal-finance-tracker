import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, register, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validation/schemas.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in a few minutes.',
  },
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', protect, me);
router.patch('/profile', protect, validate(updateProfileSchema), updateProfile);

export default router;
