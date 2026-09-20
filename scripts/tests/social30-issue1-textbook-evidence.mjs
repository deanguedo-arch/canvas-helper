import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const slug='social30-1-related-issue-1-option-2',url=`${process.argv[2]||'http://127.0.0.1:8768'}/projects/${slug}/workspace/index.html#textbook-practice`;
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage();await page.goto(url);
await page.evaluate(()=>{writeManualEvidenceNotes([{id:'existing-note',source:'Existing source',detail:'Existing evidence'}]);const field=document.querySelector('[data-evidence-note="lesson"]');field.value='Existing lesson evidence';persistResponseField(field);});
const record=page.locator('[data-book-record="p30-q1"]'),answer=record.locator('textarea'),collect=record.locator('[data-book-collect]');
await collect.click();assert.match(await page.locator('[data-book-status]').textContent(),/Write a response/);assert.equal(await page.evaluate(()=>readManualEvidenceNotes().length),1);
await answer.fill('Practice evidence snapshot');await collect.click();await collect.click();
let notes=await page.evaluate(()=>readManualEvidenceNotes());assert.equal(notes.length,2);assert.equal(notes.find(n=>n.id==='textbook-practice-p30-q1').detail,'Practice evidence snapshot');assert.match(notes[0].source,/p\. 30, question 1/);
await answer.fill('Later draft');await page.evaluate(()=>showPage('evidence-bank'));assert.ok(await page.locator('[data-manual-evidence-list]').textContent().then(s=>s.includes('Practice evidence snapshot')&&s.includes('Existing evidence')));assert.match(await page.locator('[data-lesson-evidence-list]').first().textContent(),/Existing lesson evidence/);
await page.reload();assert.equal((await page.evaluate(()=>readManualEvidenceNotes())).find(n=>n.id==='textbook-practice-p30-q1').detail,'Practice evidence snapshot');
await page.evaluate(()=>showPage('textbook-practice'));assert.equal(await answer.inputValue(),'Later draft');await collect.click();notes=await page.evaluate(()=>readManualEvidenceNotes());assert.equal(notes.length,2);assert.equal(notes.find(n=>n.id==='textbook-practice-p30-q1').detail,'Later draft');
await page.evaluate(()=>showPage('evidence-bank'));await page.locator('[data-remove-evidence-note="textbook-practice-p30-q1"]').first().click();assert.equal(await page.evaluate(()=>readManualEvidenceNotes().length),1);await page.evaluate(()=>showPage('textbook-practice'));assert.equal(await answer.inputValue(),'Later draft');
console.log('PASS: empty guard; sourced snapshot; duplicate-free update; independent draft; reload; existing manual/lesson evidence retained; evidence removal retains writing.');
}finally{await browser.close();}
