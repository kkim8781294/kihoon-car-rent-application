import { Router } from "express";
import { CarsController } from "../../../controller/CarsController";
import { userFromToken, requireAdmin } from "../../../middleware/authentication.js";

const r = Router();

r.get("/", CarsController.listActive);
r.post("/", userFromToken, requireAdmin, CarsController.create);

export default r;
