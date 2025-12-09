import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaceStats extends Document {
  googlePlaceId: string;
  averageRating: number;
  totalRating: number;
  reviewCount: number;
}

const PlaceStatsSchema: Schema = new Schema({
  googlePlaceId: { type: String, required: true, unique: true, index: true },
  averageRating: { type: Number, required: true, default: 0 },
  totalRating: { type: Number, required: true, default: 0 },
  reviewCount: { type: Number, required: true, default: 0 }
});

export default mongoose.model<IPlaceStats>('PlaceStats', PlaceStatsSchema);
