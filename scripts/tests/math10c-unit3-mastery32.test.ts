import assert from 'node:assert/strict';
import test from 'node:test';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';

const code=readFileSync('projects/math10c-unit3-pilot/workspace/assets/mastery-32.js','utf8');
const loaded:{exports:any}={exports:{}};
new Function('module','exports',code)(loaded,loaded.exports);
const bank=loaded.exports;
function load(name:string):any{const code=readFileSync(`projects/math10c-unit3-pilot/workspace/assets/${name}`,'utf8');const m:{exports:any}={exports:{}};new Function('module','exports','require',code)(m,m.exports,(request:string)=>load(request.replace('./','')));return m.exports;}
const State=load('state.js');
const values=(p:any)=>({
 'm32-square':String(p.squareRoot),'m32-cube':String(p.cubeRoot),
 'm32-lower':String(p.lower),'m32-upper':String(p.upper),
 'm32-lower-power':String(p.lowerPower),'m32-upper-power':String(p.upperPower),
 'm32-estimate':p.estimate.toFixed(1),'m32-dimension':String(p.dimension),
 'm32-unit':'cm','m32-relationship':`${p.dimension}^${p.context==='area'?2:3}=${p.measure}`
});

test('Lesson 3.2 bank has stable, varied, mathematically sound root and dimension tasks',()=>{
 assert.equal(bank.variants.length,168);
 assert.equal(bank.variants.filter((r:any)=>r.role==='verification').length,84);
 assert.equal(bank.variants.filter((r:any)=>r.role==='transfer').length,84);
 const hashes=new Set<string>();
 for(const row of bank.variants){
  const p=bank.problem(row),result=bank.check(row,values(p));
  assert.equal(result.status,'checked');assert.ok(Object.values(result.correct).every(Boolean),p.prompt);
  assert.equal(p.lowerPower<p.radicand&&p.radicand<p.upperPower,true);
  assert.equal(p.lowerPower,p.lower**p.degree);assert.equal(p.upperPower,p.upper**p.degree);
  assert.ok(p.prompt.length<=500);assert.ok(p.record.length<=160);hashes.add(p.prompt);
 }
 assert.equal(hashes.size,bank.variants.length);
 const classes=(target:string)=>new Set(bank.variants.filter((r:any)=>r.role==='verification').map((r:any)=>bank.variation(target,r)));
 for(const suffix of 'abcd')assert.ok(classes(`C3-32${suffix}`).size>=2);
 const bankHash=crypto.createHash('sha256').update(JSON.stringify(bank.variants)).digest('hex');
 assert.equal(bankHash,'811c856582b62ec69a29266b760fadc99dce675e7f284921078eee42d6b767e1');
});

test('Lesson 3.2 checker isolates root, bound, unit and power-relationship errors',()=>{
 const row=bank.variants[0],p=bank.problem(row),correct=values(p);
 const cases:[string,string][]=[['m32-square','C3-32a'],['m32-cube','C3-32b'],['m32-upper-power','C3-32c'],['m32-unit','C3-32d'],['m32-relationship','C3-32d']];
 for(const [field,target] of cases){
  const wrong={...correct,[field]:field==='m32-unit'?'cm²':field==='m32-relationship'?'2^2=4':String(Number((correct as any)[field])+1)};
  const result=bank.check(row,wrong);
  assert.equal(result.status,'checked');assert.equal(result.correct[target],false,field);
  assert.equal(result.fieldCorrect[field],false,field);
  assert.equal(Object.values(result.fieldCorrect).filter((okay:any)=>!okay).length,1,field);
  assert.equal(Object.values(result.correct).filter(Boolean).length,3,field);
 }
 assert.deepEqual(bank.check(row,{...correct,'m32-estimate':'not a number'}).invalidFields,['m32-estimate']);
 assert.deepEqual(bank.check(row,{...correct,'m32-square':''}).invalidFields,['m32-square']);
 assert.equal(bank.check(row,{...correct,'m32-square':String(-p.squareRoot)}).correct['C3-32a'],false);
 assert.equal(bank.check(row,{...correct,'m32-relationship':`${Array(p.context==='area'?2:3).fill(p.dimension).join('*')}=${p.measure}`}).correct['C3-32d'],true);
});

test('Lesson 3.2 draft, seen variants and original work survive state 14 round trips and state 7 remains readable',()=>{
 const p=bank.problem(bank.variants[0]),input=values(p),v=State.catalog('unit3-catalog-v05').contentVersion;
 const work={id:'m32-verification-v1',index:0,mode:'verification',problem:p.record,values:input,observedAt:1_700_000_000_000,support:0,fresh:true,firstValid:true,result:'4 of 4 components correct',repair:'none',policy:State.MASTERY_POLICY,checker:bank.VERSION,selected:true};
 const state={v,rev:1,route:'u3-32',r:{},active:[],pos:0,recent:[],pins:[],selectedTopic:'3.2',runMode:'independent',runSeed:0,firsts:{},drafts:{},counts:{},trig:{},book:{},reasons:{},paper:{},done:[],notes:{},exposed:[],seen:[],summary:{attempts:0,correct:0,supported:0},skills:{},legacySummary:{attempts:0,correct:0,supported:0},summaryRevision:0,
 mastery:{session:'s1',receipts:[],gaps:{},seen36:[],seen31:[],seen32:[0,84],submissions:[work],workshop32:{id:'m32-transfer-v85',index:84,mode:'transfer',values:{'m32-square':'8'},fresh:true,support:0}}};
 const packed=State.encode(state),decoded=State.decode(packed,{pages:['u3-32'],version:v});
 assert.equal(packed.format,'unit3-state-14');assert.deepEqual(decoded.mastery.submissions[0],work);assert.deepEqual(decoded.mastery.seen32,[0,84]);assert.deepEqual(decoded.mastery.workshop32,state.mastery.workshop32);
 const prior={...packed,format:'unit3-state-7',mastery:{...packed.mastery}};delete prior.mastery.seen32;delete prior.mastery.workshop32;
 assert.deepEqual(State.decode(prior,{pages:['u3-32'],version:v}).mastery.seen32,[]);
});
