import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import expensesRoutes from './routes/expenses.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import incomesRoutes from './routes/incomes.routes.js';
import userConfigRoutes from './routes/user-config.routes.js';

const app: Application = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/incomes', incomesRoutes);
app.use('/api/config', userConfigRoutes);

export default app;