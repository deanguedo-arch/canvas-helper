'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../../game/engine.js');
const {scenarios}=require('../../game/scenarios.js');
const practice=scenarios.filter(s=>s.stage==='practice');
const t=scenarios.find(s=>s.id==='T01');
function ready(s,pair=s.allowedPairs?.[0]||[]){const m=E.memory(),r=E.round(m);if(s.stage==='practice'){E.edit(r,'prediction','insufficient');for(const id of pair){E.reveal(s,r,m,id);E.select(r,id,true);}}E.edit(r,'conclusion',s.conclusion);if(s.reaction!=='none')E.edit(r,'reaction',s.reaction);if(s.application)E.edit(r,'response',s.application.answer);E.edit(r,'explanation','The supplied identity records support this claim because the substances can be compared before and after.');return {m,r};}
for(const s of practice){
 for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){
  const pair=[s.evidence[a].id,s.evidence[b].id];
  for(const conclusion of ['physical','chemical','insufficient'])for(const reaction of ['decomposition','corrosion','composition','neutralization','combustion']){
   const responses=s.application?s.application.options.map(([v])=>v):[''];
   for(const response of responses){
    test(`${s.id} pair ${a+1}${b+1} / ${conclusion} / ${reaction} / ${response||'no application'}`,()=>{
     const {m,r}=ready(s,pair);E.edit(r,'conclusion',conclusion);if(conclusion==='chemical')E.edit(r,'reaction',reaction);if(response)E.edit(r,'response',response);
     const f=E.validate(s,r,m);const pairOK=s.allowedPairs.some(p=>[...p].sort().join('|')===[...pair].sort().join('|'));
     const expected=conclusion===s.conclusion&&pairOK&&(s.reaction==='none'||reaction===s.reaction)&&(!s.application||response===s.application.answer);
     assert.equal(f.ok,expected);
     assert.equal(f.uncertain,s.id==='P01'&&!pair.includes('p01_e2')&&conclusion==='insufficient');
    });
   }
  }
 }
 test(`${s.id} incomplete input not counted or hint unlocked`,()=>{const {m,r}=ready(s);r.explanation='';assert.equal(E.submit(s,r,m).complete,false);assert.equal(m.attempts.length,0);assert.equal(E.hint(s,r,m),null);});
 test(`${s.id} two openings, no duplicate/unknown/free reveal`,()=>{const m=E.memory(),r=E.round(m);assert.equal(E.reveal(s,r,m,s.evidence[0].id),false);E.edit(r,'prediction','chemical');assert.equal(E.reveal(s,r,m,'not-an-id'),false);assert.equal(E.reveal(s,r,m,s.evidence[0].id),true);assert.equal(E.edit(r,'prediction','physical'),false);assert.equal(E.reveal(s,r,m,s.evidence[0].id),false);assert.equal(r.tokens,1);assert.equal(E.reveal(s,r,m,s.evidence[1].id),true);assert.equal(E.reveal(s,r,m,s.evidence[2].id),false);assert.equal(r.tokens,0);});
 test(`${s.id} no advance on old success; explicit revision; attempt history retained`,()=>{const {m,r}=ready(s);assert.equal(E.submit(s,r,m).ok,true);r.rubric.fill(true);assert.equal(E.canAdvance(r),true);assert.equal(E.edit(r,'explanation','changed after pass'),false);assert.equal(E.reveal(s,r,m,s.evidence[3].id),false);const old=r.submission;assert.throws(()=>{old.attempt.explanation='overwrite';},TypeError);assert.equal(E.revise(r),true);assert.equal(E.canAdvance(r),false);assert.equal(E.finalize(s,r,m),null);assert.equal(m.attempts.length,1);assert.equal(r.explanation,old.attempt.explanation);});
 test(`${s.id} reopen retains seen identities, submitted attempts and support count`,()=>{const {m,r}=ready(s);E.edit(r,'conclusion','insufficient');E.submit(s,r,m);const count=m.attempts.length;E.hint(s,r,m);const h=m.hints;assert.equal(E.reopen(s,r,m),true);assert.equal(r.tokens,2);assert.equal(r.selected.length,0);assert.equal(m.hints,h);assert.equal(m.attempts.length,count);assert.ok(m.seen.length>=2);assert.equal(m.reopens,1);assert.ok(r.explanation.length);});
 test(`${s.id} hints capped and no hint after successful submission`,()=>{const {m,r}=ready(s);E.edit(r,'conclusion','physical');if(s.conclusion==='physical')E.edit(r,'conclusion','chemical');E.edit(r,'reaction','combustion');E.submit(s,r,m);assert.ok(m.attempts.length);for(let i=0;i<s.hints.length;i++)assert.equal(E.hint(s,r,m),s.hints[i]);assert.equal(E.hint(s,r,m),null);assert.equal(m.hints,s.hints.length);const good=ready(s);E.submit(s,good.r,good.m);assert.equal(E.hint(s,good.r,good.m),null);});
 test(`${s.id} finalization requires four rubric checks and unchanged snapshot`,()=>{const {m,r}=ready(s);E.submit(s,r,m);assert.equal(E.canAdvance(r),false);r.rubric.fill(true);assert.equal(E.canAdvance(r),true);const result=E.finalize(s,r,m);assert.equal(result.explanationStatus,'submitted — not automatically graded');assert.ok(Object.isFrozen(result.submission));r.explanation+=' tampered';assert.equal(E.canAdvance(r),false);});
}
test('P01 justified uncertainty is a learning checkpoint, not an automatic pass',()=>{const s=practice[0],{m,r}=ready(s,['p01_e1','p01_e3']);E.edit(r,'conclusion','insufficient');assert.equal(E.submit(s,r,m).uncertain,true);r.rubric.fill(true);assert.equal(E.canAdvance(r),false);assert.equal(E.followup(s,r,m),true);assert.equal(r.tokens,0);assert.equal(r.revealed.length,3);assert.equal(E.select(r,'p01_e2',true),false);E.select(r,'p01_e3',false);assert.equal(E.select(r,'p01_e2',true),true);E.edit(r,'conclusion','physical');assert.equal(E.submit(s,r,m).ok,true);assert.equal(m.firstAttempt.uncertaintyJustified,true);assert.equal(m.followup,true);});
test('P01 cannot forget decisive evidence after restarting',()=>{const s=practice[0],{m,r}=ready(s);E.reopen(s,r,m);for(const id of ['p01_e1','p01_e3']){E.reveal(s,r,m,id);E.select(r,id,true);}E.edit(r,'conclusion','insufficient');const f=E.submit(s,r,m);assert.equal(f.uncertain,false);assert.equal(f.ok,false);});
test('Hidden or unknown evidence IDs rejected by validator',()=>{const s=practice[1],{m,r}=ready(s);r.selected=['p02_e1','fake'];assert.equal(E.validate(s,r,m).complete,false);});
test('Transfer first failed attempt persists after correction and replay',()=>{const {m,r}=ready(t);E.edit(r,'conclusion','chemical');assert.equal(E.submit(t,r,m).ok,false);E.edit(r,'conclusion','physical');assert.equal(E.submit(t,r,m).ok,true);r.rubric.fill(true);const result=E.finalize(t,r,m);assert.equal(result.firstAttempt.structuredOK,false);const repeat=E.round(m);E.edit(repeat,'conclusion','physical');E.edit(repeat,'explanation','The substance remains water after a change of state.');E.submit(t,repeat,m);repeat.rubric.fill(true);assert.equal(E.finalize(t,repeat,m).firstAttempt.structuredOK,false);assert.equal(E.hint(t,repeat,m),null);});
test('Transfer explanation presence is not falsely labelled reasoning correctness',()=>{const {m,r}=ready(t);E.edit(r,'explanation','This text is present but its quality is not evaluated.');assert.equal(E.submit(t,r,m).ok,true);r.rubric.fill(true);const result=E.finalize(t,r,m);assert.match(result.explanationStatus,/not automatically graded/);assert.equal('explanationCorrect' in result,false);});
test('Minimum explanation gate only checks presence, not scientific keywords',()=>{const {m,r}=ready(t);E.edit(r,'explanation','short');assert.equal(E.submit(t,r,m).code,'missing-explanation');assert.equal(m.attempts.length,0);});
test('New case fields are blank, without leaking a previous conclusion or tokens',()=>{const one=ready(practice[0]);const m=E.memory(),r=E.round(m);assert.equal(r.tokens,2);assert.equal(r.conclusion,null);assert.equal(r.prediction,null);assert.equal(r.response,'');assert.equal(r.explanation,'');assert.deepEqual(r.selected,[]);});
test('rubric gate requires exactly four literal true values',()=>{const {m,r}=ready(t);E.submit(t,r,m);for(const v of [[],[true],[true,true,true],[true,true,true,true,true],[1,1,1,1]]){r.rubric=v;assert.equal(E.canAdvance(r),false);}r.rubric=[true,true,true,true];assert.equal(E.canAdvance(r),true);});
