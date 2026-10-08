import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.argv[2] || 'comparison/ch13-batch01-03-v0.1.2');
const firstPort = Number(process.argv[3] || 57430);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf','.ttf':'font/ttf','.woff2':'font/woff2'};
for (const [offset, folder] of [[0,'.'],[1,'new'],[2,'new'],[3,'old']]) {
  const port = firstPort + offset;
  const base=path.resolve(root,folder);
  http.createServer((req,res)=>{
    let target;
    try { const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname); target=path.resolve(base,'.'+(name==='/'?'/index.html':name)); }
    catch { res.writeHead(400).end(); return; }
    if (!target.startsWith(base+path.sep)) {res.writeHead(403).end();return;}
    fs.stat(target,(err,stat)=>{
      if(err||!stat.isFile()){res.writeHead(404).end('Not found');return;}
      res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(target).pipe(res);
    });
  }).listen(port,'127.0.0.1',()=>console.log(`http://127.0.0.1:${port}/ (${folder})`));
}
