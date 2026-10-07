import { Router } from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenses.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { createExpenseSchema } from '../schemas/budget.schemas.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getExpenses);
router.post('/', validate(createExpenseSchema), createExpense);
router.delete('/:id', deleteExpense);

export default router;