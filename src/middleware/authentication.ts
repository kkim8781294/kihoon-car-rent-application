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

// 토큰이 있으면 req.user 세팅(게스트 허용)
export function userFromToken(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      req.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
      console.log("[auth] userFromToken ok", req.user);
    } catch {
      console.log("[auth] invalid token"); // 게스트
    }
  }
  next();
}

export function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    console.log("[auth] requireLogin fail");
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    console.log("[auth] requireAdmin fail", req.user);
    return res.status(403).json({ error: "관리자 권한이 필요합니다." });
  }
  next();
}
