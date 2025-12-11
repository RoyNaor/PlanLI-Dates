import { Router } from 'express';
import { createReview, getPlaceDetails, addReply, toggleLike } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Create a review
// POST /api/reviews
router.post('/reviews', authenticate, createReview);

// Reply to a review
// POST /api/reviews/:reviewId/reply
router.post('/reviews/:reviewId/reply', authenticate, addReply);

// Toggle like on a review
// POST /api/reviews/:reviewId/toggle-like
router.post('/reviews/:reviewId/toggle-like', authenticate, toggleLike);

// Get place details (merged data)
// GET /api/places/:googlePlaceId/details
router.get('/places/:googlePlaceId/details', authenticate, getPlaceDetails);

export default router;
