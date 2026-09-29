import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
function load(name:string):any{const code=readFileSync(`projects/math10c-unit3-pilot/workspace/assets/${name}`,'utf8');const m:{exports:any}={exports:{}};new Function('module','exports','require',code)(m,m.exports,(request:string)=>load(request.replace('./','')));return m.exports;}
const bank=load('mastery-34.js'),contracts=load('contracts.js'),math=load('algebra.js');
const State=load('state.js');
const answer=(p:any)=>({'m34-total':p.totalB,'m34-cell-1':p.cellsA[0],'m34-cell-2':p.cellsA[1],'m34-cell-3':p.cellsA[2],'m34-cell-4':p.cellsA[3],
 'm34-factors':p.B,'m34-cross':`${p.cross[0]}x${p.cross[1]>=0?'+':''}${p.cross[1]}x=${p.cross[0]+p.cross[1]}x`});

test('all 3.4 area models have correct four-cell products, factors, total and cross relation',()=>{
 assert.equal(bank.variants.length,240);
 assert.equal(createHash('sha256').update(JSON.stringify(bank.variants)).digest('hex'),'9b46231927b334f36fe016f541c4afa170e2988db13940628fe21b9e7f0c0cab');
 const prompts=new Set<string>();
 for(const row of bank.variants){const p=bank.problem(row),checked=bank.check(row,answer(p),contracts.check,math.parse);
  assert.equal(checked.status,'checked');assert.ok(Object.values(checked.correct).every(Boolean),p.prompt);
  assert.ok(p.record.length<=160);prompts.add(p.prompt);
 }
 assert.equal(prompts.size,240);
 for(const suffix of 'abcd')assert.ok(new Set(bank.variants.filter((r:any)=>r.role==='verification').map((r:any)=>bank.variation(`C3-34${suffix}`,r))).size>=2);
});

test('3.4 model checks isolate total, each cell, factors and nontrivial cross-product evidence',()=>{
 const row=bank.variants[0],p=bank.problem(row),values=answer(p);
 const signedRow=bank.variants.find((candidate:any)=>bank.problem(candidate).cross.some((n:number)=>n<0));
 assert.ok(signedRow);
 const signed=answer(bank.problem(signedRow));
 assert.match(signed['m34-cross'],/-/);
 assert.equal(bank.check(signedRow,{...signed,'m34-cross':signed['m34-cross'].replace(/-/g,'−')},contracts.check,math.parse).correct['C3-34d'],true);
 const cases:[string,string,string][]=[['m34-total','1','C3-34a'],['m34-cell-2','1','C3-34b'],['m34-factors',p.totalB,'C3-34c'],['m34-cross',`${p.cross[0]+p.cross[1]}x=${p.cross[0]+p.cross[1]}x`,'C3-34d']];
 for(const [field,raw,target] of cases){const result=bank.check(row,{...values,[field]:raw},contracts.check,math.parse);assert.equal(result.status,'checked');assert.equal(result.correct[target],false,field);}
 assert.equal(bank.check(row,{...values,'m34-total':''},contracts.check,math.parse).status,'input');
});

test('3.4 equivalent math with or without spaces checks the same way',()=>{
 const row=bank.variants[0],p=bank.problem(row),plain=answer(p);
 const spaced=Object.fromEntries(Object.entries(plain).map(([key,value])=>[key,String(value).replace(/([+*^=()])/g,' $1 ')]));
 assert.deepEqual(bank.check(row,plain,contracts.check,math.parse).correct,bank.check(row,spaced,contracts.check,math.parse).correct);
 assert.ok(Object.values(bank.check(row,spaced,contracts.check,math.parse).correct).every(Boolean));
});

test('state 14 preserves selected 3.4 model work, seen indices and a draft',()=>{
 const p=bank.problem(bank.variants[0]),v=State.catalog('unit3-catalog-v05').contentVersion;
 const work={id:'m34-verification-v1',index:0,mode:'verification',problem:p.record,values:answer(p),observedAt:1_700_000_000_000,support:0,fresh:true,firstValid:true,result:'4 of 4 components correct',repair:'none',policy:State.MASTERY_POLICY,checker:bank.VERSION,selected:true};
 const state={v,rev:1,route:'u3-34',r:{},active:[],pos:0,recent:[],pins:[],selectedTopic:'3.4',runMode:'independent',runSeed:0,firsts:{},drafts:{},counts:{},trig:{},book:{},reasons:{},paper:{},done:[],notes:{},exposed:[],seen:[],summary:{attempts:0,correct:0,supported:0},skills:{},legacySummary:{attempts:0,correct:0,supported:0},summaryRevision:0,
 mastery:{session:'s1',receipts:[],gaps:{},seen36:[],seen31:[],seen32:[],seen33:[],seen34:[0,120,239],submissions:[work],workshop34:{id:'m34-transfer-v121',index:120,mode:'transfer',values:{'m34-cell-1':'2x^2'},fresh:true,support:0}}};
 const packed=State.encode(state),decoded=State.decode(packed,{pages:['u3-34'],version:v});
 assert.equal(packed.format,'unit3-state-14');assert.equal(typeof packed.mastery.seen34,'string');assert.deepEqual(decoded.mastery.seen34,[0,120,239]);
 assert.deepEqual(decoded.mastery.submissions[0],work);assert.deepEqual(decoded.mastery.workshop34,state.mastery.workshop34);
 const old={...packed,format:'unit3-state-9',mastery:{...packed.mastery}};delete old.mastery.seen34;delete old.mastery.workshop34;
 assert.deepEqual(State.decode(old,{pages:['u3-34'],version:v}).mastery.seen34,[]);
});
