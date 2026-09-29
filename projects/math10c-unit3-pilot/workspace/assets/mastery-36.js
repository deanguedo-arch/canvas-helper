/* Reviewed non-monic tasks and component checks for the Lesson 3.6 pilot. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./contracts.js'));else root.MathMastery36=factory(root.MathContracts);})(globalThis,function(Contracts){
'use strict';
const seed=[[2,1,1,3],[3,1,2,3],[3,-2,1,5],[4,1,1,-3],[2,-1,3,4],[5,2,2,1],[3,2,2,-1],[4,-3,3,1],[5,-1,2,3],[2,3,3,-2],[4,3,1,2,2],[3,-1,4,2,3]];
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const term=(n,power)=>!n?'':(n<0?'-':'+')+Math.abs(n)+(power?'x':'');
const bin=(a,b)=>'('+a+'x'+(b<0?b:'+'+b)+')';
function problem(tuple){
 const [u,v,w,z,outside=1]=tuple,first=gcd(u,v),second=gcd(w,z),g=outside*first*second;
 const U=u/first,V=v/first,W=w/second,Z=z/second;
 const a=U*W,b=U*Z+V*W,c=V*Z,m=U*Z,n=V*W;
 const primitive=a+'x^2'+term(b,true)+term(c,false);
 return{g,a,b,c,m,n,primitive,poly:g*a+'x^2'+term(g*b,true)+term(g*c,false),factor:(g===1?'':g+'*')+bin(U,V)+bin(W,Z)};
}
const variants=[...seed];
const known=new Set(seed.map(v=>problem(v).poly));
for(let u=2;u<=6&&variants.length<240;u++)for(let w=1;w<=5&&variants.length<240;w++)for(let v=-5;v<=5&&variants.length<240;v++)for(let z=-5;z<=5&&variants.length<240;z++)for(let g=1;g<=3&&variants.length<240;g++){
 if(!v||!z)continue;const tuple=[u,v,w,z,g],p=problem(tuple);
 if(p.a<=1||Math.max(Math.abs(g*p.a),Math.abs(g*p.b),Math.abs(g*p.c))>120||known.has(p.poly))continue;
 known.add(p.poly);variants.push(tuple);
}
function coefficient(s){if(s===''||s==='+')return 1;if(s==='-')return -1;return Number(s);}
function middleSplit(raw,p){
 const checked=Contracts.check(raw,{mode:'split',contract:'unit-polynomial-v1',answer:p.poly});
 if(checked.status!=='intermediate')return checked;
 const sides=String(raw).replace(/\s+/g,'').replace(/−/g,'-').replace(/²/g,'^2').replace(/[×·]/g,'*').split('=');
 let right=sides[1],scale=1;
 const wrapped=/^(\d+)\*?\((.*)\)$/.exec(right);
 if(wrapped){scale=Number(wrapped[1]);right=wrapped[2];}
 const match=/^([+-]?\d*)x\^2([+-]\d*)x([+-]\d*)x([+-]\d+)$/.exec(right);
 if(!match)return{status:'ungraded',detail:'Both sides may be equal, but this entry does not show two useful middle terms. Keep an alternative method for review.'};
 const [A,M,N,C]=match.slice(1).map(coefficient);
 if(![A,M,N,C].every(Number.isSafeInteger)||A*scale!==p.g*p.a||C*scale!==p.g*p.c||M+N!==p.b*(p.g/scale)||M*N!==A*C)
  return{status:'ungraded',detail:'The equality is retained, but its two middle terms do not demonstrate a grouping split with the required sum and product.'};
 return{status:'intermediate',detail:'The two middle terms keep the polynomial equal and satisfy the grouping relationship.'};
}
function variation(target,p){
 const sign=p.c<0?'opposite-signs':p.b<0?'negative-pair':'positive-pair';
 if(target==='C3-36a')return p.g===1?'primitive':'whole-gcf';
 if(target==='C3-36b')return sign;
 if(target==='C3-36c')return (p.g===1?'primitive-':'outside-gcf-')+sign;
 return (p.g===1?'primitive-':'whole-gcf-')+sign;
}
return Object.freeze({VERSION:'m36-contract-3',variants,problem,middleSplit,variation});
});
