import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import {estimateWorstCaseState} from '../lib/biology30-unit-a-pilot-2/build-full.js';
const file=path.resolve('projects/biology30-unit-a-pilot-2/workspace/index.html'),key='biology30-unit-a-pilot-2:state:v1';
test('A Pilot2 individual word save, reload, migration, capacity, popup and narrow layout',async()=>{
 const html=await readFile(file,'utf8'),v=JSON.parse(await readFile('projects/biology30-unit-a-pilot-2/meta/core-vocabulary.json','utf8'));
 const estimate=estimateWorstCaseState(html,v.fixedMilestones.map((e:any)=>e.entryId));
 assert.ok(estimate.characters<=44000);console.log('A maximum '+estimate.characters);
 const browser=await chromium.launch();try{
  for(const width of [1117,390]){
   const page=await browser.newPage({viewport:{width,height:902}}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(({key})=>{const seed=localStorage.getItem('word-test-seed');if(seed){localStorage.setItem(key,seed);localStorage.removeItem('word-test-seed')}},{key});
   await page.addInitScript("Object.defineProperty(navigator,'clipboard',{value:{writeText:async function(text){window.copiedCollection=text}}})");
   await page.goto(pathToFileURL(file).href+'#core-vocabulary');
   const ids=await page.locator('[data-biology-word-view]').evaluateAll(ns=>ns.map(n=>n.getAttribute('data-biology-word-view')!));assert.equal(ids.length,141);
   const open=async(id:string)=>{await page.locator('[data-biology-select-word="'+id+'"]').first().click();return page.locator('[data-word-frayer="'+id+'"]')};
   for(const id of ids.slice(0,8)){const n=await open(id);await n.locator('[data-word-choose]').click();}
   let n=await open(ids[8]);await n.locator('[data-word-choose]').click();await expect(n.locator('[data-word-save-status]')).toContainText('eight slots');
   n=await open(ids[0]);for(let i=0;i<4;i++)await n.locator('[data-word-answer="'+i+'"]').fill('My explanation '+i);
   await n.locator('[data-word-compare]').click();await expect(n.locator('[data-word-model]')).toContainText('Active regulation');
   await n.locator('[data-word-collect]').click();await page.reload();n=await open(ids[0]);await expect(n.locator('[data-word-answer="0"]')).toHaveValue('My explanation 0');
   await page.evaluate(()=>location.hash='process-collection');await page.locator('[data-copy-collection]').first().click();assert.match(await page.evaluate(()=>(window as any).copiedCollection),/My explanation 0/);
   await page.evaluate(()=>location.hash='lesson-09');const term=page.locator('[data-bio-term="homeostasis"]:visible').first();await term.scrollIntoViewIfNeeded();const before=await page.evaluate(()=>({hash:location.hash,y:scrollY}));await term.click();
   const dialog=page.locator('dialog.bio-vocabulary');await dialog.locator('[data-bio-frayer]>summary').click();await dialog.locator('[data-word-answer="0"]').fill('Updated in popup');await page.keyboard.press('Escape');await expect(term).toBeFocused();assert.deepEqual(await page.evaluate(()=>({hash:location.hash,y:scrollY})),before);
   await page.evaluate(()=>location.hash='core-vocabulary');n=await open(ids[0]);await expect(n.locator('[data-word-answer="0"]')).toHaveValue('Updated in popup');
   const saved=await page.evaluate(k=>localStorage.getItem(k),key);await n.locator('[data-word-answer="0"]').fill('x'.repeat(241));await expect(n.locator('[data-word-save-status]')).toContainText('Not saved');assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),saved);
   await n.locator('[data-word-answer="0"]').fill('Revised');await n.locator('details>summary').click();await n.locator('[data-word-remove]').click();await expect(n.locator('[data-word-save-status]')).toContainText('confirm');await n.locator('[data-word-remove-confirm]').check();await n.locator('[data-word-remove]').click();
   n=await open(ids[8]);await n.locator('[data-word-choose]').click();await expect(n.locator('[data-word-answer="0"]')).toHaveValue('');
   await page.screenshot({path:'/tmp/biology30-a-word-reader-'+width+'.png'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
   // Original category writing is not reassigned to an individual word.
   await page.evaluate(()=>{localStorage.setItem('word-test-seed',JSON.stringify({version:6,responses:{'biology30-unit-a-pilot-2:core-vocabulary:homeostasis:definition':'Earlier category writing'},vocabulary:{activeId:'homeostasis',choiceIds:[],collectedIds:[]}}))});
   await page.reload();await expect(page.locator('[data-word-legacy-record="homeostasis"]')).toContainText('Earlier category writing');
   // Exercise full ordinary and Unicode envelopes through the real runtime.
   for(const char of ['x','漢','🧬']){
    const payload=JSON.stringify(estimate.state).replace(/x{2,}/g,s=>char.repeat(Math.floor(s.length/char.length)));
    await page.evaluate(payload=>localStorage.setItem('word-test-seed',payload),payload);await page.reload();await page.evaluate(()=>window.dispatchEvent(new Event('beforeunload')));
    const raw=await page.evaluate(k=>localStorage.getItem(k)!,key);assert.ok(raw.length<=44000);assert.equal(JSON.parse(raw).wordFrayers.s.length,8);
   }
   await page.close();
  }
 }finally{await browser.close();}
});
