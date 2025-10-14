import { BookingRepo } from "../methodRepository";
export function ListBooking(deps: { bookingRepo: BookingRepo; }) {
  return async (input: { userId: string; }) => {
    console.log("UserCase: ListBooking", input.userId);
    return deps.bookingRepo.listByUser(input.userId);
  };
}
