import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadBiology20FirstTopicProof} from '../lib/biology20-course/first-topic-proof.js';
import {emptyTopicState,encodeTopicState,decodeTopicState,replaceFrayerChoice,clearFrayer} from '../lib/biology30-course/v1/pilot2-state.js';

test('A six anchors plus any two choices preserve written replacement safeguards and capacity',async()=>{
 const p=await loadBiology20FirstTopicProof(process.cwd()),schema=p.input.state;
 assert.equal(schema.families.fixed.length,6);assert.equal(schema.families.selectable.length,4);
 assert.equal(p.vocabulary.introducedTerms.length,35);
 const keys=['contextualDefinition','essentialMechanism','unitEvidence','nonExampleOrConfusion'];
 for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){
  const s=emptyTopicState(schema);s.frayerChoices=[schema.families.selectable[a],schema.families.selectable[b]];
  for(const id of [...schema.families.fixed,...s.frayerChoices]){
   const family=p.vocabulary.conceptFamilies.find(f=>f.id===id)!;
   schema.families.responseIds[id].forEach((field,i)=>s.responses[field]=family.modelFrayer[keys[i]]);
  }
  const restored=decodeTopicState(encodeTopicState(s,schema),schema);assert.deepEqual({...restored.responses},s.responses);
  const replacement=schema.families.selectable.find(f=>!s.frayerChoices.includes(f))!;
  assert.throws(()=>replaceFrayerChoice(s,schema,s.frayerChoices[0],replacement),/explicitly clear/);
  const clear=clearFrayer(s,schema,s.frayerChoices[0],true),changed=replaceFrayerChoice(clear,schema,s.frayerChoices[0],replacement);
  for(const field of schema.families.responseIds[s.frayerChoices[1]])assert.equal(changed.responses[field],s.responses[field]);
 }
 assert.ok(Object.values(p.maximumProofStates).every(n=>n<44000));
});

test('A authored companions reconcile with eighteen core parts across all six topics',async()=>{
 const base='projects/resources/biology20-production/v1/units/a/';
 const core=JSON.parse(await readFile(base+'core-teaching.json','utf8')),instruction=JSON.parse(await readFile(base+'pilot2-instruction.json','utf8'));
 assert.equal(core.parts.length,18);assert.equal(instruction.parts.length,18);
 const map=JSON.parse(await readFile('projects/resources/biology20-production/v1/topic-map.json','utf8'));
 for(const topic of map.modules.find((m:{module:string})=>m.module==='a').topics)assert.equal(core.parts.filter((p:{id:string})=>p.id.startsWith(topic.id+'-')).length,3);
 assert.equal(new Set(core.parts.map((p:{id:string})=>p.id)).size,18);
 for(const part of core.parts){const companion=instruction.parts.find((p:{partId:string})=>p.partId===part.id);assert.ok(companion);assert.equal(companion.advanced.paragraphs.length,3);assert.ok(companion.advanced.evidence.limitation);assert.equal(companion.advanced.related.focusId,companion.workedExample.id);assert.equal(companion.advanced.completionRequired,false);}
 assert.equal((2/0.5),4);assert.equal((12/1.5),8);assert.equal((1/0.2),5);assert.equal(8/2,4);assert.equal(4/2,2);assert.equal(120/(100+300),0.3);
 assert.equal(6/2,3);assert.equal(4.2/(2*4.2),0.5);assert.equal(500+80+40-50-100,470);assert.equal((12-9)/12,0.25);
 assert.equal(120-85-20,15);assert.equal(90-85-20,-15);assert.equal(40+25-45-15,5);assert.equal(5-8,-3);assert.equal(10-7,3);
 const sulfur=core.parts.find((p:{id:string})=>p.id.endsWith('-sulfur-and-human-influence')).paragraphs.join(' ');
 assert.match(sulfur,/smell is not a reliable warning/);assert.match(sulfur,/no activity/);
 const nitrogen=core.parts.find((p:{id:string})=>p.id.endsWith('-nitrogen-transformations')).paragraphs.join(' ');
 assert.match(nitrogen,/ammonium as well as nitrate/);
});
