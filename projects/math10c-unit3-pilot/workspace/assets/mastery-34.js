/* Two-model binomial area tasks for Lesson 3.4. Indices are saved-state IDs. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathMastery34=factory();})(globalThis,function(){
'use strict';
const VERSION='m34-contract-1';
const variants=[];
for(const role of ['verification','transfer'])for(let i=0;i<120;i++){
 const a=role==='verification'?1:1+i%3,b=role==='verification'?1:1+Math.floor(i/3)%3;
 const p=role==='verification'?2+i%8:(i%2?-1:1)*(2+i%8),q=role==='verification'?3+Math.floor(i/8)%8:(i%3?-1:1)*(3+Math.floor(i/8)%8);
 const c=role==='verification'?1:1+Math.floor(i/5)%3,d=role==='verification'?1:1+Math.floor(i/7)%3;
 const r=role==='verification'?4+(i*3)%9:(i%4?-1:1)*(4+(i*3)%9),s=role==='verification'?2+(i*5)%9:(i%5?-1:1)*(2+(i*5)%9);
 variants.push(Object.freeze({role,a,b,p,q,c,d,r,s}));
}
const signed=n=>n<0?String(n):'+'+n;
const bin=(a,p)=>'('+((a===1?'':a)+'x'+signed(p))+')';
const mono=(n,power)=>power===2?(n===1?'':n===-1?'-':String(n))+'x^2':power===1?(n===1?'':n===-1?'-':String(n))+'x':String(n);
const poly=(a,b,p,q)=>mono(a*b,2)+signed(a*q+b*p)+'x'+signed(p*q);
function problem(row){
 const {a,b,p,q,c,d,r,s,role}=row,A=bin(a,p)+bin(b,q),B=bin(c,r)+bin(d,s);
 const cellsA=[mono(a*b,2),mono(a*q,1),mono(b*p,1),String(p*q)];
 const cellsB=[mono(c*d,2),mono(c*s,1),mono(d*r,1),String(r*s)];
 const totalA=poly(a,b,p,q),totalB=poly(c,d,r,s),cross=[a*q,b*p];
 const prompt=role==='verification'
  ?`Build a 2×2 area model for ${A}. In a second model, the four cells are ${cellsB.join(', ')} (top-left, top-right, bottom-left, bottom-right). Read its total and factors. Show how the first model's two cross products combine.`
  :`An algebra-tile rectangle uses side expressions ${A}; signed tiles represent subtraction. Fill its four partial products. A different model shows cells ${cellsB.join(', ')} in reading order; reconstruct its total and side factors. Explain the two cross products in the first model.`;
 const record=`Model ${A}; read cells [${cellsB.join(',')}]; totals and cross products`;
 return{prompt,record,A,B,cellsA,cellsB,totalA,totalB,cross,role};
}
const asText=x=>String(x||'').trim();
function crossCheck(raw,expected){
 const s=asText(raw).replace(/\s+/g,'').replace(/×|·/g,'*').replace(/−/g,'-');
 const m=/^([+-]?\d*)x([+-]\d*)x=([+-]?\d*)x$/.exec(s);if(!m)return false;
 const n=t=>t===''||t==='+'?1:t==='-'?-1:Number(t);
 const first=n(m[1]),second=n(m[2]),sum=n(m[3]);
 return Number.isSafeInteger(first)&&Number.isSafeInteger(second)&&Number.isSafeInteger(sum)&&((first===expected[0]&&second===expected[1])||(first===expected[1]&&second===expected[0]))&&sum===expected[0]+expected[1];
}
function isModelFactors(raw,parser){try{let ast=parser(asText(raw)).ast;while(ast?.t==='g')ast=ast.a;return ast?.t==='mul'&&ast.a?.t==='g'&&ast.b?.t==='g'&&['add','sub'].includes(ast.a.a?.t)&&['add','sub'].includes(ast.b.a?.t);}catch{return false;}}
function check(row,values,checker,parser){
 const p=problem(row),keys=['m34-total','m34-cell-1','m34-cell-2','m34-cell-3','m34-cell-4','m34-factors','m34-cross'];
 const missing=keys.filter(k=>!asText(values[k]));if(missing.length)return{status:'input',invalidFields:missing,detail:'Complete the outlined entries. This has not used a mathematical check.'};
 const tooLong=keys.filter(k=>asText(values[k]).length>160);if(tooLong.length)return{status:'input',invalidFields:tooLong,detail:'Keep each outlined entry within 160 characters. This has not used a mathematical check.'};
 const judge=(raw,mode,answer)=>checker(asText(raw),{mode,contract:'unit-polynomial-v1',answer});
 const total=judge(values['m34-total'],'expand',p.totalB);
 const cells=p.cellsA.map((answer,i)=>judge(values['m34-cell-'+(i+1)],'expand',answer));
 const factors=judge(values['m34-factors'],'factor',p.B);
 const judged=[['m34-total',total],...cells.map((cell,i)=>['m34-cell-'+(i+1),cell]),['m34-factors',factors]];
 const invalidFields=judged.filter(([,result])=>['input','unsupported'].includes(result.status)).map(([id])=>id);
 if(invalidFields.length)return{status:'input',invalidFields,detail:'Use supported polynomial notation in the outlined entries, or keep another method for teacher review. This has not used a mathematical check.'};
 const correct={'C3-34a':total.status==='correct','C3-34b':cells.every(x=>x.status==='correct'),'C3-34c':['correct','equivalent'].includes(factors.status)&&isModelFactors(values['m34-factors'],parser),'C3-34d':crossCheck(values['m34-cross'],p.cross)};
 const signal={'C3-34a':'miss-model-total','C3-34b':'miss-partial-product','C3-34c':'miss-model-factors','C3-34d':'miss-cross-products'};
 const fieldCorrect={'m34-total':correct['C3-34a'],'m34-factors':correct['C3-34c'],'m34-cross':correct['C3-34d']};
 cells.forEach((cell,i)=>{fieldCorrect['m34-cell-'+(i+1)]=cell.status==='correct';});
 return{status:'checked',correct,fieldCorrect,signal,problem:p};
}
function variation(target,row){if(target==='C3-34d')return row.a*row.q===row.b*row.p?'equal-cross-products':row.p*row.q<0?'opposite-sign-cross':'unequal-cross-products';if(target==='C3-34a'||target==='C3-34c')return row.c*row.d===1?(row.r===row.s?'equal-side-model':'unequal-side-model'):'nonmonic-model';return row.a*row.b===1?(row.p===row.q?'same-binomials':'different-binomials'):'nonmonic-model';}
return Object.freeze({VERSION,variants:Object.freeze(variants),problem,check,variation,crossCheck});
});
