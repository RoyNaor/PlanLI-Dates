import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { addCommentToPost, createPost, replyToComment, toggleCommentLike, togglePostLike } from '../controllers/post.controller';

const router = Router();

router.post('/', authenticate, createPost);
router.post('/:postId/comments', authenticate, addCommentToPost);
router.post('/comments/:commentId/replies', authenticate, replyToComment);
router.post('/:postId/like', authenticate, togglePostLike);
router.post('/comments/:commentId/like', authenticate, toggleCommentLike);

export default router;
