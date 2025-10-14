import express from 'express';
import cors from 'cors';
import authRoutes from './port/rest/routes/users.routes';
import carRoutes from './port/rest/routes/cars.routes';
import bookingRoutes from './port/rest/routes/bookings.routes';
import adminRoutes from './port/rest/routes/admin.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", authRoutes);
app.use("/cars", carRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);

export default app;