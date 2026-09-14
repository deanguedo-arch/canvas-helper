import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';
import {loadBiology20UnitA} from '../lib/biology20-course/unit-a-inputs.js';
import {emptyTopicState,encodeTopicState,decodeTopicState} from '../lib/biology30-course/v1/pilot2-state.js';
import {buildTopicActivityIndex} from '../lib/biology30-course/v1/pilot2-activity-index.js';
import {runBiology30TopicModel} from '../lib/biology30-course/v1/pilot2-models.js';

test('complete A inventory and authored answers preserve existing capacities and independent identities',async()=>{
 const a=await loadBiology20UnitA(process.cwd());assert.equal(a.input.contract.topics.length,6);assert.equal(a.core.parts.length,18);assert.equal(a.practice.length,32);assert.equal(a.input.figures.length,18);assert.equal(a.input.contract.requiredRoutes.length,10);
 assert.equal(a.maximum,43393);assert.ok(a.capacity.every(c=>c.characters<44000));assert.equal(buildTopicActivityIndex(a.activities).length,82);
 const state=emptyTopicState(a.schema);for(const r of a.examples)state.responses[r.id]=r.example;
 assert.deepEqual({...decodeTopicState(encodeTopicState(state,a.schema),a.schema).responses},state.responses);
 assert.deepEqual(new Set(a.practice.filter(p=>p.kind==='multiple-choice').map(p=>p.correctIndex)),new Set([0,1,2,3]));
 for(const t of a.input.contract.topics)assert.equal(a.practice.filter(p=>p.routeId===t.id&&p.role==='guided').length,2);
 assert.equal(2400/20000*100,12);assert.equal(500+80+40-50-100,470);assert.equal(120-85-20,15);assert.equal((18+20+22)/3,20);assert.equal(180/1200*100,15);
 const model=a.integrated.models[0];for(const [choice,change] of [['light',2],['reduced-light',-3],['fewer-producers',-2]] as const){const result=runBiology30TopicModel(model,choice);assert.equal(result.values.oxygenChange,change);assert.equal(result.rows[1][3],-change);}
});

test('full A desktop/mobile: every route, saves, vocabulary, model and visible figures',async()=>{
 const a=await loadBiology20UnitA(process.cwd()),out=path.resolve('projects/biology20-unit-a/workspace');const browser=await chromium.launch();
 try{for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(out,'index.html')).href);await expect(page.locator('#pilot2-course-surface')).toBeVisible();await expect(page.locator('#pilot2-recovery')).toBeHidden();
  await page.evaluate(()=>document.fonts.ready);
  const go=async(route:string)=>{await page.evaluate(route=>{location.hash=route;},route);await expect(page.locator('#'+(route==='a-overview'?'overview':route))).toBeVisible();};
  for(const route of a.schema.routes){await go(route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Overflow '+route);}
  assert.deepEqual(await page.locator('.sidebar [data-page-target]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-page-target')).filter(id=>!document.getElementById(id!))),[]);
  for(const [i,t] of a.input.contract.topics.entries()){
   await go(t.id);await expect(page.locator('#'+t.id+' .p2-part')).toHaveCount(3);await expect(page.locator('#'+t.id+' .p2-advanced')).toHaveCount(3);
   for(const img of await page.locator('#'+t.id+' .p2-part img').all()){await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate((n:HTMLImageElement)=>n.complete&&n.naturalWidth>0)).toBe(true);}
   await page.locator('#'+t.id+' .lesson-header').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/bio20-a-module-${width}-lesson-${i+1}.png`});
  }
  const first=a.input.contract.topics[0].id;await go(first);const r=a.examples.find(r=>r.id===first+'-retrieval'),field=page.locator(`[data-pilot2-response="${r.id}"]`);await field.fill(r.example);await page.reload();await expect(field).toHaveValue(r.example);
  await field.fill('漢'.repeat(r.limit+1));await expect(page.locator('[data-pilot2-save-status]').first()).toContainText('Not saved');await expect(field).toHaveValue('漢'.repeat(r.limit+1));const saved=await page.evaluate(()=>localStorage.getItem('biology20-unit-a:state:v1'));assert.equal(decodeTopicState(saved!,a.schema).responses[r.id],r.example);await field.fill(r.example);
  const term=page.locator('#'+first+' .lesson-block [data-bio-term="albedo"]').first();await term.scrollIntoViewIfNeeded();const before=await page.evaluate(()=>({hash:location.hash,y:scrollY}));await term.click();const dialog=page.locator('dialog.bio-vocabulary');await expect(dialog).toBeVisible();await dialog.locator('[data-bio-frayer] > summary').click();await dialog.locator('[data-word-choose]').click();await dialog.locator('[data-word-answer="0"]').fill('My reflected fraction explanation.');await page.screenshot({path:`/tmp/bio20-a-module-${width}-vocabulary.png`});await page.keyboard.press('Escape');await expect(term).toBeFocused();assert.deepEqual(await page.evaluate(()=>({hash:location.hash,y:scrollY})),before);
  await go('a-core-vocabulary');await page.locator('[data-biology-select-word="a-term-albedo"]').click();await expect(page.locator('[data-word-frayer="a-term-albedo"] [data-word-answer="0"]')).toHaveValue('My reflected fraction explanation.');
  const wordStyle=await page.locator('[data-biology-select-word="a-term-albedo"]').evaluate(node=>{const s=getComputedStyle(node);return{background:s.backgroundColor,color:s.color,radius:s.borderRadius,weight:s.fontWeight};});
  assert.deepEqual(wordStyle,{background:'rgb(233, 242, 238)',color:'rgb(23, 27, 27)',radius:'0px',weight:'400'},'Keep the A reader treatment, not the generic green action-button style');
  const meaningStyle=await page.locator('[data-biology-word-view="a-term-albedo"] h3.section-label').first().evaluate(node=>{const s=getComputedStyle(node);return{size:s.fontSize,transform:s.textTransform};});
  assert.deepEqual(meaningStyle,{size:'12px',transform:'uppercase'});
  await go('a-models');await page.locator('[data-pilot2-model-case-value="reduced-light"]').click();await page.locator('[data-pilot2-response="a-model-gas-prediction"]').fill('Oxygen falls because consumption exceeds production.');await page.locator('[data-pilot2-model-test]').click();await expect(page.locator('[data-pilot2-model-result]')).toContainText('-3');await page.locator('[data-pilot2-response="a-model-gas-explanation"]').fill('7 minus 10 is -3; the simplified CO2 change is +3.');await page.locator('[data-pilot2-collect="a-model-gas-collected"]').click();await page.reload();await expect(page.locator('[data-pilot2-response="a-model-gas-explanation"]')).toHaveValue('7 minus 10 is -3; the simplified CO2 change is +3.');await page.screenshot({path:`/tmp/bio20-a-module-${width}-model.png`});
  await go('a-all-my-work');await expect(page.locator('[data-pilot2-work-list]')).toContainText('My reflected fraction explanation.');await expect(page.locator('[data-pilot2-work-list]')).toContainText('7 minus 10');
  const index=buildTopicActivityIndex(a.activities);
  for(const r of a.examples.filter(r=>!r.id.startsWith('a-model-'))){const entry=index.find(e=>e.responses.some(x=>x.id===r.id))!;await go(entry.routeId);await page.locator(`[data-pilot2-response="${r.id}"]`).fill(r.example);}
  await page.reload();const exampleSave=await page.evaluate(()=>localStorage.getItem('biology20-unit-a:state:v1'));const restored=decodeTopicState(exampleSave!,a.schema);for(const r of a.examples.filter(r=>!r.id.startsWith('a-model-')))assert.equal(restored.responses[r.id],r.example);
  await go(first);await page.locator('[data-pilot2-enlarge]').first().click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  if(width===1440){await page.evaluate(()=>{document.documentElement.style.zoom='2';});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:'/tmp/bio20-a-module-zoom.png'});}
  assert.deepEqual(errors,[]);assert.ok((await page.evaluate(()=>Object.keys(localStorage))).every(k=>!k.startsWith('biology30')));await context.close();
 }}finally{await browser.close();}
});
