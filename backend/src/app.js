import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.route.js';
import ingestRoutes from './routes/ingest.route.js';
import monitorRoutes from './routes/monitor.route.js';
import graphRoutes from './routes/graph.route.js';
import detectionRoutes from './routes/detection.route.js';
import incidentRoutes from './routes/incident.route.js';
import reportRoutes from './routes/report.route.js';

const app = express();
app.set('trust proxy', 1); 

app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const apiLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many auth attempts' },
});

app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok', service: 'cybersentinel' } }));

app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);// explain
app.use(errorHandler); // explain

export default app;
