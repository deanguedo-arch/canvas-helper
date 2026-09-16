/* The Engine — Phase 1. Standalone, dependency-free learning edition.
   No SCORM calls, analytics, network saving, or grade submission.
   Source-derived lesson/assignment content; local study records only. */
(() => {
'use strict';
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>Array.from(p.querySelectorAll(s));
const meta=JSON.parse($('#page-meta').textContent);
const KEY='canvas-helper:sportswellness-phase-1:state';
const sections=$$('.chapter-section:not([data-support-route])'), routeSections=$$('.chapter-section'), sectionIds=new Set(sections.map(x=>x.id)), routeIds=new Set(routeSections.map(x=>x.id));
const fields=$$('[data-draft]'), fieldMap=new Map(fields.map(x=>[x.dataset.draft,x]));
const checks=$$('[data-check]'), checkMap=new Map(checks.map(x=>[x.dataset.check,x]));
const ratingKeys=['reset','arousal','attention','confidence','integration'];
const root=document.documentElement;
let storageOK=false, saveTimer=null, pending=false, mobileOpen=false, desktopCollapsed=false, reviewedTotal=0;
let printing=false, lastDialogTrigger=null;
const mobile=matchMedia('(max-width:760px)');
const fresh=()=>({version:2,courseId:meta.courseId,drafts:{},noteEntries:[],reviewed:{},topic:'start',question:0,buildStep:0,ratings:{},practice:{},firstChecks:{},revealed:{},appraisal:null,lab:{round:0,attempts:[],locked:false,last:null},checkpoint:{contentVersion:'phase1-checkpoint-2026-09-14-r1',selections:{},attempts:[],bestScore:null,lastSubmittedFingerprint:null},game:{attempts:[],interrupted:null},untimedPractice:{strategy:'',reflection:''},gameDebrief:'',updatedAt:null});
const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const str=(x,n=5000)=>typeof x==='string'?x.slice(0,n):'';
const int=(v,min,max,fallback=0)=>Number.isInteger(v)&&v>=min&&v<=max?v:fallback;
function normalize(raw) {
 const s=fresh();
 if(!obj(raw)||raw.courseId!==meta.courseId||raw.version!==2) return s;
 if(obj(raw.drafts)) for(const [k,f] of fieldMap) if(typeof raw.drafts[k]==='string')s.drafts[k]=raw.drafts[k].slice(0,f.maxLength>0?f.maxLength:5000);
 if(Array.isArray(raw.noteEntries))s.noteEntries=raw.noteEntries.slice(-50).filter(a=>obj(a)&&typeof a.text==='string'&&a.text.trim()).map(a=>({id:str(a.id,80)||`note-${Math.random().toString(16).slice(2)}`,text:str(a.text),at:str(a.at,40)||new Date().toISOString()}));
 else if(str(s.drafts['notebook-notes']).trim()){s.noteEntries=[{id:`note-${Date.now()}`,text:str(s.drafts['notebook-notes']),at:str(raw.updatedAt,40)||new Date().toISOString()}];s.drafts['notebook-notes']='';}
 if(obj(raw.reviewed)) for(const k of sectionIds)s.reviewed[k]=raw.reviewed[k]===true;
 if(routeIds.has(raw.topic))s.topic=raw.topic;
 s.question=int(raw.question,0,9); s.buildStep=int(raw.buildStep,0,4);
 if(obj(raw.ratings))for(const k of ratingKeys){if(Number.isInteger(raw.ratings[k])&&raw.ratings[k]>=0&&raw.ratings[k]<=5)s.ratings[k]=raw.ratings[k];}
 if(obj(raw.practice))for(const [k,el]of checkMap){
  if(Array.isArray(raw.practice[k]))s.practice[k]=raw.practice[k].slice(-10).filter(obj).map(a=>({choice:int(a.choice,0,$$('input[type=radio]',el).length-1),correct:a.choice===Number(el.dataset.answer),at:str(a.at,40)}));
 }
 if(obj(raw.firstChecks))for(let n=1;n<=10;n++){const a=raw.firstChecks[n];if(obj(a)&&typeof a.text==='string')s.firstChecks[n]={text:str(a.text),at:str(a.at,40)};}
 if(obj(raw.revealed))for(let n=1;n<=10;n++)s.revealed[n]=raw.revealed[n]===true&&!!s.firstChecks[n];
 if(['challenge','threat'].includes(raw.appraisal))s.appraisal=raw.appraisal;
 if(obj(raw.lab)){
  s.lab.round=int(raw.lab.round,0,2);
  if(Array.isArray(raw.lab.attempts))s.lab.attempts=raw.lab.attempts.slice(-30).filter(a=>obj(a)&&['up','down','hold'].includes(a.action)).map(a=>({round:int(a.round,0,2),action:a.action,prediction:str(a.prediction),before:int(a.before,0,100),after:int(a.after,0,100),appropriate:a.appropriate===true,at:str(a.at,40)}));
  const last=s.lab.attempts[s.lab.attempts.length-1];
  if(raw.lab.locked===true&&last&&last.round===s.lab.round){s.lab.locked=true;s.lab.last=last;}
 }
 if(obj(raw.checkpoint)&&raw.checkpoint.contentVersion===s.checkpoint.contentVersion){
  if(obj(raw.checkpoint.selections))for(let n=1;n<=10;n++){const v=raw.checkpoint.selections[`phase1-q${n}`];if(Number.isInteger(v)&&v>=0&&v<=3)s.checkpoint.selections[`phase1-q${n}`]=v;}
  if(Array.isArray(raw.checkpoint.attempts))s.checkpoint.attempts=raw.checkpoint.attempts.slice(-10).filter(obj).map(a=>({attemptId:str(a.attemptId,80),score:int(a.score,0,10),percent:int(a.percent,0,100),passed:a.passed===true,answers:obj(a.answers)?a.answers:{},at:str(a.at,40)})).filter(a=>a.attemptId&&a.at);
  s.checkpoint.bestScore=Number.isInteger(raw.checkpoint.bestScore)?int(raw.checkpoint.bestScore,0,100,null):null;
  s.checkpoint.lastSubmittedFingerprint=str(raw.checkpoint.lastSubmittedFingerprint,200)||null;
 }
 if(obj(raw.game)){
  if(Array.isArray(raw.game.attempts))s.game.attempts=raw.game.attempts.slice(-10).filter(obj).map(a=>({attemptId:str(a.attemptId,80),status:a.status==='completed'?'completed':'interrupted',score:int(a.score,0,100000),elapsedMs:int(a.elapsedMs,0,3600000),arousal:int(a.arousal,0,100),trackingPercent:int(a.trackingPercent,0,100),pace:['steady','intense','lull'].includes(a.pace)?a.pace:'steady',roundEndReason:str(a.roundEndReason,160),at:str(a.at,40)})).filter(a=>a.attemptId&&a.at);
  if(obj(raw.game.interrupted))s.game.interrupted={attemptId:str(raw.game.interrupted.attemptId,80),at:str(raw.game.interrupted.at,40)};
 }
 if(obj(raw.untimedPractice)){s.untimedPractice.strategy=str(raw.untimedPractice.strategy,80);s.untimedPractice.reflection=str(raw.untimedPractice.reflection);}
 s.gameDebrief=str(raw.gameDebrief);
 s.updatedAt=str(raw.updatedAt,40)||null;
 return s;
}
let state=fresh();
try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');state=normalize(raw);localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch(_){storageOK=false;}
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labelFor=f=>($(`label[for="${f.id}"]`)?.textContent||f.id).trim();
const stamp=()=>new Date().toISOString();
const niceDate=s=>{const d=new Date(s);return Number.isNaN(d.getTime())?'Time unavailable':d.toLocaleString('en-CA');};
function status(text){$('#global-status').textContent=text;}
function saveUI(changed=null){
 const count=fields.filter(f=>f.value.trim()).length;
 $$('.draft-count').forEach(n=>n.textContent=String(count));
 const warning=storageOK?'Saved in this browser only. Nothing is submitted or graded automatically.':'Browser storage is unavailable. Work is held only in this tab. Export before leaving.';
 const sidebarStorage=$('.sidebar-storage');if(sidebarStorage)sidebarStorage.textContent=warning;
 const storageStatus=$('#storage-status');if(storageStatus)storageStatus.textContent=warning+' Export a copy to keep or submit separately.';
 $('#save-status').textContent=pending?'Saving…':storageOK?'Saved in this browser':'Session only · export your work';
 $('#save-status').dataset.state=pending?'pending':storageOK?'saved':'warning';
 (changed?[changed]:fields).forEach(f=>{const e=document.getElementById(f.id+'-save');if(e)e.textContent=!f.value.trim()?'':pending?'Saving…':storageOK?'Saved in this browser':'Session only — export to keep a copy';});
 $$('.build-step').forEach((el,i)=>{const ids=el.dataset.fields.split(','),n=ids.filter(k=>str(state.drafts[k]).trim()).length;const dest=$(`[data-step-count="${i}"]`);if(dest)dest.textContent=`${n} / ${ids.length} responses`;});
}
function saveNow(){
 clearTimeout(saveTimer);saveTimer=null;state.updatedAt=stamp();
 try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch(_){storageOK=false;}
 pending=false;saveUI();
}
function changed(f){state.drafts[f.dataset.draft]=f.value;pending=true;clearTimeout(saveTimer);saveUI(f);saveTimer=setTimeout(saveNow,250);}
fields.forEach(f=>{f.value=state.drafts[f.dataset.draft]||'';f.addEventListener('input',()=>changed(f));});
addEventListener('pagehide',saveNow);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveNow();});
function progress(){
 let n=0;sections.forEach(s=>{const done=state.reviewed[s.id]===true;if(done)n++;const a=$(`.topic-link[href="#${s.id}"]`),label=$('.nav-label',a)?.textContent.trim()||$('h2',s).textContent.trim();a.classList.toggle('reviewed',done);if(done)a.setAttribute('aria-label',`${label} — marked reviewed`);else a.removeAttribute('aria-label');});
 reviewedTotal=n;
 $$('[data-reviewed]').forEach(x=>x.checked=state.reviewed[x.dataset.reviewed]===true);
 const reviewedCount=$('#reviewed-count'),reviewProgress=$('#review-progress');
 if(reviewedCount)reviewedCount.textContent=`${n} of ${sections.length} topics marked reviewed`;
 if(reviewProgress)reviewProgress.value=n;
 const pct=Math.round((n/sections.length)*100);
 const spc=$('#school-progress-count'),spp=$('#school-progress-percent'),spf=$('#school-progress-fill');
 if(spc)spc.textContent=`${n} of ${sections.length} topics`;
 if(spp)spp.textContent=`${pct}%`;
 if(spf)spf.style.width=pct+'%';
 syncNav();
}
$$('[data-reviewed]').forEach(x=>x.addEventListener('change',()=>{state.reviewed[x.dataset.reviewed]=x.checked;progress();saveNow();}));
function syncNav(){
 root.classList.toggle('nav-open',mobile.matches&&mobileOpen);root.classList.toggle('nav-collapsed',!mobile.matches&&desktopCollapsed);
 const visible=mobile.matches?mobileOpen:!desktopCollapsed;
 const menuButton=$('#contents-toggle');
 menuButton.setAttribute('aria-expanded',String(visible));
 const menuAction=visible?'Close course navigation':'Open course navigation';
 menuButton.setAttribute('aria-label',`${menuAction} · ${reviewedTotal} of ${sections.length} complete`);
 menuButton.title=menuAction;
 const menuLabel=$('#mobile-menu-label');if(menuLabel)menuLabel.textContent=`${mobile.matches&&mobileOpen?'Close menu':'Course menu'} · ${reviewedTotal}/${sections.length}`;
 $('#chapter-navigation').inert=!visible;
 $('#lesson-content').inert=mobile.matches&&mobileOpen;$('.brand').inert=mobile.matches&&mobileOpen;
 const quickNotes=$('#quick-notes');if(quickNotes)quickNotes.inert=mobile.matches&&mobileOpen;
 $$('.top-actions>button:not(#contents-toggle)').forEach(b=>b.inert=mobile.matches&&mobileOpen);
}
function closeNav(focus=false){mobileOpen=false;syncNav();if(focus)$('#contents-toggle').focus();}
$('#contents-toggle').addEventListener('click',()=>{
 if(mobile.matches){mobileOpen=!mobileOpen;syncNav();if(mobileOpen){const current=$('.topic-link[aria-current=page]')||$('.topic-link');requestAnimationFrame(()=>{current.scrollIntoView({block:'nearest'});current.focus({preventScroll:true});});}}
 else{desktopCollapsed=!desktopCollapsed;syncNav();}
});
$('.mobile-shade').addEventListener('click',()=>closeNav(true));mobile.addEventListener('change',()=>{mobileOpen=false;syncNav();});
$('#school-sidebar-toggle')?.addEventListener('click',()=>$('#contents-toggle').click());
document.addEventListener('keydown',e=>{
 if(!mobile.matches||!mobileOpen)return;
 if(e.key==='Escape'){e.preventDefault();closeNav(true);}
 if(e.key==='Tab'){
  const els=[$('#contents-toggle'),...$$('a[href],button:not([disabled])',$('#chapter-navigation'))],first=els[0],last=els[els.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
function showQuestion(index,remember=true){
 state.question=int(index,0,9);$$('.question').forEach((a,i)=>a.classList.toggle('current-question',i===state.question));
 $('.question-picker').value=String(state.question);$('.question-position').textContent=`${state.question+1} of 10`;
 $('.question-prev').disabled=state.question===0;$('.question-next').disabled=state.question===9;
 if(remember)saveNow();
}
$('.question-picker').addEventListener('change',e=>showQuestion(Number(e.target.value)));
$('.question-prev').addEventListener('click',()=>showQuestion(state.question-1));$('.question-next').addEventListener('click',()=>showQuestion(state.question+1));
function showStep(n,remember=true,focus=false){
 state.buildStep=int(n,0,4);$$('.build-step').forEach((s,i)=>s.classList.toggle('active-step',i===state.buildStep));
 $$('[data-build-go]').forEach((b,i)=>{if(i===state.buildStep)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 $('#build-prev').disabled=state.buildStep===0;$('#build-next').disabled=state.buildStep===4;$('#build-next').textContent=state.buildStep===4?'Review step':'Next step →';
 $('#build-position').textContent=`Step ${state.buildStep+1} of 5`;
 if(remember)saveNow();
 if(focus){const h=$('.build-step.active-step>h3');h.focus({preventScroll:true});h.scrollIntoView({block:'start'});}
}
$$('[data-build-go]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.buildGo),true,true)));
$('#build-prev').addEventListener('click',()=>showStep(state.buildStep-1,true,true));$('#build-next').addEventListener('click',()=>showStep(state.buildStep+1,true,true));
function stopVideos(){ $$('.player-slot').forEach(p=>p.replaceChildren());$$('.video-placeholder').forEach(p=>p.hidden=false); }
function navigate(id,{historyMode='push',focus=true}={}){
 let target=document.getElementById(id),section=target?.closest('.chapter-section');
 if(!section){section=sections[0];target=section;id=section.id;}
 if(state.topic!==section.id)stopVideos();
 routeSections.forEach(s=>s.classList.toggle('active',s===section));
 $$('.topic-link').forEach(a=>{if(a.getAttribute('href')==='#'+section.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const currentNav=$('.topic-link[aria-current=page]');if(currentNav)currentNav.closest('details.nav-section')?.setAttribute('open','');
 state.topic=section.id;progress();closeNav();
 let ancestor=target;while(ancestor&&ancestor!==section){if(ancestor.tagName==='DETAILS')ancestor.open=true;ancestor=ancestor.parentElement;}
 const question=target.closest('.question');if(question)showQuestion(Number(question.dataset.reviewQuestion)-1,false);
 const build=target.closest('.build-step');if(build)showStep(Number(build.dataset.buildStep),false);
 $$('.lesson-tool',section).forEach(a=>{const active=a.getAttribute('href')==='#'+id||(target===section&&a.textContent.trim()==='Read');a.classList.toggle('current',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 if(historyMode!=='none')try{if(historyMode==='replace')history.replaceState(null,'','#'+id);else if(location.hash!=='#'+id)history.pushState(null,'','#'+id);}catch(_){}
 document.title=`${$('h2',section).textContent} · Sport Psychology · Phase 1`;
 saveNow();
 if(focus)requestAnimationFrame(()=>{
  if(target===section){scrollTo(0,0);$('h2',section).focus({preventScroll:true});}
  else{target.scrollIntoView({block:'start'});const t=target.matches('textarea,input,button,select')?target:target.querySelector('summary,h3,textarea,input,button');if(t){if(!t.matches('textarea,input,button,select,summary'))t.tabIndex=-1;t.focus({preventScroll:true});}}
 });
}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1),t=document.getElementById(id);if(!t?.closest('.chapter-section'))return;e.preventDefault();navigate(id);});
function hashId(){try{return decodeURIComponent(location.hash.slice(1));}catch(_){return '';}}
addEventListener('popstate',()=>navigate(hashId()||'start',{historyMode:'none'}));addEventListener('hashchange',()=>navigate(hashId()||'start',{historyMode:'none'}));
function dialogOpen(id,trigger){
 const d=document.getElementById(id);if(!d)return;lastDialogTrigger=trigger||document.activeElement;
 if(id==='notebook-dialog'){saveNow();renderNotebook();}
 if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
}
$$('[data-open-dialog]').forEach(b=>b.addEventListener('click',()=>dialogOpen(b.dataset.openDialog,b)));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{if(lastDialogTrigger?.isConnected)lastDialogTrigger.focus({preventScroll:true});});});
$('[data-map-start]').addEventListener('click',()=>{$('#map-dialog').close();navigate('start');});
$$('[data-zoom]').forEach(b=>b.addEventListener('click',()=>{const im=$('img',b);$('#zoom-image').src=im.src;$('#zoom-image').alt=im.alt;$('#zoom-image').style.width='';$('#zoom-title').textContent=im.alt;$('.zoom-stage').classList.remove('actual');$('#zoom-size').textContent='Actual size';dialogOpen('zoom-dialog',b);}));
$('#zoom-size').addEventListener('click',()=>{const on=$('.zoom-stage').classList.toggle('actual');$('#zoom-image').style.width=on?($('#zoom-image').naturalWidth||1600)+'px':'';$('#zoom-size').textContent=on?'Fit to screen':'Actual size';});
$$('[data-play-video]').forEach(b=>b.addEventListener('click',()=>{
 const id=b.dataset.playVideo;if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
 const fold=b.closest('.watch-fold,.learning-support'),resource=b.closest('[data-support-resource]')||fold;stopVideos();
 const f=document.createElement('iframe');f.src=`https://www.youtube-nocookie.com/embed/${id}?rel=0&cc_load_policy=1`;
 f.title=b.dataset.videoTitle;f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';
 $('.player-slot',resource).append(f);$('.video-placeholder',resource).hidden=true;
}));
$$('.watch-fold,.learning-support').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open&&!printing){$$('.player-slot',d).forEach(p=>p.replaceChildren());$$('.video-placeholder',d).forEach(p=>p.hidden=false);}}));
function renderCheck(el){
 const list=state.practice[el.dataset.check]||[],last=list[list.length-1],fb=$('.check-feedback',el);
 if(!last){fb.replaceChildren();return;}
 const radios=$$('input[type=radio]',el);radios.forEach((r,i)=>r.checked=i===last.choice);
 const p=document.createElement('p');p.className=last.correct?'correct':'try-again';p.innerHTML=`<strong>${last.correct?'That fits the concept.':'Revisit your choice.'}</strong>`;
 const ex=document.createElement('p');ex.textContent=el.dataset.explanation;
 const small=document.createElement('p');small.className='small';small.textContent=`${list.length} saved practice attempt${list.length===1?'':'s'}. You may try another choice. This is not a grade.`;
 fb.replaceChildren(p,ex,small);
}
checks.forEach(el=>$('.solid-button',el).addEventListener('click',()=>{
 const selected=$('input:checked',el);if(!selected){$('.check-feedback',el).textContent='Choose a response first.';return;}
 const choice=Number(selected.value),key=el.dataset.check;
 state.practice[key]=[...(state.practice[key]||[]),{choice,correct:choice===Number(el.dataset.answer),at:stamp()}].slice(-10);
 renderCheck(el);saveNow();
}));
function renderReveals(){
 for(let i=1;i<=10;i++){
  $('#answer-'+i).hidden=!state.revealed[i];const b=$(`[data-reveal="${i}"]`);b.textContent=state.revealed[i]?'Teaching answer is open':'Compare with the teaching answer';
  $('.reveal-message',b.parentElement).textContent=state.revealed[i]?'A snapshot of your explanation was kept when you first opened the key. Add your revision below.':'';
 }
}
$$('[data-reveal]').forEach(b=>b.addEventListener('click',()=>{
 const n=Number(b.dataset.reveal),text=$(`#review-${n}-first`).value.trim();
 if(!text&&!state.revealed[n]){$('.reveal-message',b.parentElement).textContent='Write your own explanation first, then compare it with the teaching answer.';$(`#review-${n}-first`).focus();return;}
 if(!state.firstChecks[n])state.firstChecks[n]={text,at:stamp()};
 state.revealed[n]=true;renderReveals();saveNow();
}));
function appraisal(kind,save=true){
 const target=$('#appraisal-result');
 if(!kind){target.innerHTML='<p>Choose an interpretation to explore the loop.</p>';return;}
 state.appraisal=kind;$$('[data-appraisal]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.appraisal===kind)));
 target.innerHTML=kind==='challenge'?'<p><strong>Challenge interpretation:</strong> “This matters, but I have a routine.”</p><ol><li><strong>Demand:</strong> a serve at 24–24.</li><li><strong>Appraisal:</strong> an opportunity to execute a practised task.</li><li><strong>Possible response:</strong> activated, with attention directed toward the routine.</li><li><strong>Action:</strong> choose the target, use the cue and serve.</li></ol><p>The score has not changed, and the result is not guaranteed. What changes is the interpretation and the action it supports.</p>':'<p><strong>Threat interpretation:</strong> “A miss will let everyone down.”</p><ol><li><strong>Demand:</strong> the same serve at 24–24.</li><li><strong>Appraisal:</strong> a threat linked to the consequences of a mistake.</li><li><strong>Possible response:</strong> more worry, tension and disrupted attention.</li><li><strong>Action:</strong> the athlete may rush or overcontrol the movement.</li></ol><p>This is one possible pathway, not a guaranteed result. A regulation plan can target the interpretation or response before the next action.</p>';
 if(save)saveNow();
}
$$('[data-appraisal]').forEach(b=>b.addEventListener('click',()=>appraisal(b.dataset.appraisal)));
const cases=[
 {title:'Flat before the start',text:'A fictional athlete is waiting for their event. They feel sluggish, keep noticing unrelated activity and are slow to engage with the task.',start:25,action:'up',why:'The signs point to under-arousal. Raising activation is a more fitting first move than automatically calming the athlete.'},
 {title:'Tense and rushing',text:'Before an important attempt, the athlete’s shoulders are tight, thoughts are racing and their normal preparation feels rushed.',start:85,action:'down',why:'The signs point to excess activation and tension. A down-regulation tool is a fitting first move before redirecting attention.'},
 {title:'Ready to execute',text:'The athlete feels engaged. Movement is coordinated and the relevant task cues are clear. They are not describing flatness or overload.',start:55,action:'hold',why:'The athlete is already in the exercise’s useful range. The next job is to maintain it and direct attention to the task, not automatically change the energy.'}
];
const actionName={up:'Activate',down:'Regulate down',hold:'Maintain and direct'};
function labFeedback(rec){
 const c=cases[rec.round],toward=rec.appropriate;
 const feedback=$('#lab-feedback');feedback.innerHTML=`<p><strong>${toward?'Your first move fits the signs.':'That first move does not fit these signs.'}</strong></p><p>${escape(c.why)}</p><p>In this simplified model, activation moves from <strong>${rec.before}</strong> to <strong>${rec.after}</strong>. ${rec.after>65?'It remains above the practice band, so the athlete would need to check their state again.':rec.after<40?'It remains below the practice band, so more observation and adjustment would be needed.':'It is now within this exercise’s practice band.'}</p><p>This numerical change is an illustration, not an expected bodily effect. Your written justification matters more than the meter.</p>`;
}
function renderLab(){
 const c=cases[state.lab.round];$('#lab-title').textContent=c.title;$('#lab-case').textContent=c.text;$('#lab-position').textContent=`Round ${state.lab.round+1} of 3`;
 const record=state.lab.locked?state.lab.last:null,value=record?record.after:c.start;
 $('#lab-meter').value=value;$('#lab-meter').textContent=String(value);$('#lab-value').textContent=`${value} / 100`;
 $$('input[name=lab-action]').forEach(r=>{r.disabled=state.lab.locked;r.checked=!!record&&record.action===r.value;});
 $('#lab-run').disabled=state.lab.locked;$('#lab-retry').hidden=!state.lab.locked;
 $('#lab-next').disabled=!state.lab.locked||state.lab.round===2;$('#lab-next').textContent=state.lab.round===2?'Last round':'Next round →';
 if(record)labFeedback(record);else $('#lab-feedback').replaceChildren();
 const hist=$('#lab-history');hist.replaceChildren();
 if(!state.lab.attempts.length){const p=document.createElement('li');p.textContent='No attempts yet.';hist.append(p);}
 state.lab.attempts.forEach((a,i)=>{const li=document.createElement('li');li.textContent=`${i+1}. ${cases[a.round].title}: ${actionName[a.action]} · ${a.before} → ${a.after} · ${a.appropriate?'first move fits':'reconsider first move'}. Your reason: ${a.prediction}`;hist.append(li);});
}
$('#lab-run').addEventListener('click',()=>{
 if(state.lab.locked)return;
 const sel=$('input[name=lab-action]:checked'),pred=$('#lab-prediction').value.trim();
 if(!sel||!pred){$('#lab-feedback').textContent='Choose a first move and write your reason before running the model.';return;}
 const c=cases[state.lab.round],a=sel.value,delta={down:-15,up:15,hold:0}[a];
 const rec={round:state.lab.round,action:a,prediction:pred,before:c.start,after:Math.max(0,Math.min(100,c.start+delta)),appropriate:a===c.action,at:stamp()};
 state.lab.attempts.push(rec);state.lab.attempts=state.lab.attempts.slice(-30);state.lab.last=rec;state.lab.locked=true;renderLab();saveNow();
});
function resetRound(){state.lab.locked=false;state.lab.last=null;$('#lab-prediction').value='';state.drafts['lab-prediction']='';renderLab();saveNow();}
$('#lab-retry').addEventListener('click',resetRound);$('#lab-next').addEventListener('click',()=>{if(state.lab.round<2&&state.lab.locked){state.lab.round++;resetRound();$('#lab-title').tabIndex=-1;$('#lab-title').focus();}});
function renderRatings(){
 $$('[data-rating]').forEach(s=>s.value=Object.hasOwn(state.ratings,s.dataset.rating)?String(state.ratings[s.dataset.rating]):'');
 const vals=ratingKeys.filter(k=>Object.hasOwn(state.ratings,k));
 $('#audit-total').textContent=vals.length===5?`Your self-assessment: ${vals.reduce((a,k)=>a+state.ratings[k],0)} / 25. This is not a teacher mark.`:`Self-assessment: ${vals.length} of 5 categories rated. This is not a teacher mark.`;
}
$$('[data-rating]').forEach(s=>s.addEventListener('change',()=>{if(s.value==='')delete state.ratings[s.dataset.rating];else state.ratings[s.dataset.rating]=Number(s.value);renderRatings();saveNow();}));
$('#glossary-search').addEventListener('input',e=>{
 const q=e.target.value.trim().toLocaleLowerCase(),terms=$$('.glossary-term');let n=0;
 terms.forEach(t=>{const match=t.textContent.toLocaleLowerCase().includes(q);t.hidden=!match;if(match)n++;});$('#glossary-count').textContent=`${n} of ${terms.length} terms`;
});
let deletedNote=null;
function renderNotebook(){
 const host=$('#note-entry-list');if(!host)return;
 if(!state.noteEntries.length){host.innerHTML='<p class="no-note-entries">No saved notes yet.</p>';return;}
 host.replaceChildren(...state.noteEntries.slice().reverse().map(note=>{
  const article=document.createElement('article');article.className='note-entry';
  const heading=document.createElement('div');heading.className='note-entry-heading';
  const time=document.createElement('time');time.dateTime=note.at;time.textContent=niceDate(note.at);
  const remove=document.createElement('button');remove.className='note-delete';remove.type='button';remove.dataset.deleteNote=note.id;remove.textContent='Delete';remove.setAttribute('aria-label',`Delete note saved ${niceDate(note.at)}`);
  const body=document.createElement('p');body.textContent=note.text;
  heading.append(time,remove);article.append(heading,body);return article;
 }));
}
$('#save-note-entry')?.addEventListener('click',()=>{
 const field=$('#notebook-notes'),text=field.value.trim();if(!text){field.focus();return;}
 state.noteEntries.push({id:`note-${Date.now()}-${Math.random().toString(16).slice(2)}`,text,at:stamp()});state.noteEntries=state.noteEntries.slice(-50);
 field.value='';state.drafts['notebook-notes']='';saveNow();renderNotebook();document.dispatchEvent(new Event('phase1-notes-updated'));status('Note saved.');field.focus();
});
$('#note-entry-list')?.addEventListener('click',event=>{
 const button=event.target.closest('[data-delete-note]');if(!button)return;
 const index=state.noteEntries.findIndex(note=>note.id===button.dataset.deleteNote);if(index<0)return;
 deletedNote={note:state.noteEntries[index],index};state.noteEntries.splice(index,1);saveNow();renderNotebook();
 const undo=$('#note-delete-undo');undo.hidden=false;document.dispatchEvent(new Event('phase1-notes-updated'));status('Note deleted.');$('#undo-note-delete').focus();
});
$('#undo-note-delete')?.addEventListener('click',()=>{
 if(!deletedNote)return;state.noteEntries.splice(Math.min(deletedNote.index,state.noteEntries.length),0,deletedNote.note);deletedNote=null;saveNow();renderNotebook();
 $('#note-delete-undo').hidden=true;document.dispatchEvent(new Event('phase1-notes-updated'));status('Note restored.');
});
function download(name,content,type){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status('Your export was created. Saving a file does not submit it.');
}
function exportDoc(mode){
 saveNow();const only=mode==='playbook';let content='';
 const textBlock=(label,text)=>`<div class="response"><h3>${escape(label)}</h3><p class="written">${escape(text&&text.trim()?text:'[Not yet answered]')}</p></div>`;
 if(only){
  content='<h2>The Regulation Engine</h2><p>Phase 1 assignment. Responses are learner-written and have not been automatically graded.</p>';
  $$('.build-step').forEach(step=>{content+=`<h2>${escape($('h3',step).textContent)}</h2>`;step.dataset.fields.split(',').forEach(k=>{const f=fieldMap.get(k);content+=textBlock(labelFor(f),state.drafts[k]||'');});});
  const extra=['extension-trial','extension-adjustment'].filter(k=>str(state.drafts[k]).trim());
  if(extra.length){content+='<h2>Optional trial and reflection</h2><p>Additional learning evidence; not a new category in the original rubric.</p>';extra.forEach(k=>content+=textBlock(labelFor(fieldMap.get(k)),state.drafts[k]));}
 }else{
  content='<p>This record contains current written responses, saved first-check snapshots, and local practice attempts. It is a study record, not proof of identity, attendance or independent authorship.</p>';
  if(state.noteEntries.length){content+='<h2>My Notes</h2>';state.noteEntries.forEach(note=>content+=textBlock(niceDate(note.at),note.text));}
  sections.forEach(sec=>{const fs=fields.filter(f=>f.closest('.chapter-section')===sec);const filled=fs.filter(f=>str(state.drafts[f.dataset.draft]).trim());
   if(!filled.length)return;content+=`<h2>${escape($('h2',sec).textContent)}</h2>`;
   filled.forEach(f=>{const key=f.dataset.draft;let label=labelFor(f);const article=f.closest('.question');if(article)label=$('h3',article).textContent+' — '+label;content+=textBlock(label,state.drafts[key]);});
  });
  content+='<h2>First explanations saved before checking the key</h2><p>These snapshots were captured when the teaching answer was first opened. A current first-response field can have been edited since then.</p>';
  const snapshots=Object.entries(state.firstChecks);
  if(!snapshots.length)content+='<p>No answer-check snapshots have been recorded.</p>';
  snapshots.forEach(([n,a])=>{content+=textBlock(`Question ${n} · captured ${niceDate(a.at)}`,a.text);});
  content+='<h2>Knowledge-check attempts</h2><p>Formative practice only. Up to the latest ten attempts per question are retained.</p>';
  let pn=0;checks.forEach(el=>{const arr=state.practice[el.dataset.check]||[];if(!arr.length)return;pn+=arr.length;content+=`<h3>${escape($('legend',el).textContent)}</h3>`;arr.forEach((a,i)=>{const choice=$$('.choice span',el)[a.choice]?.textContent||'';content+=`<p>${i+1}. ${escape(niceDate(a.at))} — ${escape(choice)}. Feedback: ${a.correct?'fits the concept':'revisit the choice'}.</p>`;});});if(!pn)content+='<p>No knowledge checks have been attempted.</p>';
  content+='<h2>Performance-state lab record</h2><p>Fictional practice model. These meter values are not personal physiological or psychological measurements. Up to thirty attempts are retained.</p>';
  if(!state.lab.attempts.length)content+='<p>No lab attempts have been recorded.</p>';
  state.lab.attempts.forEach((a,i)=>{content+=`<h3>Attempt ${i+1}: ${escape(cases[a.round].title)}</h3><p>${escape(niceDate(a.at))} · ${escape(actionName[a.action])} · model level ${a.before} → ${a.after} · ${a.appropriate?'First move fits the case.':'Reconsider the first move.'}</p>`+textBlock('Prediction and explanation written before the result',a.prediction);});
 }
 if(!only){
  content+='<h2>Checkpoint attempts</h2><p>Local practice results only; these are not LMS grades.</p>';
  if(!state.checkpoint.attempts.length)content+='<p>No checkpoint attempts have been submitted.</p>';
  state.checkpoint.attempts.forEach((a,i)=>{const answered=Object.values(a.answers).filter(Number.isInteger).length;content+=`<p>Attempt ${i+1}: ${a.score} / 10 (${a.percent}%) · ${answered} answered · ${escape(niceDate(a.at))}.</p>`;});
  content+=textBlock('Game debrief',state.gameDebrief);
  content+='<h2>Untimed regulation practice</h2>'+textBlock('Selected first move',state.untimedPractice.strategy)+textBlock('Reasoning',state.untimedPractice.reflection);
 }
 content+='<h2>Optional self-assessment</h2><p>These ratings are the learner’s review, not a teacher’s grade.</p><ul>'+ratingKeys.map(k=>`<li>${escape(k)}: ${Object.hasOwn(state.ratings,k)?state.ratings[k]+' / 5':'Not rated'}</li>`).join('')+'</ul>';
 if(!only)content+='<h2>Self-marked topic review</h2><p>'+sections.map(s=>`${escape($('h2',s).textContent)} — ${state.reviewed[s.id]?'marked reviewed':'not marked reviewed'}`).join('<br>')+'</p>';
 const title=only?'My Regulation Engine — Phase 1':'My Work — Sport Psychology Phase 1';
 const html=`<!DOCTYPE html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><style>body{max-width:880px;margin:40px auto;padding:0 28px;color:#28362d;font:17px/1.75 Georgia,serif}h1,h2,h3{color:#204b33}h1{font-size:34px;line-height:1.2}h2{font-size:25px;margin:35px 0 14px;padding-top:20px;border-top:1px solid #d3ddce}h3{font:600 14px/1.7 system-ui,sans-serif;margin:20px 0 8px}p{margin:0 0 16px}p.written{white-space:pre-wrap;overflow-wrap:anywhere;padding:12px 15px;background:#f4f6ef;border-left:2px solid #8aab77}small{font:12px/1.7 system-ui,sans-serif}button{padding:10px 16px;font:14px system-ui,sans-serif;border:1px solid #aaa;border-radius:4px;background:white}.response{break-inside:auto}h2,h3{break-after:avoid}@page{size:A4;margin:18mm}@media print{body{padding:0;margin:0;font-size:11pt;max-width:none}button{display:none}h1{font-size:24pt}h2{font-size:17pt}h3{font-size:11pt}p.written{background:white;border-left:1px solid #999}a{color:inherit}}</style></head><body><button type="button" onclick="window.print()">Print / Save as PDF</button><h1>${escape(title)}</h1><p><small>Exported ${escape(niceDate(stamp()))}. Nothing has been submitted automatically. Submit separately as directed by your teacher.</small></p>${content}<h2>Content basis</h2><p><small>Mastering the Performance State; the supplied Engine slides; and the Regulation Engine assignment. Classroom examples and formative activities were expanded for the Grade 10 reading-level edition. Teaching answers clarify the supplied review key. See the learning centre resources for the source basis. Written responses are the learner’s current locally stored work.</small></p></body></html>`;
 if(only)download('My_Regulation_Engine_Phase1.html',html,'text/html;charset=utf-8');
 else{
  const printWindow=window.open('','_blank');
  if(!printWindow){status('Allow the print window, then choose Save as PDF.');return;}
  printWindow.document.open();printWindow.document.write(html);printWindow.document.close();printWindow.focus();setTimeout(()=>printWindow.print(),250);
 }
}
$$('[data-export]').forEach(b=>b.addEventListener('click',()=>exportDoc(b.dataset.export)));
$('#backup-save')?.addEventListener('click',()=>{saveNow();download('Sport_Psychology_Phase1_Backup.json',JSON.stringify(state,null,2),'application/json;charset=utf-8');});
function restoreUI(){
 fields.forEach(f=>f.value=state.drafts[f.dataset.draft]||'');checks.forEach(renderCheck);renderReveals();showQuestion(state.question,false);showStep(state.buildStep,false);renderRatings();renderLab();appraisal(state.appraisal,false);progress();saveUI();
}
$('#backup-load')?.addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;const msg=$('#import-message');
 try{
  if(file.size>2*1024*1024)throw new Error('This file is too large for a Phase 1 backup.');
  const raw=JSON.parse(await file.text());
  if(!obj(raw)||raw.courseId!==meta.courseId||raw.version!==2)throw new Error('Choose a backup created by this Phase 1 learning website.');
  if(!confirm('Replace this browser’s Phase 1 work with the selected backup? Export current work first if you need to keep it.')){msg.textContent='Import cancelled. Your current work was not changed.';return;}
  clearTimeout(saveTimer);state=normalize(raw);restoreUI();navigate(state.topic,{historyMode:'replace',focus:false});saveNow();renderNotebook();msg.textContent='Backup restored. Your responses, review snapshots and practice records are available here.';
 }catch(err){msg.textContent='Backup not loaded. '+(err instanceof Error?err.message:'The file could not be read.');}
 finally{e.target.value='';}
});
$('#clear-work')?.addEventListener('click',()=>{
 if(!confirm('Clear all local Phase 1 responses, snapshots, practice attempts and progress? Export first. This cannot be undone.'))return;
 clearTimeout(saveTimer);state=fresh();try{localStorage.removeItem(KEY);}catch(_){}
 restoreUI();saveNow();renderNotebook();if($('#notebook-dialog').open)$('#notebook-dialog').close();navigate('start',{historyMode:'replace'});status('This phase’s local work has been cleared. Other courses were not changed.');
});
let beforePrint=[];
addEventListener('beforeprint',()=>{printing=true;beforePrint=$$('details').map(d=>[d,d.open]);beforePrint.forEach(([d])=>{if(!d.classList.contains('watch-fold'))d.open=true;});});
addEventListener('afterprint',()=>{beforePrint.forEach(([d,o])=>d.open=o);printing=false;});

// A small teaching walkthrough, not a timed breathing exercise or personal score.
const resetCopy=[
 ['1. Notice a specific signal','“My shoulders are tight and I am rushing my setup.” Describe the signal without judging your whole ability.'],
 ['2. Match the adjustment to the need','During a safe pause, choose a familiar tool. Tension may call for settling; flatness may call for appropriate activation. Ready and focused may call for maintaining.'],
 ['3. Give attention one useful cue','“See the target.” Use a cue you understand and have practised. Match it to the current task.'],
 ['4. Commit to the next action','Use the planned routine and act. The purpose is not to wait until every nervous feeling has disappeared.'],
 ['5. Review at a sensible break','What did you actually do? What changed in the task? Decide what to keep or adjust without claiming that one result proves the tool works.']
];
$$('[data-reset-step]').forEach(b=>b.addEventListener('click',()=>{
 const i=Number(b.dataset.resetStep);
 $$('[data-reset-step]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 const h=document.createElement('h4'),p=document.createElement('p');h.textContent=resetCopy[i][0];p.textContent=resetCopy[i][1];$('#reset-step-detail').replaceChildren(h,p);
}));

$('#school-save-exit')?.addEventListener('click',()=>{
 saveNow();
 const bar=$('#school-local-status');
 if(bar)bar.textContent=storageOK?'Saved in this browser. You can now close this tab or return to Brightspace.':'Browser storage is unavailable. Export your notebook or backup before leaving.';
 status('Phase 1 work saved in this browser.');
});

window.__sportsWellnessPhase1={
 getState:()=>state,
 save:saveNow,
 navigate,
 stamp,
 niceDate,
 escape,
 status,
 renderNotebook,
 storageAvailable:()=>storageOK
};

restoreUI();navigate(hashId()||state.topic,{historyMode:'none',focus:false});
root.classList.add('enhanced');syncNav();
})();
