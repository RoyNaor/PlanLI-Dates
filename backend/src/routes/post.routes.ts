import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { addCommentToPost, createPost, replyToComment, toggleCommentLike, togglePostLike, getAllPosts } from '../controllers/post.controller';
import { uploadSingleImage } from '../middleware/upload.middleware';

const router = Router();


router.get('/', authenticate, getAllPosts); 
router.post('/', authenticate, uploadSingleImage, createPost);
router.post('/:postId/comments', authenticate, addCommentToPost);
router.post('/comments/:commentId/replies', authenticate, replyToComment);
router.post('/:postId/like', authenticate, togglePostLike);
router.post('/comments/:commentId/like', authenticate, toggleCommentLike);

export default router;
