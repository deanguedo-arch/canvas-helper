export type PracticeKind='flashcards'|'blanks'|'multiple-choice'|'mixed-practice';
export type Interaction='flashcard'|'typed'|'single'|'multiple'|'true-false'|'ordering'|'diagram';
export type McVariant={id:string;skill:string;difficulty:1|2|3|4;prompt:string;answer:string;optionSource:'terms'|'definitions'|'scenarios'|'sequence'};
export type PracticeConcept={id:string;lessonId:string;term:string;definition:string;scenario:string;misconception:string;sequence:string[];answers:string[];aliases:string[];relationships:string[];contrast:string[];cue:string;explanation:string;sourceRefs:string[];mcVariants:McVariant[]};
export type PracticeBank={schemaVersion:number;bankVersion:string;generatorVersion:string;lessons:{id:string;label:string;optional:boolean}[];concepts:PracticeConcept[]};
export type GeneratedItem={id:string;conceptId:string;lessonId:string;family:string;interaction:Interaction;skill:string;difficulty?:1|2|3|4;prompt:string;answers:string[];options?:string[];cue:string;explanation:string;sourceRefs:string[]};
export type PracticeSettings={lessonId:string;count:5|10|15|20;difficulty?:'foundation'|'developing'|'application'|'mixed'};
export type PracticeAttempt={itemId:string;answer:string[];correct:boolean|null;attemptNumber:number;at:number;firstTry:boolean};
export type GeneratedSession={schemaVersion:1;seed:number;bankVersion:string;generatorVersion:string;kind:PracticeKind;settings:PracticeSettings;items:GeneratedItem[];position:number;attempts:PracticeAttempt[];feedback:'none'|'cue'|'answer';adaptations:{triggerItemId:string;replacementItemId:string;at:number}[];startedWithEvidence:Record<string,{correct:number;attempts:number}>};

const hash=(value:string)=>{let h=2166136261;for(const ch of value){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const rng=(seed:number)=>()=>{seed|=0;seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const shuffled=<T>(items:T[],random:()=>number)=>items.map(value=>({value,key:random()})).sort((a,b)=>a.key-b.key).map(x=>x.value);
export const normalizePracticeAnswer=(value:string)=>value.trim().toLocaleLowerCase().replace(/[.!?]+$/u,'').trim().replace(/\s+/g,' ');
export function validatePracticeBank(bank:PracticeBank){
 const errors:string[]=[];const lessonIds=new Set(bank.lessons.map(x=>x.id)),legacyRestorationLessonIds=new Set(['lesson-14']),ids=new Set<string>();
 if(bank.schemaVersion!==1)errors.push('Unsupported bank schema.');
 for(const concept of bank.concepts){if(ids.has(concept.id))errors.push(`Duplicate concept ${concept.id}.`);ids.add(concept.id);if(!lessonIds.has(concept.lessonId)&&!legacyRestorationLessonIds.has(concept.lessonId))errors.push(`Unknown lesson ${concept.lessonId}.`);if(!concept.sourceRefs.length)errors.push(`Missing source for ${concept.id}.`);if(!concept.answers.length||!Array.isArray(concept.aliases))errors.push(`Missing authored answers for ${concept.id}.`);if(!concept.cue||!concept.explanation||concept.contrast.length<2||!concept.relationships.length)errors.push(`Incomplete authored support for ${concept.id}.`);if(concept.sequence.length<3)errors.push(`Sequence too short for ${concept.id}.`);if(concept.mcVariants.length<7)errors.push(`Too few MC variants for ${concept.id}.`);for(const variant of concept.mcVariants){const id=`${concept.id}:mc-${variant.id}`;if(ids.has(id))errors.push(`Duplicate MC variant ${id}.`);ids.add(id);if(!variant.prompt||!variant.answer||![1,2,3,4].includes(variant.difficulty))errors.push(`Malformed MC variant ${id}.`);}}
 for(const lesson of bank.lessons)if(!bank.concepts.some(x=>x.lessonId===lesson.id))errors.push(`No concepts for ${lesson.id}.`);
 return errors;
}
function variants(concept:PracticeConcept,kind:PracticeKind,peers:PracticeConcept[],random:()=>number):GeneratedItem[]{
 const distractors=shuffled(peers.filter(x=>x.id!==concept.id&&x.lessonId===concept.lessonId),random).slice(0,3);
 const base={conceptId:concept.id,lessonId:concept.lessonId,cue:concept.cue,explanation:`${concept.explanation} Source: ${concept.sourceRefs.join('; ')}`,sourceRefs:concept.sourceRefs};
 const authoredMc=()=>concept.mcVariants.map(variant=>{
  const source=variant.optionSource==='terms'?[concept.term,...concept.relationships,...peers.map(x=>x.term)]:variant.optionSource==='definitions'?[concept.definition,concept.misconception,...peers.flatMap(x=>[x.definition,x.misconception])]:variant.optionSource==='scenarios'?[concept.scenario,...peers.map(x=>x.scenario),...concept.relationships]:[...concept.sequence,...peers.flatMap(x=>x.sequence)];
  const options=shuffled([...new Set([variant.answer,...source].filter(Boolean))].slice(0,8),random).slice(0,4);
  if(!options.includes(variant.answer))options[options.length-1]=variant.answer;
  return{...base,id:`${concept.id}:mc-${variant.id}`,family:variant.skill,interaction:'single' as const,skill:variant.skill,difficulty:variant.difficulty,prompt:variant.prompt,answers:[variant.answer],options:shuffled([...new Set(options)],random)};
 });
 if(kind==='flashcards')return[
  {...base,id:`${concept.id}:card-term`,family:'recall',interaction:'flashcard',skill:'recall',prompt:concept.term,answers:[concept.definition]},
  {...base,id:`${concept.id}:card-definition`,family:'reverse-retrieval',interaction:'flashcard',skill:'recall',prompt:concept.definition,answers:[concept.term]},
  {...base,id:`${concept.id}:card-scenario`,family:'application',interaction:'flashcard',skill:'application',prompt:concept.scenario,answers:[`${concept.term} — ${concept.definition}`]},
  {...base,id:`${concept.id}:card-error`,family:'error-correction',interaction:'flashcard',skill:'error-correction',prompt:`Correct this idea: ${concept.misconception}`,answers:[concept.definition]}
 ];
 if(kind==='blanks')return[
  {...base,id:`${concept.id}:blank-definition`,family:'definition',interaction:'typed',skill:'recall',prompt:`The term for “${concept.definition}” is _____.`,answers:[...concept.answers,...concept.aliases]},
  {...base,id:`${concept.id}:blank-scenario`,family:'scenario',interaction:'typed',skill:'application',prompt:`This situation illustrates _____: ${concept.scenario}`,answers:[...concept.answers,...concept.aliases]},
  {...base,id:`${concept.id}:blank-sequence`,family:'pathway',interaction:'typed',skill:'sequencing',prompt:`Complete the pathway: ${concept.sequence.slice(0,-1).join(' → ')} → _____.`,answers:[concept.sequence.at(-1)!]}
 ];
 if(kind==='multiple-choice')return authoredMc();
 const options=shuffled([concept.term,...distractors.map(x=>x.term)],random);
 const sequenceOptions=shuffled(concept.sequence,random);
 return[
  {...base,id:`${concept.id}:mixed-typed`,family:'retrieval',interaction:'typed',skill:'recall',prompt:`Name the concept: ${concept.definition}`,answers:[...concept.answers,...concept.aliases]},
  ...authoredMc().slice(0,2),
  {...base,id:`${concept.id}:mixed-single`,family:'discrimination',interaction:'single',skill:'comparison',prompt:`Which concept means “${concept.definition}”?`,answers:[concept.term],options},
  {...base,id:`${concept.id}:mixed-application`,family:'application',interaction:'single',skill:'application',prompt:concept.scenario,answers:[concept.term],options},
  {...base,id:`${concept.id}:mixed-multiple`,family:'odd-one-out',interaction:'multiple',skill:'comparison',prompt:`Select both statements that belong with ${concept.term}.`,answers:[concept.definition,concept.scenario],options:shuffled([concept.definition,concept.scenario,...distractors.slice(0,2).map(x=>x.definition)],random)},
  {...base,id:`${concept.id}:mixed-tf`,family:'misconception',interaction:'true-false',skill:'error-correction',prompt:concept.misconception,answers:['false'],options:['true','false']},
  {...base,id:`${concept.id}:mixed-order`,family:'sequence',interaction:'ordering',skill:'sequencing',prompt:`Put the ${concept.term} steps in order.`,answers:concept.sequence,options:sequenceOptions},
  ...(concept.id==='neuron-parts'?[{...base,id:'neuron-parts:mixed-diagram',family:'diagram',interaction:'diagram' as const,skill:'diagram-reading',prompt:'In the corrected A–J neural-pathway diagram, which letter identifies the cell body?',answers:['E'],options:['E','F','G','H']}]:[])
 ];
}
export function generatePracticeSession(bank:PracticeBank,kind:PracticeKind,settings:PracticeSettings,seed:number,evidence:GeneratedSession['startedWithEvidence']={},avoidIds:string[]=[]):GeneratedSession{
 const errors=validatePracticeBank(bank);if(errors.length)throw Error(errors.join(' '));const random=rng(seed);
 const concepts=bank.concepts.filter(x=>settings.lessonId==='all'?!x.lessonId.match(/lesson-1[34]/):settings.lessonId==='foundations'?['lesson-01','lesson-02','lesson-03'].includes(x.lessonId):x.lessonId===settings.lessonId);let pool=shuffled(concepts.flatMap(c=>variants(c,kind,concepts,random)),random);
 if(kind==='multiple-choice'&&settings.difficulty&&settings.difficulty!=='mixed'){const levels=settings.difficulty==='foundation'?[1]:settings.difficulty==='developing'?[2]:[3,4];pool=pool.filter(x=>x.difficulty&&levels.includes(x.difficulty));}
 const selected:GeneratedItem[]=[];const avoided=new Set(avoidIds),ordered=[...pool.filter(x=>!avoided.has(x.id)),...pool.filter(x=>avoided.has(x.id))];let last:Interaction|undefined,streak=0;
 const add=(item:GeneratedItem|undefined,family?:string)=>{if(!item||selected.some(x=>x.id===item.id))return false;const nextStreak=item.interaction===last?streak+1:1;if(kind==='mixed-practice'&&nextStreak>2)return false;selected.push(family?{...item,family}:item);last=item.interaction;streak=nextStreak;return true;};
 if(kind==='mixed-practice'&&settings.count>=10){const wanted=['retrieval','discrimination','application','retrieval','sequence','misconception','discrimination','application','diagram-pathway','adaptive-review'];for(const family of wanted){let candidate;if(family==='diagram-pathway')candidate=ordered.find(x=>x.family==='diagram')??ordered.find(x=>x.family==='sequence');else if(family==='adaptive-review'){const weakest=[...concepts].sort((a,b)=>{const ea=evidence[a.id]??{correct:0,attempts:0},eb=evidence[b.id]??{correct:0,attempts:0};return ea.correct/Math.max(1,ea.attempts)-eb.correct/Math.max(1,eb.attempts);})[0];candidate=ordered.find(x=>x.conceptId===weakest?.id);}else candidate=ordered.find(x=>x.family===family);add(candidate,family);}}
 if(kind==='multiple-choice'&&settings.lessonId==='all'){for(const lesson of shuffled(bank.lessons.filter(x=>!x.optional),random).slice(0,settings.count))add(ordered.find(x=>x.lessonId===lesson.id));}
 for(const item of ordered){if(selected.length>=settings.count)break;add(item);}
 return{schemaVersion:1,seed,bankVersion:bank.bankVersion,generatorVersion:bank.generatorVersion,kind,settings,items:selected,position:0,attempts:[],feedback:'none',adaptations:[],startedWithEvidence:evidence};
}
export function gradeGeneratedItem(item:GeneratedItem,answer:string[]){const actual=answer.map(normalizePracticeAnswer),expected=item.answers.map(normalizePracticeAnswer);if(item.interaction==='typed')return actual.length===1&&expected.includes(actual[0]);if(item.interaction==='ordering')return actual.length===expected.length&&actual.every((x,i)=>x===expected[i]);return actual.length===expected.length&&expected.every(x=>actual.includes(x));}
export function compactResumeProjection(sessions:Record<string,GeneratedSession>,performance:Record<string,{correct:number;attempts:number}>){return{schemaVersion:1,bankVersion:Object.values(sessions)[0]?.bankVersion??'',sessions:Object.fromEntries(Object.entries(sessions).map(([id,s])=>[id,{seed:s.seed,kind:s.kind,settings:s.settings,items:s.items.map(x=>({id:x.id,options:x.options})),position:s.position,attempts:s.attempts,feedback:s.feedback,adaptations:s.adaptations}])),performance};}
export function restoreGeneratedItem(bank:PracticeBank,kind:PracticeKind,id:string,options?:string[]){const conceptId=id.split(':')[0],concept=bank.concepts.find(x=>x.id===conceptId);if(!concept)throw Error(`Missing authored concept ${conceptId}.`);const item=variants(concept,kind,bank.concepts.filter(x=>x.lessonId===concept.lessonId),rng(hash(id))).find(x=>x.id===id);if(!item)throw Error(`Missing authored variant ${id}.`);return{...item,options:options??item.options};}
export function renderGeneratedItem(item:GeneratedItem,index:number,total:number,attempts:PracticeAttempt[]){
 const tried=attempts.filter(x=>x.itemId===item.id),locked=(item.interaction==='flashcard'&&tried.length>0)||tried.some(x=>x.correct)||tried.length>=2;
 const choices=(item.options??[]).map((option,i)=>`<label class="practice-choice"><input data-generated-answer type="${item.interaction==='multiple'?'checkbox':'radio'}" name="generated-${index}" value="${escapeHtml(option)}" ${locked?'disabled':''}> ${escapeHtml(option)}</label>`).join('');
 const input=item.interaction==='typed'?`<label for="generated-answer-${index}">Your answer</label><input id="generated-answer-${index}" data-generated-answer type="text" autocomplete="off" ${locked?'disabled':''}>`:item.interaction==='ordering'?`<ol class="practice-order" data-practice-order>${(item.options??[]).map((x,i)=>`<li><label><span>${i+1}.</span><select data-generated-answer ${locked?'disabled':''}>${(item.options??[]).map(y=>`<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join('')}</select></label></li>`).join('')}</ol>`:choices;
 const feedback=tried.length?(tried.at(-1)!.correct===null?`Self-assessment recorded: ${tried.at(-1)!.answer[0]==='recalled'?'recalled':'study again'}. ${item.explanation}`:tried.at(-1)!.correct?`Correct. ${item.explanation}`:tried.length===1?`Not yet. Cue: ${item.cue}`:`Answer: ${item.answers.join(' → ')}. ${item.explanation}`):'';
 const diagram=item.interaction==='diagram'?'<img class="practice-diagram" src="assets/source/neural-pathway-labeling-corrected.png" alt="Corrected neural pathway diagram labeled A through J.">':'';
 return `<div class="practice-progress"><span>Question ${index+1} of ${total}</span><progress value="${index+1}" max="${total}"></progress></div><section class="question generated-question" data-generated-item="${escapeHtml(item.id)}"><p class="practice-kind">${escapeHtml(item.family.replaceAll('-',' '))}${item.difficulty?` · Level ${item.difficulty}`:''}</p><h3>${escapeHtml(item.prompt)}</h3>${diagram}${item.interaction==='flashcard'?`<button type="button" data-generated-reveal ${tried.length?'hidden':''}>Reveal answer</button><div data-generated-reveal-panel hidden><p>${escapeHtml(item.answers.join(' — '))}</p><button type="button" data-generated-self="recalled">I recalled it</button><button type="button" data-generated-self="study-again">Study again</button></div>`:`${input}<button type="button" data-generated-check ${locked?'disabled':''}>Check answer</button>`}<p data-generated-feedback role="status" aria-live="polite">${escapeHtml(feedback)}</p>${locked?'<button type="button" data-generated-next>Next question</button>':''}</section>`;
}
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]!));
