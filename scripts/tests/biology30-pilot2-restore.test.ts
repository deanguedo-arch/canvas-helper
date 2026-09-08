import test from 'node:test';
import assert from 'node:assert/strict';
import {rendererFixture} from './fixtures/biology30-pilot2/renderer.js';
import {emptyTopicState,encodeTopicState} from '../lib/biology30-course/v1/pilot2-state.js';
import {inspectTopicRestore,activateTopicRestore,readTopicRecoveryArchive,type TopicRestoreSource} from '../lib/biology30-course/v1/pilot2-restore.js';
const key='biology30-unit-b:pilot2-v3';
function setup(){const schema=rendererFixture().state,one=emptyTopicState(schema),two=emptyTopicState(schema);one.responses.written='Local original';two.responses.written='Different LMS work';const raw=encodeTopicState(one,schema),other=encodeTopicState(two,schema),map=new Map([[key,raw]]),storage={getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);}};return{schema,one,two,raw,other,map,storage};}
test('restore accepts identical current copies and requires a choice for conflicts or damaged originals',()=>{
 const {schema,raw,other}=setup(),local:TopicRestoreSource={id:key,label:'This device',raw,role:'current'};
 let result=inspectTopicRestore([local,{id:'lms',label:'LMS',raw,role:'current'}],schema);assert.equal(result.automaticId,key);assert.equal(result.requiresChoice,false);assert.equal(result.candidates.length,1);
 result=inspectTopicRestore([local,{id:'lms',label:'LMS',raw:other,role:'current'}],schema);assert.equal(result.automaticId,null);assert.equal(result.candidates.length,2);
 result=inspectTopicRestore([{...local,raw:'{broken'}, {id:key+':previous',label:'Previous local save',raw,role:'previous'}],schema);assert.equal(result.requiresChoice,true);assert.equal(result.issues.length,1);assert.equal(result.candidates.length,1);assert.equal(result.sources[0].raw,'{broken');
 assert.equal(inspectTopicRestore([],schema).requiresChoice,false);
 const ordinary=inspectTopicRestore([local,{id:key+':previous',label:'Previous local save',raw:other,role:'previous'}],schema);assert.equal(ordinary.automaticId,key);assert.equal(ordinary.requiresChoice,false);
});
test('recovery verifies all backups before activation, retains collisions and detects intervening edits',()=>{
 const {schema,raw,other,storage,map}=setup(),sources:TopicRestoreSource[]=[{id:key,label:'This device',raw,role:'current'},{id:'lms',label:'LMS',raw:other,role:'current'}],inspection=inspectTopicRestore(sources,schema);
 assert.throws(()=>activateTopicRestore(inspection,'lms',schema,storage,false),/confirm/);assert.equal(map.size,1);
 const collision=`${key}:recovery:source:${encodeURIComponent(key)}:0`;map.set(collision,'Older different original');activateTopicRestore(inspection,'lms',schema,storage,true);assert.equal(storage.getItem(key),other);assert.equal(storage.getItem(collision),'Older different original');const archived=readTopicRecoveryArchive(storage,schema);assert.equal(archived.length,2);assert.ok(archived.some(entry=>entry.raw===raw));assert.ok(archived.some(entry=>entry.raw===other));
 assert.throws(()=>activateTopicRestore(inspection,key,schema,storage,true),/changed while recovery/);assert.equal(storage.getItem(key),other);
});
test('backup quota failure leaves active work untouched and earlier work gains no new completion',()=>{
 const {schema,raw,storage}=setup(),legacy:TopicRestoreSource={id:'old-completions',label:'Earlier completion markers',raw:'["old-lesson"]',role:'legacy',legacyKind:'completions'},inspection=inspectTopicRestore([{id:key,label:'This device',raw,role:'current'},legacy],schema);
 const previous=inspection.candidates.find(item=>item.id==='preserved-earlier-work')!;assert.deepEqual(previous.state.flags,[]);assert.deepEqual(previous.state.responses,{});assert.equal(previous.state.legacy[0].original,legacy.raw);
 const quota={getItem:storage.getItem,setItem:()=>{throw new Error('quota');}};assert.throws(()=>activateTopicRestore(inspection,previous.id,schema,quota,true),/quota/);assert.equal(storage.getItem(key),raw);
});
