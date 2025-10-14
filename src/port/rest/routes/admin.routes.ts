import { Router } from "express";
import { AdminController } from "../../../controller/AdminController";
import { userFromToken, requireAdmin } from "../../../middleware/authentication.js";

const r = Router();

r.use(userFromToken, requireAdmin);
r.get("/bookings", AdminController.listAll);
r.patch("/bookings/:id/approve", AdminController.approve);
r.patch("/bookings/:id/decline", AdminController.decline);
r.patch("/bookings/:id/edit", AdminController.editDates);

export default r;
