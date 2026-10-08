import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const root = path.resolve('projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer/teacher-led-trial-v0.4.0/evaluation');
if (!fs.existsSync(path.join(root, 'preservation-report.json'))) throw new Error('Build and review the candidate before serving.');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation' };
const servers = [];
for (const [port, folder] of [[57210, root], [57211, path.join(root, 'baseline')], [57212, path.join(root, 'new')], [57213, path.join(root, 'new')]]) {
  const server = http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); } catch { res.writeHead(400).end(); return; }
    const file = path.resolve(folder, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(folder + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    const real = fs.realpathSync(file);
    if (!real.startsWith(fs.realpathSync(folder) + path.sep)) { res.writeHead(404).end(); return; }
    const size = fs.statSync(file).size;
    const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
    const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    let start = 0, end = size - 1;
    if (match) {
      start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end;
      if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(match ? 206 : 200, headers);
    if (req.method === 'HEAD') res.end(); else fs.createReadStream(file, { start, end }).pipe(res);
  });
  server.on('error', error => { console.error(error.message); for (const s of servers) s.close(); process.exitCode = 1; });
  server.listen(port, '127.0.0.1'); servers.push(server);
}
console.log('Lesson 2 comparison: http://127.0.0.1:57210/?lesson=02');
console.log('Full-width new trial: http://127.0.0.1:57212/index.html#lesson-02');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { for (const server of servers) server.close(); });
