import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { emptyTopicState, encodeTopicState, decodeTopicState, persistTopicState } from '../lib/biology30-course/v1/pilot2-state.js';
const root='projects/resources/biology30-production/v1';
const evidence=root+'/pilot2/verification/2026-09-07-c-capacity-completion';
const read=async(file:string)=>JSON.parse(await readFile(file,'utf8'));

test('all 18 complete examples save and previous response identities are preserved',async()=>{
  const fixtures=await read(evidence+'/response-fixtures.json'),decisions=await read(evidence+'/repair-decisions.json'),before=await read(evidence+'/baseline.json');
  assert.equal(fixtures.responses.length,18);assert.equal(decisions.responses.length,18);
  for(const unit of ['b','c','d']) {
    const schema=await read(root+'/units/unit-'+unit+'/pilot2-state-schema.json');
    const restored=structuredClone(schema);
    delete restored.indexPacking;
    for(const[id,limit]of Object.entries(before.schemas[unit].originalLimits))restored.responses[id].limit=limit;
    assert.equal(createHash('sha256').update(JSON.stringify(restored,null,2)+'\n').digest('hex'),before.schemas[unit].sha256,'only reviewed limits changed; all state identities retained');
    const previous=emptyTopicState(restored);
    for(const id of Object.keys(before.schemas[unit].originalLimits))previous.responses[id]='Previous saved answer';
    assert.deepEqual(JSON.parse(JSON.stringify(decodeTopicState(encodeTopicState(previous,restored),schema))),previous);
    for(const f of fixtures.responses.filter((x:any)=>x.id.startsWith(unit+'-'))) {
      const decision=decisions.responses.find((x:any)=>x.id===f.id);
      assert.equal(schema.responses[f.id].limit,decision.appliedLimit);
      assert.equal(decision.proposedLimit,Math.ceil(f.example.length*1.25/50)*50);
      const state=emptyTopicState(schema);state.responses[f.id]=f.example;
      assert.equal(decodeTopicState(encodeTopicState(state,schema),schema).responses[f.id],f.example);
      state.responses[f.id]='x'.repeat(decision.appliedLimit);
      const good=encodeTopicState(state,schema);assert.equal(decodeTopicState(good,schema).responses[f.id],state.responses[f.id]);
      const storage=new Map<string,string>();const local={getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>{storage.set(k,v);}};
      assert.equal(persistTopicState(state,schema,local,null).accepted,true);const saved=[...storage.entries()];
      state.responses[f.id]+='x';assert.equal(persistTopicState(state,schema,local,null).accepted,false);
      assert.deepEqual([...storage.entries()],saved);assert.equal(state.responses[f.id].length,decision.appliedLimit+1);
    }
  }
});
