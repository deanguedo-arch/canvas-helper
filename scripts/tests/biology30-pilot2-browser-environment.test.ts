import test from 'node:test';
import assert from 'node:assert/strict';
import {captureTopicEnvironment,captureTopicSources,connectTopicLms,findTopicLms,type TopicHost} from '../lib/biology30-course/v1/pilot2-browser-environment.js';
import {activateTopicRestore,inspectTopicRestore} from '../lib/biology30-course/v1/pilot2-restore.js';
import {rendererFixture} from './fixtures/biology30-pilot2/renderer.js';
import {emptyTopicState,encodeTopicState} from '../lib/biology30-course/v1/pilot2-state.js';
function mock(raw='') {const calls:string[][]=[];return{calls,api:{Initialize(value:string){calls.push(['Initialize',value]);return 'true';},GetValue(name:string){calls.push(['GetValue',name]);return raw;},GetLastError(){return '0';},SetValue(name:string,value:string){calls.push(['SetValue',name,value]);return 'true';},Commit(value:string){calls.push(['Commit',value]);return 'false';},Terminate(value:string){calls.push(['Terminate',value]);return 'true';}}};}
test('bounded parent and opener lookup tolerates cross-origin properties and never writes on capture',()=>{
 const {api,calls}=mock('original'),opener:TopicHost={API_1484_11:api};opener.parent=opener;const host:TopicHost={opener,get parent():never{throw new Error('cross origin');}};
 assert.equal(findTopicLms(host),api);const connection=connectTopicLms(host);assert.equal(connection.raw,'original');assert.deepEqual(calls,[['Initialize',''],['GetValue','cmi.suspend_data']]);assert.equal(connection.adapter!.setValue('cmi.suspend_data','new'),'true');assert.equal(connection.adapter!.commit(),'false');assert.equal(connection.close(),'true');assert.equal(connection.close(),null);assert.equal(connection.adapter!.setValue('cmi.suspend_data','late'),false);assert.equal(calls.filter(call=>call[0]==='Terminate').length,1);
 const cycle:TopicHost={};cycle.parent=cycle;assert.equal(findTopicLms(cycle),null);assert.equal(connectTopicLms(cycle).adapter,null);
});
test('failed initialization or source reads never become an empty writable session',()=>{
 let m=mock();m.api.Initialize=()=>'false';assert.throws(()=>connectTopicLms({API_1484_11:m.api}),/could not open/);assert.equal(m.calls.length,0);
 m=mock();m.api.GetLastError=()=> '301';assert.throws(()=>connectTopicLms({API_1484_11:m.api}),/could not read/);assert.equal(m.calls.at(-1)![0],'Terminate');assert.ok(!m.calls.some(call=>call[0]==='SetValue'));
 m=mock();assert.throws(()=>captureTopicEnvironment({API_1484_11:m.api,localStorage:{getItem(){throw new Error('read denied');},setItem(){throw new Error('must not write');}}},'B'),/read denied/);assert.equal(m.calls.at(-1)![0],'Terminate');
 assert.throws(()=>captureTopicEnvironment({get localStorage():never{throw new Error('storage denied');}},'B'),/storage denied/);
});
test('captures exact same-unit current, previous and earlier formats without normalizing damaged bytes',()=>{
 const key='biology30-unit-b',map=new Map([[key+':pilot2-v3','{damaged'],[key+':pilot2-v3:previous','older'],[key+':state:v1','{"schemaVersion":1}'],[key+':responses','{"answer":"retain"}'],[key+':complete','["old-lesson"]'],[key+':manual-evidence-notes','[{"body":"old note"}]'],['biology30-unit-c:state:v1','other unit']]);const local={getItem:(key:string)=>map.get(key)??null,setItem(){throw new Error('capture must be read only');}};
 const sources=captureTopicSources('B',local,'{"v":2,"r":[["x","old LMS"]]}');assert.equal(sources.length,7);assert.equal(sources[0].raw,'{damaged');assert.equal(sources.at(-1)!.legacyKind,'compact-v2');assert.ok(sources.every(source=>source.raw!=='other unit'));assert.equal(captureTopicSources('B',null,'garbled')[0].role,'current');assert.equal(captureTopicSources('B',null,'{"schemaVersion":1}')[0].legacyKind,'state-v1');assert.deepEqual(captureTopicSources('D',null,''),[]);
});
test('verified original archives prevent repeated migration while changed old work requires review',()=>{
 const schema=rendererFixture().state,base='biology30-unit-b',key=base+':pilot2-v3',map=new Map([[key,encodeTopicState(emptyTopicState(schema),schema)],[base+':responses','{"old":"writing"}']]),storage={getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);}};
 const first=inspectTopicRestore(captureTopicSources('B',storage,null),schema);assert.equal(first.requiresChoice,true);activateTopicRestore(first,key,schema,storage,true);const second=captureTopicSources('B',storage,null);assert.equal(second.length,1);assert.equal(inspectTopicRestore(second,schema).requiresChoice,false);assert.equal(map.get(base+':responses'),'{"old":"writing"}');map.set(base+':responses','{"old":"changed writing"}');assert.equal(inspectTopicRestore(captureTopicSources('B',storage,null),schema).requiresChoice,true);
});
