/* Pure, versioned mastery evaluator. The browser runtime records evidence;
   this module alone decides the learner-facing stage for each target. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./mastery-policy.js'));else root.MathMastery=factory(root.MathMasteryPolicy);})(globalThis,function(Policy){
'use strict';
const VERSION='c3-mastery-evaluator-3';
const KINDS=new Set(['verification','transfer','reasoning','retention']);
const GAP_CAP={execution:25,reasoning:50,retention:75};
const time=r=>Number(r.observedAt)||0;
const cleanSupport=r=>Number(r.support||0)===0;
const eligibleSupport=r=>cleanSupport(r)&&Number(r.taskChecks||1)===1&&(r.component==='final-answer'||r.firstSupport===0&&r.firstWrongMask===0);
function repeatedBoundedSignal(rows){return rows.length===2&&rows.every(r=>r.correct===false&&r.firstValid===true&&r.fresh===true&&cleanSupport(r))&&rows[0].instance!==rows[1].instance&&typeof rows[0].component==='string'&&rows[0].component.startsWith('miss-')&&rows[0].component===rows[1].component;}
function qualifies(r,target){return r&&r.target===target&&KINDS.has(r.kind)&&r.correct===true&&r.firstValid===true&&r.fresh===true&&eligibleSupport(r)&&r.policy===Policy.VERSION&&typeof r.instance==='string'&&r.instance&&typeof r.variation==='string'&&r.variation;}
function submissionForReceipt(r,submissions){if(!r||typeof r!=='object')return null;if(r.component==='final-answer')return typeof r.source==='string'&&r.source.length>0&&typeof r.raw==='string'&&r.raw.trim().length>0?{}:null;
 if(r.component!=='structured-work'&&r.component!=='whole-task-and-relationship'&&!(typeof r.component==='string'&&r.component.startsWith('miss-')))return false;
 const id=r.kind==='reasoning'&&r.instance.endsWith('-reason')?r.instance.slice(0,-7):r.instance,mode=r.kind==='reasoning'?'transfer':r.kind;
 return submissions.find(w=>w.id===id&&w.mode===mode&&w.policy===r.policy&&w.checker===r.checker&&w.fresh===r.fresh&&w.firstValid===r.firstValid&&Number.isSafeInteger(r.observedAt)&&((Number(w.support||0)===Number(r.support||0)&&Number.isSafeInteger(w.observedAt)&&w.observedAt<=r.observedAt&&r.observedAt-w.observedAt<=60000)||(r.component?.startsWith('miss-')&&w.firstAt===r.observedAt&&Number(w.firstSupport||0)===Number(r.support||0)))&&typeof w.problem==='string'&&w.problem.length>0&&w.values&&Object.values(w.values).some(v=>typeof v==='string'&&v.trim().length>0))||null;}
function backedReceipt(r,submissions){return Boolean(submissionForReceipt(r,submissions));}
function verificationPeak(receipts,target){
 const seen=new Set();const rows=receipts.filter(r=>r.target===target&&r.kind==='verification'&&r.firstValid===true&&r.fresh===true&&eligibleSupport(r)).sort((a,b)=>time(a)-time(b)).filter(r=>{if(seen.has(r.instance))return false;seen.add(r.instance);return true;});let peak=0,stage50At=0;
 for(let end=0;end<rows.length;end++){
  const prefix=rows.slice(0,end+1),eligible=prefix.filter(r=>qualifies(r,target));if(eligible.some(r=>r.correct))peak=Math.max(peak,25);
  const window=prefix.slice(-3),constructed=window.filter(r=>qualifies(r,target)&&r.component==='structured-work'),variations=new Set(constructed.map(r=>r.variation));
  if(constructed.length>=2&&qualifies(window.at(-1),target)&&variations.size>=2){peak=50;if(!stage50At)stage50At=time(window.at(-1));}
 }
 return{peak,stage50At,rows};
}
function transferPair(ordered,target,after=0){const verificationInstances=new Set(ordered.filter(r=>qualifies(r,target)&&r.kind==='verification').map(r=>r.instance)),reasoning=ordered.filter(r=>qualifies(r,target)&&r.kind==='reasoning'&&time(r)>=after);for(let i=reasoning.length-1;i>=0;i--){const reason=reasoning[i],source=reason.instance.endsWith('-reason')?reason.instance.slice(0,-7):reason.instance;if(verificationInstances.has(source))continue;const transfer=ordered.find(r=>qualifies(r,target)&&r.kind==='transfer'&&r.instance===source&&time(r)>=after&&r.session===reason.session&&time(r)<=time(reason));if(transfer)return{at:time(reason),session:reason.session,instance:source};}return null;}
function stageFrom(target,ordered){const verify=verificationPeak(ordered,target.id);let stage=verify.peak,stage50At=verify.stage50At,stage75At=0,transferSession='';
 const pair=stage>=50?transferPair(ordered,target.id,stage50At):null;
 if(pair){stage=75;stage75At=pair.at;transferSession=pair.session;}
 const retention=ordered.filter(r=>qualifies(r,target.id)&&r.kind==='retention'&&stage75At>0&&time(r)>=stage75At+Policy.RETENTION_MS&&r.session&&r.session!==transferSession&&r.originSession===transferSession&&r.instance!==pair?.instance);
 if(stage>=75&&retention.length)stage=100;
 return{stage,stage50At,stage75At,verify,transferSession};
}
function earnedMarks(_target,_ordered,stage){return stage;}
function evaluateTarget(target,receipts=[],gap=null){
 const ordered=receipts.filter(r=>r&&r.target===target.id).sort((a,b)=>time(a)-time(b));const attained=stageFrom(target,ordered);let{stage,stage50At,stage75At,verify}=attained,reopened=false;
 const lastVerification=verify.rows.at(-1),pending=stage>=25&&lastVerification?.correct===false&&!gap?.confirmed;
 if(gap?.confirmed&&GAP_CAP[gap.kind]!==undefined){const gapAt=Number(gap.observedAt||0),after=gapAt>0?ordered.filter(r=>time(r)>gapAt):[],recovery=stageFrom(target,after);if(gapAt>0&&gap.kind==='execution'&&recovery.stage>=50){stage=recovery.stage;stage50At=recovery.stage50At;stage75At=recovery.stage75At;reopened=true;}else if(gapAt>0&&gap.kind==='reasoning'&&attained.stage>=50){const pair=transferPair(after,target.id,gapAt);if(pair){stage=75;stage75At=pair.at;reopened=true;}else stage=Math.min(stage,50);}else if(gap.kind==='retention'){const later=gapAt>0&&ordered.some(r=>qualifies(r,target.id)&&r.kind==='retention'&&time(r)>gapAt&&time(r)>=stage75At+Policy.RETENTION_MS&&r.session&&r.session!==attained.transferSession&&r.originSession===attained.transferSession);if(!later)stage=Math.min(stage,75);else reopened=true;}else stage=Math.min(stage,GAP_CAP[gap.kind]);}
 const unresolved=pending||Boolean(gap?.pending&&!reopened);if(unresolved)stage=Math.min(stage,75);
 return{id:target.id,lesson:target.lesson,title:target.title,stage,marks:earnedMarks(target.id,ordered,stage,attained),assessed:ordered.length>0,pendingRecheck:unresolved,confirmedGap:gap?.confirmed&&!reopened?gap.kind:null,stage50At,stage75At,evidenceCount:ordered.length};
}
function evaluate(state={}){
 const submissions=Array.isArray(state.submissions)?state.submissions:[],receipts=(Array.isArray(state.receipts)?state.receipts:[]).filter(r=>backedReceipt(r,submissions)).map(r=>{const work=submissionForReceipt(r,submissions);return{...r,taskChecks:work?.checks||1,firstSupport:work?.firstSupport,firstWrongMask:work?.firstWrongMask};}),gaps=state.gaps&&typeof state.gaps==='object'?state.gaps:{};
 const targets=Policy.TARGETS.map(t=>evaluateTarget(t,receipts,gaps[t.id]));const total=targets.reduce((n,t)=>n+t.marks,0),score=total/targets.length;
 const essentialGaps=targets.filter(t=>t.stage<50||t.confirmedGap==='execution').map(t=>t.id),pending=targets.filter(t=>t.pendingRecheck).map(t=>t.id);
 const readiness=essentialGaps.length===0?(targets.every(t=>t.stage>=75)&&pending.length===0?(targets.every(t=>t.stage===100)?'all-automated-evidence':'ready-for-confirmation'):'independent-core'):'building';
 const lessons=Object.fromEntries([...new Set(Policy.TARGETS.map(t=>t.lesson))].map(lesson=>{const set=targets.filter(t=>t.lesson===lesson);return[lesson,{score:set.reduce((n,t)=>n+t.marks,0)/set.length,targets:set}];}));
 return{version:VERSION,policy:Policy.VERSION,score:Number(score.toFixed(1)),readiness,essentialGaps,pendingRechecks:pending,targets,lessons};
}
return Object.freeze({VERSION,qualifies,repeatedBoundedSignal,evaluateTarget,evaluate});
});
