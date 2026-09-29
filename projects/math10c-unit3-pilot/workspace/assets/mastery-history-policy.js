/* Provisional Chapter 3 mastery policy approved for this learner pilot.
   It reports criterion evidence only; it is not a grade or teacher decision. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathMasteryHistoryPolicy=factory();})(globalThis,function(){
'use strict';
const VERSION='c3-mastery-pilot-1';
const STAGES=Object.freeze([0,25,50,75,100]);
const RETENTION_MS=48*60*60*1000;
const rows={
 '3.1':[['C3-31a','Prime factorization'],['C3-31b','Greatest common factor'],['C3-31c','Least common multiple'],['C3-31d','Choose GCF or LCM']],
 '3.2':[['C3-32a','Square roots'],['C3-32b','Cube roots'],['C3-32c','Root bounds and estimation'],['C3-32d','Dimensions and units']],
 '3.3':[['C3-33a','Complete polynomial GCF'],['C3-33b','Factor by reverse distribution'],['C3-33c','Equivalent versus complete'],['C3-33d','Verify polynomial factoring']],
 '3.4':[['C3-34a','Read an area model'],['C3-34b','Build a model from factors'],['C3-34c','Read factors from a model'],['C3-34d','Explain the cross products']],
 '3.5':[['C3-35a','Signed sum and product'],['C3-35b','Factor monic trinomials'],['C3-35c','GCF then monic factoring'],['C3-35d','Explain and repair monic factoring']],
 '3.6':[['C3-36a','Recognize non-monic structure'],['C3-36b','Construct a valid non-monic factoring strategy'],['C3-36c','Maintain equivalence through a factoring strategy'],['C3-36d','Complete and verify non-monic factoring']],
 '3.7':[['C3-37a','Distribute every term'],['C3-37b','Simplify polynomial products'],['C3-37c','Multiply with multiple variables'],['C3-37d','Polynomial applications and verification']],
 '3.8':[['C3-38a','Square a binomial'],['C3-38b','Perfect-square trinomials'],['C3-38c','Difference of squares'],['C3-38d','Choose a complete factoring sequence']]
};
const TARGETS=Object.freeze(Object.entries(rows).flatMap(([lesson,items])=>items.map(([id,title],index)=>Object.freeze({id,lesson,title,index,essential:true}))));
const BY_ID=Object.freeze(Object.fromEntries(TARGETS.map(t=>[t.id,t])));
const OBSERVED_FIXED=Object.freeze({
 g31:'C3-31b',c31:'C3-31d',i31:'C3-31d',
 g32:'C3-32d',c32:'C3-32d',i32:'C3-32d',g321:'C3-32c',g322:'C3-32c',
 g33:'C3-33a',c33:'C3-33a',i33:'C3-33a',e301:'C3-33c',
 c34:'C3-34c',
 g35:'C3-35a',c35:'C3-35b',i35:'C3-35b',e35:'C3-35d',g351:'C3-35a',g352:'C3-35d',g353:'C3-35a',g354:'C3-35b',e302:'C3-35d',
 g36:'C3-36c',c36:'C3-36d',i36:'C3-36d',
 g37:'C3-37b',c37:'C3-37c',i37:'C3-37b',e304:'C3-37b',
 g38:'C3-38b',c38:'C3-38d',i38:'C3-38d',e38:'C3-38a',e303:'C3-38a'
});
const PRACTICE_TARGETS=Object.freeze({
 '3.1':['b','c','a','b','c','a','b','c','a','b','c','a'],
 '3.2':['a','b','a','a','b','a','a','b','a','a','b','a'],
 '3.3':['b','b','b','b','b','b','b','b','b','b','b','b'],
 '3.4':[null,null,null,null,null,null,null,null,null,null,null,null],
 '3.5':['b','b','b','b','b','b','c','c','c','c','b','b'],
 '3.6':['d','d','d','d','d','d','d','d','d','d','d','d'],
 '3.7':['b','b','b','b','b','b','b','b','b','b','b','b'],
 '3.8':['c','b','c','d','c','b','c','b','c','b','c','b']
});
function targetFor(question){
 if(!question||!rows[question.lesson])return null;
 const lesson=question.lesson,id=String(question.id||''),practice=/^p\d{2}-(\d+)$/.exec(id),n=practice?Number(practice[1]):-1;
 if(question.family)return question.family==='common'?'C3-33b':'C3-35b';
 if(!practice)return null;
 const suffix=PRACTICE_TARGETS[lesson]?.[n];return suffix?'C3-'+lesson.replace('.','')+suffix:null;
}
function variationFor(question){
 if(!question)return'unknown';const id=String(question.id||'');
 if(question.family)return'generated-'+question.family;
 if(/^i\d{2}$/.test(id))return'application';if(/^e\d+/.test(id))return'error-repair';if(/^c\d{2}$/.test(id))return'lesson-check';
 // A different row number is exposure variation, not reviewed mathematical
 // variation. These existing final-answer items can establish first success;
 // they cannot supply stage 50 until target-specific classes are approved.
 if(/^p\d{2}-\d+$/.test(id))return'practice-answer-only';
 return'lesson-example';
}
function observedTargetFor(question){if(!question)return null;return OBSERVED_FIXED[String(question.id||'')]||targetFor(question);}
return Object.freeze({VERSION,STAGES,RETENTION_MS,TARGETS,BY_ID,OBSERVED_FIXED,PRACTICE_TARGETS,targetFor,observedTargetFor,variationFor});
});
