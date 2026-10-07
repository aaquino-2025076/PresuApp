import { Router } from 'express';
import { getIncomes, createIncome, deleteIncome } from '../controllers/incomes.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createIncomeSchema } from '../schemas/budget.schemas.js';

const router = Router();

router.get('/', getIncomes);
router.post('/', validate(createIncomeSchema), createIncome);
router.delete('/:id', deleteIncome);

export default router;