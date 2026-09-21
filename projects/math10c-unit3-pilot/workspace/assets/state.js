/* Versioned, bounded state transport. No LMS API or browser storage ownership here.
   v2 always decodes through the frozen v0.4 catalog, never current display order. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./catalog-registry.js'),require('./state-v2-decoder.js'));else root.MathState=factory(root.MathCatalogs,root.MathStateV2Decoder);})(globalThis,function(Registry,Legacy){
'use strict';
const VERSION='unit3-state-3',ENGINE='unit3-algebra-2|unit3-contracts-2.1|bounded-factors-v1';
const POLICY=Object.freeze({raw:160,recordReason:120,lessonReason:160,note:240,trigReason:160,trigRaw:80,active:6,recent:2,selected:4,attemptDetails:4,applicationCharacters:40000});
const APP_LIMIT=POLICY.applicationCharacters,STATUS=['correct','incorrect','equivalent','intermediate','ungraded'];
const LESSONS=['3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8'];
const SKILLS=[...LESSONS,'trig-angle','trig-length','trig-setup'];
const validText=Legacy.validText;
const clone=x=>JSON.parse(JSON.stringify(x));
function fail(m='Saved work failed validation. The original has not been replaced.'){throw Error(m);}
const dict=x=>x&&typeof x==='object'&&!Array.isArray(x);
const nat=(x,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
const engines=new Set([ENGINE,'unit3-algebra-1|unit3-contracts-2.0|bounded-factors-v1']);
function catalog(id){const c=Registry.catalogs[id];if(!c)fail('Unknown saved catalog '+String(id)+'. Recover the original bytes; do not start an empty attempt.');return c;}
function provenance(p){if(!dict(p)||!engines.has(p.engine)||!Registry.catalogs[p.catalog]||!validText(p.content,80)||!validText(p.kind,40))fail('Unknown result provenance. Original work is retained for recovery.');if(p.detail!==undefined&&!validText(p.detail,1200))fail();return p;}
function oldProvenance(){return{engine:Legacy.ENGINE,catalog:'unit3-catalog-v04',content:catalog('unit3-catalog-v04').contentVersion,kind:'legacy-global-version;not-regraded'};}
function resultProvenance(q,detail=''){return{engine:ENGINE,catalog:Registry.current,content:q.contentVersion||catalog(Registry.current).contentVersion,kind:'checked',detail};}
function annotateLegacy(s){const p=oldProvenance();for(const r of Object.values(s.r)){r.catalog='unit3-catalog-v04';r.a=r.a.map(a=>[...a,clone(p)]);}for(const id of Object.keys(s.firsts))s.firsts[id]=[...s.firsts[id],clone(p)];s.skills={};s.legacySummary=clone(s.summary);s.summaryRevision=0;s.trig.legacyChronology='uncertain-v04';s.trig.legacyVersion=Legacy.ENGINE;return s;}
function encode(state){const c=catalog(Registry.current),ids=c.ids,index=new Map(ids.map((id,i)=>[id,i]));const strings=[],sm=new Map(),provenances=[],pm=new Map();
 const intern=x=>{x=String(x??'');if(!sm.has(x)){sm.set(x,strings.length);strings.push(x);}return sm.get(x);};
 const prov=p=>{provenance(p);const key=JSON.stringify(p);if(!pm.has(key)){pm.set(key,provenances.length);provenances.push(p);}return pm.get(key);};
 const qi=id=>{if(!index.has(id))fail('Unknown question identity: '+id);return index.get(id);};
 const bits=list=>{const b=new Uint8Array(Math.ceil(ids.length/8));for(const id of list){const i=qi(id);b[i>>3]|=1<<(i%8);}return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');};
 const attempt=a=>[a[0],intern(a[1]),STATUS.indexOf(a[2]),a[3],prov(a[4])];
 const {r,firsts={},drafts={},exposed=[],seen=[],...rest}=state;
 return{...rest,format:VERSION,engine:ENGINE,catalog:Registry.current,seen:bits(seen),exposure:bits(exposed),r:Object.entries(r).map(([id,x])=>[id,qi(x.q),intern(x.d),x.a.map(attempt),x.n,x.s,intern(x.reason),Number(x.closed),Number(!!x.firstSuccess),x.catalog||Registry.current]),firsts:Object.entries(firsts).map(([id,a])=>[qi(id),...attempt(a)]),drafts:Object.entries(drafts).map(([id,s])=>[qi(id),intern(s)]),strings,provenances};
}
function decode(raw,{questions,pages,version}={}){
 let o;try{o=typeof raw==='string'?JSON.parse(raw):clone(raw);}catch{fail('Unreadable saved JSON. Preserve the original file for recovery.');}
 if(o?.format===Legacy.VERSION){const c=catalog('unit3-catalog-v04');if(o.engine!==c.engine||o.v!==c.contentVersion)fail('Unknown historical engine/content version.');const old=Legacy.decode(o,{questions:c.questions,pages,version:c.contentVersion});const migrated=annotateLegacy(old);migrated.v=version||catalog(Registry.current).contentVersion;return decode(encode(migrated),{questions,pages,version:migrated.v});}
 if(!dict(o)||o.format!==VERSION||o.engine!==ENGINE)fail('Unknown state schema or engine. Preserve both saved versions for recovery.');
 const allowedKeys=new Set('v rev route active pos recent pins selectedTopic runMode runSeed counts trig reasons paper done notes summary skills legacySummary summaryRevision format engine catalog seen exposure r firsts drafts strings provenances'.split(' '));
 if(Object.keys(o).some(k=>!allowedKeys.has(k)))fail('Unknown state fields require an explicit migration. Nothing has been discarded.');
 const c=catalog(o.catalog),ids=c.ids,known=id=>Object.hasOwn(c.questions,id),fixed=id=>known(id)&&/^[gcei]\d+$/.test(id);
 if(o.v!==c.contentVersion||!nat(o.rev)||!pages?.includes(o.route)||!Array.isArray(o.strings)||o.strings.length>350||!o.strings.every(s=>validText(s,POLICY.raw)))fail();
 if(!Array.isArray(o.provenances)||o.provenances.length>200)fail();o.provenances.forEach(provenance);
 const str=i=>{if(!nat(i,o.strings.length-1))fail();return o.strings[i];};const question=i=>{if(!nat(i,ids.length-1))fail();return ids[i];};
 function attempt(a,n){if(!Array.isArray(a)||a.length!==5||!nat(a[0],n)||a[0]===0||!nat(a[2],STATUS.length-1)||!nat(a[3],15)||!nat(a[4],o.provenances.length-1))fail();return[a[0],str(a[1]),STATUS[a[2]],a[3],clone(o.provenances[a[4]])];}
 if(!Array.isArray(o.r)||o.r.length>21)fail();const r={};
 for(const row of o.r){if(!Array.isArray(row)||row.length!==10)fail();const [id,idx,d,ar,n,s,reason,closed,success,rc]=row,q=question(idx);if(typeof id!=='string'||!/^(s-[a-z0-9-]+|r-\d+)$/.test(id)||Object.hasOwn(r,id)||!nat(n)||!nat(s,15)||![0,1].includes(closed)||![0,1].includes(success)||str(reason).length>POLICY.recordReason||!catalog(rc).questions[q])fail();if(id.startsWith('s-')&&id!=='s-'+q)fail();if(!Array.isArray(ar)||ar.length>POLICY.attemptDetails)fail();let prior=0;const a=ar.map(x=>{const a=attempt(x,n);if(a[0]<=prior)fail();prior=a[0];return a;});if(a.length&&a[0][0]!==1)fail();r[id]={q,d:str(d),a,n,s,reason:str(reason),closed:!!closed,firstSuccess:!!success,catalog:rc};}
 for(const [k,max]of [['active',POLICY.active],['recent',POLICY.recent],['pins',POLICY.selected]])if(!Array.isArray(o[k])||o[k].length>max||new Set(o[k]).size!==o[k].length||o[k].some(id=>!Object.hasOwn(r,id)))fail();
 if(!nat(o.pos,Math.max(0,o.active.length-1)))fail();
 for(const[k,max,len,keys]of [['reasons',8,POLICY.lessonReason,LESSONS],['notes',2,POLICY.note,['help','error']]])if(!dict(o[k])||Object.keys(o[k]).length>max||Object.entries(o[k]).some(([k,x])=>!keys.includes(k)||!validText(x,len)))fail();
 if(!dict(o.paper)||Object.entries(o.paper).some(([k,x])=>!LESSONS.includes(k)||typeof x!=='boolean')||!Array.isArray(o.done)||new Set(o.done).size!==o.done.length||o.done.some(k=>!LESSONS.includes(k)))fail();
 const countsValid=s=>dict(s)&&['attempts','correct','supported'].every(k=>nat(s[k],9999999));
 if(!countsValid(o.summary)||!countsValid(o.legacySummary||{attempts:0,correct:0,supported:0})||!dict(o.skills||{})||Object.entries(o.skills||{}).some(([k,s])=>!SKILLS.includes(k)||!countsValid(s))||!nat(o.summaryRevision||0))fail();
 if(!nat(o.runSeed,4294967295)||!['mixed','core-positive','core-signed','core-common',...LESSONS].includes(o.selectedTopic)||!['learn','independent'].includes(o.runMode))fail();
 function readBits(s){if(typeof s!=='string'||s.length!==Math.ceil(ids.length/8)*2||/[^0-9a-f]/.test(s))fail();if(ids.length%8&&(parseInt(s.slice(-2),16)>>(ids.length%8)))fail('Exposure bits extend beyond their frozen catalog.');return ids.filter((id,i)=>(parseInt(s.slice((i>>3)*2,(i>>3)*2+2),16)&1<<(i%8))!==0);}
 const exposed=readBits(o.exposure),seen=readBits(o.seen),firsts={},drafts={},maxFixed=ids.filter(fixed).length;
 for(const k of ['firsts','drafts']){if(!Array.isArray(o[k])||o[k].length>maxFixed)fail();for(const row of o[k]){if(!Array.isArray(row))fail();const id=question(row[0]);if(!fixed(id)||Object.hasOwn(k==='firsts'?firsts:drafts,id))fail();if(k==='drafts'){if(row.length!==2)fail();drafts[id]=str(row[1]);}else{if(row.length!==6||row[1]!==1)fail();firsts[id]=attempt(row.slice(1),1);}}}
 if(!dict(o.counts)||Object.keys(o.counts).length>maxFixed||Object.entries(o.counts).some(([id,n])=>!fixed(id)||!nat(n)))fail();
 const trig=validateTrig(o.trig||{});
 return{v:o.v,rev:o.rev,route:o.route,r,active:o.active,pos:o.pos,recent:o.recent,pins:o.pins,selectedTopic:o.selectedTopic,runMode:o.runMode,runSeed:o.runSeed,reasons:o.reasons,paper:o.paper,done:o.done,notes:o.notes,exposed,seen,summary:o.summary,firsts,drafts,counts:o.counts,trig,skills:o.skills||{},legacySummary:o.legacySummary||{attempts:0,correct:0,supported:0},summaryRevision:o.summaryRevision||0};
}
function validateTrig(t){if(!dict(t)||JSON.stringify(t).length>14000)fail();const textKeys=['side','adjacent','hypotenuse','ratio','angle','length','lengthStatus','angleRaw','lengthRaw','reason','legacyChronology','legacyVersion'];
 const allowed=[...textKeys,'support','angleSupport','lengthSupport','rotation','setupSaved','aa','la','an','ln','setupAttempts','setupCount'];
 if(Object.keys(t).some(k=>!allowed.includes(k)))fail();for(const [k,v]of Object.entries(t)){if(textKeys.includes(k)){if(!validText(v,k==='reason'?POLICY.trigReason:k==='legacyVersion'?100:80))fail();}
 else if(['support','angleSupport','lengthSupport','rotation'].includes(k)){if(!nat(v,15))fail();}else if(['an','ln','setupCount'].includes(k)){if(!nat(v))fail();}else if(k==='setupSaved'){if(typeof v!=='boolean')fail();}else if(['aa','la','setupAttempts'].includes(k)){if(!Array.isArray(v)||v.length>4)fail();let prior=0;for(const a of v){if(!Array.isArray(a)||![4,5].includes(a.length)||!nat(a[0])||a[0]<=prior||!validText(a[1],80)||!['correct','incorrect','input','different_requested_unit','missing_unit','precision','ungraded'].includes(a[2])||!nat(a[3],15))fail();prior=a[0];if(a[4]!==undefined){const p=a[4];if(!dict(p)||!validText(p.checker,100)||!validText(p.instance,80)||!validText(p.relationship,80)||!['correct','incorrect','not_attempted'].includes(p.setup)||!dict(p.value)||JSON.stringify(p).length>1400)fail();}}}}
 return clone(t);
}
function recordSummary(s,skill,result,support){if(!SKILLS.includes(skill))fail('Unknown summary skill.');s.skills??={};s.skills[skill]??={attempts:0,correct:0,supported:0};for(const target of [s.summary,s.skills[skill]]){target.attempts=Math.min(9999999,target.attempts+1);if(result==='correct'){target.correct=Math.min(9999999,target.correct+1);if(support)target.supported=Math.min(9999999,target.supported+1);}}s.summaryRevision=Math.min(Number.MAX_SAFE_INTEGER,(s.summaryRevision||0)+1);}
function checkCapacity(packed){const text=JSON.stringify(packed);if(text.length>APP_LIMIT)throw Error('Current work exceeds the provisional application budget. The last saved copy is unchanged. Keep this page open; your current work is available for recovery.');return text;}
return{VERSION,ENGINE,POLICY,APP_LIMIT,SKILLS,validText,encode,decode,decodeSavedState:decode,checkCapacity,resultProvenance,recordSummary,catalog};
});
