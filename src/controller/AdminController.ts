import { BookingRepository } from "../infrastructure/mongodb/repositories/BookingRepo";
import { ApproveBookingByAdmin } from "../core/usecases/ApproveBookingByAdmin";
import { DeclineBookingByAdmin } from "../core/usecases/DeclineBookingByAdmin";

const bookingRepo = BookingRepository();
const runApprove = ApproveBookingByAdmin({ bookingRepo });
const runDecline = DeclineBookingByAdmin({ bookingRepo });

export class AdminController {
  static async listAll(_req: any, res: any, next: any) {
    try {
      const list = await bookingRepo.listAll();
      console.log("Admin Controller: List all", list.length);
      res.status(201).json({ success: true, message :" Listed all", data:{list}});
    } catch (e) { next(e); }
  }

  static async approve(req: any, res: any, next: any) {
    try {
      const booking = await runApprove({ id: String(req.params.id) });
      console.log("Admin Controller: Approve booking", booking.id);
      res.status(201).json({ success: true, message :"Approve bookingr", data:{booking}});
    } catch (e) { next(e); }
  }

  static async decline(req: any, res: any, next: any) {
    try {
      const booking = await runDecline({ id: String(req.params.id) });
      console.log("Admin Controller: Decline booking", booking.id);
      res.status(201).json({ success: true, message :"Decline booking", data:{booking}});
    } catch (e) { next(e); }
  }

  static async editDates(req: any, res: any, next: any) {
    try {
      const booking = await bookingRepo.editDates(String(req.params.id), { startDate: req.body.startDate, endDate: req.body.endDate });
      if (!booking) return res.status(404).json({ error: "there is no booing related with your query" });
      console.log("Admin Controller: Edit Date", booking.id);
      res.status(201).json({ success: true, message :"Edit Date", data:{booking}});
    } catch (e) { next(e); }
  }
}
