import { MongoUserRepo } from "../infrastructure/mongodb/repositories/UserRepo";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const userRepo = MongoUserRepo();

export class UsersController {

  static async register(req: any, res: any, next: any) {
    try {
      const { userId, password } = req.body ?? {};
      if (!userId || !password) 
        return res.status(400).json({ error: "Enter both userId and password" });

      const exist = await userRepo.findByUserId(userId);
      if (exist) 
        return res.status(409).json({ error: "already!!" });

      const newUser = await userRepo.create({ id: "", userId, password, role: "user" } as any);
      const accessToken = jwt.sign({ sub: newUser.id, role: "user" }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
      const refreshToken = jwt.sign({ sub: newUser.id, role: "user" }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
      console.log("User Controller: register new user", userId);
      res.status(201).json({ success: true, message :"User registered!", data:{newUser,accessToken, refreshToken}  });
    } catch (e) { next(e); }
  }

  static async login(req: any, res: any, next: any) {
    try {
      const { userId, password } = req.body ?? {};

      if (!userId || !password) 
        return res.status(400).json({ error: "Empty user id and password" });

      const loggedIn_user = await userRepo.findByUserId(userId);
      if (!loggedIn_user || loggedIn_user.password !== password) 
        return res.status(401).json({ error: "Check id and pass" });
      
      const accessToken = jwt.sign({ sub: loggedIn_user.id, role: loggedIn_user.role }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
      const refreshToken = jwt.sign({ sub: loggedIn_user.id, role: loggedIn_user.role }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
      console.log("User Controller: Logged In", userId);
      res.status(201).json({ success: true, message :"User Logged In!", data:{accessToken, refreshToken,loggedIn_user}  });
    } catch (e) { next(e); }
  }

  static async refresh(req: any, res: any, next: any) {
    try {
      const { refreshToken } = req.body ?? {};
      if (!refreshToken) 
        return res.status(400).json({ error: "needed refreshToken" });
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
      const accessToken = jwt.sign({ sub: payload.sub, role: payload.role }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
      console.log("User controller: refresh token", payload.sub);
      res.json({success: true, message :"Refreshed token!", data: {accessToken} });
    } catch (e) { next(e); }
  }

  static async seedAdmin(_req: any, res: any, next: any) {
    try {
      const newAdmin = {
        d: "", userId: env.ADMIN_ID, password: env.ADMIN_PASS, role: "admin" 
      };
      
      const exist = await userRepo.findByUserId(env.ADMIN_ID);
      if (!exist) await userRepo.create(newAdmin as any);
      console.log("User controller: Seed admin!");
      res.json({success: true, message :"User controller: Amdin added", data: {newAdmin} });
    } catch (e) { next(e); }
  }
}
