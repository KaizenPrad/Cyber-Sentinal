import { Router } from 'express';
import { listIncidents, getIncident, updateIncident, addRemediation } from '../controllers/incident.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateIncidentSchema, remediationSchema } from '../validations/sentinel.validation.js';

const router = Router();
router.use(authenticate);
router.get('/', listIncidents);
router.get('/:id', getIncident);
router.patch('/:id', validate(updateIncidentSchema), updateIncident);
router.post('/:id/remediation', validate(remediationSchema), addRemediation);
export default router;
