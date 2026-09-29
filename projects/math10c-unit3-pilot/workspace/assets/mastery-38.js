/* Special-product identities and a complete GCF-to-difference sequence. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathMastery38=factory();})(globalThis,function(){
'use strict';
const VERSION='m38-contract-1',variants=[];
const signed=n=>n<0?String(n):'+'+n,coef=(n,v)=>n===1?v:n===-1?'-'+v:String(n)+v;
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const bin=(a,b)=>'('+coef(a,'x')+signed(b)+')';
const poly=(a,b,c)=>coef(a,'x^2')+signed(b)+'x'+signed(c);
for(const role of ['verification','transfer'])for(let i=0;i<120;i++){
 const a=role==='verification'?1+i%2:2+i%3,c=role==='verification'?1+Math.floor(i/3)%2:2+Math.floor(i/3)%3;
 const b=(i%2?-1:1)*(2+i%7),d0=3+Math.floor(i/7)%7;
 const d=(i%3?-1:1)*(gcd(c,d0)===1?d0:d0+1);
 const u=role==='verification'?1+Math.floor(i/9)%2:2+Math.floor(i/9)%3,v0=2+Math.floor(i/13)%7,v=gcd(u,v0)===1?v0:v0+1,g=2+i%5;
 variants.push(Object.freeze({role,a,b,c,d,u,v,g}));
}
function problem(row){const{a,b,c,d,u,v,g,role}=row;
 const square=bin(a,b)+'^2',squareExpanded=poly(a*a,2*a*b,b*b),perfect=poly(c*c,2*c*d,d*d),perfectFactor=bin(c,d)+'^2';
 const difference=coef(u*u,'x^2')+'-'+v*v,differenceFactor=bin(u,-v)+bin(u,v);
 const completeExpression=coef(g*u*u,'x^2')+'-'+g*v*v,complete=g+differenceFactor,middle=2*a*b;
 const prompt=role==='verification'?`Expand ${square} and identify its middle-term coefficient. Factor the perfect square ${perfect} and the difference ${difference}. Finally take out the whole GCF and factor ${completeExpression} completely; expand your product to check.`:`Use identities on four related but different expressions: expand ${square}; recover the repeated factor of ${perfect}; factor ${difference}; and explain a complete GCF-first sequence for ${completeExpression} with an expanded check.`;
 return{prompt,record:`Square ${square}; factor ${perfect}, ${difference}, ${completeExpression}`,squareExpanded,middle,perfect,perfectFactor,difference,differenceFactor,completeExpression,complete,g,role};}
const clean=x=>String(x||'').trim();
function check(row,values,checker){const p=problem(row),keys=['m38-square','m38-middle','m38-perfect','m38-difference','m38-gcf','m38-complete','m38-expand'];
 const missing=keys.filter(k=>!clean(values[k]));if(missing.length)return{status:'input',invalidFields:missing,detail:'Complete the outlined entries. This has not used a mathematical check.'};
 const tooLong=keys.filter(k=>clean(values[k]).length>160);if(tooLong.length)return{status:'input',invalidFields:tooLong,detail:'Keep each outlined entry within 160 characters. This has not used a mathematical check.'};
 const judge=(raw,mode,answer)=>checker(clean(raw),{mode,contract:'unit-polynomial-v1',answer});
 const square=judge(values['m38-square'],'expand',p.squareExpanded),perfect=judge(values['m38-perfect'],'factor',p.perfectFactor),difference=judge(values['m38-difference'],'factor',p.differenceFactor),complete=judge(values['m38-complete'],'factor',p.complete),expanded=judge(values['m38-expand'],'expand',p.completeExpression);
 const judged=[['m38-square',square],['m38-perfect',perfect],['m38-difference',difference],['m38-complete',complete],['m38-expand',expanded]],invalidFields=judged.filter(([,result])=>['input','unsupported'].includes(result.status)).map(([id])=>id);
 for(const id of ['m38-middle','m38-gcf'])if(!/^[+-]?\d+$/.test(clean(values[id])))invalidFields.push(id);
 if(invalidFields.length)return{status:'input',invalidFields,detail:'Fix the outlined number or polynomial notation. This has not used a mathematical check.'};
 const fieldCorrect={'m38-square':square.status==='correct','m38-middle':Number(clean(values['m38-middle']))===p.middle,'m38-perfect':perfect.status==='correct','m38-difference':difference.status==='correct','m38-gcf':Number(clean(values['m38-gcf']))===p.g,'m38-complete':complete.status==='correct','m38-expand':expanded.status==='correct'};
 const correct={'C3-38a':fieldCorrect['m38-square']&&fieldCorrect['m38-middle'],'C3-38b':fieldCorrect['m38-perfect'],'C3-38c':fieldCorrect['m38-difference'],'C3-38d':fieldCorrect['m38-gcf']&&fieldCorrect['m38-complete']&&fieldCorrect['m38-expand']};
 const signal={'C3-38a':'miss-square-middle','C3-38b':'miss-perfect-square','C3-38c':'miss-difference-squares','C3-38d':complete.status==='equivalent'?'miss-complete-sequence':'miss-gcf-or-expansion'};
 return{status:'checked',correct,fieldCorrect,signal,problem:p};}
function variation(target,row){if(target==='C3-38b')return row.d<0?'negative-middle':'positive-middle';if(target==='C3-38c')return row.u===1?'unit-square':'scaled-square';if(target==='C3-38d')return row.g%2?'odd-gcf':'even-gcf';return row.a===1?'monic-square':'nonmonic-square';}
return Object.freeze({VERSION,variants:Object.freeze(variants),problem,check,variation});
});
