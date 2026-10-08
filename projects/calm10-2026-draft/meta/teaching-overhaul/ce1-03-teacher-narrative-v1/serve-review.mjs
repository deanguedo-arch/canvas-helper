// Loopback-only pilot delivery. Assets come from the existing course; source is never edited.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const workspace=path.resolve(root,'../../../workspace');
const port=Number(process.env.CALM_REVIEW_PORT||4194);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.md':'text/plain; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.mp4':'video/mp4','.vtt':'text/vtt','.pdf':'application/pdf'};
const publicFiles=new Set(['index.html','review.css','manuscript.md']);
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let url;try{url=decodeURIComponent((req.url||'/').split('?')[0]);}catch{res.writeHead(400);res.end();return;}
 if(url.includes('..')||url.includes('\\')){res.writeHead(404);res.end();return;}
 let file;
 const asset=url.match(/^\/review\/[ab]\/assets\/(.+)$/);
 if(asset){file=path.resolve(workspace,'assets',asset[1]);if(!file.startsWith(path.join(workspace,'assets')+path.sep)){res.writeHead(404);res.end();return;}}
 else if(/^\/review\/[ab]\/[^/]+\.(html|css|js|json)$/.test(url))file=path.join(root,url.slice(1));
 else if(/^\/screens\/[ab]-(opening|vocabulary|worked|practice|independent)-(desktop|mobile)\.png$/.test(url))file=path.join(root,url.slice(1));
 else if(url==='/'||publicFiles.has(url.slice(1)))file=path.join(root,url==='/'?'index.html':url.slice(1));
 else{res.writeHead(404);res.end();return;}
 try{
  const stat=fs.statSync(file);if(!stat.isFile())throw Error('not a file');
  let start=0,end=stat.size-1,status=200;const range=req.headers.range;
  if(range){const m=range.match(/^bytes=(\d+)-(\d*)$/);if(!m){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Length',end-start+1);res.writeHead(status);
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404);res.end();}
});
server.listen(port,'127.0.0.1',()=>console.log(`CE1-03 A/B review: http://127.0.0.1:${port}/`));
