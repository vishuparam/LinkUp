import { expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '../src/utils/vercel-types.js';
import { createFindMentorsHandler } from '../api/find-mentors.js';
import health from '../api/health.js';
import { findMentors } from '../src/mentor/index.js';
import { MentorError } from '../src/mentor/errors.js';
import { input, mockPipeline } from './fixtures.js';
function request(body: unknown = input, method = 'POST', headers: Record<string, string> = {'content-type': 'application/json'}): VercelRequest { return {method, headers, body} as VercelRequest; }
function response() {
  const res = {statusCode: 0, payload: undefined as unknown, headers: {} as Record<string, unknown>, setHeader(k: string, v: unknown) {this.headers[k] = v; return this;}, status(n: number) {this.statusCode = n; return this;}, json(data: unknown) {this.payload = data; return this;}, end() {return this;}};
  return {res, typed: res as unknown as VercelResponse};
}
it('POST returns frontend contract through the full mocked engine', async () => {
  const m = mockPipeline(); const r = response();
  await createFindMentorsHandler((body, opts) => findMentors(body, {...opts, client: m.client}))(request(), r.typed);
  expect(r.res.statusCode).toBe(200); expect(r.res.payload).toHaveProperty('mentors'); expect(r.res.headers['Cache-Control']).toBe('no-store');
});
it.each([{body: '{bad', method: 'POST', status: 400}, {body: {}, method: 'POST', status: 400}, {body: input, method: 'GET', status: 405}])('rejects invalid HTTP requests', async ({body, method, status}) => { const r = response(); await createFindMentorsHandler()(request(body, method), r.typed); expect(r.res.statusCode).toBe(status); });
it('handles allowed preflight without Gemini', async () => { const r = response(); const engine = vi.fn(); await createFindMentorsHandler(engine)(request(undefined, 'OPTIONS', {'content-type': 'application/json', origin: 'http://localhost:3000'} as Record<string,string>), r.typed); expect(r.res.statusCode).toBe(204); expect(engine).not.toHaveBeenCalled(); expect(r.res.headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000'); });
it('rejects unapproved origins', async () => { const r = response(); await createFindMentorsHandler()(request(input, 'POST', {'content-type': 'application/json', origin: 'https://evil.example'} as Record<string,string>), r.typed); expect(r.res.statusCode).toBe(403); });
it.each([['GEMINI_RATE_LIMITED', 503], ['SEARCH_TIMEOUT', 504], ['GEMINI_ERROR', 502], ['SERVER_CONFIGURATION_ERROR', 503]] as const)('maps %s', async (code, status) => { const r = response(); await createFindMentorsHandler(async () => {throw new MentorError(code, status, 'Safe message');})(request(), r.typed); expect(r.res.statusCode).toBe(status); });
it('sanitizes unexpected errors', async () => { const r = response(); await createFindMentorsHandler(async () => {throw new Error('secret-api-key');})(request(), r.typed); expect(r.res.statusCode).toBe(500); expect(JSON.stringify(r.res.payload)).not.toContain('secret-api-key'); });
it('health is keyless', () => { const r = response(); health(request(undefined, 'GET'), r.typed); expect(r.res.payload).toEqual({status: 'ok', service: 'linkup-mentor-finder'}); });
it('maps Vercel lazy body-parser failures to invalid input', async () => {
  const req = request(); Object.defineProperty(req, 'body', {get() {throw new SyntaxError('Invalid JSON');}});
  const r = response(); await createFindMentorsHandler()(req, r.typed);
  expect(r.res.statusCode).toBe(400); expect(r.res.payload).toMatchObject({error: {code: 'INVALID_REQUEST'}});
});
