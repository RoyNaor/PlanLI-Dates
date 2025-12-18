import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import Post from '../models/post.model';
import Comment, { MAX_COMMENT_DEPTH } from '../models/comment.model';
import { CreateCommentDTO, CreatePostDTO } from '../dtos/post.dto';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  const { content, imageUrl, location } = req.body as CreatePostDTO;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized: No user found on request' });
    return;
  }

  if (!content) {
    res.status(400).json({ message: 'Post content is required' });
    return;
  }

  try {
    const post = new Post({
      authorId: user.uid,
      content,
      imageUrl,
      location
    });

    await post.save();

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addCommentToPost = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  const { postId } = req.params;
  const { content } = req.body as CreateCommentDTO;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized: No user found on request' });
    return;
  }

  if (!content) {
    res.status(400).json({ message: 'Comment content is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    res.status(400).json({ message: 'Invalid post id' });
    return;
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const comment = new Comment({
      post: post._id,
      content,
      authorId: user.uid,
      depth: 1
    });

    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const replyToComment = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  const { commentId } = req.params;
  const { content } = req.body as CreateCommentDTO;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized: No user found on request' });
    return;
  }

  if (!content) {
    res.status(400).json({ message: 'Reply content is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    res.status(400).json({ message: 'Invalid comment id' });
    return;
  }

  try {
    const parentComment = await Comment.findById(commentId);

    if (!parentComment) {
      res.status(404).json({ message: 'Parent comment not found' });
      return;
    }

    const newDepth = parentComment.depth + 1;

    if (newDepth > MAX_COMMENT_DEPTH) {
      res.status(400).json({ message: `Maximum comment depth of ${MAX_COMMENT_DEPTH} exceeded` });
      return;
    }

    const comment = new Comment({
      post: parentComment.post,
      parentComment: parentComment._id,
      content,
      authorId: user.uid,
      depth: newDepth
    });

    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const togglePostLike = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  const { postId } = req.params;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized: No user found on request' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    res.status(400).json({ message: 'Invalid post id' });
    return;
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const hasLiked = post.likes.includes(user.uid);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => id !== user.uid);
    } else {
      post.likes.push(user.uid);
    }

    await post.save();

    res.json({
      likesCount: post.likes.length,
      liked: !hasLiked,
      post
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleCommentLike = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  const { commentId } = req.params;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized: No user found on request' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    res.status(400).json({ message: 'Invalid comment id' });
    return;
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    const hasLiked = comment.likes.includes(user.uid);

    if (hasLiked) {
      comment.likes = comment.likes.filter((id) => id !== user.uid);
    } else {
      comment.likes.push(user.uid);
    }

    await comment.save();

    res.json({
      likesCount: comment.likes.length,
      liked: !hasLiked,
      comment
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
