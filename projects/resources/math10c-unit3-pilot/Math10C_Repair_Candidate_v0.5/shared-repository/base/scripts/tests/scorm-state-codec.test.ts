import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildScormStateCodecRuntime } from '../lib/scorm-state-codec.js';
const codec=vm.runInNewContext(buildScormStateCodecRuntime()+'\nstateCodec;',{TextEncoder,TextDecoder,btoa,atob});
test('bounded codec round trips exact Unicode writing and historical snapshots',()=>{
 const text=JSON.stringify({writing:'ΔH = −32.5 kJ; 🧠 neuron résumé\n'.repeat(500),history:Array.from({length:10},(_,i)=>({id:i,prompt:'Original question and displayed options',answer:'My exact answer'}))});
 const packed=codec.encode(text);assert.match(packed,/^CH10LZ1\|/);assert.equal(codec.decode(packed),text);assert.ok(packed.length<text.length);
 assert.equal(codec.decode('{"plain":true}'),'{"plain":true}');
});
test('codec rejects corruption and oversized decoded or encoded work rather than trimming',()=>{
 assert.throws(()=>codec.encode('a'.repeat(1000001)),/one-megabyte/);
 const packed=codec.encode('abc'.repeat(500));assert.throws(()=>codec.decode(packed.replace(/\|[0-9a-f]+\|/,'|00000000|')),/integrity/);
 assert.throws(()=>codec.decode('CH10LZ1|1000001|0|AA=='),/decode limit/);
 assert.throws(()=>codec.decode('CH10LZ1|bad|0|AA=='),/header/);
});
