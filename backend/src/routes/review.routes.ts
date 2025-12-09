import { Router } from 'express';
import { createReview, getPlaceDetails } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Create a review
// POST /api/reviews
router.post('/reviews', authenticate, createReview);

// Get place details (merged data)
// GET /api/places/:googlePlaceId/details
router.get('/places/:googlePlaceId/details', authenticate, getPlaceDetails);

export default router;
