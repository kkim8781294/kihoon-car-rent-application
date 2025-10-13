import { Schema, model, Types } from "mongoose";

export type BookingStatus = "pending"|"approved"|"declined"|"canceled";

export interface IBooking {
  carId: Types.ObjectId;
  userId?: Types.ObjectId;
  guestEmail?: string;
  startISO: string;
  endISO: string;
  total: number;
  status: BookingStatus; 
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  carId: { type: Schema.Types.ObjectId, ref: "Car", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  guestEmail: { type: String },
  startISO: { type: String, required: true },
  endISO: { type: String, required: true },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending","approved","declined","canceled"], default: "pending" },
  createdAt: { type: Date, default: () => new Date() },
}, { timestamps: true });



export const BookingModel = model<IBooking>("Booking", BookingSchema);
