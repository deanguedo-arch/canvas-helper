/* Canonical optional-practice engine. No network or independent learner store. */
(function(root){'use strict';
const P=root.ChemistryPractice=root.ChemistryPractice||{};
P.version='chem-unit-a-practice-v1';
P.modes={flashcards:'Flash Cards',blanks:'Fill in the Blanks','multiple-choice':'Multiple Choice',diagrams:'Diagrams',calculations:'Calculations','mixed-practice':'Mixed Practice'};
P.esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
P.normalize=value=>String(value??'').normalize('NFKC').trim().toLowerCase().replace(/[−–]/g,'-').replace(/[.!?]+$/u,'').replace(/\s+/g,' ');
P.random=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
P.shuffle=(values,random)=>{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
P.lessons=()=>P.banks.flatMap(bank=>bank.lessons).concat([{id:'pack-chapter-12',chapter:12,title:'Chapter 12 diagrams'},{id:'pack-chapter-13',chapter:13,title:'Chapter 13 diagrams'}]);
P.catalog=()=>P.banks.flatMap(bank=>bank.items).concat(P.templates,P.diagrams.map(d=>({...d,type:'diagram',kind:'diagrams'})));
P.blankState=()=>({version:1,current:{},history:{},skills:{}});
P.valid=p=>!!p&&p.version===1&&['current','history','skills'].every(k=>p[k]&&typeof p[k]==='object'&&!Array.isArray(p[k]))&&Object.entries(p.current).every(([k,r])=>P.modes[k]&&r.mode===k&&P.validRun(r))&&Object.entries(p.history).every(([k,runs])=>P.modes[k]&&Array.isArray(runs)&&runs.length<=3&&runs.every(r=>r.mode===k&&Number.isFinite(r.ended)&&P.validRun(r)))&&Object.keys(p.skills).length<=500&&Object.values(p.skills).every(s=>s&&Number.isInteger(s.attempts)&&s.attempts>=0&&typeof s.needs==='boolean');
P.validRun=r=>r&&r.version===P.version&&P.modes[r.mode]&&typeof r.id==='string'&&r.id.length<=100&&r.settings&&typeof r.settings.scope==='string'&&(r.settings.scope==='all'||/^chapter-(9|10|11|12|13)$/.test(r.settings.scope)||P.lessons().some(l=>l.id===r.settings.scope))&&[5,10,15,20].includes(r.settings.count)&&['mixed','1','2','3'].includes(String(r.settings.difficulty))&&Number.isFinite(r.started)&&Number.isInteger(r.index)&&Array.isArray(r.items)&&r.items.length>=1&&r.items.length<=20&&r.index>=0&&r.index<=r.items.length&&r.items.every(i=>typeof i.id==='string'&&Number.isInteger(i.seed)&&Array.isArray(i.order)&&i.order.length<=20&&i.order.every(v=>typeof v==='string'&&v.length<=180)&&i.d&&typeof i.d==='object'&&Object.values(i.d).every(v=>typeof v==='string'&&v.length<=600)&&Array.isArray(i.a)&&i.a.length<=2&&i.a.every(a=>a&&typeof a.correct==='boolean'&&a.response&&typeof a.response==='object'&&Object.values(a.response).every(v=>typeof v==='string'&&v.length<=600)));
P.inScope=(q,scope)=>scope==='all'||scope==='chapter-'+q.chapter||q.lesson===scope;
P.resolve=item=>{const source=P.catalog().find(q=>q.id===item.id);if(!source)throw Error('This saved question is unavailable. Keep your saved work and ask your teacher.');const q=source.type==='numeric'?P.calculate(source,item.seed,item.params):source;return {...q,options:item.order.length?item.order:q.options};};
P.start=(mode,settings,seed,previous,skills,retry=false,diagramId='')=>{
 const random=P.random(seed),catalog=P.catalog();let pool=catalog.filter(q=>q.active!==false&&(mode!=='mixed-practice'||q.chapter<=11)&&P.inScope(q,settings.scope)&&(mode==='mixed-practice'?q.type!=='flashcard':q.kind===mode));
 if(mode==='multiple-choice'&&settings.difficulty!=='mixed')pool=pool.filter(q=>q.difficulty===Number(settings.difficulty));
 if(mode==='diagrams'&&diagramId)pool=pool.filter(q=>q.id===diagramId);
 if(retry)pool=pool.filter(q=>skills[q.skill]?.needs||q.type==='diagram'&&Object.values(q.labels).some(l=>skills[l.skill]?.needs));
 if(!pool.length)throw Error(retry?'No missed skills match this selection. Choose another scope or start a fresh set.':'No questions match this selection. Choose a broader scope or another difficulty.');
 const avoid=new Set(previous?.items.map(i=>i.id)||[]);pool=P.shuffle(pool,random).sort((a,b)=>Number(avoid.has(a.id))-Number(avoid.has(b.id)));
 const chosen=[];const count=mode==='diagrams'?1:settings.count;
 if(mode==='mixed-practice'){for(const type of P.shuffle(['typed','choice','numeric','diagram'],random)){const at=pool.findIndex(q=>q.type===type&&!chosen.some(c=>c.family===q.family));if(at>=0&&chosen.length<count)chosen.push(pool.splice(at,1)[0]);}}
 while(pool.length&&chosen.length<count){let at=pool.findIndex(q=>q.family!==chosen.at(-1)?.family&&(chosen.length<2||q.type!==chosen.at(-1)?.type||q.type!==chosen.at(-2)?.type));if(at<0)at=pool.findIndex(q=>q.family!==chosen.at(-1)?.family);if(at<0)at=0;chosen.push(pool.splice(at,1)[0]);}
 const items=chosen.map(q=>{const itemSeed=Math.floor(random()*0x7fffffff);const item={id:q.id,seed:itemSeed,order:P.shuffle(q.type==='diagram'?Object.values(q.labels).map(l=>l.answer):q.options||[],random),d:{},a:[]};if(q.type==='numeric')item.params=P.calculate(q,itemSeed).params;return item;});
 return {version:P.version,id:'practice-'+Date.now().toString(36)+'-'+seed.toString(36),mode,settings:{...settings},started:Date.now(),index:0,items};
};
P.parseNumber=value=>{const s=String(value??'').normalize('NFKC').trim().replace(/[−–]/g,'-').replace(/\s/g,'').replace(/[×·]10\^?([+-]?\d+)/g,'e$1');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s)?Number(s):NaN;};
const units={'J':{dimension:'energy',factor:1},'kJ':{dimension:'energy',factor:1000},'J/mol':{dimension:'molar',factor:1},'kJ/mol':{dimension:'molar',factor:1000},'g':{dimension:'mass',factor:1},'kg':{dimension:'mass',factor:1000},'mol':{dimension:'amount',factor:1},'°C':{dimension:'temperature',factor:1},'K':{dimension:'temperature',factor:1,offset:-273.15},'J/°C':{dimension:'capacity',factor:1},'kJ/°C':{dimension:'capacity',factor:1000},'J/K':{dimension:'capacity',factor:1},'kJ/K':{dimension:'capacity',factor:1000},'J/(g·°C)':{dimension:'specific',factor:1},'J/(g·K)':{dimension:'specific',factor:1},'%':{dimension:'percent',factor:1},'fraction':{dimension:'percent',factor:100},'mL/s':{dimension:'rate',factor:1},'L/s':{dimension:'rate',factor:1000}};
P.unitOptions=q=>Object.keys(units).filter(u=>units[u].dimension===units[q.unit]?.dimension);
P.grade=(q,d)=>{
 if(q.type==='diagram'){const parts=Object.fromEntries(Object.entries(q.labels).map(([letter,label])=>[letter,d[letter]===label.answer]));return {correct:Object.values(parts).every(Boolean),parts};}
 if(q.type==='numeric'){const supplied=units[d.unit],target=units[q.unit],value=P.parseNumber(d.value);const converted=supplied&&target&&supplied.dimension===target.dimension?(value*supplied.factor+(q.temperatureDifference?0:(supplied.offset||0)-(target.offset||0)))/target.factor:NaN;const tol=q.tolerance??Math.max(Math.abs(q.answer)*0.005,0.005);return {correct:Number.isFinite(converted)&&Math.abs(converted-q.answer)<=tol,parts:{value:Number.isFinite(converted)&&Math.abs(converted-q.answer)<=tol},rounding:'Keep suitable significant figures when you write your final answer.'};}
 if(q.type==='choice')return {correct:d.answer===q.answer};
 return {correct:(q.answers||[q.answer]).some(answer=>P.normalize(answer)===P.normalize(d.answer))};
};
P.locked=item=>item.self!==undefined||item.a.some(a=>a.correct)||item.a.length===2;
P.answerText=q=>q.type==='diagram'?Object.entries(q.labels).map(([letter,l])=>`${letter}: ${l.answer}`).join('; '):q.type==='numeric'?`${Number(q.answer.toPrecision(5))} ${q.unit}`:(q.answers?.[0]||q.answer);
P.explanation=q=>q.type==='numeric'?q.steps.join(' '):q.explanation;
P.check=(p,run,item)=>{const q=P.resolve(item);if(P.locked(item))return;const result=P.grade(q,item.d);item.a.push({...result,response:{...item.d},at:Date.now()});if(P.locked(item))P.recordSkills(p,item,q);return result;};
P.recordSkills=(p,item,q)=>{
 const add=(key,first,last,type)=>{const s=p.skills[key]||{attempts:0,firstCorrect:0,eventualCorrect:0,needs:false,representations:[]};s.attempts++;if(first)s.firstCorrect++;if(last)s.eventualCorrect++;s.needs=!last;s.last=Date.now();if(last&&!s.representations.includes(type))s.representations.push(type);p.skills[key]=s;};
 if(q.type==='flashcard'){const s=p.skills[q.skill]||{attempts:0,firstCorrect:0,eventualCorrect:0,needs:false,representations:[]};s.attempts++;const key=item.self==='know'?'selfKnow':'selfStudy';s[key]=(s[key]||0)+1;s.needs=item.self!=='know';s.last=Date.now();p.skills[q.skill]=s;}
 else if(q.type==='diagram'){const groups={};for(const [letter,l]of Object.entries(q.labels))(groups[l.skill]||=[]).push(letter);for(const [skill,letters]of Object.entries(groups))add(skill,letters.every(l=>item.a[0]?.parts?.[l]===true),letters.every(l=>item.a.at(-1)?.parts?.[l]===true),'diagram');}
 else add(q.skill,item.a[0]?.correct===true,item.a.at(-1)?.correct===true,q.type);
};
P.finish=(p,run)=>{if(!run.items.every(P.locked))throw Error('Check or self-assess every question before finishing.');if(run.ended)return;run.ended=Date.now();run.index=run.items.length;p.history[run.mode]=[...(p.history[run.mode]||[]),run].slice(-3);delete p.current[run.mode];};
P.stats=run=>{const graded=run.items.filter(i=>i.self===undefined);return {total:run.items.length,graded:graded.length,first:graded.filter(i=>i.a[0]?.correct).length,eventual:graded.filter(i=>i.a.some(a=>a.correct)).length,needs:run.items.filter(i=>i.self==='study'||i.self===undefined&&!i.a.at(-1)?.correct).length};};
P.validateCatalog=()=>{const ids=new Set();for(const q of P.catalog()){if(ids.has(q.id))throw Error('Duplicate practice ID '+q.id);ids.add(q.id);if(!P.lessons().some(l=>l.id===q.lesson&&l.chapter===q.chapter))throw Error('Unknown lesson '+q.lesson);if(!q.skill||!q.family||!q.sourceRefs?.length)throw Error('Missing coverage/provenance '+q.id);if(q.type==='choice'&&(!q.options.includes(q.answer)||new Set(q.options).size!==q.options.length))throw Error('Invalid options '+q.id);}return ids.size;};
})(typeof window==='undefined'?globalThis:window);
