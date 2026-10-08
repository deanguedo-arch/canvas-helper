/* Reviewed practice families. No storage owner: native chapter runtime saves runs. */
(function(global){
'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
function pool(C,mode,topic='all',diff='mixed'){
 const items=[],meta=(x,conceptId,family,kind,difficulty='recall')=>({...x,conceptId,family,kind,difficulty:x.difficulty||difficulty,reviewRoute:x.reviewRoute||`lesson-${String(x.lesson).padStart(2,'0')}`,bankVersion:C.bankVersion});
 for(const w of C.practiceConcepts){
  const common={lesson:w.lesson,term:w.term,cue:w.cue||'Use the function described to identify the idea.',explanation:w.correctExplanation,aliases:w.aliases||[]};
  items.push(meta({...common,id:w.id+'-flash',prompt:`Explain ${w.term}.`,answer:w.meaning},w.id,'explain-term','flash'));
  if(!w.excludedFamilies?.includes('reverse-retrieval'))items.push(meta({...common,id:w.id+'-reverse',prompt:`Which term fits this definition? ${w.meaning}`,answer:w.term},w.id,'reverse-retrieval','flash'));
  items.push(meta({...common,id:w.id+'-misconception',prompt:`Correct this incorrect statement: ${w.misconception.statement}`,answer:w.misconception.correction},w.id,'misconception-correction','flash','application'));
  if(!w.excludedFamilies?.includes('term-from-definition'))items.push(meta({...common,id:w.id+'-blank',prompt:'Name the term described: '+w.meaning,answer:w.term},w.id,'term-from-definition','blank'));
 }
 for(const q of C.practiceQuestions){
  const concept=C.practiceConcepts.find(w=>[w.term,...(w.aliases||[])].some(t=>t.toLowerCase()===String(q.answer).toLowerCase()));
  if(concept?.excludedFamilies?.includes('term-from-definition'))continue;
  items.push(meta({...q,lesson:concept?.lesson||q.lesson},q.conceptId||concept?.id||q.id,'recognition','mc'));
 }
 for(const q of C.sequences)items.push(meta({...q,answer:q.steps,prompt:'Put these steps in order: '+q.title,cue:'Start with the initiating change.',explanation:q.steps.join(' → ')},q.conceptId||q.id,'pathway-order','order','application'));
 for(const q of C.authoredPractice||[]){items.push(meta(q,q.conceptId,q.family,q.kind));if(q.flashVariant)items.push(meta({...q.flashVariant,lesson:q.lesson,answer:q.flashVariant.model,explanation:q.explanation},q.conceptId,q.flashVariant.family,'flash','application'));}
 for(const q of C.typedPractice||[])items.push(meta(q,q.conceptId,q.family,q.kind,'application'));
 for(const q of C.multiSelectPractice||[])items.push(meta(q,q.conceptId,q.family,q.kind,'application'));
 // Explicitly inspected letter positions; detailed/uncleared worksheets are excluded.
 const d=C.labelDiagrams.find(d=>d.id===`ch${C.chapter}-reviewed-package-${C.chapter===12?2:10}`);
 if(d)for(const letter of C.chapter===12?['B','E']:['D','K']){const allowed=C.chapter===12?['B','C','D','E']:['D','K'];items.push(meta({id:`ch${C.chapter}-diagram-${letter.toLowerCase()}`,lesson:d.lesson,diagramId:d.id,prompt:`Use the diagram. What is marked ${letter}?`,options:allowed.map(l=>d.answers[l]),answer:d.answers[letter],cue:C.chapter===12?'Locate the indicated retinal cell or layer.':'Trace the pancreatic-cell pathway before naming its hormone.',explanation:C.chapter===12?`${letter} identifies ${d.answers[letter]}. Light reaches photoreceptors; information passes toward ganglion cells and the optic nerve.`:`${letter} identifies ${d.answers[letter]}. Insulin follows the beta-cell pathway; glucagon follows the alpha-cell pathway.`},C.chapter===12?'ch12-retinal-circuit':letter==='D'?'ch13-insulin':'ch13-glucagon','diagram-identification','diagram','application'));}
 return items.filter(x=>(topic==='all'||String(x.lesson)===String(topic))&&(diff==='mixed'||x.difficulty===diff)&&(mode==='mixed'||(mode==='flash'?x.kind==='flash':mode==='blanks'?x.kind==='blank':x.kind==='mc')));
}
function safe(C,item){
 const found=pool(C,'mixed').concat(pool(C,'flash')).find(q=>q.id===item.id);
 if(found)return {...item,explanation:found.explanation,example:undefined,answer:item.kind==='flash'?found.answer:item.answer,conceptId:found.conceptId,family:found.family,reviewRoute:found.reviewRoute};
 const concept=C.practiceConcepts.find(w=>w.id===item.conceptId||item.id===w.id+'-flash'||item.id===w.id+'-blank');
 if(concept)return {...item,explanation:concept.correctExplanation,example:undefined,answer:item.kind==='flash'?concept.meaning:item.answer,conceptId:concept.id,reviewRoute:concept.reviewRoute};
 console.warn('Unresolved legacy practice feedback',item.id);
 return {...item,explanation:'Review the lesson explanation. Historical attempts and results are preserved.',example:undefined,reviewRoute:`lesson-${String(item.lesson||1).padStart(2,'0')}`,answer:item.kind==='flash'?'Review the lesson explanation.':item.answer};
}
function select(pool,count,random,mixed){
 const remaining=pool.map(x=>({...copy(x),_tie:random()})),out=[],concepts=new Set(),kinds=new Set(),families=new Set();
 while(out.length<count&&remaining.length){
  remaining.sort((a,b)=>score(b)-score(a)||a._tie-b._tie);
  const x=remaining.shift();delete x._tie;out.push(x);concepts.add(x.conceptId);kinds.add(x.kind);families.add(x.family);
 }
 function score(x){return (concepts.has(x.conceptId)?0:6)+(mixed&&!kinds.has(x.kind)?10:0)+(mixed&&!families.has(x.family)?7:0);}
 return out.map(x=>{if(x.options)x.options=x.options.map(v=>({v,t:random()})).sort((a,b)=>a.t-b.t).map(o=>o.v);if(x.kind==='order')x.options=x.steps.map(v=>({v,t:random()})).sort((a,b)=>a.t-b.t).map(o=>o.v);return x;});
}
function retry(C,old,misses){
 const eligible=pool(C,old.mode,old.topic,old.difficulty),seen=new Set(old.items.map(q=>q.id)),used=new Set();
 return misses.map(raw=>{const item=safe(C,raw),matches=eligible.filter(q=>q.conceptId===item.conceptId&&!used.has(q.id));const chosen=matches.find(q=>!seen.has(q.id)&&q.family!==item.family)||matches.find(q=>q.id!==item.id&&!seen.has(q.id))||matches.find(q=>q.id!==item.id)||{...item,repeatPractice:true};used.add(chosen.id);return copy(chosen);});
}
function equalSet(a,b){return Array.isArray(a)&&new Set(a).size===a.length&&a.length===b.length&&a.every(x=>b.includes(x));}
global.BiologyRevisionPractice=Object.freeze({pool,safe,select,retry,equalSet});
})(window);
