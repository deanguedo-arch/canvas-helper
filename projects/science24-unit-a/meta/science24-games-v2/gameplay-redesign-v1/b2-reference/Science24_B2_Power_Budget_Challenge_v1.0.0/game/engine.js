/* Pure B2 numerical/state checks. No browser APIs, storage, networking or random answers. */
(function(root,factory){const x=factory();if(typeof module==='object'&&module.exports) module.exports=x;else root.B2Engine=x;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const EPS=1e-9;
function number(value){
 if(typeof value==='number') return Number.isFinite(value)?value:null;
 if(typeof value!=='string'||!value.trim()||!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/.test(value.trim())) return null;
 const n=Number(value);return Number.isFinite(n)?n:null;
}
function nonnegative(value){const n=number(value);return n!==null&&n>=0?n:null;}
function energy(count,watts,hours){
 if(!Number.isInteger(count)||count<1||nonnegative(watts)===null||nonnegative(hours)===null) throw new RangeError('Invalid device quantities.');
 const x=count*Number(watts)*Number(hours)/1000;if(!Number.isFinite(x))throw new RangeError('Energy overflow.');return x;
}
function efficiency(useful,input){
 useful=nonnegative(useful);input=nonnegative(input);
 if(useful===null||input===null||input<=0||useful>input)throw new RangeError('Useful output must be within a positive input.');
 return useful/input*100;
}
function toKWh(value,unit){const n=nonnegative(value);if(n===null)return null;if(unit==='kWh')return n;if(unit==='Wh')return n/1000;return null;}
function close(a,b,tolerance=0.000500001){return a!==null&&b!==null&&Math.abs(a-b)<=tolerance;}
function fmt(value,dp=3){return typeof value==='number'&&Number.isFinite(value)?value.toFixed(dp):'—';}
function makeDraft(s){
 return {hours:Object.fromEntries((s.devices||[]).filter(d=>d.id).map(d=>[d.id,String(d.initialHours)])), options:Object.fromEntries((s.devices||[]).filter(d=>d.id).map(d=>[d.id,d.initialOption])),
 total:'',unit:'kWh',choice:'',explanation:'',percent:'',other:'',initial:'',revised:''};
}
function plan(s,draft){
 const errors=[], rows=[];
 for(const d of s.devices||[]){
  const h=nonnegative(draft.hours?.[d.id]);const opt=d.options.find(o=>o.id===draft.options?.[d.id]);
  if(h===null||h>d.maxHours+EPS||Math.abs(h/d.step-Math.round(h/d.step))>1e-7){errors.push(`${d.label}: enter 0–${d.maxHours} hours in ${d.step}-hour steps.`);continue;}
  if(!opt){errors.push(`${d.label}: choose one of the supplied equipment options.`);continue;}
  const kwh=energy(d.count,opt.watts,h);
  rows.push({id:d.id,label:d.label,icon:d.icon,count:d.count,watts:opt.watts,hours:h,kwh,service:h+EPS>=d.minHours,minimum:d.minHours});
 }
 const total=rows.reduce((n,r)=>n+r.kwh,0),valid=errors.length===0&&rows.length===s.devices.length;
 const servicesMet=valid&&rows.every(r=>r.service),underCap=valid&&total<=s.cap+EPS;
 return {valid,errors,rows,total:valid?total:null,servicesMet,underCap,feasible:servicesMet&&underCap,remaining:valid?s.cap-total:null};
}
function answerFeedback(given,actual,unit){
 const n=number(given);
 if(n!==null && close(n,actual*1000,0.51) && unit==='kWh')return 'This looks like watt-hours entered as kilowatt-hours. Divide Wh by 1,000, or select Wh for that answer.';
 if(n!==null && close(n,actual,0.000500001) && unit==='Wh')return 'This looks like kilowatt-hours labelled as watt-hours. Select the unit that matches your number.';
 return 'Recheck quantity × power × time for every row, then add the energy values. Your predicted total does not match this plan.';
}
function validate(s,draft){
 const incomplete=[],checks=[],feedback=[];let p=null;
 function check(id,ok,pass,fail){checks.push({id,ok:!!ok,text:ok?pass:fail});if(!ok)feedback.push(fail);}
 if(s.type==='plan'||s.type==='lab'){
  p=plan(s,draft);incomplete.push(...p.errors);
  if(s.type==='plan'){
   if(toKWh(draft.total,draft.unit)===null)incomplete.push('Enter a non-negative total and choose Wh or kWh. Use a decimal point.');
   if(!s.choices.some(([id])=>id===draft.choice))incomplete.push('Choose an answer to the reasoning check.');
   if(s.requireExplanation&&!String(draft.explanation||'').trim())incomplete.push('Add your explanation. It will be kept for review, not automatically graded.');
  }
  if(incomplete.length)return {ready:false,pass:false,incomplete,checks,feedback:incomplete,plan:p};
  check('service',p.servicesMet,'Every required service is covered.','At least one run time is below its service requirement. Turning a device off is not a solution when that service is required.');
  check('budget',p.underCap,'The plan is within the energy cap.',`The plan exceeds the cap by ${fmt(-p.remaining)} kWh. Remove extra operating time or use an offered equivalent device.`);
  if(s.type==='plan'){
   check('calculation',close(toKWh(draft.total,draft.unit),p.total),'Your energy calculation matches the plan.',answerFeedback(draft.total,p.total,draft.unit));
   check('reason',draft.choice===s.correctChoice,'The selected reasoning is consistent with the task.',s.choiceFeedback);
  }
 }else if(s.type==='efficiency'){
  const pc=nonnegative(draft.percent),other=nonnegative(draft.other);
  if(pc===null||pc>100)incomplete.push('Enter an efficiency between 0 and 100%.');
  if(other===null||other>s.inputJ)incomplete.push('Enter a thermal output between 0 and the total input, in joules.');
  if(!s.choices.some(([id])=>id===draft.choice))incomplete.push('Complete the output comparison question.');
  if(incomplete.length)return {ready:false,pass:false,incomplete,checks,feedback:incomplete};
  check('efficiency',close(pc,efficiency(s.usefulJ,s.inputJ),0.05000001),'The efficiency is correct.',pc===0.6?'You found the decimal fraction. Multiply by 100 to express it as a percent.':'Use useful output ÷ total input × 100.');
  check('account',close(other,s.inputJ-s.usefulJ,0.000001),'The full energy account balances.','Subtract useful motion from total input. The rest is thermal output in this model, not destroyed energy.');
  check('reason',draft.choice===s.correctChoice,'The comparison uses both input and useful output.',s.choiceFeedback);
 }else if(s.type==='transfer'){
  const a=toKWh(draft.initial,draft.unit),b=toKWh(draft.revised,draft.unit);
  if(a===null||b===null)incomplete.push('Enter both energy totals and choose the matching energy unit.');
  if(!s.choices.some(([id])=>id===draft.choice))incomplete.push('Select your proposed plan.');
  if(!String(draft.explanation||'').trim())incomplete.push('Explain how your change keeps the full required services. Your writing is not automatically graded.');
  if(incomplete.length)return {ready:false,pass:false,incomplete,checks,feedback:incomplete};
  check('initial',close(a,s.initialKWh),'The original energy total is correct.','Recheck the original plan: minutes must become hours, and both workstations must be counted.');
  check('decision',draft.choice===s.correctChoice,'Your selected plan meets both constraints.','Keep the full service times. Compare the supplied equivalent workstation options.');
  check('revised',close(b,s.revisedKWh),'The revised energy total is correct.','Calculate the replacement workstations and the unchanged lights, then add them.');
 }else throw new Error('Unsupported task type.');
 return {ready:true,pass:checks.every(c=>c.ok),incomplete,checks,feedback,plan:p,writingReviewed:false};
}
function replayRows(rows,h){h=nonnegative(h);if(h===null)throw new RangeError('Invalid replay time.');return rows.map(r=>({...r,elapsed:Math.min(h,r.hours),usedKWh:energy(r.count,r.watts,Math.min(h,r.hours))}));}
return Object.freeze({number,nonnegative,energy,efficiency,toKWh,close,fmt,makeDraft,plan,validate,replayRows});
});
