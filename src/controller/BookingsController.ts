import { MongoCarRepo } from "../infrastructure/mongodb/repositories/CarRepo";
import { MongoBookingRepo } from "../infrastructure/mongodb/repositories/BookingRepo";
import { CheckCarAvailability } from "../core/usecases/CheckCarAvailability";
import { BookCar } from "../core/usecases/BookCar";
import { ListBooking } from "../core/usecases/ListBooking";

const carRepo = MongoCarRepo();
const bookingRepo = MongoBookingRepo();
const runAvailability = CheckCarAvailability({ carRepo, bookingRepo });
const runCreate = BookCar({ carRepo, bookingRepo });
const runListMy = ListBooking({ bookingRepo });

export class BookingsController {
  static async availability(req: any, res: any, next: any) {
    try {
      const { carId, startDate, endDate } = req.query ?? {};
      if (!carId || !startDate || !endDate) 
        return res.status(400).json({ error: "fill right value!!" });
      const result = await runAvailability({ carId: String(carId), startDate: String(startDate), endDate: String(endDate) });
      console.log("Booking Controller: show availability", carId, (result as any).available);
      res.status(201).json({ success: true, message :"Displayed available car", data:{result}});
    } catch (e) { next(e); }
  }

  static async create(req: any, res: any, next: any) {
    try {
      const { carId, startDate, endDate, guestEmail } = req.body ?? {};
      if (!carId || !startDate || !endDate) 
        return res.status(400).json({ error: "fill right value!!" });
      if (!req.user && !guestEmail) 
        return res.status(400).json({ error: "if you are guest, you should fill email" });
      const newBooking = await runCreate({ carId, startDate, endDate, userId: req.user?.sub, guestEmail: req.user ? undefined : guestEmail });
      console.log("Booking COntorller: Create booking", newBooking.id);
      res.status(201).json({ success: true, message :"Created booking", data:{b: newBooking}});
    } catch (e) { next(e); }
  }

  static async listMy(req: any, res: any, next: any) {
    try {
      const list = await runListMy({ userId: String(req.user!.sub) });
      console.log("Booking Controller: listMy!!!", req.user!.sub, list.length);
      res.status(201).json({ success: true, message :"display my booking", data:{list}});
    } catch (e) { next(e); }
  }
}
