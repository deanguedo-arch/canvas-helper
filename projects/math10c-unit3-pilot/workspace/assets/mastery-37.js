/* Complete distribution, multivariable products and area verification. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathMastery37=factory();})(globalThis,function(){
'use strict';
const VERSION='m37-contract-1',variants=[];
const signed=n=>n<0?String(n):'+'+n,coef=(n,v)=>n===1?v:String(n)+v;
const bin=(a,b,v='x')=>'('+coef(a,v)+signed(b)+')';
const poly=(u,v,w)=>coef(u,'x^2')+signed(v)+'x'+signed(w);
const xy=(u,v,w)=>coef(u,'x^2')+signed(v)+'xy'+signed(w)+'y^2';
for(const role of ['verification','transfer'])for(let i=0;i<120;i++){
 const a=role==='verification'?1+i%2:2+i%3,c=role==='verification'?1+Math.floor(i/3)%2:2+Math.floor(i/3)%3;
 const b=2+i%7,d=3+Math.floor(i/7)%7;
 const e=role==='verification'?1+i%2:2+i%2,f=role==='verification'?1+Math.floor(i/2)%2:2+Math.floor(i/2)%2;
 const h=2+Math.floor(i/5)%6,j=3+Math.floor(i/11)%6;
 variants.push(Object.freeze({role,a,b,c,d,e,f,h,j,n:2+i%4,unit:i%2?'m':'cm'}));
}
function problem(row){const{a,b,c,d,e,f,h,j,n,unit,role}=row,first=bin(a,b)+bin(c,d),multi='('+coef(e,'x')+'+'+coef(h,'y')+')('+coef(f,'x')+'+'+coef(j,'y')+')';
 const cells=[coef(a*c,'x^2'),coef(a*d,'x'),coef(b*c,'x'),String(b*d)],expanded=poly(a*c,a*d+b*c,b*d),multiExpanded=xy(e*f,e*j+f*h,h*j),value=(a*n+b)*(c*n+d);
 const prompt=role==='verification'?`Distribute every term in ${first}. Record partial products in reading order: first×first, first×second, second×first, second×second. Simplify and also multiply ${multi}. A rectangle has side lengths ${bin(a,b)} ${unit} and ${bin(c,d)} ${unit}; check its area when x=${n}.`:`An area diagram has side expressions ${bin(a,b)} ${unit} and ${bin(c,d)} ${unit}. Record its four cells in reading order: top-left, top-right, bottom-left, bottom-right; then simplify. Multiply ${multi} separately. Verify the rectangle’s area at x=${n} and state the squared unit.`;
 return{prompt,record:`Multiply ${first}; multiply ${multi}; rectangle x=${n} ${unit}`,cells,expanded,multi,multiExpanded,value,unit,role};}
const clean=x=>String(x||'').trim();
function check(row,values,checker){const p=problem(row),keys=['m37-cell1','m37-cell2','m37-cell3','m37-cell4','m37-expanded','m37-multi','m37-value','m37-unit','m37-check'];
 const missing=keys.filter(k=>!clean(values[k]));if(missing.length)return{status:'input',invalidFields:missing,detail:'Complete the outlined entries. This has not used a mathematical check.'};
 const tooLong=keys.filter(k=>clean(values[k]).length>160);if(tooLong.length)return{status:'input',invalidFields:tooLong,detail:'Keep each outlined entry within 160 characters. This has not used a mathematical check.'};
 const judge=(raw,answer)=>checker(clean(raw),{mode:'expand',contract:'unit-polynomial-v1',answer});
 const cells=p.cells.map((answer,i)=>judge(values['m37-cell'+(i+1)],answer)),expanded=judge(values['m37-expanded'],p.expanded),multi=judge(values['m37-multi'],p.multiExpanded);
 const judged=[...cells.map((cell,i)=>['m37-cell'+(i+1),cell]),['m37-expanded',expanded],['m37-multi',multi]],invalidFields=judged.filter(([,result])=>['input','unsupported'].includes(result.status)).map(([id])=>id);
 if(invalidFields.length)return{status:'input',invalidFields,detail:'Use supported polynomial notation in the outlined entries, or keep another method for teacher review. This has not used a mathematical check.'};
 const unit=clean(values['m37-unit']).replace(/\s/g,'').toLowerCase().replace(/²/g,'^2');
 const value=Number(clean(values['m37-value'])),numeric=clean(values['m37-check']).replace(/×|·/g,'*').replace(/\s/g,''),parts=/^(\d+)\*(\d+)=(\d+)$/.exec(numeric),left=row.a*row.n+row.b,right=row.c*row.n+row.d;
 const equality=!!parts&&Number(parts[3])===p.value&&((Number(parts[1])===left&&Number(parts[2])===right)||(Number(parts[1])===right&&Number(parts[2])===left));
 const fieldCorrect=Object.fromEntries(cells.map((cell,i)=>['m37-cell'+(i+1),cell.status==='correct']));Object.assign(fieldCorrect,{'m37-expanded':expanded.status==='correct','m37-multi':multi.status==='correct','m37-value':Number.isSafeInteger(value)&&value===p.value,'m37-unit':unit===p.unit+'^2','m37-check':equality});
 const correct={'C3-37a':cells.every(x=>x.status==='correct'),'C3-37b':fieldCorrect['m37-expanded'],'C3-37c':fieldCorrect['m37-multi'],'C3-37d':fieldCorrect['m37-value']&&fieldCorrect['m37-unit']&&fieldCorrect['m37-check']};
 const signal={'C3-37a':'miss-partial-products','C3-37b':'miss-like-terms','C3-37c':'miss-multivariable-product','C3-37d':'miss-area-check'};
 return{status:'checked',correct,fieldCorrect,signal,problem:p};}
function variation(target,row){if(target==='C3-37c')return row.e*row.f===1?'monic-two-variable':'nonmonic-two-variable';if(target==='C3-37d')return row.unit==='cm'?'centimetre-area':'metre-area';return row.a*row.c===1?'monic-products':'nonmonic-products';}
return Object.freeze({VERSION,variants:Object.freeze(variants),problem,check,variation});
});
