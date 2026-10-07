import { Router } from 'express';
import { getGoal, updateGoal } from '../controllers/goals.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateGoalSchema } from '../schemas/budget.schemas.js';

const router = Router();

router.get('/', getGoal);
router.put('/', validate(updateGoalSchema), updateGoal);

export default router;