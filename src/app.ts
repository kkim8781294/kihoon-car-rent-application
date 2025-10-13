import express from 'express';
import cors from 'cors';
import authRoutes from './port/rest/routes/users.routes';
import carRoutes from './port/rest/routes/cars.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/cars', carRoutes);


export default app;