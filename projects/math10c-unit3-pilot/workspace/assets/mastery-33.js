/* Bounded common-factor tasks for Lesson 3.3. Bank order is a saved-state ID. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathMastery33=factory();})(globalThis,function(){
'use strict';
const VERSION='m33-contract-1';
const gcd=(a,b)=>b?gcd(b,a%b):a;
const tuples=[];
for(const g of [4,6,8,10,12,14,16,18,20,22])for(const a of [1,2,3,4,5,7])for(const b of [-7,-5,-3,3,5,7])for(const p of [1,2])for(const r of [1,2])if(gcd(a,Math.abs(b))===1)tuples.push({g,a,b,p,r});
const mix=t=>((t.g*73856093)^(t.a*19349663)^((t.b+9)*83492791)^(t.p*2654435761)^(t.r*97531))>>>0;
tuples.sort((x,y)=>mix(x)-mix(y)||JSON.stringify(x).localeCompare(JSON.stringify(y)));
const variants=[];
const selected=Array.from({length:120},(_,i)=>tuples[Math.floor(i*tuples.length/120)]);
for(const role of ['verification','transfer'])for(const [i,{g,a,b,p,r}] of selected.entries()){
 const q=role==='transfer'?(a+b+p+20)%2+1:0,s=role==='transfer'?(g/2+r)%2+1:0;
 const candidateStatus=['complete','equivalent-incomplete','not-equivalent'][i%3];
 variants.push(Object.freeze({role,g,a,b,p,r,q,s,candidateStatus}));
}
const power=(name,n)=>n===0?'':n===1?name:name+'^'+n;
const monomial=(c,x,y)=>{const vars=power('x',x)+power('y',y);return vars?(c===1?'':c===-1?'-':String(c))+vars:String(c);};
const term=(c,x,y,first=false)=>{const body=monomial(Math.abs(c),x,y);return first?(c<0?'-':'')+body:c<0?'-'+body:'+'+body;};
function problem(row,contract=1){
 const {role,g,a,b,p,r,q,s,candidateStatus}=row;
 const inside=term(a,r,0,true)+term(b,0,s);
 const gcf=monomial(g,p,q),factor=gcf+'('+inside+')';
 const poly=term(g*a,p+r,q,true)+term(g*b,p,q+s);
 let candidate=factor,candidatePoly=poly;
 if(candidateStatus==='equivalent-incomplete')candidate=monomial(g/2,p,q)+'('+term(2*a,r,0,true)+term(2*b,0,s)+')';
 if(candidateStatus==='not-equivalent'){candidate=monomial(g,p,q)+'('+term(a,r,0,true)+term(b+2,0,s)+')';candidatePoly=term(g*a,p+r,q,true)+term(g*(b+2),p,q+s);}
 let analysisPoly=poly;
 if(contract>=2){
  const index=variants.indexOf(row),start=index<120?0:120;
  for(let step=3;step<120;step+=3){const other=problem(variants[start+(index-start+step)%120],1);if(other.poly!==poly){candidate=other.candidate;candidatePoly=other.candidatePoly;analysisPoly=other.poly;break;}}
 }
 const prompt=contract>=2?(role==='verification'
  ?`Factor ${poly} completely. Identify its whole numerical and variable GCF. For a separate expression, ${analysisPoly}, decide whether ${candidate} is complete, equivalent but incomplete, or not equivalent; expand it to justify. Then expand your own factorization to check every term.`
  :`A polynomial model combines ${poly}. Rewrite it as a product using the largest common monomial. For a separate expression, ${analysisPoly}, a classmate proposes ${candidate}. Test that proposal by expanding and classify it as complete, equivalent but incomplete, or not equivalent. Expand your own product too.`):(role==='verification'
  ?`Factor ${poly} completely. Identify its whole numerical and variable GCF. Decide whether ${candidate} is complete, equivalent but incomplete, or not equivalent; expand it to justify. Then expand your own factorization to check every term.`
  :`A polynomial model combines ${poly}. Rewrite it as a product using the largest common monomial. A classmate proposes ${candidate}. Test that proposal by expanding and classify it as complete, equivalent but incomplete, or not equivalent. Expand your own product too.`);
 const record=`Factor ${poly}; classify ${candidate}; expand both proposed and own products`;
 return{prompt,record,gcf,factor,poly,analysisPoly,candidate,candidatePoly,candidateStatus,role};
}
function check(row,values,checker,contract=1){
 const p=problem(row,contract),keys=['m33-gcf','m33-factor','m33-candidate','m33-candidate-expand','m33-expand'];
 const missing=keys.filter(k=>!String(values[k]||'').trim());if(missing.length)return{status:'input',invalidFields:missing,detail:'Complete the outlined entries. This has not used a mathematical check.'};
 const tooLong=keys.filter(k=>String(values[k]).length>160);if(tooLong.length)return{status:'input',invalidFields:tooLong,detail:'Keep each outlined entry within 160 characters. This has not used a mathematical check.'};
 const status=String(values['m33-candidate']).trim().toLowerCase().replace(/[\s_]+/g,'-');
 if(!['complete','equivalent-incomplete','not-equivalent'].includes(status))return{status:'input',invalidFields:['m33-candidate'],detail:'Classify the outlined proposal as complete, equivalent-incomplete, or not-equivalent. This has not used a mathematical check.'};
 const judge=(raw,mode,answer)=>checker(String(raw),{mode,contract:'unit-polynomial-v1',answer});
 const gcf=judge(values['m33-gcf'],'expand',p.gcf),factor=judge(values['m33-factor'],'factor',p.factor),candidateExpand=judge(values['m33-candidate-expand'],'expand',p.candidatePoly),ownExpand=judge(values['m33-expand'],'expand',p.poly);
 const judged=[['m33-gcf',gcf],['m33-factor',factor],['m33-candidate-expand',candidateExpand],['m33-expand',ownExpand]],invalidFields=judged.filter(([,result])=>['input','unsupported'].includes(result.status)).map(([id])=>id);
 if(invalidFields.length)return{status:'input',invalidFields,detail:'Use supported polynomial notation in the outlined entries, or keep another method for teacher review. This has not used a mathematical check.'};
 const fieldCorrect={'m33-gcf':gcf.status==='correct','m33-factor':factor.status==='correct','m33-candidate':status===p.candidateStatus,'m33-candidate-expand':candidateExpand.status==='correct','m33-expand':ownExpand.status==='correct'};
 const correct={'C3-33a':fieldCorrect['m33-gcf'],'C3-33b':fieldCorrect['m33-factor'],'C3-33c':fieldCorrect['m33-candidate']&&fieldCorrect['m33-candidate-expand'],'C3-33d':fieldCorrect['m33-expand']};
 const signal={'C3-33a':'miss-whole-gcf','C3-33b':factor.status==='equivalent'?'miss-completeness':'miss-factor','C3-33c':status!==p.candidateStatus?'miss-classification':'miss-candidate-expansion','C3-33d':'miss-expansion'};
 return{status:'checked',correct,fieldCorrect,signal,problem:p};
}
function variation(target,row){if(target==='C3-33c')return row.candidateStatus;if(target==='C3-33a')return row.q?'two-variable-gcf':row.p===1?'linear-gcf':'higher-power-gcf';if(target==='C3-33b')return row.q?'multivariable':row.b<0?'signed':'positive';return row.q?'multivariable-expansion':row.r===1?'linear-expansion':'power-expansion';}
return Object.freeze({VERSION,variants:Object.freeze(variants),problem,check,variation});
});
