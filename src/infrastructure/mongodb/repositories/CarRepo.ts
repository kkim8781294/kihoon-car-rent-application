import { CarRepo } from "../../../core/methodRepository";
import { CarModel } from "../../mongodb/models/Car";

export const CarRepository = (): CarRepo => ({
  async create(c) {
    const d = await CarModel.create({ ...c, active: c.active ?? true });
    console.log("Car Repository: Car Create!", d.model);
    return { id: String(d._id), model: d.model, year: d.year, dailyRate: d.dailyRate, active: d.active };
  },
  async findById(id) {
    const d = await CarModel.findById(id);
    console.log("Car Repository: Car find by id")
    return d ? { id: String(d._id), model: d.model, year: d.year, dailyRate: d.dailyRate, active: d.active } : null;
  },
  
  async listActive() {
    const list = await CarModel.find({ active: true }).sort({ createdAt: -1 });
    console.log("Car Repository: Car return list")
    return list.map(d => ({ id: String(d._id), model: d.model, year: d.year, dailyRate: d.dailyRate, active: d.active }));
  }
  
 ,
});
