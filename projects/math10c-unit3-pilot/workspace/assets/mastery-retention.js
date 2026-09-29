/* Retain the working that supports current mastery stages and unresolved gaps.
   Only redundant, unselected detail may roll into the disclosed count. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./mastery.js'));else root.MathMasteryRetention=factory(root.MathMastery);})(globalThis,function(Mastery){
'use strict';
const sourceId=r=>r.kind==='reasoning'&&r.instance.endsWith('-reason')?r.instance.slice(0,-7):r.instance;
const snapshot=m=>{const result=Mastery.evaluate(m);return{score:result.score,readiness:result.readiness,essentialGaps:result.essentialGaps,pendingRechecks:result.pendingRechecks,targets:result.targets.map(t=>[t.id,t.stage,t.marks,t.assessed,t.pendingRecheck,t.confirmedGap,t.stage50At,t.stage75At]),gaps:m.gaps||{},historical:m.historical||null,selected:(m.submissions||[]).filter(w=>w.selected).map(w=>[w.id,w.firstValues,w.values,w.firstSupport,w.practiceCredit])};};
function compact(source,{maxSubmissions,maxReceipts,fits=()=>true}={}){
 const mastery={...source,receipts:[...(source.receipts||[])],submissions:[...(source.submissions||[])]};
 const target=JSON.stringify(snapshot(mastery));
 const currentPolicy=Mastery.evaluate(mastery).policy,protectedIds=new Set(mastery.submissions.filter(w=>w.selected||w.policy!==currentPolicy).map(w=>w.id));
 const recentErrors=new Map();
 for(const r of mastery.receipts){if(r.correct!==false||!r.firstValid||!r.fresh||r.support)continue;const key=r.target+'|'+r.kind,ids=recentErrors.get(key)||[];ids.push(sourceId(r));recentErrors.set(key,ids.slice(-2));}
 for(const ids of recentErrors.values())for(const id of ids)protectedIds.add(id);
 if(mastery.submissions.length)protectedIds.add(mastery.submissions.at(-1).id);
 let retired=0;
 function within(){return mastery.submissions.length<=maxSubmissions&&mastery.receipts.length<=maxReceipts&&fits(mastery);}
 if(!within())for(const record of [...mastery.submissions]){
  if(protectedIds.has(record.id))continue;
  const receipts=mastery.receipts.filter(r=>sourceId(r)!==record.id),submissions=mastery.submissions.filter(w=>w!==record);
  if(JSON.stringify(snapshot({...mastery,receipts,submissions}))!==target)continue;
  mastery.receipts=receipts;mastery.submissions=submissions;retired++;
  mastery.retiredCount=Math.min(9999999,(source.retiredCount||0)+retired);
  if(within())break;
 }
 return{mastery,retired,fit:within()};
}
return Object.freeze({compact});
});
