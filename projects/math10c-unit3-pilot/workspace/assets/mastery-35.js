/* Signed-pair and complete-factoring tasks. Variant order is a saved-state ID. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathMastery35=factory();})(globalThis,function(){
'use strict';
const VERSION='m35-contract-1',variants=[];
const signed=n=>n<0?String(n):'+'+n;
const bin=n=>'(x'+signed(n)+')';
const trin=(p,q)=>'x^2'+signed(p+q)+'x'+signed(p*q);
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const candidates=[];
for(const p of [-8,-7,-6,-5,-4,-3,-2,2,3,4,5,6,7,8])for(const q of [-8,-7,-6,-5,-4,-3,-2,2,3,4,5,6,7,8])if(p<=q&&p+q!==0&&Math.abs(p+q)>=2)candidates.push([p,q]);
for(const role of ['verification','transfer'])for(let i=0;i<120;i++){
 const [p,q]=candidates[(i*37+(role==='transfer'?17:0))%candidates.length];
 const g=2+(i%5),status=['complete','equivalent-incomplete','not-equivalent'][i%3];
 variants.push(Object.freeze({role,p,q,g,status}));
}
function problem(row,contract=1){const{p,q,g,status,role}=row,sum=p+q,product=p*q,monic=bin(p)+bin(q),whole=g+monic,poly=g+'('+trin(p,q)+')';
 let candidate=whole,candidateExpand=g+'x^2'+signed(g*sum)+'x'+signed(g*product);
 if(status==='equivalent-incomplete')candidate='('+g+'x'+signed(g*p)+')'+bin(q);
 if(status==='not-equivalent'){candidate=g+bin(p)+bin(q+1);candidateExpand=g+'x^2'+signed(g*(sum+1))+'x'+signed(g*p*(q+1));}
 let analysisPoly=poly;
 if(contract>=2){const index=variants.indexOf(row),start=index<120?0:120;for(let step=3;step<120;step+=3){const other=problem(variants[start+(index-start+step)%120],1);if(other.poly!==poly){candidate=other.candidate;candidateExpand=other.candidateExpand;analysisPoly=other.poly;break;}}}
 const prompt=contract>=2?(role==='verification'?`The expression ${poly} has a common factor. Find the signed pair for the inner trinomial, factor it, and factor the whole expression. For a separate expression, ${analysisPoly}, a classmate proposes ${candidate}; classify and expand that proposal.`:`A ${g}-fold algebra-tile model represents ${trin(p,q)} inside a larger expression. Find signed factors of the inner trinomial and pull out the whole GCF. For a separate expression, ${analysisPoly}, test the proposed product ${candidate} by expansion.`):(role==='verification'?`The expression ${poly} has a common factor. Find the signed pair for the inner trinomial, factor it, and factor the whole expression. A classmate proposes ${candidate}; classify and expand that proposal.`:`A ${g}-fold algebra-tile model represents ${trin(p,q)} inside a larger expression. Find signed factors of the inner trinomial, pull out the whole GCF, and test the proposed final product ${candidate} by expansion.`);
 return{prompt,record:contract>=2?`Factor ${poly}; separately classify ${candidate} for ${analysisPoly}`:`Factor ${poly}; proposed ${candidate}`,sum,product,monic,whole,poly,analysisPoly,candidate,candidateExpand,status,g,role};}
const clean=x=>String(x||'').trim();
function check(row,values,checker,contract=1){const p=problem(row,contract),keys=['m35-pair','m35-sum','m35-product','m35-monic','m35-gcf','m35-full','m35-status','m35-expand'];
 const missing=keys.filter(k=>!clean(values[k]));if(missing.length)return{status:'input',invalidFields:missing,detail:'Complete the outlined entries. This has not used a mathematical check.'};
 const tooLong=keys.filter(k=>clean(values[k]).length>160);if(tooLong.length)return{status:'input',invalidFields:tooLong,detail:'Keep each outlined entry within 160 characters. This has not used a mathematical check.'};
 const pair=/^([+-]?\d+)\s*[,;]\s*([+-]?\d+)$/.exec(clean(values['m35-pair']));
 if(!pair)return{status:'input',invalidFields:['m35-pair'],detail:'Enter the outlined pair as two signed integers separated by a comma. This has not used a mathematical check.'};
 const nums=[Number(pair[1]),Number(pair[2])],sum=Number(clean(values['m35-sum'])),product=Number(clean(values['m35-product'])),gcf=Number(clean(values['m35-gcf']));
 const invalidFields=[...(!nums.every(Number.isSafeInteger)?['m35-pair']:[]),...(!Number.isSafeInteger(sum)?['m35-sum']:[]),...(!Number.isSafeInteger(product)?['m35-product']:[]),...(!Number.isSafeInteger(gcf)?['m35-gcf']:[])];
 if(invalidFields.length)return{status:'input',invalidFields,detail:'The outlined values need integer notation. This has not used a mathematical check.'};
 const status=clean(values['m35-status']).toLowerCase().replace(/[\s_]+/g,'-');if(!['complete','equivalent-incomplete','not-equivalent'].includes(status))return{status:'input',invalidFields:['m35-status'],detail:'Classify the outlined proposal as complete, equivalent-incomplete, or not-equivalent. This has not used a mathematical check.'};
 const judge=(raw,mode,answer)=>checker(clean(raw),{mode,contract:'unit-polynomial-v1',answer});
 const monic=judge(values['m35-monic'],'factor',p.monic),full=judge(values['m35-full'],'factor',p.whole),expansion=judge(values['m35-expand'],'expand',p.candidateExpand);
 const judged=[['m35-monic',monic],['m35-full',full],['m35-expand',expansion]],unsupported=judged.filter(([,result])=>['input','unsupported'].includes(result.status)).map(([id])=>id);
 if(unsupported.length)return{status:'input',invalidFields:unsupported,detail:'Use supported polynomial notation in the outlined entries, or keep another method for teacher review. This has not used a mathematical check.'};
 const fieldCorrect={'m35-pair':nums[0]+nums[1]===p.sum&&nums[0]*nums[1]===p.product,'m35-sum':sum===p.sum,'m35-product':product===p.product,'m35-monic':monic.status==='correct','m35-gcf':gcf===p.g,'m35-full':full.status==='correct','m35-status':status===p.status,'m35-expand':expansion.status==='correct'};
 const correct={'C3-35a':fieldCorrect['m35-pair']&&fieldCorrect['m35-sum']&&fieldCorrect['m35-product'],'C3-35b':fieldCorrect['m35-monic'],'C3-35c':fieldCorrect['m35-gcf']&&fieldCorrect['m35-full'],'C3-35d':fieldCorrect['m35-status']&&fieldCorrect['m35-expand']};
 const signal={'C3-35a':'miss-signed-pair','C3-35b':'miss-monic-factors','C3-35c':full.status==='equivalent'?'miss-completeness':'miss-whole-gcf','C3-35d':status!==p.status?'miss-classification':'miss-proposal-expansion'};
 return{status:'checked',correct,fieldCorrect,signal,problem:p};}
function variation(target,row){if(target==='C3-35d')return row.status;if(target==='C3-35c')return row.g%2?'odd-common-factor':'even-common-factor';if(row.p<0&&row.q<0)return'both-negative';if(row.p>0&&row.q>0)return'both-positive';return'mixed-signs';}
return Object.freeze({VERSION,variants:Object.freeze(variants),problem,check,variation});
});
