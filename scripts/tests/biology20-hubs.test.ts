import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';
import {loadBiology20UnitA} from '../lib/biology20-course/unit-a-inputs.js';

test('A hubs retain Biology30 spacing and expose the complete vocabulary without unlocking Frayers',async()=>{
 const a=await loadBiology20UnitA(process.cwd()),browser=await chromium.launch();
 try{for(const width of [1117,390]){
  const page=await browser.newPage({viewport:{width,height:902}});
  await page.goto(pathToFileURL(path.resolve('projects/biology30-unit-b/workspace/index.html')).href+'#b-advanced');await page.evaluate(()=>document.fonts.ready);
  const style=()=>{const e=document.querySelector('.course-page:not([hidden]) .page-header')!;return {padding:getComputedStyle(e).padding,font:getComputedStyle(e.querySelector('h1')!).fontSize};};
  const reference=await page.evaluate(style);
  await page.goto(pathToFileURL(path.resolve('projects/biology20-unit-a/workspace/index.html')).href+'#a-core-vocabulary');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('[data-p2-vocabulary-filter]')).toHaveValue('all');
  await expect(page.locator('[data-p2-family-target]:visible')).toHaveCount(10);
  const wordSelect=page.locator('[data-bio20-word-select]');await expect(wordSelect.locator('option')).toHaveCount(35);
  for(const term of a.input.vocabulary.introducedTerms){
   await wordSelect.selectOption(term.id);const entry=page.locator('[data-bio20-word]:visible');
   await expect(entry.locator('h2')).toHaveText(term.term);await expect(entry).toContainText(term.definition);await expect(entry.locator('h2')).toBeFocused();
  }
  const multi=a.input.vocabulary.introducedTerms.find(t=>t.term==='photosynthesis')!;
  await wordSelect.selectOption(multi.id);await expect(page.locator('[data-bio20-word]:visible [data-bio20-word-family]')).toHaveCount(3);
  await page.locator('[data-bio20-word]:visible [data-bio20-word-family="a-family-producers"]').click();
  await expect(page.locator('#a-family-producers')).toBeVisible();await expect(page.locator('#a-family-producers [data-bio20-frayer-focus]')).toContainText('Frayer focus: Autotroph');
  const roster=await page.locator('.vocabulary-index').innerText();for(const term of a.input.vocabulary.introducedTerms)assert.ok(roster.includes(term.term),'Missing term '+term.term);
  await expect(page.locator('[data-p2-family-panel]:visible [data-p2-family-locked]')).toBeVisible();
  await page.locator('[data-p2-family-panel]:visible .family-term-definitions summary').click();
  await expect(page.locator('[data-p2-family-panel]:visible .family-term-definitions dd').first()).toBeVisible();
  await expect(page.locator('[data-p2-family-panel]:visible .frayer')).toBeHidden();
  for(const family of a.input.vocabulary.conceptFamilies){
   await page.locator(`[data-p2-family-target="${family.id}"]`).click();
   const panel=page.locator(`[data-p2-family-panel="${family.id}"]`);
   for(const heading of ['Meaning','Word structure','What it does','Related ideas','Common confusion','Retrieve the idea'])await expect(panel.getByText(heading,{exact:true})).toBeVisible();
   await expect(panel.locator('.frayer')).toBeHidden();
  }
  await page.screenshot({path:`projects/biology20-unit-a/meta/vocabulary-reference-${width}.png`,fullPage:true});
  const go=async(r:string)=>{await page.evaluate(r=>{location.hash=r;},r);await expect(page.locator('#'+r)).toBeVisible();};
  for(const route of a.schema.routes.filter(r=>r!=='a-overview')){
   await go(route);const header=page.locator('#'+route+' .page-header, #'+route+' .lesson-header').first();await expect(header).toBeVisible();
   const dimensions=await header.evaluate(e=>({left:parseFloat(getComputedStyle(e).paddingLeft),size:parseFloat(getComputedStyle(e.querySelector('h1')!).fontSize)}));assert.equal(dimensions.left,width===390?22:54,route);assert.ok(dimensions.size>=34,route);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route);
  }
  await go('a-advanced');assert.deepEqual(await page.evaluate(style),reference);await expect(page.locator('.advanced-index input')).toHaveCount(18);
  await page.locator('.advanced-index input').first().check();await expect(page.locator('[data-p2-advanced-progress]')).toHaveText('1 of 18');await page.reload();await expect(page.locator('.advanced-index input').first()).toBeChecked();
  await page.locator('.advanced-index a').first().click();await expect(page.locator('.p2-advanced').first()).toHaveAttribute('open','');
  await go('a-textbook');await expect(page.locator('.library-panel:visible')).toHaveCount(1);
  if(width===390)await page.locator('[data-p2-library-select]').selectOption('a-book-2');else await page.locator('[data-p2-panel-target="a-book-2"]').click();
  await expect(page.locator('#a-book-2')).toBeVisible();await expect(page.locator('#a-book-0')).toBeHidden();await expect(page.locator('#a-book-2 iframe')).toHaveAttribute('src','assets/textbook-chapter-2b.pdf#page=1&zoom=page-width');
  await go('a-video-library');await page.locator('#a-video-library [data-p2-panel-target]').last().click();await expect(page.locator('#a-video-library [data-p2-panel]:visible')).toContainText('Sulfur and Phosphorus');
  await go('a-models');await expect(page.locator('.model-lab-layout nav')).toContainText('Intro to Ecology');await expect(page.locator('.model-orientation h3')).toHaveText(a.integrated.models[0].predictionPrompt);
  await go('a-glossary');await expect(page.locator('[data-pilot2-glossary-term]')).toHaveCount(35);await page.locator('[data-pilot2-glossary-search]').fill('albedo');await expect(page.locator('[data-pilot2-glossary-term]:visible')).toHaveCount(1);
  await page.close();
 }}finally{await browser.close();}
});
