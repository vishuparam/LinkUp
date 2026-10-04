import { setTimeout as delay } from 'node:timers/promises';
import { MentorError, timeoutError } from '../mentor/errors.js';
export function statusOf(e: unknown): number | undefined {
  if (typeof e !== 'object' || e === null) return undefined;
  for (const k of ['status', 'statusCode', 'code']) { const v = Reflect.get(e, k); if (typeof v === 'number') return v; }
  return undefined;
}
export async function retry<T>(fn: () => Promise<T>, signal: AbortSignal): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    if (signal.aborted) throw timeoutError();
    try { return await fn(); } catch (e) {
      if (signal.aborted) throw timeoutError();
      if (e instanceof MentorError) throw e;
      const status = statusOf(e);
      // A 429 may mean a daily quota or a long retry-after. Immediate retries
      // consume requests without making the current search more likely to finish.
      const transient = (status !== undefined && status >= 500) || e instanceof TypeError || (e instanceof Error && /network|fetch|connection/i.test(e.name));
      if (!transient || attempt >= 2) throw new MentorError(
        status === 429 ? 'GROQ_RATE_LIMITED' : 'GROQ_ERROR',
        status === 429 ? 503 : 502,
        status === 429 ? 'Groq is rate limited or out of quota. Check API usage.' : 'Groq could not complete the search.',
      );
      try { await delay(300 * 2 ** attempt + Math.random() * 100, undefined, {signal}); } catch { throw timeoutError(); }
    }
  }
}
