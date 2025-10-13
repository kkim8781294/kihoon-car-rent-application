import { CarModel } from './models/Car';

export async function seedInitialCars() {
  const cars = [
    { model: 'Avante',  type: 'sedan', year: 2021, pricePerDay: 45, isActive: true },
    { model: 'Sorento', type: 'suv',   year: 2023, pricePerDay: 70, isActive: true }
  ];
  for (const c of cars) {
    await CarModel.updateOne(
      { model: c.model, type: c.type, year: c.year }, // ✅ year 포함해 동일 차량 판별
      { $setOnInsert: c },
      { upsert: true }
    );
  }
  console.log('[seed] cars ensured');
}