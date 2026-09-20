/** Focused Build check for shared Frayer fields and printed-page reader, not course certification.
 * Start a local repository HTTP preview, then run:
 * node scripts/tests/social30-issue1-lesson-tools.mjs http://127.0.0.1:8768
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import {load} from 'cheerio';
import {execFileSync} from 'node:child_process';
const slug='social30-1-related-issue-1-option-2';
const root=`projects/${slug}`;
const support=JSON.parse(fs.readFileSync(`${root}/meta/lesson-support.json`));
const $=load(fs.readFileSync(`${root}/workspace/index.html`,'utf8'));
const baseline=load(execFileSync('git',['show',`checkpoint-before-social-ela-2026-09-18:${root}/workspace/index.html`],{encoding:'utf8'}));
for(const attr of ['data-response-id','data-complete-id']){
  const now=new Set($(`[${attr}]`).map((i,e)=>$(e).attr(attr)).get());
  for(const old of baseline(`[${attr}]`).map((i,e)=>baseline(e).attr(attr)).get())assert.ok(now.has(old),`Missing ${attr}: ${old}`);
}
assert.equal($('#lessons').length,0);
assert.equal($('[data-lessons-toggle]').length,0);
assert.ok($('[data-social-nav-toggle="student-work"]').text().startsWith('Lessons'));
assert.equal($('.social-lesson-support').length,23);
assert.equal($('[data-vocabulary-record]').length,54);
assert.equal($('button button').length,0);
assert.equal($('[data-complete-id]').length,23);
assert.equal($('[data-book-record]').length,40);
assert.equal($('#social-nav-process-collection a').map((i,e)=>$(e).text()).get().join('|'),'Evidence Bank');

for(const source of support.textbook.sources)assert.ok(fs.existsSync(`${root}/workspace/${source.path}`));
for(const record of support.vocabulary){assert.ok(record.definition);assert.equal($(`[data-frayer-owner="${record.id}"] textarea`).length,4);}
const url=`${process.argv[2]||'http://127.0.0.1:8768'}/${root}/workspace/index.html`;
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const localFailures=[];page.on('response',response=>{if(response.url().startsWith(url.slice(0,url.lastIndexOf('/')))&&response.status()>=400)localFailures.push(response.url());});
try {
  await page.goto(url,{waitUntil:'domcontentloaded'});
  const responseId=$('[data-evidence-note="lesson"]').first().attr('data-response-id');
  assert.ok($('#'+support.lessons[18].route).text().includes('in the Introduction of the Perspectives on Ideology textbook'));
  const lesson=support.lessons[2].route;
  const frayerId=`${slug}:vocabulary:identity:meaning`;
  await page.evaluate(({slug,responseId})=>{
    localStorage.setItem(`canvas-helper:${slug}:responses`,JSON.stringify({[responseId]:'Existing evidence answer', [`${slug}:study-guide:vocabulary:identity`]:'Existing recall answer'}));
    localStorage.setItem(`canvas-helper:${slug}:manual-evidence-notes`,JSON.stringify([{id:'retained-note',concept:'Existing manual note',detail:'Keep this evidence',createdAt:'2026-09-18T00:00:00Z'}]));
    localStorage.setItem(`canvas-helper:${slug}:complete`,JSON.stringify(['lesson-1-u1identity-u1-introduction']));
  },{slug,responseId});
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('[data-progress-count-inline]').first().textContent(),'1/23');
  await page.screenshot({path:'/tmp/social-issue1-overview-desktop.png'});
  await page.evaluate(()=>showPage('core-vocabulary'));
  assert.equal(await page.locator('[data-vocabulary-count]').textContent(),'54 matching terms');
  await page.locator('[data-vocabulary-search]').fill('sovereign');
  assert.ok((await page.locator('[data-vocabulary-record]:visible').getAttribute('data-vocabulary-record'))==='social-contract');
  await page.locator('[data-vocabulary-search]').fill('no matching vocabulary word');
  assert.equal(await page.locator('[data-vocabulary-count]').textContent(),'0 matching terms');
  assert.equal(await page.locator('[data-vocabulary-record]:visible').count(),0);
  await page.locator('[data-vocabulary-search]').fill('');
  await page.locator('[data-vocabulary-topic]').selectOption('responses');
  assert.equal(await page.locator('[data-vocabulary-category]:visible').count(),1);
  await page.locator('[data-vocabulary-topic]').selectOption('all');
  await page.locator('[data-vocabulary-choose="identity"]').click();
  await page.locator('[data-frayer-owner="identity"] summary').click();
  await page.locator(`[data-response-id="${frayerId}"]`).fill('Page-written identity note');
  await page.locator('[data-vocabulary-record="identity"] [data-vocabulary-term]').click();
  assert.equal(await page.locator('[data-testid="vocabulary-panel"] textarea').first().inputValue(),'Page-written identity note');
  await page.locator('[data-testid="vocabulary-panel"] textarea').first().fill('Popup-written identity note');
  await page.screenshot({path:'/tmp/social-issue1-vocabulary-desktop.png'});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('.social-vocabulary-dialog').open);
  assert.equal(await page.locator(`[data-frayer-owner="identity"] [data-response-id="${frayerId}"]`).inputValue(),'Popup-written identity note');
  assert.equal(await page.locator(`[data-response-id="${frayerId}"]`).count(),1);
  await page.evaluate(route=>showPage(route),lesson);
  const term=page.locator(`#${lesson} .terms-line [data-vocabulary-term="identity"]`);
  await term.focus();await term.press('Enter');await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('.social-vocabulary-dialog').open);
  assert.equal(await term.evaluate(e=>document.activeElement===e),true);
  await page.screenshot({path:'/tmp/social-issue1-lesson-desktop.png'});
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator(`[data-response-id="${frayerId}"]`).inputValue(),'Popup-written identity note');
  assert.equal(await page.locator(`[data-response-id="${responseId}"]`).inputValue(),'Existing evidence answer');
  assert.equal(await page.locator(`[data-response-id="${slug}:study-guide:vocabulary:identity"]`).inputValue(),'Existing recall answer');
  await page.evaluate(()=>showPage('evidence-bank'));
  assert.ok((await page.locator('#evidence-bank').textContent()).includes('Existing evidence answer'));
  assert.ok((await page.locator('#evidence-bank').textContent()).includes('Existing manual note'));
  await page.evaluate(()=>showPage('library'));
  await page.locator('#library .social-reader-control button').click();
  for(const source of support.textbook.sources){
    for(const printed of [source.start,source.end]){
      await page.locator('[data-textbook-input]').fill(String(printed));await page.locator('[data-textbook-jump] button').click();
      assert.ok((await page.locator('[data-textbook-frame]').getAttribute('src')).includes(`#page=${printed-source.offset}`));
      assert.ok((await page.locator('[data-textbook-location]').textContent()).includes(source.label));
    }
  }
  await page.locator('[data-textbook-input]').fill('351');await page.locator('[data-textbook-jump] button').click();
  assert.ok((await page.locator('[data-textbook-frame]').getAttribute('src')).includes('readerPage=20#page=20'));
  await page.screenshot({path:'/tmp/social-issue1-reader-desktop.png'});
  await page.locator('[data-textbook-input]').fill('100');await page.locator('[data-textbook-jump] button').click();
  assert.ok((await page.locator('[data-textbook-message]').textContent()).includes('not available'));
  assert.equal(await page.locator('[data-textbook-frame]').getAttribute('src'),null);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>showPage('overview'));
  for(const [route,group] of [['overview','overview'],[lesson,'student-work'],['core-vocabulary','student-tools'],['evidence-bank','process-collection'],['library','resources']]){
    await page.evaluate(route=>showPage(route),route);
    assert.equal(await page.locator(`[data-social-nav-toggle="${group}"]`).getAttribute('aria-expanded'),'true');
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(url,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'/tmp/social-issue1-overview-phone.png'});
  await page.locator('#topbar-menu-toggle').click();
  await page.locator('[data-social-nav-toggle="student-tools"]').click();
  await page.screenshot({path:'/tmp/social-issue1-sidebar-phone.png'});
  await page.locator('.course-nav [data-page-target="core-vocabulary"]').click();
  await page.waitForFunction(()=>location.hash==='#core-vocabulary');
  await page.waitForTimeout(150);
  assert.ok((await page.locator('body').getAttribute('class')).includes('sidebar-collapsed'));
  await page.locator('[data-vocabulary-choose="identity"]').click();
  await page.locator('[data-vocabulary-record="identity"] [data-vocabulary-term]').click();
  await page.locator('.social-vocabulary-dialog').waitFor({state:'visible'});
  await page.screenshot({path:'/tmp/social-issue1-vocabulary-phone.png'});
  await page.keyboard.press('Escape');
  await page.evaluate(route=>showPage(route),lesson);
  await page.screenshot({path:'/tmp/social-issue1-lesson-phone.png'});
  await page.locator(`#${lesson} .social-reading-link`).click();
  await page.screenshot({path:'/tmp/social-issue1-reader-phone.png'});
  assert.equal(await page.locator('.social-textbook-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);assert.deepEqual(localFailures,[]);
  console.log('PASS: 54 vocabulary owners; page/popup/edit/reload/focus preservation; retained answers/evidence/completion; seven textbook ranges and unavailable pages; sidebar groups and phone dialogs.');
} finally {await browser.close();}
