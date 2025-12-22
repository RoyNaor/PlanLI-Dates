import { Router } from 'express';
import { registerUser, updateUserProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /register - The prefix /api/users will be defined in app.ts
router.post('/register', authenticate, registerUser);
router.put('/profile', authenticate, updateUserProfile);

export default router;
