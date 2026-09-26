import { Router } from 'express';
import { getGraphOnly } from '../controllers/report.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);
router.get('/', getGraphOnly);
export default router;
