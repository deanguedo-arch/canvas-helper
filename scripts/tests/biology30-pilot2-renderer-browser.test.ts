import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { build } from "esbuild";
import { rendererFixture, textbookFixture, graphFixture, graphPracticeFixture, investigationFixture, seminarFixture } from "./fixtures/biology30-pilot2/renderer.js";
import { renderBiology30Topic, TOPIC_COMPONENT_CSS } from "../lib/biology30-course/v1/pilot2-render-topic.js";
import { renderTopicPractice } from "../lib/biology30-course/v1/pilot2-render-controls.js";
import { renderTopicTextbookQuestion } from "../lib/biology30-course/v1/pilot2-render-textbook.js";
import { TOPIC_FIGURE_VIEWER_CSS } from "../lib/biology30-course/v1/pilot2-figure-viewer.js";

import {renderTopicInvestigation} from "../lib/biology30-course/v1/pilot2-render-investigation.js";
import {renderTopicSeminar} from "../lib/biology30-course/v1/pilot2-render-review.js";

// Browser interaction proof for synthetic owner components, not a learner-course
// build, all-unit freeze bypass, project E2E pass or LMS certification.
for(const browserType of [chromium,firefox,webkit])test(`synthetic renderer controls, persistence and enlargement in ${browserType.name()}`,async()=>{
  const fixture=rendererFixture(), graph=graphFixture(), schema=fixture.state, topicId=fixture.contract.topics[0].id;
  const investigation=investigationFixture(schema),seminar=seminarFixture(schema);
  const owner=path.resolve('scripts/lib/biology30-course/v1');
  const script=`import {mountTopicControls} from ${JSON.stringify(owner+'/pilot2-controls-runtime.ts')};
import {mountTopicFigureViewer} from ${JSON.stringify(owner+'/pilot2-figure-viewer.ts')};
import {mountTopicReturnLinks} from ${JSON.stringify(owner+'/pilot2-return-links.ts')};
import {mountTopicGraphControls} from ${JSON.stringify(owner+'/pilot2-graph-controls.ts')};
import {emptyTopicState,decodeTopicState,persistTopicState} from ${JSON.stringify(owner+'/pilot2-state.ts')};
const schema=${JSON.stringify(schema)},key='biology30-unit-b:pilot2-v3';
const raw=localStorage.getItem(key),state=raw?decodeTopicState(raw,schema):emptyTopicState(schema);
const controls=mountTopicControls(document.getElementById('fixture'),state,schema,s=>{
const storage=window.fixtureFail?{getItem:k=>localStorage.getItem(k),setItem:()=>{throw Error('fixture quota');}}:localStorage;
const result=persistTopicState(s,schema,storage,null);return {saved:result.local==='saved',message:result.local==='saved'?'Saved on this device.':'Save not confirmed; current writing remains visible.'};
},[${JSON.stringify(graph)}]);mountTopicGraphControls(document.getElementById('fixture'),state,schema,[${JSON.stringify(graph)}],controls);mountTopicFigureViewer(document.getElementById('fixture'));mountTopicReturnLinks(document.getElementById('fixture'),schema.routes);`;
  const bundle=(await build({stdin:{contents:script,resolveDir:process.cwd(),sourcefile:'synthetic-pilot2-fixture.ts',loader:'ts'},bundle:true,write:false,platform:'browser',format:'iife'})).outputFiles[0].text;
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Synthetic renderer fixture</title><style>body{font-family:system-ui;margin:16px}button,input,textarea{font:inherit}${TOPIC_COMPONENT_CSS}${TOPIC_FIGURE_VIEWER_CSS}</style><body><main id="fixture"><p data-pilot2-save-status role="status"></p>${renderBiology30Topic(topicId,fixture)}${renderTopicTextbookQuestion(textbookFixture(),fixture.contract,schema)}${renderTopicPractice(graphPracticeFixture(),schema,3,graph)}${renderTopicInvestigation(investigation,fixture.contract,schema,[],[])}${renderTopicSeminar(seminar,schema)}<a href="#${topicId}" data-pilot2-return-route="${topicId}" data-pilot2-return-focus="${topicId}-comparison-advanced" id="fixture-return">Return to optional activity</a></main><script src="/fixture.js"></script></body></html>`;
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="white"/><text x="150" y="250" font-size="120" fill="black">A</text><text x="550" y="250" font-size="120" fill="black">B</text></svg>';
  const server=createServer((req,res)=>{const [type,body]=req.url==='/fixture.js'?['text/javascript',bundle]:req.url==='/assets/fixture.svg'?['image/svg+xml',svg]:['text/html',html];res.setHeader('Content-Type',type);res.end(body);});
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();assert.ok(address&&typeof address==='object');
  const browser=await browserType.launch();
  try {
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));await page.goto(`http://127.0.0.1:${address.port}`);
    const observations=page.locator('#b-investigation-fixture-observations-overall-guide'),reveal=page.locator('[data-pilot2-group-compare="b-investigation-fixture-observations"]'),overall=page.locator('[data-pilot2-group-compare="b-investigation-fixture"]');
    await expect(observations).toBeHidden();await expect(reveal).toBeDisabled();await expect(overall).toBeDisabled();
    await page.locator('[data-pilot2-response="b-investigation-fixture-plan"]').fill('Compare equal areas with the same sampling rule.');await reveal.click();await expect(observations).toBeVisible();await expect(observations).toContainText('Separate whole-population scenario');await expect(overall).toBeDisabled();
    for(const field of investigation.responseFields.slice(1))await page.locator(`[data-pilot2-response="${field.id}"]`).fill('Bounded reasoning from the supplied observations.');
    await overall.click();await expect(page.locator('#b-investigation-fixture-overall-guide')).toBeVisible();await page.locator('[data-pilot2-response="b-investigation-fixture-limits"]').fill('Revised limits.');await expect(page.locator('#b-investigation-fixture-overall-guide')).toBeHidden();
    const seminarSave=page.locator('[data-pilot2-collect="b-review-seminar-saved"]');await expect(seminarSave).toBeDisabled();for(const activity of seminar.activities)await page.locator(`[data-pilot2-response="${activity.id}"]`).fill('Keep each source separate and give a bounded claim.');await seminarSave.click();await expect(page.locator('[data-pilot2-collection-status="b-review-seminar-saved"]')).toContainText('Saved');await page.reload();await expect(seminarSave).toBeEnabled();await expect(observations).toBeHidden();
    const written=page.locator('[data-pilot2-response="written"]'), check=page.locator('[data-pilot2-check="written"]'), feedback=page.locator('[data-pilot2-feedback="written"]');
    await expect(check).toBeDisabled();await expect(feedback).toBeHidden();
    const original='My own answer <&> 🧬 with a newline\nand "quotes".';await written.fill(original);await expect(check).toBeEnabled();await check.click();await expect(feedback).toBeVisible();
    await page.reload();await expect(written).toHaveValue(original);await expect(feedback).toBeVisible();
    const key='biology30-unit-b:pilot2-v3',before=await page.evaluate(k=>localStorage.getItem(k),key);
    const long='x'.repeat(100);await written.fill(long);await expect(written).toHaveValue(long);await expect(check).toBeDisabled();assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),before);
    await expect(page.locator('[data-pilot2-save-status]')).toContainText('not confirmed');
    await written.fill('Revised bounded answer.');await expect(check).toBeEnabled();await expect(feedback).toBeHidden();
    await page.locator('[data-pilot2-choice="selected"][value="1"]').check();await page.locator('[data-pilot2-check="selected"]').click();
    await expect(page.locator('[data-pilot2-option-feedback="1"]')).toBeVisible();await expect(page.locator('[data-pilot2-option-feedback="2"]')).toBeHidden();
    assert.equal(await page.locator('img[onerror]').count(),0);
    await page.locator('[data-pilot2-choice="selected"][value="2"]').check();await expect(page.locator('[data-pilot2-feedback="selected"]')).toBeHidden();await page.locator('[data-pilot2-check="selected"]').click();await page.reload();
    await expect(page.locator('[data-pilot2-choice="selected"][value="2"]')).toBeChecked();await expect(page.locator('[data-pilot2-option-feedback="2"]')).toBeVisible();
    const evidence=page.locator(`[data-pilot2-response="${topicId}-evidence"]`), collect=page.locator(`[data-pilot2-collect="${topicId}-evidence-collected"]`);
    await expect(collect).toBeDisabled();await evidence.fill('A supported claim.');await collect.click();await expect(page.locator(`[data-pilot2-collection-status="${topicId}-evidence-collected"]`)).toContainText('Saved');
    const last=await page.evaluate(k=>localStorage.getItem(k),key);await page.evaluate(()=>{(window as any).fixtureFail=true;});await evidence.fill('Draft retained during quota failure.');await collect.click();assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),last);await expect(evidence).toHaveValue('Draft retained during quota failure.');await expect(page.locator(`[data-pilot2-collection-status="${topicId}-evidence-collected"]`)).toContainText('not confirmed');
    await page.evaluate(()=>{(window as any).fixtureFail=false;});
    const advanced=page.locator('details.p2-advanced');await expect(advanced).not.toHaveAttribute('open','');await advanced.locator('summary').click();await advanced.locator('input').check();await page.reload();await expect(advanced.locator('input')).toBeChecked();
    await page.locator('#fixture-return').click();await expect(advanced).toHaveAttribute('open','');await expect(advanced.locator('input')).toBeFocused();
    const textbook=page.locator('[data-pilot2-textbook-attempt]');await expect(page.locator('#fixture-textbook-guide')).toBeHidden();await textbook.click();await expect(page.locator('#fixture-textbook-guide')).toBeVisible();await page.reload();await expect(page.locator('#fixture-textbook-guide')).toBeHidden();await expect(page.locator('[data-pilot2-textbook-status]')).toContainText('Previous attempt recorded');await textbook.click();await expect(page.locator('#fixture-textbook-guide')).toBeVisible();
    const graphPanel=page.locator('[data-pilot2-graph-work="graph-question"]'),graphCheck=page.locator('[data-pilot2-check="graph-question"]');
    await expect(graphCheck).toBeDisabled();await graphPanel.locator('[data-pilot2-graph-axis="0:0"]').selectOption('0');await graphPanel.locator('[data-pilot2-graph-axis="0:1"]').selectOption('0');await graphPanel.locator('[data-pilot2-graph-axis="0:2"]').selectOption('0');
    await graphPanel.locator('[data-pilot2-graph-point="0:0:0"]').fill('0');await graphPanel.locator('[data-pilot2-graph-point="0:0:2"]').fill('6');
    await expect(graphPanel.locator('[data-pilot2-graph-drawing="0"]')).toContainText('6 exceeds the selected maximum 5');await graphCheck.click();await expect(graphPanel.locator('[data-pilot2-graph-comparison]')).toBeVisible();
    await page.reload();await expect(graphPanel.locator('[data-pilot2-graph-point="0:0:0"]')).toHaveValue('0');await expect(graphPanel.locator('[data-pilot2-graph-point="0:0:1"]')).toHaveValue('');await expect(graphPanel.locator('[data-pilot2-graph-point="0:0:2"]')).toHaveValue('6');
    await graphPanel.locator('[data-pilot2-graph-axis="0:2"]').selectOption('1');await graphCheck.click();await expect(graphPanel.locator('[data-pilot2-graph-findings]')).toContainText('contains the supplied values');
    const graphBefore=await page.evaluate(k=>localStorage.getItem(k),key);await graphPanel.locator('[data-pilot2-graph-explanation]').fill('z'.repeat(101));await expect(graphCheck).toBeDisabled();assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),graphBefore);await graphPanel.locator('[data-pilot2-graph-explanation]').fill('Compare the entered values.');
    await graphPanel.locator('[data-pilot2-enlarge]').first().click();await expect(page.locator('dialog')).toBeVisible();await page.keyboard.press('Escape');
    const screenshotDir=process.env.BIOLOGY30_FIXTURE_SCREENSHOTS;
    if(screenshotDir)await mkdir(screenshotDir,{recursive:true});
    for(const width of [1440,1024,390]){
      await page.setViewportSize({width,height:900});await page.evaluate(()=>window.scrollTo(0,0));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`horizontal overflow at ${width}`);
      if(screenshotDir){await page.screenshot({path:path.join(screenshotDir,`${browserType.name()}-${width}.png`),fullPage:true});if(width===390)await graphPanel.screenshot({path:path.join(screenshotDir,`${browserType.name()}-graph-390.png`)});}
    }
    await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% text resize overflow');await page.evaluate(()=>{document.documentElement.style.fontSize='';});
    const enlarge=page.locator('[data-pilot2-enlarge]').first();await enlarge.click();await expect(page.locator('dialog')).toBeVisible();await page.getByLabel('Show original size').check();
    assert.equal(await page.locator('dialog img').evaluate((img:HTMLImageElement)=>img.naturalWidth),800);await page.keyboard.press('Escape');await expect(page.locator('dialog')).toBeHidden();await expect(enlarge).toBeFocused();
    const token=schema.responses['graph-question'].token;
    await page.evaluate(({key,token})=>{const saved=JSON.parse(localStorage.getItem(key)!);saved.r.find((pair:string[])=>pair[0]===token)[1]='Keep earlier graph prose 🧬';localStorage.setItem(key,JSON.stringify(saved));},{key,token});
    await page.reload();await expect(graphPanel.locator('[data-pilot2-graph-original]')).toHaveValue('Keep earlier graph prose 🧬');await expect(graphPanel.locator('[data-pilot2-graph-editor]')).toBeHidden();await expect(graphPanel.locator('[data-pilot2-graph-start]')).toBeDisabled();
    await graphPanel.locator('[data-pilot2-graph-recovery-confirm]').check();await graphPanel.locator('[data-pilot2-graph-start]').click();await expect(graphPanel.locator('[data-pilot2-graph-editor]')).toBeVisible();await expect(graphCheck).toBeDisabled();
    const preserved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).z,key);assert.ok(preserved.some((pair:string[])=>pair[1]==='Keep earlier graph prose 🧬'));
    assert.deepEqual(errors,[]);
  } finally {await browser.close();await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
});
