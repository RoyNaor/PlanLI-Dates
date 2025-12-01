import { Router } from 'express';
import { getProtectedData } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/protected', authenticate, getProtectedData);

export default router;
