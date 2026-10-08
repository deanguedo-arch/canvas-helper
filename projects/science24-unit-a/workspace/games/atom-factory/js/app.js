import {screens} from './screens.js';
import {createSession,getMission,editMission,lockPrediction,submitMission,canAdvance,addHint,navigate,sessionReview,clone} from './state.js';
import {validate} from './engine.js';
import {render as renderMechanic,refresh,worked} from './renderer.js';
import {escapeHTML as h,panel,table} from './ui.js';
import {polish} from './premium.js';

const app=document.querySelector('#app');
const bank=globalThis.__S24_OFFLINE_DATA || await fetch('data/scenarios.json').then(r=>{if(!r.ok)throw new Error('Scenario file unavailable');return r.json();});
let session=createSession(bank), timer=null, returningFocus=null;
const current=()=>bank.scenarios[session.scenarioIndex];
const mission=()=>getMission(session,bank);
const route=(stage,index=session.scenarioIndex)=>{
  stopReplay();
  if(!navigate(session,bank,stage,index)){announce('The worked solution stays hidden until your first transfer response is submitted.');return;}
  paint(true);
};
function stopReplay(){if(timer){clearInterval(timer);timer=null;}}
function announce(text){const status=app.querySelector('[data-status]');if(status){status.textContent=text;status.focus();}}
function navigation(){
  const s=current(),m=mission();
  if(session.stage==='brief')return;
  let nav=app.querySelector('.mission-nav');
  if(!nav){nav=document.createElement('div');nav.className='mission-nav';app.querySelector('main').append(nav);}
  const next=session.stage==='worked'?'Start supported practice →':session.stage==='feedback'?(session.scenarioIndex===bank.scenarios.length-1?'Review evidence →':'Next mission →'):session.stage==='review'?'Print review':'Check response →';
  nav.innerHTML=`<div class="left"><button class="btn" data-action="previous">← Previous</button><button class="btn ghost" data-action="restart">Restart investigation</button></div><div class="right"><button class="btn primary" data-action="${session.stage==='review'?'print':session.stage==='feedback'||session.stage==='worked'?'next':'check'}" ${session.stage==='feedback'&&!canAdvance(m)?'disabled':''}>${next}</button></div>`;
}
function feedback(){
  const m=mission(),s=current(),r=m.feedback;
  const rubric=[['model','I checked the required model result and units.'],['evidence','I used the supplied evidence or calculation.'],['reasoning','I explained why the result answers this question.'],['limits','I stated an assumption, uncertainty or model limit.']];
  const workspace=app.querySelector('.workspace');workspace.className='workspace two';
  workspace.innerHTML=panel('Your Result',1,'Feedback and visible revision',`<h3 tabindex="-1" class="feedback-status" data-feedback-heading>${r?.valid?'Model checked':'Revise this response'}</h3><p>${h(r?.message||'Check your response first.')}</p><div class="callout"><h3>Your explanation</h3><p class="learner-text">${h(m.explanation||'No explanation entered.')}</p></div><p>Explanation quality: <strong>teacher review pending</strong>.</p><p>${m.attempts.length} submitted attempt(s); ${m.hintsUsed.length} hint(s) used.</p>${s.stage==='transfer'&&m.firstTransferResponse?`<p class="outcome">First transfer response: ${m.firstTransferResponse.result.valid?'model result checked':'required revision'}. This record is preserved when you revise.</p>`:''}<button class="btn" data-action="revise">Revise response</button><details><summary>Compare your submitted attempts</summary>${m.attempts.map((a,i)=>`<h4>Attempt ${i+1}</h4><p>${h(a.result.message)}</p><p>${h(a.answer.explanation)}</p><pre class="attempt-data">${h(JSON.stringify(Object.fromEntries(Object.entries(a.answer).filter(([k])=>k!=='explanation')),null,2))}</pre>`).join('')}</details>`)+
    panel('Reasoning Self-review',2,'A checklist does not certify your explanation',`<p>Read your explanation against these criteria. Revise it if a criterion is missing. The teacher evaluates its quality.</p><div class="self-review">${rubric.map(([k,l])=>`<label><input type="checkbox" data-rubric="${k}" ${m.selfReview[k]?'checked':''}>${h(l)}</label>`).join('')}</div><p>${s.stage==='transfer'?'Independent first-attempt evidence and subsequent correction are reported separately.':'Your draft and earlier attempts remain available.'}</p>`);
  setBottom(r?.valid?'Model checked':'Revision needed',r?.message||'Check the response.', 'Reasoning review','Use the visible criteria; teacher approval remains pending.','next','Continue →',!canAdvance(m));
}
function review(){
  const rows=sessionReview(session,bank), transfer=rows.at(-1);
  const workspace=app.querySelector('.workspace');workspace.className='workspace two';
  workspace.innerHTML=panel('Your Investigation',1,'Completion and evidence are different',`<h3>${h(bank.title)} review</h3><p>All ${rows.length} learner missions have been checked. Open explanations still need teacher judgment.</p>${rows.map(r=>`<section class="review-row" data-review-id="${r.id}" data-first-valid="${r.firstTransfer?.result.valid??''}"><h3>${h(r.id)} · ${h(r.title)}</h3><p>Current model: ${r.checked?'checked':'unverified'} · ${r.attempts} attempt(s) · ${r.hints} hint(s).</p><p class="learner-text">${h(r.explanation)}</p><p>Explanation quality: ${h(r.explanationQuality)}.</p>${r.firstTransfer?`<details><summary>Preserved first transfer response</summary><p>${h(r.firstTransfer.answer.explanation)}</p><p>${h(r.firstTransfer.result.message)}</p><pre class="attempt-data">${h(JSON.stringify(r.firstTransfer.answer,null,2))}</pre></details>`:''}<button class="btn" data-revisit="${r.id}">Revisit this mission</button></section>`).join('')}`)+
    panel('Independent Transfer',2,'Support history stays visible',`<h3>${transfer.independentFirstResult?'First independent model result checked':'Independent success not established'}</h3><p>${transfer.firstTransfer?'Your first submitted transfer is preserved separately from revisions.':'No transfer has been submitted.'}</p><p>${session.transferSupportRevisited?'Earlier practice was revisited after transfer began.':'Earlier practice was not revisited after transfer began.'}</p><p>Explanation quality: teacher review pending.</p><h3>Next practice</h3><p>${h(bank.nextPractice)}</p><button class="btn primary" data-action="print">Print / save this review</button><p class="small-note">This session stays in memory only. Print before closing if you need a record. Do not enter your name or personal information.</p>`);
  setBottom('Review ready','Model correctness, support and reasoning review are recorded separately.','Next step',bank.nextPractice,'print','Print review');
}
function setBottom(title,text,key,keyText,action,label,disabled=false){
  const strip=app.querySelector('.bottom-strip');if(!strip)return;
  strip.innerHTML=`<div class="bottom-cell"><span class="status-icon" aria-hidden="true">✓</span><div><h3>${h(title)}</h3><p>${h(text)}</p></div></div><div class="bottom-cell"><span class="status-icon" aria-hidden="true">!</span><div><h3>${h(key)}</h3><p>${h(keyText)}</p></div></div><div class="bottom-cell"><button class="btn primary" data-action="${action}" ${disabled?'disabled':''}>${h(label)}</button></div>`;
}
function paint(moveFocus=false){
  const s=current(),m=mission();
  const map={brief:'01_title',worked:'02_worked',attempt:s.stage==='low_support'?'05_reduced_support':'03_supported',feedback:'04_feedback',transfer:'06_transfer',review:'07_review'};
  app.innerHTML=screens[map[session.stage]];
  app.dataset.stage=session.stage;app.dataset.scenario=s.id;
  const heading=app.querySelector('h1');heading.tabIndex=-1;
  if(session.stage==='brief'){
    app.querySelectorAll('button').forEach(b=>b.dataset.action=/how/i.test(b.textContent)?'help':'start');
  }else if(session.stage==='worked'){
    m.predictionLocked=true;m.revealed=true;m.explanation=s.teacherReasoning;
    app.querySelector('.workspace').innerHTML=renderMechanic(s,m,false);
    refresh(app,s,m);
  }else if(session.stage==='attempt'||session.stage==='transfer'){
    const ws=app.querySelector('.workspace');ws.className='workspace';ws.innerHTML=renderMechanic(s,m,session.stage==='transfer');
    if(session.stage==='transfer'){
      const panels=[...ws.querySelectorAll(':scope > .panel')];
      if(panels.length===3){
        const body=panels[2].querySelector('.panel-body');body.querySelector('.panel-subtitle')?.remove();
        if(bank.game_id==='C1'){
          const routeBody=panels[1].querySelector('.panel-body');routeBody.querySelector('.panel-subtitle')?.remove();
          panels[0].querySelector('.panel-body').append(...routeBody.childNodes);
          panels[1].innerHTML=panels[2].innerHTML;panels[1].querySelector('.index').textContent='02';
        }else panels[1].querySelector('.panel-body').append(...body.childNodes);
        panels[2].remove();
      }
      ws.className='workspace two';
    }
    if(s.stage==='low_support')app.querySelectorAll('[data-action=hint]').forEach(el=>el.remove());
    app.querySelector('.screen-meta').innerHTML=`${h(s.stage==='transfer'?'Fresh transfer':s.stage==='low_support'?'Reduced-support practice':'Practice')} · ${h(s.id)}<br>${h(bank.unitTitle)}`;
    setBottom(session.stage==='transfer'?'Independent response':m.predictionLocked?'Prediction committed':'Prediction required',session.stage==='transfer'?'The worked solution stays hidden during your first response.':'Build, check and explain using the supplied model.', 'Key idea',s.keyIdea,'check',session.stage==='transfer'?'Submit transfer →':'Check model →');
  }else if(session.stage==='feedback')feedback();else review();
  polish(app,bank,s,session,m);
  navigation();
  const main=app.querySelector('main');
  main.insertAdjacentHTML('beforeend',`<div class="help-bar"><p class="small-note">Anonymous practice. Work remains in memory; reloading or closing clears this session.</p><button class="btn" data-action="help">How to play</button></div><p data-status class="feedback-status status-region" role="status" aria-live="polite" tabindex="-1"></p><div data-hint hidden class="callout" tabindex="-1"></div>`);
  // Initial and historical source images use exactly the supplied assets.
  app.querySelectorAll('img').forEach(img=>{
    const rel=img.getAttribute('src');if(globalThis.__S24_ASSETS?.[rel])img.src=globalThis.__S24_ASSETS[rel];
    img.addEventListener('error',()=>{img.hidden=true;const p=document.createElement('p');p.className='callout';p.textContent='Context image unavailable. All required scientific data remain in the task.';img.after(p);},{once:true});
  });
  if(moveFocus)(session.stage==='feedback'?app.querySelector('[data-feedback-heading]'):app.querySelector('h1'))?.focus();
}
function previous(){
  if(session.stage==='worked')route('brief',0);
  else if(session.stage==='feedback')route(current().stage==='transfer'?'transfer':'attempt');
  else if(session.stage==='review')route('feedback',bank.scenarios.length-1);
  else if(session.scenarioIndex===1)route('worked',0);
  else route('feedback',session.scenarioIndex-1);
}
function next(){
  if(session.stage==='worked')route('attempt',1);
  else if(session.stage==='feedback'&&canAdvance(mission())){
    const idx=session.scenarioIndex+1;
    if(idx===bank.scenarios.length){
      if(bank.scenarios.slice(1).every(s=>canAdvance(session.missions[s.id])))route('review',session.scenarioIndex);
      else announce('A revisited mission has an unverified change. Recheck it before completing the review.');
    }else route(bank.scenarios[idx].stage==='transfer'?'transfer':'attempt',idx);
  }
}
function showHelp(){
  returningFocus=document.activeElement;
  let dialog=document.querySelector('#game-help');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='game-help';document.body.append(dialog);}
  dialog.innerHTML=`<h2>How to play ${h(bank.title)}</h2><ol>${bank.instructions.map(t=>`<li>${h(t)}</li>`).join('')}</ol><p>All controls work without dragging. Use Tab to move, Enter/Space to activate, and arrow keys in selects. Previous preserves your work; Restart asks before clearing it.</p><p>Models use authored teaching data. Open explanations are not graded automatically. No names or real personal information are needed.</p><button class="btn primary" data-close-help>Return to game</button>`;
  dialog.querySelector('[data-close-help]').onclick=()=>dialog.close();
  dialog.onclose=()=>returningFocus?.focus();dialog.showModal();
}
function replay(step=false){
  const m=mission();if(session.stage!=='worked'&&!m.predictionLocked){announce('Commit your prediction before replay.');return;}
  m.revealed=true;
  if(step){m.replayTime=Math.round((m.replayTime+0.5)*10)/10;refresh(app,current(),m);return;}
  stopReplay();m.replayTime=0;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){m.replayTime=100;refresh(app,current(),m);return;}
  timer=setInterval(()=>{m.replayTime+=0.1;refresh(app,current(),m);if(m.replayTime>12)stopReplay();},100);
}
app.addEventListener('input',e=>{
  const el=e.target,m=mission();
  if(el.matches('[data-prediction]')&&!m.predictionLocked){m.prediction=el.value;return;}
  if(el.dataset.field){editMission(m,el.dataset.field,el.value);refresh(app,current(),m);}
});
app.addEventListener('change',e=>{
  const el=e.target,m=mission();
  if(el.dataset.rubric){m.selfReview[el.dataset.rubric]=el.checked;navigation();setBottom(m.feedback?.valid?'Model checked':'Revision needed',m.feedback?.message||'', 'Reasoning review','Self-review is recorded; teacher judgment remains pending.','next','Continue →',!canAdvance(m));}
});
app.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button||button.disabled)return;
  const m=mission(),s=current();
  if(button.dataset.step){editMission(m,button.dataset.step,Math.max(0,(Number(m.modelInputs[button.dataset.step])||0)+Number(button.dataset.delta)));const field=button.dataset.step,delta=button.dataset.delta;paint();app.querySelector(`[data-step="${field}"][data-delta="${delta}"]`)?.focus();return;}
  if(button.dataset.choice){editMission(m,button.dataset.choice,button.dataset.value);const choice=button.dataset.choice,value=button.dataset.value;paint();app.querySelector(`[data-choice="${choice}"][data-value="${CSS.escape(value)}"]`)?.focus();return;}
  if(button.dataset.measure){const chosen=new Set(m.modelInputs.measures||[]);chosen.has(button.dataset.measure)?chosen.delete(button.dataset.measure):chosen.add(button.dataset.measure);editMission(m,'measures',[...chosen]);const measure=button.dataset.measure;paint();app.querySelector(`[data-measure="${CSS.escape(measure)}"]`)?.focus();return;}
  if(button.dataset.revisit){const idx=bank.scenarios.findIndex(x=>x.id===button.dataset.revisit);route(bank.scenarios[idx].stage==='transfer'?'transfer':'attempt',idx);return;}
  switch(button.dataset.action){
    case 'start':route('worked',0);break;
    case 'title':route('brief',0);break;
    case 'help':showHelp();break;
    case 'previous':previous();break;
    case 'next':next();break;
    case 'lock':if(lockPrediction(m)){paint();app.querySelector('.workspace section:nth-child(2) h2')?.setAttribute('tabindex','-1');app.querySelector('.workspace section:nth-child(2) h2')?.focus();}else announce('Choose a prediction first.');break;
    case 'check':{
      const r=submitMission(session,s,m,validate);
      if(r.incomplete){announce(r.message);break;}
      route('feedback');break;
    }
    case 'revise':route(s.stage==='transfer'?'transfer':'attempt');break;
    case 'hint':{
      const idx=m.hintsUsed.length;
      if(idx>=s.hints.length){announce('All targeted hints have been shown. Use the reasoning criteria or revisit your model.');break;}
      addHint(m,idx);const hint=app.querySelector('[data-hint]');hint.hidden=false;hint.textContent=`Hint ${idx+1}: ${s.hints[idx]}`;hint.focus();break;
    }
    case 'restart':if(confirm('Restart this investigation? This clears all answers, attempts and transfer work in this session.')){stopReplay();session=createSession(bank);paint(true);}break;
    case 'print':window.print();break;
    case 'replay':replay();break;
    case 'step':replay(true);break;
    case 'pause':stopReplay();announce('Replay paused. Your model and answers are preserved.');break;
  }
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopReplay();});
window.addEventListener('pagehide',stopReplay);
paint();
