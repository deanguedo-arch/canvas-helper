import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assembleAcademicMap,BIOLOGY20_OPERATION_DESIGNS} from '../lib/biology20-course/academic-map.js';
const root='projects/resources/biology20-production/v1/';
const topics=JSON.parse(await readFile(root+'topic-map.json','utf8'));
const outcomes=JSON.parse(await readFile(root+'authority/outcome-register.json','utf8'));
test('all 108 outcome designs have valid destinations without claiming learner evidence',()=>{
 const r=assembleAcademicMap(topics,outcomes);assert.equal(r.operations.length,108);
 for(const o of r.operations){assert.equal(o.status,'planned-not-verified');assert.equal(o.teachingEvidence.length,0);assert.equal(o.independentAttemptEvidence.length,0);}
 const atmosphere=r.operations.find(o=>o.id==='20-A3.3k')!;assert.equal(atmosphere.plannedTargets[0].topicId,'a-topic-sulfur-and-phosphorus-cycles');assert.ok(atmosphere.plannedTargets[0].sourceSlideNumbers.includes(72));
 assert.equal(r.teacherAcceptance,null);
});
test('missing, duplicate, cross-module and invalid topic mappings fail closed',()=>{
 assert.throws(()=>assembleAcademicMap(topics,outcomes,BIOLOGY20_OPERATION_DESIGNS.slice(1)),/Unmapped/);
 assert.throws(()=>assembleAcademicMap(topics,outcomes,[...BIOLOGY20_OPERATION_DESIGNS,BIOLOGY20_OPERATION_DESIGNS[0]]),/Invalid/);
 for(const change of [{moduleId:'b'},{topicNumbers:[99]},{topicNumbers:[1,1]}]){const rows=structuredClone(BIOLOGY20_OPERATION_DESIGNS);Object.assign(rows[0],change);assert.throws(()=>assembleAcademicMap(topics,outcomes,rows));}
});
