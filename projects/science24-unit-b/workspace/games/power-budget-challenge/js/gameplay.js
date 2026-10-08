import {escapeHTML as h} from './ui.js';
import {challenges,account,initialConfig,replayAccount,VERSION} from './gameplay-model.js';
import {createGame,edit,latest,currentCheck,complete,submit,finish,open,hint,takeReplay,review} from './gameplay-state.js';

const app=document.querySelector('#app');
const read=async path=>{const r=await fetch(path);if(!r.ok)throw new Error('Game data could not be loaded.');return r.json();};
let bank,extra,all,core,game,frame=0,running=false,animationStart=0,animationFrom=0,lastSubmission=-1000;
const fmt=(n,dp=3)=>Number.isFinite(n)?n.toFixed(dp):'—';
const asset=p=>globalThis.__S24_ASSETS?.[p]||p;
const scenario=()=>all.find(s=>s.id===game.currentId);
const mission=()=>game.missions[game.currentId];
const icon=id=>({lamps:'lamp',projector:'projector',computers:'computer',fan:'fan'}[id]);
const image=(id)=>icon(id)?`<img src="${asset('assets/sprites/sprite_'+icon(id)+'.png')}" alt="">`:`<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="25" y="10" width="30" height="58" rx="4" fill="#e1e6e2" stroke="#526c5d" stroke-width="3"/><path d="M33 25h14M33 35h14M33 45h14M33 55h14" stroke="#526c5d" stroke-width="3"/></svg>`;
function stop(){if(frame)cancelAnimationFrame(frame);frame=0;running=false;if(game?.mode==='play')app.querySelectorAll('[data-action="run"]').forEach(b=>b.disabled=scenario().stage!=='transfer'&&!mission().prediction);}
function announce(text){const el=app.querySelector('#notice');if(el)el.textContent=text;}
function setStage(mode){stop();game.mode=mode;paint(true);}
function visit(s){stop();if(!open(game,s)){announce('Submit your first independent response before opening earlier support. Your draft is kept.');return;}paint(true);}
function permittedSupport(){return !game.transferStarted||!!game.missions['B2-T01'].firstTransferResponse;}
function header(){
  return `<div class="pilot-heading"><div><h1 id="game-title" tabindex="-1">B2 Power Budget Challenge</h1><p>Keep the centre running. Make every kilowatt-hour count.</p></div><nav aria-label="Game menu"><button data-action="home">Home</button><button data-action="help">How to play</button><button data-action="review">My work</button></nav></div>
  <nav class="rounds" aria-label="Core missions">${core.map((s,i)=>`<button data-open="${s.id}" ${i>game.unlocked?'disabled':''} ${game.mode==='play'&&game.currentId===s.id?'aria-current="step"':''}><span>${complete(game.missions[s.id])?'✓':i+1}</span>${h(['Coached opening','Lighting','Computer room','Projector','Efficiency','Independent'][i])}</button>`).join('')}</nav>`;
}
function home(){
  const begun=core.some(s=>game.missions[s.id].trials.length);
  return `<section class="welcome"><div class="welcome-copy"><h2>You run the community centre.</h2><p>People need light, computers and a room that works. Your plan has to provide those services and fit the energy budget.</p><p>Try a plan. Watch what it uses. Repair what falls short.</p><button class="primary" data-action="start">${begun?'Continue the coached route':'Start with a small repair'} <span aria-hidden="true">→</span></button><p class="welcome-note">Six short missions · about 10–15 minutes · take the time you need</p></div><img src="${asset('assets/premium/scene-v1.png')}" alt="Riverside Community Centre at dusk"></section>
  <section class="choose-play" aria-label="Other ways to play"><div><h2>Explore the whole centre</h2><p>Adjust five services with live energy forecasts. Can you cut the extra hours and keep every service?</p><button data-action="lab">Open centre lab</button></div><div><h2>A fresh challenge</h2><p>Eight authored challenges bring different service needs, equipment and constraints.</p><button data-action="fresh">Try a replay challenge</button><p class="small">${game.seenReplay.length} of 8 challenges opened in this session.</p></div></section>`;
}
function predictions(s,m){
  const options=s.input_j!=null?['Motor A is more efficient','Motor B is more efficient','The efficiencies are equal']:['Fits the cap and every service','The energy cap will be exceeded','At least one service will be missing'];
  const body=`<p>${s.input_j!=null?'Predict which motor gives the larger useful-output fraction.':'Predict what will happen to your current plan.'}</p><div class="prediction-options">${options.map(t=>`<button data-prediction="${h(t)}" aria-pressed="${m.prediction===t}">${h(t)}</button>`).join('')}</div>`;
  return m.revealed?`<details class="prediction"><summary>Your prediction: ${h(m.prediction)}</summary>${body}</details>`:`<section class="prediction" aria-labelledby="prediction-title"><h3 id="prediction-title">First, make a prediction</h3>${body}</section>`;
}
function controls(s,m){
  if(s.input_j!=null)return `<div class="motor-choices">${s.fixtures.map(f=>`<button data-fixture="${f.id}" aria-pressed="${m.config.fixture===f.id}"><svg viewBox="0 0 110 75" aria-hidden="true"><rect x="20" y="17" width="65" height="42" rx="6" fill="#d6ded8" stroke="#476051" stroke-width="3"/><path d="M30 25v26m10-26v26m10-26v26m10-26v26m10-26v26M85 38h17" stroke="#476051" stroke-width="4"/></svg><strong>${h(f.name)}</strong><span>Input: ${f.input} J</span><span>Useful motion: ${f.useful} J</span></button>`).join('')}</div><label class="efficiency-input">Predict the selected motor’s efficiency (%)<input data-config="efficiency" type="number" min="0" max="100" step="any" value="${h(m.config.efficiency??'')}" inputmode="decimal" placeholder="Your calculation"></label><p class="small">Choosing a motor changes the measured account used in the test.</p>`;
  return `<div class="device-controls">${s.serviceRequirements.map(r=>`<section class="device-control" data-device="${r.id}"><div class="device-name">${image(r.id)}<div><h3>${h(r.name)}</h3><p>Need ${r.requiredCount} for at least ${r.requiredHours} h each.</p></div></div>
    ${r.powers.length>1?`<div class="equipment-options" aria-label="Equipment for ${h(r.name)}">${r.powers.map((p,i)=>`<button data-power="${r.id}" data-value="${p}" aria-pressed="${Number(m.config[r.id+'_power'])===p}">${p} W${r.id==='projector'?` · ${String.fromCharCode(65+i)}`:''}</button>`).join('')}</div><p class="small">These alternatives provide the same stated service.</p>`:`<p class="power-rating">${r.powers[0]} W per device</p>`}
    <div class="device-fields"><label>Quantity${s.fixedCounts?`<strong>${h(m.config[r.id+'_count'])}</strong>`:`<input type="number" data-config="${r.id}_count" aria-label="Quantity of ${h(r.name)}" min="0" max="24" step="1" value="${h(m.config[r.id+'_count'])}" inputmode="numeric">`}</label><label>Hours per device<div class="stepper"><button data-step="${r.id}_hours" data-delta="-0.5" aria-label="Reduce hours for ${h(r.name)}">−</button><input type="number" data-config="${r.id}_hours" aria-label="Hours for ${h(r.name)}" min="0" max="24" step="0.5" value="${h(m.config[r.id+'_hours'])}" inputmode="decimal"><button data-step="${r.id}_hours" data-delta="0.5" aria-label="Increase hours for ${h(r.name)}">+</button></div></label></div><p class="device-feedback" data-device-feedback="${r.id}"></p></section>`).join('')}</div>`;
}
function rooms(s,m,model){
  if(s.input_j!=null)return `<div class="motor-bay"><h3>The selected motor’s energy account</h3><div class="motor-route"><div><strong>${model.ready?model.fixture.input:'—'} J</strong><span>Energy in</span></div><span aria-hidden="true">→</span><div class="motor-unit">${h(model.ready?model.fixture.name:'Choose a motor')}</div><span aria-hidden="true">→</span><div><strong>${m.revealed&&model.ready?model.fixture.useful:'?'} J</strong><span>Useful motion</span><strong>${m.revealed&&model.ready?model.other:'?'} J</strong><span>Other output</span></div></div><div class="energy-split" aria-label="Useful and other energy shares">${m.revealed&&model.ready?`<span style="width:${model.percent}%">Useful</span><span style="width:${100-model.percent}%">Other</span>`:'<span class="unknown">Run the test to compare the shares.</span>'}</div><p>Energy is transferred to useful motion and other outputs. The full account must balance.</p></div>`;
  const rows=model.ready?model.rows:s.serviceRequirements.map(r=>({...r,count:m.config[r.id+'_count'],hours:m.config[r.id+'_hours'],watts:m.config[r.id+'_power']}));
  return `<div class="room-board">${rows.map(r=>`<section class="room ${!m.revealed?'pending':r.service?'provided':'missing'}" data-room="${r.id}"><div class="room-window" aria-hidden="true"><span></span><span></span><span></span><span></span>${image(r.id)}</div><h3>${h(r.name)}</h3><p>${h(r.count)} device${Number(r.count)===1?'':'s'} · ${h(r.hours)} h each</p><strong>${!m.revealed?'Ready for a test':r.service?'Planned service met':'Service missing'}</strong><span class="room-use" data-room-use="${r.id}">${m.revealed?fmt(r.kwh)+' kWh forecast':''}</span></section>`).join('')}</div>`;
}
function forecast(s,m,model){
  const independent=s.stage==='transfer';
  if(!m.revealed)return `<div class="forecast-hidden"><h3>${independent?'Your independent account':'What will your plan do?'}</h3><p>${independent?'Calculated totals stay hidden until you submit your own calculation and explanation.':'Make a prediction, then run your plan. After that, you can explore with live forecasts.'}</p>${s.cap_kwh?`<strong>Energy cap: ${fmt(s.cap_kwh)} kWh</strong>`:''}</div>`;
  if(!model.ready)return `<div class="forecast issue"><h3>Finish the plan</h3><p>${h(model.message)}</p></div>`;
  if(model.kind==='efficiency')return `<div class="forecast ${model.valid?'met':'issue'}"><div class="forecast-main"><div><span>Calculated efficiency</span><strong>${fmt(model.percent,2)}<small>%</small></strong></div><div><span>Other output</span><strong>${model.other}<small> J</small></strong></div></div><p>${model.usefulMet?'Useful-motion requirement met.':'Useful-motion requirement missing.'} ${model.efficiencyMet?'Efficiency target met.':'Efficiency target missing.'}</p><p class="calculation">${model.fixture.useful} ÷ ${model.fixture.input} × 100 = ${fmt(model.percent,2)}%</p></div>`;
  return `<div class="forecast ${model.valid?'met':'issue'}"><div class="forecast-main"><div><span>${independent?'Model total':'Live draft forecast'}</span><strong>${fmt(model.total_kwh)}<small> kWh</small></strong></div><div><span>Energy cap</span><strong>${fmt(s.cap_kwh)}<small> kWh</small></strong></div></div><div class="cap-track" role="meter" aria-label="Energy compared with the cap" aria-valuemin="0" aria-valuemax="${s.cap_kwh}" aria-valuenow="${Math.min(model.total_kwh,s.cap_kwh)}" aria-valuetext="${fmt(model.total_kwh)} kWh against a ${fmt(s.cap_kwh)} kWh cap"><span style="width:${Math.min(100,model.total_kwh/s.cap_kwh*100)}%"></span></div><p><strong>${model.servicesMet?'Every planned service met':'A required service is missing'}</strong> · ${model.underCap?fmt(model.remaining)+' kWh within the cap':fmt(-model.remaining)+' kWh over the cap'}</p>${model.valid?'<p>Your draft fits. Run it to record a trial.</p>':''}</div>`;
}
function calculationTable(s,m,model){
  if(!m.revealed||!model.ready||model.kind!=='plan')return '';
  return `<details class="account-table" ${s.coach?'open':''}><summary>See the energy account for this draft</summary><div class="table-scroll"><table><caption>Each power rating is per device. Convert W to kW before multiplying by hours.</caption><thead><tr><th>Device</th><th>Calculation</th><th>Energy</th></tr></thead><tbody>${model.rows.map(r=>`<tr><th scope="row">${h(r.name)}</th><td>${r.count} × ${fmt(r.watts/1000,3)} kW × ${r.hours} h</td><td>${fmt(r.kwh)} kWh</td></tr>`).join('')}</tbody></table></div></details>`;
}
function evidenceOptions(s){return s.input_j!=null?[['ratio','Useful output divided by input'],['motion','Useful-motion requirement']]:[['energy','Device energy account'],['services','Required quantities and hours']];}
function quickForecast(s,m,model){
  if(!m.revealed)return `<strong>${s.input_j!=null?'Choose a motor':`Cap: ${fmt(s.cap_kwh)} kWh`}</strong><span>${s.stage==='transfer'?'Your totals stay hidden until submission':m.prediction?'Prediction made · ready to test':'Make your prediction above'}</span>`;
  if(!model.ready)return `<strong>Finish your plan</strong><span>${h(model.message)}</span>`;
  if(model.kind==='efficiency')return `<strong>${fmt(model.percent,2)}% · ${model.fixture.useful} J useful</strong><span>${model.valid?'Both motor targets met':'A motor target is missing'}</span>`;
  return `<strong>${fmt(model.total_kwh)} / ${fmt(s.cap_kwh)} kWh</strong><span>${model.servicesMet?'All required services covered':'A required service is missing'} · ${model.underCap?'within cap':'over cap'}</span>`;
}
function accomplishment(s,m){
  const result=latest(m)?.result;
  if(!result?.valid)return '';
  if(result.kind==='efficiency')return `${result.fixture.useful} J of useful motion at ${fmt(result.percent,2)}% efficiency. Both motor targets met.`;
  const original=account(s,initialConfig(s));
  const saved=original.ready?original.total_kwh-result.total_kwh:0;
  return saved>0.000001?`Saved ${fmt(saved)} kWh from the starting plan while keeping every required service.`:`Every required service covered, with ${fmt(result.remaining)} kWh left in the budget.`;
}
function reasoning(s,m,independent=false){
  return `<div class="reasoning"><h3>${independent?'Your claim and evidence':'What made your plan work?'}</h3>${!independent?`<p class="achievement">${h(accomplishment(s,m))}</p>`:''}<div class="evidence-choices" aria-label="Supporting evidence">${evidenceOptions(s).map(([id,text])=>`<button data-evidence="${id}" aria-pressed="${m.evidence===id}">${h(text)}</button>`).join('')}</div><label>Explain your decision in a sentence or two<textarea data-answer="explanation" rows="2" maxlength="1200" placeholder="I changed… because the account shows…">${h(m.explanation)}</textarea></label><p class="small">Your reasoning is kept for teacher review.</p>${!independent?`<button class="primary" data-action="finish">${s.stage==='worked'?'Finish the coached repair':s.stage==='lab'?'Keep this centre plan':'Complete this mission'}</button>`:''}</div>`;
}
function debrief(s,m){
  if(s.stage==='transfer')return '';
  if(complete(m))return `<div class="accomplished"><h3>${s.stage==='lab'?'Centre plan kept':s.stage==='worked'?'You repaired the evening plan':'Mission complete'}</h3><p class="achievement">${h(accomplishment(s,m))}</p><p>${h(m.completion.explanation)}</p><p>Model result recorded · explanation review pending</p><button class="primary" data-action="next">${s.stage==='replay'?'Try another fresh challenge':s.stage==='lab'?'Try a fresh challenge':'Continue'} →</button><button data-action="revise-claim">Revise my explanation</button></div>`;
  if(currentCheck(m))return reasoning(s,m);
  const t=latest(m);
  return t?`<div class="trial-message ${t.result.valid?'':'issue'}"><h3>${t.modelKey===JSON.stringify(m.config)?t.result.valid?'Plan checked':'Repair the plan':'Draft changed'}</h3><p>${t.modelKey===JSON.stringify(m.config)?h(t.result.message):'Your last trial is kept. Run this changed draft to record its result.'}</p><p class="small">${m.trials.length} recorded trial${m.trials.length===1?'':'s'}.</p></div>`:'';
}
function trialHistory(m){
  return m.trials.length?`<details class="history"><summary>Recorded trials (${m.trials.length})</summary>${m.trials.map(t=>`<section><h4>Trial ${t.id} · ${t.result.valid?'model target met':'needs revision'}</h4><p>${h(t.result.message)}</p><p>Prediction: ${h(t.prediction||'Independent response')} · ${t.hintsUsed.length} hints · ${h(t.supportMode)}</p><pre>${h(JSON.stringify(t.answer,null,2))}</pre>${m.completions.filter(c=>c.trialId===t.id).map(c=>`<p>Recorded claim: ${h(c.explanation)} · evidence: ${h(c.evidence)}</p>`).join('')}</section>`).join('')}</details>`:'';
}
function play(){
  const s=scenario(),m=mission(),model=account(s,m.config),independent=s.stage==='transfer';
  return `<div class="mission-intro"><div><p class="mode-label">${h(s.stage==='worked'?'Coached opening':s.stage==='transfer'?'Independent challenge':s.stage==='lab'?'Open experimentation':s.stage==='replay'?'Replay challenge':'Practice mission')} · ${s.id}</p><h2>${h(s.title)}</h2><p class="mission-goal">${h(s.goal)}</p></div><button data-action="${s.stage==='lab'?'fresh':'lab'}" ${!permittedSupport()?'disabled':''}>${s.stage==='lab'?'Fresh challenge':'Centre lab'}</button></div>
    ${s.coach?'<p class="coach"><strong>Try a repair:</strong> start with your prediction, then compare the two lamp options. Keep the four lamps and full five hours.</p>':''}
    ${!independent?predictions(s,m):''}
    <div class="play-layout"><section class="experiment" aria-label="Centre model"><div class="scene-banner"><img src="${asset('assets/premium/scene-v1.png')}" alt=""><span>Riverside Community Centre</span></div><div id="room-board">${rooms(s,m,model)}</div>
    <div id="forecast">${forecast(s,m,model)}</div><div id="calculation">${calculationTable(s,m,model)}</div>
    ${independent?'<p class="independent-note">This is your first independent response. Earlier support opens after you submit. A correction will remain separate from that first response.</p>':''}
    <div class="run-controls">${m.revealed&&s.input_j==null?'<button data-action="replay">Replay this draft</button><button data-action="pause">Pause</button><button data-action="resume">Resume</button><button data-action="step">Step ½ h</button>':''}</div>
    <div class="replay-line" ${!m.revealed||s.input_j!=null?'hidden':''}><span data-clock>0.0 h</span><progress data-time value="0" max="1" aria-label="Illustrative day replay"></progress><span data-used>0.000 kWh in replay</span></div>
    <p class="small replay-assumption" ${!m.revealed||s.input_j!=null?'hidden':''}>Illustrative day: all devices start together and stop after their planned hours. The replay does not change your recorded answer.</p>
    <div id="debrief">${debrief(s,m)}</div>${independent?`<div class="transfer-result" id="transfer-result">${m.revealed?`<h3>${currentCheck(m)?'Model checked':'Revise your response'}</h3><p>${h(latest(m)?.result.message||'')}</p><p>First response: ${m.firstTransferResponse.result.valid?'model correct':'needed revision'}. This record is preserved.</p>${complete(m)?'<button class="primary" data-action="review">Review my work →</button>':''}`:''}</div>`:''}
    </section><section class="planning" aria-label="Plan controls"><h2>${s.input_j!=null?'Choose your motor':'Your plan'}</h2><div class="plan-command"><div id="quick-forecast" role="status" aria-live="polite">${quickForecast(s,m,model)}</div><button class="primary run" data-action="run" ${!independent&&!m.prediction?'disabled':''}>${independent?'Submit independent plan':s.input_j!=null?'Test this motor':'Run this plan'} <span aria-hidden="true">▶</span></button></div>${controls(s,m)}
    ${independent?`<section class="transfer-answer"><h3>Your calculations</h3><p>The original table uses the 200 W projector. Keep all services in your repaired plan.</p><label>Original total (kWh)<input type="number" min="0" step="any" inputmode="decimal" data-config="initialTotal" value="${h(m.config.initialTotal??'')}" placeholder="Your total"></label><label>Your repaired total (kWh)<input type="number" min="0" step="any" inputmode="decimal" data-config="repairedTotal" value="${h(m.config.repairedTotal??'')}" placeholder="Your total"></label>${reasoning(s,m,true)}</section>`:''}
    ${(s.hints?.length&&s.stage!=='low_support')?`<button data-action="hint" ${independent&&!m.firstTransferResponse?'disabled':''}>Get a hint ${m.hints.length?'('+m.hints.length+' used)':''}</button><div class="shown-hints">${m.hints.map(t=>`<p>${h(t)}</p>`).join('')}</div>`:''}
    ${trialHistory(m)}<details><summary>Model assumptions</summary><ul>${extra.assumptions.map(t=>`<li>${h(t)}</li>`).join('')}</ul></details></section></div>
    <nav class="end-nav" aria-label="Mission navigation"><button data-action="back">← Previous mission</button><button data-action="restart">Restart session</button></nav>`;
}
function workReview(){
  const rows=review(game,core),first=game.missions['B2-T01'].firstTransferResponse;
  return `<section class="work-review"><h2>Your work in this session</h2><p>${rows.filter(r=>r.complete).length} of 6 core missions completed. Model results, support and explanations are recorded separately.</p>${first?`<div class="independent-summary"><h3>${rows.at(-1).independentFirstModel?'First independent model result correct':'Independent first-attempt success not established'}</h3><p>Your first response is preserved. Later correction does not replace it. Explanation quality remains teacher review pending.</p><details><summary>Read the original transfer response</summary><pre>${h(JSON.stringify(first.answer,null,2))}</pre><p>${h(first.result.message)}</p></details></div>`:'<p>The independent challenge has not been submitted yet.</p>'}
      <table><caption>Core mission record</caption><thead><tr><th>Mission</th><th>Current work</th><th>Trials / support</th></tr></thead><tbody>${rows.map(r=>`<tr><th scope="row"><button data-open="${r.id}" ${core.findIndex(s=>s.id===r.id)>game.unlocked?'disabled':''}>${r.id} · ${h(r.title)}</button></th><td>${r.complete?'Completed':r.modelChecked?'Model checked; explanation pending':'Unverified draft'}<p>${h(r.explanation||'No explanation yet.')}</p></td><td>${r.trials} trials · ${r.hints} hints<p>${h(r.supportMode)}</p></td></tr>`).join('')}</tbody></table>
      <h3>Replay and open experimentation</h3><p>${game.seenReplay.length} of 8 replay challenges opened.</p><div class="replay-list">${all.filter(s=>s.stage==='replay'||s.stage==='lab').map(s=>{const m=game.missions[s.id];return `<button data-open="${s.id}">${h(s.title)} · ${complete(m)?'Completed':m.trials.length?'Tried':'Not tried'}</button>`;}).join('')}</div><p>All open explanations need teacher judgment. Practice completion is not a course grade.</p><button class="primary" data-action="print">Print / save this record</button></section>`;
}
function exhausted(){return `<section class="pool-end"><h2>You have opened all eight fresh challenges.</h2><p>Choose a case to revisit. Its earlier drafts and trials remain available.</p><div class="replay-list">${all.filter(s=>s.stage==='replay').map(s=>`<button data-open="${s.id}">${h(s.title)}</button>`).join('')}</div><button data-action="review">View my work</button></section>`;}
function paint(focus=false){
  app.removeAttribute('aria-busy');app.dataset.mode=game.mode;app.dataset.scenario=game.currentId;
  app.innerHTML=header()+(game.mode==='home'?home():game.mode==='review'?workReview():game.mode==='pool'?exhausted():play())+`<p id="notice" class="notice" role="status" aria-live="polite"></p><footer class="session-footer"><p>Anonymous practice · work stays in this tab only. Closing or reloading clears it.</p><span>Gameplay pilot ${VERSION} · teacher review pending</span></footer>`;
  if(game.mode==='play'){updateLive();showClock();}
  if(focus)app.querySelector('#game-title')?.focus();
}
function updateLive(){
  if(game.mode!=='play')return;
  const s=scenario(),m=mission(),model=account(s,m.config);
  app.querySelector('#quick-forecast').innerHTML=quickForecast(s,m,model);
  app.querySelector('#room-board').innerHTML=rooms(s,m,model);
  app.querySelector('#forecast').innerHTML=forecast(s,m,model);
  app.querySelector('#calculation').innerHTML=calculationTable(s,m,model);
  if(model.ready&&model.kind==='plan')for(const r of model.rows){const el=app.querySelector(`[data-device-feedback="${r.id}"]`);if(el)el.textContent=!m.revealed?'':r.count<r.requiredCount?`Missing ${r.requiredCount-r.count} required device(s).`:r.hours<r.requiredHours?`Needs ${r.requiredHours-r.hours} more hour(s) per device.`:`Service covered · ${fmt(r.kwh)} kWh in this draft.`;}
  app.querySelector('#debrief').innerHTML=debrief(s,m);
  if(s.stage==='transfer'&&m.revealed){const r=app.querySelector('#transfer-result');r.innerHTML=`<h3>${currentCheck(m)?'Model checked':'Run the revised response'}</h3><p>${h(latest(m)?.result.message||'')}</p><p>First response: ${m.firstTransferResponse.result.valid?'model correct':'needed revision'}. This record is preserved.</p>${complete(m)?'<button class="primary" data-action="review">Review my work →</button>':''}`;}
}
function showClock(){
  if(game.mode!=='play')return;
  const s=scenario(),m=mission(),model=account(s,m.config);
  if(!m.revealed||!model.ready||model.kind!=='plan')return;
  const max=Math.max(1,...model.rows.map(r=>r.hours)),rows=replayAccount(model,m.elapsed);
  const clock=app.querySelector('[data-clock]'),used=app.querySelector('[data-used]'),progress=app.querySelector('[data-time]');
  if(clock)clock.textContent=fmt(m.elapsed,1)+' h';
  if(used)used.textContent=fmt(rows.reduce((n,r)=>n+r.used,0))+' kWh in replay';
  if(progress){progress.max=max;progress.value=m.elapsed;}
  for(const r of rows){const room=app.querySelector(`[data-room="${r.id}"]`);room?.classList.toggle('running-device',r.active&&m.elapsed>0);const el=app.querySelector(`[data-room-use="${r.id}"]`);if(el)el.textContent=fmt(r.used)+' kWh used in replay';}
}
function animate(from=0){
  stop();const m=mission(),model=account(scenario(),m.config);
  if(!m.revealed||!model.ready||model.kind!=='plan')return;
  const max=Math.max(1,...model.rows.map(r=>r.hours));
  m.elapsed=Math.min(from,max);showClock();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){m.elapsed=max;showClock();return;}
  running=true;animationStart=0;animationFrom=m.elapsed;
  app.querySelectorAll('[data-action="run"]').forEach(b=>b.disabled=true);
  const tick=now=>{
    if(!running||game.mode!=='play')return;
    if(!animationStart)animationStart=now;
    m.elapsed=Math.min(max,animationFrom+(now-animationStart)/6000*max);showClock();
    if(m.elapsed>=max){stop();const b=app.querySelector('[data-action="run"]');if(b)b.disabled=false;announce('Day replay complete. Your trial is kept.');}else frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);
}
function fresh(){stop();if(!permittedSupport()){announce('Submit your first independent response before replay support.');return;}const s=takeReplay(game,all);if(s)paint(true);else setStage('pool');}
function next(){
  const s=scenario(),m=mission();if(!complete(m)){announce('Complete the current mission before continuing.');return;}
  if(s.stage==='replay'||s.stage==='lab'){fresh();return;}
  const idx=core.findIndex(x=>x.id===s.id),nextIndex=idx+1;
  if(nextIndex>=core.length){setStage('review');return;}
  game.unlocked=Math.max(game.unlocked,nextIndex);visit(core[nextIndex]);
}
function help(){
  stop();const trigger=document.activeElement,dialog=document.createElement('dialog');
  dialog.innerHTML=`<h2>How to play</h2><ol><li>Read the mission goal and required services.</li><li>Choose equipment, quantities and hours. For motors, choose a measured energy account.</li><li>Make a prediction and run a test.</li><li>Watch the result. Repair your draft and run again.</li><li>When the model target is met, choose evidence and explain your decision.</li></ol><p>Tab moves through controls. Enter or Space activates buttons. Inputs also accept keyboard entry. Replays can be paused or stepped.</p><p>Earlier work is kept. Restart asks before clearing it. Independent calculations remain hidden until submission.</p><button class="primary">Return to game</button>`;
  document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.onclose=()=>{dialog.remove();trigger?.focus();};dialog.showModal();
}
app.addEventListener('input',e=>{
  if(game?.mode!=='play')return;
  const el=e.target,m=mission();
  if(el.dataset.config){stop();edit(m,el.dataset.config,el.value);m.elapsed=0;updateLive();showClock();const b=app.querySelector('[data-action="run"]');if(b)b.disabled=scenario().stage!=='transfer'&&!m.prediction;}
  if(el.dataset.answer){edit(m,el.dataset.answer,el.value);if(scenario().stage==='transfer'){const r=app.querySelector('#transfer-result');if(m.revealed)r.innerHTML='<p>Your explanation changed. Submit again to record the revision.</p>';}}
});
app.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled||!game)return;
  if(b.dataset.open){const s=all.find(s=>s.id===b.dataset.open);const idx=core.indexOf(s);if(s&&(!(idx>=0)||idx<=game.unlocked))visit(s);return;}
  if(game.mode==='play'){
    const m=mission();
    if(b.dataset.prediction){edit(m,'prediction',b.dataset.prediction);paint();app.querySelector(`[data-prediction="${CSS.escape(b.dataset.prediction)}"]`)?.focus();return;}
    if(b.dataset.power){stop();edit(m,b.dataset.power+'_power',Number(b.dataset.value));m.elapsed=0;paint();app.querySelector(`[data-power="${b.dataset.power}"][data-value="${b.dataset.value}"]`)?.focus();return;}
    if(b.dataset.fixture){stop();edit(m,'fixture',b.dataset.fixture);paint();app.querySelector(`[data-fixture="${b.dataset.fixture}"]`)?.focus();return;}
    if(b.dataset.step){stop();const n=Number(m.config[b.dataset.step]);edit(m,b.dataset.step,Math.min(24,Math.max(0,(Number.isFinite(n)?n:0)+Number(b.dataset.delta))));m.elapsed=0;paint();app.querySelector(`[data-step="${b.dataset.step}"][data-delta="${b.dataset.delta}"]`)?.focus();return;}
    if(b.dataset.evidence){edit(m,'evidence',b.dataset.evidence);app.querySelectorAll('[data-evidence]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.evidence===m.evidence)));if(scenario().stage==='transfer'&&m.revealed)app.querySelector('#transfer-result').innerHTML='<p>Your evidence changed. Submit again to record the revision.</p>';return;}
  }
  switch(b.dataset.action){
    case 'start':visit(core[Math.min(game.unlocked,5)]);break;
    case 'home':stop();setStage('home');break;
    case 'review':if(permittedSupport())setStage('review');else announce('Submit your first independent response before reading earlier work.');break;
    case 'help':help();break;
    case 'lab':visit(all.find(s=>s.stage==='lab'));break;
    case 'fresh':fresh();break;
    case 'back':{const idx=core.findIndex(s=>s.id===game.currentId);if(idx>0)visit(core[idx-1]);else setStage('home');break;}
    case 'run':{
      if(running||performance.now()-lastSubmission<300)return;
      const s=scenario(),r=submit(game,s);if(r.incomplete){announce(r.message);break;}
      lastSubmission=performance.now();paint();announce(r.message);const resultHeading=app.querySelector(s.stage==='transfer'?'#transfer-result h3':'#debrief h3');if(resultHeading){resultHeading.tabIndex=-1;resultHeading.focus({preventScroll:true});}if(s.stage!=='transfer')animate();else app.querySelector('#transfer-result')?.scrollIntoView({block:'nearest'});if(innerWidth<=780)app.querySelector('#forecast')?.scrollIntoView({block:'center'});break;
    }
    case 'replay':animate();break;
    case 'pause':stop();announce('Replay paused; the plan and trial are kept.');break;
    case 'resume':animate(mission().elapsed);break;
    case 'step':{stop();const m=mission(),p=account(scenario(),m.config);if(!m.revealed||!p.ready||p.kind!=='plan')break;m.elapsed=Math.min(Math.max(...p.rows.map(r=>r.hours),1),m.elapsed+0.5);showClock();app.querySelector('[data-action="run"]').disabled=false;break;}
    case 'finish':{const r=finish(game,scenario());if(r.valid){stop();paint();announce('Your model and explanation are recorded. Continue when ready.');app.querySelector('#debrief h3')?.setAttribute('tabindex','-1');app.querySelector('#debrief h3')?.focus();}else announce(r.message);break;}
    case 'next':next();break;
    case 'revise-claim':mission().completion=null;paint();app.querySelector('[data-answer="explanation"]')?.focus();break;
    case 'hint':{const t=hint(game,scenario());if(t){paint();announce(t);}else announce('No further hints are available for this challenge.');break;}
    case 'restart':if(confirm('Restart this session? This clears drafts, trials, hints and the first independent response.')){stop();game=createGame(all);paint(true);}break;
    case 'print':window.print();break;
  }
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',stop);
try{
  [bank,extra]=await Promise.all([globalThis.__S24_OFFLINE_DATA||read('data/scenarios.json'),globalThis.__S24_GAMEPLAY_DATA||read('data/gameplay.json')]);
  all=challenges(bank,extra);core=all.filter(s=>!['replay','lab'].includes(s.stage));game=createGame(all);paint();
}catch(e){app.removeAttribute('aria-busy');app.innerHTML=`<h1 id="game-title">The game could not open</h1><p>${h(e.message)}</p><p>Open the canonical game through the local preview server.</p>`;}
