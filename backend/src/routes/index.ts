import { Router, Request, Response } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('PlanLI Dates Backend is running!');
});

router.use('/', healthRoutes); // /health
router.use('/api', authRoutes); // /api/protected

export default router;
