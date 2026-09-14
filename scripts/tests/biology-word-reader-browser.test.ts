import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';
import {renderBiologyWordReader} from '../lib/biology30-vocabulary/word-reader.js';

test('word reader selects individual content with keyboard focus without writing learner state',async()=>{
 const data=JSON.parse(await readFile('projects/resources/biology20-production/v1/units/a/word-details.json','utf8'));
 const script=(await build({stdin:{contents:'import {mountBiologyWordReader} from "./scripts/lib/biology30-vocabulary/word-reader.ts"; mountBiologyWordReader(document.querySelector("[data-biology-word-reader]"));',resolveDir:process.cwd()},bundle:true,write:false,format:'iife',platform:'browser'})).outputFiles[0].text;
 const browser=await chromium.launch();try{for(const width of [1117,390]){
  const page=await browser.newPage({viewport:{width,height:902}});
  await page.setContent(renderBiologyWordReader(data.words,data.categories));await page.addScriptTag({content:script});
  for(const word of data.words){await page.locator(`[data-biology-select-word="${word.id}"]`).first().click();const view=page.locator('[data-biology-word-view]:visible');await expect(view).toHaveCount(1);await expect(view.locator('h2')).toHaveText(word.term);await expect(view.locator('h2')).toBeFocused();await expect(view).toContainText(word.whatItDoes);}
  const button=page.locator('[data-biology-select-word="a-term-cohesion"]').first();await button.focus();await page.keyboard.press('Enter');await expect(page.locator('[data-biology-word-view]:visible')).toContainText('surface tension');
  assert.equal(await page.locator('textarea,input').count(),0,'Reference reader must not create independent persistence controls');await page.close();
 }}finally{await browser.close();}
});
