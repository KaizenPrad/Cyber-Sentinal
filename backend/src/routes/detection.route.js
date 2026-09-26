import { Router } from 'express';
import { listDetections, getDetection, promoteDetection } from '../controllers/detection.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);
router.get('/', listDetections);
router.get('/:id', getDetection);
router.post('/:id/promote', promoteDetection);
export default router;
