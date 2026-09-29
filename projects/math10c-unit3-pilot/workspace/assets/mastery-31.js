/* Reviewed whole-number relationships for Lesson 3.1 mastery work.
   Every task carries a contextual decision; transfer adds a third quantity. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathMastery31=factory();})(globalThis,function(){
'use strict';
const VERSION='m31-contract-1';
const PAIRS=Object.freeze([
 [[24,36],'packs'],[[16,27],'signals'],[[18,30],'signals'],[[14,25],'packs'],
 [[12,48],'signals'],[[45,75],'packs'],[[40,64],'packs'],[[21,35],'signals'],
 [[32,56],'packs'],[[15,28],'signals'],[[72,90],'packs'],[[28,42],'signals']
]);
const TRIPLES=Object.freeze([
 [[12,18,30],'packs'],[[8,12,20],'signals'],[[18,24,42],'packs'],[[6,15,20],'signals'],
 [[16,24,40],'packs'],[[9,12,15],'signals'],[[10,14,35],'packs'],[[14,21,28],'signals']
]);
const gcd=(a,b)=>b?gcd(b,a%b):a;
const lcm=(a,b)=>a/gcd(a,b)*b;
const pairRows=[...PAIRS],pairSeen=new Set(PAIRS.map(([n])=>n.join(',')));
for(let a=8;a<=62&&pairRows.length<120;a++)for(let b=a+1;b<=72&&pairRows.length<120;b++){
 const key=a+','+b;if(pairSeen.has(key))continue;pairSeen.add(key);pairRows.push([[a,b],pairRows.length%2?'signals':'packs']);
}
const tripleRows=[...TRIPLES],tripleSeen=new Set(TRIPLES.map(([n])=>n.join(',')));
for(let a=8;a<=36&&tripleRows.length<120;a++)for(let b=a+2;b<=44&&tripleRows.length<120;b++)for(let c=b+2;c<=54&&tripleRows.length<120;c++){
 if([a,b,c].reduce(lcm)>100000)continue;const key=[a,b,c].join(',');if(tripleSeen.has(key))continue;tripleSeen.add(key);tripleRows.push([[a,b,c],tripleRows.length%2?'signals':'packs']);
}
const variants=Object.freeze([...pairRows.map(([numbers,context])=>({numbers,context,role:'verification'})),...tripleRows.map(([numbers,context])=>({numbers,context,role:'transfer'}))]);
function primeParts(n){const parts=[];for(let d=2;n>1&&d*d<=n;d++){while(n%d===0){parts.push(d);n/=d;}}if(n>1)parts.push(n);return parts;}
function isPrime(n){return Number.isSafeInteger(n)&&n>1&&primeParts(n).length===1;}
function problem(row){
 const numbers=[...row.numbers],common=numbers.reduce(gcd),multiple=numbers.reduce(lcm),value=row.context==='packs'?common:multiple;
 const listed=numbers.join(', ');
 const prompt=row.context==='packs'
  ?`Counters: ${listed}, each quantity a different colour. Make largest equal one-colour packs with none left. Find pack size and number of packs per colour.`
  :`Signals repeat every ${listed} seconds and flash together now. When do they next flash together, and how many cycles has each completed?`;
 const counts=numbers.map(n=>row.context==='packs'?n/value:value/n);
 return{numbers,context:row.context,prompt,gcf:common,lcm:multiple,method:row.context==='packs'?'GCF':'LCM',value,counts,prime:numbers.map(primeParts)};
}
function parseFactors(raw){
 const normalized=String(raw||'').trim().replace(/[×·]/g,'*').replace(/[²³]/g,c=>'^'+(c==='²'?'2':'3')).replace(/\s+/g,'');
 if(!normalized)return{status:'input'};
 const tokens=normalized.split('*');if(tokens.length>12||tokens.some(x=>!x))return{status:'input'};
 const factors=[];
 for(const token of tokens){const match=/^(\d+)(?:\^([1-9]\d?))?$/.exec(token);if(!match)return{status:'input'};
  const base=Number(match[1]),power=Number(match[2]||1);if(!Number.isSafeInteger(base)||base>9999||power>12)return{status:'input'};
  for(let i=0;i<power;i++)factors.push(base);
 }
 if(factors.length>20)return{status:'input'};
 return{status:'checked',factors};
}
function parseNumber(raw){const text=String(raw||'').trim();return /^\d{1,8}$/.test(text)?Number(text):null;}
function parseCounts(raw,length){const tokens=String(raw||'').split(',').map(x=>x.trim());return tokens.length===length&&tokens.every(x=>/^\d{1,8}$/.test(x))?tokens.map(Number):null;}
function check(row,values){
 const p=problem(row),fields=['m31-prime-a','m31-prime-b',...(p.numbers.length===3?['m31-prime-c']:[])],factors=fields.map(key=>parseFactors(values[key]));
 const g=parseNumber(values['m31-gcf']),l=parseNumber(values['m31-lcm']),value=parseNumber(values['m31-value']),counts=parseCounts(values['m31-counts'],p.numbers.length),method=String(values['m31-method']||'').trim().toUpperCase();
 const invalidFields=[...fields.filter((_,i)=>factors[i].status==='input'),...(g===null?['m31-gcf']:[]),...(l===null?['m31-lcm']:[]),...(value===null?['m31-value']:[]),...(!counts?['m31-counts']:[]),...(!['GCF','LCM'].includes(method)?['m31-method']:[])];
 if(invalidFields.length)return{status:'input',invalidFields,detail:'Complete or correct the outlined notation. This has not used a mathematical check.'};
 const fieldCorrect=Object.fromEntries(fields.map((key,i)=>[key,factors[i].factors.every(isPrime)&&factors[i].factors.reduce((n,x)=>n*x,1)===p.numbers[i]]));
 Object.assign(fieldCorrect,{'m31-gcf':g===p.gcf,'m31-lcm':l===p.lcm,'m31-method':method===p.method,'m31-value':value===p.value,'m31-counts':counts.every((n,i)=>n===p.counts[i])});
 const prime=fields.every(key=>fieldCorrect[key]);
 const correct={'C3-31a':prime,'C3-31b':fieldCorrect['m31-gcf'],'C3-31c':fieldCorrect['m31-lcm'],'C3-31d':fieldCorrect['m31-method']&&fieldCorrect['m31-value']&&fieldCorrect['m31-counts']};
 const signal={'C3-31a':'miss-prime-factors','C3-31b':'miss-gcf','C3-31c':'miss-lcm','C3-31d':method!==p.method?'miss-method':'miss-context-count'};
 return{status:'checked',correct,fieldCorrect,signal,problem:p};
}
function variation(target,p){if(target==='C3-31d')return p.context;
 const pairwise=p.numbers.some((n,i)=>p.numbers.some((other,j)=>i!==j&&other%n===0));
 return p.gcf===1?'coprime':pairwise?'divides':'shared-factors';}
return Object.freeze({VERSION,variants,problem,check,variation,primeParts});
});
