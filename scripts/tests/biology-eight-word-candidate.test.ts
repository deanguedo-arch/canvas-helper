import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {loadBiology20UnitA} from '../lib/biology20-course/unit-a-inputs.js';
import {decodeTopicState,emptyTopicState,encodeTopicState} from '../lib/biology30-course/v1/pilot2-state.js';
const url=pathToFileURL(path.resolve('projects/biology20-unit-a/workspace/index.html')).href;
test('failed word saves preserve the visible draft and last valid payload across route changes',async()=>{
 const browser=await chromium.launch();try{
  const page=await browser.newPage();await page.goto(url+'#a-core-vocabulary');
  await page.locator('[data-biology-select-word="a-term-albedo"]').click();
  const node=page.locator('[data-word-frayer="a-term-albedo"]'),field=node.locator('[data-word-answer="0"]');
  await node.locator('[data-word-choose]').click();await field.fill('Previously saved writing');
  const prior=await page.evaluate(()=>localStorage.getItem('biology20-unit-a:state:v1'));
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Storage unavailable','QuotaExceededError');};});
  await field.fill('Unsaved writing must stay visible');await expect(node.locator('[data-word-save-status]')).toContainText('Device saving failed');
  assert.equal(await page.evaluate(()=>localStorage.getItem('biology20-unit-a:state:v1')),prior);
  await page.evaluate(()=>{location.hash='a-all-my-work';});await expect(page.locator('#a-all-my-work')).toBeVisible();
  await page.evaluate(()=>{location.hash='a-core-vocabulary';});await page.locator('[data-biology-select-word="a-term-albedo"]').click();
  await expect(field).toHaveValue('Unsaved writing must stay visible');
 }finally{await browser.close();}
});
test('eight freely chosen word Frayers save, collect, remove and reopen without replacing another word',async()=>{
 const a=await loadBiology20UnitA(process.cwd()),browser=await chromium.launch();
 try{for(const width of [1117,390]){
  const page=await browser.newPage({viewport:{width,height:902}}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'#a-core-vocabulary');
  const ids=a.input.vocabulary.introducedTerms.slice(0,9).map(t=>t.id);
  const open=async(id:string)=>{await page.locator(`[data-biology-select-word="${id}"]`).first().click();return page.locator(`[data-word-frayer="${id}"]`);};
  for(const id of ids.slice(0,8)){const node=await open(id);await node.locator('[data-word-choose]').click();await expect(node.locator('textarea')).toHaveCount(4);}
  let node=await open(ids[8]);await node.locator('[data-word-choose]').click();await expect(node.locator('[data-word-save-status]')).toContainText('eight slots');await expect(node.locator('textarea')).toHaveCount(0);
  node=await open(ids[0]);for(const [i,field] of (await node.locator('[data-word-answer]').all()).entries())await field.fill('Original word '+i);await node.locator('[data-word-collect]').click();await expect(page.locator('[data-p2-vocabulary-progress]')).toHaveText('1 of 8');
  await page.reload();node=await open(ids[0]);await expect(node.locator('[data-word-answer="0"]')).toHaveValue('Original word 0');await expect(node.locator('[data-word-collect]')).toHaveText('Remove from Process Collection');
  await node.locator('summary').click();await node.locator('[data-word-remove]').click();await expect(node.locator('[data-word-save-status]')).toContainText('confirm');await expect(node.locator('[data-word-answer="0"]')).toHaveValue('Original word 0');
  await node.locator('[data-word-remove-confirm]').check();await node.locator('[data-word-remove]').click();await expect(node.locator('[data-word-choose]')).toBeVisible();
  node=await open(ids[8]);await node.locator('[data-word-choose]').click();await node.locator('[data-word-answer="0"]').fill('Replacement belongs only to this word');await page.reload();node=await open(ids[8]);await expect(node.locator('[data-word-answer="0"]')).toHaveValue('Replacement belongs only to this word');
  const saved=await page.evaluate(()=>localStorage.getItem('biology20-unit-a:state:v1'));const state=decodeTopicState(saved!,a.schema);assert.equal(state.wordFrayers!.length,8);assert.ok(!state.wordFrayers!.some(s=>s.id===ids[0]));
  await node.locator('[data-word-answer="0"]').fill('漢'.repeat(241));await expect(node.locator('[data-word-save-status]')).toContainText('Not saved');await expect(node.locator('[data-word-answer="0"]')).toHaveValue('漢'.repeat(241));
  await open(ids[1]);node=await open(ids[8]);await expect(node.locator('[data-word-answer="0"]')).toHaveValue('漢'.repeat(241));await node.locator('[data-word-answer="0"]').fill('Safe revision');
  await page.evaluate(()=>{location.hash='a-all-my-work';});await expect(page.locator('[data-pilot2-work-list]')).toContainText('Safe revision');assert.deepEqual(errors,[]);await page.close();
 }}finally{await browser.close();}
});
test('earlier family writing migrates under its original label without becoming a selected word',async()=>{
 const a=await loadBiology20UnitA(process.cwd()),old=emptyTopicState(a.schema),id=a.schema.families.fixed[0];
 a.schema.families.responseIds[id].forEach((field,i)=>old.responses[field]='Earlier broad answer '+i);old.flags.push(id+'-collected');
 const other=Object.keys(a.schema.responses).find(field=>!Object.values(a.schema.families.responseIds).flat().includes(field))!;old.responses[other]='Unrelated answer';
 const raw=encodeTopicState(old,a.schema),browser=await chromium.launch();try{
  const page=await browser.newPage();await page.goto(url);await page.evaluate(raw=>localStorage.setItem('biology20-unit-a:state:v1',raw),raw);await page.reload();await page.evaluate(()=>{location.hash='a-core-vocabulary';});
  await expect(page.locator('[data-word-legacy-record]')).toContainText('Earlier broad answer 0');
  const saved=decodeTopicState((await page.evaluate(()=>localStorage.getItem('biology20-unit-a:state:v1')))!,a.schema);assert.equal(saved.responses[other],'Unrelated answer');assert.equal(saved.wordFrayers![0].kind,'legacy');assert.equal(saved.wordFrayers![0].id,id);assert.equal(saved.wordFrayers![0].collected,true);assert.equal(saved.wordFrayers!.length,1);
 }finally{await browser.close();}
});
