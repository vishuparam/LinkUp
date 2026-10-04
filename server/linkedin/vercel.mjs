import { handleLinkedInApi } from './api.mjs';

/** Thin Vercel bridge; the same sanitized handler also serves local development. */
export async function handleVercelLinkedIn(req, res) {
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  if (Buffer.byteLength(body) > 65536) return res.status(413).json({ error: 'Request too large' });
  const request = new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: { 'content-type': req.headers['content-type'] || 'application/json' },
    body: req.method === 'POST' ? body : undefined,
  });
  const response = await handleLinkedInApi(request);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(response.status).json(await response.json());
}
