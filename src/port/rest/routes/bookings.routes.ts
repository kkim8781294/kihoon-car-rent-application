import { Router } from "express";
import { BookingsController } from "../../../controller/BookingsController";
import { userFromToken, requireLogin } from "../../../middleware/authentication.js";

const r = Router();

r.get("/availability", BookingsController.availability);
r.post("/", userFromToken, BookingsController.create);
r.get("/my", userFromToken, requireLogin, BookingsController.listMy);

export default r;
