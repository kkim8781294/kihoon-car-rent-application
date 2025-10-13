import dotenv from "dotenv";
 
dotenv.config();

const LOCAL_PATH_URL = "mongodb://localhost:27017";
const DB_NAME = "weather_app";

const env_url = process.env.MONGO_URL?.trim() ?? "";
const env_db_name  = process.env.MONGO_DB_NAME?.trim() ?? "";

export const ENV = {
  PORT: Number(process.env.PORT ?? 3000),

  MONGO_URL: env_url || LOCAL_PATH_URL,
  MONGO_DB_NAME: env_db_name || DB_NAME,

  USE_REMOTE: !!env_url && !env_url.startsWith("mongodb://localhost"),
};
