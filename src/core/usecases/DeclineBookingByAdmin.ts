import { BookingRepo } from "../methodRepository";

export function DeclineBookingByAdmin(deps: { bookingRepo: BookingRepo; }) {
  return async (input: { id: string; }) => {
    console.log("Usecase: DeclineBookingByAdmin", input.id);
    const b = await deps.bookingRepo.updateStatus(input.id, "declined");
    if (!b) 
      throw new Error("No booking!!");
    return b;
  };
}
