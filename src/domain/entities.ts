export type Role = "user" | "admin";

export type User = {
  id: string;
  userId: string;
  password: string; 
  role: Role;
};

export type Car = {
  id: string;
  model: string;
  year: number;
  dailyRate: number;
  active: boolean;
};

export type BookingStatus = "pending" | "approved" | "declined" | "canceled";

export type Booking = {
  id: string;
  carId: string;
  userId?: string;
  guestEmail?: string;
  startISO: string;
  endISO: string;
  total: number;
  status: BookingStatus;
  createdAt: string;
};
