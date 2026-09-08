import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { emptyTopicState, encodeTopicState, decodeTopicState, topicIndexIdentity } from '../lib/biology30-course/v1/pilot2-state.js';
const schema=JSON.parse(await readFile('projects/resources/biology30-production/v1/units/unit-c/pilot2-state-schema.json','utf8'));
const old=JSON.parse(await readFile('projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-c-capacity-completion/pre-change-c-schema.json','utf8'));
const plain=(s:any)=>JSON.parse(JSON.stringify({...s,flags:[...s.flags].sort()}));
test('C indexed metadata preserves all choices, visited order and old v3 saves without touching writing',()=>{
  assert.equal(createHash('sha256').update(topicIndexIdentity(schema)).digest('hex'),schema.indexPacking.sha256);
  for(let variant=0;variant<5;variant++){
    const state=emptyTopicState(old);
    Object.entries(old.choices).forEach(([id,c]:any,i)=>{if((i+variant)%5)state.choices[id]=c.values[(i+variant)%c.values.length];});
    state.visited=[...old.routes].reverse();state.flags=Object.keys(old.flags).filter((_,i)=>i%2);
    state.responses['c-review-seminar-connect']='Unchanged “draft” 🧬 漢\n\\\"';
    const previous=encodeTopicState(state,old),restored=decodeTopicState(previous,schema);
    assert.deepEqual(plain(restored),plain(state));
    assert.deepEqual(plain(decodeTopicState(encodeTopicState(restored,schema),schema)),plain(state));
  }
});
test('C indexed metadata rejects map drift, unknown choices/routes and corrupt payloads',()=>{
  const state=emptyTopicState(schema),raw=JSON.parse(encodeTopicState(state,schema));
  for(const mutate of [(p:any)=>p.p.m='0'.repeat(64),(p:any)=>p.p.b='9'+p.p.b.slice(1),(p:any)=>p.p.b+='-',(p:any)=>p.h=[0,0],(p:any)=>p.h=[-1],(p:any)=>p.h=[0.5],(p:any)=>p.h=[schema.routes.length],(p:any)=>p.p.extra=true]){
    const changed=structuredClone(raw);mutate(changed);assert.throws(()=>decodeTopicState(JSON.stringify(changed),schema));
  }
  const drift=structuredClone(schema);drift.routes.reverse();drift.indexPacking.sha256=createHash('sha256').update(topicIndexIdentity(drift)).digest('hex');
  assert.throws(()=>decodeTopicState(JSON.stringify(raw),drift));
  assert.throws(()=>decodeTopicState(JSON.stringify(raw),old));
});
test('C maximum ordinary and Unicode states fit for every optional Frayer pair and longest route',()=>{
  const pick=schema.families.selectable;
  for(const char of ['x','漢','🧬'])for(let a=0;a<pick.length;a++)for(let b=a+1;b<pick.length;b++){
    const s=emptyTopicState(schema);s.frayerChoices=[pick[a],pick[b]];s.route=[...schema.routes].sort((a,b)=>b.length-a.length)[0];
    s.vocabularyActiveId=Object.keys(schema.families.responseIds).sort((a,b)=>b.length-a.length)[0];
    const inactive=new Set(Object.entries(schema.families.responseIds).filter(([id])=>!schema.families.fixed.includes(id)&&!s.frayerChoices.includes(id)).flatMap(([,ids]:any)=>ids));
    for(const[id,f]of Object.entries(schema.responses)as any)if(!inactive.has(id))s.responses[id]=char.repeat(Math.floor(f.limit/char.length));
    for(const[id,c]of Object.entries(schema.choices)as any)s.choices[id]=c.values.at(-1);s.flags=Object.keys(schema.flags);s.visited=[...schema.routes];
    const raw=encodeTopicState(s,schema);assert.ok(raw.length<=44000,`${raw.length}`);assert.deepEqual(plain(decodeTopicState(raw,schema)),plain(s));
  }
});
