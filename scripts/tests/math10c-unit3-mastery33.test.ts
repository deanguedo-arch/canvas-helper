import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
function load(name:string):any{const code=readFileSync(`projects/math10c-unit3-pilot/workspace/assets/${name}`,'utf8');const m:{exports:any}={exports:{}};new Function('module','exports','require',code)(m,m.exports,(request:string)=>load(request.replace('./','')));return m.exports;}
const bank=load('mastery-33.js'),contracts=load('contracts.js');
const State=load('state.js');
const answer=(p:any)=>({'m33-gcf':p.gcf,'m33-factor':p.factor,'m33-candidate':p.candidateStatus,'m33-candidate-expand':p.candidatePoly,'m33-expand':p.poly});

test('all 3.3 common-factor tasks factor completely and classify a mathematically checked proposal',()=>{
 assert.equal(bank.variants.length,240);
 assert.equal(createHash('sha256').update(JSON.stringify(bank.variants)).digest('hex'),'152aeacf00e025d04a9d54b402dd6e952c58f7e93f930cc736710224d74d40b2');
 const prompts=new Set<string>(),classes=new Set<string>(),gcfs=new Set<string>();
 for(const row of bank.variants){const p=bank.problem(row),checked=bank.check(row,answer(p),contracts.check);
  assert.equal(checked.status,'checked');assert.ok(Object.values(checked.correct).every(Boolean),p.prompt);
  assert.equal(contracts.check(p.factor,{mode:'factor',contract:'unit-polynomial-v1',answer:p.factor}).status,'correct');
  assert.equal(contracts.check(p.candidate,{mode:'factor',contract:'unit-polynomial-v1',answer:p.factor}).status,{'complete':'correct','equivalent-incomplete':'equivalent','not-equivalent':'incorrect'}[p.candidateStatus]);
  assert.ok(p.record.length<=160);prompts.add(p.prompt);classes.add(p.candidateStatus);gcfs.add(p.gcf);
 }
 assert.equal(prompts.size,240);assert.equal(classes.size,3);assert.ok(gcfs.size>=12);
 for(const suffix of 'abcd')assert.ok(new Set(bank.variants.filter((r:any)=>r.role==='verification').map((r:any)=>bank.variation(`C3-33${suffix}`,r))).size>=2);
});

test('3.3 checks GCF, complete product, proposal classification and expansion separately',()=>{
 const row=bank.variants[0],p=bank.problem(row),values=answer(p);
 const wrongs:[string,string,string][]=[['m33-gcf','2x','C3-33a'],['m33-factor',p.candidateStatus==='equivalent-incomplete'?p.candidate:'2x('+p.factor+')','C3-33b'],['m33-candidate','not-equivalent','C3-33c'],['m33-expand','1','C3-33d']];
 for(const [key,wrong,target] of wrongs){if(wrong===values[key as keyof typeof values])continue;const checked=bank.check(row,{...values,[key]:wrong},contracts.check);assert.equal(checked.status,'checked');assert.equal(checked.correct[target],false);}
 assert.equal(bank.check(row,{...values,'m33-factor':''},contracts.check).status,'input');
});

test('3.3 contract 2 analyzes a different expression while legacy drafts keep their original question',()=>{
 for(const row of bank.variants){
  const old=bank.problem(row,1),current=bank.problem(row,2),checked=bank.check(row,answer(current),contracts.check,2);
  assert.notEqual(current.analysisPoly,current.poly);
  assert.equal(current.poly,old.poly);
  assert.notEqual(current.candidate,old.factor);
  assert.ok(current.prompt.includes(current.analysisPoly));
  assert.equal(checked.status,'checked');
  assert.ok(Object.values(checked.correct).every(Boolean),current.prompt);
 }
});

test('state 14 keeps 3.3 working and packs seen-question ledgers without losing older arrays',()=>{
 const p=bank.problem(bank.variants[0]),v=State.catalog('unit3-catalog-v05').contentVersion;
 const work={id:'m33-verification-v1',index:0,mode:'verification',problem:p.record,values:answer(p),observedAt:1_700_000_000_000,support:0,fresh:true,firstValid:true,result:'4 of 4 components correct',repair:'none',policy:State.MASTERY_POLICY,checker:bank.VERSION,selected:true};
 const state={v,rev:1,route:'u3-33',r:{},active:[],pos:0,recent:[],pins:[],selectedTopic:'3.3',runMode:'independent',runSeed:0,firsts:{},drafts:{},counts:{},trig:{},book:{},reasons:{},paper:{},done:[],notes:{},exposed:[],seen:[],summary:{attempts:0,correct:0,supported:0},skills:{},legacySummary:{attempts:0,correct:0,supported:0},summaryRevision:0,
 mastery:{session:'s1',receipts:[],gaps:{},seen36:[0,239],seen31:[2,120],seen32:[0,167],seen33:[0,120,239],submissions:[work],workshop33:{id:'m33-transfer-v121',index:120,mode:'transfer',values:{'m33-gcf':'6xy'},fresh:true,support:0}}};
 const packed=State.encode(state),decoded=State.decode(packed,{pages:['u3-33'],version:v});
 assert.equal(packed.format,'unit3-state-14');assert.equal(typeof packed.mastery.seen33,'string');assert.equal(packed.mastery.seen33.length,60);
 assert.deepEqual(decoded.mastery.seen33,[0,120,239]);assert.deepEqual(decoded.mastery.submissions[0],work);assert.deepEqual(decoded.mastery.workshop33,state.mastery.workshop33);
 const old={...packed,format:'unit3-state-8',mastery:{...packed.mastery,seen36:[0,239],seen31:[2,120],seen32:[0,167]}};delete old.mastery.seen33;delete old.mastery.workshop33;
 assert.deepEqual(State.decode(old,{pages:['u3-33'],version:v}).mastery.seen36,[0,239]);
 const invalid={...packed,mastery:{...packed.mastery,seen33:'bad'}};
 assert.throws(()=>State.decode(invalid,{pages:['u3-33'],version:v}));
});
