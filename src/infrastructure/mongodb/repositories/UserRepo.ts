import { UserRepo } from "../../../core/methodRepository";
import { UserModel } from "../../mongodb/models/User";

export const MongoUserRepo = (): UserRepo => ({
  async create(u) {
    const d = await UserModel.create({ userId: u.userId, password: u.password, role: u.role });
    console.log("User Repository: User created", d.userId);
    return { id: String(d._id), userId: d.userId, password: d.password, role: d.role };
  },
  
  async findByUserId(userId) {
    const d = await UserModel.findOne({ userId });
    console.log("User Repository: User find by userId(it is unser name not user_id)")
    return d ? { id: String(d._id), userId: d.userId, password: d.password, role: d.role } : null;
  },
  
  async findById(id) {
    const d = await UserModel.findById(id);
    console.log("User Repository: User find by id")
    return d ? { id: String(d._id), userId: d.userId, password: d.password, role: d.role } : null;
  }
  
});
