import { Router } from 'express';
import { CarModel } from '../../../infrastructure/mongodb/models/Car';
import { requireAuth, requireRole } from '../../../middleware/authentication';

const router = Router();

// all user
router.get('/', async (req, res) => {
  const { q, type, minPrice, maxPrice, minYear, maxYear, sort = 'recent', page = '1', limit = '10' }
    = req.query as Record<string, string>;

  const filter: any = { isActive: true };
  if (q) filter.model = { $regex: q, $options: 'i' };
  if (type) filter.type = type;

  if (minPrice) filter.pricePerDay = { ...(filter.pricePerDay || {}), $gte: Number(minPrice) };
  if (maxPrice) filter.pricePerDay = { ...(filter.pricePerDay || {}), $lte: Number(maxPrice) };

  if (minYear) filter.year = { ...(filter.year || {}), $gte: Number(minYear) };
  if (maxYear) filter.year = { ...(filter.year || {}), $lte: Number(maxYear) };

  const sortMap: Record<string, any> = {
    priceAsc:  { pricePerDay: 1 },
    priceDesc: { pricePerDay: -1 },
    yearDesc:  { year: -1, createdAt: -1 }, 
    recent:    { createdAt: -1 }
  };
  const sortOption = sortMap[sort] || sortMap.recent;

  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (p - 1) * l;

  const [cars, total] = await Promise.all([
    CarModel.find(filter).sort(sortOption).skip(skip).limit(l).lean(),
    CarModel.countDocuments(filter)
  ]);

  res.json({ items: cars, page: p, limit: l, total, totalPages: Math.ceil(total / l) });
});

// all user:  detail car
router.get('/:id', async (req, res) => {
  const car = await CarModel.findById(req.params.id).lean();
  if (!car || !car.isActive) return res.status(404).json({ message: 'Car not found' });
  res.json({ car });
});

// admin: add car
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { model, type, year, pricePerDay, isActive } = req.body;
  if (!model || !type || year == null || pricePerDay == null) {
    return res.status(400).json({ message: 'model, type, year, pricePerDay required' });
  }
  const car = await CarModel.create({ model, type, year, pricePerDay, isActive });
  res.status(201).json({ car });
});

// admin: edit car
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const updated = await CarModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Car not found' });
  res.json({ car: updated });
});

// admin: change car status
router.post('/:id/toggle', requireAuth, requireRole('admin'), async (req, res) => {
  const car = await CarModel.findById(req.params.id);
  if (!car) return res.status(404).json({ message: 'Car not found' });
  car.isActive = !car.isActive;
  await car.save();
  res.json({ car });
});

// Admin: delete car
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await CarModel.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

export default router;
