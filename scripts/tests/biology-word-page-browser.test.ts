import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';
import {renderTopicWordPage} from '../lib/biology30-vocabulary/word-page.js';

const data={words:[{id:'water',term:'water',categoryIds:['properties'],definition:'Water is H₂O.',structure:{status:'contextual-analysis' as const,text:'H₂O identifies the molecular composition.'},whatItDoes:'Water supports transport.',relatedTermIds:['cohesion'],commonConfusion:'Water is not oxygen gas.',retrievalPrompt:'Which atoms occur in one water molecule?',sourceRefs:['test']},{id:'cohesion',term:'cohesion',categoryIds:['properties'],definition:'Attraction between like molecules.',structure:{status:'not-verified' as const,text:'No verified word-part analysis.'},whatItDoes:'It contributes to surface tension.',relatedTermIds:['water'],commonConfusion:'Adhesion involves a different substance.',retrievalPrompt:'Distinguish attraction to glass from attraction to water.',sourceRefs:['test']}],categories:[{id:'properties',label:'Water properties',wordIds:['water','cohesion']}],wordFrayers:{water:'properties'}};
const original=`<div class="p2-topic"><header class="page-header"><p>Process Collection</p><h1>Core Vocabulary</h1><p>Old family instructions</p></header><div class="vocabulary-tools"></div><div class="vocabulary-layout"><article id="properties" data-p2-family-panel="properties" data-p2-unlock-route="lesson"><h2>Water properties</h2><div data-p2-family-locked></div><div data-p2-family-content><p>Wrong shared family meaning</p><p class="resource-links"><a href="#lesson">Lesson</a></p><section class="frayer"><div class="frayer-heading"><h3>Anchor</h3></div><textarea data-pilot2-response="original-response">Earlier broad writing</textarea><div class="course-model">Original model</div></section></div></article><details class="p2-family-choices"><summary>Choices</summary></details></div></div>`;
test('word page/popup share exact explanations and loan the original draft without focus or scroll loss',async()=>{
 const script=(await build({stdin:{contents:`import {mountTopicWordPage} from './scripts/lib/biology30-vocabulary/word-page-runtime.ts';import {mountVocabularyPanel} from './scripts/lib/biology30-vocabulary/panel.ts';const root=document.body,data=JSON.parse(document.querySelector('#biology-word-data').textContent);mountTopicWordPage(root,data,()=>true,()=>{});mountVocabularyPanel({root,words:data.words,wordFrayers:data.wordFrayers,families:[{id:'properties',label:'Water properties',meaning:'Do not show this category definition',wordAnalysis:['Do not show this category structure'],routes:['lesson']}],terms:data.words.map(w=>({term:w.term,definition:w.definition,familyIds:w.categoryIds})),sections:()=>[document.querySelector('#teaching')],route:()=> 'lesson',unlocked:()=>true,frayer:()=>document.querySelector('[data-biology-frayer-record]'),refresh(){},status:()=> 'Draft retained'});`,resolveDir:process.cwd()},bundle:true,write:false,format:'iife',platform:'browser'})).outputFiles[0].text;
 const browser=await chromium.launch();try{for(const width of [1117,390]){
  const page=await browser.newPage({viewport:{width,height:902}});
  await page.setContent(renderTopicWordPage(original,data)+'<section id="teaching">Water and cohesion.</section>');await page.addScriptTag({content:script});
  const view=page.locator('[data-biology-word-view="water"]');await view.locator('[data-biology-word-frayer]>summary').click();
  const field=page.locator('textarea');await expect(field).toHaveCount(1);await expect(field).toHaveValue('Earlier broad writing');
  await field.fill('x'.repeat(300));await field.evaluate(n=>n.dispatchEvent(new CustomEvent('pilot2-state-change',{bubbles:true})));
  await expect(field).toBeFocused();await expect(field).toHaveValue('x'.repeat(300));
  const trigger=page.locator('[data-bio-term="water"]');await trigger.click();
  const dialog=page.locator('dialog');await expect(dialog).toBeVisible();await expect(dialog).toContainText('Water is H₂O.');await expect(dialog).not.toContainText('Do not show this category');
  assert.equal(await dialog.locator('[data-biology-word-details]').innerHTML(),await view.locator('[data-biology-word-details]').innerHTML().then(x=>x.replace(/<p class="resource-links">[\s\S]*?<\/p>/,'')));
  await dialog.locator('[data-bio-frayer]>summary').click();await expect(dialog.locator('textarea')).toHaveValue('x'.repeat(300));
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();await expect(view.locator('textarea')).toHaveValue('x'.repeat(300));
  await page.locator('[data-biology-select-word="cohesion"]').click();await expect(page.locator('[data-biology-word-view]:visible')).toContainText('surface tension');await expect(page.locator('[data-biology-word-view]:visible textarea')).toHaveCount(0);
  await page.locator('[data-biology-select-word="water"]').click();await expect(field).toHaveValue('x'.repeat(300));await page.close();
 }}finally{await browser.close();}
});
