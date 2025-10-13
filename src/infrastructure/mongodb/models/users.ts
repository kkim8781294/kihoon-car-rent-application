import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    userName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    userType: {type: String, enum: ['user', 'admin'],default: 'user'}
  },
  { timestamps: true }
);

export const UserModel = model('User', UserSchema);