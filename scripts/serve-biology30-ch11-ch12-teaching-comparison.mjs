import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/ch11-ch12-handoff-v1.0.1/evaluation');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2'};
for(const [port,folder] of [[57300,'.'],[57301,'ch11-old'],[57302,'ch11-new'],[57303,'ch12-old'],[57304,'ch12-new'],[57305,'ch11-new'],[57306,'ch12-new']]){
 const base=path.resolve(root,folder);
 http.createServer((req,res)=>{const url=new URL(req.url,'http://127.0.0.1'),name=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname),target=path.resolve(base,'.'+name);if(!target.startsWith(base+path.sep)){res.writeHead(403).end();return;}fs.stat(target,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(target).pipe(res);});}).listen(port,'127.0.0.1',()=>console.log(`http://127.0.0.1:${port}/ (${folder})`));
}
