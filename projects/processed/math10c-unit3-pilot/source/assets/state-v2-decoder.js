/* Bounded unit-state transport: one owner. No LMS API calls are made here. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathStateV2Decoder=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION='unit3-state-2',ENGINE='unit3-algebra-1|unit3-contracts-2.0|bounded-factors-v1',APP_LIMIT=40000,STATUS=['correct','incorrect','equivalent','intermediate','ungraded'];
const validText=(x,n)=>typeof x==='string'&&x.length<=n&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(x)&&!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(x);
function encode(state,questionIds){const strings=[],map=new Map(),intern=x=>{x=String(x??'');if(!map.has(x)){map.set(x,strings.length);strings.push(x);}return map.get(x);};
 const {r,firsts={},drafts={},exposed=[],seen=[],...rest}=state;const bits=new Uint8Array(Math.ceil(questionIds.length/8)),indices=new Map(questionIds.map((x,i)=>[x,i]));for(const id of exposed){const i=indices.get(id);if(i===undefined)throw Error('Unknown exposure ID.');bits[i>>3]|=1<<(i%8);}
 const seenBits=new Uint8Array(bits.length);for(const id of seen){const i=indices.get(id);if(i===undefined)throw Error('Unknown seen-question ID.');seenBits[i>>3]|=1<<(i%8);}
 return{format:VERSION,engine:ENGINE,...rest,seen:Array.from(seenBits,b=>b.toString(16).padStart(2,'0')).join(''),exposure:Array.from(bits,b=>b.toString(16).padStart(2,'0')).join(''),r:Object.entries(r).map(([id,x])=>[id,indices.get(x.q),intern(x.d),x.a.map(a=>[a[0],intern(a[1]),STATUS.indexOf(a[2]),a[3]]),x.n,x.s,intern(x.reason),Number(x.closed),Number(!!x.firstSuccess)]),firsts:Object.entries(firsts).map(([id,a])=>[indices.get(id),a[0],intern(a[1]),STATUS.indexOf(a[2]),a[3]]),drafts:Object.entries(drafts).map(([id,s])=>[indices.get(id),intern(s)]),strings};
}
function decode(raw,{questions,pages,version}){
 const o=JSON.parse(typeof raw==='string'?raw:JSON.stringify(raw));const ids=Object.keys(questions),known=id=>Object.hasOwn(questions,id),fail=()=>{throw Error('This saved work failed validation. It has not replaced the existing record.');};
 if(!o||o.format!==VERSION||o.engine!==ENGINE||o.v!==version||!Number.isSafeInteger(o.rev)||o.rev<0||!pages.includes(o.route)||!Array.isArray(o.strings)||o.strings.length>250||!o.strings.every(s=>validText(s,160)))fail();
 const str=i=>{if(!Number.isInteger(i)||i<0||i>=o.strings.length)fail();return o.strings[i];};
 if(!Array.isArray(o.r)||o.r.length>21)fail();const r={};
 for(const row of o.r){if(!Array.isArray(row)||row.length!==9)fail();const[id,qi,d,attempts,n,s,reason,closed,success]=row;const q=ids[qi];if(!Number.isInteger(qi))fail();
 if(typeof id!=='string'||!/^(s-[a-z0-9-]+|r-\d+)$/.test(id)||Object.hasOwn(r,id)||!known(q)||!Array.isArray(attempts)||attempts.length>4||!Number.isSafeInteger(n)||n<0||n>Number.MAX_SAFE_INTEGER||!Number.isInteger(s)||s<0||s>15||![0,1].includes(closed)||![0,1].includes(success)||str(reason).length>120)fail();
 if(id.startsWith('s-')&&id!=='s-'+q)fail();
 let previous=0;const a=attempts.map(a=>{if(!Array.isArray(a)||a.length!==4||!Number.isInteger(a[0])||a[0]<=previous||a[0]>n||!Number.isInteger(a[2])||STATUS[a[2]]===undefined||!Number.isInteger(a[3])||a[3]<0||a[3]>15)fail();previous=a[0];return[a[0],str(a[1]),STATUS[a[2]],a[3]];});if(a.length&&a[0][0]!==1)fail();r[id]={q,d:str(d),a,n,s,reason:str(reason),closed:Boolean(closed),firstSuccess:Boolean(success)};}
 for(const[k,max]of[['active',6],['recent',2],['pins',4]])if(!Array.isArray(o[k])||o[k].length>max||new Set(o[k]).size!==o[k].length||o[k].some(id=>!Object.hasOwn(r,id)))fail();
 if(!Number.isInteger(o.pos)||o.pos<0||o.pos>=Math.max(1,o.active.length))fail();
 for(const[k,max,maxLen]of[['reasons',8,160],['notes',2,240]])if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k])||Object.keys(o[k]).length>max||Object.values(o[k]).some(x=>!validText(x,maxLen)))fail();
 const lessons=['3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8'];if(Object.keys(o.reasons).some(k=>!lessons.includes(k))||Object.keys(o.notes).some(k=>!['help','error'].includes(k)))fail();
 if(!o.paper||Array.isArray(o.paper)||Object.keys(o.paper).some(k=>!lessons.includes(k)||typeof o.paper[k]!=='boolean')||!Array.isArray(o.done)||new Set(o.done).size!==o.done.length||o.done.some(k=>!lessons.includes(k)))fail();
 if(!o.summary||['attempts','correct','supported'].some(k=>!Number.isSafeInteger(o.summary[k])||o.summary[k]<0||o.summary[k]>9999999))fail();
 if(!Number.isInteger(o.runSeed)||o.runSeed<0||o.runSeed>4294967295)fail();
 if(!['mixed','core-positive','core-signed','core-common',...lessons].includes(o.selectedTopic)||!['learn','independent'].includes(o.runMode))fail();
 if(typeof o.exposure!=='string'||o.exposure.length!==Math.ceil(ids.length/8)*2||/[^0-9a-f]/.test(o.exposure))fail();const exposed=ids.filter((id,i)=>(parseInt(o.exposure.slice((i>>3)*2,(i>>3)*2+2),16)&1<<(i%8))!==0);
 if(typeof o.seen!=='string'||o.seen.length!==Math.ceil(ids.length/8)*2||/[^0-9a-f]/.test(o.seen))fail();const seen=ids.filter((id,i)=>(parseInt(o.seen.slice((i>>3)*2,(i>>3)*2+2),16)&1<<(i%8))!==0);
 const firsts={},drafts={};for(const[k,max]of[['firsts',26],['drafts',26]]){if(!Array.isArray(o[k])||o[k].length>max)fail();for(const row of o[k]){const id=ids[row[0]];if(!Number.isInteger(row[0])||!known(id)||!(/^[gcei]\d+$/.test(id))||Object.hasOwn(k==='firsts'?firsts:drafts,id))fail();if(k==='drafts'){if(row.length!==2)fail();drafts[id]=str(row[1]);}else{if(row.length!==5||row[1]!==1||!Number.isInteger(row[3])||STATUS[row[3]]===undefined||!Number.isInteger(row[4])||row[4]<0||row[4]>15)fail();firsts[id]=[row[1],str(row[2]),STATUS[row[3]],row[4]];}}}
 const counts=o.counts||{};if(Array.isArray(counts)||Object.keys(counts).length>26||Object.entries(counts).some(([id,n])=>!known(id)||!Number.isSafeInteger(n)||n<0))fail();
 const trig=o.trig||{};if(Array.isArray(trig)||Object.keys(trig).some(k=>!['side','ratio','angle','length','lengthStatus','angleRaw','lengthRaw','support','rotation','setupSaved','reason','aa','la','an','ln'].includes(k)))fail();for(const [k,v]of Object.entries(trig)){if(['aa','la'].includes(k)){if(!Array.isArray(v)||v.length>4)fail();let prior=0;for(const row of v){if(!Array.isArray(row)||row.length!==4||!Number.isInteger(row[0])||row[0]<=prior||!validText(row[1],80)||!['correct','incorrect','input','different_requested_unit','missing_unit','precision'].includes(row[2])||!Number.isInteger(row[3])||row[3]<0||row[3]>15)fail();prior=row[0];}}else if(['an','ln'].includes(k)){if(!Number.isSafeInteger(v)||v<0)fail();}else if(['support','rotation'].includes(k)){if(!Number.isInteger(v)||v<0||v>15)fail();}else if(k==='setupSaved'){if(typeof v!=='boolean')fail();}else if(!validText(v,k==='reason'?160:80))fail();}
 return{v:o.v,rev:o.rev,route:o.route,r,active:o.active,pos:o.pos,recent:o.recent,pins:o.pins,selectedTopic:o.selectedTopic,runMode:o.runMode,runSeed:o.runSeed,reasons:o.reasons,paper:o.paper,done:o.done,notes:o.notes,exposed,seen,summary:o.summary,firsts,drafts,counts,trig};
}
function checkCapacity(packed){const text=JSON.stringify(packed);if(text.length>APP_LIMIT)throw Error('This work exceeds the configured application budget. Keep this page open; the previous saved copy is unchanged.');return text;}
return{VERSION,ENGINE,APP_LIMIT,validText,encode,decode,checkCapacity};
});
