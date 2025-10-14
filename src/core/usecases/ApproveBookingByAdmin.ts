import { BookingRepo } from "../methodRepository";

export function ApproveBookingByAdmin(deps: { bookingRepo: BookingRepo; }) {
  return async (input: { id: string; }) => {
    console.log("Use Case : ApproveBookingByAdmin", input.id);
    const b = await deps.bookingRepo.updateStatus(input.id, "approved");
    if (!b) throw new Error("No booking!!!");
    return b;
  };
}
