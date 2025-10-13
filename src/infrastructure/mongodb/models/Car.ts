import { Schema, model } from "mongoose";

export interface ICar 
{ model: string; 
  year: number; 
  dailyRate: number; 
  active: boolean; }


const CarSchema = new Schema<ICar>({
  model: { type: String, required: true },
  year: { type: Number, required: true },
  dailyRate: { type: Number, required: true, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });


export const CarModel = model<ICar>("Car", CarSchema);
