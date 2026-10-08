import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..');
const dir=path.join(root,'projects/science24-unit-b/workspace/games/power-budget-challenge');
const meta=path.join(root,'projects/science24-unit-a/meta/science24-games-v2/gameplay-redesign-v1/b2-pilot-1');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const bank=await read(path.join(dir,'data/scenarios.json')),extra=await read(path.join(dir,'data/gameplay.json'));
const solutions=(await read(path.join(meta,'B2_SOLUTIONS.json'))).solutions;
const model=await import(pathToFileURL(path.join(dir,'js/gameplay-model.js')));
const state=await import(pathToFileURL(path.join(dir,'js/gameplay-state.js')));
const all=model.challenges(bank,extra),core=all.slice(0,6);
let count=0;const check=fn=>{fn();count++;};
check(()=>assert.equal(core.length,6));check(()=>assert.equal(extra.variants.length,8));
check(()=>assert.deepEqual(core.map(s=>s.id),['B2-W01','B2-P01','B2-P02','B2-P03','B2-P04','B2-T01']));
check(()=>assert.ok(core.every(s=>s.contentVersion===extra.version&&s.sourceContentVersion===bank.version)));
for(const s of all){
 const fixture=solutions[s.id],r=model.judge(s,fixture.config,s.stage==='transfer');
 check(()=>assert.equal(r.valid,true,s.id+': '+r.message));
 if(r.kind==='plan')check(()=>assert.ok(Math.abs(r.total_kwh-fixture.total)<1e-9,s.id+' independently solved total'));
 else{check(()=>assert.ok(Math.abs(r.percent-fixture.percent)<1e-9));check(()=>assert.equal(r.other,fixture.other));}
 const bad=structuredClone(fixture.config);
 if(s.input_j!=null){bad.fixture='comparison';bad.efficiency=s.fixtures[1].useful/s.fixtures[1].input*100;}
 else bad[s.serviceRequirements[0].id+'_count']=0;
 check(()=>assert.equal(model.judge(s,bad,s.stage==='transfer').valid,false,s.id+' invalid cheap-service plan'));
 const g=state.createGame(all),m=g.missions[s.id];
 check(()=>assert.equal('total' in m.config,false,s.id+' no prefilled total'));
 check(()=>assert.equal('repairedTotal' in m.config,false));
 state.open(g,s);Object.assign(m.config,fixture.config);m.prediction='Prediction before testing';
 if(s.stage==='transfer'){m.explanation='The replacement retains the service within the cap.';m.evidence='energy';}
 check(()=>assert.equal(state.submit(g,s).valid,true));
 const original=structuredClone(m.trials[0]);
 m.explanation='I used the full required service and its energy account.';m.evidence=s.input_j!=null?'ratio':'energy';
 check(()=>assert.equal(state.finish(g,s).valid,true));check(()=>assert.equal(state.complete(m),true));
 const completion=m.completion;state.edit(m,'explanation','A revised explanation');
 check(()=>assert.equal(state.complete(m),false));check(()=>assert.deepEqual(m.trials[0],original));
 check(()=>assert.ok(Object.isFrozen(m.trials[0].answer)));check(()=>assert.ok(Object.isFrozen(completion)));
 check(()=>assert.equal(m.trials[0].contentVersion,s.contentVersion));
 check(()=>assert.equal(m.completions.includes(completion),true));
}
for(const v of ['', ' ', 'abc', NaN, Infinity, -1, true, false, {}, []])check(()=>assert.throws(()=>model.number(v)));
for(const v of [-1,Infinity,' ',1.5,25]){
 const s=core[1],c={...solutions[s.id].config,lamps_count:v};check(()=>assert.equal(model.account(s,c).ready,false));
}
check(()=>assert.equal(model.account(core[1],{...solutions['B2-P01'].config,lamps_power:9}).ready,false));
check(()=>assert.equal(model.account(core[1],{...solutions['B2-P01'].config,lamps_hours:2.7}).ready,false));
// Supported live forecasts are distinct from validated current trials.
const g=state.createGame(all),w=core[0],m=g.missions[w.id];state.open(g,w);
check(()=>assert.equal(state.submit(g,w).incomplete,true));check(()=>assert.equal(m.revealed,false));
m.prediction='Cap exceeded';check(()=>assert.equal(state.submit(g,w).valid,false));
check(()=>assert.equal(m.revealed,true));check(()=>assert.ok(Math.abs(m.trials[0].result.total_kwh-1.04)<1e-9));
state.edit(m,'lamps_power',10);check(()=>assert.equal(state.currentCheck(m),false));
check(()=>assert.ok(Math.abs(model.account(w,m.config).total_kwh-.44)<1e-9));
check(()=>assert.equal(state.submit(g,w).valid,true));m.explanation='Equal service, less energy.';m.evidence='energy';state.finish(g,w);
const first=structuredClone(m.trials[0]);state.edit(m,'lamps_hours',0);check(()=>assert.equal(state.complete(m),false));check(()=>assert.deepEqual(m.trials[0],first));
const t=core[5],tm=g.missions[t.id];state.open(g,t);
check(()=>assert.equal(state.open(g,w),false));check(()=>assert.equal(state.hint(g,t),null));
check(()=>assert.equal(state.submit(g,t).incomplete,true));check(()=>assert.equal(tm.firstTransferResponse,null));
Object.assign(tm.config,solutions[t.id].config,{projector_power:200,repairedTotal:.58});tm.explanation='My initial proposal keeps services.';tm.evidence='energy';
check(()=>assert.equal(state.submit(g,t).valid,false));const firstTransfer=structuredClone(tm.firstTransferResponse);
check(()=>assert.equal(firstTransfer.prediction,'Original energy: 0.58 kWh; repaired plan: 0.58 kWh'));
state.edit(tm,'projector_power',140);state.edit(tm,'repairedTotal',.46);state.edit(tm,'explanation','I kept two hours with the equal-service alternative.');
check(()=>assert.equal(state.submit(g,t).valid,true));check(()=>assert.deepEqual(tm.firstTransferResponse,firstTransfer));
check(()=>assert.equal(state.review(g,core).at(-1).independentFirstModel,false));
check(()=>assert.equal(state.open(g,w),true));check(()=>assert.equal(g.supportRevisited,true));
const clean=state.createGame(all);state.open(clean,t);const cm=clean.missions[t.id];Object.assign(cm.config,solutions[t.id].config);cm.explanation='Both services fit with the 140 W projector.';cm.evidence='energy';state.submit(clean,t);
check(()=>assert.equal(state.review(clean,core).at(-1).independentFirstModel,true));
const replay=state.createGame(all),ids=[];for(let i=0;i<8;i++)ids.push(state.takeReplay(replay,all,()=>0).id);
check(()=>assert.equal(new Set(ids).size,8));check(()=>assert.equal(state.takeReplay(replay,all),null));
const lab=all.at(-1),p=model.account(lab,solutions[lab.id].config),rows=model.replayAccount(p,1);
check(()=>assert.ok(Math.abs(rows.reduce((n,r)=>n+r.used,0)-3.870)<1e-9));
check(()=>assert.equal(rows.every(r=>r.active),true));
check(()=>assert.ok(Math.abs(model.replayAccount(p,24).reduce((n,r)=>n+r.used,0)-11.92)<1e-9));
const sourceFiles={};
for(const rel of ['data/scenarios.json','data/gameplay.json','js/engine.js','js/state.js','js/gameplay-model.js','js/gameplay-state.js'])sourceFiles[rel]=crypto.createHash('sha256').update(await fs.readFile(path.join(dir,rel))).digest('hex');
const receipt={version:model.VERSION,checks:count,scenarios:all.length,status:'passed',sourceFiles,
 independentSolutionsSHA256:crypto.createHash('sha256').update(await fs.readFile(path.join(meta,'B2_SOLUTIONS.json'))).digest('hex'),
 testScriptSHA256:crypto.createHash('sha256').update(await fs.readFile(new URL(import.meta.url))).digest('hex'),
 scope:'B2 gameplay model and state; not learner/teacher acceptance'};
await fs.writeFile(path.join(meta,'science-state-results.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(`${count} B2 gameplay science/state checks passed (${all.length} scenarios including the lab).`);
