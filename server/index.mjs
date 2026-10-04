import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleLinkedInApi } from './linkedin/api.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = resolve(root, 'dist');
const dev = process.argv.includes('--dev');
if (dev) {
  process.env.ALLOWED_ORIGINS = [...new Set([
    ...(process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    'http://127.0.0.1:5173', 'http://localhost:5173',
  ])].join(',');
}
const log = dev ? (event, details = {}) => {
  process.stdout.write(`[LinkedIn Launch] ${event} ${JSON.stringify(details)}\n`);
} : () => {};
let vite = null;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

async function apiRequest(req, res) {
  if (req.url?.startsWith('/api/find-mentors') || req.url?.startsWith('/api/health')) {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 24000) {
        res.writeHead(413, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ error: { code: 'INVALID_REQUEST', message: 'Request too large' } }));
        return;
      }
    }
    req.body = body;
    res.status = code => { res.statusCode = code; return res; };
    res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); return res; };
    const module = req.url.startsWith('/api/health')
      ? await import('../api/health.ts') : await import('../api/find-mentors.ts');
    await module.default(req, res);
    return;
  }
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 65536) {
      res.writeHead(413, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ error: 'Request too large' }));
      return;
    }
  }
  const request = new Request(`http://localhost${req.url}`, {
    method: req.method, headers: req.headers, body: req.method === 'POST' ? body : undefined,
  });
  const response = await handleLinkedInApi(request, { log });
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}

async function staticRequest(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const target = resolve(dist, `.${pathname}`);
  if (target !== dist && !target.startsWith(`${dist}${sep}`)) { res.writeHead(403); res.end(); return; }
  let file = target;
  let content;
  try { content = await readFile(file); }
  catch {
    file = resolve(dist, 'index.html');
    try { content = await readFile(file); }
    catch { res.writeHead(404); res.end('Build the app first.'); return; }
  }
  res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(req.method === 'HEAD' ? undefined : content);
}

const server = createServer((req, res) => {
  if (req.url?.startsWith('/api/')) {
    void apiRequest(req, res).catch(() => { res.writeHead(500); res.end(); });
  } else if (vite) {
    vite.middlewares(req, res);
  } else {
    void staticRequest(req, res).catch(() => { res.writeHead(500); res.end(); });
  }
});

if (dev) {
  const { createServer: createViteServer } = await import('vite');
  vite = await createViteServer({ server: { middlewareMode: true, hmr: { server } }, appType: 'spa' });
}

const port = Number(process.env.PORT || 5173);
server.listen(port, process.env.HOST || '127.0.0.1', () => {
  process.stdout.write(`LinkUp ${dev ? 'development' : 'production'} server listening on http://127.0.0.1:${port}\n`);
});
