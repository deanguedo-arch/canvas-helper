import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { emptyTopicState, encodeTopicState, decodeTopicState, persistTopicState, preserveLegacyState, replaceFrayerChoice, clearFrayer, TOPIC_STATE_TARGET, type TopicStateSchema, type KeyValueStorage } from "../lib/biology30-course/v1/pilot2-state.js";
const schemas = await Promise.all(["b","c","d"].map(async u => JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${u}/pilot2-state-schema.json`,"utf8")) as TopicStateSchema));
function memory() { const values=new Map<string,string>(); return {values,getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}}; }
function filled(schema: TopicStateSchema, character="x") {
  const state=emptyTopicState(schema);state.frayerChoices=schema.families.selectable.slice(0,2);state.updatedAt="2026-09-06T12:00:00.000Z";
  const inactive=new Set(Object.entries(schema.families.responseIds).filter(([id])=>!schema.families.fixed.includes(id)&&!state.frayerChoices.includes(id)).flatMap(([,ids])=>ids));
  for(const [id,field] of Object.entries(schema.responses)) if(!inactive.has(id)) state.responses[id]=character.repeat(Math.floor(field.limit/character.length));
  for(const [id,choice] of Object.entries(schema.choices))state.choices[id]=choice.values.at(-1)!;
  state.flags=Object.keys(schema.flags);state.visited=[...schema.routes];state.vocabularyActiveId=Object.keys(schema.families.responseIds).sort((a,b)=>b.length-a.length)[0];return state;
}
test("each all-unit maximum ordinary/Unicode state fits target and round-trips without duplicated work",()=>{
  // Flags are a semantic set. A replaced draft ID can retain its manifest bit
  // position while moving in object insertion order; every other field is exact.
  const comparable = (state: ReturnType<typeof emptyTopicState>) => JSON.parse(JSON.stringify({ ...state, flags: [...state.flags].sort() }));
  for(const schema of schemas) for(const char of ["x","漢","🧬"]){const state=filled(schema,char);const packed=encodeTopicState(state,schema);assert.ok(packed.length<=TOPIC_STATE_TARGET,`${schema.unit}: ${packed.length}`);assert.deepEqual(comparable(decodeTopicState(packed,schema)),comparable(state));}
});
test("escaping and mixed legacy overflow reject atomically and preserve original and last valid payload",()=>{
  for(const schema of schemas){
    const local=memory();const good=emptyTopicState(schema);const key=`biology30-unit-${schema.unit.toLowerCase()}:pilot2-v3`;assert.equal(persistTopicState(good,schema,local,null).local,"saved");const before=local.getItem(key);let writes=0;
    const state=filled(schema,"\u0001");const outcome=persistTopicState(state,schema,local,{setValue:()=>{writes++;return true;},commit:()=>true});assert.equal(outcome.accepted,false);assert.equal(writes,0);assert.equal(local.getItem(key),before);assert.ok(Object.values(state.responses).some(s=>s.includes("\u0001")));
    const oversizedLegacy=JSON.stringify({v:2,r:[["unknown-token","z".repeat(48000)]]});const legacyBackup="legacy-source";assert.throws(()=>preserveLegacyState(oversizedLegacy,"old LMS",schema,local,legacyBackup));assert.equal(local.getItem(legacyBackup),oversizedLegacy);
    const mixed=filled(schema);mixed.legacy=[{source:"old LMS",original:JSON.stringify({v:2,r:[["old-writing","z".repeat(40000)]]})}];assert.equal(persistTopicState(mixed,schema,local,null).accepted,false);assert.equal(local.getItem(key),before);
    const short=emptyTopicState(schema);const id=Object.keys(schema.responses)[0];short.responses[id]='Quote " slash \\ new\nline 🧬 漢';assert.equal(decodeTopicState(encodeTopicState(short,schema),schema).responses[id],short.responses[id]);
  }
});
test("save channels and exceptions are reported independently",()=>{
  const schema=schemas[0],state=emptyTopicState(schema);let commits=0;
  let result=persistTopicState(state,schema,memory(),{setValue:()=>"false",commit:()=>{commits++;return"true";}});assert.equal(result.local,"saved");assert.equal(result.setValue,"failed");assert.equal(result.commit,"not-attempted");assert.equal(commits,0);
  result=persistTopicState(state,schema,memory(),{setValue:()=>"true",commit:()=>"false"});assert.equal(result.setValue,"accepted");assert.equal(result.commit,"failed");
  const quota:KeyValueStorage={getItem:()=>null,setItem:()=>{throw new Error("quota");}};
  result=persistTopicState(state,schema,quota,{setValue:()=>true,commit:()=>true});assert.equal(result.local,"failed");assert.equal(result.commit,"confirmed");
  result=persistTopicState(state,schema,memory(),{setValue:()=>true,commit:()=>{throw new Error("offline");}});assert.equal(result.setValue,"accepted");assert.equal(result.commit,"failed");
});
test("migration preserves byte-exact raw work without reassigning answers or completions",()=>{
  for(const schema of schemas){const local=memory();const raw=' {"v":2,"r":[["old-id","Meaningful old answer 🧬"]],"c":["old-complete"],"n":[["Title","old note"]]} ';
    const state=preserveLegacyState(raw,"old LMS",schema,local,"backup");assert.equal(local.getItem("backup"),raw);assert.equal(state.legacy[0].original,raw);assert.deepEqual(state.responses,{});assert.deepEqual(state.flags,[]);assert.deepEqual(state.visited,[]);assert.equal(decodeTopicState(encodeTopicState(state,schema),schema).legacy[0].original,raw);
    assert.throws(()=>preserveLegacyState('{"v":2,"r":[]}',"old LMS",schema,local,"backup"));assert.equal(local.getItem("backup"),raw);
    assert.throws(()=>preserveLegacyState('{"v":99}',"future",schema,local,"future"));assert.equal(local.getItem("future"),null);
    assert.throws(()=>preserveLegacyState(raw,"old LMS",schema,{getItem:()=>null,setItem:()=>{throw new Error("quota");}},"backup"));
  }
});
test("written Frayer replacement requires scoped clear and leaves all unrelated work untouched",()=>{
  const schema=schemas[1];let state=emptyTopicState(schema);const [one,two,three]=schema.families.selectable;state=replaceFrayerChoice(state,schema,null,one);state=replaceFrayerChoice(state,schema,null,two);assert.throws(()=>replaceFrayerChoice(state,schema,null,three));
  const field=schema.families.responseIds[one][0],other=schema.families.responseIds[two][0];state.responses[field]="Preserve me until explicit clear";state.responses[other]="Other family";assert.throws(()=>replaceFrayerChoice(state,schema,one,three));assert.throws(()=>clearFrayer(state,schema,one,false));
  const cleared=clearFrayer(state,schema,one,true);assert.equal(state.responses[field],"Preserve me until explicit clear");assert.equal(cleared.responses[other],"Other family");assert.equal(cleared.responses[field],undefined);const replaced=replaceFrayerChoice(cleared,schema,one,three);assert.deepEqual(replaced.frayerChoices,[two,three]);
});
test("corrupt, duplicate, unknown, cross-unit and oversized fields cannot silently overwrite work",()=>{
  const schema=schemas[0],state=emptyTopicState(schema),id=Object.keys(schema.responses)[0];state.responses[id]="prior";const packed=JSON.parse(encodeTopicState(state,schema));packed.r.push(packed.r[0]);assert.throws(()=>decodeTopicState(JSON.stringify(packed),schema));
  packed.r.pop();packed.r[0][0]="unknown-token";assert.throws(()=>decodeTopicState(JSON.stringify(packed),schema));assert.throws(()=>decodeTopicState(encodeTopicState(state,schema),schemas[1]));
  state.responses[id]="x".repeat(schema.responses[id].limit+1);assert.throws(()=>encodeTopicState(state,schema));assert.equal(state.responses[id].length,schema.responses[id].limit+1);
});

test("compact flags preserve the semantic set, accept earlier token arrays and reject changed map identities or unknown bits",()=>{
  for(const schema of schemas){
    assert.ok(schema.flagPacking);
    const state=emptyTopicState(schema), ids=Object.keys(schema.flags);
    state.flags=[ids.at(-1)!,ids[0],ids[3]];
    const packed=JSON.parse(encodeTopicState(state,schema));
    assert.equal(typeof packed.f,"object");
    assert.deepEqual([...decodeTopicState(JSON.stringify(packed),schema).flags].sort(),[...state.flags].sort());
    const old={...packed,f:state.flags.map(id=>schema.flags[id])};
    assert.deepEqual(decodeTopicState(JSON.stringify(old),schema).flags,state.flags);
    const changed=structuredClone(packed);changed.f.m="0".repeat(64);assert.throws(()=>decodeTopicState(JSON.stringify(changed),schema),/mismatched flag map/);
    const extra=structuredClone(packed);extra.f.b+="0";assert.throws(()=>decodeTopicState(JSON.stringify(extra),schema),/mismatched flag map/);
    if(ids.length%4){const trailing=structuredClone(packed);trailing.f.b=trailing.f.b.slice(0,-1)+"f";assert.throws(()=>decodeTopicState(JSON.stringify(trailing),schema),/unknown trailing bits/);}
    const missing=structuredClone(schema);missing.flagPacking!.order.pop();assert.throws(()=>encodeTopicState(state,missing),/inventory drift/);
    const full=filled(schema), compact=encodeTopicState(full,schema), legacy=JSON.stringify({...JSON.parse(compact),f:full.flags.map(id=>schema.flags[id])});
    assert.ok(legacy.length-compact.length>1500,`${schema.unit}: marker compaction should create useful writing headroom`);
    assert.deepEqual(decodeTopicState(compact,schema).responses,decodeTopicState(legacy,schema).responses);
  }
});

test("ordered responses preserve distinct, empty, Unicode and escaped writing, while sparse and earlier pairs remain readable",()=>{
  for(const schema of schemas){
    const state=filled(schema), ids=Object.keys(state.responses);
    for(const [index,id] of ids.entries())state.responses[id]=`Answer ${index}`;
    state.responses[ids[0]]="";state.responses[ids[1]]="0";
    state.responses[ids[2]]='Quote " slash \\ newline\n 🧬 漢\u0001';
    delete state.responses[ids[3]];
    state.responses=Object.fromEntries(Object.entries(state.responses).reverse());
    const packed=JSON.parse(encodeTopicState(state,schema));assert.equal(packed.r.v,1);
    assert.deepEqual({...decodeTopicState(JSON.stringify(packed),schema).responses},state.responses);
    assert.ok(Object.hasOwn(decodeTopicState(JSON.stringify(packed),schema).responses,ids[0]));
    assert.ok(!Object.hasOwn(decodeTopicState(JSON.stringify(packed),schema).responses,ids[3]));
    const earlier={...packed,r:Object.entries(state.responses).map(([id,text])=>[schema.responses[id].token,text])};
    assert.deepEqual({...decodeTopicState(JSON.stringify(earlier),schema).responses},state.responses);
    assert.ok(JSON.stringify(earlier).length-JSON.stringify(packed).length>800);
    const sparse=emptyTopicState(schema);sparse.responses[ids[0]]="Only one answer";
    assert.ok(Array.isArray(JSON.parse(encodeTopicState(sparse,schema)).r));
    for(const mutate of [
      (r:any)=>{r.m="0".repeat(64);},(r:any)=>{r.b+="0";},
      (r:any)=>{r.t.pop();},(r:any)=>{r.t.push("unassigned writing");},
      (r:any)=>{r.t[0]=42;},(r:any)=>{r.extra="unrecognized data";},
    ]){const bad=structuredClone(packed);mutate(bad.r);assert.throws(()=>decodeTopicState(JSON.stringify(bad),schema));}
    if(schema.responsePacking!.order.length%4){
      const bad=structuredClone(packed);bad.r.b=bad.r.b.slice(0,-1)+"f";
      assert.throws(()=>decodeTopicState(JSON.stringify(bad),schema),/unknown trailing bits/);
    }
    const drift=structuredClone(schema);drift.responsePacking!.order.pop();
    assert.throws(()=>encodeTopicState(state,drift),/inventory drift/);
    // Failed decoding of a changed map cannot replace the last local payload.
    const local=memory(), key=`biology30-unit-${schema.unit.toLowerCase()}:pilot2-v3`;
    const old=structuredClone(packed);old.r.m="0".repeat(64);const original=JSON.stringify(old);
    local.setItem(key,original);assert.equal(persistTopicState(state,schema,local,null).local,"failed");
    assert.equal(local.getItem(key),original);
  }
});
