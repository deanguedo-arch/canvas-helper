import {mountWordFrayerControls} from '../biology30-vocabulary/word-frayer-runtime.js';
import {packWordFrayers,unpackWordFrayers,type WordFrayerState} from '../biology30-vocabulary/word-frayer-state.js';
import {mountVocabularyPanel} from '../biology30-vocabulary/panel.js';

const NS='biology30-unit-a-pilot-3:v1';
const $=<T extends HTMLElement=HTMLElement>(s:string,r:ParentNode=document)=>r.querySelector<T>(s)!;
const all=<T extends HTMLElement=HTMLElement>(s:string,r:ParentNode=document)=>Array.from(r.querySelectorAll<T>(s));
const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
type Attempt={question:string;answer:string;correct:boolean|null;at:number;elapsedMs:number;prompt:string};
type Run={id:string;activity:string;startedAt:number;endedAt?:number;drafts:Record<string,string>;attempts:Attempt[];questionIds?:string[];keys?:typeof catalog};
type Saved={version:1;revision:number;current:Record<string,Run>;history:Run[]};
let state:Saved={version:1,revision:0,current:{},history:[]},db:IDBDatabase,ready=false,busy=false,failed=false;
let queue=Promise.resolve(),pending=0;
const catalog=(window as any).PILOT3_CATALOG;
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
 if(existing)await connect();
 const saved=db?await storageRequest(db.transaction('work').objectStore('work').get('state')):null;
 if(saved){if(saved.version!==1||!saved.current||!Array.isArray(saved.history))throw Error('Unrecognized save. Existing record retained.');state=saved;}
 ready=true;message('Saved work opened. Local browser only; download a backup before changing devices.');render();
}
async function commit(next:Saved){
 if(!db)await connect();
 return new Promise<void>((resolve,reject)=>{
  const tx=db.transaction('work','readwrite'),store=tx.objectStore('work'),read=store.get('state');let conflict=false;
  read.onsuccess=()=>{if((read.result?.revision??0)!==state.revision){conflict=true;tx.abort();return;}try{next.revision=state.revision+1;store.put(next,'state');}catch{tx.abort();}};
  tx.oncomplete=()=>resolve();tx.onabort=()=>reject(Error(conflict?'Another tab changed this work. Download your visible drafts, then reload.':'Saving failed. Your drafts remain visible; download them before leaving.'));tx.onerror=()=>{};
 });
}
function enqueue(action:()=>Promise<void>){pending++;queue=queue.then(action).catch(e=>{failed=true;message(String(e));}).finally(()=>{pending--;});return queue;}
async function change(edit:(next:Saved)=>void){
 if(!ready)throw Error('Local saving is unavailable. Do not start until storage opens.');
 const next=structuredClone(state);edit(next);await commit(next);state=next;failed=false;message('Saved in this browser. Not sent to Brightspace.');
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
function progress(){const sections=all('[data-required-check]'),ids=sections.length?sections.map(s=>s.dataset.activity!):['lesson-check'];const done=ids.filter(id=>state.history.some(r=>r.activity===id)).length,percent=Math.round(done/ids.length*100);$('[data-progress-count]').textContent=`${done} of ${ids.length} chapter checks`;$('[data-progress-fraction]').textContent=`${done} / ${ids.length}`;$('[data-progress-percent]').textContent=percent+'%';$('[data-progress-fill]').style.width=percent+'%';}
function render(){
 for(const section of all('[data-activity]')){
  const run=current(section);$<HTMLButtonElement>('[data-start]',section).disabled=!ready||Boolean(run);$<HTMLFieldSetElement>('[data-run-body]',section).disabled=!run||Boolean(run.endedAt);
  $<HTMLButtonElement>('[data-submit-run]',section).disabled=!run||Boolean(run.endedAt);$('[data-redo]',section).hidden=!run?.endedAt;
  if(!run)continue;
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
function tick(){for(const section of all('[data-activity]')){const run=current(section),next=run?duration((run.endedAt??Date.now())-run.startedAt):'Not started',output=$('[data-timer]',section);if(output.textContent!==next)output.textContent=next;}}
function history(){
 const summaries=all('[data-activity]').filter(s=>mode(s)==='paired').flatMap(s=>{const runs=state.history.filter(r=>r.activity===s.dataset.activity).map(firstScore);if(!runs.length)return[];const best=runs.reduce((a,b)=>b.correct/Math.max(b.total,1)>a.correct/Math.max(a.total,1)?b:a);return[`${s.querySelector('h2')?.textContent??s.dataset.activity}: best ${best.correct}/${best.total}`];});
 $('[data-collection-status]').textContent=`${state.history.length} completed run(s). ${summaries.join(' · ')}`;
 $('[data-history]').innerHTML=state.history.map(r=>`<article class="history-run"><h3>${esc(r.activity)} · ${new Date(r.startedAt).toLocaleString()}</h3><p>Elapsed ${duration(r.endedAt!-r.startedAt)} · ${r.attempts.length} submitted attempts</p><details><summary>Review every submitted answer</summary>${r.attempts.map((a,i)=>`<section><h4>Attempt ${i+1}: ${esc(a.question)}</h4><p>${esc(a.prompt)}</p><pre>${esc(a.answer)}</pre><p>${a.correct===null?'Self-report or writing; not automatically graded':a.correct?'Correct':'Incorrect'} · ${duration(a.elapsedMs)} since start · ${new Date(a.at).toLocaleString()}</p></section>`).join('')}</details></article>`).join('')||'<p>No completed runs yet. In-progress work is preserved separately.</p>';
 $('[data-frayer-history]').innerHTML=frayers.map(f=>`<article><h3>${esc(wordData.words.find((w:any)=>w.id===f.id)?.term)}</h3><p>${f.collected?'Collected':'Draft'}</p>${f.answers.map(a=>`<p>${esc(a)}</p>`).join('')}</article>`).join('')||'<p>No words selected yet.</p>';
}
document.addEventListener('input',event=>{
 const field=event.target as HTMLInputElement|HTMLSelectElement,section=field.closest<HTMLElement>('[data-activity]');if(!section||!current(section)||current(section).endedAt)return;
 if(!field.matches('[data-writing],input[data-answer],select[data-answer]'))return;
 const id=section.dataset.activity!,value=field.value,key=field.dataset.writing??(field.type==='radio'?field.name:field.id);
 // Drafts, including oversized writing, are recoverable in the local database. They are not submitted answers.
 enqueue(async()=>{await change(next=>{next.current[id].drafts[key]=value;});if(field.matches('[data-writing]')){const max=limit(field as unknown as HTMLTextAreaElement);$('[data-writing-status]',field.closest('.question')!).textContent=value.length>max?`Over ${max} characters: draft saved locally, but not submitted. Shorten it to submit.`:`Draft saved locally · ${value.length}/${max} characters.`;}});
});
document.addEventListener('click',event=>{
 const button=(event.target as Element).closest<HTMLButtonElement>('button'),section=button?.closest<HTMLElement>('[data-activity]');if(!button||!section)return;
 if(!button.matches('[data-start],[data-redo],[data-check],[data-check-labels],[data-self],[data-submit-writing],[data-submit-run]'))return;
 if(busy)return;busy=true;button.disabled=true;
 enqueue(async()=>{
  let succeeded=false;
  try{
   await change(next=>{
    const id=section.dataset.activity!;let run=next.current[id];
    if(button.matches('[data-start],[data-redo]')){if(run&&!run.endedAt)throw Error('This activity already has a running timer.');next.current[id]={id:crypto.randomUUID(),activity:id,startedAt:Date.now(),drafts:{},attempts:[],questionIds:all('[data-question]',section).map(q=>q.dataset.question!),keys:structuredClone(catalog)};return;}
    if(!run||run.endedAt)throw Error('Start a new run first.');snapshot(run,section);
    if(button.matches('[data-submit-run]')){if(!complete(run,section))throw Error('Attempt every item first. For a paired check, correct each multiple-choice question and save its written response.');run.endedAt=Date.now();next.history.push(structuredClone(run));return;}
    if(button.hasAttribute('data-check-labels')){
     const keys=run.keys??catalog;let checked=0;
     for(const item of all<HTMLElement>('[data-question]',section)){const qid=item.dataset.question!,response=answer(item);if(!response.trim())continue;const original=keys.questions.find((a:any)=>a.id===qid)??catalog.questions.find((a:any)=>a.id===qid),drill=[...keys.blanks,...keys.labels].find((a:any)=>a.id===qid)??[...catalog.blanks,...catalog.labels].find((a:any)=>a.id===qid),correct=original?response===original.correct:Boolean(drill)&&drill.answers.some((a:string)=>normalize(a)===normalize(response));run.attempts.push({question:qid,answer:response,correct,at:Date.now(),elapsedMs:Date.now()-run.startedAt,prompt:promptText(item,false)});checked++;}
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
     const keys=run.keys??catalog,original=keys.questions.find((a:any)=>a.id===qid)??catalog.questions.find((a:any)=>a.id===qid),drill=[...keys.blanks,...keys.labels].find((a:any)=>a.id===qid)??[...catalog.blanks,...catalog.labels].find((a:any)=>a.id===qid);
     correct=original?response===original.correct:Boolean(drill)&&drill.answers.some((a:string)=>normalize(a)===normalize(response));
     if(original)response=q.querySelector<HTMLInputElement>('[data-answer]:checked')?.closest('label')?.textContent?.trim()??response;
    }
    run.attempts.push({question,answer:response,correct,at:Date.now(),elapsedMs:Date.now()-run.startedAt,prompt:promptText(q,button.matches('[data-submit-writing]'))});
   });succeeded=true;render();
  }finally{busy=false;button.disabled=false;if(succeeded)render();}
 });
});

const wordPayload=JSON.parse($('#pilot3-words').textContent!),wordData=wordPayload.data,wordSchema=wordPayload.schema;
let frayers:WordFrayerState=[],frayerError=false,frayerMessage='Saved in this browser.',frayerBaseline:string|null=null;
try{const raw=localStorage.getItem(NS+':frayers');frayerBaseline=raw;if(raw)frayers=unpackWordFrayers(JSON.parse(raw),wordSchema);}catch{frayerError=true;message('Existing vocabulary save could not be read. It has not been overwritten.');}
mountWordFrayerControls(document.body,wordData,wordSchema,{
 get:()=>frayers,set:slots=>{frayers=slots;},save:()=>{
  try{if(frayerError)throw Error('Existing vocabulary data needs recovery before saving.');if(localStorage.getItem(NS+':frayers')!==frayerBaseline)throw Error('Another tab changed these Frayers. Copy your drafts before reloading.');const payload=JSON.stringify(packWordFrayers(frayers,wordSchema));if(payload.length>44000)throw Error('Vocabulary exceeds the save budget.');localStorage.setItem(NS+':frayers',payload);frayerBaseline=payload;frayerMessage='Saved in this browser.';history();return{saved:true,message:frayerMessage};}
  catch(e){frayerMessage=String(e)+' Drafts remain visible; copy before leaving.';failed=true;return{saved:false,message:frayerMessage};}
 }
});
mountVocabularyPanel({root:document.body,families:wordData.categories.map((c:any)=>({id:c.id,label:c.label,meaning:'',wordAnalysis:[],routes:['lesson-01']})),terms:wordData.words.map((w:any)=>({term:w.term,definition:w.definition,familyIds:w.categoryIds})),words:wordData.words,wordFrayers:Object.fromEntries(wordData.words.map((w:any)=>[w.id,w.id])),sections:()=>[],route:()=> 'lesson-01',unlocked:()=>true,frayer:id=>$(`[data-word-frayer="${CSS.escape(id)}"]`),refresh:()=>{},status:()=>frayerMessage});
// The canonical reader owns visible teaching. A Studio edit must also appear in the popup.
function syncPopup(){const dialog=$<HTMLDialogElement>('dialog.bio-vocabulary');if(!dialog.open)return;const shown=$<HTMLElement>('[data-biology-word-details]',dialog);if(!shown)return;const canonical=$(`[data-biology-word-view="${CSS.escape(shown.dataset.biologyWordDetails!)}"] [data-biology-word-details]`);if(canonical)$('[data-bio-meaning]',dialog).replaceChildren(canonical.cloneNode(true));$('[data-bio-locked]',dialog).textContent='The same word-owned Frayer as Core Vocabulary. Choose up to eight words.';}
document.addEventListener('click',event=>{if((event.target as Element).closest('[data-bio-term]'))syncPopup();});
$('[data-bio-family]').addEventListener('change',syncPopup);

function showVideos(root:ParentNode){for(const section of all<HTMLElement>('[data-video]',root)){const control=section.querySelector<HTMLButtonElement>('[data-load-video]');if(control)control.hidden=true;const slot=$<HTMLElement>('[data-video-slot]',section);if(slot.querySelector('iframe'))continue;const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+section.dataset.video;frame.title=section.querySelector('h2,h3')?.textContent?.trim()??'Lesson video';frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.loading='lazy';frame.referrerPolicy='strict-origin-when-cross-origin';slot.replaceChildren(frame);}}
function route(){let id=location.hash.slice(1)||'overview';if(!all('.course-page').some(p=>p.id===id))id='overview';for(const page of all('.course-page'))page.hidden=page.id!==id;const page=$('#'+CSS.escape(id));if(document.readyState==='complete')showVideos(page);else window.addEventListener('load',()=>setTimeout(()=>showVideos(page),0),{once:true});for(const link of all<HTMLAnchorElement>('.nav-link')){const active=link.hash==='#'+id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}document.body.classList.remove('nav-open');requestAnimationFrame(()=>window.scrollTo(0,0));history();}
window.addEventListener('hashchange',route);route();
const textbookDialog=$<HTMLDialogElement>('[data-textbook-dialog]');let textbookReturnFocus:HTMLElement|null=null;
for(const link of all<HTMLAnchorElement>('[data-book-page]'))link.setAttribute('aria-haspopup','dialog');
function openTextbookPage(link:HTMLElement){const pdfPage=Number(link.dataset.bookPage);if(!Number.isInteger(pdfPage)||pdfPage<1)return;const printedPage=pdfPage+359,externalSrc='assets/textbook/chapter-11.pdf#page='+pdfPage,readerSrc=`assets/textbook/chapter-11.pdf?readerPage=${pdfPage}#page=${pdfPage}`;textbookReturnFocus=link;$('[data-textbook-dialog-title]').textContent='Textbook page '+printedPage;$('[data-textbook-dialog-meta]').textContent=`Chapter 11 · PDF page ${pdfPage} of 44`;$<HTMLIFrameElement>('[data-textbook-dialog-frame]').src=readerSrc;$<HTMLAnchorElement>('[data-textbook-dialog-external]').href=externalSrc;textbookDialog.showModal();document.documentElement.style.overflow='hidden';$<HTMLButtonElement>('[data-textbook-close]').focus({preventScroll:true});}
textbookDialog.addEventListener('close',()=>{document.documentElement.style.overflow='';textbookReturnFocus?.focus({preventScroll:true});textbookReturnFocus=null;});
const linkedWord=new URLSearchParams(location.search).get('word');
if(linkedWord&&wordData.words.some((w:any)=>w.id===linkedWord))$<HTMLButtonElement>(`[data-biology-select-word="${CSS.escape(linkedWord)}"]`)?.click();
document.addEventListener('click',event=>{
 const target=(event.target as Element).closest<HTMLElement>('[data-book-page],[data-textbook-close],[data-load-video],[data-sidebar-toggle],[data-menu-button],[data-download],[data-print],[data-save-exit]');if(!target)return;
 if(target.hasAttribute('data-book-page')){event.preventDefault();openTextbookPage(target);}
 if(target.hasAttribute('data-textbook-close'))textbookDialog.close();
 if(target.hasAttribute('data-load-video'))showVideos(target.closest<HTMLElement>('[data-video]')!);
 if(target.hasAttribute('data-sidebar-toggle')){document.body.classList.toggle('sidebar-collapsed');target.setAttribute('aria-expanded',String(!document.body.classList.contains('sidebar-collapsed')));}
 if(target.hasAttribute('data-menu-button')){document.body.classList.toggle('nav-open');target.setAttribute('aria-expanded',String(document.body.classList.contains('nav-open')));}
 if(target.hasAttribute('data-print'))window.print();
 if(target.hasAttribute('data-download'))download();
 if(target.hasAttribute('data-save-exit'))enqueue(async()=>{if(failed)throw Error('Some writing has not saved. Download your collection and visible drafts before leaving.');message('Saved locally. You can now close this tab; download a backup before clearing browser data.');location.hash='overview';});
});
function download(){const payload={course:NS,exportedAt:new Date().toISOString(),state,frayers,visibleDrafts:all<HTMLTextAreaElement|HTMLInputElement>('[data-writing],input[type=text][data-answer],textarea[data-word-answer]').map(f=>({id:f.dataset.writing??f.id,word:f.closest<HTMLElement>('[data-word-frayer]')?.dataset.wordFrayer,field:f.dataset.wordAnswer,value:f.value}))};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='biology30-pilot3-process-collection.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
window.addEventListener('beforeunload',event=>{if(failed||busy||pending){event.preventDefault();event.returnValue='';}});
setInterval(tick,1000);open().catch(e=>{failed=true;message('Saving unavailable: '+e+'. Existing work was not changed.');});
