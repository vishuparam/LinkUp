import { sanitizeProfile } from './sanitize.mjs';
import { generateWithGroq, ProviderError } from './provider.mjs';
import { assembleProfileKit } from './kit.mjs';

const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

/** Testable route handler. The provider is injected in tests, so no API credits are used. */
export async function handleLinkedInApi(request, { provider = generateWithGroq, log = () => {} } = {}) {
  const path = new URL(request.url).pathname;
  if (path === '/api/linkedin-launch/diagnostic' && request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
    const allowed = new Set(['client_invalid_json', 'client_missing_kit', 'client_invalid_kit']);
    if (!allowed.has(body?.reason)) return json({ error: 'Invalid diagnostic' }, 400);
    log('fallback', { stage: 'client', reason: body.reason });
    return json({ ok: true });
  }
  if (path !== '/api/linkedin-launch/generate') return json({ error: 'Not found' }, 404);
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  log('endpoint_received', { method: request.method });
  let body;
  try { body = await request.json(); }
  catch { log('request_rejected', { reason: 'invalid_request_json' }); return json({ error: 'Invalid JSON' }, 400); }
  const profile = sanitizeProfile(body?.profile);
  let draft;
  try {
    draft = await provider(profile, { log });
  } catch (error) {
    const reason = error instanceof ProviderError ? error.code : 'provider_unexpected_error';
    log('fallback', { stage: 'provider', reason });
    return json({ error: 'AI generation unavailable', reason }, 503);
  }
  try {
    const kit = assembleProfileKit(profile, draft);
    log('validation_passed');
    return json({ kit, mode: 'ai' });
  } catch (error) {
    // Validation messages are fixed strings from kit.mjs and contain no profile text.
    const reason = error instanceof Error ? error.message : 'unknown_validation_error';
    log('validation_failed', { reason });
    log('fallback', { stage: 'validation', reason });
    return json({ error: 'AI generation unavailable', reason: 'validation_failed' }, 503);
  }
}
