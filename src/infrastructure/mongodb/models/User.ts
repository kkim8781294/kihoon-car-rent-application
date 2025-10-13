import { Schema, model } from "mongoose";

export interface IUser { userId: string; password: string; role: "user"|"admin"; }

const UserSchema = new Schema<IUser>({
  userId: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user","admin"], default: "user" },
}, 
{ timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);