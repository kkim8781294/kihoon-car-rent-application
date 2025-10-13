import jwt, { Secret, SignOptions } from 'jsonwebtoken';

export type JwtPayload = { sub: string; name: string; userType: 'user' | 'admin' };

const ACCESS_SECRET  = (process.env.JWT_SECRET)  as Secret;
const REFRESH_SECRET = (process.env.REFRESH_SECRET) as Secret;

const ACCESS_EXPIRES  = (process.env.JWT_EXPIRES_IN) as SignOptions['expiresIn'];
const REFRESH_EXPIRES = (process.env.REFRESH_EXPIRES_IN )  as SignOptions['expiresIn'];

export const signAccess  = (p: JwtPayload) => jwt.sign(p, ACCESS_SECRET,  { expiresIn: ACCESS_EXPIRES });
export const signRefresh = (p: JwtPayload) => jwt.sign(p, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

export const verifyAccess  = (t: string) => jwt.verify(t, ACCESS_SECRET)  as jwt.JwtPayload & JwtPayload;
export const verifyRefresh = (t: string) => jwt.verify(t, REFRESH_SECRET) as jwt.JwtPayload & JwtPayload;
