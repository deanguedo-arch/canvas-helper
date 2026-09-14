import test from 'node:test';
import assert from 'node:assert/strict';
import {extractBiology20Outcomes} from '../lib/biology20-course/curriculum.js';
test('official BIO20 identifiers stay separate from BIO30 and split D by subject',()=>{
 const entries=extractBiology20Outcomes('20–A1.1k Explain energy\nthrough a system.\n\n20–D1.1s Plan an investigation\n\n20–D3.1k Identify kidney structures\n\n30–A1.1k Do not import this.\n');
 assert.deepEqual(entries.map(e=>e.moduleId),['a','d-part-1','d-part-2']);assert.equal(entries[0].sourceExcerpt,'20–A1.1k Explain energy\nthrough a system.');assert.ok(entries.every(e=>e.coverageStatus==='unmapped'));assert.ok(entries.every(e=>e.independentEvidence.length===0));
});
test('duplicate official identifiers cannot silently overwrite each other',()=>assert.throws(()=>extractBiology20Outcomes('20–A1.1k First\n\n20–A1.1k Second'),/Duplicate/));
