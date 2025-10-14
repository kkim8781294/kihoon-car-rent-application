import { differenceInCalendarDays, parseISO } from "date-fns";
import { CarRepo, BookingRepo } from "../methodRepository";

export function BookCar(deps: { carRepo: CarRepo; bookingRepo: BookingRepo; }) {
  return async (input: { carId: string; startDate: string; endDate: string; userId?: string; guestEmail?: string; }) => {
    const car = await deps.carRepo.findById(input.carId);
    if (!car || !car.active) 
      throw new Error("No avtive car and car");

    const start = parseISO(input.startDate);
    const end = parseISO(input.endDate);

    if (isNaN(+start) || isNaN(+end) || end <= start) {
      throw new Error("Error date");
    }

    const overlap = await deps.bookingRepo.findActiveByCarInRange(input.carId, input.startDate, input.endDate);
    if (overlap.length) 
      throw new Error("Arleady booked");

    const days = Math.max(1, differenceInCalendarDays(end, start));
    const total = car.dailyRate * days;

    if (!Number.isFinite(total) || total <= 0) {
      throw new Error("Date format check");
    }

    return deps.bookingRepo.create({
      carId: input.carId,
      startDate: input.startDate,
      endDate: input.endDate,
      userId: input.userId,
      guestEmail: input.userId ? undefined : input.guestEmail,
      total,
      status: "pending",
    });
  };
}
