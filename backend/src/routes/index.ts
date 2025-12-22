import { Router, Request, Response } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import dateRoutes from './date.routes';
import reviewRoutes from './review.routes';
import postRoutes from './post.routes'; 

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('PlanLI Dates Backend is running!');
});

router.use('/', healthRoutes);
router.use('/api', authRoutes);
router.use('/api', dateRoutes);
router.use('/api', reviewRoutes);
router.use('/api/posts', postRoutes); 

export default router;