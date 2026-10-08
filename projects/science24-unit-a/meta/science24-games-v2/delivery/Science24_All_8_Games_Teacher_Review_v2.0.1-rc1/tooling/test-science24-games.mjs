import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const meta=path.join(root,'projects/science24-unit-a/meta/science24-games-v2');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const suite=await read(path.join(meta,'suite.json'));
const fixtures=await read(path.join(meta,'independent-fixtures.json'));
const arg=process.argv.indexOf('--game'),id=arg>=0?process.argv[arg+1]:null;
if(id&&!suite.games.some(g=>g.id===id))throw new Error('Unknown --game '+id);
let checks=0;const receipts=[];
function check(fn){fn();checks++;}
for(const g of suite.games.filter(g=>!id||g.id===id)){
 const dir=path.join(root,g.canonical);
 if(g.id==='A1'){
  const frozen=await read(path.join(meta,'a1-frozen-files.json'));
  for(const [p,hash] of Object.entries(frozen)){const bytes=await fs.readFile(path.join(dir,p));check(()=>assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hash));}
 }else{
  const bank=await read(path.join(dir,'data/scenarios.json'));
  const e=await import(pathToFileURL(path.join(dir,'js/engine.js')));
  const st=await import(pathToFileURL(path.join(dir,'js/state.js')));
  check(()=>assert.equal(bank.scenarios.length,6));
  check(()=>assert.equal(e.validate(bank.scenarios[0],{...bank.scenarios[0].initial,explanation:bank.scenarios[0].teacherReasoning}).valid,true,'Worked display must agree with its independent solution'));
  const premium=await fs.readFile(path.join(dir,'assets/premium/scene-v1.png'));
  check(()=>assert.ok(premium.readUInt32BE(16)>=1600&&premium.readUInt32BE(20)>=900,'Premium context plate resolution'));
  const session=st.createSession(bank);
  for(let i=0;i<6;i++){
   const s=bank.scenarios[i],a=fixtures.games[g.id][i];
   check(()=>assert.equal(e.validate(s,a).valid,true,s.id+': '+e.validate(s,a).message));
   check(()=>assert.equal(e.validate(s,{}).valid,false,s.id+' incomplete'));
   const wrong=structuredClone(a);
   if(g.id==='A2')wrong.c0=Number(wrong.c0)+1;
   if(g.id==='B1'){if(s.stage==='transfer')wrong.fraction=62.5;else wrong.path0='matter becomes energy';}
   if(g.id==='B2'){if(s.input_j!=null)wrong.efficiency=0.6;else if(s.stage==='transfer')wrong.initialTotal=0.4;else wrong.total=1000*Number(wrong.total);}
   if(g.id==='C1'){if(s.sequence)wrong.defence0='adaptive response';else wrong.measures=[];}
   if(g.id==='C2'){if(s.kind==='constraint')wrong.parent1='AA';else if(s.kind==='uncertainty')wrong.possible1=wrong.possible2;else wrong.p_aa=100;}
   if(g.id==='D1'){if(s.kind==='comparison')wrong.brakingChange='changes';else if(s.kind==='graph')wrong.horizontal='moving';else wrong.total=Number(wrong.reaction);}
   if(g.id==='D2'){if(s.kind==='boundary'){wrong.system='vehicle';wrong.mass=s.vehicle_mass;}else if(s.kind==='carts')wrong.energy='conserved';else wrong.deltaP=-Number(wrong.deltaP);}
   check(()=>assert.equal(e.validate(s,wrong).valid,false,s.id+' misconception accepted'));
   check(()=>assert.ok(s.scene&&s.explanationPrompt&&s.keyIdea&&s.predictions.length,s.id+' complete prompt'));
   check(()=>assert.ok(bank.instructions.length>=4,'Instructions cover complete learning loop'));
   await fs.access(path.join(dir,s.scene));
   if(g.id==='A2')for(const f of s.reactants.concat(s.products_list))await fs.access(path.join(dir,'assets/sprites/molecule_'+f+'.svg'));
   const m=session.missions[s.id];m.prediction=s.predictions[0];st.lockPrediction(m);
   for(const [k,v]of Object.entries(a))st.editMission(m,k,v);
   check(()=>assert.equal(st.submitMission(session,s,m,e.validate).valid,true));
   check(()=>assert.equal(st.canAdvance(m),false));
   m.selfReview={model:true,evidence:true,reasoning:true,limits:true};
   check(()=>assert.equal(st.canAdvance(m),true));
   const old=structuredClone(m.attempts[0]);st.editMission(m,'explanation','Revised explanation');
   check(()=>assert.equal(st.canAdvance(m),false));
   check(()=>assert.deepEqual(m.attempts[0],old));
   st.submitMission(session,s,m,e.validate);
   if(s.stage==='transfer')check(()=>assert.deepEqual(m.firstTransferResponse,old));
   st.addHint(m,0);st.addHint(m,0);check(()=>assert.equal(m.hintsUsed.length,1));
  }
  const clean=st.createSession(bank),t=bank.scenarios.at(-1);st.navigate(clean,bank,'transfer',5);
  check(()=>assert.equal(st.navigate(clean,bank,'worked',0),false));
  check(()=>assert.equal(st.sessionReview(clean,bank).at(-1).independentFirstResult,false));
  const a=fixtures.games[g.id],s=bank.scenarios;
  if(g.id==='A2'){
   const composition={H2:{H:2},O2:{O:2},H2O:{H:2,O:1},H2O2:{H:2,O:2},CH4:{C:1,H:4},CO2:{C:1,O:2},Fe:{Fe:1},Fe2O3:{Fe:2,O:3},CaCO3:{Ca:1,C:1,O:3},HCl:{H:1,Cl:1},CaCl2:{Ca:1,Cl:2},N2:{N:2},NH3:{N:1,H:3}};
   for(const [f,expected]of Object.entries(composition)){const svg=await fs.readFile(path.join(dir,'assets/premium/particle_'+f+'-v1.svg'),'utf8');const actual={};for(const [,el]of svg.matchAll(/data-element="([^"]+)"/g))actual[el]=(actual[el]||0)+1;check(()=>assert.deepEqual(actual,expected,'Particle representation '+f));}
   for(const coefficients of [[0,0,0],[-1,2,1],[1.5,2,1],[2,2],[2,Infinity,1]])check(()=>assert.throws(()=>e.validateBalance(s[1].reactants,s[1].products_list,coefficients)));
   check(()=>assert.throws(()=>e.validateBalance(['UNKNOWN'],['H2O'],[1,1])));
   check(()=>assert.equal(e.validate(s[1],{...a[1],c0:4,c1:4,c2:2}).valid,true));
   check(()=>assert.equal(e.validate(s[5],{...a[5],c0:2,c1:6,c2:4}).valid,false));
  }
  if(g.id==='B1'){
   check(()=>assert.equal(e.validateChain([{in:200,outputs:{electrical:150,thermal:50}},{in:200,receives:['electrical'],outputs:{light:60,thermal:140}}]).valid,false));
   check(()=>assert.equal(e.validateChain(s[0].steps).valid,true));
   check(()=>assert.equal(e.validate(s[1],{...a[1],path0:'matter becomes energy'}).valid,false));
   check(()=>assert.throws(()=>e.usefulFraction(2,1)));
  }
  if(g.id==='B2'){
   check(()=>assert.equal(e.validate(s[5],{...a[5],initialTotal:0.58,repairedTotal:0.46}).valid,true));
   check(()=>assert.equal(e.validate(s[5],{...a[5],lamps_count:0}).valid,false));
   for(const v of [-1,Infinity,NaN])check(()=>assert.throws(()=>e.deviceEnergyKWh({count:4,watts:9,hours:v})));
   check(()=>assert.throws(()=>e.deviceEnergyKWh({count:1.5,watts:9,hours:5})));
  }
  if(g.id==='C1'){
   check(()=>assert.equal(e.validate(s[1],{...a[1],measures:['clean container']}).valid,false));
   for(let i=1;i<6;i++)if(s[i].routes){const names=Object.keys(s[i].measures);for(let bits=0;bits<2**names.length;bits++){const chosen=names.filter((_,j)=>bits&(1<<j));const expected=chosen.length<=s[i].budget&&chosen.length>0&&s[i].routes.every((_,r)=>chosen.some(k=>s[i].measures[k].includes(r)))&&chosen.every(k=>s[i].measures[k].length>0);check(()=>assert.equal(e.validate(s[i],{...a[i],measures:chosen}).valid,expected));}}
  }
  if(g.id==='C2'){
   check(()=>assert.deepEqual(e.cross('Aa','Aa'),{AA:0.25,Aa:0.5,aa:0.25}));
   check(()=>assert.equal(e.validate(s[5],{...a[5],possible1:'Aa',probability1:'1/2',possible2:'AA',probability2:0}).valid,true));
   check(()=>assert.equal(e.validate(s[5],{...a[5],possible2:a[5].possible1}).valid,false));
   check(()=>assert.deepEqual(e.gametes('aa'),['a','a']));
   for(const v of [' ','%'])check(()=>assert.equal(e.validate(s[1],{...a[1],p_AA:v}).valid,false));
  }
  if(g.id==='D1'){
   check(()=>assert.equal(e.positionAt({speed:20,reactionTime:1.5},3.5),60));
   check(()=>assert.equal(e.positionAt({speed:20,reactionTime:1.5},9),70));
   check(()=>assert.equal(e.totalStop({speed:20,reactionTime:1.5,brakingDistance:40,gap:70}).stopsBefore,false));
   check(()=>assert.equal(e.totalStop({speed:20,reactionTime:1.5,brakingDistance:40,gap:70}).outcome,'touches'));
   check(()=>assert.throws(()=>e.distanceTimePoints({speed:20,reactionTime:1,brakingTime:2})));
  }
  if(g.id==='D2'){
   check(()=>assert.equal(e.momentumChange(60,-20,0),1200));
   check(()=>assert.equal(e.averageForce(-1200,0.15),-8000));
   check(()=>assert.equal(e.lockedCartVelocity([{m:2,v:3},{m:1,v:0}]).finalVelocity,2));
   for(const v of [0,-1,Infinity,NaN]){check(()=>assert.throws(()=>e.momentum(v,3)));check(()=>assert.throws(()=>e.averageForce(-10,v)));}
  }
 }
 receipts.push({game:g.id,scienceAndState:'passed'});
}
const result={schemaVersion:1,at:new Date().toISOString(),checks,games:receipts};
await fs.mkdir(path.join(meta,'validation'),{recursive:true});
await fs.writeFile(path.join(meta,'validation',`${id||'suite'}-science-state.json`),JSON.stringify(result,null,2)+'\n');
console.log(`${checks} science/state assertions passed (${receipts.map(g=>g.game).join(', ')}).`);
if(!process.argv.includes('--science-only')){
 const bundledPython='/Users/deanguedo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
 const python=process.env.S24_PYTHON || (await fs.access(bundledPython).then(()=>bundledPython).catch(()=>'python3')); 
 const p=spawnSync(python,[path.join(root,'scripts/lib/science24-games/browser_qa.py'),...(id?['--game',id]:[])],{stdio:'inherit'});
 if(p.status!==0)process.exit(p.status||1);
 if(id!=='A1'){
  if(!suite.visualAuthority){const c=spawnSync(python,[path.join(root,'scripts/lib/science24-games/correct_references.py')],{stdio:'inherit'});if(c.status!==0)process.exit(c.status||1);}
  const v=spawnSync(python,[path.join(root,'scripts/lib/science24-games',suite.visualAuthority?'premium_qa.py':'visual_qa.py'),...(id?['--game',id]:[])],{stdio:'inherit'});if(v.status!==0)process.exit(v.status||1);
 }
}
