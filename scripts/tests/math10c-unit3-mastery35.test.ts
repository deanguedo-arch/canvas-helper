import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
function load(name:string):any{const code=readFileSync(`projects/math10c-unit3-pilot/workspace/assets/${name}`,'utf8');const m:{exports:any}={exports:{}};new Function('module','exports','require',code)(m,m.exports,(request:string)=>load(request.replace('./','')));return m.exports;}
const bank=load('mastery-35.js'),contracts=load('contracts.js'),State=load('state.js');
const answer=(row:any,p:any)=>({'m35-pair':`${row.p}, ${row.q}`,'m35-sum':String(p.sum),'m35-product':String(p.product),'m35-monic':p.monic,'m35-gcf':String(p.g),'m35-full':p.whole,'m35-status':p.status,'m35-expand':p.candidateExpand});

test('all 3.5 signed-pair tasks are mathematically checked and retain stable indexes',()=>{
 assert.equal(bank.variants.length,240);
 assert.equal(createHash('sha256').update(JSON.stringify(bank.variants)).digest('hex'),'04a172ee17fd7b3c09a435c0faa379a63ecb07771ad842bab2906e9e27f7c1f4');
 const prompts=new Set<string>(),classes=new Set<string>(),signs=new Set<string>();
 for(const row of bank.variants){const p=bank.problem(row),checked=bank.check(row,answer(row,p),contracts.check);assert.equal(checked.status,'checked');assert.ok(Object.values(checked.correct).every(Boolean),p.prompt);assert.ok(p.record.length<=160);prompts.add(p.prompt);classes.add(row.status);signs.add(row.p<0&&row.q<0?'negative':row.p>0&&row.q>0?'positive':'mixed');}
 assert.equal(prompts.size,240);assert.equal(classes.size,3);assert.equal(signs.size,3);
 for(const suffix of 'abcd')assert.ok(new Set(bank.variants.filter((r:any)=>r.role==='verification').map((r:any)=>bank.variation(`C3-35${suffix}`,r))).size>=2);
});

test('3.5 separates pair, monic, whole GCF and proposal errors',()=>{
 const row=bank.variants[0],p=bank.problem(row),values=answer(row,p);
 for(const [key,wrong,target] of [['m35-pair','2, 2','C3-35a'],['m35-monic','(x+1)(x+1)','C3-35b'],['m35-gcf','1','C3-35c'],['m35-status',p.status==='complete'?'not-equivalent':'complete','C3-35d']] as const){const checked=bank.check(row,{...values,[key]:wrong},contracts.check);assert.equal(checked.status,'checked');assert.equal(checked.correct[target],false);}
 assert.equal(bank.check(row,{...values,'m35-full':''},contracts.check).status,'input');
});

test('3.5 contract 2 analyzes a different expression while legacy drafts keep their original question',()=>{
 for(const row of bank.variants){
  const old=bank.problem(row,1),current=bank.problem(row,2),checked=bank.check(row,answer(row,current),contracts.check,2);
  assert.notEqual(current.analysisPoly,current.poly);
  assert.equal(current.poly,old.poly);
  assert.notEqual(current.candidate,old.whole);
  assert.ok(current.prompt.includes(current.analysisPoly));
  assert.equal(checked.status,'checked');
  assert.ok(Object.values(checked.correct).every(Boolean),current.prompt);
 }
});

test('state 14 retains signed factoring work, exposure and draft while decoding state 10',()=>{
 const row=bank.variants[0],p=bank.problem(row),v=State.catalog('unit3-catalog-v05').contentVersion;
 const work={id:'m35-verification-v1',index:0,mode:'verification',problem:p.record,values:answer(row,p),observedAt:1_700_000_000_000,support:0,fresh:true,firstValid:true,result:'4 of 4 components correct',repair:'none',policy:State.MASTERY_POLICY,checker:bank.VERSION,selected:true};
 const state={v,rev:1,route:'u3-35',r:{},active:[],pos:0,recent:[],pins:[],selectedTopic:'3.5',runMode:'independent',runSeed:0,firsts:{},drafts:{},counts:{},trig:{},book:{},reasons:{},paper:{},done:[],notes:{},exposed:[],seen:[],summary:{attempts:0,correct:0,supported:0},skills:{},legacySummary:{attempts:0,correct:0,supported:0},summaryRevision:0,
 mastery:{session:'s1',receipts:[],gaps:{},seen35:[0,120,239],submissions:[work],workshop35:{id:'m35-transfer-v121',index:120,mode:'transfer',values:{'m35-pair':'-2, 5'},fresh:true,support:0}}};
 const packed=State.encode(state),decoded=State.decode(packed,{pages:['u3-35'],version:v});assert.equal(packed.format,'unit3-state-14');assert.equal(typeof packed.mastery.seen35,'string');assert.deepEqual(decoded.mastery.seen35,[0,120,239]);assert.deepEqual(decoded.mastery.submissions[0],work);assert.deepEqual(decoded.mastery.workshop35,state.mastery.workshop35);
 const old={...packed,format:'unit3-state-10',mastery:{...packed.mastery}};delete old.mastery.seen35;delete old.mastery.workshop35;assert.deepEqual(State.decode(old,{pages:['u3-35'],version:v}).mastery.seen35,[]);
});
