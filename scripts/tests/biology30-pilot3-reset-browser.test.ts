import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';

test('practice reset works without native dialogs and preserves completed work', async()=>{
 const root=path.resolve('projects/biology30-unit-a-pilot-3/workspace');
 const server=createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+new URL(req.url!,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error();const data=await readFile(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${(server.address() as any).port}/index.html`;
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.confirm=()=>false;});
 await page.route(/youtube|google|vimeo/,r=>r.abort());
 try{
  await page.goto(url+'#practice');await page.locator('#activity-flashcards [data-generated-start]').waitFor({state:'visible'});
  const flash=page.locator('#activity-flashcards');await flash.locator('[data-generated-start]').click();
  for(let i=0;i<10;i++){await flash.locator('[data-generated-reveal]').click();await flash.locator('[data-generated-self="recalled"]').click();await flash.locator('[data-generated-next]').click();}
  await flash.locator('.practice-summary').waitFor();
  await flash.locator('[data-generated-another]').click();
  for(const [route,id] of [['practice','flashcards'],['fill-in-the-blanks','blanks'],['multiple-choice','multiple-choice'],['mixed-practice','mixed-practice']]){
   await page.goto(url+'#'+route);const section=page.locator(`[data-activity="${id}"]`);
   if(await section.locator('[data-generated-start]:visible').count())await section.locator('[data-generated-start]').click();
   const prompt=await section.locator('.generated-question h3').innerText();
   await section.locator('[data-generated-reset]').click();await section.locator('[data-reset-cancel]').click();
   assert.equal(await section.locator('.generated-question h3').innerText(),prompt);
   await section.locator('[data-generated-reset]').click();await section.locator('[data-reset-confirmed]').click();
   await section.locator('[data-practice-setup]:visible').waitFor();assert.equal(await section.locator('.generated-question').count(),0);
   await page.reload();await section.locator('[data-practice-setup]:visible').waitFor();
  }
  await page.goto(url+'#labeling-practice');const labels=page.locator('#activity-labeling');
  await labels.locator('[data-start]').click();const field=labels.locator('select[data-answer]').first();await field.selectOption({index:1});
  await labels.locator('[data-reset-run]').click();await labels.locator('[data-reset-cancel]').click();assert.notEqual(await field.inputValue(),'');
  await labels.locator('[data-reset-run]').click();await labels.locator('[data-reset-confirmed]').click();
  await page.waitForFunction(()=>document.querySelector('#activity-labeling [data-timer]')?.textContent==='Not started');assert.equal(await field.inputValue(),'');
  assert.equal(await labels.locator('[data-practice-reset-confirmation]').count(),0);
  await page.reload();await page.waitForFunction(()=>document.querySelector('#activity-labeling [data-timer]')?.textContent==='Not started');
  await page.goto(url+'#process-collection');assert.match(await page.locator('[data-collection-status]').innerText(),/^1 completed run/);
  assert.equal(await page.locator('[data-progress-percent]').innerText(),'0%');assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
