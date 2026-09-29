/* Bounded, deterministic Lesson 3.2 tasks used by the in-lesson mastery path. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathMastery32=factory();})(globalThis,function(){
'use strict';
const VERSION='m32-contract-1';
const squareBases=[4,5,6,7,8,9,10,11,12,13,14,15];
const cubeBases=[2,3,4,5,6,7,8];
const variants=[];
for(const role of ['verification','transfer'])for(const square of squareBases)for(const cube of cubeBases){
 const base=role==='verification'?square:square+1;
 const cubeRoot=role==='verification'?cube:cube+1;
 const degree=(square+cube)%2===0?2:3;
 const rootBase=degree===2?square:cube;
 const low=rootBase**degree,high=(rootBase+1)**degree;
 const offset=Math.max(1,Math.min(high-low-1,Math.round((high-low)*((square%3)+1)/4)));
 const context=(square+cube+(role==='transfer'?1:0))%2?'area':'volume';
 variants.push(Object.freeze({role,square:base,cube:cubeRoot,degree,radicand:low+offset,context,dimension:context==='area'?base:cubeRoot}));
}
function problem(row){
 const {square,cube,degree,radicand,context,dimension}=row;
 const measure=dimension**(context==='area'?2:3);
 const prompt=row.role==='verification'
  ?`Find the positive square root of ${square**2} and cube root of ${cube**3}. Bound the ${degree===2?'square':'cube'} root of ${radicand} between consecutive whole numbers, show the two bounding powers, and estimate it to one decimal place. A ${context==='area'?'square has area':'cube has volume'} ${measure} ${context==='area'?'cm²':'cm³'}; find its ${context==='area'?'side length':'edge length'} in cm and give the power relationship that checks it.`
  :`A square face covers ${square**2} cm² and a cube holds ${cube**3} cm³. Find the side and edge lengths. Another ${degree===2?'square covers':'cube holds'} ${radicand} ${degree===2?'cm²':'cm³'}: bracket its length between whole centimetres, show the bounding powers, and estimate to one decimal place. For a ${context==='area'?'square covering':'cube holding'} ${measure} ${context==='area'?'cm²':'cm³'}, find the length in cm and show the power equality that checks it.`;
 const lower=Math.floor(radicand**(1/degree));
 const record=`Positive √${square**2}; ∛${cube**3}; bound ${degree===2?'√':'∛'}${radicand}; ${context==='area'?'square area':'cube volume'} ${measure} ${context==='area'?'cm²':'cm³'} → length in cm`;
 return{prompt,record,squareRoot:square,cubeRoot:cube,degree,radicand,lower,upper:lower+1,lowerPower:lower**degree,upperPower:(lower+1)**degree,estimate:Math.round(radicand**(1/degree)*10)/10,context,measure,dimension};
}
function integer(text){const s=String(text||'').trim();return /^-?\d{1,6}$/.test(s)?Number(s):null;}
function decimal(text){const s=String(text||'').trim();return /^-?\d{1,3}\.\d$/.test(s)?Number(s):null;}
function relation(raw,p){
 const s=String(raw||'').toLowerCase().replace(/\s+/g,'').replace(/[×·]/g,'*').replace(/²/g,'^2').replace(/³/g,'^3');
 if(!/^\d{1,4}(?:\^\d|(?:\*\d{1,4}){1,2})?=\d{1,6}$/.test(s))return false;
 const [lhs,rhs]=s.split('=');
 const repetitions=Array(p.context==='area'?2:3).fill(p.dimension).join('*');
 return Number(rhs)===p.measure&&(lhs===`${p.dimension}^${p.context==='area'?2:3}`||lhs===repetitions);
}
function check(row,values){
 const p=problem(row),keys=['m32-square','m32-cube','m32-lower','m32-upper','m32-lower-power','m32-upper-power','m32-estimate','m32-dimension','m32-unit','m32-relationship'];
 const missing=keys.filter(k=>!String(values[k]||'').trim());if(missing.length)return{status:'input',invalidFields:missing,detail:'Complete the outlined entries. This has not used a mathematical check.'};
 const entries=keys.slice(0,6).map(k=>integer(values[k]));
 const estimate=decimal(values['m32-estimate']),dimension=integer(values['m32-dimension']),unit=String(values['m32-unit']).trim().toLowerCase();
 const invalidFields=keys.slice(0,6).filter((_,i)=>entries[i]===null);if(estimate===null)invalidFields.push('m32-estimate');if(dimension===null)invalidFields.push('m32-dimension');if(!/^[\w\s^=*×·²³]+$/.test(String(values['m32-relationship'])))invalidFields.push('m32-relationship');
 if(invalidFields.length)return{status:'input',invalidFields,detail:'Fix the outlined number or equation notation. This has not used a mathematical check.'};
 const [square,cube,lower,upper,lowerPower,upperPower]=entries;
 const fieldCorrect={'m32-square':square===p.squareRoot,'m32-cube':cube===p.cubeRoot,'m32-lower':lower===p.lower,'m32-upper':upper===p.upper,'m32-lower-power':lowerPower===p.lowerPower,'m32-upper-power':upperPower===p.upperPower,'m32-estimate':estimate===p.estimate,'m32-dimension':dimension===p.dimension,'m32-unit':unit==='cm','m32-relationship':relation(values['m32-relationship'],p)};
 const correct={
  'C3-32a':fieldCorrect['m32-square'],
  'C3-32b':fieldCorrect['m32-cube'],
  'C3-32c':fieldCorrect['m32-lower']&&fieldCorrect['m32-upper']&&fieldCorrect['m32-lower-power']&&fieldCorrect['m32-upper-power']&&lowerPower<p.radicand&&p.radicand<upperPower&&fieldCorrect['m32-estimate'],
  'C3-32d':fieldCorrect['m32-dimension']&&fieldCorrect['m32-unit']&&fieldCorrect['m32-relationship']
 };
 const signal={'C3-32a':'miss-square-root','C3-32b':'miss-cube-root','C3-32c':'miss-root-bounds','C3-32d':'miss-dimension-unit'};
 return{status:'checked',correct,fieldCorrect,signal,problem:p};
}
function variation(target,row){
 if(target==='C3-32d')return row.context;
 if(target==='C3-32c')return row.degree===2?'square-bound':'cube-bound';
 if(target==='C3-32a')return row.square%2?'odd-square-root':'even-square-root';
 return row.cube%2?'odd-cube-root':'even-cube-root';
}
return Object.freeze({VERSION,variants:Object.freeze(variants),problem,check,variation});
});
