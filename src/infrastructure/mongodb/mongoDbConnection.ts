import mongoose from "mongoose";
import { ENV } from "../../config/config";

export async function connectMongo() {
    try{
        await mongoose.connect(ENV.MONGO_URL, { dbName: ENV.MONGO_DB_NAME } as any);
        console.log('Connected to database successfully');
    } catch(err){
        console.log('Disconnect');
    }
}
