import { Router } from 'express';
import { calculateDateLogic } from '../controllers/date.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /calculate
// router.post('/calculate', authenticate, calculateDateLogic);
router.post('/calculate',  calculateDateLogic);

export default router;
