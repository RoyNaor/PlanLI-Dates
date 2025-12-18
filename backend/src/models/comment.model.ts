import mongoose, { Document, Schema, Types } from 'mongoose';

export const MAX_COMMENT_DEPTH = 3;

export interface IComment extends Document {
  post?: Types.ObjectId;
  parentComment?: Types.ObjectId;
  authorId: string;
  content: string;
  likes: string[];
  depth: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  post: { type: Schema.Types.ObjectId, ref: 'Post', index: true },
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', index: true },
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  likes: { type: [String], default: [] },
  depth: { type: Number, required: true, min: 1, max: MAX_COMMENT_DEPTH }
}, {
  timestamps: true
});

export default mongoose.model<IComment>('Comment', CommentSchema);
