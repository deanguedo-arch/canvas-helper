import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root=path.resolve(process.cwd(),'projects/math10c-unit4-pilot/workspace');
const output=path.resolve(process.cwd(),'projects/math10c-unit4-pilot/meta/evidence/screenshots');
const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
const server=createServer(async(request,response)=>{try{const pathname=decodeURIComponent(new URL(request.url||'/','http://localhost').pathname),relative=pathname==='/'?'index.html':pathname.replace(/^\//,''),file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)&&file!==path.join(root,'index.html'))throw Error('invalid path');response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');response.end(await readFile(file));}catch{response.statusCode=404;response.end('Not found');}});

await mkdir(output,{recursive:true});
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
const address=server.address();if(!address||typeof address==='string')throw Error('server did not start');
const base=`http://127.0.0.1:${address.port}/index.html`;
const browser=await chromium.launch({headless:true});
try{
  for(const width of [1280,320]){
    const page=await browser.newPage({viewport:{width,height:width===1280?900:740}});
    for(let lesson=41;lesson<=48;lesson++){
      await page.goto(`${base}#u4-${lesson}`,{waitUntil:'load'});
      await page.screenshot({path:path.join(output,`lesson-4-${lesson-40}-${width}.png`),fullPage:true});
    }
    for(const route of ['u4-errors','u4-review']){
      await page.goto(`${base}#${route}`,{waitUntil:'load'});
      await page.screenshot({path:path.join(output,`${route}-${width}.png`),fullPage:true});
    }
    await page.close();
  }
}finally{await browser.close();server.close();}
console.log(`Captured Chapter 4 review screenshots in ${output}`);
