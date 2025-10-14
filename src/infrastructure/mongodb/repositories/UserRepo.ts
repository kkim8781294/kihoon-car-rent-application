import { UserRepo } from "../../../core/methodRepository";
import { UserModel } from "../../mongodb/models/User";

export const MongoUserRepo = (): UserRepo => ({
  async findByUserId(userId) {
    const d = await UserModel.findOne({ userId });
    return d ? { id: String(d._id), userId: d.userId, password: d.password, role: d.role } : null;
  },
  async findById(id) {
    const d = await UserModel.findById(id);
    return d ? { id: String(d._id), userId: d.userId, password: d.password, role: d.role } : null;
  },
  async create(u) {
    const d = await UserModel.create({ userId: u.userId, password: u.password, role: u.role });
    console.log("[repo] user.create", d.userId);
    return { id: String(d._id), userId: d.userId, password: d.password, role: d.role };
  },
});
