import express from 'express';
import cors from 'cors';
import budgetRoutes from '/routes/budget.routes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// Registro de rutas
app.use('/api/budget', budgetRoutes);

export default app;