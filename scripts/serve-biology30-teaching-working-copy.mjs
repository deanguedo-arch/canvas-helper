import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Loopback-only, read-only, exact candidate allowlist. Never serves the repository.
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const comparison = process.argv.includes('--scout-comparison');
const review = path.join(repo, 'projects/biology30-unit-a-pilot-3/meta/teaching-overhaul', comparison ? '2026-10-03-scout-standard' : '2026-10-02-browser-authoring');
const root = await realpath(path.join(review, comparison ? 'comparison-copy' : 'working-copy'));
const manifest = JSON.parse(await readFile(path.join(review, comparison ? 'COMPARISON_MANIFEST.json' : 'WORKING_COPY_MANIFEST.json'), 'utf8'));
const allowed = new Set(manifest.files.map(file => file.path));
const portIndex = process.argv.indexOf('--port');
const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 57000;
if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('Use --port with an integer from 0 to 65535.');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const url = new URL(request.url, 'http://127.0.0.1');
    const file = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
    if (!allowed.has(file)) { response.writeHead(404).end('Not in this evaluation copy'); return; }
    const absolute = await realpath(path.join(root, file));
    if (!absolute.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    const info = await stat(absolute);
    const headers = { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes',
      'Referrer-Policy': 'strict-origin-when-cross-origin', 'Content-Length': info.size };
    const match = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    let start = 0, end = info.size - 1, status = 200;
    if (request.headers.range) {
      if (!match) { response.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
      start = Number(match[1]); end = match[2] ? Number(match[2]) : info.size - 1;
      if (start > end || end >= info.size) { response.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
      status = 206; headers['Content-Length'] = end - start + 1; headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    }
    response.writeHead(status, headers);
    if (request.method === 'HEAD') response.end(); else createReadStream(absolute, { start, end }).pipe(response);
  } catch { if (!response.headersSent) response.writeHead(400); response.end('Request unavailable'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Working evaluation copy: http://127.0.0.1:${server.address().port}/index.html#lesson-01`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
