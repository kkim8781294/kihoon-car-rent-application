import { MongoBookingRepo } from "../infrastructure/mongodb/repositories/BookingRepo";
import { ApproveBookingByAdmin } from "../core/usecases/ApproveBookingByAdmin";
import { DeclineBookingByAdmin } from "../core/usecases/DeclineBookingByAdmin";

const bookingRepo = MongoBookingRepo();
const runApprove = ApproveBookingByAdmin({ bookingRepo });
const runDecline = DeclineBookingByAdmin({ bookingRepo });

export class AdminController {
  static async listAll(_req: any, res: any, next: any) {
    try {
      const all = await bookingRepo.listAll();
      console.log("[ctrl] admin.listAll", all.length);
      res.json({ data: all });
    } catch (e) { next(e); }
  }

  static async approve(req: any, res: any, next: any) {
    try {
      const b = await runApprove({ id: String(req.params.id) });
      console.log("[ctrl] admin.approve", b.id);
      res.json({ data: b });
    } catch (e) { next(e); }
  }

  static async decline(req: any, res: any, next: any) {
    try {
      const b = await runDecline({ id: String(req.params.id) });
      console.log("[ctrl] admin.decline", b.id);
      res.json({ data: b });
    } catch (e) { next(e); }
  }

  static async editDates(req: any, res: any, next: any) {
    try {
      const b = await bookingRepo.editDates(String(req.params.id), { startDate: req.body.startDate, endDate: req.body.endDate });
      if (!b) return res.status(404).json({ error: "예약 없음" });
      console.log("[ctrl] admin.editDates", b.id);
      res.json({ data: b });
    } catch (e) { next(e); }
  }
}
