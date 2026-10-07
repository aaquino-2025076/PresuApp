import { Router } from 'express';
import { getUserConfig, updateConfig } from '../controllers/user-config.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { userConfigSchema } from '../schemas/budget.schemas.js';

const router = Router();

router.get('/', getUserConfig);
router.put('/', validate(userConfigSchema), updateConfig);

export default router;