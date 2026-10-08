/* Pure, DOM-free learning-state engine. No persistence, timers, network, or keyword grading. */
(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  function freeze(value) { if (value && typeof value === 'object') {Object.values(value).forEach(freeze);Object.freeze(value);}return value; }
  const memory = () => ({attempts:[],seen:[],hints:0,reopens:0,visits:0,followup:false,firstAttempt:null});
  function round(m) { m.visits++; return {phase:'draft',prediction:null,predictionLocked:false,tokens:2,revealed:[],selected:[],conclusion:null,reaction:'',response:'',explanation:'',rubric:[false,false,false,false],feedback:null,submission:null}; }
  function fingerprint(r) { return JSON.stringify([r.prediction,[...r.revealed].sort(),[...r.selected].sort(),r.conclusion,r.reaction,r.response,r.explanation]); }
  function edit(r,key,value) {
    if(r.phase!=='draft'||!['prediction','conclusion','reaction','response','explanation'].includes(key))return false;
    if(key==='prediction'&&r.predictionLocked)return false;
    r[key]=value;
    if(key==='conclusion'&&value!=='chemical')r.reaction='';
    r.feedback=null;return true;
  }
  function reveal(s,r,m,id) {
    if(r.phase!=='draft'||s.stage!=='practice'||!r.prediction||r.tokens<=0||r.revealed.includes(id)||!s.evidence.some(e=>e.id===id))return false;
    r.revealed.push(id);r.predictionLocked=true;r.tokens--;if(!m.seen.includes(id))m.seen.push(id);r.feedback=null;return true;
  }
  function select(r,id,checked) {
    if(r.phase!=='draft'||!r.revealed.includes(id))return false;
    if(checked&&!r.selected.includes(id)){if(r.selected.length>=2)return false;r.selected.push(id);}
    if(!checked)r.selected=r.selected.filter(x=>x!==id);
    r.feedback=null;return true;
  }
  function validate(s,r,m) {
    const fail=(code,message,field='conclusion',complete=true)=>({ok:false,uncertain:false,complete,code,message,field});
    if(s.stage==='practice'&&!r.prediction)return fail('prediction','Make a provisional prediction before investigating. It is not scored.','prediction',false);
    if(!['physical','chemical','insufficient'].includes(r.conclusion))return fail('missing-conclusion','Choose what the evidence supports.','conclusion',false);
    if(s.stage==='practice'&&(r.selected.length!==2||new Set(r.selected).size!==2||!r.selected.every(id=>r.revealed.includes(id)&&s.evidence.some(e=>e.id===id))))return fail('missing-evidence','Select two revealed records as evidence. Reopen the investigation to choose different records.','evidence',false);
    if(s.stage!=='transfer'&&r.conclusion==='chemical'&&!r.reaction)return fail('missing-reaction','Choose the reaction type for your chemical-change claim.','reaction',false);
    if(s.application&&!r.response)return fail('missing-response','Make the practical or environmental decision.','response',false);
    if(r.explanation.trim().length<15)return fail('missing-explanation','Add an explanation of at least 15 characters. This is only an input check, not a grade for your reasoning.','explanation',false);
    const uncertain=s.id==='P01'&&!m.seen.includes(s.uncertaintyRecord)&&r.conclusion==='insufficient';
    if(uncertain)return {ok:false,uncertain:true,complete:true,code:'uncertainty',message:'Your caution is justified: these records do not establish substance identity. Read the identity follow-up, then finish the case with a supported classification.',field:'feedback'};
    if(r.conclusion!==s.conclusion){
      if(r.conclusion==='insufficient'&&s.stage==='practice'&&!s.requiredEvidence.every(id=>m.seen.includes(id)))return fail('evidence-gap','Your caution is reasonable with the records you have opened. Reopen the investigation and look for identity evidence to finish this case.','evidence');
      return fail('conclusion',s.misconception,'conclusion');
    }
    if(s.stage==='practice'){
      const pair=[...r.selected].sort().join('|');
      if(!s.allowedPairs.some(p=>[...p].sort().join('|')===pair)){
        const weak=s.evidence.find(e=>r.selected.includes(e.id)&&e.role==='weak');
        return fail('evidence',weak?`${weak.why} Choose a pair that directly supports the claim.`:'Your pair needs the substance-identity evidence. Compare the relevant before-and-after records.','evidence');
      }
      if(s.reaction!=='none'&&r.reaction!==s.reaction)return fail('reaction','The chemical-change claim is supported. Now compare the reactants and products with the reaction-type descriptions.','reaction');
    }
    if(s.application&&r.response!==s.application.answer)return fail('response',s.application.feedback,'response');
    return {ok:true,uncertain:false,complete:true,code:'correct',message:'The structured choices are supported by the record. Your written explanation is submitted, not automatically graded. Review it below before continuing.',field:'feedback'};
  }
  function submit(s,r,m) {
    if(r.phase!=='draft')return r.feedback;
    const result=validate(s,r,m);r.feedback=result;
    if(!result.complete)return result;
    const attempt=freeze({number:m.attempts.length+1,caseId:s.id,version:s.version,prediction:r.prediction,conclusion:r.conclusion,reaction:r.reaction,evidence:[...r.selected],revealed:[...r.revealed],response:r.response,explanation:r.explanation,structuredOK:result.ok,uncertaintyJustified:result.uncertain,hints:m.hints,reopens:m.reopens,followup:m.followup});
    m.attempts.push(attempt);if(!m.firstAttempt)m.firstAttempt=attempt;
    if(result.ok||result.uncertain){r.phase=result.ok?'submitted':'uncertain';r.submission=freeze({attempt,fingerprint:fingerprint(r),ok:result.ok});r.rubric=[false,false,false,false];}
    return result;
  }
  function revise(r) {if(r.phase==='draft')return false;r.phase='draft';r.submission=null;r.feedback=null;r.rubric=[false,false,false,false];return true;}
  function hint(s,r,m) {if(r.phase!=='draft'||!m.attempts.some(a=>!a.structuredOK)||m.hints>=s.hints.length||s.stage==='transfer')return null;return s.hints[m.hints++];}
  function reopen(s,r,m) {
    if(s.stage!=='practice')return false;
    m.reopens++;r.phase='draft';r.submission=null;r.feedback=null;r.tokens=2;r.revealed=[];r.selected=[];r.rubric=[false,false,false,false];return true;
  }
  function followup(s,r,m) {
    if(s.id!=='P01'||r.phase!=='uncertain')return false;
    const id=s.uncertaintyRecord;m.followup=true;
    if(!m.seen.includes(id))m.seen.push(id);if(!r.revealed.includes(id))r.revealed.push(id);
    revise(r);return true;
  }
  function canAdvance(r) {return r.phase==='submitted'&&!!r.submission?.ok&&r.submission.fingerprint===fingerprint(r)&&r.rubric.length===4&&r.rubric.every(x=>x===true);}
  function finalize(s,r,m) {
    if(!canAdvance(r))return null;
    return freeze({caseId:s.id,version:s.version,completed:true,structuredOK:true,explanationStatus:'submitted — not automatically graded',rubricReviewed:true,submission:clone(r.submission.attempt),firstAttempt:clone(m.firstAttempt),hints:m.hints,reopens:m.reopens,followup:m.followup,visits:m.visits,attempts:clone(m.attempts)});
  }
  const engine={memory,round,edit,reveal,select,validate,submit,revise,hint,reopen,followup,canAdvance,finalize,fingerprint};
  root.RD_ENGINE=engine;if(typeof module!=='undefined'&&module.exports)module.exports=engine;
})(typeof window!=='undefined'?window:globalThis);
