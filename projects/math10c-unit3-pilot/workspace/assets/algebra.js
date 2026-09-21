/* Math 10C Chapter 3: exact, bounded polynomial arithmetic. No eval or CAS.
   This broader unit contract is separate from the immutable M01–M30 source fixtures. */
(function(root, factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.UnitMath=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const V='unit3-algebra-2', MAX=1000000;
class EntryError extends Error{constructor(status,msg){super(msg);this.status=status;}}
const bad=(s,m)=>{throw new EntryError(s,m)};
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){const n=a%b;a=b;b=n;}return a;}
function primes(n){const f=[];for(let d=2;d*d<=n;d++){while(n%d===0){f.push(d);n/=d;}}if(n>1)f.push(n);return f;}
function norm(p){for(const k of Object.keys(p)){if(!Number.isSafeInteger(p[k])||Math.abs(p[k])>MAX)bad('unsupported','An intermediate value exceeds this checker’s limit. Keep your work for review.');if(p[k]===0)delete p[k];}if(Object.keys(p).length>60)bad('unsupported','This expression contains too many terms for this checker.');return p;}
function plus(a,b,sgn=1){const c={...a};for(const k of Object.keys(b))c[k]=(c[k]||0)+sgn*b[k];return norm(c);}
function times(a,b){const c={};for(const ka of Object.keys(a))for(const kb of Object.keys(b)){const k=(ka+kb).split('').sort().join('');if(k.length>6)bad('unsupported','This unit checker supports total degree up to 6.');c[k]=(c[k]||0)+a[ka]*b[kb];}return norm(c);}
function scale(a,v){return norm(Object.fromEntries(Object.entries(a).map(([k,c])=>[k,c*v])));}
function poly(n){switch(n.t){case'n':return n.v?{'':n.v}:{};case'v':return{[n.v]:1};case'g':return poly(n.a);case'neg':return scale(poly(n.a),-1);case'add':return plus(poly(n.a),poly(n.b));case'sub':return plus(poly(n.a),poly(n.b),-1);case'mul':return times(poly(n.a),poly(n.b));case'pow':{let p={'':1},b=poly(n.a);for(let i=0;i<n.v;i++)p=times(p,b);return p;}default:throw Error('AST type');}}
function parse(raw){if(typeof raw!=='string'||raw.length>160)bad('unsupported','Use at most 160 characters, or keep a longer method in your written work.');
 const src=raw.replace(/[−–]/g,'-').replace(/[×·]/g,'*').replace(/[²³⁴⁵⁶]/g,c=>'^'+({'²':2,'³':3,'⁴':4,'⁵':5,'⁶':6}[c]));
 if(!src.trim())bad('input','Enter your answer first.');if(/[^0-9a-z+*^()\s-]/.test(src))bad('unsupported','Use whole numbers, single-letter variables, +, −, brackets, multiplication and powers 1–6. Fractions, roots and equations need the written-work route.');
 if(/[a-z]{4,}/.test(src))bad('unsupported','Enter a mathematical expression, not words. Your entry is kept.');
 const ts=src.match(/\d+|[a-z]|[+*^()-]/g)||[];let pos=0,count=0;
 const node=(t,o)=>{if(++count>96)bad('unsupported','This expression has too many parts. Keep it in your written work.');return{t,...o}};
 const peek=()=>ts[pos],take=t=>peek()===t?(pos++,true):false;
 function atom(depth){if(depth>10)bad('unsupported','Too many nested brackets. Your entry is kept.');let a;
 if(take('(')){a=node('g',{a:sum(depth+1)});if(!take(')'))bad('input','A closing bracket is missing. Add it without retyping your answer.');}
 else if(/^[a-z]$/.test(peek()||''))a=node('v',{v:ts[pos++]});
 else if(/^\d+$/.test(peek()||'')){const v=Number(ts[pos++]);if(v>MAX)bad('unsupported','That number is beyond the checker’s limit.');a=node('n',{v});}
 else bad('input','Check for a missing number, variable or opening bracket.');
 if(take('^')){const v=Number(ts[pos++]);if(!Number.isInteger(v)||v<1||v>6)bad('unsupported','Use a whole-number power from 1 through 6.');a=node('pow',{a,v});}return a;
 }
 function sign(d){if(d>12)bad('unsupported','Too many signs or brackets.');if(take('+'))return sign(d+1);if(take('-'))return node('neg',{a:sign(d+1)});return atom(d);}
 function product(d){let a=sign(d);while(true){if(take('*'))a=node('mul',{a,b:sign(d)});else if(peek()==='('||/^[a-z]$/.test(peek()||'')||/^\d+$/.test(peek()||''))a=node('mul',{a,b:sign(d)});else break;}return a;}
 function sum(d){let a=product(d);while(peek()==='+'||peek()==='-'){const op=ts[pos++];a=node(op==='+'?'add':'sub',{a,b:product(d)});}return a;}
 const ast=sum(0);if(pos!==ts.length)bad('input','Check the brackets or operator near the end.');return{raw,ast,p:poly(ast)};
}
const eq=(a,b)=>{const ks=new Set([...Object.keys(a),...Object.keys(b)]);return [...ks].every(k=>(a[k]||0)===(b[k]||0));};
const key=p=>JSON.stringify(Object.entries(p).sort(([a],[b])=>a.localeCompare(b)));
function primitive(p){const vals=Object.values(p),content=vals.reduce((g,c)=>gcd(g,c),0)||1;let c=content;const lead=Object.keys(p).sort((a,b)=>b.length-a.length||a.localeCompare(b))[0];if(p[lead]<0)c=-c;return {c,p:norm(Object.fromEntries(Object.entries(p).map(([k,v])=>[k,v/c])))};}
// A presentation view only. Never mutate the raw AST or cancel algebraic terms.
function literalZero(n){while(n.t==='g'||(n.t==='pow'&&n.v===1)||n.t==='neg')n=n.a;return n.t==='n'&&n.v===0;}
function presentation(n){
 if(n.t==='g'||(n.t==='pow'&&n.v===1))return presentation(n.a);
 if(n.t==='add'){if(literalZero(n.a))return presentation(n.b);if(literalZero(n.b))return presentation(n.a);}
 if(n.t==='sub'&&literalZero(n.b))return presentation(n.a);
 return n;
}
function monomialShape(n){if(n.t==='g'||n.t==='neg')return monomialShape(n.a);if(n.t==='n')return '';if(n.t==='v')return n.v;
 if(n.t==='pow'){const a=monomialShape(n.a);return a===null?null:a.repeat(n.v).split('').sort().join('');}
 if(n.t==='mul'){const a=monomialShape(n.a),b=monomialShape(n.b);return a===null||b===null?null:(a+b).split('').sort().join('');}return null;}
function parts(ast){const fs=[];let scalar=1;
 function visit(n){n=presentation(n);if(n.t==='g'){visit(n.a);return;}if(n.t==='neg'){scalar*=-1;visit(n.a);return;}if(n.t==='mul'){visit(n.a);visit(n.b);return;}const p=poly(n),keys=Object.keys(p);
 if(keys.length===0){scalar=0;return;}if(keys.length===1&&keys[0]===''){scalar*=p[''];return;}
 if(n.t==='pow'){for(let i=0;i<n.v;i++)visit(n.a);return;}
 fs.push(p);
 }visit(ast);return{scalar,fs};
}
function expanded(n){const terms=[];function visit(a,s=1){if(a.t==='g')return visit(a.a,s);if(a.t==='neg')return visit(a.a,-s);if(a.t==='add'||a.t==='sub'){visit(a.a,s);visit(a.b,a.t==='sub'?-s:s);return;}function addInside(x){return ['add','sub'].includes(x.t)||!!(x.a&&addInside(x.a))||!!(x.b&&addInside(x.b));}if(addInside(a)){terms.push(null);return;}const p=poly(a),ks=Object.keys(p);if(ks.length>1)terms.push(null);else if(ks.length)terms.push(ks[0]);}visit(n);return !terms.includes(null)&&new Set(terms).size===terms.length;}
function factorForm(ast,expected){const got=parts(ast),want=parts(expected);const a=[],b=[];let ga=got.scalar,gb=want.scalar,contentHidden=false;
 for(const p of got.fs){const pp=primitive(p);ga*=pp.c;if(Math.abs(pp.c)>1)contentHidden=true;a.push(key(pp.p));}
 for(const p of want.fs){const pp=primitive(p);gb*=pp.c;b.push(key(pp.p));}
 return !contentHidden&&ga===gb&&a.sort().join('|')===b.sort().join('|');
}
function fmt(p){const ks=Object.keys(p).sort((a,b)=>b.length-a.length||a.localeCompare(b));if(!ks.length)return'0';return ks.map((k,i)=>{let n=p[k],v='';for(const c of [...new Set(k)]){const num=k.split(c).length-1;v+=c+(num===1?'':'^'+num);}const term=(Math.abs(n)===1&&k?'':Math.abs(n))+v;return (i?(n<0?' − ':' + '):(n<0?'−':''))+term;}).join('');}
function check(raw,q){try{
 if(q.mode==='choice')return{status:String(raw)===String(q.answer)?'correct':'incorrect'};
 const r=parse(raw),want=parse(q.answer);
 if(!eq(r.p,want.p)){let detail='Expand or recompute your answer and compare every term with the question.';
 if(q.mode==='factor'&&Object.keys(want.p).every(k=>['','x','xx'].includes(k))){if((r.p['']||0)===(want.p['']||0)&&(r.p.xx||0)===(want.p.xx||0))detail='Your constant product matches, but the middle term is '+(r.p.x||0)+'x. Check the signed sum.';}
 return{status:'incorrect',detail,expanded:fmt(r.p)};}
 if(q.mode==='prime'){const pp=parts(r.ast);const f=[];function visit(n){if(n.t==='g')return visit(n.a);if(n.t==='mul'){visit(n.a);visit(n.b);return;}if(n.t==='pow'){for(let i=0;i<n.v;i++)visit(n.a);return;}if(n.t==='n')f.push(n.v);else f.push(-1);}visit(r.ast);if(f.some(n=>n<2||primes(n).length!==1))return{status:'equivalent',detail:'The product is correct. Keep breaking down composite factors until every factor is prime.'};}
 if(q.mode==='factor'&&!factorForm(r.ast,want.ast))return{status:'equivalent',detail:'This is the same polynomial, but the requested factoring is not complete. Take out the whole greatest common factor and factor the remaining expression where possible.'};
 if(q.mode==='expand'&&!expanded(r.ast))return{status:'equivalent',detail:'Your expression is equivalent. Finish distributing and combine like terms to give an expanded, simplified answer.'};
 if(q.mode==='split'){const terms=[];function visit(n,s=1){if(n.t==='g')return visit(n.a,s);if(n.t==='neg')return visit(n.a,-s);if(n.t==='add'||n.t==='sub'){visit(n.a,s);visit(n.b,n.t==='sub'?-s:s);}else {const p=scale(poly(n),s);Object.defineProperty(p,'__shape',{value:monomialShape(n)});terms.push(p);}}visit(r.ast);
 const xs=terms.filter(p=>p.__shape==='x').map(p=>p.x||0);if(terms.length===4&&xs.length===2&&terms.some(p=>Object.keys(p).length===1&&p.xx===(want.p.xx||1))&&terms.some(p=>Object.keys(p).length===1&&p['']===(want.p['']||0))){if(xs[0]*xs[1]===(want.p.xx||1)*(want.p['']||0))return{status:'intermediate',detail:'The split preserves the polynomial and gives the product needed for grouping. This is a valid step, not the final factorization.'};return{status:'equivalent',detail:'The algebra is still equivalent. For useful grouping, the two middle coefficients must also multiply to a × c.'};}return{status:'ungraded',detail:'This step is equivalent but outside the split-middle-term checkpoint. Keep your method and use the final-answer checker.'};}
 return{status:'correct',detail:'The answer is correct in the requested form.'};
 }catch(e){if(e instanceof EntryError)return{status:e.status,detail:e.message};throw e;}}
return{V,EntryError,parse,poly,eq,check,fmt,parts,expanded,factorForm,primes,gcd,plus,times};
});
