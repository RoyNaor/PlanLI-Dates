import mongoose, { Document, Schema } from 'mongoose';

export interface IPostLocation {
  name: string;
  lat: number;
  long: number;
}

export interface IPost extends Document {
  authorId: string;
  content: string;
  imageUrl?: string;
  location?: IPostLocation;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostLocationSchema = new Schema<IPostLocation>({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  long: { type: Number, required: true }
}, { _id: false });

const PostSchema = new Schema<IPost>({
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  location: { type: PostLocationSchema, required: false },
  likes: { type: [String], default: [] }
}, {
  timestamps: true
});

export default mongoose.model<IPost>('Post', PostSchema);
