import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve('projects/biology30-unit-a-pilot-3/workspace');
const server=createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url!,'http://localhost').pathname));if(!file.startsWith(root+path.sep))throw Error('path');const data=await readFile(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}});
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
 await page.goto(url+'#lesson-01');await saved();const term=page.locator('[data-bio-term]').first();await term.scrollIntoViewIfNeeded();const scroll=await page.evaluate(()=>scrollY);await term.click();assert(await page.locator('dialog.bio-vocabulary').isVisible());await page.keyboard.press('Escape');await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>location.hash),'#lesson-01');assert(Math.abs((await page.evaluate(()=>scrollY))-scroll)<3);
 const textbookLinks=page.locator('[data-book-page]');assert.equal(await textbookLinks.count(),106);for(const link of await textbookLinks.all()){const pdfPage=Number(await link.getAttribute('data-book-page')),label=await link.innerText(),printed=label.match(/(?:p\. |page )(\d+)/i)?.[1];if(printed)assert.equal(Number(printed),pdfPage+359,label);}
 await page.goto(url+'#lesson-10');await saved();const textbookLink=page.locator('#lesson-10 [data-book-page]').first();await textbookLink.focus();await textbookLink.click();const textbookDialog=page.locator('[data-textbook-dialog]');assert(await textbookDialog.isVisible());assert.equal(await page.evaluate(()=>location.hash),'#lesson-10');assert.equal(await textbookDialog.locator('[data-textbook-dialog-title]').innerText(),'Textbook page 389');assert.match(await textbookDialog.locator('iframe').getAttribute('src')??'',/readerPage=30#page=30$/);assert.match(await textbookDialog.locator('[data-textbook-dialog-external]').getAttribute('href')??'',/#page=30$/);await textbookDialog.locator('[data-textbook-close]').click();assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-book-page')),'30');
 await page.screenshot({path:'/tmp/biology30-pilot3-desktop.png'});
 assert.equal(await page.locator('[data-chapter11-complete]').count(),14);
 const lessonVideos=await page.locator('[data-chapter11-complete] [data-video]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-video')));
 const libraryVideos=await page.locator('#video-library [data-video]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-video')));
 assert.equal(lessonVideos.length,22);assert.deepEqual(libraryVideos,lessonVideos);
 for(const width of [1117,390]){
  await page.setViewportSize({width,height:902});
  for(const route of ['lesson-02','lesson-03']){await page.goto(url+'#'+route);await saved();for(const [i,figure] of (await page.locator('#'+route+' figure').all()).entries()){
   await figure.scrollIntoViewIfNeeded();await figure.locator('img').evaluate((img:HTMLImageElement)=>img.decode());
   assert(await figure.locator('img').evaluate((img:HTMLImageElement)=>img.naturalWidth>500));
   await figure.screenshot({path:`/tmp/biology30-pilot3-integrated-${route}-${width}-${i}.png`});
  }}
 }
 await page.goto(url+'#lesson-10');await saved();
 await page.locator('#lesson-10 [data-video] iframe').first().waitFor();
 assert.equal(await page.locator('#lesson-10 [data-video] iframe').count(),3);assert.equal(await page.locator('#lesson-10 [data-load-video]:visible').count(),0);
 await page.goto(url+'#video-library');await saved();
 for(const v of await page.locator('#video-library [data-video]').all()){assert.match(await v.locator('iframe').getAttribute('src')??'',/youtube-nocookie/);assert.equal(await v.locator('[data-load-video]:visible').count(),0);}
 const newChecks=await page.locator('[data-activity-mode="paired"]').evaluateAll(nodes=>nodes.map(n=>({id:(n as HTMLElement).dataset.activity!,route:n.closest('.course-page')!.id})));
 for(const check of newChecks){
  await page.goto(url+'#'+check.route);await saved();const section=page.locator(`[data-activity="${check.id}"]`);await section.locator('[data-start]').click();await page.waitForTimeout(60);
  const question=await section.locator('[data-question]').getAttribute('data-question');const correct=await page.evaluate(id=>(window as any).PILOT3_CATALOG.questions.find((q:any)=>q.id===id).correct,question);
  await section.locator('[data-answer]').evaluateAll((nodes,key)=>{const wrong=nodes.find(n=>(n as HTMLInputElement).value!==key) as HTMLInputElement;wrong.click();},correct);
  await section.locator('[data-check]').click();await page.waitForTimeout(60);assert(await section.locator('textarea').isDisabled());
  await section.locator('[data-answer]').evaluateAll((nodes,key)=>(nodes.find(n=>(n as HTMLInputElement).value===key) as HTMLInputElement).click(),correct);
  await section.locator('[data-check]').click();await page.waitForTimeout(60);assert(await section.locator('textarea').isEnabled());
  await section.locator('textarea').fill('x'.repeat(3201));await section.locator('[data-submit-writing]').click();await page.waitForTimeout(60);assert.equal((await section.locator('textarea').inputValue()).length,3201);
  await section.locator('textarea').fill('x'.repeat(3200));await section.locator('[data-submit-writing]').click();await page.waitForTimeout(60);await section.locator('[data-submit-run]').click();await page.waitForTimeout(60);assert.match(await section.locator('[data-run-status]').innerText(),/First-try mark: 0\/1/);
  await page.reload();await saved();assert.equal((await section.locator('textarea').inputValue()).length,3200);
 }
 assert.equal(await page.locator('[data-progress-percent]').innerText(),'100%');
 for(const viewport of [{width:1440,height:900},{width:1024,height:768},{width:390,height:844}]){
  await page.setViewportSize(viewport);for(const route of await page.locator('.course-page').evaluateAll(nodes=>nodes.map(n=>n.id))){await page.goto(url+'#'+route);await saved();await page.waitForTimeout(120);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' horizontal overflow');for(const img of await page.locator('#'+route+' img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate((n:HTMLImageElement)=>n.decode());assert(await img.evaluate((n:HTMLImageElement)=>n.naturalWidth>0),'image failed '+route);}}
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
 const receipt={passed:true,candidateSha256:createHash('sha256').update(await readFile(root+'/index.html')).digest('hex'),runtimeSha256:createHash('sha256').update(await readFile(root+'/assets/pilot3-runtime.js')).digest('hex'),checks:['protected-course-preservation','legacy wrong-correct unlock and 900/901 boundary','legacy writing reload, first-try mark, redo and best mark','all three memorization modes','written review','eight-word cap and Frayer reload','popup route scroll and Escape','106 textbook links match the printed-page offset and open the in-course page reader','22 matching lesson/library videos and HTTP iframe creation','all nine added paired checks: wrong/correct unlock, 3200/3201 boundary, finish and reload','ten-check progress reaches 100%','all 23 routes and their images at desktop/tablet/mobile without overflow','200% text and narrow-layout checks','forced IndexedDB failure and draft recovery'],at:new Date().toISOString()};
 await writeFile('projects/biology30-unit-a-pilot-3/meta/verification.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
}finally{await browser.close();server.close();}
