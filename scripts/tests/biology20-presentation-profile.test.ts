import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {biology20Profile,type Biology20ModuleId} from '../lib/biology20-course/profile.js';
import {renderPresentationShell,type BiologyPresentationInputs} from '../lib/biology30-course/v1/pilot2-presentation-shell.js';
import {courseFixture} from './fixtures/biology30-pilot2/renderer.js';

test('omitting the course profile preserves the exact previous Biology30 shell',()=>{
 const f=courseFixture(),pages=new Map(f.topic.contract.requiredRoutes.map(id=>[id,{title:id,html:'<p>Fixture only</p>'}]));
 // Captured by executing the HEAD renderer, not from the new profile renderer.
 assert.equal(createHash('sha256').update(renderPresentationShell(f,pages,'/* fixture */')).digest('hex'),'5ec53248226e64c2cbf22c63903ef865beb99c44c77937d724cccf7f014e45b6');
});
test('five explicit Biology20 profiles use the same shell without inherited Bio30 labels or counts',()=>{
 for(const id of ['a','b','c','d-part-1','d-part-2'] as Biology20ModuleId[]){
  const p=biology20Profile(id),topicId=`${id}-topic-fixture`,seminarId=`${id}-seminar`;
  const input:BiologyPresentationInputs={title:p.title,logoPath:'assets/fixture.svg',seminar:{id:seminarId},topic:{contract:{...p.identity,topics:[{id:topicId,title:'Synthetic topic',chapter:p.chapters[0]}],requiredRoutes:[topicId,seminarId],requiredMinutes:90,optionalMinutes:15},practice:[{role:'final'},{role:'challenge'}]}};
  const pages=new Map([[topicId,{title:'Synthetic topic',html:'<p>Not a learner candidate.</p>'}],[seminarId,{title:'Review Seminar',html:'<p>Fixture only.</p>'}]]);
  const html=renderPresentationShell(input,pages,'/* fixture */',p.presentation),$=load(html);
  assert.equal($('.sidebar-code').text(),'BIO 20');assert.match($('title').text(),/^BIO 20/);
  assert.match($('.overview-page').text(),/1.5 required hours · 0.25 optional hours/);
  assert.match($('.overview-page').text(),/1 Challenge Practice items are optional/);
  assert.doesNotMatch($('body').text(),/Biology 30|BIO 30|Diploma Challenge/);
  assert.equal($('[data-pilot2-progress-count]').text(),'0 / 2 required routes');
  assert.equal($(`[href="#${id}-core-vocabulary"]`).length,1);
  assert.equal(p.storageKey,`${p.slug}:state:v1`);
  assert.throws(()=>renderPresentationShell(input,pages,''),/profile must match/);
 }
 assert.throws(()=>biology20Profile('d' as Biology20ModuleId),/Unknown/);
 assert.throws(()=>renderPresentationShell(courseFixture(),new Map(),'',biology20Profile('b').presentation),/profile must match/);
});
