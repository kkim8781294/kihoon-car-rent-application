export const env = {
  PORT: Number(process.env.PORT || 3000),
  MONGO_URL: process.env.MONGO_URL || "mongodb://127.0.0.1:27017",
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "kihoon_car_rent",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "kihoon1234",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "kihoon1234",
  ADMIN_ID: process.env.ADMIN_ID || "admin",
  ADMIN_PASS: process.env.ADMIN_PASS || "admin",
};
