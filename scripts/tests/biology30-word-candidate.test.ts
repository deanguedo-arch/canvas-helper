import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {load} from 'cheerio';
import {chromium,expect} from '@playwright/test';

for(const [unit,count] of [['b',153],['c',249],['d',99]] as const)test(unit+' candidate: every word, exact lesson targets, eight slots and shared popup writing',async()=>{
 const file=path.resolve(`projects/biology30-unit-${unit}/workspace/index.html`),$=load(await readFile(file,'utf8')),data=JSON.parse($('#biology-word-data').text());
 assert.equal(data.words.length,count);
 for(const w of data.words){assert.equal($(`[data-biology-word-view="${w.id}"]`).length,1);const target=$(`[id="${data.wordTargets[w.id]}"]`);assert.equal(target.length,1,w.term);assert.ok(target.text().toLowerCase().includes(w.term.toLowerCase()),w.term+' exact teaching context');}
 const browser=await chromium.launch();try{for(const width of [1117,768,559,390]){
  const page=await browser.newPage({viewport:{width,height:902},deviceScaleFactor:width===559?2:1}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(file).href+'#'+unit+'-core-vocabulary');
  const open=async(id:string)=>{await page.locator(`[data-biology-select-word="${id}"]`).first().click();return page.locator(`[data-word-frayer="${id}"]`);};
  for(const w of data.words.slice(0,8)){const node=await open(w.id);await node.locator('[data-word-choose]').click();}
  let node=await open(data.words[8].id);await node.locator('[data-word-choose]').click();await expect(node.locator('[data-word-save-status]')).toContainText('eight slots');
  node=await open(data.words[0].id);for(let i=0;i<4;i++)await node.locator(`[data-word-answer="${i}"]`).fill('Word-specific draft '+i);await node.locator('[data-word-collect]').click();await page.reload();node=await open(data.words[0].id);await expect(node.locator('[data-word-answer="0"]')).toHaveValue('Word-specific draft 0');
  await page.evaluate(route=>{location.hash=route;},data.wordRoutes[data.words[0].id]);const term=page.locator('[data-bio-term="'+data.words[0].term.toLowerCase()+'"]:visible').first();await term.scrollIntoViewIfNeeded();const before=await page.evaluate(()=>({hash:location.hash,y:scrollY}));await term.click();
  const dialog=page.locator('dialog.bio-vocabulary');await dialog.locator('[data-bio-frayer]>summary').click();await expect(dialog.locator('[data-word-answer="0"]')).toHaveValue('Word-specific draft 0');await dialog.locator('[data-word-answer="0"]').fill('Edited in lesson popup');await page.keyboard.press('Escape');await expect(term).toBeFocused();assert.deepEqual(await page.evaluate(()=>({hash:location.hash,y:scrollY})),before);
  await page.evaluate(unit=>{location.hash=unit+'-core-vocabulary';},unit);node=await open(data.words[0].id);await expect(node.locator('[data-word-answer="0"]')).toHaveValue('Edited in lesson popup');await node.locator('details>summary').click();await node.locator('[data-word-remove]').click();await expect(node.locator('[data-word-save-status]')).toContainText('confirm');await node.locator('[data-word-remove-confirm]').check();await node.locator('[data-word-remove]').click();node=await open(data.words[8].id);await node.locator('[data-word-choose]').click();await expect(node.locator('[data-word-answer="0"]')).toHaveValue('');
  await page.locator(`[data-biology-word-view="${data.words[8].id}"] h2`).scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/biology30-${unit}-word-reader-${width}.png`});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.equal(await page.locator(`[data-biology-select-word="${data.words[8].id}"]`).first().evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(233, 242, 238)');
  if(width===390)assert.ok(await page.locator('[data-biology-word-reader]>.vocabulary-index').evaluate(n=>n.getBoundingClientRect().height<=321));
  if(width===559)await page.screenshot({path:`/tmp/biology30-${unit}-word-reader-zoom.png`});
  assert.deepEqual(errors,[]);await page.close();
 }}finally{await browser.close();}
});
