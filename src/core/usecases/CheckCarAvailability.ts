import { CarRepo, BookingRepo } from "../methodRepository";
import { areIntervalsOverlapping, parseISO } from "date-fns";

export function CheckCarAvailability(deps: { carRepo: CarRepo; bookingRepo: BookingRepo; }) {
  return async (input: { carId: string; startDate: string; endDate: string; }) => {
    const car = await deps.carRepo.findById(input.carId);
    if (!car || !car.active) return { error: "No car and active" };

    const s = parseISO(input.startDate), e = parseISO(input.endDate);
    const actives = await deps.bookingRepo.findActiveByCarInRange(input.carId, input.startDate, input.endDate);
    const overlap = actives.some(b => areIntervalsOverlapping(
      { start: s, end: e }, { start: parseISO(b.startDate), end: parseISO(b.endDate) }, { inclusive: true }
    ));
    console.log("Usecase: CheckCarAvailability", { carId: input.carId, available: !overlap });
    return { car, available: !overlap };
  };
}
