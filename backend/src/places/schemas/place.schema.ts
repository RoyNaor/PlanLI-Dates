import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlaceDocument = HydratedDocument<Place>;

@Schema()
export class Review {
  @Prop()
  authorName!: string;

  @Prop()
  rating!: number;

  @Prop()
  text!: string;

  @Prop()
  time!: number;
}
const ReviewSchema = SchemaFactory.createForClass(Review);

@Schema({ timestamps: true })
export class Place {
  @Prop({ required: true, unique: true })
  placeId!: string; // Google Place ID

  @Prop({ required: true })
  name!: string;

  @Prop({ type: { lat: Number, lng: Number }, _id: false })
  location!: { lat: number; lng: number };

  @Prop([String])
  types!: string[];

  @Prop()
  rating!: number;

  @Prop()
  userRatingsTotal!: number;

  @Prop({ type: [ReviewSchema], default: [] })
  reviews!: Review[];

  @Prop({ type: Date, default: Date.now })
  cachedAt!: Date;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
