import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from './vercel-types.js';
import { getConfig } from '../mentor/config.js';
import { MentorError, publicError } from '../mentor/errors.js';
import { logProgress } from './logger.js';
export function prepareHttp(req: VercelRequest, res: VercelResponse, method: string): string | null {
  const requestId = randomUUID();
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Allow', `${method}, OPTIONS`);
  try {
    const origin = req.headers.origin;
    if (origin) {
      if (typeof origin !== 'string' || !getConfig().origins.includes(origin)) throw new MentorError('ORIGIN_NOT_ALLOWED', 403, 'Origin is not allowed.');
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', `${method}, OPTIONS`);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Expose-Headers', 'X-Request-ID');
    }
    if (req.method === 'OPTIONS') { res.status(204).end(); return null; }
    if (req.method !== method) throw new MentorError('METHOD_NOT_ALLOWED', 405, `Use ${method} for this endpoint.`);
    return requestId;
  } catch (e) { sendError(res, e, requestId); return null; }
}
export function sendError(res: VercelResponse, error: unknown, requestId: string) {
  const e = publicError(error);
  logProgress(requestId, {stage: 'error', errorCategory: e.code});
  if (e.code === 'GROQ_RATE_LIMITED') res.setHeader('Retry-After', '5');
  return res.status(e.status).json({error: {code: e.code, message: e.message, requestId}});
}
export function readJson(req: VercelRequest): unknown {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] ?? '')) throw new MentorError('INVALID_REQUEST', 400, 'Content-Type must be application/json.');
  try {
    // Vercel parses body lazily; malformed JSON can throw on property access.
    const body: unknown = req.body;
    const serialized = typeof body === 'string' ? body : Buffer.isBuffer(body) ? body.toString('utf8') : JSON.stringify(body);
    if (!serialized || Buffer.byteLength(serialized) > 24000) throw new Error();
    return JSON.parse(serialized) as unknown;
  } catch { throw new MentorError('INVALID_REQUEST', 400, 'Request must contain valid JSON of at most 24 KB.'); }
}
