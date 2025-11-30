import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class SavedLocation {
  @Prop({ required: true })
  label!: string;

  @Prop({ type: [Number], required: true })
  coords!: number[];
}

const SavedLocationSchema = SchemaFactory.createForClass(SavedLocation);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  uid!: string;

  @Prop({ required: true })
  email!: string;

  @Prop()
  name!: string;

  @Prop({ type: [SavedLocationSchema], default: [] })
  savedLocations!: SavedLocation[];
}

export const UserSchema = SchemaFactory.createForClass(User);
