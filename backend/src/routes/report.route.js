import { Router } from 'express';
import { getReport } from '../controllers/report.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);
router.get('/', getReport);
export default router;
