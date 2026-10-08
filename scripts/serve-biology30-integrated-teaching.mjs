import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2'};
for(const [port,slug] of [[57310,'biology30-unit-a-pilot-3'],[57311,'biology30-unit-a-pilot-3'],[57312,'biology30-chapter-12'],[57313,'biology30-chapter-12']]){
 const base=path.resolve('projects',slug,'workspace');
 http.createServer((req,res)=>{
  let url,target;try{url=new URL(req.url,'http://127.0.0.1');target=path.resolve(base,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));}catch{res.writeHead(400).end();return;}
  if(!target.startsWith(base+path.sep)){res.writeHead(403).end();return;}
  fs.stat(target,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(target).pipe(res);});
 }).listen(port,'127.0.0.1',()=>console.log(`http://127.0.0.1:${port}/ (${slug}${port%2?' disposable QA':''})`));
}
