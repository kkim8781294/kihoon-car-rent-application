import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; role: "user" | "admin" };
    }
  }
}

export function userFromToken(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {

      // handle quest and uiser
      req.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
      console.log("Authentication: verified", req.user);
    } catch {
      console.log("Authentication: invalid token");
    }
  }
  next();
}

export function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    console.log("Authentication: requireLogin fail");
    return res.status(401).json({ error: "login-in necessary" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    console.log("Authentication: Admin fail", req.user);
    return res.status(403).json({ error: "need!!! admin auth" });
  }
  next();
}
