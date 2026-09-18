import fs from 'node:fs';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{for(const chapter of [12,13]){
 const dir=`projects/biology30-chapter-${chapter}/workspace`,$=load(fs.readFileSync(`${dir}/index.html`)),C=JSON.parse($('#course-data').text());
 const counts=[];
 for(const items of [C.guidedActivities.flatMap(a=>a.guided.items),C.transferChecks.flatMap(a=>a.mc)]){
  const groups=new Map();
  for(const q of items){const n=q.options.length;assert.equal(new Set(q.options).size,n);assert(q.options.includes(q.answer));const positions=groups.get(n)||Array(n).fill(0);groups.set(n,positions);positions[q.options.indexOf(q.answer)]++;const choices=$(`[data-guided-item="${q.id}"] select option`).map((i,e)=>$(e).attr('value')).get().filter(Boolean);if(choices.length)assert.deepEqual(choices,q.options);else assert.deepEqual($(`[data-transfer-choice="${q.id}"]`).map((i,e)=>$(e).attr('value')).get(),q.options);}
  for(const positions of groups.values())assert(Math.max(...positions)-Math.min(...positions)<=1);counts.push(Object.fromEntries(groups));
 }
 for(const d of C.labelDiagrams.filter(d=>[1,3,5,7,8].includes(Number(d.id.split('-').at(-1)))))assert(fs.existsSync(`${dir}/${d.src}`));
 const context=await browser.newContext(),page=await context.newPage(),spec=C.transferChecks[0],old=C.transferLegacyChoices[0].options.find(o=>!spec.mc[0].options.includes(o));assert(old);
 await page.goto(`file://${process.cwd()}/${dir}/index.html#${spec.route}`);await page.waitForFunction(()=>window.BIOLOGY_HTML);
 const first={mc:{[spec.mc[0].id]:old},writing:'Earlier work',score:0,at:1,afterFeedback:false};
 await page.evaluate(({spec,old,first})=>{const S=window.BIOLOGY_HTML.getSnapshot();S.transfer??={};S.transfer[spec.id]={draft:{mc:{[spec.mc[0].id]:old},writing:'Earlier work',usedHelp:false},submissions:[first]};localStorage.setItem(window.BIOLOGY_HTML.storageKey,JSON.stringify(S));},{spec,old,first});await page.reload();await page.waitForFunction(()=>window.BIOLOGY_HTML);
 assert.equal(await page.locator('[data-legacy-choice] input').inputValue(),old);assert(await page.locator('[data-legacy-choice] input').isChecked());assert.deepEqual(await page.evaluate(id=>window.BIOLOGY_HTML.getSnapshot().transfer[id].submissions[0],spec.id),first);
 for(const q of spec.mc)await page.locator(`[data-transfer-choice="${q.id}"]`).evaluateAll((els,answer)=>{const el=els.find(e=>e.value===answer);el.checked=true;el.dispatchEvent(new Event('input',{bubbles:true}));},q.answer);
 await page.locator(`[data-transfer="${spec.id}"] [data-transfer-submit]`).click();assert.deepEqual(await page.evaluate(id=>window.BIOLOGY_HTML.getSnapshot().transfer[id].submissions[0],spec.id),first);assert.equal(await page.evaluate(id=>window.BIOLOGY_HTML.getSnapshot().transfer[id].submissions.at(-1).score,spec.id),3);
 await context.close();console.log(JSON.stringify({chapter,positions:counts,legacyDraftAndFirstSubmission:'preserved'}));
}}finally{await browser.close();}
