import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium,type Page} from 'playwright';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';

const root=path.resolve('projects/biology30-unit-a-pilot-3/workspace');
const server=createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url!,'http://local').pathname));if(!file.startsWith(root+path.sep))throw Error('path');const data=await readFile(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}});
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${(server.address() as {port:number}).port}/index.html`;
const browser=await chromium.launch({headless:true});
test.after(async()=>{await browser.close();server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));});
const saved=(page:Page)=>page.waitForFunction(()=>document.querySelector('[data-local-status]')?.textContent?.startsWith('Saved'));
const item=(page:Page)=>page.waitForSelector('#activity-multiple-choice [data-generated-item]');
const correct=(page:Page)=>page.evaluate(()=>{const id=document.querySelector<HTMLElement>('[data-generated-item]')!.dataset.generatedItem!,[conceptId,suffix]=id.split(':mc-'),concept=(window as any).PILOT3_PRACTICE_BANK.concepts.find((x:any)=>x.id===conceptId);return concept.mcVariants.find((x:any)=>x.id===suffix).answer as string;});
const choose=(page:Page,value:string)=>page.locator('#activity-multiple-choice input[data-generated-answer]').evaluateAll((nodes,answer)=>(nodes.find(node=>(node as HTMLInputElement).value===answer) as HTMLInputElement).click(),value);

test('dedicated MC practice restores, retries, records work and stays formative',async()=>{
 const context=await browser.newContext({viewport:{width:1117,height:902}}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'#multiple-choice');await saved(page);const section=page.locator('#activity-multiple-choice');
 await section.locator('[data-practice-lesson]').selectOption('lesson-05');await section.locator('[data-practice-count]').selectOption('20');await section.locator('[data-generated-start]').click();await item(page);await saved(page);
 const first={id:await section.locator('[data-generated-item]').getAttribute('data-generated-item'),options:await section.locator('.practice-choice').allTextContents()};assert.match(await section.innerText(),/Question 1 of 20/);
 await page.reload();await saved(page);await item(page);assert.deepEqual({id:await section.locator('[data-generated-item]').getAttribute('data-generated-item'),options:await section.locator('.practice-choice').allTextContents()},first);assert.equal(await page.locator('[data-progress-count]').innerText(),'0 of 12 chapter checks');await page.screenshot({path:'/tmp/biology30-pilot3-multiple-choice.png',fullPage:true});
 await context.close();

 const practice=await browser.newContext({viewport:{width:320,height:844}}),learner=await practice.newPage();learner.on('pageerror',error=>errors.push(error.message));await learner.goto(base+'#multiple-choice');await saved(learner);const run=learner.locator('#activity-multiple-choice');await run.locator('[data-practice-count]').selectOption('5');await run.locator('[data-generated-start]').click();await item(learner);await saved(learner);
 const answer=await correct(learner),choices=await run.locator('input[data-generated-answer]').evaluateAll(nodes=>nodes.map(node=>(node as HTMLInputElement).value)),wrong=choices.filter(choice=>choice!==answer);await choose(learner,wrong[0]);await run.locator('[data-generated-check]').click();await learner.waitForFunction(()=>document.querySelector('[data-generated-feedback]')?.textContent?.includes('Cue:'));const cue=await run.locator('[data-generated-feedback]').innerText();assert.match(cue,/Not yet\. Cue:/);assert.doesNotMatch(cue,/Answer:/);await choose(learner,wrong[1]);await run.locator('[data-generated-check]').click();await learner.waitForFunction(()=>document.querySelector('[data-generated-feedback]')?.textContent?.includes('Answer:'));assert.match(await run.locator('[data-generated-feedback]').innerText(),/Answer:/);
 const projection=await learner.evaluate(()=>JSON.parse(localStorage.getItem('biology30-unit-a-pilot-3:generated-practice-resume:v1')!));const stored=projection.sessions['multiple-choice'];assert.equal(stored.items.length,5);assert.equal(stored.items[0].options.length,4);assert.equal(stored.attempts.length,2);assert.equal(stored.attempts[0].firstTry,true);assert.equal(stored.attempts[0].correct,false);assert.equal(stored.attempts[1].attemptNumber,2);assert.equal(await learner.locator('[data-progress-count]').innerText(),'0 of 12 chapter checks');assert.equal(await learner.locator('text=Investigation reference').count(),0);assert.equal(await learner.locator('text=This online pilot does not ask').count(),0);assert(await learner.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await practice.close();
},30_000);

test('every Practice and Review activity can cancel or confirm an in-progress reset',async()=>{
 const context=await browser.newContext({viewport:{width:1117,height:902}}),page=await context.newPage();
 for(const [route,activity] of [['practice','flashcards'],['fill-in-the-blanks','blanks'],['multiple-choice','multiple-choice'],['mixed-practice','mixed-practice']] as const){
  await page.goto(base+'#'+route);await saved(page);const section=page.locator(`[data-activity="${activity}"]`);await section.locator('[data-generated-start]').click();await section.locator('[data-generated-reset]').waitFor();const id=await section.locator('[data-generated-item]').getAttribute('data-generated-item');await section.locator('[data-generated-reset]').click();await section.locator('[data-reset-cancel]').click();assert.equal(await section.locator('[data-generated-item]').getAttribute('data-generated-item'),id);await section.locator('[data-generated-reset]').click();await section.locator('[data-reset-confirmed]').click();await section.locator('[data-practice-setup]').waitFor();assert.equal(await section.locator('[data-generated-item]').count(),0);await page.reload();await saved(page);assert(await section.locator('[data-practice-setup]').isVisible());
 }
 await page.goto(base+'#labeling-practice');await saved(page);const labeling=page.locator('#activity-labeling');await labeling.locator('[data-start]').click();await labeling.locator('[data-reset-run]').waitFor();await labeling.locator('[data-answer]').first().selectOption('sensory neuron');await labeling.locator('[data-reset-run]').click();await labeling.locator('[data-reset-confirmed]').click();await page.waitForFunction(()=>document.querySelector<HTMLButtonElement>('#activity-labeling [data-start]')?.disabled===false);assert.equal(await labeling.locator('[data-answer]').first().inputValue(),'');assert.equal(await labeling.locator('[data-run-body]').getAttribute('disabled'),'');
 assert.equal(await page.evaluate(()=>localStorage.getItem('biology30-unit-a-pilot-3:generated-practice-resume:v1')),null);await context.close();
},30_000);
