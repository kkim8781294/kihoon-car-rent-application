import { Router, Request, Response } from 'express';
import { BookingModel } from '../../../infrastructure/mongodb/models/Booking';
import { CarModel } from '../../../infrastructure/mongodb/models/Car';
import { requireAuth, requireRole } from '../../../middleware/authentication';
import { optionalAuth } from '../../../middleware/optionalAuth';

const router = Router();

// --- 공통 유틸: 기간 겹침 검사 (자기 자신 제외 가능) ---
async function hasOverlap(
  carId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string
): Promise<boolean> {
  const q: any = {
    carId,
    status: { $in: ['pending', 'approved'] },
    $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }]
  };
  if (excludeId) q._id = { $ne: excludeId }; // 자기 자신 제외
  const found = await BookingModel.findOne(q).lean();
  return !!found;
}

// --- [게스트/회원 공통] 예약 생성 ---
// body: { carId: string; startDate: string; endDate: string; guestEmail?: string }
router.post('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { carId, startDate, endDate, guestEmail } = req.body as {
      carId: string; startDate: string; endDate: string; guestEmail?: string;
    };

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: 'carId/startDate/endDate required' });
    }

    const s = new Date(startDate), e = new Date(endDate);
    if (!(s < e)) return res.status(400).json({ message: 'endDate must be after startDate' });

    // 차량 존재/활성 확인
    const car = await CarModel.findById(carId).lean();
    if (!car || !car.isActive) return res.status(404).json({ message: 'Car not found or inactive' });

    const isGuest = !req.user;
    if (isGuest && !guestEmail) return res.status(400).json({ message: 'guestEmail required for guest booking' });
    if (isGuest && guestEmail) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
      if (!ok) return res.status(400).json({ message: 'invalid guestEmail' });
    }

    // 기간 겹침 방지
    if (await hasOverlap(carId, s, e)) {
      return res.status(409).json({ message: 'Car already booked for selected period' });
    }

    const doc = await BookingModel.create({
      carId,
      userId: req.user?.sub ?? undefined,
      guestEmail: isGuest ? guestEmail : undefined,
      startDate: s,
      endDate: e,
      status: 'pending'
    });

    return res.status(201).json({ booking: { id: doc.id, status: doc.status } });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || 'Booking create error' });
  }
});

// --- [회원] 내 예약 목록 ---
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const list = await BookingModel
    .find({ userId: req.user!.sub })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ bookings: list });
});

// --- [회원] 내 예약 취소 ---
router.post('/:id/cancel', requireAuth, async (req: Request, res: Response) => {
  const b = await BookingModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.sub },
    { status: 'canceled' },
    { new: true }
  );
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  res.json({ booking: b });
});

// --- [관리자] 전체 예약 목록 + 필터 ---
// query: status? carId? from? to?
router.get('/', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  const q: any = {};
  if (req.query.status) q.status = req.query.status;
  if (req.query.carId) q.carId = req.query.carId;

  if (req.query.from || req.query.to) {
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to   = req.query.to   ? new Date(String(req.query.to))   : undefined;
    q.$and = [];
    if (from) q.$and.push({ endDate: { $gte: from } });
    if (to)   q.$and.push({ startDate: { $lte: to } });
    if (!q.$and.length) delete q.$and;
  }

  const list = await BookingModel.find(q).sort({ createdAt: -1 }).lean();
  res.json({ bookings: list });
});

// --- [관리자] 승인 ---
router.post('/:id/approve', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  const b = await BookingModel.findById(req.params.id);
  if (!b) return res.status(404).json({ message: 'Booking not found' });

  // 승인 시점에도 겹침 재검사(자기 자신 제외)
  const overlap = await hasOverlap(String(b.carId), b.startDate, b.endDate, b.id);
  if (overlap) return res.status(409).json({ message: 'Overlap on approve' });

  b.status = 'approved';
  await b.save();
  res.json({ booking: b });
});

// --- [관리자] 거절 ---
router.post('/:id/decline', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  const b = await BookingModel.findByIdAndUpdate(req.params.id, { status: 'declined' }, { new: true });
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  res.json({ booking: b });
});

// --- [관리자] 예약 수정(날짜/차량/상태) ---
router.put('/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  const b = await BookingModel.findById(req.params.id);
  if (!b) return res.status(404).json({ message: 'Booking not found' });

  const { startDate, endDate, carId, status } = req.body as Partial<{
    startDate: string; endDate: string; carId: string; status: 'pending'|'approved'|'declined'|'canceled';
  }>;

  if (startDate) b.startDate = new Date(startDate);
  if (endDate)   b.endDate   = new Date(endDate);
  if (carId)     b.carId     = carId as any;
  if (status)    b.status    = status;

  if (!(b.startDate < b.endDate)) return res.status(400).json({ message: 'endDate must be after startDate' });

  if (['pending','approved'].includes(b.status)) {
    const overlap = await hasOverlap(String(b.carId), b.startDate, b.endDate, b.id);
    if (overlap) return res.status(409).json({ message: 'Overlap after edit' });
  }

  await b.save();
  res.json({ booking: b });
});

// --- [공개] 차량 가용 캘린더(막힌 구간) ---
// query: carId, from, to
router.get('/availability', async (req: Request, res: Response) => {
  const { carId, from, to } = req.query as any;
  if (!carId || !from || !to) return res.status(400).json({ message: 'carId/from/to required' });

  const s = new Date(String(from)), e = new Date(String(to));
  const blocks = await BookingModel.find({
    carId,
    status: { $in: ['pending','approved'] },
    $or: [{ startDate: { $lt: e }, endDate: { $gt: s } }]
  })
    .select('startDate endDate status')
    .lean();

  res.json({ carId, from: s, to: e, blocks });
});

export default router;
