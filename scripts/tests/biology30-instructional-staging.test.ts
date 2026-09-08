import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {load} from 'cheerio';
import {FIRST_USE_REPAIR,FIRST_USE_REPAIRS} from '../lib/biology30-unit-a-pilot-2/first-use-repair.js';
import {buildOnlineFinalizationReport,onlineBaselineDirectory} from '../lib/biology30-unit-a-pilot-2/online-finalization.js';
const evidence='projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-instructional-repairs';
test('A first-use change is exact; unrelated core edits still fail and saved response identities remain',async()=>{
 const root='projects/biology30-unit-a-pilot-2';
 const html=await readFile(`${root}/workspace/index.html`,'utf8'),baseline=await readFile(`${root}/${onlineBaselineDirectory}/workspace/index.html`,'utf8');
 const before=load(await readFile(`${evidence}/before/a-pilot-2/workspace/index.html`,'utf8')),after=load(html);
 assert.ok(after('[data-core-zone="lesson-01-part-2"]').html()!.includes(FIRST_USE_REPAIR.after));
 for(const repair of FIRST_USE_REPAIRS) assert.ok(after(`[data-core-zone="${repair.id}"]`).text().includes(load(`<div>${repair.after}</div>`).text()));
 assert.deepEqual(after('[data-response-id]').map((_,el)=>after(el).attr('data-response-id')).get(),before('[data-response-id]').map((_,el)=>before(el).attr('data-response-id')).get());
 assert.equal(after('#lesson-03').text().indexOf('A neurotransmitter is a chemical messenger')>=0,true);
 assert.doesNotThrow(()=>buildOnlineFinalizationReport(baseline,html,'synthetic test',42738));
 assert.throws(()=>buildOnlineFinalizationReport(baseline,html.replace(FIRST_USE_REPAIR.after,'A channel is a hormone.'),'synthetic test',42738),/changed outside/);
});
test('C introduces gene expression and reading frame locally before using them',async()=>{
 const $=load(await readFile('projects/biology30-unit-c/workspace/index.html','utf8'));
 const packaging=$('#c-topic-chromosomes-and-dna-dna-packaging').text();
 assert.ok(packaging.includes('Using those instructions is called gene expression.'));
 assert.ok(packaging.indexOf('Using those instructions')<packaging.indexOf('activities such as gene expression'));
 const content=JSON.parse(await readFile('projects/resources/biology30-production/v1/units/unit-c/pilot2-content.json','utf8'));
 const sequence=content.parts.find((p:any)=>p.id==='c-topic-transcription-checking-a-sequence-claim');
 assert.ok(sequence.termIntroductionIds.includes('c-term-reading-frame'));
 assert.match(sequence.paragraphs.join(' '),/reading frame/);
});
test('eight staged tasks retain original demands, answer keys, response registries and one existing interaction',async()=>{
 let count=0;
 for(const unit of ['b','c','d']){
 const base=`projects/resources/biology30-production/v1/units/unit-${unit}`;
 const current=JSON.parse(await readFile(`${base}/pilot2-practice.json`,'utf8')),before=JSON.parse(await readFile(`${evidence}/before/${unit}/inputs/pilot2-practice.json`,'utf8'));
 const $=load(await readFile(`projects/biology30-unit-${unit}/workspace/index.html`,'utf8'));
 assert.deepEqual(JSON.parse(await readFile(`${base}/pilot2-state-schema.json`,'utf8')),JSON.parse(await readFile(`${evidence}/before/${unit}/inputs/pilot2-state-schema.json`,'utf8')));
 for(const item of current.items){const old=before.items.find((i:any)=>i.id===item.id);const {stages,...rest}=item;assert.deepEqual(rest,old);
 if(!stages)continue;count++;const article=$(`[data-pilot2-practice="${item.id}"]`);assert.equal(article.length,1);assert.equal(article.find('.p2-task-stages>li').length,stages.length);assert.equal(article.find(`[data-pilot2-check="${item.id}"]`).length,1);
 assert.deepEqual(article.find('.p2-task-stages>li').map((_,el)=>$(el).text()).get(),stages);
 }
 }
 assert.equal(count,8);
});
