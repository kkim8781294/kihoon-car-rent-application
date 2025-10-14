import { User, Car, Booking } from "./domain/entities";

export interface UserRepo {
  findByUserId(userId: string): Promise<User|null>;
  findById(id: string): Promise<User|null>;
  create(u: Omit<User,"id">): Promise<User>;
}

export interface CarRepo {
  findById(id: string): Promise<Car|null>;
  listActive(): Promise<Car[]>;
  create(c: Omit<Car,"id"|"active"> & { active?: boolean }): Promise<Car>;
}

export interface BookingRepo {
  create(b: Omit<Booking,"id"|"createdAt"|"status"> & { status?: Booking["status"] }): Promise<Booking>;
  listAll(): Promise<Booking[]>;
  listByUser(userId: string): Promise<Booking[]>;
  findActiveByCarInRange(carId: string, startDate: string, endDate: string): Promise<Booking[]>;
  updateStatus(id: string, status: Booking["status"]): Promise<Booking|null>;
  editDates(id: string, patch: { startDate?: string; endDate?: string }): Promise<Booking|null>;
}
