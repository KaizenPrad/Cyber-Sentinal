import { Router } from 'express';
import { ingest } from '../controllers/ingest.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ingestSchema } from '../validations/sentinel.validation.js';

const router = Router();
router.post('/', authenticate, validate(ingestSchema), ingest);
export default router;
