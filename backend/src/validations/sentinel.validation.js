import { z } from 'zod';

const signalSchema = z.object({
  signalType: z.string().min(1), // e.g. PHISH_CLICK, MASS_FILE_RENAME
  category: z.enum(['NETWORK', 'AUTH', 'ENDPOINT', 'EMAIL', 'WEB']).default('NETWORK'),
  severity: z.enum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('INFO'),
  message: z.string().min(1),
  sourceIp: z.string().optional(),
  userIdentity: z.string().optional(),
  hostname: z.string().optional(),
  domain: z.string().optional(),
  deviceId: z.string().optional(),
  rawData: z.record(z.any()).default({}),
  eventTimestamp: z.string().datetime().or(z.string().min(1)),
});

export const ingestSchema = z.object({
  signals: z.array(signalSchema).min(1).max(500),
});

export const monitorQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  severity: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  minRisk: z.coerce.number().min(0).max(100).default(0),
});

export const updateIncidentSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'FALSE_POSITIVE', 'DISMISSED']).optional(),
  assigneeId: z.string().nullable().optional(),
});

export const remediationSchema = z.object({
  action: z.string().min(1),
  notes: z.string().optional(),
});
