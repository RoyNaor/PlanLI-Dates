import mongoose, { Schema, Document } from 'mongoose';

export interface IPlace extends Document {
  googlePlaceId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }[];
  reviews?: {
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }[];
  cachedAt: Date;
}

const PlaceSchema: Schema = new Schema({
  googlePlaceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String },
  rating: { type: Number },
  userRatingsTotal: { type: Number },
  types: [{ type: String }],
  photos: [{
    photo_reference: String,
    height: Number,
    width: Number,
    html_attributions: [String]
  }],
  reviews: [{
    author_name: String,
    rating: Number,
    text: String,
    time: Number
  }],
  cachedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 } // Expire after 7 days
}, {
  timestamps: true
});

export default mongoose.model<IPlace>('Place', PlaceSchema);
