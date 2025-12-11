import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewReply {
  _id: mongoose.Types.ObjectId;
  userId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  likes: string[];
}

export interface IReview extends Document {
  googlePlaceId: string;
  userId: string;
  authorName: string;
  rating: number;
  content: string;
  createdAt: Date;
  likes: string[];
  replies: IReviewReply[];
}

const ReplySchema = new Schema<IReviewReply>({
  userId: { type: String, required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: [String], default: [] }
});

const ReviewSchema: Schema = new Schema({
  googlePlaceId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  authorName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: [String], default: [] },
  replies: { type: [ReplySchema], default: [] }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
