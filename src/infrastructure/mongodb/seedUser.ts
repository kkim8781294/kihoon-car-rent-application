import bcrypt from 'bcryptjs';
import { UserModel } from './models/users';

type SeedUser = { userName: string; password: string; userType: 'user' | 'admin' };

export async function seedInitialUsers() {
  const users: SeedUser[] = [
    { userName: 'user',  password: 'user',  userType: 'user' },
    { userName: 'test',  password: 'test',  userType: 'user' },
    { userName: 'admin', password: 'admin', userType: 'admin' },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);

    await UserModel.updateOne(
      { userName: u.userName },
      { $setOnInsert: { userName: u.userName, passwordHash, userType: u.userType } },
      { upsert: true }
    );
  }

  const existing = await UserModel.find({ userName: { $in: users.map(u => u.userName) } })
                                  .select('userName userType')
                                  .lean();
  console.log('[seed] ensured users:', existing.map(e => `${e.userName}:${e.userType}`).join(', '));
}