import { Router } from 'express';
import { listSignals, dashboardStats } from '../controllers/monitor.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { monitorQuerySchema } from '../validations/sentinel.validation.js';

const router = Router();
router.use(authenticate);
router.get('/signals', validate(monitorQuerySchema, 'query'), listSignals);
router.get('/stats', dashboardStats);
export default router;
