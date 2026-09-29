/* Pure, versioned mastery evaluator. The browser runtime records evidence;
   this module alone decides the learner-facing stage for each target. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./mastery-history-policy.js'));else root.MathMasteryHistory=factory(root.MathMasteryHistoryPolicy);})(globalThis,function(Policy){
'use strict';
const VERSION='c3-mastery-evaluator-2';
const KINDS=new Set(['verification','transfer','reasoning','retention']);
const GAP_CAP={execution:25,reasoning:50,retention:75};
const time=r=>Number(r.observedAt)||0;
const cleanSupport=r=>Number(r.support||0)===0;
const eligibleSupport=r=>cleanSupport(r)||r.supportEligible===true;
const checkQuality=r=>(125-25*Math.min(4,Math.max(1,Number(r.taskChecks)||1)+Number(Boolean(r.support))))/100;
function repeatedBoundedSignal(rows){return rows.length===2&&rows.every(r=>r.correct===false&&r.firstValid===true&&r.fresh===true&&cleanSupport(r))&&rows[0].instance!==rows[1].instance&&typeof rows[0].component==='string'&&rows[0].component.startsWith('miss-')&&rows[0].component===rows[1].component;}
function qualifies(r,target){return r&&r.target===target&&KINDS.has(r.kind)&&r.correct===true&&r.firstValid===true&&r.fresh===true&&eligibleSupport(r)&&r.policy===Policy.VERSION&&typeof r.instance==='string'&&r.instance&&typeof r.variation==='string'&&r.variation;}
function submissionForReceipt(r,submissions){if(!r||typeof r!=='object')return null;if(r.component==='final-answer')return typeof r.source==='string'&&r.source.length>0&&typeof r.raw==='string'&&r.raw.trim().length>0?{}:null;
 if(r.component!=='structured-work'&&r.component!=='whole-task-and-relationship'&&!(typeof r.component==='string'&&r.component.startsWith('miss-')))return false;
 const id=r.kind==='reasoning'&&r.instance.endsWith('-reason')?r.instance.slice(0,-7):r.instance,mode=r.kind==='reasoning'?'transfer':r.kind;
 return submissions.find(w=>w.id===id&&w.mode===mode&&w.policy===r.policy&&w.checker===r.checker&&w.fresh===r.fresh&&w.firstValid===r.firstValid&&Number(w.support||0)===Number(r.support||0)&&Number.isSafeInteger(w.observedAt)&&Number.isSafeInteger(r.observedAt)&&w.observedAt<=r.observedAt&&r.observedAt-w.observedAt<=60000&&typeof w.problem==='string'&&w.problem.length>0&&w.values&&Object.values(w.values).some(v=>typeof v==='string'&&v.trim().length>0))||null;}
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
function earnedMarks(target,ordered,stage,attained){if(stage<25)return 0;const rows=attained.verify.rows,valid=rows.filter(r=>qualifies(r,target));let marks=25*Math.max(0,...valid.map(checkQuality));
 if(stage>=50){let best=0;for(let end=0;end<rows.length;end++){const window=rows.slice(Math.max(0,end-2),end+1).filter(r=>qualifies(r,target)&&r.component==='structured-work');if(!qualifies(rows[end],target))continue;for(const a of window)for(const b of window)if(a.instance!==b.instance&&a.variation!==b.variation)best=Math.max(best,checkQuality(a)+checkQuality(b));}marks=25*best;}
 if(stage>=75){const paired=ordered.filter(r=>qualifies(r,target)&&r.kind==='transfer'&&time(r)>=attained.stage50At&&ordered.some(q=>qualifies(q,target)&&q.kind==='reasoning'&&q.instance===r.instance+'-reason'&&q.session===r.session&&time(q)>=time(r)));marks+=25*Math.max(0,...paired.map(checkQuality));}
 if(stage>=100){const later=ordered.filter(r=>qualifies(r,target)&&r.kind==='retention'&&time(r)>=attained.stage75At+Policy.RETENTION_MS&&r.session&&r.session!==attained.transferSession&&r.originSession===attained.transferSession);marks+=25*Math.max(0,...later.map(checkQuality));}
 return Math.min(stage,marks);
}
function evaluateTarget(target,receipts=[],gap=null){
 const ordered=receipts.filter(r=>r&&r.target===target.id).sort((a,b)=>time(a)-time(b));const attained=stageFrom(target,ordered);let{stage,stage50At,stage75At,verify}=attained,reopened=false;
 const lastVerification=verify.rows.at(-1),pending=stage>=25&&lastVerification?.correct===false&&!gap?.confirmed;
 if(gap?.confirmed&&GAP_CAP[gap.kind]!==undefined){const gapAt=Number(gap.observedAt||0),after=gapAt>0?ordered.filter(r=>time(r)>gapAt):[],recovery=stageFrom(target,after);if(gapAt>0&&gap.kind==='execution'&&recovery.stage>=50){stage=recovery.stage;stage50At=recovery.stage50At;stage75At=recovery.stage75At;reopened=true;}else if(gapAt>0&&gap.kind==='reasoning'&&attained.stage>=50){const pair=transferPair(after,target.id,gapAt);if(pair){stage=75;stage75At=pair.at;reopened=true;}else stage=Math.min(stage,50);}else if(gap.kind==='retention'){const later=gapAt>0&&ordered.some(r=>qualifies(r,target.id)&&r.kind==='retention'&&time(r)>gapAt&&time(r)>=stage75At+Policy.RETENTION_MS&&r.session&&r.session!==attained.transferSession&&r.originSession===attained.transferSession);if(!later)stage=Math.min(stage,75);else reopened=true;}else stage=Math.min(stage,GAP_CAP[gap.kind]);}
 const unresolved=pending||Boolean(gap?.pending&&!reopened);if(unresolved)stage=Math.min(stage,75);
 return{id:target.id,lesson:target.lesson,title:target.title,stage,marks:earnedMarks(target.id,ordered,stage,attained),assessed:ordered.length>0,pendingRecheck:unresolved,confirmedGap:gap?.confirmed&&!reopened?gap.kind:null,stage50At,stage75At,evidenceCount:ordered.length};
}
function evaluate(state={}){
 const submissions=Array.isArray(state.submissions)?state.submissions:[],receipts=(Array.isArray(state.receipts)?state.receipts:[]).filter(r=>backedReceipt(r,submissions)).map(r=>{const work=submissionForReceipt(r,submissions);return{...r,taskChecks:work?.checks||1,supportEligible:Boolean(work?.checks)};}),gaps=state.gaps&&typeof state.gaps==='object'?state.gaps:{};
 const targets=Policy.TARGETS.map(t=>evaluateTarget(t,receipts,gaps[t.id]));const total=targets.reduce((n,t)=>n+t.marks,0),score=total/targets.length;
 const essentialGaps=targets.filter(t=>t.stage<50||t.confirmedGap==='execution').map(t=>t.id),pending=targets.filter(t=>t.pendingRecheck).map(t=>t.id);
 const readiness=essentialGaps.length===0?(targets.every(t=>t.stage>=75)&&pending.length===0?(targets.every(t=>t.stage===100)?'all-automated-evidence':'ready-for-confirmation'):'independent-core'):'building';
 const lessons=Object.fromEntries([...new Set(Policy.TARGETS.map(t=>t.lesson))].map(lesson=>{const set=targets.filter(t=>t.lesson===lesson);return[lesson,{score:set.reduce((n,t)=>n+t.marks,0)/set.length,targets:set}];}));
 return{version:VERSION,policy:Policy.VERSION,score:Number(score.toFixed(1)),readiness,essentialGaps,pendingRechecks:pending,targets,lessons};
}
return Object.freeze({VERSION,qualifies,repeatedBoundedSignal,evaluateTarget,evaluate});
});
