import { BookingRepo } from "../../../core/methodRepository";
import { BookingModel } from "../../mongodb/models/Booking";
import { parseISO } from "date-fns";

export const MongoBookingRepo = (): BookingRepo => ({
 
  async create(b) {
    const d = await BookingModel.create(b);
    console.log("[repo] booking.create", String(d._id));
    return { ...b, id: String(d._id), status: d.status };
  },
 
  async listAll() {
    const list = await BookingModel.find();
    return list.map(d => ({
      id: String(d._id), carId: String(d.carId), userId: d.userId ? String(d.userId) : undefined,
      guestEmail: d.guestEmail, startDate: d.startDate, endDate: d.endDate, total: d.total,
      status: d.status
    }));
  },
  
  async listByUser(userId) {
    const list = await BookingModel.find({ userId });
    return list.map(d => ({
      id: String(d._id), carId: String(d.carId), userId: d.userId ? String(d.userId) : undefined,
      guestEmail: d.guestEmail, startDate: d.startDate, endDate: d.endDate, total: d.total,
      status: d.status
    }));
  },
  
  async findActiveByCarInRange(carId, startDate, endDate) {
    const list = await BookingModel.find({ carId, status: { $in: ["pending","approved"] } });
    const s = parseISO(startDate), e = parseISO(endDate);
    return list
      .filter(d => !(e < parseISO(d.startDate) || s > parseISO(d.endDate)))
      .map(d => ({
        id: String(d._id), carId: String(d.carId),
        userId: d.userId ? String(d.userId) : undefined, guestEmail: d.guestEmail,
        startDate: d.startDate, endDate: d.endDate, total: d.total, status: d.status
      }));
  },
  async updateStatus(id, status) {
    const d = await BookingModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!d) return null;
    console.log("[repo] booking.updateStatus", id, status);
    return {
      id: String(d._id), carId: String(d.carId), userId: d.userId ? String(d.userId) : undefined,
      guestEmail: d.guestEmail, startDate: d.startDate, endDate: d.endDate, total: d.total,
      status: d.status
    };
  },
  async editDates(id, patch) {
    const d = await BookingModel.findByIdAndUpdate(id, patch, { new: true });
    if (!d) return null;
    console.log("[repo] booking.editDates", id, patch);
    return {
      id: String(d._id), carId: String(d.carId), userId: d.userId ? String(d.userId) : undefined,
      guestEmail: d.guestEmail, startDate: d.startDate, endDate: d.endDate, total: d.total,
      status: d.status
    };
  },
});
