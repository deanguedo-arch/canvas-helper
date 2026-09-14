import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve('projects/biology30-unit-a-pilot-3/workspace');
const server=createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url!,'http://localhost').pathname));if(!file.startsWith(root+path.sep))throw Error('path');const data=await readFile(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}});
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${(server.address() as any).port}/index.html`;
const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1117,height:902}}),page=await context.newPage(),errors:string[]=[];
page.on('pageerror',e=>errors.push(e.message));
const check=(s:string)=>page.locator('[data-activity="lesson-check"] '+s);
const saved=()=>page.waitForFunction(()=>document.querySelector('[data-local-status]')?.textContent?.startsWith('Saved'));
try{
 await page.goto(url+'#lesson-check');await saved();await check('[data-start]').click();await saved();
 await check('[data-question="check-1"] input').nth(1).check();await check('[data-question="check-1"] [data-check]').click();await page.waitForTimeout(80);
 assert(await check('[data-writing="written-1"]').isDisabled());
 await check('[data-question="check-1"] input').first().check();await check('[data-question="check-1"] [data-check]').click();await page.waitForTimeout(80);
 assert(await check('[data-writing="written-1"]').isEnabled());
 await check('[data-writing="written-1"]').fill('x'.repeat(901));await page.waitForTimeout(80);await check('[data-submit-writing]').first().click();await page.waitForTimeout(80);assert.equal(await check('[data-writing="written-1"]').inputValue(),'x'.repeat(901));
 await check('[data-writing="written-1"]').fill('x'.repeat(900));await check('[data-submit-writing]').first().click();await page.waitForTimeout(80);
 await page.reload();await saved();assert.equal(await check('[data-writing="written-1"]').inputValue(),'x'.repeat(900));assert(await check('[data-unlock="check-1"]').isEnabled());
 await check('[data-question="check-2"] input').nth(1).check();await check('[data-question="check-2"] [data-check]').click();await page.waitForTimeout(80);
 await check('[data-writing="written-2"]').fill('The spinal cord connects the sensory pathway to the motor pathway before conscious awareness in the brain. This quickly removes the hand from the hot glass.');await check('[data-submit-writing]').nth(1).click();await page.waitForTimeout(80);await check('[data-submit-run]').click();await page.waitForTimeout(80);assert.match(await check('[data-run-status]').innerText(),/1\/2/);
 await check('[data-redo]').click();await page.waitForTimeout(80);assert.equal(await check('[data-writing="written-1"]').inputValue(),'');
 for(let i=1;i<=2;i++){await check(`[data-question="check-${i}"] input`).nth(i-1).check();await check(`[data-question="check-${i}"] [data-check]`).click();await page.waitForTimeout(60);await check(`[data-writing="written-${i}"]`).fill('A complete authored test response explaining this source question.');await check('[data-submit-writing]').nth(i-1).click();await page.waitForTimeout(60);}
 await check('[data-submit-run]').click();await page.waitForTimeout(80);assert.match(await check('[data-run-status]').innerText(),/2\/2/);
 await page.goto(url+'#process-collection');await saved();assert.equal(await page.locator('.history-run').count(),2);assert.match(await page.locator('[data-collection-status]').innerText(),/2\/2/);
 await page.goto(url+'#practice');await saved();
 for(const id of ['flashcards','blanks','labeling']){
  const section=page.locator(`[data-activity="${id}"]`);await section.locator('[data-start]').click();await page.waitForTimeout(60);
  if(id==='flashcards'){for(const button of await section.locator('[data-self="recalled"]').all()){await button.click();await page.waitForTimeout(40);}}
  else{const values=id==='blanks'?['dendrite','axon','myelin','interneuron']:['sensory neuron','interneuron','motor neuron','sensory receptor','effector'];for(let i=0;i<values.length;i++){await section.locator('[data-answer]').nth(i).fill(values[i]);await section.locator('[data-check]').nth(i).click();await page.waitForTimeout(40);}}
  await section.locator('[data-submit-run]').click();await page.waitForTimeout(60);assert.match(await section.locator('[data-run-status]').innerText(),/Completed/);
 }
 await page.goto(url+'#topic-review');await saved();await page.locator('[data-activity="topic-review"] [data-start]').click();await page.waitForTimeout(50);
 for(let i=0;i<2;i++){await page.locator('#topic-review [data-writing]').nth(i).fill('Myelin insulates axons. Compared with similar unmyelinated axons, impulses generally travel faster because depolarization is renewed at nodes.');await page.locator('#topic-review [data-submit-writing]').nth(i).click();await page.waitForTimeout(50);}await page.locator('#topic-review [data-submit-run]').click();await page.waitForTimeout(50);
 await page.goto(url+'#core-vocabulary');await saved();
 const ids=await page.locator('[data-biology-word-view]').evaluateAll(nodes=>nodes.slice(0,9).map(n=>n.getAttribute('data-biology-word-view')!));
 for(const id of ids.slice(0,8)){await page.locator(`[data-biology-select-word="${id}"]`).first().click();await page.locator(`[data-word-frayer="${id}"] [data-word-choose]`).click();}
 await page.locator(`[data-biology-select-word="${ids[8]}"]`).first().click();await page.locator(`[data-word-frayer="${ids[8]}"] [data-word-choose]`).click();assert.match(await page.locator(`[data-word-frayer="${ids[8]}"] [data-word-save-status]`).innerText(),/eight slots/);
 await page.locator(`[data-biology-select-word="${ids[0]}"]`).first().click();const f=page.locator(`[data-word-frayer="${ids[0]}"]`);for(const field of await f.locator('textarea').all())await field.fill('A word-owned Frayer test response.');await f.locator('[data-word-collect]').click();
 await page.reload();await saved();assert.equal(await page.locator(`[data-word-frayer="${ids[0]}"] textarea`).first().inputValue(),'A word-owned Frayer test response.');
 await page.goto(url+'#lesson-01');await saved();const term=page.locator('[data-bio-term]').first();await term.scrollIntoViewIfNeeded();const scroll=await page.evaluate(()=>scrollY);await term.click();assert(await page.locator('dialog').isVisible());await page.keyboard.press('Escape');await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>location.hash),'#lesson-01');assert(Math.abs((await page.evaluate(()=>scrollY))-scroll)<3);
 await page.screenshot({path:'/tmp/biology30-pilot3-desktop.png'});
 await page.goto(url+'#video-library');await saved();await page.locator('#video-library [data-load-video]').first().click();assert.match(await page.locator('#video-library iframe').getAttribute('src')??'',/youtube-nocookie/);
 for(const viewport of [{width:1440,height:900},{width:1024,height:768},{width:390,height:844}]){
  await page.setViewportSize(viewport);for(const route of ['overview','lesson-01','practice','lesson-check','topic-review','process-collection','core-vocabulary','textbook-library','video-library','sources-and-credits']){await page.goto(url+'#'+route);await saved();await page.waitForTimeout(220);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' horizontal overflow');}
 }
 await page.goto(url+'#core-vocabulary');await saved();await page.waitForTimeout(250);await page.screenshot({path:'/tmp/biology30-pilot3-mobile.png'});
 await page.locator('[data-menu-button]').click();await page.waitForTimeout(250);assert(await page.locator('#course-sidebar').evaluate(n=>n.getBoundingClientRect().left>=0));await page.locator('.nav-link[href="#lesson-01"]').click();await page.waitForTimeout(250);assert(await page.locator('#course-sidebar').evaluate(n=>n.getBoundingClientRect().right<=1));
 // Match the established Biology text-200 profile, plus the effective viewport at 2x browser zoom.
 await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% text profile overflow');await page.evaluate(()=>{document.documentElement.style.fontSize='';});await page.setViewportSize({width:558,height:451});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'2x effective viewport overflow');
 // A quota/write failure leaves writing visible and permits explicit recovery by editing again.
 await page.goto(url+'#topic-review');await saved();await page.locator('#topic-review [data-redo]').click();await page.waitForTimeout(100);
 await page.evaluate(()=>{const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args:any[]){IDBObjectStore.prototype.put=original;throw new DOMException('Test quota failure','QuotaExceededError');};});
 const recovery=page.locator('#topic-review [data-writing]').first();await recovery.fill('Keep this draft during a saving failure.');await page.waitForTimeout(100);assert.equal(await recovery.inputValue(),'Keep this draft during a saving failure.');await recovery.fill('Keep this recovered draft.');await page.waitForTimeout(100);await page.reload();await saved();assert.equal(await recovery.inputValue(),'Keep this recovered draft.');
 const source=JSON.parse(await readFile('projects/biology30-unit-a-pilot-3/meta/source-map.json','utf8'));for(const [slug,hash] of Object.entries(source.protectedHashes))assert.equal(createHash('sha256').update(await readFile(`projects/${slug}/workspace/index.html`)).digest('hex'),hash);
 assert.deepEqual(errors,[]);
 const receipt={passed:true,candidateSha256:createHash('sha256').update(await readFile(root+'/index.html')).digest('hex'),checks:['source-preservation','wrong-correct-unlock','900/901-character boundary','reload-writing','first-try mark','redo history and best mark','all three memorization modes','written review','eight-word cap','Frayer reload','popup route scroll and Escape','HTTP embed creation','mobile six routes no overflow'],at:new Date().toISOString()};
 await writeFile('projects/biology30-unit-a-pilot-3/meta/verification.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
}finally{await browser.close();server.close();}
