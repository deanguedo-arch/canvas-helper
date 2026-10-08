// Approved B is canonical. Historical comparison paths redirect to the active course.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const course = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../workspace');
const inside = p => p.startsWith(course + path.sep) || p === course;
const types = {'.html':'text/html; charset=utf-8','.md':'text/plain; charset=utf-8','.json':'application/json','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp4':'video/mp4','.vtt':'text/vtt','.pdf':'application/pdf','.woff2':'font/woff2'};
http.createServer((req,res) => {
  let url, relative;
  try { url = new URL(req.url, 'http://127.0.0.1:4195'); relative = decodeURIComponent(url.pathname).replace(/^\//,''); }
  catch { res.writeHead(400).end(); return; }
  res.setHeader('Cache-Control','no-store');
  if (/^review\/[ab](?:\/index\.html|\/)?$/.test(relative) || /^(?:co1-01-(?:comparison|review)|finlit-integration-comparison|(?:ce1-03|fl3-04)-finlit-review)\.html$/.test(relative)) {
    // A Location without a fragment inherits the original browser fragment.
    res.writeHead(302, {Location:'/index.html'+url.search}).end(); return;
  }
  relative = relative.replace(/^review\/[ab]\//,'');
  const file = path.resolve(course,relative || 'index.html');
  if (!inside(file)) { res.writeHead(403).end(); return; }
  try {
    const stat = fs.statSync(file); if (!stat.isFile()) throw Error();
    res.setHeader('Content-Type',types[path.extname(file)] || 'application/octet-stream');
    const range = req.headers.range;
    if (range && path.extname(file)==='.mp4') {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) { res.writeHead(416, {'Content-Range':`bytes */${stat.size}`}).end(); return; }
      const start = +match[1], end = match[2] ? Math.min(+match[2],stat.size-1) : stat.size-1;
      if (start > end) { res.writeHead(416, {'Content-Range':`bytes */${stat.size}`}).end(); return; }
      res.writeHead(206, {'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});
      fs.createReadStream(file,{start,end}).pipe(res);
    } else {
      res.setHeader('Content-Length',stat.size); fs.createReadStream(file).pipe(res);
    }
  } catch { res.writeHead(404).end('Not found'); }
}).listen(4195,'127.0.0.1',()=>console.log('CALM canonical course: http://127.0.0.1:4195/'));
