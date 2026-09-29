import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
function load(name:string):any{const code=readFileSync(`projects/math10c-unit3-pilot/workspace/assets/${name}`,'utf8');const m:{exports:any}={exports:{}};new Function('module','exports','require',code)(m,m.exports,(request:string)=>load(request.replace('./','')));return m.exports;}
const C=load('contracts.js'),State=load('state.js');
const B37=load('mastery-37.js'),B38=load('mastery-38.js');
const answer37=(r:any,p:any)=>({'m37-cell1':p.cells[0],'m37-cell2':p.cells[1],'m37-cell3':p.cells[2],'m37-cell4':p.cells[3],'m37-expanded':p.expanded,'m37-multi':p.multiExpanded,'m37-value':String(p.value),'m37-unit':p.unit+'^2','m37-check':`${r.a*r.n+r.b}*${r.c*r.n+r.d}=${p.value}`});
const answer38=(_:any,p:any)=>({'m38-square':p.squareExpanded,'m38-middle':String(p.middle),'m38-perfect':p.perfectFactor,'m38-difference':p.differenceFactor,'m38-gcf':String(p.g),'m38-complete':p.complete,'m38-expand':p.completeExpression});
for(const [n,bank,answer,hash] of [[37,B37,answer37,'7327affe4ee126588f3ecaca17a66f9737c6f1ba5119375362dd0cb0145925ec'],[38,B38,answer38,'f8506f928aaee6dcee6eea54f45850d808de8c07ea32bde9107ee5b7b6667fa4']] as const){
 test(`all ${n} tasks have correct checked relationships, variation and stable indexes`,()=>{
  assert.equal(bank.variants.length,240);assert.equal(createHash('sha256').update(JSON.stringify(bank.variants)).digest('hex'),hash);
  const prompts=new Set<string>();for(const row of bank.variants){const p=bank.problem(row),checked=bank.check(row,answer(row,p),C.check);assert.equal(checked.status,'checked');assert.ok(Object.values(checked.correct).every(Boolean),p.prompt);assert.ok(p.record.length<=160);prompts.add(p.prompt);}
  assert.equal(prompts.size,240);for(const suffix of 'abcd')assert.ok(new Set(bank.variants.filter((r:any)=>r.role==='verification').map((r:any)=>bank.variation(`C3-${n}${suffix}`,r))).size>=2);
 });
}
test('3.7 isolates distribution, simplification, multivariable and area-check errors',()=>{
 const row=B37.variants[0],p=B37.problem(row),v=answer37(row,p);
 assert.equal(B37.check(row,{...v,'m37-check':v['m37-check'].replace('*','×')},C.check).correct['C3-37d'],true);
 for(const [key,wrong,target] of [['m37-cell1','1','C3-37a'],['m37-expanded','1','C3-37b'],['m37-multi','1','C3-37c'],['m37-unit','m','C3-37d']] as const){const checked=B37.check(row,{...v,[key]:wrong},C.check);assert.equal(checked.status,'checked');assert.equal(checked.correct[target],false);}
 assert.equal(B37.check(row,{...v,'m37-check':''},C.check).status,'input');
});
test('3.8 isolates square, repeated factor, difference and complete sequence',()=>{
 const row=B38.variants[0],p=B38.problem(row),v=answer38(row,p);
 for(const [key,wrong,target] of [['m38-middle','1','C3-38a'],['m38-perfect','(x+1)^2','C3-38b'],['m38-difference','(x+1)(x+1)','C3-38c'],['m38-gcf','1','C3-38d']] as const){const checked=B38.check(row,{...v,[key]:wrong},C.check);assert.equal(checked.status,'checked');assert.equal(checked.correct[target],false);}
 assert.equal(B38.check(row,{...v,'m38-expand':''},C.check).status,'input');
});
test('state 14 keeps 3.7 and 3.8 work, exposure and drafts while decoding prior state',()=>{
 const v=State.catalog('unit3-catalog-v05').contentVersion,work=[37,38].map(n=>{const bank=n===37?B37:B38,row=bank.variants[0],p=bank.problem(row);return{id:`m${n}-verification-v1`,index:0,mode:'verification',problem:p.record,values:n===37?answer37(row,p):answer38(row,p),observedAt:1_700_000_000_000,support:0,fresh:true,firstValid:true,result:'4 of 4 components correct',repair:'none',policy:State.MASTERY_POLICY,checker:bank.VERSION,selected:true};});
 const state={v,rev:1,route:'u3-38',r:{},active:[],pos:0,recent:[],pins:[],selectedTopic:'3.8',runMode:'independent',runSeed:0,firsts:{},drafts:{},counts:{},trig:{},book:{},reasons:{},paper:{},done:[],notes:{},exposed:[],seen:[],summary:{attempts:0,correct:0,supported:0},skills:{},legacySummary:{attempts:0,correct:0,supported:0},summaryRevision:0,
  mastery:{session:'s1',receipts:[],gaps:{},seen37:[0,120,239],seen38:[0,120,239],submissions:work,workshop37:{id:'m37-transfer-v121',index:120,mode:'transfer',values:{'m37-cell1':'2x^2'},fresh:true,support:0},workshop38:{id:'m38-transfer-v121',index:120,mode:'transfer',values:{'m38-square':'4x^2+8x+4'},fresh:true,support:0}}};
 const packed=State.encode(state),decoded=State.decode(packed,{pages:['u3-38'],version:v});assert.equal(packed.format,'unit3-state-14');assert.deepEqual(decoded.mastery.seen37,[0,120,239]);assert.deepEqual(decoded.mastery.seen38,[0,120,239]);assert.deepEqual(decoded.mastery.submissions,work);assert.deepEqual(decoded.mastery.workshop37,state.mastery.workshop37);assert.deepEqual(decoded.mastery.workshop38,state.mastery.workshop38);
 const old={...packed,format:'unit3-state-11',mastery:{...packed.mastery}};delete old.mastery.seen37;delete old.mastery.seen38;delete old.mastery.workshop37;delete old.mastery.workshop38;assert.deepEqual(State.decode(old,{pages:['u3-38'],version:v}).mastery.seen38,[]);
});
