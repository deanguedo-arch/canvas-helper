/* Focused Chapter 4 quality regressions, independent of the supplied answer-key tests.
   Usage: node contracts_probe.cjs <extracted-audit-root> [--assert-parity]
   This is a diagnostic audit; some checks intentionally fail on the reviewed build.
*/
'use strict';
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
if(!process.argv[2]){console.error('Usage: node contracts_probe.cjs <extracted-audit-root> [--assert-parity]');process.exit(2);}
const root=path.resolve(process.argv[2]);
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const name of ['chapter4-checkers.js','chapter4-practice-data.js'])vm.runInContext(fs.readFileSync(path.join(root,'Chapter_4/workspace/assets',name),'utf8'),ctx,{filename:name});
const a=ctx.Chapter4Checkers,d=ctx.Chapter4PracticeData;const checks=[];
function record(id,expected,actual,explanation){checks.push({id,expected,actual,passed:JSON.stringify(expected)===JSON.stringify(actual),explanation});}
function check42(value){return a.checkTask('42',{coefficient:'3',index:'3',radicand:'54',mixed:value,entire:'sqrt(28)'},'initial').fields.mixed.correct;}
record('EQ-RADICAL-CONTROL',true,check42('5*sqrt(3)'),'Canonical mixed radical must be accepted.');
record('EQ-RADICAL-REORDERED',true,check42('sqrt(3)*5'),'The same coefficient and radical in reversed factor order remain equivalent; an unmet presentation preference is not a mathematical error.');
record('EQ-MONOMIAL-REORDERED',true,d.accepted(d.byId('44b-1'),'8b^6a^3'),'8b^6a^3 is the same simplified product as 8a^3b^6.');
record('EQ-RATIONAL-COEFFICIENT',true,d.accepted(d.byId('44c-1'),'(9/16)*m^2'),'A rational coefficient is equivalent to a single quotient.');
record('EQ-EXACT-TERMINATING-DECIMAL',true,d.accepted(d.byId('45c-1'),'3.375'),'27/8 equals exactly 3.375; the prompt only requests evaluation.');
record('WRONG-ANSWER-CONTROL',false,d.accepted(d.byId('45c-1'),'8/27'),'The positive-exponent reciprocal error must be rejected.');
record('INPUT-MINUS-SYMBOL','-1',a.normalize('−1'),'The minus symbol supplied by the input toolbar must have a supported, consistent interpretation.');
let a0=d.lessonSet('41',0,5),a1=d.lessonSet('41',1,5);let overlap=a0.filter(q=>a1.some(r=>q.id===r.id)).length;
record('FRESH-NO-REUSE-WHEN-AVAILABLE',0,overlap,'This proposed acceptance condition requires adequate new supply or honest repeat labelling. The current eight-item bank cannot supply two disjoint five-item sets.');
record('REVIEW-TWO-SETS-COVER-CLAIM',32,new Set([...d.reviewSet(0),...d.reviewSet(1)].map(q=>q.target)).size,'The learner page promises all 32 targets across two balanced sets; coverage must be measured over target IDs.');
const semanticError={id:'ERROR-EXPLANATION-OBSERVATION',response:'Compare 70 with 64 and 81, which are nearby perfect squares.',accepted:d.accepted(d.errors[0],'Compare 70 with 64 and 81, which are nearby perfect squares.'),note:'A correct explanatory sentence is rejected by literal matching. The replacement need not automatically grade unrestricted prose: retain it ungraded or use a bounded reasoning interaction.'};
console.log(JSON.stringify({scope:'Local source contracts only; not LMS/teacher/learner acceptance.',checks,semanticError,summary:{passed:checks.filter(x=>x.passed).length,total:checks.length}},null,2));
if(process.argv.includes('--assert-parity')&&checks.some(x=>!x.passed))process.exitCode=1;
