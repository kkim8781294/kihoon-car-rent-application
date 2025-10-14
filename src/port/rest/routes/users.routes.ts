import { Router } from "express";
import { UsersController } from "../../../controller/UsersController";
const r = Router();

r.post("/register", UsersController.register);
r.post("/login", UsersController.login);
r.post("/refresh", UsersController.refresh);
r.post("/seed-admin", UsersController.seedAdmin);

export default r;
