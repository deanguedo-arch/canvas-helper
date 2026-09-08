import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {load} from 'cheerio';
import {chromium,expect} from '@playwright/test';
const evidence='projects/resources/biology30-production/v1/pilot2/verification/2026-09-08-woven-videos';
test('woven source video is beside teaching and library/fallback links work on desktop and mobile',async()=>{
 await mkdir(evidence,{recursive:true});
 const server=createServer(async(req,res)=>{try{const m=/^\/(b|c|d)\/(.*)$/.exec(new URL(req.url!,'http://localhost').pathname);if(!m||m[2].includes('..'))throw Error('path');const file=path.join(process.cwd(),`projects/biology30-unit-${m[1]}/workspace`,m[2]||'index.html');res.setHeader('Content-Type',path.extname(file)==='.js'?'text/javascript':path.extname(file)==='.html'?'text/html':'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address==='object');const browser=await chromium.launch(),results:any[]=[];
 try{for(const unit of ['b','c','d'])for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 const route=unit==='b'?'b-topic-menstrual-cycle':unit==='c'?'c-topic-transcription':'d-topic-population-growth';
 await page.goto(`http://127.0.0.1:${address.port}/${unit}/#${route}`);if(width===390)await expect.poll(async()=>{const b=await page.locator('#course-sidebar').boundingBox();return b?b.x+b.width:0;}).toBeLessThanOrEqual(1);
 const block=page.locator(`#${route} .lesson-source-videos`);await expect(block).toHaveCount(1);await block.evaluate(el=>el.scrollIntoView({behavior:"instant",block:"center"}));await expect(block).toContainText('Watch for:');await expect(block.locator('iframe')).toHaveCount(1);const src=await block.locator('iframe').getAttribute('src');assert.ok(src?.includes('autoplay=0'));const video=await block.locator('[data-p2-source-video]').getAttribute('data-p2-source-video');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${evidence}/${unit}-${width}.png`});await block.locator(`[data-pilot2-return-focus="${route}-walkthrough"]`).click();await expect(page.locator(`#${route}-walkthrough`)).toBeVisible();await block.evaluate(el=>el.scrollIntoView({behavior:"instant",block:"center"}));await block.locator(`[data-pilot2-return-focus="source-library-${video}"]`).click();await expect(page.locator(`#source-library-${video}`)).toBeVisible();await expect(block.locator('iframe')).toHaveCount(0);results.push({unit,width,route,video,inline:true,walkthrough:true,library:true,hiddenPlayerRemoved:true,actualProviderPlayback:'not tested; external requests blocked'});await page.close();
 }await writeFile(`${evidence}/browser-results.json`,JSON.stringify({results},null,2)+'\n');}finally{await browser.close();await new Promise<void>(r=>server.close(()=>r()));}
});
