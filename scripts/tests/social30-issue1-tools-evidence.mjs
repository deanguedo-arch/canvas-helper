import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${process.argv[2]||'http://127.0.0.1:8768'}/projects/social30-1-related-issue-1-option-2/workspace/index.html#issue-inquiry`);
 await page.evaluate(()=>writeManualEvidenceNotes([{id:'existing-proof',detail:'Keep existing evidence'}]));
 for(const [route,key] of [['issue-inquiry','issue-inquiry'],['source-analysis','source-analysis'],['position-builder','position-builder'],['core-vocabulary','vocabulary:identity'],['film-room',null]]){
  await page.evaluate(r=>showPage(r),route);
  const scope=route==='core-vocabulary'?page.locator('[data-frayer-owner="identity"]'):route==='film-room'?page.locator('[data-film-panel]').first():page.locator('#'+route);
  if(route==='core-vocabulary')await scope.locator('summary').click();
  const button=scope.locator('[data-tool-collect]').first();const actual=key||await button.getAttribute('data-tool-collect');
  await button.click();assert.equal((await page.evaluate(()=>readManualEvidenceNotes())).length,1+(route==='issue-inquiry'?0:route==='source-analysis'?1:route==='position-builder'?2:route==='core-vocabulary'?3:4));
  const field=scope.locator('textarea[data-response-id]').first();await field.fill('Evidence from '+route);await button.click();await button.click();
  assert.equal(await field.inputValue(),'Evidence from '+route);
  assert.equal((await page.evaluate(()=>readManualEvidenceNotes())).filter(n=>n.id==='student-tool-'+actual).length,1);
 }
 await page.evaluate(()=>showPage('core-vocabulary'));await page.locator('[data-vocabulary-record="identity"] [data-vocabulary-term]').click();
 const popup=page.locator('.social-vocabulary-dialog');await popup.locator('textarea').first().fill('Vocabulary popup evidence');await popup.locator('[data-tool-collect]').click();await page.keyboard.press('Escape');
 await page.evaluate(()=>showPage('evidence-bank'));await page.reload();
 const notes=await page.evaluate(()=>readManualEvidenceNotes());assert.equal(notes.length,6);assert.ok(notes.some(n=>n.id==='existing-proof'));assert.equal(notes.find(n=>n.id==='student-tool-vocabulary:identity').detail.includes('Vocabulary popup evidence'),true);assert.ok(notes.find(n=>n.toolKey?.startsWith('film:')).source.includes('http'));
 await page.evaluate(()=>showPage('position-builder'));assert.equal(await page.locator('#position-builder textarea').first().inputValue(),'Evidence from position-builder');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('PASS: all five Student Tools; empty guards; snapshot updates without duplicates; original fields retained; vocabulary popup; media source; reload; existing evidence retained; phone overflow.');
}finally{await browser.close();}
