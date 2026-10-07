import { Router } from 'express';
import { getBudgetSummary } from '../controllers/budget.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Proteger la ruta del resumen financiero con token JWT
router.use(authenticateToken);

router.get('/summary', getBudgetSummary);

export default router;