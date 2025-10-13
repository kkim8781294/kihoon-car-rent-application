import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../../../infrastructure/mongodb/models/users';
import { signAccess, signRefresh, verifyRefresh } from '../../../lib/jwt';
import { requireAuth } from '../../../middleware/auth';

const router = Router();
let refreshStore: string[] = [];


router.post('/register', async (req, res) => {
  const { userName, password } = req.body as { userName: string; password: string };
  const passwordHash = await bcrypt.hash(password, 10);
  const doc = await UserModel.create({ userName, passwordHash });
  return res.status(201).json({ id: doc.id, userName: doc.userName, userType: doc.userType });
});


router.post('/login', async (req, res) => {
  const { userName, password } = req.body as { userName: string; password: string };
  const user = await UserModel.findOne({ userName });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const payload = { sub: user.id, name: user.userName, userType: user.userType as 'user' | 'admin' };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);
  refreshStore.push(refreshToken);

  return res.json({ accessToken, refreshToken, userType: user.userType });
});


router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
  if (!refreshStore.includes(refreshToken)) return res.status(403).json({ message: 'Refresh token not recognized' });

  try {
    const decoded = verifyRefresh(refreshToken);
    const newAccess = signAccess({ sub: decoded.sub, name: decoded.name, userType: decoded.userType });
    return res.json({ accessToken: newAccess });
  } catch {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
});


router.post('/logout', requireAuth, (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) refreshStore = refreshStore.filter(t => t !== refreshToken);
  return res.status(204).send();
});

export default router;
