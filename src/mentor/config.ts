import { z } from 'zod';
import { MentorError } from './errors.js';
const schema = z.object({
  GEMINI_MODEL: z.string().trim().min(1).default('gemini-3.8-flash'),
  MENTOR_SEARCH_TIMEOUT_MS: z.coerce.number().int().min(1000).max(110000).default(60000),
  MIN_MENTOR_MATCH_SCORE: z.coerce.number().int().min(0).max(100).default(60),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});
export function getConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = schema.safeParse(env);
  if (!parsed.success) throw new MentorError('SERVER_CONFIGURATION_ERROR', 503, 'Invalid mentor service configuration.');
  const v = parsed.data;
  const origins = v.ALLOWED_ORIGINS.split(',').map(x => x.trim()).filter(Boolean);
  if (origins.some(x => { try { return new URL(x).origin !== x || !/^https?:/.test(x); } catch { return true; } }))
    throw new MentorError('SERVER_CONFIGURATION_ERROR', 503, 'ALLOWED_ORIGINS must contain HTTP(S) origins.');
  return {model: v.GEMINI_MODEL, timeoutMs: v.MENTOR_SEARCH_TIMEOUT_MS, minScore: v.MIN_MENTOR_MATCH_SCORE, origins};
}
export type Config = ReturnType<typeof getConfig>;
