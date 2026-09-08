import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium} from '@playwright/test';
import {termMatches} from '../lib/biology30-vocabulary/panel.js';

test('literal whole terms, longest overlap, Unicode boundaries and first-per-section',()=>{
  const seen=new Set<string>();
  assert.deepEqual(termMatches('DNA replication uses DNA; DNA replication.', ['DNA','DNA replication'],seen),[{start:0,end:15,term:'dna replication'},{start:21,end:24,term:'dna'}]);
  assert.deepEqual(termMatches('DNA again', ['DNA'],seen),[]);
  assert.deepEqual(termMatches('RNAs xRNA RNAé RNA', ['RNA']),[{start:15,end:18,term:'rna'}]);
  assert.equal(termMatches('alleles allele', ['allele']).length,1);
});

test('dialog loans the original Frayer, leaves assessments alone, returns draft/focus/scroll',async()=>{
  const bundle=await build({stdin:{contents:`import {mountVocabularyPanel} from './scripts/lib/biology30-vocabulary/panel.ts';window.mount=mountVocabularyPanel;`,resolveDir:process.cwd()},bundle:true,write:false,format:'iife'});
  const browser=await chromium.launch();try{const page=await browser.newPage();
    await page.setContent('<main><section id="lesson"><p>DNA replication needs DNA. DNA is copied.</p><a href="#link">DNA</a><section class="stop-check">DNA question?</section></section><div style="height:1200px"></div><article hidden id="vocab"><section class="frayer"><label>Definition<textarea id="original"></textarea></label></section></article></main>');
    await page.addScriptTag({content:bundle.outputFiles[0].text});
    await page.evaluate(`window.ownerStatus='Previous save';window.mount({root:document.body,families:[{id:'f',label:'DNA',meaning:'Inherited information.',wordAnalysis:['Deoxyribonucleic acid'],routes:['lesson']}],terms:[{term:'DNA',familyIds:['f']},{term:'DNA replication',familyIds:['f']}],sections:()=>[document.getElementById('lesson')],route:()=> 'lesson',unlocked:()=>true,frayer:()=>document.querySelector('.frayer'),refresh(){},status:()=>window.ownerStatus});window.original=document.getElementById('original');document.addEventListener('input',()=>{window.ownerStatus='Current owner result'});`);
    assert.equal(await page.locator('[data-bio-term]').count(),2);assert.equal(await page.locator('.stop-check button,a button').count(),0);
    const route=page.url();await page.locator('[data-bio-term="dna"]').click();await page.locator('[data-bio-frayer] summary').click();await page.locator('#original').fill('My intact draft 🧬');
    await page.waitForFunction(()=>document.querySelector('[data-bio-save-status]')?.textContent==='Current owner result');
    assert.equal(await page.evaluate(()=>document.getElementById('original')===(window as any).original),true);
    await page.keyboard.press('Escape');assert.equal(page.url(),route);assert.equal(await page.locator('#vocab #original').inputValue(),'My intact draft 🧬');
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-bio-term')),'dna');
    await page.locator('[data-bio-term="dna"]').click();await page.locator('[data-bio-frayer] summary').click();assert.equal(await page.locator('dialog #original').inputValue(),'My intact draft 🧬');
    await page.setViewportSize({width:390,height:700});assert.equal(await page.evaluate(()=>document.querySelector('dialog')!.getBoundingClientRect().width<=innerWidth),true);
  }finally{await browser.close();}
});
