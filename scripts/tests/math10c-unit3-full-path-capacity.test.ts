import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {buildScormStateCodecRuntime} from '../lib/scorm-state-codec.ts';
function load(name:string):any{const code=readFileSync(`projects/math10c-unit3-pilot/workspace/assets/${name}`,'utf8');const m:{exports:any}={exports:{}};new Function('module','exports','require',code)(m,m.exports,(request:string)=>load(request.replace('./','')));return m.exports;}
const State=load('state.js'),Mastery=load('mastery.js'),C=load('contracts.js'),Math=load('algebra.js');
const banks:Record<number,any>=Object.fromEntries([31,32,33,34,35,36,37,38].map(n=>[n,load(`mastery-${n}.js`)]));
const codec=new Function(`${buildScormStateCodecRuntime()}\nreturn stateCodec;`)();
const report=JSON.parse(readFileSync('projects/math10c-unit3-pilot/meta/mastery-capacity-report.json','utf8')).mainCourse.authoredPath;
const signed=(n:number)=>n<0?String(n):'+'+n;
function values(n:number,row:any,p:any):Record<string,string>{
 if(n===31)return{'m31-prime-a':p.prime[0].join('*'),'m31-prime-b':p.prime[1].join('*'),...(p.numbers.length===3?{'m31-prime-c':p.prime[2].join('*')}:{}),'m31-gcf':String(p.gcf),'m31-lcm':String(p.lcm),'m31-method':p.method,'m31-value':String(p.value),'m31-counts':p.counts.join(',')};
 if(n===32)return{'m32-square':String(p.squareRoot),'m32-cube':String(p.cubeRoot),'m32-lower':String(p.lower),'m32-upper':String(p.upper),'m32-lower-power':String(p.lowerPower),'m32-upper-power':String(p.upperPower),'m32-estimate':p.estimate.toFixed(1),'m32-dimension':String(p.dimension),'m32-unit':'cm','m32-relationship':`${p.dimension}^${p.context==='area'?2:3}=${p.measure}`};
 if(n===33)return{'m33-gcf':p.gcf,'m33-factor':p.factor,'m33-candidate':p.candidateStatus,'m33-candidate-expand':p.candidatePoly,'m33-expand':p.poly};
 if(n===34)return{'m34-total':p.totalB,'m34-cell-1':p.cellsA[0],'m34-cell-2':p.cellsA[1],'m34-cell-3':p.cellsA[2],'m34-cell-4':p.cellsA[3],'m34-factors':p.B,'m34-cross':`${p.cross[0]}x${signed(p.cross[1])}x=${p.cross[0]+p.cross[1]}x`};
 if(n===35)return{'m35-pair':`${row.p},${row.q}`,'m35-sum':String(p.sum),'m35-product':String(p.product),'m35-monic':p.monic,'m35-gcf':String(p.g),'m35-full':p.whole,'m35-status':p.status,'m35-expand':p.candidateExpand};
 if(n===36){const rhs=p.a+'x^2'+signed(p.m)+'x'+signed(p.n)+'x'+signed(p.c),split=p.poly+'='+(p.g===1?rhs:p.g+'*('+rhs+')');return{'m36-g':String(p.g),'m36-a':String(p.a),'m36-b':String(p.b),'m36-c':String(p.c),'m36-m':String(p.m),'m36-n':String(p.n),'m36-split':split,'m36-factor':p.factor,'m36-work':split,'m36-expand':p.poly};}
 if(n===37)return{'m37-cell1':p.cells[0],'m37-cell2':p.cells[1],'m37-cell3':p.cells[2],'m37-cell4':p.cells[3],'m37-expanded':p.expanded,'m37-multi':p.multiExpanded,'m37-value':String(p.value),'m37-unit':p.unit+'^2','m37-check':`${row.a*row.n+row.b}*${row.c*row.n+row.d}=${p.value}`};
 return{'m38-square':p.squareExpanded,'m38-middle':String(p.middle),'m38-perfect':p.perfectFactor,'m38-difference':p.differenceFactor,'m38-gcf':String(p.g),'m38-complete':p.complete,'m38-expand':p.completeExpression};
}
function checked(n:number,row:any,input:Record<string,string>){const bank=banks[n];if(n===36){const p=bank.problem(row);return bank.middleSplit(input['m36-split'],p).status==='intermediate'&&C.check(input['m36-factor'],{mode:'factor',contract:'unit-polynomial-v1',answer:p.factor}).status==='correct';}const result=n===34?bank.check(row,input,C.check,Math.parse):n===31||n===32?bank.check(row,input):bank.check(row,input,C.check);return result.status==='checked'&&Object.values(result.correct).every(Boolean);}
const recordFor=(n:number,p:any)=>n===31?p.prompt:n===36?p.poly:p.record;
function pick(n:number){const bank=banks[n],roles=n===36?{verification:[0,11,1],transfer:[10,20,30]}:{verification:bank.variants.map((r:any,i:number)=>r.role==='verification'?i:-1).filter((i:number)=>i>=0),transfer:bank.variants.map((r:any,i:number)=>r.role==='transfer'?i:-1).filter((i:number)=>i>=0)};
 const first=roles.verification[0],p0=bank.problem(bank.variants[first]);
 const variation=(id:string,index:number)=>{const row=bank.variants[index],p=bank.problem(row);return bank.variation(id,n===31||n===36?p:row);};
 const ids='abcd'.split('').map(s=>'C3-'+n+s);
 const second=n===32?1:roles.verification.find((index:number)=>index!==first&&ids.every(id=>variation(id,index)!==variation(id,first)));
 assert.ok(second!==undefined,`reviewed verification classes for ${n}`);
 const verification=n===32?[first,second,7]:[first,second];
 const transfer=roles.transfer[0],retention=roles.transfer.find((index:number)=>index!==transfer&&recordFor(n,bank.problem(bank.variants[index]))!==recordFor(n,bank.problem(bank.variants[transfer])));
 assert.ok(retention!==undefined,`different later task for ${n}`);
 const repair=roles.verification.find((index:number)=>!verification.includes(index));
 assert.ok(repair!==undefined);return{indices:[...verification,transfer,retention],verificationCount:verification.length,repair,variation};}
function fullPath(){const now=1_700_000_000_000,mastery:any={session:'s-later',receipts:[],gaps:{},submissions:[],retiredCount:0},selected:any[]=[];
 for(const n of [31,32,33,34,35,36,37,38]){const bank=banks[n],{indices,verificationCount,repair,variation}=pick(n),ids='abcd'.split('').map(s=>'C3-'+n+s),seenKey='seen'+n,workshopKey=n===36?'workshop':'workshop'+n;mastery[seenKey]=Array.from({length:bank.variants.length},(_,i)=>i);
  for(const [step,index] of indices.entries()){const row=bank.variants[index],p=bank.problem(row),mode=step<verificationCount?'verification':step===verificationCount?'transfer':'retention',id='m'+n+'-'+mode+'-v'+(index+1),input=values(n,row,p),at=now+(mode==='retention'?60*60*60*1000:step*60*60*1000)+n*1000,session=mode==='retention'?'s-later':'s-first';
   assert.ok(checked(n,row,input),`${n} task ${index} must be mathematically correct`);
   if(n===36&&mode!=='verification'){delete input['m36-g'];delete input['m36-a'];delete input['m36-b'];delete input['m36-c'];delete input['m36-m'];delete input['m36-n'];delete input['m36-split'];}
   if(n===36&&mode==='verification')delete input['m36-work'];
   const work={id,index,mode,problem:recordFor(n,p),values:input,firstValues:{...input},firstSupport:0,firstWrongMask:0,firstAt:at,checks:1,practiceCredit:100,observedAt:at,support:0,fresh:true,firstValid:true,result:'4 of 4 components correct',repair:'none',policy:State.MASTERY_POLICY,checker:bank.VERSION,...(step===0?{selected:true}:{})};mastery.submissions.push(work);if(step===0)selected.push(work);
   for(const target of ids){const base={target,variation:variation(target,index),observedAt:at,correct:true,support:0,firstValid:true,fresh:true,policy:State.MASTERY_POLICY,checker:bank.VERSION,session,originSession:mode==='retention'?'s-first':'',component:mode==='verification'?'structured-work':'whole-task-and-relationship'};
    if(mode==='transfer'){mastery.receipts.push({...base,kind:'transfer',instance:id},{...base,kind:'reasoning',instance:id+'-reason'});}else mastery.receipts.push({...base,kind:mode,instance:id});}
  }
  const index=repair,row=bank.variants[index],p=bank.problem(row),input=values(n,row,p),id='m'+n+'-verification-v'+(index+1);if(n===36)delete input['m36-work'];const firstValues={...input},firstField=Object.keys(firstValues)[0];firstValues[firstField]='incorrect first attempt';mastery.submissions.push({id,index,mode:'verification',problem:recordFor(n,p),values:input,firstValues,firstSupport:1,firstWrongMask:1,firstAt:now+61*60*60*1000+n*1000,checks:2,practiceCredit:50,observedAt:now+61*60*60*1000+n*1000,support:1,fresh:true,firstValid:true,result:'supported repair',repair:'none',policy:State.MASTERY_POLICY,checker:bank.VERSION});
  const transferIndex=indices[verificationCount];mastery[workshopKey]={id:'m'+n+'-transfer-v'+(transferIndex+1),index:transferIndex,mode:'transfer',values:Object.fromEntries(Object.entries(values(n,bank.variants[transferIndex],bank.problem(bank.variants[transferIndex]))).slice(0,2)),fresh:false,support:1};
 }
 const state:any={v:State.catalog('unit3-catalog-v05').contentVersion,rev:100,route:'u3-review',r:{},active:[],pos:0,recent:[],pins:[],selectedTopic:'mixed',runMode:'learn',runSeed:0,firsts:{},drafts:{},counts:{},trig:{},book:{},done:['3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8'],reasons:Object.fromEntries([1,2,3,4,5,6,7,8].map(i=>['3.'+i,'I used the checked relationship and kept my working for review.'])),paper:{},notes:{help:'I revisited the target after a later session.'},exposed:[],seen:[],summary:{attempts:41,correct:33,supported:8},skills:{},legacySummary:{attempts:41,correct:33,supported:8},summaryRevision:1,mastery};
 return{state,selected};}
test('all 32 targets reach 100 with linked authored work and eight retained repairs inside the save envelope',()=>{const{state,selected}=fullPath(),m=state.mastery;assert.equal(m.receipts.length,164);assert.equal(m.submissions.length,41);assert.equal(selected.length,8);assert.equal(Mastery.evaluate(m).score,100);
 const packed=State.encode(state),raw=JSON.stringify(packed),compressed=codec.encode(raw),outer=JSON.stringify({version:1,projectSlug:'math10c-unit3-pilot',savedAt:'2026-09-23T17:00:00.000Z',values:{},scope:'course-scope',learnerId:'learner',course:{schemaVersion:1,data:compressed,completedIds:[31,32,33,34,35,36,37,38].map(n=>'u3-check-'+n)},tracking:{schemaVersion:1,bookmark:'u3-review',activeMs:99999999,pageMs:{}},reason:'edited'});
 if(process.env.CAPACITY_PROBE)console.log(JSON.stringify({application:raw.length,compressed:compressed.length,outer:outer.length,submissions:m.submissions.length,receipts:m.receipts.length,score:Mastery.evaluate(m).score}));
 assert.equal(raw.length,report.applicationPayloadCharacters);assert.equal(compressed.length,report.losslessCodecOutputCharacters);assert.equal(outer.length,report.scorm2004EnvelopeCharacters);
 assert.doesNotThrow(()=>State.checkCapacity(packed));assert.ok(raw.length<=State.APP_LIMIT);assert.ok(outer.length<=60_000);const decoded=State.decode(packed,{pages:['u3-review'],version:state.v});assert.equal(Mastery.evaluate(decoded.mastery).score,100);assert.ok(selected.every((w:any)=>decoded.mastery.submissions.some((r:any)=>r.id===w.id&&r.selected&&JSON.stringify(r.values)===JSON.stringify(w.values))));
});
