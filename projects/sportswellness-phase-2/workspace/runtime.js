/* Sports Wellness learner runtime, adapted to the supplied Phase 1 component contract.
   No network saving, LMS calls, external dependencies, or legacy-state migration. */
(() => {
  'use strict';
  const config = JSON.parse(document.getElementById('phase-config').textContent);
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const root = document.documentElement;
  const sections = $$('.chapter-section');
  const fields = $$('[data-draft]');
  const fieldMap = new Map(fields.map(e => [e.id, e]));
  const checks = $$('.knowledge-check');
  const checkMap = new Map(checks.map(e => [e.dataset.check, e]));
  const checkpointQuestions = $$('.checkpoint-question');
  const checkpointMap = new Map(checkpointQuestions.map(e => [e.id, e]));
  const MESSAGE_ORIGIN = location.protocol === 'file:' ? 'null' : location.origin;
  const KEY = `canvas-helper:${config.moduleId}:state`;
  const RECOVERY = KEY + ':before-import';
  const VERSION = 1;
  const stamp = () => new Date().toISOString();
  const uid = () => globalThis.crypto?.randomUUID?.() || `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const clone = x => JSON.parse(JSON.stringify(x));
  const plain = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = x => { const d = new Date(x); return Number.isNaN(d.valueOf()) ? 'Unknown date' : d.toLocaleString('en-CA'); };
  const labelFor = id => document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent.trim() || id;
  const has = id => Boolean(state.drafts[id]?.trim());
  const fresh = () => ({
    courseId: config.moduleId, version: VERSION, contentVersion: config.contentVersion,
    updatedAt: stamp(), topic: 'start', buildStep: 0, reviewPosition: 0, labRound: 0,
    navCollapsed: false, drafts: {}, reviewed: {}, practice: {}, checkSelections: {},
    firstChecks: {}, revealed: {}, noteEntries: [],
    checkpoint: {selections: {}, attempts: [], lastFingerprint: null, activeAttemptId: null},
    lab: {guided: {selections: {}, attempts: []}, untimed: {selections: {}, attempts: []}},
    game: {attempts: []}
  });
  let state = fresh(), storageOK = true, saveTimer = null, previousImport = null;
  let deletedNote = null, lastDialogTrigger = null, gameFrame = null, gameSession = null;
  let restoreInProgress = false;

  function prohibitKeys(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const [k,v] of Object.entries(obj)) {
      if (['__proto__','prototype','constructor'].includes(k)) throw new Error('Unsupported record key.');
      prohibitKeys(v);
    }
  }
  function requireThat(test, message) { if (!test) throw new Error(message); }
  function text(value, maximum = 20000) { return typeof value === 'string' && value.length <= maximum; }
  function timestamp(value) { return text(value,100) && Number.isFinite(Date.parse(value)); }
  function integer(value, low, high) { return Number.isInteger(value) && value >= low && value <= high; }
  function strings(record, allowed) {
    requireThat(plain(record), 'Response collection is invalid.');
    for (const [k,v] of Object.entries(record)) requireThat(allowed.has(k) && text(v), 'A response has an unknown field or unsupported value.');
  }
  function validSelections(record, map) {
    requireThat(plain(record), 'The selected-answer collection is invalid.');
    for (const [k,v] of Object.entries(record)) {
      requireThat(map.has(k) && typeof v === 'string' && $$('input[type=radio]',map.get(k)).some(e=>e.value===v), 'An answer has an unknown question or choice.');
    }
  }
  function validateBackup(raw) {
    prohibitKeys(raw);
    requireThat(plain(raw) && raw.courseId === config.moduleId, 'Choose a backup for this phase. No work was changed.');
    requireThat(raw.version === VERSION, 'This backup uses a different storage version. No work was changed.');
    requireThat(text(raw.contentVersion,150) && timestamp(raw.updatedAt), 'Backup metadata is incomplete.');
    requireThat(sections.some(s=>s.id===raw.topic), 'The saved page is not part of this phase.');
    requireThat(integer(raw.buildStep,0,4) && integer(raw.reviewPosition,0,3) && integer(raw.labRound,0,2) && typeof raw.navCollapsed==='boolean','The saved navigation is invalid.');
    strings(raw.drafts, new Set(fieldMap.keys()));
    requireThat(plain(raw.reviewed),'Topic-review records are invalid.');
    for (const [k,v] of Object.entries(raw.reviewed)) requireThat(config.topics.includes(k) && typeof v==='boolean','Unknown topic-review record.');
    validSelections(raw.checkSelections,checkMap);
    requireThat(plain(raw.practice),'Practice history is invalid.');
    for (const [k,arr] of Object.entries(raw.practice)) {
      requireThat(checkMap.has(k) && Array.isArray(arr),'Unknown practice history.');
      arr.forEach(a=>requireThat(plain(a) && text(a.choice,100) && $$('input',checkMap.get(k)).some(e=>e.value===a.choice) && typeof a.correct==='boolean' && timestamp(a.at),'A practice attempt is invalid.'));
    }
    requireThat(plain(raw.firstChecks) && plain(raw.revealed),'Review history is invalid.');
    for (const [k,a] of Object.entries(raw.firstChecks)) requireThat(integer(Number(k),1,4) && plain(a) && text(a.text) && timestamp(a.at),'A first-answer snapshot is invalid.');
    for (const [k,v] of Object.entries(raw.revealed)) requireThat(integer(Number(k),1,4) && typeof v==='boolean' && (!v||raw.firstChecks[k]),'A revealed answer has no first-answer record.');
    requireThat(Array.isArray(raw.noteEntries),'Notes are invalid.');
    const noteIds = new Set();
    raw.noteEntries.forEach(n=>{requireThat(plain(n)&&text(n.id,150)&&text(n.text)&&timestamp(n.at)&&!noteIds.has(n.id),'A note entry is invalid or duplicated.');noteIds.add(n.id);});
    requireThat(plain(raw.checkpoint) && Array.isArray(raw.checkpoint.attempts),'Checkpoint history is invalid.');
    validSelections(raw.checkpoint.selections,checkpointMap);
    requireThat(raw.checkpoint.lastFingerprint === null || text(raw.checkpoint.lastFingerprint,10000),'Checkpoint fingerprint is invalid.');
    requireThat(raw.checkpoint.activeAttemptId === null || text(raw.checkpoint.activeAttemptId,150),'Checkpoint review identifier is invalid.');
    const attemptIds = new Set();
    raw.checkpoint.attempts.forEach(a=>{
      requireThat(plain(a)&&text(a.id,150)&&text(a.contentVersion,150)&&timestamp(a.at)&&integer(a.score,0,checkpointQuestions.length)&&!attemptIds.has(a.id),'A checkpoint attempt is invalid.');
      validSelections(a.answers,checkpointMap);
      requireThat(Object.keys(a.answers).length===checkpointQuestions.length,'A submitted attempt is incomplete.');
      if(a.contentVersion===config.contentVersion) requireThat(a.score===scoreAnswers(a.answers),'A current-version score does not match its answers.');
      attemptIds.add(a.id);
    });
    requireThat(raw.checkpoint.activeAttemptId===null||attemptIds.has(raw.checkpoint.activeAttemptId),'The selected checkpoint attempt is missing.');
    requireThat(plain(raw.lab),'Lab history is missing.');
    for (const mode of ['guided','untimed']) {
      const lab=raw.lab[mode];requireThat(plain(lab)&&plain(lab.selections)&&Array.isArray(lab.attempts),'Lab records are invalid.');
      for (const [i,v] of Object.entries(lab.selections)) requireThat(integer(Number(i),0,2)&&text(v,100)&&$$(`input[name="${mode}-choice-${i}"]`).some(e=>e.value===v),'An unknown lab choice was found.');
      lab.attempts.forEach(a=>requireThat(plain(a)&&integer(a.round,0,2)&&text(a.id,150)&&text(a.reason)&&text(a.choice,100)&&$$(`input[name="${mode}-choice-${a.round}"]`).some(e=>e.value===a.choice)&&typeof a.correct==='boolean'&&timestamp(a.at),'A lab attempt is invalid.'));
    }
    requireThat(plain(raw.game)&&Array.isArray(raw.game.attempts),'Game history is invalid.');
    raw.game.attempts.forEach(a=>requireThat(validGameRecord(a),'A game record is invalid.'));
    return clone(raw);
  }
  function validGameRecord(a) {
    return plain(a) && text(a.id,150) && a.activityId===config.gameId && a.version===1 && timestamp(a.at) && ['completed','interrupted','ended'].includes(a.status) && text(a.reason,500) && Number.isFinite(a.elapsed)&&a.elapsed>=0&&a.elapsed<=86400 && Number.isFinite(a.score)&&Math.abs(a.score)<=1e7;
  }
  let protectedUnreadable = false;
  try {
    const raw=localStorage.getItem(KEY);
    if(raw) state=validateBackup(JSON.parse(raw));
    const prior=localStorage.getItem(RECOVERY);
    if(prior) { try { previousImport=validateBackup(JSON.parse(prior)); } catch(_) {} }
  } catch(err) {
    storageOK=false;protectedUnreadable=true;
    queueMicrotask(()=>announce('Existing browser work could not be read. It has not been replaced. Keep a backup before editing.'));
  }

  function announce(message) {
    const live=$('#app-announcement');if(live) live.textContent=message;
    const visible=$('#runtime-status');if(visible){visible.hidden=false;visible.textContent=message;}
  }
  function collect() { fields.forEach(f=>state.drafts[f.id]=f.value); }
  function saveUI() {
    const message=storageOK?'Saved in this browser':'Not saved to browser — use Download backup in the course guide';
    $$('.field-save-status').forEach(e=>e.textContent=message);
    if($('#save-status')) $('#save-status').textContent=message;
  }
  function flush() {
    clearTimeout(saveTimer);collect();state.updatedAt=stamp();
    try { if(protectedUnreadable)throw new Error('Existing work protected');localStorage.setItem(KEY,JSON.stringify(state));storageOK=true; }
    catch (_) { storageOK=false;announce(protectedUnreadable?'Existing unreadable browser work is protected from replacement. New work stays in this open page; download a backup before leaving.':'Browser saving is unavailable. Your work remains in this open page. Download a backup before leaving.'); }
    saveUI();progress();return storageOK;
  }
  function scheduleSave() {
    clearTimeout(saveTimer);saveTimer=setTimeout(flush,180);
  }
  fields.forEach(f=>f.addEventListener('input',()=>{
    state.drafts[f.id]=f.value;const s=$(`#${CSS.escape(f.id)}-save`);if(s)s.textContent='Saving…';scheduleSave();updateBuildCounts();
  }));
  $('#school-save-exit').addEventListener('click',()=>{
    if(flush()) announce('Saved in this browser. You can close this tab. Saving does not submit your work.');
  });
  addEventListener('pagehide',()=>{interruptGame('Page closed or hidden');flush();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){interruptGame('Activity hidden');flush();}});

  function syncNav() {
    const mobile=matchMedia('(max-width:1023px)').matches;
    root.classList.toggle('nav-collapsed',!mobile&&state.navCollapsed);
    const open=mobile?root.classList.contains('nav-open'):!state.navCollapsed;
    $('#contents-toggle').setAttribute('aria-expanded',String(open));
    $('#contents-toggle').setAttribute('aria-label',open?'Close course menu':'Open course menu');
    $('#school-sidebar-toggle').setAttribute('aria-expanded',String(open));
  }
  function toggleNav() {
    if(matchMedia('(max-width:1023px)').matches) root.classList.toggle('nav-open');
    else state.navCollapsed=!state.navCollapsed;
    syncNav();flush();
  }
  $('#contents-toggle').addEventListener('click',toggleNav);
  $('#school-sidebar-toggle').addEventListener('click',toggleNav);
  $('.mobile-shade').addEventListener('click',()=>{root.classList.remove('nav-open');syncNav();$('#contents-toggle').focus();});
  addEventListener('resize',()=>{root.classList.remove('nav-open');syncNav();});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('nav-open')){root.classList.remove('nav-open');syncNav();$('#contents-toggle').focus();}});
  function hashTarget(){try{return decodeURIComponent(location.hash.slice(1));}catch(_){return '';}}
  function navigate(target,{historyMode='push',focus=true}={}) {
    flush();
    let el=document.getElementById(target);
    if(!el) el=document.getElementById('start');
    const section=el.closest('.chapter-section')||document.getElementById('start');
    if(state.topic==='performance-game'&&section.id!=='performance-game')interruptGame('Navigated away');
    sections.forEach(s=>s.classList.toggle('active',s===section));
    state.topic=section.id;
    $$('.course-nav a[href^="#"]').forEach(a=>{const active=a.hash==='#'+section.id;if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');if(active&&a.closest('details'))a.closest('details').open=true;});
    const step=el.closest('.build-step');if(step)showStep(Number(step.dataset.buildStep),false);
    const q=el.closest('.question[data-review-question]');if(q)showReview(Number(q.dataset.reviewQuestion)-1,false);
    const lab=el.closest('[data-lab-mode="guided"]');if(lab)showLabRound(Number(lab.dataset.round),false);
    for(let ancestor=el.parentElement;ancestor&&ancestor!==section;ancestor=ancestor.parentElement)if(ancestor.tagName==='DETAILS')ancestor.open=true;
    if(el.tagName==='DETAILS')el.open=true;
    root.classList.remove('nav-open');syncNav();
    if(historyMode!=='none'){
      try {history[historyMode==='replace'?'replaceState':'pushState']({topic:section.id},'',`#${el.id}`);}catch(_){}
    }
    if(section.id==='process-collection')renderWork();
    if(section.id==='checkpoint')renderCheckpoint();
    if(section.id==='performance-game')ensureGame();
    progress();scheduleSave();
    if(focus) requestAnimationFrame(()=>{
      const t=el===section?$('h2',section):el;
      if(!t.matches('input,textarea,select,button,a'))t.tabIndex=-1;
      t.focus({preventScroll:true});if(el===section)window.scrollTo({top:0});else t.scrollIntoView({block:'start'});
    });
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey)return;
    const target=a.getAttribute('href').slice(1);if(!document.getElementById(target))return;
    e.preventDefault();if(target==='notebook-notes'){openDialog('notebook-dialog',a);$('#notebook-notes').focus();return;}navigate(target);
  });
  addEventListener('popstate',()=>navigate(hashTarget()||'start',{historyMode:'none'}));
  addEventListener('hashchange',()=>navigate(hashTarget()||'start',{historyMode:'none'}));
  function progress() {
    const n=config.topics.filter(k=>state.reviewed[k]).length;
    $('#school-progress-count').textContent=`${n} of 12 topics`;
    $('#school-progress-percent').textContent=`${Math.round(n/12*100)}%`;
    $('#school-progress-fill').style.width=`${n/12*100}%`;
    $('#mobile-menu-label').textContent=`Course menu · ${n}/12`;
    $$('[data-reviewed]').forEach(e=>e.checked=!!state.reviewed[e.dataset.reviewed]);
    $$('.topic-link[href^="#"]').forEach(a=>a.classList.toggle('reviewed',!!state.reviewed[a.hash.slice(1)]));
    updateBuildCounts();
    const status=$('#required-work-status');
    if(status){
      const lessonDone=config.lessonFields.filter(has).length;
      const checksDone=checks.filter(c=>(state.practice[c.dataset.check]||[]).length).length;
      const buildDone=config.buildFields.filter(has).length;
      const reviewed=Array.from({length:4},(_,i)=>String(i+1)).filter(k=>state.firstChecks[k]&&has(`review-${k}-revision`)).length;
      const labDone=mode=>[0,1,2].every(i=>state.lab[mode].attempts.some(a=>a.round===i))&&has(`${mode}-transfer`);
      const best=bestScore();
      status.textContent=`Opening: ${has(config.openingField)?'recorded':'not yet recorded'}. Learn responses: ${lessonDone}/8. Concept checks attempted: ${checksDone}/16. Decision practice: ${labDone('guided')||labDone('untimed')?'three cases and transfer recorded':'not yet complete'}. Build responses: ${buildDone}/12. Review comparisons and revisions: ${reviewed}/4. Checkpoint: ${best===null?'not submitted':best+'% best; '+(best>=70?'practice threshold met':'keep practising')}. These are local work indicators, not teacher grades or submission confirmation.`;
    }
  }
  $$('[data-reviewed]').forEach(e=>e.addEventListener('change',()=>{state.reviewed[e.dataset.reviewed]=e.checked;flush();}));

  function openDialog(id,trigger) {
    const d=document.getElementById(id);if(!d)return;lastDialogTrigger=trigger||document.activeElement;
    if(id==='notebook-dialog'){flush();renderNotes();}
    if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
  }
  $$('[data-open-dialog]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.openDialog,b)));
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  $$('dialog').forEach(d=>d.addEventListener('close',()=>lastDialogTrigger?.isConnected&&lastDialogTrigger.focus({preventScroll:true})));
  $$('[data-zoom]').forEach(b=>b.addEventListener('click',()=>{
    const im=$('img',b);$('#zoom-image').src=im.src;$('#zoom-image').alt=im.alt;$('#zoom-title').textContent=im.alt;
    $('.zoom-stage').classList.remove('actual');$('#zoom-image').style.width='';$('#zoom-size').textContent='Actual size';openDialog('zoom-dialog',b);
  }));
  $('#zoom-size').addEventListener('click',()=>{const on=$('.zoom-stage').classList.toggle('actual');$('#zoom-image').style.width=on?'1200px':'';$('#zoom-size').textContent=on?'Fit to screen':'Actual size';});

  function renderCheck(el) {
    const arr=state.practice[el.dataset.check]||[];const last=arr[arr.length-1];
    $$('input',el).forEach(r=>r.checked=state.checkSelections[el.dataset.check]===r.value);
    const fb=$('.check-feedback',el);fb.replaceChildren();
    if(!last||state.checkSelections[el.dataset.check]!==last.choice)return;
    const p=document.createElement('p');p.textContent=last.correct?'Your choice fits the concept.':'Revisit the distinction.';
    p.className=last.correct?'correct':'try-again';const ex=document.createElement('p');ex.textContent=el.dataset.explanation;
    const small=document.createElement('p');small.className='small';small.textContent=`${arr.length} saved attempt${arr.length===1?'':'s'}. This is practice, not a teacher mark.`;fb.append(p,ex,small);
  }
  checks.forEach(el=>{
    $$('input',el).forEach(r=>r.addEventListener('change',()=>{state.checkSelections[el.dataset.check]=r.value;$('.check-feedback',el).replaceChildren();scheduleSave();}));
    $('[data-check-submit]',el).addEventListener('click',()=>{
      const choice=$('input:checked',el)?.value;
      if(!choice){$('.check-feedback',el).textContent='Choose a response first.';return;}
      const arr=state.practice[el.dataset.check]||[];
      arr.push({choice,correct:choice===el.dataset.correct,at:stamp()});state.practice[el.dataset.check]=arr;renderCheck(el);flush();
    });
  });
  function updateBuildCounts(){
    $$('.build-step').forEach(step=>{
      const ids=step.dataset.fields.split(',');const n=ids.filter(has).length;
      const count=$(`[data-step-count="${step.dataset.buildStep}"]`);if(count)count.textContent=`${n} of ${ids.length} responses`;
    });
  }
  function showStep(i,focus=true) {
    state.buildStep=Math.max(0,Math.min(4,i));
    $$('.build-step').forEach(s=>s.classList.toggle('active-step',Number(s.dataset.buildStep)===state.buildStep));
    $$('[data-build-go]').forEach(b=>{if(Number(b.dataset.buildGo)===state.buildStep)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    $('#build-prev').disabled=state.buildStep===0;$('#build-next').disabled=state.buildStep===4;
    $('#build-position').textContent=`Step ${state.buildStep+1} of 5`;updateBuildCounts();
    if(focus){const h=$('.build-step.active-step h3');h.focus();h.scrollIntoView({block:'start'});flush();}
  }
  $$('[data-build-go]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.buildGo))));
  $('#build-prev').addEventListener('click',()=>showStep(state.buildStep-1));
  $('#build-next').addEventListener('click',()=>showStep(state.buildStep+1));
  $$('[data-reuse-source]').forEach(b=>b.addEventListener('click',()=>{
    flush();const source=state.drafts[b.dataset.reuseSource]||'';const target=fieldMap.get(b.dataset.reuseTarget);
    const message=$('.reuse-message',b.parentElement);
    if(!source.trim()){message.textContent='That earlier response is still blank. Complete it first or write your Build response here.';return;}
    if(target.value.trim()&&!confirm(`Replace your existing “${labelFor(target.id)}” response with the earlier answer? Cancel keeps your edited work.`)){message.textContent='Your edited Build response was kept.';return;}
    target.value=source;state.drafts[target.id]=source;flush();message.textContent='Earlier response copied. Adapt it so it answers this Build question.';target.focus();
  }));

  function showReview(i,focus=true) {
    state.reviewPosition=Math.max(0,Math.min(3,i));
    $$('.question[data-review-question]').forEach(q=>q.classList.toggle('current-question',Number(q.dataset.reviewQuestion)===state.reviewPosition+1));
    $('.question-picker').value=String(state.reviewPosition);$('.question-position').textContent=`${state.reviewPosition+1} of 4`;
    $('.question-prev').disabled=state.reviewPosition===0;$('.question-next').disabled=state.reviewPosition===3;
    if(focus){const h=$('.current-question h3');h.tabIndex=-1;h.focus();h.scrollIntoView({block:'start'});flush();}
  }
  $('.question-picker').addEventListener('change',e=>showReview(Number(e.target.value)));
  $('.question-prev').addEventListener('click',()=>showReview(state.reviewPosition-1));
  $('.question-next').addEventListener('click',()=>showReview(state.reviewPosition+1));
  function renderReveals() {
    $$('[data-reveal]').forEach(b=>{
      const n=b.dataset.reveal;const shown=!!state.revealed[n];$('#answer-'+n).hidden=!shown;
      b.textContent=shown?'Teaching answer is open':'Compare with the teaching answer';
      const m=$('.reveal-message',b.parentElement);m.textContent=shown?'Your first explanation was kept when you first opened this answer. Add a specific revision below.':'';
    });
  }
  $$('[data-reveal]').forEach(b=>b.addEventListener('click',()=>{
    flush();const n=b.dataset.reveal,first=state.drafts[`review-${n}-first`]||'';
    if(!first.trim()){$('.reveal-message',b.parentElement).textContent='Write your first explanation before comparing.';fieldMap.get(`review-${n}-first`).focus();return;}
    if(!state.firstChecks[n])state.firstChecks[n]={text:first,at:stamp()};state.revealed[n]=true;renderReveals();flush();
  }));

  function fingerprint(answers) {return JSON.stringify(checkpointQuestions.map(q=>[q.id,answers[q.id]||null]));}
  function scoreAnswers(answers){return checkpointQuestions.filter(q=>answers[q.id]===q.dataset.correct).length;}
  function bestScore(){const a=state.checkpoint.attempts.filter(a=>a.contentVersion===config.contentVersion);return a.length?Math.max(...a.map(x=>Math.round(100*x.score/checkpointQuestions.length))):null;}
  function checkpointFeedback(answers,show) {
    checkpointQuestions.forEach(q=>{
      q.classList.toggle('is-correct',show&&answers[q.id]===q.dataset.correct);
      q.classList.toggle('is-incorrect',show&&answers[q.id]!==q.dataset.correct);
      $('.checkpoint-feedback',q).hidden=!show;
    });
  }
  function renderCheckpoint() {
    checkpointQuestions.forEach(q=>$$('input',q).forEach(r=>r.checked=state.checkpoint.selections[q.id]===r.value));
    const active=state.checkpoint.attempts.find(a=>a.id===state.checkpoint.activeAttemptId&&a.contentVersion===config.contentVersion);
    const show=!!active&&fingerprint(active.answers)===fingerprint(state.checkpoint.selections);
    checkpointFeedback(show?active.answers:{},show);
    const out=$('#checkpoint-result');
    if(show)out.textContent=`${active.score} of ${checkpointQuestions.length} correct (${Math.round(100*active.score/checkpointQuestions.length)}%). ${active.score/checkpointQuestions.length>=.7?'The 70% practice threshold is met.':'Review the explanations and try another attempt.'} This saved feedback remains available when you return.`;
    else out.textContent='Your unfinished choices save in this browser. Answer every question before submitting.';
    const host=$('#checkpoint-history');host.replaceChildren();
    if(!state.checkpoint.attempts.length){host.textContent='No submitted attempts yet.';return;}
    const h=document.createElement('h3');h.textContent='Saved attempts';host.append(h);
    state.checkpoint.attempts.forEach(a=>{
      const row=document.createElement('p'),b=document.createElement('button');b.type='button';b.className='quiet-button';b.dataset.reviewAttempt=a.id;
      const old=a.contentVersion!==config.contentVersion;
      row.append(document.createTextNode(`${date(a.at)} · ${a.score}/${checkpointQuestions.length}${old?' · earlier content version; not counted toward current threshold':' · local practice'} `));
      b.textContent=old?'Earlier-version record':'Review this attempt';b.disabled=old;row.append(b);host.append(row);
    });
    const summary=document.createElement('p');summary.textContent=`Best current-version score: ${bestScore()??'none'}${bestScore()!==null?'%':''}. This is not an LMS grade.`;host.append(summary);
  }
  checkpointQuestions.forEach(q=>$$('input',q).forEach(r=>r.addEventListener('change',()=>{
    state.checkpoint.selections[q.id]=r.value;state.checkpoint.activeAttemptId=null;checkpointFeedback({},false);scheduleSave();
  })));
  $('#phase1-checkpoint-form').addEventListener('submit',e=>{
    e.preventDefault();flush();
    const missing=checkpointQuestions.find(q=>!state.checkpoint.selections[q.id]);
    if(missing){$('#checkpoint-result').textContent='Answer every question before submitting. No attempt was recorded.';$('input',missing).focus();return;}
    const fp=fingerprint(state.checkpoint.selections);
    const duplicate=state.checkpoint.attempts.find(a=>a.contentVersion===config.contentVersion&&fingerprint(a.answers)===fp);
    if(duplicate&&state.checkpoint.lastFingerprint===fp){state.checkpoint.activeAttemptId=duplicate.id;renderCheckpoint();$('#checkpoint-result').textContent+=' This unchanged attempt was already saved; no duplicate was added.';flush();return;}
    const a={id:uid(),answers:clone(state.checkpoint.selections),score:scoreAnswers(state.checkpoint.selections),at:stamp(),contentVersion:config.contentVersion};
    state.checkpoint.attempts.push(a);state.checkpoint.activeAttemptId=a.id;state.checkpoint.lastFingerprint=fp;flush();renderCheckpoint();
  });
  $('#checkpoint-clear').addEventListener('click',()=>{
    state.checkpoint.selections={};state.checkpoint.lastFingerprint=null;state.checkpoint.activeAttemptId=null;
    checkpointQuestions.forEach(q=>$$('input',q).forEach(r=>{r.checked=false;r.defaultChecked=false;}));
    checkpointFeedback({},false);flush();renderCheckpoint();$('#checkpoint-result').textContent='New attempt ready. Earlier attempts and their feedback remain in Saved attempts.';
  });
  $('#checkpoint-history').addEventListener('click',e=>{
    const b=e.target.closest('[data-review-attempt]');if(!b)return;
    const a=state.checkpoint.attempts.find(a=>a.id===b.dataset.reviewAttempt);
    if(!a||a.contentVersion!==config.contentVersion)return;
    if(Object.keys(state.checkpoint.selections).length&&!state.checkpoint.activeAttemptId&&fingerprint(a.answers)!==fingerprint(state.checkpoint.selections)&&!confirm('Replace the current unfinished choices with this saved attempt?'))return;
    state.checkpoint.selections=clone(a.answers);state.checkpoint.activeAttemptId=a.id;state.checkpoint.lastFingerprint=fingerprint(a.answers);flush();renderCheckpoint();$('#checkpoint-result').focus();
  });

  function showLabRound(i,focus=true){
    state.labRound=Math.max(0,Math.min(2,i));
    $$('[data-lab-mode="guided"]').forEach(e=>e.hidden=Number(e.dataset.round)!==state.labRound);
    $('#lab-position').textContent=`Case ${state.labRound+1} of 3`;
    $('#lab-prev').disabled=state.labRound===0;$('#lab-next').disabled=state.labRound===2;
    $('#lab-case-picker').value=String(state.labRound);
    if(focus){const h=$(`[data-lab-mode="guided"][data-round="${state.labRound}"] h3`);h.focus();h.scrollIntoView({block:'start'});flush();}
  }
  $('#lab-prev').addEventListener('click',()=>showLabRound(state.labRound-1));
  $('#lab-next').addEventListener('click',()=>showLabRound(state.labRound+1));
  $('#lab-case-picker').addEventListener('change',e=>showLabRound(Number(e.target.value)));
  function renderLabFeedback(panel) {
    const mode=panel.dataset.labMode,i=Number(panel.dataset.round);const a=state.lab[mode].attempts.filter(x=>x.round===i).at(-1);
    $$('input[type=radio]',panel).forEach(r=>r.checked=state.lab[mode].selections[i]===r.value);
    const fb=$('.lab-feedback',panel);fb.replaceChildren();
    if(!a||state.lab[mode].selections[i]!==a.choice)return;
    const p=document.createElement('p');p.textContent=a.correct?'The selected response fits the case.':'Reconsider which response fits the case.';
    const why=document.createElement('p');why.textContent=panel.dataset.explanation;
    const limit=document.createElement('p');limit.className='small';limit.textContent='This feedback checks the selected response. Your written reasoning is saved but is not automatically graded.';
    fb.append(p,why,limit);
  }
  function renderLabHistory(){
    const host=$('#lab-history');host.replaceChildren();
    state.lab.guided.attempts.forEach(a=>{const li=document.createElement('li');li.textContent=`Case ${a.round+1} · ${date(a.at)} · ${a.correct?'response fits':'revisit response'}. Reason written before feedback: ${a.reason}`;host.append(li);});
    if(!host.children.length)host.textContent='No guided attempts recorded yet.';
  }
  $$('[data-lab-mode]').forEach(panel=>{
    const mode=panel.dataset.labMode,i=Number(panel.dataset.round);
    $$('input[type=radio]',panel).forEach(r=>r.addEventListener('change',()=>{state.lab[mode].selections[i]=r.value;$('.lab-feedback',panel).replaceChildren();scheduleSave();}));
    $('[data-lab-check]',panel).addEventListener('click',()=>{
      flush();const choice=state.lab[mode].selections[i],reason=state.drafts[`${mode}-case-${i+1}-reason`]||'';
      if(!choice||!reason.trim()){$('.lab-feedback',panel).textContent='Choose a response and write your reason before checking.';return;}
      state.lab[mode].attempts.push({id:uid(),round:i,choice,reason,correct:choice===panel.dataset.correct,at:stamp()});
      renderLabFeedback(panel);renderLabHistory();flush();
    });
  });

  function renderNotes(){
    const host=$('#note-entry-list');host.replaceChildren();
    if(!state.noteEntries.length){host.textContent='No saved notes yet.';return;}
    state.noteEntries.slice().reverse().forEach(note=>{
      const article=document.createElement('article');article.className='note-entry';
      const top=document.createElement('div');top.className='note-entry-heading';
      const time=document.createElement('time');time.dateTime=note.at;time.textContent=date(note.at);
      const del=document.createElement('button');del.type='button';del.className='note-delete';del.dataset.deleteNote=note.id;del.textContent='Delete';del.setAttribute('aria-label',`Delete note saved ${date(note.at)}`);
      const text=document.createElement('p');text.textContent=note.text;top.append(time,del);article.append(top,text);host.append(article);
    });
  }
  $('#save-note-entry').addEventListener('click',()=>{
    flush();const input=$('#notebook-notes');if(!input.value.trim()){input.focus();return;}
    state.noteEntries.push({id:uid(),at:stamp(),text:input.value});input.value='';state.drafts[input.id]='';flush();renderNotes();if(state.topic==='process-collection')renderWork();input.focus();
  });
  $('#note-entry-list').addEventListener('click',e=>{
    const b=e.target.closest('[data-delete-note]');if(!b)return;const i=state.noteEntries.findIndex(n=>n.id===b.dataset.deleteNote);if(i<0)return;
    deletedNote={note:state.noteEntries[i],index:i};state.noteEntries.splice(i,1);flush();renderNotes();$('#note-delete-undo').hidden=false;$('#undo-note-delete').focus();if(state.topic==='process-collection')renderWork();
  });
  $('#undo-note-delete').addEventListener('click',()=>{
    if(!deletedNote)return;state.noteEntries.splice(Math.min(deletedNote.index,state.noteEntries.length),0,deletedNote.note);deletedNote=null;$('#note-delete-undo').hidden=true;flush();renderNotes();if(state.topic==='process-collection')renderWork();
  });
  function workHTML(includeLinks=true) {
    const link=(id,label='Return to response →')=>includeLinks?`<a class="process-return" href="#${safe(id)}">${safe(label)}</a>`:'';
    const entry=(title,body,id)=>`<div class="process-entry"><strong>${safe(title)}</strong><br>${safe(body)}${id?'<br>'+link(id):''}</div>`;
    let html='<section class="process-group"><h3>My Notes</h3>';
    html+=state.noteEntries.length?state.noteEntries.map(n=>entry(date(n.at),n.text)).join(''):'<p>No saved notes yet.</p>';
    if(has('notebook-notes'))html+=entry('Unfinished note',state.drafts['notebook-notes'],'notebook-notes');
    html+='</section><section class="process-group"><h3>Written responses</h3>';
    let found=0;
    for(const f of fields){if(f.id==='notebook-notes'||!has(f.id))continue;found++;
      const sec=f.closest('.chapter-section');html+=entry(`${$('h2',sec)?.textContent||'Response'} · ${labelFor(f.id)}`,state.drafts[f.id],f.id);
    }
    if(!found)html+='<p>No written responses yet. They appear here after you type in the lessons, practice or Build.</p>';
    html+='</section><section class="process-group"><h3>Review and revision</h3>';
    for(const [n,a] of Object.entries(state.firstChecks))html+=entry(`Question ${n} · first answer captured ${date(a.at)}`,a.text,`review-${n}-revision`);
    if(!Object.keys(state.firstChecks).length)html+='<p>No first-answer snapshots yet.</p>';
    checks.forEach(c=>{const arr=state.practice[c.dataset.check]||[];if(!arr.length)return;
      html+=entry($('legend',c).textContent,arr.map((a,i)=>`${i+1}. ${date(a.at)} — ${$$('input',c).find(x=>x.value===a.choice)?.closest('label')?.textContent.trim()} — ${a.correct?'choice fits':'revisit choice'}`).join('\n'),c.id);
    });
    html+='</section><section class="process-group"><h3>Checkpoint</h3>';
    const draftCount=Object.keys(state.checkpoint.selections).length;
    html+=entry('Current checkpoint choices',`${draftCount} of ${checkpointQuestions.length} answered. An unfinished draft is not a submitted attempt.`,'checkpoint');
    if(!includeLinks&&draftCount)checkpointQuestions.forEach(q=>{const selected=$$('input',q).find(r=>r.value===state.checkpoint.selections[q.id]);if(selected)html+=entry($('legend',q).textContent,selected.closest('label').textContent.trim());});
    if(!state.checkpoint.attempts.length)html+='<p>No submitted checkpoint attempts.</p>';
    state.checkpoint.attempts.forEach(a=>{
      html+=entry(`${date(a.at)} · ${a.score}/${checkpointQuestions.length} · ${a.contentVersion===config.contentVersion?'current content':'earlier content'}`,'Local practice only; not an LMS grade.','checkpoint');
      if(!includeLinks)checkpointQuestions.forEach(q=>{const choice=$$('input',q).find(r=>r.value===a.answers[q.id]);html+=entry($('legend',q).textContent,choice?.closest('label')?.textContent.trim()||'No answer');});
    });
    html+='</section><section class="process-group"><h3>Decision practice</h3>';
    for(const mode of ['guided','untimed']){
      const arr=state.lab[mode].attempts;
      if(!arr.length)html+=`<p>No ${mode} case attempts recorded.</p>`;
      arr.forEach(a=>{const panel=$(`[data-lab-mode="${mode}"][data-round="${a.round}"]`);const chosen=$$('input',panel).find(r=>r.value===a.choice)?.closest('label')?.textContent.trim()||a.choice;html+=entry(`${mode==='guided'?'Guided':'Untimed'} case ${a.round+1} · ${date(a.at)}`,`Selected: ${chosen}. ${a.correct?'Selected response fits':'Revisit selected response'}. Reason before feedback: ${a.reason}`,`${mode}-case-${a.round+1}-reason`);});
    }
    html+='</section><section class="process-group"><h3>Optional game</h3>';
    if(!state.game.attempts.length)html+='<p>No optional game records. The guided or untimed lab is the required conceptual practice.</p>';
    state.game.attempts.forEach(a=>html+=entry(`${date(a.at)} · ${a.status}`,`Game score ${a.score}; active time ${a.elapsed.toFixed(1)} seconds. ${a.reason}. These are game variables, not psychological measurements.`,'game-debrief'));
    html+='</section><section class="process-group"><h3>Topics reviewed</h3><p>'+safe(config.topics.map(t=>`${document.getElementById(t).querySelector('h2').textContent}: ${state.reviewed[t]?'marked reviewed':'not yet marked'}`).join('\n'))+'</p><p>Topic-review marks and local work indicators are not teacher assessment or submission confirmation.</p></section>';
    return html;
  }
  function renderWork(){collect();$('#process-summary').innerHTML=workHTML();}
  function download(name,content,type){
    const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function exportWork(){
    flush();const w=window.open('','_blank');
    if(!w){announce('The print window was blocked. Allow this page to open its print window, then try again.');return;}
    const html=`<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><title>My Work — ${safe(config.title)}</title><style>body{font:16px/1.6 Arial,sans-serif;color:#171b1b;max-width:900px;margin:30px auto;padding:0 28px}h1{font-size:29px}h2,h3{break-after:avoid}h3{font-size:22px;color:#154212}.process-group{border-top:1px solid #d9ded8;margin-top:26px;padding-top:14px}.process-entry{white-space:pre-wrap;overflow-wrap:anywhere;padding:12px 14px;border-left:3px solid #146c60;margin:12px 0;background:#f7f8f5}button{padding:10px 16px;font:inherit}@page{size:Letter;margin:18mm}@media print{button{display:none}body{margin:0;padding:0;font-size:11.5pt}.process-entry{background:white}}</style></head><body><button onclick="window.print()">Print / Save as PDF</button><h1>My Work — ${safe(config.title)}</h1><p>Exported ${safe(date(stamp()))}. Saving a copy does not submit it. This record contains locally stored learner responses and practice records, not proof of identity or independent authorship.</p>${workHTML(false)}</body></html>`;
    w.document.open();w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),250);
  }
  $('[data-export="notebook"]').addEventListener('click',exportWork);
  $('#backup-save').addEventListener('click',()=>{flush();download(`${config.moduleId}-backup.json`,JSON.stringify(state,null,2),'application/json;charset=utf-8');announce('Backup created. Keep it in a safe location; it contains your written work.');});
  $('#backup-load').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;const message=$('#import-message');
    try{
      if(file.size>10*1024*1024)throw new Error('This file exceeds the supported 10 MB backup size. Current work was not changed.');
      const imported=validateBackup(JSON.parse(await file.text()));flush();
      const count=Object.values(imported.drafts).filter(x=>x.trim()).length;
      if(!confirm(`Replace this phase's current work with ${count} filled responses and ${imported.noteEntries.length} notes saved ${date(imported.updatedAt)}? A recovery copy of your current work will be kept. Cancel leaves current work unchanged.`)){message.textContent='Import cancelled. Current work was kept.';return;}
      previousImport=clone(state);try{localStorage.setItem(RECOVERY,JSON.stringify(previousImport));}catch(_){}
      state=imported;state.contentVersion=config.contentVersion;protectedUnreadable=false;restoreUI();navigate(state.topic,{historyMode:'replace',focus:false});flush();$('#undo-import').hidden=false;message.textContent='Backup restored. Check the responses before continuing. Restore previous work is available below.';
    }catch(err){message.textContent='Backup not loaded. '+(err instanceof SyntaxError?'This is not valid JSON. Current work was not changed.':err.message);}
    finally{e.target.value='';}
  });
  $('#undo-import').addEventListener('click',()=>{
    if(!previousImport||!confirm('Restore the work kept immediately before the last import? Current work will be kept as the next recovery copy.'))return;
    flush();const temp=clone(state);state=clone(previousImport);previousImport=temp;try{localStorage.setItem(RECOVERY,JSON.stringify(previousImport));}catch(_){}
    restoreUI();navigate(state.topic,{historyMode:'replace',focus:false});flush();$('#import-message').textContent='Previous work restored.';
  });
  $('#undo-import').hidden=!previousImport;

  function ensureGame(){
    if(gameFrame?.isConnected)return;
    gameSession=uid();gameFrame=document.createElement('iframe');gameFrame.title=config.gameTitle;gameFrame.className='phase1-game-frame';
    gameFrame.setAttribute('sandbox','allow-scripts allow-same-origin');gameFrame.src=`./assets/game/index.html#session=${encodeURIComponent(gameSession)}`;
    $('#game-host').replaceChildren(gameFrame);
  }
  function interruptGame(reason){
    if(!gameFrame?.isConnected)return;
    const target=MESSAGE_ORIGIN==='null'?'*':MESSAGE_ORIGIN;
    gameFrame.contentWindow?.postMessage({channel:'sportswellness-control',activityId:config.gameId,version:1,session:gameSession,command:'interrupt',reason},target);
  }
  function acceptGameMessage(event){
    if(!gameFrame||event.source!==gameFrame.contentWindow||event.origin!==MESSAGE_ORIGIN)return false;
    const d=event.data;
    if(!plain(d)||d.channel!=='sportswellness-game'||d.activityId!==config.gameId||d.version!==1||d.session!==gameSession)return false;
    if(d.type==='ready'){
      gameFrame.contentWindow.postMessage({channel:'sportswellness-control',activityId:config.gameId,version:1,session:gameSession,command:'init'},MESSAGE_ORIGIN==='null'?'*':MESSAGE_ORIGIN);if(state.topic!=='performance-game'||document.hidden)interruptGame('Activity is not visible');return true;
    }
    if(d.type!=='summary'||!validGameRecord(d.record))return false;
    if(state.game.attempts.some(a=>a.id===d.record.id))return false;
    state.game.attempts.push(clone(d.record));flush();if(state.topic==='process-collection')renderWork();return true;
  }
  addEventListener('message',acceptGameMessage);
  function restoreUI(){
    restoreInProgress=true;
    fields.forEach(f=>f.value=state.drafts[f.id]||'');checks.forEach(renderCheck);renderReveals();showStep(state.buildStep,false);showReview(state.reviewPosition,false);showLabRound(state.labRound,false);
    $$('[data-lab-mode]').forEach(renderLabFeedback);renderLabHistory();renderCheckpoint();renderNotes();saveUI();progress();syncNav();restoreInProgress=false;
  }
  // Read-only diagnostics allow the verification harness to inspect, not silently alter, work.
  window.SportsWellness={getState:()=>clone(state),flush,navigate,validateBackup,acceptGameMessage,storageAvailable:()=>storageOK,workHTML:()=>workHTML(false)};
  restoreUI();root.classList.add('enhanced');navigate(hashTarget()||state.topic,{historyMode:'none',focus:false});
})();
