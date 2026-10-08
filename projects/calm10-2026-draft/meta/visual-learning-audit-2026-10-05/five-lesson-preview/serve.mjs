import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const site=path.join(dir,'site');
const course=path.resolve(dir,'../../../workspace');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.mp4':'video/mp4','.pdf':'application/pdf','.vtt':'text/vtt'};
http.createServer((req,res)=>{
 res.setHeader('Cache-Control','no-store');
 let rel;try{rel=decodeURIComponent(new URL(req.url,'http://127.0.0.1:4196').pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400).end();return;}
 if(rel.split('/').some(x=>x==='..'||x==='.')||rel.includes('\\')){res.writeHead(403).end();return;}
 const file=path.join(rel.startsWith('assets/')?course:site,rel);
 try{
  const stat=fs.statSync(file);if(!stat.isFile())throw Error();res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  if(req.headers.range){const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!m){res.writeHead(416).end();return;}const start=+m[1],end=m[2]?Math.min(+m[2],stat.size-1):stat.size-1;if(start>end){res.writeHead(416).end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1,'Accept-Ranges':'bytes'});fs.createReadStream(file,{start,end}).pipe(res);}
  else{res.setHeader('Content-Length',stat.size);fs.createReadStream(file).pipe(res);}
 }catch{res.writeHead(404).end('Not found');}
}).listen(4196,'127.0.0.1',()=>console.log('CALM five-lesson visual preview: http://127.0.0.1:4196/#fl1-01-stage-4'));
