/* Explicit checking contracts. Original M01-M30 are specifications, never rewritten here. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./algebra.js'));else root.MathContracts=factory(root.UnitMath);})(typeof globalThis!=='undefined'?globalThis:this,function(M){
'use strict';
const VERSION='unit3-contracts-2.1';
const PROFILES=Object.freeze({
 'core-quadratic-v1':{variables:['x'],degree:2,power:2,nodes:64,depth:8},
 'unit-polynomial-v1':{variables:['x','y','a','b','m','n','p','q'],degree:6,power:6,nodes:96,depth:10},
 'whole-number-v1':{variables:[],degree:0,power:6,nodes:64,depth:8}
});
function validateTree(ast,profile){let nodes=0;function visit(n,d){nodes++;if(nodes>profile.nodes||d>profile.depth)throw Error('This entry exceeds the stated syntax bounds.');if(n.t==='v'&&!profile.variables.includes(n.v))throw Error('That variable is outside this question’s checking contract.');if(n.t==='pow'&&n.v>profile.power)throw Error('That exponent is outside this question’s checking contract.');if(Object.keys(M.poly(n)).some(k=>k.length>profile.degree))throw Error('An intermediate subtree is outside this question’s degree bound.');if(n.a)visit(n.a,d+1);if(n.b)visit(n.b,d+1);}visit(ast,0);}
function structured(raw,q){const fields=String(raw).split('|');if(fields.length!==2||fields.some(x=>!/^\s*[+-]?\d+\s*$/.test(x)))return{status:'input',detail:'Enter one whole number in each labelled field.'};
 const [a,b]=fields.map(Number);if(![a,b].every(Number.isSafeInteger)||Math.max(Math.abs(a),Math.abs(b))>10000)return{status:'unsupported',detail:'Keep the numbers within the stated question range.'};
 if(q.contract==='integer-root-bracket-v1'){const n=q.radicand,k=q.rootPower;if(!Number.isSafeInteger(n)||![2,3].includes(k))throw Error('Invalid authored bracket contract.');return{status:b===a+1&&a>=0&&a**k<n&&n<b**k?'correct':'incorrect',detail:'Compare the neighbouring perfect powers with the given number. The lower integer must be one less than the upper integer.'};}
 return{status:a+b===q.sum&&a*b===q.product?'correct':'incorrect',detail:'Both relationships must fit: the pair adds to the middle coefficient and multiplies to the constant.'};}
function check(raw,q){if(['integer-root-bracket-v1','factor-pair-v1'].includes(q.contract))return structured(raw,q);
 const id=q.contract||(['numeric','prime'].includes(q.mode)?'whole-number-v1':'unit-polynomial-v1'),profile=PROFILES[id];
 if(!profile)return{status:'unsupported',detail:'This mathematical family has no approved checker here. Keep your method for teacher review.'};
 if(q.mode==='choice')return M.check(raw,q);
 try{const r=M.parse(raw);validateTree(r.ast,profile);if(Object.keys(r.p).some(k=>k.length>profile.degree))throw Error('That degree is outside this question’s checking contract.');return M.check(raw,q);}catch(e){return{status:e.status||'unsupported',detail:e.message};}
}
function trig(raw,{kind='angle',opposite=6,adjacent=12,angle=30,hypotenuse=10,places=1}={}){
 const m=String(raw).trim().match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(degrees?|deg|°|radians?|rad|m|cm)?$/i);
 if(!m)return{status:'input',detail:'Enter a finite number followed by its unit, using degrees for an angle or m for a length.'};
 let value=Number(m[1]);const unit=(m[2]||'').toLowerCase();if(!Number.isFinite(value))return{status:'input',detail:'Enter a finite number.'};
 const angleTask=kind==='angle',isRad=/^rad/.test(unit);const converted=angleTask&&isRad?value*180/Math.PI:(!angleTask&&unit==='cm'?value/100:value);
 if(converted<=0||(angleTask&&converted>=90))return{status:'incorrect',detail:angleTask?'The marked angle must be acute: greater than 0° and less than 90°.':'A side length must be positive.'};
 const expected=angleTask?Math.atan(opposite/adjacent)*180/Math.PI:hypotenuse*Math.sin(angle*Math.PI/180);
 const rounded=Math.round(expected*10**places)/10**places,roundEntered=Math.round(converted*10**places)/10**places;
 if(Math.abs(roundEntered-rounded)>1e-8)return{status:'incorrect',detail:'Check the side labels and ratio, then calculate from the original givens without intermediate rounding.'};
 if(angleTask&&isRad)return{status:'different_requested_unit',detail:'This radian value is consistent with the angle. Convert it to degrees because the question requests degrees.'};
 if(!unit)return{status:'missing_unit',detail:angleTask?'The value fits. Include degrees to finish the requested answer.':'The value fits. Include metres (m) to finish the requested answer.'};
 if((angleTask&&!/^(degrees?|deg|°)$/.test(unit))||(!angleTask&&unit!=='m'))return{status:'different_requested_unit',detail:'Use the unit requested in this question.'};
 if(Math.abs(converted-rounded)>1e-8)return{status:'precision',detail:'The value is consistent. Round the final answer to the nearest tenth.'};
 return{status:'correct',detail:'The value, unit and requested rounding are correct. Your ratio setup is separate evidence.'};
}
function family(family,p,q,g=1){
 if(!['positive','signed','common'].includes(family)||![p,q,g].every(Number.isInteger)||p===0||q===0||Math.abs(p)>9||Math.abs(q)>9||(family==='positive'&&(p<1||q<1))||(family==='common'&&(g<2||g>9))||(family!=='common'&&g!==1))throw Error('Invalid generated parameters.');
 if(p>q)[p,q]=[q,p];const a=g,b=g*(p+q),c=g*p*q,expression=M.fmt({'xx':a,...(b?{x:b}:{}),'':c});const bin=n=>'(x'+(n<0?n:'+'+n)+')';
 return{id:`gen-${family}-${p}_${q}_${g}`,lesson:family==='common'?'3.3':'3.5',mode:'factor',contract:'core-quadratic-v1',expression,answer:(g===1?'':g+'*')+bin(p)+bin(q),family,parameters:{p,q,g},generatorVersion:'bounded-factors-v1',contentVersion:VERSION};
}
function fromId(id){const m=String(id).match(/^gen-(positive|signed|common)-(-?\d+)_(-?\d+)_(\d+)$/);if(!m)throw Error('Unknown generated identity.');const q=family(m[1],Number(m[2]),Number(m[3]),Number(m[4]));if(q.id!==id)throw Error('Noncanonical generated identity.');return q;}
function seeded(seed){if(!Number.isInteger(seed))throw Error('Integer seed required.');let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function signature(q){if(q.expression){try{return 'poly:'+JSON.stringify(Object.entries(M.parse(q.expression).p).sort(([a],[b])=>a.localeCompare(b)));}catch{}}
 return q.mode+':'+q.id;}
function generate(fam,count,seed,avoid=[]){const bound={positive:45,signed:171,common:1368}[fam];
 if(bound===undefined)throw Error('Unknown generated family.');
 if(!Number.isSafeInteger(count)||count<0||count>bound)throw Error('Count must be a nonnegative safe integer within the finite family bound.');
 if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295)throw Error('Seed must be an unsigned 32-bit integer.');
 if(!Array.isArray(avoid)||avoid.length>5000||avoid.some(x=>typeof x!=='string'||x.length>2000))throw Error('Avoidance must be a bounded array of signature strings.');
 if(count===0)return[];const all=[];for(let p=fam==='positive'?1:-9;p<=9;p++)for(let q=p;q<=9;q++)if(p&&q)for(let g=fam==='common'?2:1;g<=(fam==='common'?9:1);g++)all.push(family(fam,p,q,g));const blocked=new Set(avoid);const candidates=all.filter(q=>!blocked.has(signature(q)));if(count>candidates.length)throw Error('No fresh instances remain in this bounded family.');const random=seeded(seed);for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}return candidates.slice(0,count);}
function selectMixed(pool,count,seed){if(count!==6)throw Error('The mixed check has six items.');const rng=seeded(seed),shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const category=q=>q.category==='error'||q.id.startsWith('e')?'error':q.mode==='expand'?'expansion':q.mode==='factor'?'factoring':'other';const chosen=[],used=new Set();
 for(const cat of ['expansion','factoring','error']){const q=shuffled.find(q=>category(q)===cat&&!used.has(signature(q)));if(!q)throw Error('No fully fresh mixed set remains: the '+cat+' category is exhausted. Your current work is unchanged; use supported practice or teacher review.');chosen.push(q);used.add(signature(q));}
 for(const q of shuffled)if(chosen.length<count&&!used.has(signature(q))){chosen.push(q);used.add(signature(q));}
 if(chosen.length<count)throw Error('Insufficient distinct mathematical targets for a mixed set.');return chosen;}
return{VERSION,PROFILES,check,trig,family,fromId,generate,signature,selectMixed};
});
