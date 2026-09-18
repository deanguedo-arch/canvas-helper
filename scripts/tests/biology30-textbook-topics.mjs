/* Focused Build-mode topic navigation/save check, not course certification. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{for(const chapter of [11,12,13]){
 const slug=chapter===11?'biology30-unit-a-pilot-3':`biology30-chapter-${chapter}`;
 const context=await browser.newContext(),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url=`file://${process.cwd()}/projects/${slug}/workspace/index.html#textbook-practice`;
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForSelector('[data-book-topic] option',{state:'attached'});
 const manifest=await page.locator('#textbook-practice-data').evaluate(el=>JSON.parse(el.textContent));
 assert.equal(manifest.questions.length,{11:93,12:90,13:102}[chapter]);
 assert.equal(new Set(manifest.questions.map(q=>q.id)).size,manifest.questions.length);
 assert(manifest.questions.every(q=>q.topics.length));
 for(const value of ['all',...manifest.topics.map(t=>t.id),'chapter-review']){
  const expected=manifest.questions.filter(q=>value==='all'||(value==='chapter-review'?q.group==='chapter-review':q.topics.includes(value)));
  await page.locator('[data-book-topic]').selectOption(value);
  await page.waitForFunction(n=>document.querySelectorAll('[data-book-picker] option').length===n,expected.length);
  assert.deepEqual(await page.locator('[data-book-picker] option').evaluateAll(els=>els.map(el=>el.value)),expected.map(q=>q.id));
  assert.equal(await page.locator('.book-question-tile').count(),expected.length);
 }
 const shared=manifest.questions.find(q=>q.topics.length>1);
 await page.locator('[data-book-topic]').selectOption(shared.topics[0]);
 await page.waitForFunction(id=>Array.from(document.querySelector('[data-book-picker]').options).some(o=>o.value===id),shared.id);
 await page.getByRole('button',{name:shared.label,exact:true}).click();
 await page.waitForFunction(id=>document.querySelector('[data-book-picker]').value===id,shared.id);
 await page.locator('[data-book-text]').fill(`Chapter ${chapter}: draft survives topic switching`);
 await page.locator('[data-book-topic]').selectOption(shared.topics[1]);
 await page.waitForFunction(()=>document.querySelector('[data-book-status]').textContent.startsWith('Drafts autosave'));
 assert.equal(await page.locator('[data-book-picker]').inputValue(),shared.id);
 assert.equal(await page.locator('[data-book-text]').inputValue(),`Chapter ${chapter}: draft survives topic switching`);
 await page.locator('[data-book-save]').click();
 await page.waitForFunction(()=>document.querySelector('[data-book-status]').textContent.startsWith('Question work saved'));
 assert.equal(await page.locator(`[data-book-work-id="${shared.id}"]`).count(),1);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForSelector('[data-book-topic] option',{state:'attached'});
 await page.getByRole('button',{name:shared.label,exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[data-book-question-state]').textContent==='Saved');
 assert.equal(await page.locator('[data-book-text]').inputValue(),`Chapter ${chapter}: draft survives topic switching`);
 const target=manifest.topics[0].id;
 await page.evaluate(target=>{document.querySelector(`[data-textbook-topic="${target}"]`).click();},target);
 await page.waitForFunction(target=>document.querySelector('[data-book-topic]').value===target,target);
 const ids=manifest.questions.filter(q=>q.topics.includes(target)).map(q=>q.id);
 await page.getByRole('button',{name:manifest.questions.find(q=>q.id===ids[0]).label,exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[data-book-prev]').disabled);
 await page.locator('[data-book-next]').click();
 await page.waitForFunction(id=>document.querySelector('[data-book-picker]').value===id,ids[1]);
 assert.deepEqual(errors,[]);
 console.log(`Chapter ${chapter}: topic inventory, shared saved response, reload, lesson links and bounded navigation passed`);
 await context.close();
}}
finally{await browser.close();}
