import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: String,
    picture: String,
  },
  { timestamps: true }
);


//aa