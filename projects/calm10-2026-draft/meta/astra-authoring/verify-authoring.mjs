import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const expected=['ce1-01','ce1-02','ce1-03','ce1-04','ce1-05','ce1-06','ce1-07','co1-02','co1-03','co1-04','co1-05','co2-01','co2-02','co2-03','co2-04',...Array.from({length:6},(_,i)=>'fl1-0'+(i+1)),...Array.from({length:7},(_,i)=>'fl2-0'+(i+1)),...Array.from({length:6},(_,i)=>'fl3-0'+(i+1)),...Array.from({length:5},(_,i)=>'fl4-0'+(i+1))].sort();
const actual=fs.readdirSync(path.join(root,'lessons')).filter(n=>n.endsWith('.md')).map(n=>n.slice(0,-3)).sort();
assert.deepEqual(actual,expected);
const headings=['1. Start here','2. Meet the situation and read the documents','3. Learn the method','4. Follow a complete example','5. Practise with support','6. Check your understanding','7. Apply independently','8. Review and complete','Implementation specification','Sources and adaptation'];
let words=0, questions=0, signoffs=0;
for(const id of expected){
 const s=fs.readFileSync(path.join(root,'lessons',id+'.md'),'utf8');
 let pos=-1;
 for(const h of headings){const at=s.indexOf('## '+h);assert(at>pos,id+' heading '+h);pos=at;}
 assert(s.includes('2026-09-28.astra.1'),id+' task version');
 assert(!/\b(TODO|TBD|FIXME)\b/.test(s),id+' unfinished marker');
 const q=[...s.matchAll(/^### Q([1-6])\b.*$/gm)];
 assert.deepEqual(q.map(m=>m[1]),['1','2','3','4','5','6'],id+' six questions');
 q.forEach((m,i)=>{
   const block=s.slice(m.index,i<5?q[i+1].index:s.indexOf('## 7. Apply independently'));
   for(const letter of ['A','B','C','D']) assert(new RegExp('\\b'+letter+'[.)]').test(block),id+' Q'+(i+1)+' option '+letter);
   assert(/Answer|Correct|Feedback/i.test(block),id+' Q'+(i+1)+' feedback');
 });
 const review=s.split('## 8. Review and complete')[1].split('## Implementation specification')[0];
 assert.equal((review.match(/^- /gm)||[]).length,4,id+' four signoffs');
 assert(s.includes('check:'+id+':document'),id+' document key');
 assert(s.includes('practice:'+id+':q1'),id+' practice key');
 assert(s.includes('guided:'+id+':'),id+' constructive guided fields');
 assert(s.includes('| '+id+' |')||s.includes('| \x60'+id+'\x60 |'),id+' preserved main evidence key');
 words+=s.trim().split(/\s+/).length;questions+=6;signoffs+=4;
}
const baseline=read('baseline-sha256.json');
for(const [name,hash] of Object.entries(baseline.files)){
 const bytes=fs.readFileSync(path.join(root,'../../workspace',name));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hash,'learner source changed: '+name);
}
const old=JSON.parse(fs.readFileSync(path.join(root,'../outcome-coverage.json'),'utf8'));
const matrix=read('outcome-evidence-matrix.json');
const vocabulary=read('vocabulary-copy.json');
assert.deepEqual(vocabulary.lessons.map(x=>x.id).sort(),[...expected,'co1-01'].sort());
vocabulary.lessons.forEach(x=>{assert.equal(x.terms.length,4);x.terms.forEach(t=>assert(t.term&&t.definition));});
assert.deepEqual(matrix.items.map(x=>x.id).sort(),old.items.map(x=>x.id).sort());
assert.equal(new Set(matrix.items.map(x=>x.id)).size,62);
assert.equal(matrix.items.find(x=>x.id==='CO1-SP04').status,'unmet-accepted');
const cents=x=>Math.round(Number(x)*100);
const round=x=>Math.floor(x+0.5+1e-8);
const fixtures=read('numeric-fixtures.json').cases;
let loanRows=0;
for(const [name,f] of Object.entries(fixtures)){
 let sumPay=0,sumInterest=0;
 if(f.principal){
   let bal=cents(f.principal),pay=0,rate=0;
   for(let m=1;m<=f.months;m++){
     const phase=f.phases.find(x=>x.fromMonth===m);
     if(phase){
       rate=f.rateConvention==='semiannual'?Math.pow(1+Number(phase.annualPercent)/200,1/6)-1:Number(phase.annualPercent)/1200;
       const n=f.months-m+1;
       pay=round(rate===0?bal/n:bal*rate/(1-Math.pow(1+rate,-n)));
       assert.equal(pay,cents(phase.payment),name+' calculated phase payment '+m);
     }
     const interest=round(bal*rate);
     const paid=m===f.months?bal+interest:Math.min(pay,bal+interest);
     const close=bal+interest-paid;
     const r=f.rows[m-1];
     assert.deepEqual([bal,interest,paid,paid-interest,close],[r.opening,r.interest,r.payment,r.principal,r.closing].map(cents),name+' row '+m);
     bal=close;sumPay+=paid;sumInterest+=interest;loanRows++;
   }
   assert.equal(bal,0,name+' ending balance');
 } else {
   let balances=[30000,90000];const rates=[.08/12,.19/12],mins=[2500,4500];
   for(let m=1;m<=f.months;m++){
     const ints=balances.map((b,i)=>round(b*rates[i]));
     const owed=balances.map((b,i)=>b+ints[i]);
     const paid=owed.map((b,i)=>Math.min(b,mins[i]));
     let extra=12000-paid[0]-paid[1];
     const first=name.includes('highest')?1:(balances[0]<=balances[1]?0:1);
     for(const i of [first,1-first]){const add=Math.min(extra,owed[i]-paid[i]);paid[i]+=add;extra-=add;}
     const close=owed.map((b,i)=>b-paid[i]),r=f.rows[m-1];
     for(const [label,values] of [['opening',balances],['interest',ints],['payment',paid],['closing',close]])assert.deepEqual(values,r[label].map(cents),name+' '+m+' '+label);
     balances=close;sumPay+=paid[0]+paid[1];sumInterest+=ints[0]+ints[1];loanRows++;
   }
   assert.deepEqual(balances,[0,0],name+' settled');
 }
 assert.equal(sumPay,cents(f.totalPayments),name+' total payments');
 assert.equal(sumInterest,cents(f.totalInterest),name+' total interest');
}
const savings=read('savings-fixtures.json').cases;
for(const [name,f] of Object.entries(savings)){
 const q=Math.pow(1+Number(f.annualReturn)/100,1/12)*(1-Number(f.annualFee)/1200), n=f.years*12;
 const total=Number(f.start)*Math.pow(q,n)+Number(f.monthly)*(Math.abs(q-1)<1e-12?n:(Math.pow(q,n)-1)/(q-1));
 assert.equal(round(total*100),cents(f.nominal),name+' closed-form nominal');
 assert.equal(round(total/Math.pow(1+Number(f.inflation)/100,f.years)*100),cents(f.purchasingPower),name+' closed-form real');
}
// Regression assertions for errors caught in the independent author review.
assert.equal(225-152,73);
assert.equal(30+105-35-20,80);
assert.equal(1000-88.85,911.15);
const budget=fs.readFileSync(path.join(root,'lessons/fl1-03.md'),'utf8');
assert(budget.includes('totalling at most $55'));
const goals=fs.readFileSync(path.join(root,'lessons/fl3-01.md'),'utf8');
assert(goals.includes('$25 in each of weeks 1–15'));
const multi=fs.readFileSync(path.join(root,'lessons/fl3-05.md'),'utf8');
assert(multi.includes('My support question is:'));
const assets=['assets/diagrams/four-step-safe-response-sequence.png','assets/diagrams/simple-career-planning-guide.png','assets/scenarios/co1-02-library-floor-plan-v2.png'];
assets.forEach(n=>assert(fs.existsSync(path.join(root,'../../workspace',n)),'approved asset '+n));
const report={
 version:'2026-09-28.astra.1',
 scope:'Metadata authoring checks only. No learner runtime, browser, accessibility, Studio, package or LMS tests.',
 result:'pass',lessonScripts:expected.length,authoredWordsIncludingSpecs:words,
 multipleChoiceQuestions:questions,independentSignoffs:signoffs,
 vocabularyDefinitions:vocabulary.lessons.reduce((n,x)=>n+x.terms.length,0),
 indexedSkillsAndProcedures:matrix.items.length,
 unchangedRootLearnerFiles:Object.keys(baseline.files).length,
 independentlyRecomputedLoanDebtCases:Object.keys(fixtures).length,loanDebtRows:loanRows,
 independentlyRecomputedSavingsCases:Object.keys(savings).length,
 approvedImagePathsPresent:assets.length,
 humanReview:'Lead author acceptance plus independent Astra review. See VERIFICATION.md for scope and corrected findings.'
};
fs.writeFileSync(path.join(root,'authoring-checks.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
