import { Router, Request, Response } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import dateRoutes from './date.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('PlanLI Dates Backend is running!');
});

router.use('/', healthRoutes); // /health
router.use('/api', authRoutes); // /api/protected
router.use('/api', dateRoutes); // /api/calculate
router.use('/api', reviewRoutes); // /api/reviews, /api/places/:id/details

export default router;
