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

// Wire-size selection is measured in the actual JSON field, not UTF-8 source bytes.
test('codec selects the shorter serialized JSON field for Unicode and escaping',()=>{
 const runtime=buildScormStateCodecRuntime();
 const force=runtime.replace('return JSON.stringify(packed).length<JSON.stringify(s).length?packed:s;','return packed;');
 assert.notEqual(force,runtime,'Update this diagnostic when the codec selection expression changes.');
 const packedOnly=vm.runInNewContext(force+'\nstateCodec;',{TextEncoder,TextDecoder,btoa,atob});
 let seed=91;const next=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 const samples=[Array.from({length:5000},()=>String.fromCharCode(0x4e00+next()%18000)).join(''),
   Array.from({length:2000},()=>String.fromCodePoint(0x1f300+next()%768)).join(''),
   '"\\\n'.repeat(1500),'abc'.repeat(4000)];
 for(const sample of samples){const raw=JSON.stringify({writing:sample}),packed=packedOnly.encode(raw),chosen=codec.encode(raw);
  assert.equal(chosen,JSON.stringify(packed).length<JSON.stringify(raw).length?packed:raw);
  assert.equal(codec.decode(chosen),raw);assert.equal(codec.decode(packed),raw);assert.equal(codec.decode(raw),raw);
 }
});
