import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; name: string; userType: 'user' | 'admin' }
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = verifyAccess(h.slice(7));
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: Array<'user' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.userType)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
