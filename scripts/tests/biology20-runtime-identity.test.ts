import test from 'node:test';
import assert from 'node:assert/strict';
import {BIOLOGY20_MODULE_UNITS,biologyRuntimeStorageKey} from '../lib/biology30-course/v1/course-identity.js';
import {emptyTopicState,encodeTopicState,decodeTopicState,persistTopicState,type TopicStateSchema} from '../lib/biology30-course/v1/pilot2-state.js';
import {captureTopicSources} from '../lib/biology30-course/v1/pilot2-browser-environment.js';
import {inspectTopicRestore,activateTopicRestore,readTopicRecoveryArchive} from '../lib/biology30-course/v1/pilot2-restore.js';
const schema=(unit:string,courseId?:'biology20'):TopicStateSchema=>({unit,...(courseId?{courseId}:{}),responses:{answer:{token:'a',limit:500}},choices:{},flags:{},routes:['overview'],families:{fixed:[],selectable:[],responseIds:{}}});
function memory(){const values=new Map<string,string>(),reads:string[]=[],writes:string[]=[];return{values,reads,writes,getItem(k:string){reads.push(k);return values.get(k)??null;},setItem(k:string,v:string){writes.push(k);values.set(k,v);}};}
test('five explicit Biology20 identities reuse compact state without cross-course or cross-module reads',()=>{
 const local=memory();local.values.set('biology30-unit-b:pilot2-v3','protected Biology30 work');
 for(const unit of BIOLOGY20_MODULE_UNITS){
  const s=schema(unit,'biology20'),state=emptyTopicState(s);state.responses.answer=`${unit}: résumé 🧬 漢 0`;assert.equal(persistTopicState(state,s,local,null).local,'saved');
  const key=biologyRuntimeStorageKey(s);assert.equal(key,`biology20-unit-${unit.toLowerCase()}:state:v1`);
  const sources=captureTopicSources(unit,local,null,'biology20');assert.equal(sources.length,1);assert.equal(sources[0].id,key);
  assert.deepEqual({...decodeTopicState(sources[0].raw,s).responses},state.responses);
  for(const other of BIOLOGY20_MODULE_UNITS.filter(x=>x!==unit))assert.throws(()=>decodeTopicState(sources[0].raw,schema(other,'biology20')));
 }
 assert.ok(local.reads.every(k=>k.startsWith('biology20-unit-')));assert.ok(local.writes.every(k=>k.startsWith('biology20-unit-')));
 assert.equal(local.values.get('biology30-unit-b:pilot2-v3'),'protected Biology30 work');
});
test('Biology20 B and Biology30 B cannot exchange even structurally identical saved payloads',()=>{
 const old=schema('B'),next=schema('B','biology20');const oldState=emptyTopicState(old),nextState=emptyTopicState(next);
 assert.throws(()=>decodeTopicState(encodeTopicState(oldState,old),next));assert.throws(()=>decodeTopicState(encodeTopicState(nextState,next),old));
 assert.throws(()=>encodeTopicState(oldState,next));assert.throws(()=>encodeTopicState(nextState,old));
 assert.equal(encodeTopicState(oldState,old),'\u007b"v":3,"u":"B","t":"1970-01-01T00:00:00.000Z","l":"overview","r":[],"p":[],"f":[],"h":[],"w":[],"z":[]}');
 assert.equal(biologyRuntimeStorageKey(old),'biology30-unit-b:pilot2-v3');assert.throws(()=>emptyTopicState(schema('A')));
});
test('recovery and rejected oversized saves preserve originals inside only the chosen module namespace',()=>{
 const local=memory(),s=schema('D-PART-2','biology20'),state=emptyTopicState(s),key=biologyRuntimeStorageKey(s);state.responses.answer='Current answer';persistTopicState(state,s,local,null);
 local.values.set(key+':previous','malformed earlier payload');const original=local.values.get(key)!;
 const inspected=inspectTopicRestore(captureTopicSources(s.unit,local,null,s.courseId),s);assert.equal(inspected.requiresChoice,true);
 activateTopicRestore(inspected,key,s,local,true);const archive=readTopicRecoveryArchive(local,s);assert.equal(archive.length,2);assert.ok(archive.some(e=>e.raw==='malformed earlier payload'));
 state.responses.answer='x'.repeat(501);assert.equal(persistTopicState(state,s,local,null).accepted,false);assert.equal(state.responses.answer.length,501);assert.equal(local.values.get(key),original);
 assert.ok(local.reads.every(k=>k.startsWith('biology20-unit-d-part-2:')));assert.ok(local.writes.every(k=>k.startsWith('biology20-unit-d-part-2:')));
});
