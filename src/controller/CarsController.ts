import { CarRepository } from "../infrastructure/mongodb/repositories/CarRepo";
const carRepo = CarRepository();

export class CarsController {
  static async listActive(_req: any, res: any, next: any) {
    try {
      const list = await carRepo.listActive();
      console.log("Car Controller: get list", list.length);
      res.json({ data: list });
      res.status(201).json({ success: true, message :"Car listed", data:{list}});
    } catch (e) { next(e); }
  }
  static async create(req: any, res: any, next: any) {
    try {
      const { model, year, dailyRate } = req.body ?? {};

      if (!model || !year || dailyRate == null) 
        return res.status(400).json({ error: "Empty field" });

      const newCar = await carRepo.create({ model, year: Number(year), dailyRate: Number(dailyRate) });
      console.log("Car Contorller: created car", model);
      res.status(201).json({ success: true, message :"Car created!!", data:{newCar}  });
    } catch (e) { next(e); }
  }
}
