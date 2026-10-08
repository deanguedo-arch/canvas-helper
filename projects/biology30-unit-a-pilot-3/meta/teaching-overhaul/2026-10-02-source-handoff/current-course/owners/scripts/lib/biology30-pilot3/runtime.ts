import {mountWordFrayerControls} from '../biology30-vocabulary/word-frayer-runtime.js';
import {packWordFrayers,unpackWordFrayers,type WordFrayerState} from '../biology30-vocabulary/word-frayer-state.js';
import {mountVocabularyPanel} from '../biology30-vocabulary/panel.js';
import '../biology30-chapters/brightspace-photo-store.js';
import '../biology30-chapters/textbook-practice.js';
import {compactResumeProjection,generatePracticeSession,gradeGeneratedItem,renderGeneratedItem,restoreGeneratedItem,type GeneratedSession,type PracticeAttempt,type PracticeBank,type PracticeKind} from './practice-engine.js';

const scorm=(window as any).__canvasHelperScorm;
const lms=scorm&&scorm.connectionState()!=='preview';
const initialLms=lms?scorm.readCourseState():null;
const NS=lms?scorm.scopeKey('biology30-unit-a-pilot-3:v1'):'biology30-unit-a-pilot-3:v1';
if(lms){if(initialLms?.frayers)localStorage.setItem(NS+':frayers',JSON.stringify(initialLms.frayers));else localStorage.removeItem(NS+':frayers');}
const $=<T extends HTMLElement=HTMLElement>(s:string,r:ParentNode=document)=>r.querySelector<T>(s)!;
const all=<T extends HTMLElement=HTMLElement>(s:string,r:ParentNode=document)=>Array.from(r.querySelectorAll<T>(s));
const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
type Attempt={question:string;answer:string;correct:boolean|null;at:number;elapsedMs:number;prompt:string;conceptId?:string;skill?:string;difficulty?:number;generatedItemId?:string;firstTry?:boolean;displayedOptions?:string[];correctAnswer?:string[]};
type Run={id:string;activity:string;startedAt:number;endedAt?:number;drafts:Record<string,string>;attempts:Attempt[];questionIds?:string[];keys?:typeof catalog;generatedSession?:GeneratedSession};
type Saved={version:1;revision:number;current:Record<string,Run>;history:Run[];textbookWork?:Record<string,any>};
let state:Saved={version:1,revision:0,current:{},history:[]},db:IDBDatabase,ready=false,busy=false,failed=false;
let queue=Promise.resolve(),pending=0;
const catalog=(window as any).PILOT3_CATALOG;
const practiceBank=(window as any).PILOT3_PRACTICE_BANK as PracticeBank;
const PROJECTION_KEY='biology30-unit-a-pilot-3:generated-practice-resume:v1';
const message=(s:string)=>{$('[data-local-status]').textContent=s;};
const duration=(ms:number)=>{const s=Math.max(0,Math.floor(ms/1000));return `${Math.floor(s/60)}m ${s%60}s`;};
const normalize=(s:string)=>s.trim().toLowerCase().replace(/[.!]$/,'').replace(/\s+/g,' ');
const storageRequest=<T>(request:IDBRequest<T>)=>new Promise<T>((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
async function connect(){
 const request=indexedDB.open(NS,1);request.onupgradeneeded=()=>request.result.createObjectStore('work');
 db=await storageRequest(request);
}
async function open(){
 // Reading an untouched course must not create learner storage. Create it on the first action.
 const existing=typeof indexedDB.databases==='function'?(await indexedDB.databases()).some(item=>item.name===NS):true;
 if(existing||(lms&&initialLms?.state))await connect();
 const saved=db?await storageRequest(db.transaction('work').objectStore('work').get('state')):null;
 if(lms){
  const restored=initialLms?.state;
  if(restored&&(restored.version!==1||!Number.isInteger(restored.revision)||!restored.current||!Array.isArray(restored.history)))throw Error('Unrecognized Brightspace save. Existing record retained.');
  if(saved&&restored&&JSON.stringify(saved)!==JSON.stringify(restored)){
   const recovery=db.transaction('work','readwrite');recovery.objectStore('work').put(saved,'recovery:'+Date.now());
   await new Promise<void>((resolve,reject)=>{recovery.oncomplete=()=>resolve();recovery.onabort=()=>reject(Error('Could not preserve the browser recovery copy.'));});
   state=saved.revision>restored.revision&&window.confirm('This browser has newer work that Brightspace has not saved. Continue with the browser draft? Cancel opens the Brightspace copy; the browser recovery copy is retained.')?saved:restored;
  }else state=restored??state;
  if(db){const tx=db.transaction('work','readwrite'),store=tx.objectStore('work'),check=store.get('state');check.onsuccess=()=>{if(JSON.stringify(check.result??null)!==JSON.stringify(saved??null)){tx.abort();return;}store.put(state,'state');};await new Promise<void>((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onabort=()=>reject(Error('The restored work could not be stored; another tab may have changed it. The prior record is retained.'));});}
 }else if(saved){if(saved.version!==1||!saved.current||!Array.isArray(saved.history))throw Error('Unrecognized save. Existing record retained.');state=saved;}
 else{const portable=localStorage.getItem(PROJECTION_KEY);if(portable){try{const parsed=JSON.parse(portable);if(parsed.schemaVersion!==1||!parsed.sessions||parsed.bankVersion!==practiceBank.bankVersion)throw Error();for(const [activity,value] of Object.entries<any>(parsed.sessions)){if(!value.items||!Array.isArray(value.attempts))throw Error();const items=value.items.map((x:any)=>restoreGeneratedItem(practiceBank,value.kind,x.id,x.options)),generatedSession={schemaVersion:1,bankVersion:parsed.bankVersion,generatorVersion:practiceBank.generatorVersion,feedback:'none',adaptations:[],startedWithEvidence:parsed.performance??{},...value,items} as GeneratedSession;state.current[activity]={id:`portable-${activity}-${generatedSession.seed}`,activity,startedAt:value.startedAt??Date.now(),drafts:{},attempts:generatedSession.attempts.map(a=>{const item=generatedSession.items.find(i=>i.id===a.itemId)!;return{question:a.itemId,answer:a.answer.join(' → '),correct:a.correct,at:a.at,elapsedMs:0,prompt:item?.prompt??a.itemId,conceptId:item?.conceptId,skill:item?.skill,generatedItemId:a.itemId,firstTry:a.firstTry};}),questionIds:generatedSession.items.map(x=>x.id),generatedSession};}}catch{throw Error('Portable practice save is malformed or uses an unavailable bank version. It has been retained for recovery and no new session was created.');}}}
 ready=true;
 if(lms){publishLms();scorm.registerCourse({flush:async()=>{await (window as any).biologyTextbookPractice?.flush();await queue;if(failed)throw Error('Some course work has not saved. Keep this page open.');publishLms();}});}
 message(lms?'Course work opened from Brightspace. Photos remain in this browser until photo syncing is connected.':'Saved work opened. Local browser only; print or save completed work as a PDF before changing devices.');render();
 (window as any).mountBiologyTextbookPractice({chapter:11,read:()=>state.textbookWork??{},write:(id:string,record:any)=>{const action=queue.catch(()=>{}).then(()=>change(next=>{(next.textbookWork??={})[id]=record;}));queue=action.catch(()=>{});return action;}});
}
async function commit(next:Saved){
 if(!db)await connect();
 return new Promise<void>((resolve,reject)=>{
  const tx=db.transaction('work','readwrite'),store=tx.objectStore('work'),read=store.get('state');let conflict=false;
  read.onsuccess=()=>{if((read.result?.revision??0)!==state.revision){conflict=true;tx.abort();return;}try{next.revision=state.revision+1;store.put(next,'state');}catch{tx.abort();}};
  tx.oncomplete=()=>resolve();tx.onabort=()=>reject(Error(conflict?'Another tab changed this work. Copy your visible drafts, then reload.':'Saving failed. Your drafts remain visible; copy them before leaving.'));tx.onerror=()=>{};
 });
}
function generatedPerformance(next:Saved){const result:Record<string,{correct:number;attempts:number}>={};for(const run of [...next.history,...Object.values(next.current)])for(const attempt of run.generatedSession?.attempts??[]){const item=run.generatedSession!.items.find(x=>x.id===attempt.itemId);if(!item)continue;const row=result[item.conceptId]??={correct:0,attempts:0};row.attempts++;if(attempt.firstTry&&attempt.correct)row.correct++;}return result;}
function publishLms(){
 if(!lms)return;
 const completed=all<HTMLElement>('[data-required-check]').map(s=>s.dataset.activity!).filter(id=>state.history.some(r=>r.activity===id));
 const raw=localStorage.getItem(NS+':frayers');
 scorm.publishCourseState({state,frayers:raw?JSON.parse(raw):null},completed);
}
window.addEventListener('canvas-helper:scorm-status',(event:any)=>{if(lms)message(event.detail.message);});
function writeResumeProjection(next:Saved){
 if(lms){publishLms();return;}
 const active=Object.entries(next.current).filter(([,run])=>run.generatedSession&&!run.endedAt),sessions=Object.fromEntries(active.map(([id,run])=>[id,run.generatedSession!]));
 if(!active.length){localStorage.removeItem(PROJECTION_KEY);return;}
 const projection:any=compactResumeProjection(sessions,generatedPerformance(next));for(const [id,run] of active)projection.sessions[id].startedAt=run.startedAt;
 const raw=JSON.stringify(projection),frayerRaw=localStorage.getItem(NS+':frayers')??'';
 if(raw.length+frayerRaw.length>60000)throw Error('Portable LMS resume exceeds the 60,000-character save budget. Local browser work remains intact.');
 localStorage.setItem(PROJECTION_KEY,raw);
}
function enqueue(action:()=>Promise<void>){pending++;queue=queue.then(action).catch(e=>{failed=true;if(lms)scorm.failCourseSave(e);message(String(e));}).finally(()=>{pending--;});return queue;}
async function change(edit:(next:Saved)=>void){
 if(!ready)throw Error('Local saving is unavailable. Do not start until storage opens.');
 const next=structuredClone(state);edit(next);await commit(next);state=next;try{writeResumeProjection(next);failed=false;message('Saved in this browser. LMS resume projection updated when available.');}catch(e){failed=true;if(lms)scorm.failCourseSave(e);message(String(e));}
}
function current(section:HTMLElement){return state.current[section.dataset.activity!];}
type AnswerField=HTMLInputElement|HTMLSelectElement;
function answer(q:HTMLElement){const field=$<HTMLInputElement>('[data-answer]:checked',q)??$<AnswerField>('input[type=text][data-answer],select[data-answer]',q);return field?.value??'';}
function snapshot(run:Run,section:HTMLElement){
 for(const field of all<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[data-writing],input[type=text][data-answer],select[data-answer]',section))run.drafts[field.dataset.writing??field.id]=field.value;
 for(const field of all<HTMLInputElement>('input[type=radio]:checked',section))run.drafts[field.name]=field.value;
}
function attempted(run:Run,id:string){return run.attempts.filter(a=>a.question===id);}
function promptText(q:HTMLElement,writing:boolean){const copy=(writing?(q.querySelector('.paired-writing')??q):q).cloneNode(true) as HTMLElement;copy.querySelectorAll('input,select,textarea,button,label,output,[data-writing-status],[data-feedback],.muted').forEach(n=>n.remove());return copy.textContent?.replace(/\s+/g,' ').trim()??q.dataset.question!;}
const mode=(section:HTMLElement)=>section.dataset.activityMode??(section.dataset.activity==='lesson-check'?'paired':section.dataset.activity==='topic-review'?'writing':'drill');
const limit=(field:HTMLTextAreaElement)=>Number(field.dataset.answerLimit)||900;
function firstScore(run:Run){const ids=run.questionIds??[...new Set(run.attempts.filter(a=>a.correct!==null).map(a=>a.question))];const first=ids.map(id=>attempted(run,id)[0]).filter(a=>a&&a.correct!==null);return {correct:first.filter(a=>a.correct).length,total:first.length};}
function complete(run:Run,section:HTMLElement){
 return all('[data-question]',section).every(q=>{
  const id=q.dataset.question!,writing=$<HTMLTextAreaElement>('[data-writing]',q);
  const written=()=>writing&&attempted(run,writing.dataset.writing!).some(a=>a.answer===writing.value)&&writing.value.trim()&&writing.value.length<=limit(writing);
  if(mode(section)==='writing')return Boolean(written());
  if(mode(section)==='paired')return attempted(run,id).some(a=>a.correct)&&Boolean(written());
  return attempted(run,id).length>0;
 });
}
function progress(){const sections=all('[data-required-check]'),ids=sections.length?sections.map(s=>s.dataset.activity!):['lesson-check'];const done=ids.filter(id=>state.history.some(r=>r.activity===id)).length,percent=Math.round(done/ids.length*100);$('[data-progress-count]').textContent=`${done} of ${ids.length} chapter checks`;$('[data-progress-fraction]').textContent=`${done} / ${ids.length}`;$('[data-progress-percent]').textContent=percent+'%';$('[data-progress-fill]').style.width=percent+'%';for(const el of all<HTMLElement>('[data-lesson-completion]'))el.textContent=state.history.some(r=>r.activity===el.dataset.lessonCompletion)?'Check completed':'Check not completed';}
function render(){
 for(const section of all('[data-activity]')){
  const run=current(section);
  if(section.dataset.generatedPractice&&(!run||run.generatedSession)){renderGeneratedSection(section,run);continue;}
  $<HTMLButtonElement>('[data-start]',section).disabled=!ready||Boolean(run);$<HTMLFieldSetElement>('[data-run-body]',section).disabled=!run||Boolean(run.endedAt);const reset=section.querySelector<HTMLButtonElement>('[data-reset-run]');if(reset)reset.hidden=!run||Boolean(run.endedAt);
  $<HTMLButtonElement>('[data-submit-run]',section).disabled=!run||Boolean(run.endedAt);$('[data-redo]',section).hidden=!run?.endedAt;
  if(!run){if(reset){for(const field of all<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[data-writing],input[data-answer],select[data-answer]',section))field.value='';for(const field of all<HTMLInputElement>('input[type=radio]',section))field.checked=false;for(const feedback of all<HTMLElement>('[data-feedback]',section))feedback.textContent='';const summary=section.querySelector<HTMLElement>('[data-labeling-summary]');if(summary)summary.textContent=`Check one letter at a time, or check all ${all('[data-question]',section).length} together.`;$('[data-run-status]',section).textContent='';}continue;}
  for(const field of all<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[data-writing],input[type=text][data-answer],select[data-answer]',section)){
   const value=run.drafts[field.dataset.writing??field.id]??'';if(document.activeElement!==field)field.value=value;
  }
  for(const field of all<HTMLInputElement>('input[type=radio]',section))field.checked=run.drafts[field.name]===field.value;
  for(const q of all('[data-question]',section)){
   const tries=attempted(run,q.dataset.question!),last=tries.at(-1);const feedback=$('[data-feedback]',q);
   if(feedback)feedback.textContent=last?`${last.correct===null?'Self-report recorded':last.correct?'Correct':'Not correct yet'}. ${tries.length} attempt(s). ${mode(section)==='paired'?'First answer counts toward this run’s mark.':''}`:'';
   const gate=$<HTMLFieldSetElement>('[data-unlock]',q);if(gate)gate.disabled=Boolean(run.endedAt)||!tries.some(a=>a.correct);
   const writing=$<HTMLTextAreaElement>('[data-writing]',q);if(writing){const status=$('[data-writing-status]',q);const recorded=attempted(run,writing.dataset.writing!).at(-1);status.textContent=recorded?.answer===writing.value?'Written response saved; not automatically graded.':writing.value.length>limit(writing)?`Over ${limit(writing)} characters: draft retained, shorten before submitting.`:'';}
  }
  const labelingSummary=section.querySelector<HTMLElement>('[data-labeling-summary]');
  if(labelingSummary){const questions=all('[data-question]',section),latest=questions.map(q=>attempted(run,q.dataset.question!).at(-1)).filter(Boolean);const correct=latest.filter(a=>a?.correct).length,missing=questions.length-latest.length;labelingSummary.textContent=latest.length?`Latest checks: ${correct} of ${latest.length} correct.${missing?` ${missing} label${missing===1?' has':'s have'} not been checked yet.`:' Check any label again after changing it.'}`:`Check one letter at a time, or check all ${questions.length} together.`;}
  const score=firstScore(run);$('[data-run-status]',section).textContent=run.endedAt?`Completed. ${mode(section)==='paired'?`First-try mark: ${score.correct}/${score.total}. `:''}Elapsed: ${duration(run.endedAt-run.startedAt)}. Redo starts a new run and keeps this history.`:'In progress. Submit and finish stops the timer.';
 }
 progress();history();tick();
}
function tick(){for(const section of all('[data-activity]')){const output=section.querySelector<HTMLElement>('[data-timer]');if(!output)continue;const run=current(section),next=run?duration((run.endedAt??Date.now())-run.startedAt):'Not started';if(output.textContent!==next)output.textContent=next;}}
function history(){
 const summaries=all('[data-activity]').filter(s=>mode(s)==='paired').flatMap(s=>{const runs=state.history.filter(r=>r.activity===s.dataset.activity).map(firstScore);if(!runs.length)return[];const best=runs.reduce((a,b)=>b.correct/Math.max(b.total,1)>a.correct/Math.max(a.total,1)?b:a);return[`${s.querySelector('h2')?.textContent??s.dataset.activity}: best ${best.correct}/${best.total}`];});
 $('[data-collection-status]').textContent=`${state.history.length} completed run(s). ${summaries.join(' · ')}`;
 $('[data-history]').innerHTML=state.history.map(r=>`<article class="history-run"><h3>${esc(r.activity)} · ${new Date(r.startedAt).toLocaleString()}</h3><p>Elapsed ${duration(r.endedAt!-r.startedAt)} · ${r.attempts.length} submitted attempts</p><details><summary>Review every submitted answer</summary>${r.attempts.map((a,i)=>`<section><h4>Attempt ${i+1}: ${esc(a.question)}</h4><p>${esc(a.prompt)}</p>${a.displayedOptions?.length?`<p>Options shown: ${a.displayedOptions.map(esc).join(' · ')}</p>`:''}<pre>${esc(a.answer)}</pre>${a.correctAnswer?.length?`<p>Correct answer: ${a.correctAnswer.map(esc).join(' → ')}</p>`:''}<p>${a.correct===null?'Self-report or writing; not automatically graded':a.correct?'Correct':'Incorrect'} · ${duration(a.elapsedMs)} since start · ${new Date(a.at).toLocaleString()}</p></section>`).join('')}</details></article>`).join('')||'<p>No completed runs yet. In-progress work is preserved separately.</p>';
 $('[data-frayer-history]').innerHTML=frayers.map(f=>`<article><h3>${esc(wordData.words.find((w:any)=>w.id===f.id)?.term)}</h3><p>${f.collected?'Collected':'Draft'}</p>${f.answers.map(a=>`<p>${esc(a)}</p>`).join('')}</article>`).join('')||'<p>No words selected yet.</p>';
}
document.addEventListener('input',event=>{
 const field=event.target as HTMLInputElement|HTMLSelectElement,section=field.closest<HTMLElement>('[data-activity]');if(!section||!current(section)||current(section).endedAt)return;
 if(!field.matches('[data-writing],input[data-answer],select[data-answer]'))return;
 const id=section.dataset.activity!,value=field.value,key=field.dataset.writing??(field.type==='radio'?field.name:field.id);
 // Drafts, including oversized writing, are recoverable in the local database. They are not submitted answers.
 enqueue(async()=>{await change(next=>{next.current[id].drafts[key]=value;});if(field.matches('[data-writing]')){const max=limit(field as unknown as HTMLTextAreaElement);$('[data-writing-status]',field.closest('.question')!).textContent=value.length>max?`Over ${max} characters: draft saved locally, but not submitted. Shorten it to submit.`:`Draft saved locally · ${value.length}/${max} characters.`;}});
});
function requestPracticeReset(button:HTMLButtonElement){
 if(button.hasAttribute('data-reset-confirmed'))return true;
 const existing=button.parentElement?.querySelector<HTMLElement>('[data-practice-reset-confirmation]');
 if(existing){existing.querySelector<HTMLButtonElement>('button')?.focus();return false;}
 const panel=document.createElement('div');panel.dataset.practiceResetConfirmation='';panel.setAttribute('role','group');panel.setAttribute('aria-label','Confirm practice reset');
 const action=button.hasAttribute('data-generated-reset')?'data-generated-reset':'data-reset-run';
 panel.innerHTML=`<p>Clear this unfinished practice and return to the start screen? Previously completed work in All My Work will be kept.</p><div class="practice-reset-actions"><button type="button" ${action} data-reset-confirmed>Reset unfinished practice</button><button type="button" data-reset-cancel>Keep working</button></div>`;
 button.after(panel);
 panel.querySelector<HTMLButtonElement>('[data-reset-cancel]')!.addEventListener('click',()=>{panel.remove();button.focus();});
 panel.querySelector<HTMLButtonElement>('button')!.focus();return false;
}
document.addEventListener('click',event=>{
 const button=(event.target as Element).closest<HTMLButtonElement>('button'),section=button?.closest<HTMLElement>('[data-activity]');if(!button||!section)return;
 if(!button.matches('[data-start],[data-redo],[data-reset-run],[data-check],[data-check-labels],[data-self],[data-submit-writing],[data-submit-run]'))return;
 if(button.hasAttribute('data-reset-run')&&!requestPracticeReset(button))return;
 if(busy)return;busy=true;button.disabled=true;
 enqueue(async()=>{
  let succeeded=false;
  try{
   await change(next=>{
    const id=section.dataset.activity!;let run=next.current[id];
    if(button.hasAttribute('data-reset-run')){if(!run||run.endedAt)throw Error('There is no unfinished practice to reset.');delete next.current[id];return;}
    if(button.matches('[data-start],[data-redo]')){if(run&&!run.endedAt)throw Error('This activity already has a running timer.');next.current[id]={id:crypto.randomUUID(),activity:id,startedAt:Date.now(),drafts:{},attempts:[],questionIds:all('[data-question]',section).map(q=>q.dataset.question!),keys:structuredClone(catalog)};return;}
    if(!run||run.endedAt)throw Error('Start a new run first.');snapshot(run,section);
    if(button.matches('[data-submit-run]')){if(!complete(run,section))throw Error('Attempt every item first. For a paired check, correct each multiple-choice question and save its written response.');run.endedAt=Date.now();next.history.push(structuredClone(run));return;}
    if(button.hasAttribute('data-check-labels')){
     const keys=run.keys??catalog;let checked=0;
     for(const item of all<HTMLElement>('[data-question]',section)){const qid=item.dataset.question!,response=answer(item);if(!response.trim())continue;const original=keys.questions.find((a:any)=>a.id===qid)??catalog.questions.find((a:any)=>a.id===qid),drill=[...keys.blanks,...keys.labels].find((a:any)=>a.id===qid)??[...catalog.blanks,...catalog.labels].find((a:any)=>a.id===qid),inline=(item.dataset.answers??'').split('|').filter(Boolean),correct=inline.length?inline.some(a=>normalize(a)===normalize(response)):original?response===original.correct:Boolean(drill)&&drill.answers.some((a:string)=>normalize(a)===normalize(response));run.attempts.push({question:qid,answer:response,correct,at:Date.now(),elapsedMs:Date.now()-run.startedAt,prompt:promptText(item,false)});checked++;}
     if(!checked)throw Error('Choose at least one label first.');return;
    }
    const q=button.closest<HTMLElement>('[data-question]')!,qid=q.dataset.question!;let response='',correct:boolean|null=null,question=qid;
    if(button.matches('[data-submit-writing]')){
     const field=$<HTMLTextAreaElement>('[data-writing]',q);question=field.dataset.writing!;response=field.value;
     if(!response.trim()||response.length>limit(field))throw Error(`Write a response of 1–${limit(field)} characters. Your draft has not been removed.`);
     if(mode(section)==='paired'&&!attempted(run,qid).some(a=>a.correct))throw Error('Answer the multiple-choice question correctly first.');
    }else if(button.hasAttribute('data-self'))response=button.dataset.self!;
    else{
     response=answer(q);if(!response.trim())throw Error('Choose or enter an answer first.');
     const keys=run.keys??catalog,original=keys.questions.find((a:any)=>a.id===qid)??catalog.questions.find((a:any)=>a.id===qid),drill=[...keys.blanks,...keys.labels].find((a:any)=>a.id===qid)??[...catalog.blanks,...catalog.labels].find((a:any)=>a.id===qid),inline=(q.dataset.answers??'').split('|').filter(Boolean);
     correct=inline.length?inline.some(a=>normalize(a)===normalize(response)):original?response===original.correct:Boolean(drill)&&drill.answers.some((a:string)=>normalize(a)===normalize(response));
     if(original)response=q.querySelector<HTMLInputElement>('[data-answer]:checked')?.closest('label')?.textContent?.trim()??response;
    }
    run.attempts.push({question,answer:response,correct,at:Date.now(),elapsedMs:Date.now()-run.startedAt,prompt:promptText(q,button.matches('[data-submit-writing]'))});
   });succeeded=true;if(button.hasAttribute('data-reset-run'))for(const panel of all('[data-practice-reset-confirmation]',section))panel.remove();render();
  }finally{busy=false;button.disabled=false;if(succeeded)render();}
 });
});

function practiceOptions(select:HTMLSelectElement,kind?:PracticeKind){if(select.options.length)return;select.add(new Option('All Chapter 11','all',true,true));if(kind==='multiple-choice')select.add(new Option('Lessons 1–3 foundations','foundations'));for(const lesson of practiceBank.lessons){if(kind==='multiple-choice'&&lesson.optional)continue;select.add(new Option(lesson.label,lesson.id));}}
function generatedSummary(run:Run){
 const session=run.generatedSession!,graded=session.attempts.filter(a=>a.correct!==null),first=new Map<string,PracticeAttempt>();for(const attempt of graded)if(!first.has(attempt.itemId))first.set(attempt.itemId,attempt);
 const firstCorrect=[...first.values()].filter(x=>x.correct).length,eventualCorrect=new Set(graded.filter(x=>x.correct).map(x=>x.itemId)).size,self=session.attempts.filter(x=>x.correct===null),recalled=self.filter(x=>x.answer[0]==='recalled').length;
 const review=session.items.map(item=>{const tries=session.attempts.filter(x=>x.itemId===item.id);return `<article><h3>${esc(item.prompt)}</h3><p>${esc(item.explanation)}</p><p>${tries.length?tries.map((x,i)=>`Attempt ${i+1}: ${esc(x.answer.join(' → '))} — ${x.correct===null?'self-assessment':x.correct?'correct':'incorrect'}`).join('<br>'):'Not attempted'}</p></article>`;}).join('');
 return `<div class="practice-summary"><h2>Practice complete</h2>${graded.length?`<p>First try: ${firstCorrect}/${first.size}. After retries: ${eventualCorrect}/${first.size} answered correctly.</p>`:''}${self.length?`<p>Flash-card self-assessments: ${recalled} recalled; ${self.length-recalled} marked study again.</p>`:''}<div class="practice-summary-actions"><button type="button" data-generated-missed>Practice missed concepts</button><button type="button" data-generated-another>Start another set</button><button type="button" data-generated-review>Review my work</button></div><div class="practice-review" data-generated-review-panel hidden>${review}</div></div>`;
}
function renderGeneratedSection(section:HTMLElement,run?:Run){
 const setup=$<HTMLElement>('[data-practice-setup]',section),host=$<HTMLElement>('[data-generated-host]',section);for(const legacy of all<HTMLElement>('[data-legacy-practice]',section))legacy.hidden=true;
 const lesson=$<HTMLSelectElement>('[data-practice-lesson]',setup);practiceOptions(lesson,section.dataset.generatedPractice as PracticeKind);
 if(!run){setup.hidden=false;host.replaceChildren();$<HTMLButtonElement>('[data-generated-start]',setup).disabled=!ready;return;}
 setup.hidden=true;const session=run.generatedSession!;
 if(run.endedAt){host.innerHTML=generatedSummary(run);return;}
 const item=session.items[session.position];if(!item){host.innerHTML='<p>This set could not be restored. Its saved record has been retained in this browser.</p>';return;}
 host.innerHTML=`<div class="practice-run-bar"><p><strong>Resume saved set:</strong> ${esc(practiceBank.lessons.find(x=>x.id===session.settings.lessonId)?.label??'All Chapter 11 lessons')} · ${session.items.length} items</p><button type="button" class="practice-reset" data-generated-reset>Stop and reset</button></div>${renderGeneratedItem(item,session.position,session.items.length,session.attempts)}`;
 if(session.feedback==='answer'){const panel=$<HTMLElement>('[data-generated-reveal-panel]',host);if(panel)panel.hidden=false;}
}
function generatedAnswer(root:HTMLElement,item:GeneratedSession['items'][number]){const typed=root.querySelector<HTMLInputElement>('input[type=text][data-generated-answer]');if(typed)return[typed.value];if(item.interaction==='ordering')return all<HTMLSelectElement>('[data-generated-answer]',root).map(x=>x.value);return all<HTMLInputElement>('[data-generated-answer]:checked',root).map(x=>x.value);}
function startGenerated(section:HTMLElement,missedOnly=false){return change(next=>{
 const id=section.dataset.activity!,prior=next.current[id];if(prior&&!prior.endedAt)throw Error('Resume the unfinished set before changing setup options.');
 const kind=section.dataset.generatedPractice as PracticeKind,lesson=$<HTMLSelectElement>('[data-practice-lesson]',section)?.value||prior?.generatedSession?.settings.lessonId||'all',count=Number($<HTMLSelectElement>('[data-practice-count]',section)?.value||prior?.generatedSession?.settings.count||10) as 5|10|15|20,difficulty=($<HTMLSelectElement>('[data-practice-difficulty]',section)?.value||prior?.generatedSession?.settings.difficulty||'mixed') as 'foundation'|'developing'|'application'|'mixed';
 const evidence=generatedPerformance(next),avoid=(prior?.generatedSession?.items??[]).map(x=>x.id),seed=crypto.getRandomValues(new Uint32Array(1))[0];let session=generatePracticeSession(practiceBank,kind,{lessonId:lesson,count,difficulty},seed,evidence,avoid);
 if(missedOnly&&prior?.generatedSession){const missed=new Set(prior.generatedSession.attempts.filter(x=>x.correct===false).map(x=>prior.generatedSession!.items.find(i=>i.id===x.itemId)?.conceptId).filter(Boolean));const focused=session.items.filter(x=>missed.has(x.conceptId));if(focused.length)session.items=focused.slice(0,count);}
 next.current[id]={id:crypto.randomUUID(),activity:id,startedAt:Date.now(),drafts:{},attempts:[],questionIds:session.items.map(x=>x.id),generatedSession:session};
 });}
document.addEventListener('click',event=>{
 const button=(event.target as Element).closest<HTMLButtonElement>('[data-generated-start],[data-generated-reset],[data-generated-reveal],[data-generated-self],[data-generated-check],[data-generated-next],[data-generated-missed],[data-generated-another],[data-generated-review]');if(!button)return;const section=button.closest<HTMLElement>('[data-generated-practice]');if(!section)return;event.preventDefault();event.stopPropagation();
 if(button.hasAttribute('data-generated-review')){const panel=$<HTMLElement>('[data-generated-review-panel]',section);panel.hidden=!panel.hidden;return;}
 if(button.hasAttribute('data-generated-reset')&&!requestPracticeReset(button))return;
 const visibleSession=current(section)?.generatedSession,visibleItem=visibleSession?.items[visibleSession.position],domInteraction=section.querySelector('[data-practice-order]')?'ordering':'single',submittedAnswer=button.hasAttribute('data-generated-self')?[button.dataset.generatedSelf!]:button.hasAttribute('data-generated-check')?generatedAnswer(section,visibleItem??({interaction:domInteraction} as any)):[];
 enqueue(async()=>{
  if(button.hasAttribute('data-generated-reset')){await change(next=>{const id=section.dataset.activity!,run=next.current[id];if(!run||run.endedAt)throw Error('There is no unfinished practice to reset.');delete next.current[id];});render();return;}
  if(button.hasAttribute('data-generated-start')||button.hasAttribute('data-generated-another')||button.hasAttribute('data-generated-missed')){await startGenerated(section,button.hasAttribute('data-generated-missed'));render();return;}
  if(button.hasAttribute('data-generated-reveal')){await change(next=>{next.current[section.dataset.activity!].generatedSession!.feedback='answer';});render();return;}
  await change(next=>{
   const run=next.current[section.dataset.activity!]!,session=run.generatedSession!,item=session.items[session.position];
   if(button.hasAttribute('data-generated-next')){if(session.position===session.items.length-1){run.endedAt=Date.now();next.history.push(structuredClone(run));}else{session.position++;session.feedback='none';}return;}
   if(visibleItem&&visibleItem.id!==item.id)throw Error('The saved item changed before this answer was recorded. Review the visible item and try again.');const answer=submittedAnswer;if(!answer.length||answer.some(x=>!x.trim()))throw Error('Complete an answer before checking.');
   const prior=session.attempts.filter(x=>x.itemId===item.id),correct=item.interaction==='flashcard'?null:gradeGeneratedItem(item,answer),attempt={itemId:item.id,answer,correct,attemptNumber:prior.length+1,at:Date.now(),firstTry:prior.length===0};session.attempts.push(attempt);session.feedback=correct||correct===null||prior.length>=1?'answer':'cue';
   run.attempts.push({question:item.id,answer:answer.join(' → '),correct,at:Date.now(),elapsedMs:Date.now()-run.startedAt,prompt:item.prompt,conceptId:item.conceptId,skill:item.skill,difficulty:item.difficulty,generatedItemId:item.id,firstTry:attempt.firstTry,displayedOptions:item.options,correctAnswer:item.answers});
   if(correct===false&&prior.length===1&&session.position+3<session.items.length){const reserve=generatePracticeSession(practiceBank,session.kind,session.settings,session.seed+session.position+1,session.startedWithEvidence,session.items.map(x=>x.id)).items.find(x=>x.conceptId===item.conceptId&&x.family!==item.family);if(reserve){const at=session.position+3,old=session.items[at];session.items[at]=reserve;session.adaptations.push({triggerItemId:item.id,replacementItemId:reserve.id,at});run.questionIds![at]=reserve.id;}}
  });render();
 });
},{capture:true});

const wordPayload=JSON.parse($('#pilot3-words').textContent!),wordData=wordPayload.data,wordSchema=wordPayload.schema;
let frayers:WordFrayerState=[],frayerError=false,frayerMessage='Saved in this browser.',frayerBaseline:string|null=null;
try{const raw=localStorage.getItem(NS+':frayers');frayerBaseline=raw;if(raw)frayers=unpackWordFrayers(JSON.parse(raw),wordSchema);}catch{frayerError=true;message('Existing vocabulary save could not be read. It has not been overwritten.');}
mountWordFrayerControls(document.body,wordData,wordSchema,{
 get:()=>frayers,set:slots=>{frayers=slots;},save:()=>{
  try{if(frayerError)throw Error('Existing vocabulary data needs recovery before saving.');if(localStorage.getItem(NS+':frayers')!==frayerBaseline)throw Error('Another tab changed these Frayers. Copy your drafts before reloading.');const payload=JSON.stringify(packWordFrayers(frayers,wordSchema));if(payload.length>44000)throw Error('Vocabulary exceeds the save budget.');localStorage.setItem(NS+':frayers',payload);frayerBaseline=payload;if(lms&&ready)publishLms();frayerMessage=lms?'Vocabulary stored; waiting for Brightspace confirmation.':'Saved in this browser.';history();return{saved:true,message:frayerMessage};}
  catch(e){frayerMessage=String(e)+' Drafts remain visible; copy before leaving.';failed=true;if(lms)scorm.failCourseSave(e);return{saved:false,message:frayerMessage};}
 }
});
mountVocabularyPanel({root:document.body,families:wordData.categories.map((c:any)=>({id:c.id,label:c.label,meaning:'',wordAnalysis:[],routes:['lesson-01']})),terms:wordData.words.map((w:any)=>({term:w.term,definition:w.definition,familyIds:w.categoryIds})),words:wordData.words,wordFrayers:Object.fromEntries(wordData.words.map((w:any)=>[w.id,w.id])),sections:()=>[],route:()=> 'lesson-01',unlocked:()=>true,frayer:id=>$(`[data-word-frayer="${CSS.escape(id)}"]`),refresh:()=>{},status:()=>frayerMessage});
// The canonical reader owns visible teaching. A Studio edit must also appear in the popup.
function syncPopup(){const dialog=$<HTMLDialogElement>('dialog.bio-vocabulary');if(!dialog.open)return;const shown=$<HTMLElement>('[data-biology-word-details]',dialog);if(!shown)return;const canonical=$(`[data-biology-word-view="${CSS.escape(shown.dataset.biologyWordDetails!)}"] [data-biology-word-details]`);if(canonical)$('[data-bio-meaning]',dialog).replaceChildren(canonical.cloneNode(true));$('[data-bio-locked]',dialog).textContent='The same word-owned Frayer as Core Vocabulary. Choose up to eight words.';}
document.addEventListener('click',event=>{if((event.target as Element).closest('[data-bio-term]'))syncPopup();});
$('[data-bio-family]').addEventListener('change',syncPopup);

function mountLabelingLibrary(){const page=$<HTMLElement>('#labeling-practice'),select=$<HTMLSelectElement>('[data-labeling-select]',page),cards=all<HTMLElement>('[data-labeling-card]',page);const show=()=>{const chosen=cards.find(card=>card.id===select.value)??cards[0];for(const card of cards)card.hidden=card!==chosen;select.setAttribute('aria-controls',chosen.id);};select.addEventListener('change',show);show();}
function showVideos(root:ParentNode){for(const section of all<HTMLElement>('[data-video]',root)){if(section.closest<HTMLElement>('[data-video-library-item]')?.hidden)continue;const control=section.querySelector<HTMLButtonElement>('[data-load-video]');if(control)control.hidden=true;const slot=$<HTMLElement>('[data-video-slot]',section);if(slot.querySelector('iframe'))continue;const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+section.dataset.video;frame.title=section.querySelector('h2,h3')?.textContent?.trim()??'Lesson video';frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.loading='lazy';frame.referrerPolicy='strict-origin-when-cross-origin';slot.replaceChildren(frame);}}
function mountVideoLibrary(){const page=$<HTMLElement>('#video-library'),select=$<HTMLSelectElement>('[data-video-library-select]',page),items=all<HTMLElement>(':scope > .p2-topic > .content-section',page).filter(item=>item.querySelector('[data-video]'));const groups=new Map<string,HTMLOptGroupElement>();select.replaceChildren();items.forEach((item,index)=>{item.dataset.videoLibraryItem=String(index);item.hidden=index!==0;if(index===0)item.id='video-library-card';const title=item.querySelector('h3')?.textContent?.trim()??`Video ${index+1}`,lesson=item.querySelector<HTMLAnchorElement>('a[href^="#lesson-"]')?.textContent?.replace(/^Return to\s+/,'').trim()??'Chapter 11';let group=groups.get(lesson);if(!group){group=document.createElement('optgroup');group.label=lesson;groups.set(lesson,group);select.append(group);}const option=document.createElement('option');option.value=String(index);option.textContent=title;group.append(option);});select.addEventListener('change',()=>{const chosen=items[Number(select.value)]??items[0];for(const item of items){const active=item===chosen;item.hidden=!active;if(!active)item.querySelector('iframe')?.remove();}chosen.id='video-library-card';for(const item of items)if(item!==chosen)item.removeAttribute('id');showVideos(chosen);});}
mountLabelingLibrary();mountVideoLibrary();
function route(){let id=location.hash.slice(1)||'overview';if(!all('.course-page').some(p=>p.id===id))id='overview';for(const page of all('.course-page'))page.hidden=page.id!==id;const page=$('#'+CSS.escape(id));if(document.readyState==='complete')showVideos(page);else window.addEventListener('load',()=>setTimeout(()=>showVideos(page),0),{once:true});for(const link of all<HTMLAnchorElement>('.nav-link')){const active=link.hash==='#'+id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}document.body.classList.remove('nav-open');requestAnimationFrame(()=>window.scrollTo(0,0));history();}
window.addEventListener('hashchange',route);route();
const textbookDialog=$<HTMLDialogElement>('[data-textbook-dialog]');let textbookReturnFocus:HTMLElement|null=null;
for(const link of all<HTMLAnchorElement>('[data-book-page]'))link.setAttribute('aria-haspopup','dialog');
function openTextbookPage(link:HTMLElement){const pdfPage=Number(link.dataset.bookPage);if(!Number.isInteger(pdfPage)||pdfPage<1)return;const printedPage=pdfPage+359,externalSrc='assets/textbook/chapter-11.pdf#page='+pdfPage,readerSrc=`assets/textbook/chapter-11.pdf?readerPage=${pdfPage}#page=${pdfPage}`;textbookReturnFocus=link;$('[data-textbook-dialog-title]').textContent='Textbook page '+printedPage;$('[data-textbook-dialog-meta]').textContent=`Chapter 11 · PDF page ${pdfPage} of 44`;$<HTMLIFrameElement>('[data-textbook-dialog-frame]').src=readerSrc;$<HTMLAnchorElement>('[data-textbook-dialog-external]').href=externalSrc;textbookDialog.showModal();document.documentElement.style.overflow='hidden';$<HTMLButtonElement>('[data-textbook-close]').focus({preventScroll:true});}
textbookDialog.addEventListener('close',()=>{document.documentElement.style.overflow='';textbookReturnFocus?.focus({preventScroll:true});textbookReturnFocus=null;});
const linkedWord=new URLSearchParams(location.search).get('word');
if(linkedWord&&wordData.words.some((w:any)=>w.id===linkedWord))$<HTMLButtonElement>(`[data-biology-select-word="${CSS.escape(linkedWord)}"]`)?.click();
document.addEventListener('click',event=>{
 const target=(event.target as Element).closest<HTMLElement>('[data-book-page],[data-textbook-close],[data-load-video],[data-sidebar-toggle],[data-menu-button],[data-print],[data-save-exit]');if(!target)return;
 if(target.hasAttribute('data-book-page')){event.preventDefault();openTextbookPage(target);}
 if(target.hasAttribute('data-textbook-close'))textbookDialog.close();
 if(target.hasAttribute('data-load-video'))showVideos(target.closest<HTMLElement>('[data-video]')!);
 if(target.hasAttribute('data-sidebar-toggle')){document.body.classList.toggle('sidebar-collapsed');target.setAttribute('aria-expanded',String(!document.body.classList.contains('sidebar-collapsed')));}
 if(target.hasAttribute('data-menu-button')){document.body.classList.toggle('nav-open');target.setAttribute('aria-expanded',String(document.body.classList.contains('nav-open')));}
 if(target.hasAttribute('data-print'))window.print();
 if(target.hasAttribute('data-save-exit'))enqueue(async()=>{if(failed)throw Error('Some writing has not saved. Copy your visible drafts before leaving.');message('Saved locally. You can now close this tab. Print or save completed work as a PDF before clearing browser data.');location.hash='overview';});
});
window.addEventListener('beforeunload',event=>{if(failed||busy||pending){event.preventDefault();event.returnValue='';}});
setInterval(tick,1000);open().catch(e=>{failed=true;if(lms)scorm.failCourseSave(e);message('Saving unavailable: '+e+'. Existing work was not changed.');});
