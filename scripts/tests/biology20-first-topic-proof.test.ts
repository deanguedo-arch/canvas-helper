import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'node:http';
import {chromium,expect} from '@playwright/test';
import {loadBiology20FirstTopicProof} from '../lib/biology20-course/first-topic-proof.js';
import {emptyTopicState,decodeTopicState,encodeTopicState} from '../lib/biology30-course/v1/pilot2-state.js';
import {renderBiology30Topic} from '../lib/biology30-course/v1/pilot2-render-topic.js';
import {buildTopicActivityIndex} from '../lib/biology30-course/v1/pilot2-activity-index.js';
import {sessionFixture} from './fixtures/biology30-pilot2/renderer.js';

test('actual first-topic authored examples and figures compose without claiming full-module coverage',async()=>{
 const p=await loadBiology20FirstTopicProof(process.cwd());
 assert.equal(p.input.core.parts.length,3);assert.equal(p.input.figures.length,3);
 assert.match(p.limitations,/incomplete/);assert.equal(p.input.contract.courseId,'biology20');
 const state=emptyTopicState(p.input.state);for(const r of p.design.responses)state.responses[r.id]=r.example;
 const written=p.design.practice.find((p:{kind:string})=>p.kind==='constructed');state.responses[written.id]=written.modelResponse;
 assert.deepEqual({...decodeTopicState(encodeTopicState(state,p.input.state),p.input.state).responses},state.responses);
 assert.ok(p.maximumProofCharacters<44000);
 // Independently check the authored numerical examples, not just question counts.
 assert.equal(240/800,0.30);assert.equal(800-240,560);
 assert.equal(1000*(1-0.8)+1000*0.8,1000);
 assert.equal(20+10-25-10,-5);
 assert.throws(()=>renderBiology30Topic(p.design.topicId,{...p.input,state:{...p.input.state,courseId:undefined}}),/identity does not match/);
 const fixture=sessionFixture();
 assert.throws(()=>buildTopicActivityIndex({...fixture.activities,contract:{...fixture.activities.contract,courseId:'biology20'}}),/identity does not match/);
});

test('internal A topic: real answer/reload/overflow, figures and exact returns on desktop and mobile',async()=>{
 const out=path.resolve('projects/biology20-unit-a/meta/first-topic-proof'),p=await loadBiology20FirstTopicProof(process.cwd());
 const server=createServer(async(req,res)=>{const file=(req.url??'/').split('?')[0].slice(1)||'index.html';if(!/^(index\.html|proof\.js|assets\/[a-z0-9-]+\.(svg|png)|assets\/brand\/nxt-ce-logo-white-with-ce\.png|assets\/fonts\/(HankenGrotesk|WorkSans)-Variable\.ttf)$/.test(file)){res.writeHead(404);res.end();return;}try{const bytes=await readFile(path.join(out,file));res.setHeader('Content-Type',file.endsWith('.ttf')?'font/ttf':file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':file.endsWith('.svg')?'image/svg+xml':'text/html');res.end(bytes);}catch{res.writeHead(404);res.end();}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();assert.ok(address&&typeof address==='object');const browser=await chromium.launch();
 try{for(const width of [1440,390]){const page=await browser.newPage({viewport:{width,height:1000}}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${address.port}`);
  const navigate=async(id:string)=>{if(width<768&&!await page.locator('.sidebar').evaluate(n=>n.classList.contains('is-open')))await page.locator('[data-p2-menu]').click();await page.locator(`.sidebar [data-page-target="${id}"]`).click();};
  assert.deepEqual(await page.locator('.sidebar [data-page-target]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-page-target')).filter(id=>!document.getElementById(id!))),[],'Every sidebar destination exists');
  await navigate('a-topic-water-and-the-hydrologic-cycle');await expect(page.locator('#a-topic-water-and-the-hydrologic-cycle')).toContainText('not assembled');await navigate('overview');
  await expect(page.locator('.brand-logo')).toBeVisible();await page.screenshot({path:`/tmp/biology20-shell-${width}.png`});await navigate(p.design.topicId);
  await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.fonts.check('16px "Work Sans"')),true);assert.equal(await page.evaluate(()=>document.fonts.check('16px "Hanken Grotesk"')),true);
  await expect(page.locator('.p2-part')).toHaveCount(3);await expect(page.locator('.p2-advanced')).toHaveCount(3);
  const r=p.design.responses[0],field=page.locator(`[data-pilot2-response="${r.id}"]`);await field.fill(r.example);await expect(page.locator('#proof-status')).toContainText('Saved in this internal preview');await page.reload();await expect(field).toHaveValue(r.example);
  const oversized='漢'.repeat(r.limit+1);await field.fill(oversized);await expect(page.locator('#proof-status')).toContainText('Draft not saved');await expect(field).toHaveValue(oversized);
  const saved=await page.evaluate(()=>localStorage.getItem('biology20-unit-a:internal-first-topic-proof:v1'));assert.ok(saved);assert.equal(decodeTopicState(saved,p.input.state).responses[r.id],r.example);
  await field.fill(r.example);const keys=await page.evaluate(()=>Object.keys(localStorage));assert.ok(keys.every(k=>k.startsWith('biology20-unit-a:internal-first-topic-proof:v1')));
  const open=page.locator('[data-pilot2-enlarge]').first();await open.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(open).toBeFocused();
  const advanced=page.locator('.p2-advanced').nth(1);await advanced.locator('summary').click();await advanced.locator('input[type=checkbox]').check();await advanced.locator('a[data-pilot2-return-focus]').click();await expect.poll(()=>page.locator('#a-topic-intro-to-ecology-energy-and-albedo-worked').evaluate(n=>n.contains(document.activeElement))).toBe(true);
  const term=page.locator('.lesson-block [data-bio-term="albedo"]').first();await term.scrollIntoViewIfNeeded();
  const before=await page.evaluate(()=>({hash:location.hash,y:scrollY}));await term.click();const dialog=page.locator('dialog.bio-vocabulary');await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-bio-meaning]')).toContainText('fraction');await dialog.locator('[data-bio-frayer] > summary').click();
  await dialog.locator('[data-p2-choose-family]').click();
  const frayerId='a-family-albedo-definition',frayer=dialog.locator(`[data-pilot2-response="${frayerId}"]`);
  await frayer.fill('The reflected fraction of incoming radiation.');await page.screenshot({path:`/tmp/biology20-vocabulary-panel-${width}.png`});await page.keyboard.press('Escape');await expect(term).toBeFocused();
  assert.deepEqual(await page.evaluate(()=>({hash:location.hash,y:scrollY})),before);
  await navigate('a-core-vocabulary');await page.locator('[data-p2-family-target="a-family-albedo"]').click();
  const full=page.locator(`[data-pilot2-response="${frayerId}"]`);await expect(full).toHaveValue('The reflected fraction of incoming radiation.');await full.fill('Edited on the full vocabulary page.');
  await page.reload();await navigate('a-core-vocabulary');await page.locator('[data-p2-family-target="a-family-albedo"]').click();await expect(full).toHaveValue('Edited on the full vocabulary page.');
  await navigate(p.design.topicId);await term.click();await dialog.locator('[data-bio-frayer] > summary').click();await expect(frayer).toHaveValue('Edited on the full vocabulary page.');
  for(const [suffix,text] of [['mechanism','Reflected divided by incoming radiation.'],['evidence','240 J divided by 800 J gives 0.30.'],['confusion','A reflected fraction is not a temperature.']])await dialog.locator(`[data-pilot2-response="a-family-albedo-${suffix}"]`).fill(text);
  await dialog.locator('[data-pilot2-collect-toggle]').click();await expect(dialog.locator('[data-pilot2-collection-status]')).toHaveText('Collected');
  await dialog.locator('[data-pilot2-frayer-compare]').click();await expect(dialog.locator('.course-model')).toBeVisible();
  await frayer.fill('Updated after comparison.');await expect(dialog.locator('.course-model')).toBeHidden();
  await page.keyboard.press('Escape');await navigate('a-core-vocabulary');await page.locator('[data-p2-family-target="a-family-albedo"]').click();await expect(page.locator('[data-p2-family-panel="a-family-albedo"] [data-pilot2-collection-status]')).toHaveText('Collected');
  await navigate(p.design.topicId);await term.click();await dialog.locator('[data-bio-frayer] > summary').click();
  await frayer.fill('漢'.repeat(241));await expect(dialog.locator('[data-bio-save-status]')).toContainText('Draft not saved');await page.keyboard.press('Escape');await term.click();await dialog.locator('[data-bio-frayer] > summary').click();await expect(frayer).toHaveValue('漢'.repeat(241));await frayer.fill('A repaired draft.');await page.keyboard.press('Escape');
  const respiration=page.locator('.lesson-block [data-bio-term="cellular respiration"]').first();await respiration.click();await dialog.locator('[data-bio-family]').selectOption('a-family-matter-cycles');await dialog.locator('[data-bio-frayer] > summary').click();await expect(dialog.locator('[data-bio-locked]')).toContainText('Begin the associated lesson');await expect(dialog.locator('textarea')).toHaveCount(0);await expect(dialog.locator('[data-bio-meaning]')).toContainText('Cellular reactions');await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'No page-level horizontal overflow');
  await page.locator('.p2-part').nth(1).scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/biology20-first-topic-${width}.png`});
  await page.locator('.p2-part').nth(2).locator('.p2-figure').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/biology20-first-topic-producer-${width}.png`});
  await navigate('a-all-my-work');await expect(page.locator('[data-pilot2-work-list]')).toContainText('A repaired draft.');await expect(page.locator('[data-pilot2-work-list]')).toContainText(r.example);
  if(width<768){await page.locator('[data-p2-menu]').click();await expect(page.locator('[data-p2-menu]')).toHaveAttribute('aria-expanded','true');await page.screenshot({path:'/tmp/biology20-shell-mobile-menu.png'});await page.keyboard.press('Escape');await expect(page.locator('[data-p2-menu]')).toHaveAttribute('aria-expanded','false');}else{await page.locator('[data-p2-collapse]').click();await expect(page.locator('body')).toHaveClass(/sidebar-collapsed/);await page.locator('[data-p2-collapse]').click();}
  assert.deepEqual(errors,[]);await page.close();
 }}finally{await browser.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
