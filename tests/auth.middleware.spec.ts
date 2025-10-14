import { userFromToken, requireLogin, requireAdmin } from '../src/middleware/authentication';

const mkRes = () => { 
    const res: any = { statusCode: 200 };
    res.status = (c:number)=> (res.statusCode=c,res);
    res.json=(b:any)=> (res.body=b,res);
    return res; };

describe('Authentication Test', () => {
  test('userFromToken: no Authorization header → just next()', () => {
    const req: any = { headers: {} };
    const res: any = {};
    const next = jest.fn();

    userFromToken(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1); 
  });

  test('userFromToken: invalid token', () => {
    const req: any = { headers: { authorization: 'Bearer not-a-valid-jwt' } };
    const res: any = {};
    const next = jest.fn();

    userFromToken(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);  
  });

  test('Require login', () => {
    const req: any = { user: { sub: 'U1', role: 'user' } };
    const res = mkRes();
    const next = jest.fn();

    requireLogin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);  
    expect(res.statusCode).toBe(200);      
  });

  test('require admin role', () => {
    const req: any = { user: { sub: 'A1', role: 'admin' } };
    const res = mkRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1); 
    expect(res.statusCode).toBe(200);
  });

  test('without user as guest', () => {
    const req: any = { headers: { authorization: 'Bearer' } };
    const res: any = {};
    const next = jest.fn();

    userFromToken(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('wrong scheme whti Token without user', () => {
    const req: any = { headers: { authorization: 'Token abc.def.ghi' } };
    const res: any = {};
    const next = jest.fn();

    userFromToken(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('requireAdmin 403 Login required', () => {
    const req: any = {};
    const res = mkRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });
});