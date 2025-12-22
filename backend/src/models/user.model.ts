import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  photoUrl?: string;
  savedLocations: {
    label: string;
    coords: [number, number];
  }[];
}

const UserSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  displayName: { type: String },
  photoUrl: { type: String },
  savedLocations: [{
    label: { type: String, required: true },
    coords: { type: [Number], required: true }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
