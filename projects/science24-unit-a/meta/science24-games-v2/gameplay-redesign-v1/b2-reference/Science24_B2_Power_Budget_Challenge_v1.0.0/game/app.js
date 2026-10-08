/* Accessible, framework-free B2 activity. Session state is deliberately in memory only. */
(function(){
'use strict';
const D=window.B2Data,E=window.B2Engine,A=window.B2Assets;
if(!D||!E||!A){document.getElementById('app').textContent='The game files are incomplete. Open PLAY.html or keep every file in the game folder together.';return;}
const app=document.getElementById('app'),announcer=document.getElementById('announcer');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=E.fmt;
const paths={
 plug:'<path d="M9 3v5m6-5v5M7 8h10v5a5 5 0 0 1-10 0V8zm5 10v4"/>',
 bolt:'<path d="M13 2 5 13h6l-1 9 9-12h-7l1-8Z"/>',
 check:'<path d="m5 12 4 4L19 6"/>',arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',back:'<path d="M20 12H5m6-6-6 6 6 6"/>',
 leaf:'<path d="M20 3C8 2 2 8 5 15s15 2 15-12Zm-1 1L4 21"/>',
 bulb:'<path d="M9 18h6m-6 3h6M9 15c-6-6-3-12 3-12s9 6 3 12v1H9v-1Z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
 restart:'<path d="M4 10a8 8 0 1 1 1 8M4 3v7h7"/>',
 home:'<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>',
 book:'<path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-6-2-10 1Zm0 0v15"/>',
 warning:'<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v1"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
 graph:'<path d="M4 3v17h17M8 16v-5m5 5V6m5 10V9"/>',
 clipboard:'<path d="M8 5H5v16h14V5h-3M8 3h8v4H8V3Zm0 8h8m-8 4h6"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 play:'<path d="m8 4 12 8-12 8V4Z"/>',pause:'<path d="M8 4v16m8-16v16"/>',
 close:'<path d="m5 5 14 14M5 19 19 5"/>',
 review:'<path d="M7 3h13v18H7M3 7h8m-8 5h8m-8 5h8m3-10h3m-3 5h3m-3 5h3"/>',
 print:'<path d="M7 8V3h10v5M7 17H3V9h18v8h-4M7 14h10v7H7v-7Zm10-3h1"/>'
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.bolt}</svg>`;
const btn=(text,action,cls='secondary',extra='')=>`<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${text}</button>`;
const badge=(text,cls='')=>`<span class="badge ${cls}">${text}</span>`;
function sprite(name){
 if(A[name])return `<img class="device-sprite" src="${A[name]}" alt="" width="56" height="56">`;
 if(name==='fan')return '<svg class="device-sprite" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fanmetal" x2="1" y2="1"><stop stop-color="#f8faf9"/><stop offset=".5" stop-color="#c4ceca"/><stop offset="1" stop-color="#7d8983"/></linearGradient></defs><path d="M29 45h6v11H22v4h26v-4H35V43" fill="#626f66"/><circle cx="32" cy="26" r="23" fill="url(#fanmetal)" stroke="#69776d" stroke-width="2"/><circle cx="32" cy="26" r="19" fill="none" stroke="#e9efeb"/><g fill="#799083"><path d="M32 25C14 5 42 0 36 22Z"/><path d="M33 26c24-5 20 24 1 7Z"/><path d="M31 27C19 49 1 26 26 26Z"/></g><circle cx="32" cy="26" r="5" fill="#344e3f"/></svg>';
 if(name==='projector')return '<svg class="device-sprite" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="projectmetal" x2="0" y2="1"><stop stop-color="#f9faf9"/><stop offset="1" stop-color="#b9c4bc"/></linearGradient></defs><path d="m7 20 8-8h37l7 9v29H7Z" fill="url(#projectmetal)" stroke="#7d8a82"/><path d="M7 23h52M15 16h26" stroke="#aab8ae"/><circle cx="44" cy="34" r="12" fill="#303e38"/><circle cx="44" cy="34" r="8" fill="#687d76"/><circle cx="44" cy="34" r="4" fill="#a5c1bb"/><path d="M13 30h12m-12 5h12m-12 5h12" stroke="#6c7972" stroke-width="2"/></svg>';
 if(name==='motor')return '<svg class="motor-sprite" viewBox="0 0 220 132" aria-hidden="true"><defs><linearGradient id="motorsteel" x2="0" y2="1"><stop stop-color="#eff4f0"/><stop offset=".45" stop-color="#b6c3b9"/><stop offset=".7" stop-color="#738b7c"/><stop offset="1" stop-color="#b8c7bc"/></linearGradient></defs><ellipse cx="113" cy="116" rx="87" ry="8" fill="#e8eee9"/><path d="M65 102h80l10 13H57Z" fill="#475f50"/><rect x="44" y="30" width="119" height="74" rx="17" fill="url(#motorsteel)" stroke="#5a7361"/><ellipse cx="163" cy="67" rx="18" ry="37" fill="#657b6b"/><ellipse cx="45" cy="67" rx="19" ry="36" fill="#b5c5b8" stroke="#6b8171"/><ellipse cx="45" cy="67" rx="10" ry="19" fill="#556b5a"/><rect x="8" y="60" width="40" height="13" rx="5" fill="#9baca0" stroke="#596e5f"/><path d="M72 33v68m12-68v68m12-68v68m12-68v68m12-68v68m12-68v68m12-65v60" stroke="#738c79" stroke-width="3"/><path d="M161 27v-9h-23v10" stroke="#425f4e" stroke-width="7"/></svg>';
 return icon('bolt');
}
function record(s){return {draft:E.makeDraft(s),passed:false,everPassed:false,feedback:null,attempts:[],first:null,hints:0,workedStep:0,workedDone:false,selfReviewed:false,solutionSeen:false};}
function initialState(){return {route:'home',active:0,unlocked:0,records:Object.fromEntries([...D.scenarios,D.lab].map(s=>[s.id,record(s)])),powerUnit:'W',transferStarted:false,transferSupport:false,hasWork:false,returnRoute:null};}
let state=initialState(),replay={frame:0,running:false,elapsed:0,start:0,duration:6000,rows:[],max:0},modalReturn=null;
const scenario=()=>state.route==='lab'?D.lab:D.scenarios[state.active];
const currentRecord=()=>state.records[scenario().id];
function announce(text){announcer.textContent='';setTimeout(()=>{announcer.textContent=text;},25);}
function focusId(id,scroll=false){const el=document.getElementById(id);if(el){el.focus({preventScroll:!scroll});if(scroll)el.scrollIntoView({block:'nearest',behavior:'instant'});}}
function go(route,index=state.active){
 stopReplay();replay.elapsed=0;
 if(state.transferStarted&&!state.records['B2-T01'].first&&state.route==='task'&&state.active===5&&(route!=='task'||index!==5))state.transferSupport=true;
 if(route==='task'&&index>state.unlocked)return;
 if(route==='task'&&index===5&&!state.transferStarted&&!D.scenarios.slice(1,5).every(s=>state.records[s.id].passed&&state.records[s.id].selfReviewed)){announce('Recheck any revised practice steps before the independent challenge.');return;}
 state.route=route;state.active=index;
 if(route==='task'&&index===5)state.transferStarted=true;
 render({focus:'screen-title',scroll:true});window.scrollTo(0,0);
}
function header(){return `<a class="skip-link" href="#screen-title">Skip to activity</a><header class="course-header"><div class="brand"><span>Science <b>24</b></span><span class="brand-divider"></span><small>REAL SCIENCE. BRIGHTER FUTURES.</small></div><div class="school"><svg viewBox="0 0 42 30" width="38" height="30" aria-hidden="true"><path d="m0 2 13 13L0 28h10l13-13L10 2Zm17 0 13 13-13 13h10l13-13L27 2Z" fill="currentColor"/></svg><strong>Next Step</strong><span>LEARN<br>PRACTISE<br>PROGRESS</span></div></header>`;}
function title(){return `<div class="game-heading"><div class="game-emblem">${icon('plug')}</div><div><div class="eyebrow">UNIT B · ENERGY CONVERSION SYSTEMS</div><h1 id="screen-title" tabindex="-1"><span class="game-code">B2</span> Power Budget Challenge</h1><p class="game-tag">Plan. Calculate. Keep the community running.</p></div><div class="heading-note">${icon('leaf')}<span>Same resources.<br><strong>Smarter decisions.</strong></span></div></div>`;}
function navigation(){
 const labels=['Worked example','Lighting','Computer room','Projector','Efficiency','Independent'];
 return `<nav class="learning-nav" aria-label="Learning stages"><div class="stage-links">${D.scenarios.map((s,i)=>{
  const done=i===0?state.records[s.id].workedDone:state.records[s.id].passed;
  return `<button type="button" class="stage ${state.route==='task'&&state.active===i?'active':''} ${done?'done':''}" data-action="stage" data-index="${i}" ${i>state.unlocked||(i===5&&!state.transferStarted&&!D.scenarios.slice(1,5).every(x=>state.records[x.id].passed&&state.records[x.id].selfReviewed))?'disabled':''} ${state.route==='task'&&state.active===i?'aria-current="step"':''}><span class="stage-dot">${done?icon('check'):i+1}</span><span>${labels[i]}</span></button>`;
 }).join('')}</div><div class="utility-nav">${btn(icon('home')+'<span>Home</span>','home','ghost compact','aria-label="Home and mission overview"')}${btn(icon('graph')+'<span>Centre lab</span>','lab','ghost compact',`aria-label="Open the live-total centre practice lab" ${state.route==='lab'?'aria-current="page"':''}`)}${btn(icon('book'),'help','ghost compact','aria-label="Open formula and learning help" title="Formula help"')}</div></nav>`;
}
function panel(title,n,body,cls=''){return `<section class="panel ${cls}"><header class="panel-header"><h2>${title}</h2><span>${n}</span></header><div class="panel-content">${body}</div></section>`;}
function photo(cls=''){return `<div class="context-photo ${cls}"><img src="${A['community-centre']}" alt="Illustrative view of Riverside Community Centre at dusk." width="467" height="246"><span class="photo-label">RIVERSIDE · COMMUNITY CENTRE</span></div>`;}
function home(){
 const count=D.scenarios.slice(1).filter(s=>state.records[s.id].passed).length;
 return `<section class="home-hero"><div class="home-copy">${badge('A SCIENCE 24 MISSION','forest')}<h2>Keep the lights on.<br><span>Make every kilowatt-hour count.</span></h2><p>You run the community centre. Meet the day’s needs, choose the right equipment and prove your plan fits the energy budget.</p><div class="home-actions">${btn((state.hasWork?'Continue guided route':'Start guided route')+' '+icon('arrow'),'start','primary')}${btn('Open centre lab','lab','secondary')}</div><p class="micro">The lab shows live totals. The guided route builds toward a challenge without the dashboard’s help.</p></div><div class="home-image">${photo('hero-photo')}<div class="photo-overlay-card"><span>${icon('target')} Your success conditions</span><strong>Services met. Energy accounted for.</strong><small>No timer. No speed score. Try, check and revise.</small></div></div></section><div class="home-bottom"><section class="welcome-card"><div class="eyebrow">HOW IT WORKS</div><div class="how-grid"><div><b>01</b><h3>Make a plan</h3><p>Use equipment choices and run times to supply every service.</p></div><div><b>02</b><h3>Do the science</h3><p>Calculate energy using quantity, power and time.</p></div><div><b>03</b><h3>Check and improve</h3><p>See what worked, fix the weak point and try a new setting.</p></div></div></section><section class="welcome-card progress-summary"><div class="eyebrow">THIS SESSION</div><strong>${count}<small> / 5 checks completed</small></strong><p>Your work stays in this tab as you move between steps. Reloading or closing the page clears this session.</p>${btn('Review this session '+icon('arrow'),'review','secondary')}</section></div>`;
}
function serviceList(s,p=null){return `<section class="services"><h3>Required services <small>Must be provided</small></h3><ul>${s.devices.map(d=>{
 const r=p?.rows.find(x=>x.id===d.id),status=p?.valid?(r?.service?'met':'missing'):'pending';
 return `<li id="service-${d.id}" class="service ${status}"><span class="service-marker">${status==='met'?icon('check'):status==='missing'?icon('warning'):icon('clock')}</span><span><b>${d.count} ${esc(d.label.toLowerCase())}</b><small>At least ${d.minHours} h each${d.id==='projector'?' · 90 min':''}</small></span><span class="service-state">${status==='met'?'Met':status==='missing'?'Too short':'Required'}</span></li>`;
 }).join('')}</ul></section>`;}
function context(s,r){
 const p=s.type==='lab'||r.feedback?.ready?E.plan(s,r.draft):null;
 return `<div class="mission-meta">${badge(s.support)}<span class="task-id">${s.id}</span></div><h3 class="mission-title">${esc(s.title)}</h3>${photo()}<p class="mission-brief">${esc(s.brief)}</p>${serviceList(s,p)}<details class="assumptions"><summary>Model assumptions</summary><p>${esc(s.assumptions)}</p><p>Device quantities are fixed. Run times use half-hour steps from 0 to 12 hours. This is an energy allowance, not a dollar budget.</p></details>`;
}
function hourControl(d,r,locked){return `<div class="stepper"><button type="button" data-action="step" data-device="${d.id}" data-delta="-1" ${locked?'disabled':''} aria-label="Reduce hours for ${esc(d.label)}">−</button><input type="number" min="0" max="${d.maxHours}" step="${d.step}" inputmode="decimal" id="hours-${d.id}" data-field="hours" data-device="${d.id}" value="${esc(r.draft.hours[d.id])}" aria-label="Run time in hours for ${esc(d.label)}" ${locked?'disabled':''}><button type="button" data-action="step" data-device="${d.id}" data-delta="1" ${locked?'disabled':''} aria-label="Increase hours for ${esc(d.label)}">+</button></div>`;}
function deviceTable(s,r,{showEnergy=false,worked=false}={}){
 const p=E.plan(s,r.draft),locked=r.passed||worked;
 return `<div class="plan-toolbar"><span>${worked?'FOLLOW THE WORKED ACCOUNT':'SET THE RUN TIMES · HOURS PER DEVICE'}</span><div class="power-switch" role="group" aria-label="Display power units"><button type="button" data-action="power" data-unit="W" class="${state.powerUnit==='W'?'selected':''}" aria-pressed="${state.powerUnit==='W'}">W</button><button type="button" data-action="power" data-unit="kW" class="${state.powerUnit==='kW'?'selected':''}" aria-pressed="${state.powerUnit==='kW'}">kW</button></div></div><div class="device-table" role="table" aria-label="Device energy plan"><div class="table-head" role="row"><span role="columnheader">Device · quantity</span><span role="columnheader">Power<br><small>${state.powerUnit} each</small></span><span role="columnheader">Run time<br><small>h each</small></span><span role="columnheader">Energy<br><small>kWh</small></span></div>${s.devices.map(d=>{
 const opt=d.options.find(o=>o.id===r.draft.options[d.id]),row=p.rows.find(x=>x.id===d.id);
 const hl=worked&&(s.steps[r.workedStep].target===d.id||s.steps[r.workedStep].target==='total');
 return `<div class="device-row ${hl?'highlight':''}" role="row"><div class="device-cell" role="cell">${sprite(d.icon)}<div><strong>${esc(d.label)}</strong><span class="quantity">${d.count} ${d.count===1?'device':'devices'}</span>${d.options.length>1?`<label class="sr-only" for="option-${d.id}">Equipment for ${esc(d.label)}</label><select id="option-${d.id}" data-field="options" data-device="${d.id}" ${locked?'disabled':''}>${d.options.map(o=>`<option value="${o.id}" ${o.id===r.draft.options[d.id]?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`:''}</div></div><div class="power-cell" role="cell"><span class="mobile-label">Power each</span><strong>${opt?(state.powerUnit==='W'?opt.watts:f(opt.watts/1000)): '—'}</strong><small>${state.powerUnit}</small></div><div class="hours-cell" role="cell"><span class="mobile-label">Hours each</span>${worked?`<strong class="readonly-hours">${d.initialHours} h</strong>`:hourControl(d,r,locked)}</div><div class="energy-cell" role="cell"><span class="mobile-label">Energy</span><strong id="energy-${d.id}">${showEnergy&&row?f(row.kwh):'—'}</strong>${!showEnergy?'<small>Run to check</small>':'<small>kWh</small>'}</div></div>`;
 }).join('')}<div class="table-total" role="row"><strong role="cell">${showEnergy?'Total energy use':'Total energy · calculate before running'}</strong><strong role="cell" id="table-total">${showEnergy&&p.valid?f(p.total)+' <small>kWh</small>':'? <small>kWh</small>'}</strong></div></div><p class="micro power-note">Every power rating is for <strong>one</strong> device. The game multiplies by the quantity shown.</p>`;
}
function worked(s,r){
 const step=s.steps[r.workedStep],show=r.workedStep===3;
 return `<div class="workspace">${panel('The mission','01',context(s,r),'context-panel')}${panel('Work it through','02',deviceTable(s,r,{worked:true,showEnergy:show})+`<section class="worked-card"><div class="eyebrow">STEP ${r.workedStep+1} OF ${s.steps.length}</div><h3>${esc(step.title)}</h3><p>${esc(step.body)}</p><div class="equation">${esc(step.formula)}</div><div class="worked-actions">${btn(icon('back')+' Previous step','worked-back','secondary',`${r.workedStep===0?'disabled':''}`)}${r.workedStep<3?btn('Next step '+icon('arrow'),'worked-next','primary'):btn('Try it yourself '+icon('arrow'),'worked-finish','primary')}</div></section>`,'model-panel')}${panel('The energy account','03',`<div class="budget-target"><span>Energy cap</span><strong>0.500 <small>kWh</small></strong></div><div class="definition-card"><b>Power</b><p>How quickly a device uses energy.</p><span>W or kW</span></div><div class="definition-card"><b>Energy</b><p>How much is used over time.</p><span>Wh or kWh</span></div><div class="mini-equation">${show?'0.440 kWh used<br>0.060 kWh remaining':'Energy = power × time'}</div><div class="note-box">${icon('info')}<p>This round shows the method. Completing it is not independent assessment evidence.</p></div>${btn('Skip to practice','worked-skip','ghost full')}`,'budget-panel')}</div>${feedbackStrip(s,r)}${bottomNav(s,r)}`;
}
function choices(s,r){return `<fieldset class="reasoning-check" ${r.passed?'disabled':''}><legend>${esc(s.question)}</legend>${s.choices.map(([id,text])=>`<label class="choice ${r.draft.choice===id?'chosen':''}" for="choice-${id}"><input type="radio" id="choice-${id}" name="reasoning" data-field="choice" value="${id}" ${r.draft.choice===id?'checked':''}><span>${esc(text)}</span></label>`).join('')}</fieldset>`;}
function explanation(r,required){return `<div class="writing-field"><label for="explanation">${required?'Explain your decision':'Your working or reasoning'} <small>${required?'Required · writing not automatically graded':'Optional · not automatically graded'}</small></label><textarea id="explanation" data-field="explanation" maxlength="1200" rows="3" ${r.passed?'disabled':''} placeholder="Connect your calculation to the service requirements.">${esc(r.draft.explanation)}</textarea></div>`;}
function energyInput(id,label,value,unit,disabled=false){return `<div class="number-answer"><label for="${id}">${label}</label><div class="input-with-unit"><input id="${id}" data-field="${id}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="${esc(value)}" ${disabled?'disabled':''}><span>${esc(unit)}</span></div></div>`;}
function prediction(s,r){return `<section class="prediction-box"><div class="eyebrow">CALCULATE BEFORE YOU RUN</div><label for="total">My predicted total</label><div class="prediction-input"><input type="text" id="total" data-field="total" inputmode="decimal" autocomplete="off" spellcheck="false" value="${esc(r.draft.total)}" ${r.passed?'disabled':''} aria-describedby="rounding-note"><label class="sr-only" for="unit">Energy answer unit</label><select id="unit" data-field="unit" ${r.passed?'disabled':''}><option ${r.draft.unit==='kWh'?'selected':''}>kWh</option><option ${r.draft.unit==='Wh'?'selected':''}>Wh</option></select></div><small id="rounding-note">Use a decimal point. Round kWh to 3 decimal places, or use equivalent Wh.</small></section>`;}
function planWorkspace(s,r){
 const tested=!!r.feedback?.ready,lab=s.type==='lab',p=E.plan(s,r.draft);
 const center=deviceTable(s,r,{showEnergy:tested||lab})+(lab?`<section class="lab-tip"><div>${icon('target')}<h3>Stretch target · 12 kWh</h3></div><p>Trim only extra operating time. Keep every service at or above its minimum.</p><p class="micro">This is open practice with live calculations, not an independent check.</p></section>`:`${choices(s,r)}${explanation(r,s.requireExplanation)}`);
 return `<div class="workspace">${panel('The mission','01',context(s,r),'context-panel')}${panel('Your plan','02',center,'model-panel')}${panel('Your budget','03',budget(s,r,p,tested||lab)+(lab?'':prediction(s,r))+actionArea(s,r),'budget-panel')}</div>${feedbackStrip(s,r)}${bottomNav(s,r)}`;
}
function budget(s,r,p,show){
 const display=show&&p.valid;
 return `<div class="budget-card"><div class="budget-numbers"><div><span>Energy cap</span><strong>${f(s.cap)}<small>kWh</small></strong></div><div><span>${s.type==='lab'?'Live plan total':'Checked total'}</span><strong id="live-total" class="green">${display?f(p.total):'—'}<small>kWh</small></strong></div></div><div class="budget-meter"><div class="meter-track"><div id="budget-fill" class="meter-fill ${display&&!p.underCap?'over':''}" style="width:${display?Math.min(100,p.total/s.cap*100):0}%"></div></div><div class="meter-labels"><span>0 kWh</span><span id="cap-percent">${display?Math.round(p.total/s.cap*100)+'% of cap':'Run your plan to check'}</span></div></div></div><div id="plan-status">${budgetStatus(p,display,s)}</div>${display?`<div class="energy-breakdown"><h3>Energy by device group</h3>${p.rows.map(row=>`<div class="breakdown-row"><span>${esc(row.label)}</span><b>${f(row.kwh)} <small>kWh</small></b><div class="breakdown-track"><span style="width:${p.total?row.kwh/p.total*100:0}%"></span></div></div>`).join('')}</div>`:''}${s.type==='lab'?`<div class="stretch ${p.feasible&&p.total<=s.stretch?'achieved':''}" id="stretch-status">${icon('target')}<div><strong>${p.feasible&&p.total<=s.stretch?'Stretch target achieved':'Optional stretch target'}</strong><span>12.000 kWh or less · every service met</span></div></div>`:''}`;
}
function budgetStatus(p,display,s){
 if(!display&&s.type==='lab')return `<div class="note-box">${icon('warning')}<p>${esc(p.errors.join(' ')||'Enter valid run times to calculate this plan.')}</p></div>`;
 if(!display)return `<div class="note-box">${icon('clipboard')}<p>The budget stays hidden until you predict and run. Being under the cap is only half the task.</p></div>`;
 const pass=p.feasible;
 return `<div class="status-card ${pass?'success':'revise'}">${icon(pass?'check':'warning')}<div><h3>${pass?'Plan meets both constraints':!p.servicesMet?'A required service is missing':'Over the energy cap'}</h3><p>${pass?`${f(p.remaining)} kWh remaining.`:!p.servicesMet?'Check the required run times. Switching everything off cannot win.':`${f(-p.remaining)} kWh over the limit.`}</p></div></div>`;
}
function actionArea(s,r){
 const checked=r.feedback?.ready;
 return `<div class="check-actions">${r.passed?btn(icon('restart')+' Revise this answer','revise','secondary full'):btn(icon('play')+' '+(s.type==='lab'?'Check centre plan':s.type==='efficiency'?'Check energy account':s.type==='transfer'?'Submit independent answer':'Run & check plan'),'submit','primary full')}${s.type!=='transfer'&&s.type!=='lab'&&!r.passed?hintArea(s,r):''}${checked&&(s.type==='plan'||s.type==='lab')?`<div class="replay-box"><div class="replay-header">${btn(icon('play')+' Replay energy use','replay','ghost compact','id="replay-button"')}<span id="replay-time">0.0 h</span></div><div class="replay-track"><span id="replay-fill"></span></div><p id="replay-used">Replay is optional. It does not change your answer.</p><small>Illustrative timeline: all devices start together and stop after their planned hours.</small></div>`:''}</div>`;
}
function hintArea(s,r){
 if(s.type==='plan'&&s.id==='B2-P03'&&r.attempts.length===0)return '<p class="micro">Try the calculation first. A hint becomes available after a submitted attempt.</p>';
 return `${btn(icon('bulb')+' '+(r.hints>=s.hints.length?'All hints opened':`Need a hint? ${r.hints?`(${r.hints}/${s.hints.length})`:''}`),'hint','ghost full',`${r.hints>=s.hints.length?'disabled':''}`)}${r.hints?`<div class="hint-box" id="hint-text" tabindex="-1"><b>Hint ${r.hints}</b><p>${esc(s.hints[r.hints-1])}</p></div>`:''}`;
}
function efficiencyWorkspace(s,r){
 const tested=!!r.feedback?.ready;
 const contextBody=`<div class="mission-meta">${badge(s.support)}<span>${s.id}</span></div><h3 class="mission-title">${s.title}</h3><div class="motor-display">${sprite('motor')}<span>Fictional motor · energy account</span></div><p class="mission-brief">${esc(s.brief)}</p><div class="energy-givens"><div><span>Electrical input</span><strong>1,500 <small>J</small></strong></div><div><span>Useful motion</span><strong>900 <small>J</small></strong></div></div><details class="assumptions"><summary>Model assumptions</summary><p>${esc(s.assumptions)}</p></details>`;
 const middle=`<p class="panel-intro">Account for the energy, then calculate the useful fraction.</p><div class="energy-flow"><div class="flow-input">${icon('bolt')}<span>Electrical input</span><strong>1,500 J</strong></div><span class="flow-arrow">${icon('arrow')}</span><div class="flow-output"><div>${icon('target')}<span>Useful motion<strong>900 J</strong></span></div><div>${icon('leaf')}<span>Thermal output<strong>${tested?'600':'?'} J</strong></span></div></div></div><div class="answer-pair">${energyInput('percent','Efficiency',r.draft.percent,'%',r.passed)}${energyInput('other','Thermal output',r.draft.other,'J',r.passed)}</div><p class="micro">Efficiency may be entered to one decimal place. Thermal output is in joules.</p>${choices(s,r)}${explanation(r,false)}`;
 const result=`<div class="budget-target"><span>Useful fraction</span><strong>${tested?'60':'—'}<small>%</small></strong></div><div class="account-bars"><div>Useful motion · ${tested?'60%':'find its share'}<div><span style="width:${tested?60:0}%"></span></div></div><div>Thermal output · ${tested?'40%':'find its share'}<div><span class="neutral-bar" style="width:${tested?40:0}%"></span></div></div></div><div class="note-box">${icon('info')}<p>The two output amounts must add back to 1,500 J. Energy is not destroyed.</p></div>${actionArea(s,r)}`;
 return `<div class="workspace">${panel('The motor','01',contextBody,'context-panel')}${panel('Your energy account','02',middle,'model-panel')}${panel('Your check','03',result,'budget-panel')}</div>${feedbackStrip(s,r)}${bottomNav(s,r)}`;
}
function transferWorkspace(s,r){
 return `<section class="transfer-shell"><header class="transfer-header"><div>${badge('INDEPENDENT TRANSFER')}<h2>A new setting. The same science.</h2><p>No live totals, worked example or hints on this screen. Use the data to make and justify your decision.</p></div><div class="transfer-stamp">${icon('clipboard')}<span>Classroom-style<br>application</span></div></header><div class="transfer-columns"><div><h3>${s.title}</h3><p>${esc(s.brief)}</p><table class="plain-table"><caption>Supplied equipment data · powers are per device</caption><thead><tr><th>Device</th><th>Quantity</th><th>Power each</th><th>Time each</th></tr></thead><tbody>${s.devices.map(d=>`<tr><th scope="row">${esc(d.label)}</th><td>${d.count}</td><td>${d.watts} W</td><td>${d.minutes} min</td></tr>`).join('')}</tbody></table><div class="note-box">${icon('info')}<p>${esc(s.assumptions)}</p></div><p class="micro">The formula sheet remains available. Opening it or returning to practice is recorded as support for the first submission; it never deletes your work.</p></div><div><div class="transfer-answer-head"><h3>Your calculations</h3><label for="unit">Unit for both totals <select id="unit" data-field="unit" ${r.passed?'disabled':''}><option ${r.draft.unit==='kWh'?'selected':''}>kWh</option><option ${r.draft.unit==='Wh'?'selected':''}>Wh</option></select></label></div>${energyInput('initial','1. Total energy with the original workstations',r.draft.initial,r.draft.unit,r.passed)}${choices(s,r)}${energyInput('revised','3. Total energy with the replacement workstations',r.draft.revised,r.draft.unit,r.passed)}${explanation(r,true)}<p class="micro">kWh totals may be rounded to 3 decimal places. A written explanation is required but is not automatically graded.</p>${actionArea(s,r)}</div></div>${r.first?`<div class="first-record">${icon('lock')}<p><strong>First submission retained.</strong> ${r.first.pass?'The checked calculation and plan selection were correct.':'At least one checked calculation or selection needed revision.'} ${r.first.support?'Support was used before submission.':'No in-game support was opened before submission.'} Later corrections do not overwrite this record.</p></div>`:''}${r.feedback?.ready?`<details class="worked-comparison"><summary>Compare with a worked energy account</summary><p>Lights: 4 × 0.015 kW × 3 h = 0.180 kWh.</p><p>Original workstations: 2 × 0.120 kW × 2.5 h = 0.600 kWh. Original total = 0.780 kWh.</p><p>Replacement workstations: 2 × 0.080 kW × 2.5 h = 0.400 kWh. Revised total = 0.580 kWh, leaving 0.070 kWh under the cap. All times are preserved.</p></details>`:''}</section>${feedbackStrip(s,r)}${bottomNav(s,r)}`;
}
function feedbackStrip(s,r){
 const fb=r.feedback;
 let message=s.type==='worked'?'Follow the steps, then try a new plan.':s.type==='lab'?'Adjust your plan. Live totals are practice support, not independent evidence.':'Predict, make a decision and run your plan to check it.';
 if(fb)message=!fb.ready?'Complete the missing fields before checking.':fb.pass?(s.type==='lab'?'The centre plan meets the energy cap and every service requirement.':'The automatically checked parts passed. Review your reasoning before moving on.'):'Use the feedback to revise. Your previous attempt is kept.';
 return `<section class="feedback-strip ${fb?(fb.pass?'is-success':'is-revise'):''}" id="feedback" tabindex="-1" aria-label="Feedback"><div class="feedback-main"><div class="feedback-symbol">${icon(fb?(fb.pass?'check':'warning'):'clipboard')}</div><div><h2>${fb?(fb.pass?'Plan checks passed':'Review this attempt'):'Feedback'}</h2><p>${message}</p>${fb?`<ul class="feedback-checks">${(!fb.ready?fb.incomplete.map(text=>({text,ok:false})):fb.checks).map(c=>`<li class="${c.ok?'met':'missing'}">${icon(c.ok?'check':'warning')}<span>${esc(c.text)}</span></li>`).join('')}</ul>`:''}${fb?.ready&&s.type==='plan'?`<details><summary>See the calculation for this submitted plan</summary><ul>${fb.plan.rows.map(row=>`<li>${row.count} × ${f(row.watts/1000)} kW × ${row.hours} h = ${f(row.kwh)} kWh · ${esc(row.label)}</li>`).join('')}</ul><strong>Total = ${f(fb.plan.total)} kWh</strong></details>`:''}${r.attempts.length?`<details class="attempt-history"><summary>Previous submissions (${r.attempts.length})</summary><ol>${r.attempts.map((a,i)=>`<li>Attempt ${i+1}: ${a.pass?'checked parts passed':'revision needed'}${a.hints?` · ${a.hints} hint(s) opened`:''}${a.draft.total?` · entered ${esc(a.draft.total)} ${esc(a.draft.unit)}`:''}${a.draft.explanation?`<blockquote>${esc(a.draft.explanation)}</blockquote>`:''}</li>`).join('')}</ol></details>`:''}</div></div><aside class="key-idea"><div>${icon('bulb')}<h3>Key idea</h3></div><p>${esc(s.key)}</p>${r.passed&&s.type!=='lab'?`<div class="self-review"><label><input type="checkbox" data-field="selfReviewed" id="self-review" ${r.selfReviewed?'checked':''}> I checked my units, quantities and decision.</label><small>This is your self-check, not an automatic grade for your explanation.</small></div>`:''}</aside></section>`;
}
function bottomNav(s,r){
 if(s.type==='lab')return `<div class="bottom-nav">${btn(icon('back')+' Return to guided route','return-guided','secondary')}${btn('Reset centre plan','reset-lab','ghost')}</div>`;
 const i=state.active,ready=i===0?r.workedDone:r.passed&&r.selfReviewed;
 return `<div class="bottom-nav"><div>${btn(icon('back')+' '+(i===0?'Home':i===1?'Back to worked example':'Previous step'),i===0?'home':'previous','secondary')}<span class="micro">Back and forward keep your work.</span></div>${btn((i===5?'View session review':'Next step')+' '+icon('arrow'),i===5?'review':'next','primary',`${!ready?'disabled':''}`)}</div>`;
}
function review(){
 const tasks=D.scenarios.slice(1),all=tasks.every(s=>state.records[s.id].passed&&state.records[s.id].selfReviewed),done=tasks.filter(s=>state.records[s.id].passed).length;
 return `<section class="review-page"><div class="review-heading">${icon(all?'check':'clipboard')}<div><div class="eyebrow">YOUR SESSION REVIEW</div><h2>${all?'Practice route complete.':'Your work, in one place.'}</h2><p>${done} of 5 checks currently passed. Completion is not a guarantee of exam readiness.</p></div>${btn(icon('print')+' Print review','print','secondary')}</div><div class="review-table"><table><caption>Checks, support and first submitted results</caption><thead><tr><th>Step</th><th>Current check</th><th>First submission</th><th>Support used</th><th>Revisit</th></tr></thead><tbody>${tasks.map((s,n)=>{const r=state.records[s.id];return `<tr><th scope="row">${s.title}</th><td>${badge(r.passed?'Passed':r.attempts.length?'Needs recheck':'Not checked',r.passed?'green':'')}<small>${r.passed?(r.selfReviewed?'Self-check recorded':'Self-check still needed'):''}</small></td><td>${r.first?(r.first.pass?'Correct checked parts':'Revision needed'):'—'}</td><td>${s.type==='transfer'?(r.first?(r.first.support?'Returned to support':'No in-game support opened'):'Not submitted'):`${r.hints} hint(s) · ${r.attempts.length} submission(s)`}</td><td>${btn('Open','stage','ghost compact',`data-index="${n+1}" ${n+1>state.unlocked?'disabled':''}`)}</td></tr>`;}).join('')}</tbody></table></div><div class="review-columns"><section><h3>The science you practised</h3><p>Distinguishing power from energy; using device quantities and run times; converting W, kW, Wh and kWh; meeting service constraints; and accounting for useful output and efficiency.</p></section><section><h3>What this check does not certify</h3><p>Free-text explanations have not been automatically graded. Compare them with the reasoning checklist or review them with your teacher. This is targeted Unit B practice, not full course coverage.</p></section></div><details class="review-writing"><summary>Show your written work</summary>${tasks.map(s=>{const r=state.records[s.id];return `<h4>${s.title}</h4><p class="preserve-text">${r.draft.explanation?esc(r.draft.explanation):'No written response entered.'}</p>`;}).join('')}</details><div class="review-actions">${btn(icon('back')+' Back to independent challenge','stage','secondary',`data-index="5" ${state.unlocked<5?'disabled':''}`)}${btn('Open centre lab','lab','secondary')}${btn('Start a fresh session','restart','ghost')}</div></section>`;
}
function footer(){return `<footer class="page-footer"><span>SCIENCE 24 <b> / </b> B2 · POWER BUDGET CHALLENGE</span><span>Work is held in this tab only. No login. Nothing is submitted.</span><button type="button" data-action="about">Version ${D.version} · About</button></footer>`;}
function render({focus=null,scroll=false}={}){
 const oldScroll=window.scrollY;
 const body=state.route==='home'?home():state.route==='review'?review():(()=>{const s=scenario(),r=currentRecord();return s.type==='worked'?worked(s,r):s.type==='efficiency'?efficiencyWorkspace(s,r):s.type==='transfer'?transferWorkspace(s,r):planWorkspace(s,r);})();
 app.innerHTML=header()+`<main class="page">${title()}${navigation()}${body}</main>`+footer();
 app.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.style.display='none';img.parentElement.classList.add('image-unavailable');},{once:true}));
 if(focus)focusId(focus,scroll);else window.scrollTo(0,oldScroll);
}
function markChanged(){
 const r=currentRecord();r.passed=false;r.feedback=null;r.selfReviewed=false;state.hasWork=true;stopReplay();replay.elapsed=0;
 // Do not rerender while the learner is typing. Replace only derived/status fragments.
 if(scenario().type==='lab')updateLab();
 else {
  document.querySelectorAll('[data-action="next"]').forEach(b=>{b.disabled=true;});
  const fb=document.getElementById('feedback');if(fb&&r.attempts.length){fb.outerHTML=feedbackStrip(scenario(),r);const p=document.querySelector('#feedback .feedback-main p');if(p)p.textContent='Answer edited. Run the check again; your previous submission is retained.';}
  if(scenario().type==='plan'){
   scenario().devices.forEach(d=>{const x=document.getElementById('energy-'+d.id);if(x)x.textContent='—';});
   const tt=document.getElementById('table-total');if(tt)tt.innerHTML='? <small>kWh</small>';
   const lt=document.getElementById('live-total');if(lt)lt.innerHTML='—<small>kWh</small>';
   const mf=document.getElementById('budget-fill');if(mf){mf.style.width='0%';mf.classList.remove('over');}
   const pc=document.getElementById('cap-percent');if(pc)pc.textContent='Run your plan to check';
   const ps=document.getElementById('plan-status');if(ps)ps.innerHTML=budgetStatus(E.plan(scenario(),r.draft),false,scenario());
   document.querySelector('.energy-breakdown')?.remove();document.querySelector('.replay-box')?.remove();
   const sl=document.querySelector('.services');if(sl)sl.outerHTML=serviceList(scenario());
  }
 }
}
function updateLab(){
 const s=D.lab,r=state.records[s.id],p=E.plan(s,r.draft);
 for(const d of s.devices){const row=p.rows.find(x=>x.id===d.id),v=document.getElementById('energy-'+d.id);if(v)v.textContent=row?f(row.kwh):'—';}
 const total=document.getElementById('table-total');if(total)total.innerHTML=(p.valid?f(p.total):'—')+' <small>kWh</small>';
 const live=document.getElementById('live-total');if(live)live.innerHTML=(p.valid?f(p.total):'—')+'<small>kWh</small>';
 const fill=document.getElementById('budget-fill');if(fill){fill.style.width=p.valid?Math.min(100,p.total/s.cap*100)+'%':'0%';fill.classList.toggle('over',p.valid&&!p.underCap);}
 const cp=document.getElementById('cap-percent');if(cp)cp.textContent=p.valid?Math.round(p.total/s.cap*100)+'% of cap':'Enter valid hours';
 const status=document.getElementById('plan-status');if(status)status.innerHTML=budgetStatus(p,p.valid,s);
 const sl=document.querySelector('.services');if(sl)sl.outerHTML=serviceList(s,p);
 const stretch=document.getElementById('stretch-status');if(stretch){const ok=p.feasible&&p.total<=s.stretch;stretch.classList.toggle('achieved',ok);stretch.querySelector('strong').textContent=ok?'Stretch target achieved':'Optional stretch target';}
 const breakdown=document.querySelector('.energy-breakdown');if(breakdown)breakdown.innerHTML='<h3>Energy by device group</h3>'+p.rows.map(row=>`<div class="breakdown-row"><span>${esc(row.label)}</span><b>${f(row.kwh)} <small>kWh</small></b><div class="breakdown-track"><span style="width:${p.total?row.kwh/p.total*100:0}%"></span></div></div>`).join('');
}
function submit(){
 stopReplay();replay.elapsed=0;const s=scenario(),r=currentRecord();if(r.passed)return;
 const result=E.validate(s,r.draft);r.feedback=result;
 if(result.ready){
  const snapshot={pass:result.pass,draft:structuredClone(r.draft),hints:r.hints,support:s.type==='transfer'?state.transferSupport:r.hints>0,checks:structuredClone(result.checks)};
  r.attempts.push(snapshot);if(!r.first)r.first=structuredClone(snapshot);
  r.passed=result.pass;r.everPassed||=result.pass;r.selfReviewed=false;state.hasWork=true;
  // The self-review action unlocks the next new stage; navigation never clears previous records.
 }
 render({focus:'feedback',scroll:true});announce(result.pass?'Checked parts passed. Review the feedback and your self-check.':result.feedback[0]||'Review this attempt.');
}
function stopReplay(){if(replay.frame)cancelAnimationFrame(replay.frame);replay.frame=0;replay.running=false;}
function replayFrame(now){
 if(!replay.running)return;
 replay.elapsed=Math.min(replay.duration,now-replay.start);
 const t=replay.duration?replay.elapsed/replay.duration*replay.max:replay.max,used=E.replayRows(replay.rows,t).reduce((n,r)=>n+r.usedKWh,0);
 const time=document.getElementById('replay-time'),bar=document.getElementById('replay-fill'),txt=document.getElementById('replay-used');
 if(!bar){stopReplay();return;}
 time.textContent=t.toFixed(1)+' h';bar.style.width=100*replay.elapsed/replay.duration+'%';txt.textContent=f(used)+' kWh used at this model time.';
 if(replay.elapsed<replay.duration)replay.frame=requestAnimationFrame(replayFrame);
 else {replay.running=false;const b=document.getElementById('replay-button');if(b)b.innerHTML=icon('restart')+' Replay again';announce('Energy replay complete. '+f(used)+' kilowatt-hours.');}
}
function toggleReplay(){
 const s=scenario(),r=currentRecord(),p=E.plan(s,r.draft);if(!p.valid)return;
 const b=document.getElementById('replay-button');
 if(replay.running){stopReplay();if(b)b.innerHTML=icon('play')+' Continue replay';return;}
 const resumed=replay.elapsed>0&&replay.elapsed<replay.duration;
 replay.rows=p.rows;replay.max=Math.max(...p.rows.map(x=>x.hours),0);replay.elapsed=resumed?replay.elapsed:0;
 replay.start=performance.now()-replay.elapsed;replay.running=true;
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){replay.start=performance.now()-replay.duration;replayFrame(performance.now());return;}
 if(b)b.innerHTML=icon('pause')+' Pause replay';replay.frame=requestAnimationFrame(replayFrame);
}
function modal(kind){
 stopReplay();modalReturn=document.activeElement;
 const dialog=document.getElementById('modal');let content='';
 if(kind==='help'){
  if(state.transferStarted&&!state.records['B2-T01'].first)state.transferSupport=true;
  content=`<div class="eyebrow">SCIENCE 24 · FORMULA HELP</div><h2 id="dialog-title">Keep the units with the numbers.</h2><div class="help-equations"><p><b>Energy (kWh)</b><span>quantity × power (kW) × time (h)</span></p><p><b>Convert power</b><span>1 kW = 1,000 W</span></p><p><b>Convert time</b><span>minutes ÷ 60 = hours</span></p><p><b>Convert energy</b><span>1 kWh = 1,000 Wh</span></p><p><b>Efficiency (%)</b><span>useful output ÷ total input × 100</span></p></div><h3>Check your reasoning</h3><p>Did you count every device? Did you preserve the required service times? Does the total stay within the energy cap? Does your explanation connect the calculation to your decision?</p><p class="micro">Open text is not automatically graded. In the independent challenge, opening this sheet records that support was used before submission.</p>`;
 }else if(kind==='about'){
  content=`<div class="eyebrow">ABOUT THIS ACTIVITY</div><h2 id="dialog-title">B2 Power Budget Challenge</h2><p>Version ${D.version}. A standalone, anonymous Science 24 practice activity in the Next Step visual system. No accounts, analytics, cloud saving or LMS reporting.</p><p>Targets electrical power, energy use, unit conversions and efficiency. Course guardrails: supplied Unit B text, Chapter 6, sections 6.3–6.4, printed pages 108–113; Unit B workbook pages 13–15; Science 24 formula sheet page 1.</p><p>All equipment data and service equivalences are authored teaching assumptions. The full-centre lab is optional practice, not a real building-energy forecast. Secure assessment questions are not reproduced.</p><p>Energy definitions were checked against the U.S. Energy Information Administration’s “Measuring electricity.” The downloadable package includes source locators and test records.</p><p>The earlier visual mockup had inconsistent arithmetic. This game calculates every row, total and status from the same data model.</p>`;
 }else{
  content=`<div class="eyebrow">${kind==='reset-lab'?'RESET CENTRE LAB':'NEW SESSION'}</div><h2 id="dialog-title">${kind==='reset-lab'?'Replace this lab plan?':'Clear the current session?'}</h2><p>${kind==='reset-lab'?'Only the centre lab will return to its original equipment times. Your guided-route work will remain.':'This clears every answer, opened hint, feedback record and first-submission record in this tab. Use Previous or the stage navigation to revisit work without clearing it.'}</p><div class="dialog-actions">${btn('Keep my work','close-modal','secondary')}${btn(kind==='reset-lab'?'Reset lab plan':'Start fresh',kind==='reset-lab'?'confirm-reset-lab':'confirm-restart','primary')}</div>`;
 }
 dialog.innerHTML=`<div class="dialog-content">${btn(icon('close'),'close-modal','ghost dialog-close','aria-label="Close dialog"')}${content}${kind==='help'||kind==='about'?btn('Back to my work','close-modal','primary'):''}</div>`;
 dialog.showModal();dialog.querySelector('button').focus();
}
function closeModal(){document.getElementById('modal').close();if(modalReturn&&modalReturn.isConnected)modalReturn.focus();}
document.addEventListener('input',event=>{
 const el=event.target;if(!el.dataset.field||el.type==='radio'||el.type==='checkbox'||el.tagName==='SELECT'||!(state.route==='task'||state.route==='lab'))return;
 const r=currentRecord();if(r.passed)return;
 const key=el.dataset.field;
 if(key==='hours')r.draft.hours[el.dataset.device]=el.value;
 else r.draft[key]=el.value.slice(0,key==='explanation'?1200:64);
 markChanged();
});
document.addEventListener('change',event=>{
 const el=event.target,key=el.dataset.field;if(!key||!(state.route==='task'||state.route==='lab'))return;
 const r=currentRecord();
 if(key==='selfReviewed'){r.selfReviewed=el.checked;if(r.passed&&r.selfReviewed)state.unlocked=Math.max(state.unlocked,Math.min(5,state.active+1));render({focus:'self-review'});return;}
 if(r.passed)return;
 if(key==='options')r.draft.options[el.dataset.device]=el.value;
 else if(key==='hours')r.draft.hours[el.dataset.device]=el.value;
 else r.draft[key]=el.value.slice(0,key==='explanation'?1200:64);
 markChanged();if(el.tagName==='SELECT'||el.type==='radio'||key==='hours')render({focus:el.id});
});
document.addEventListener('click',event=>{
 const b=event.target.closest('button[data-action]');if(!b||b.disabled)return;
 const action=b.dataset.action;
 if(action==='close-modal'){closeModal();return;}
 if(action==='confirm-restart'){closeModal();stopReplay();state=initialState();render({focus:'screen-title',scroll:true});return;}
 if(action==='confirm-reset-lab'){closeModal();state.records[D.lab.id]=record(D.lab);render({focus:'screen-title',scroll:true});return;}
 if(action==='help'||action==='about'||action==='restart'||action==='reset-lab'){modal(action);return;}
 if(action==='home'){go('home');return;}
 if(action==='start'){go('task',Math.min(state.active,state.unlocked));return;}
 if(action==='lab'){if(state.route!=='lab')state.returnRoute={route:state.route,active:state.active};go('lab');return;}
 if(action==='return-guided'){const ret=state.returnRoute;go(ret?.route==='task'?'task':'home',ret?.active??state.active);return;}
 if(action==='stage'){go('task',Number(b.dataset.index));return;}
 if(action==='review'){go('review');return;}
 if(action==='print'){window.print();return;}
 if(action==='power'){state.powerUnit=b.dataset.unit;render();document.querySelector(`[data-action="power"][data-unit="${state.powerUnit}"]`)?.focus({preventScroll:true});return;}
 if(!(state.route==='task'||state.route==='lab'))return;
 const s=scenario(),r=currentRecord();
 if(action==='previous'){go('task',Math.max(0,state.active-1));return;}
 if(action==='next'){if((state.active===0&&r.workedDone)||(r.passed&&r.selfReviewed))go('task',Math.min(5,state.active+1));return;}
 if(action==='worked-back'){r.workedStep=Math.max(0,r.workedStep-1);render({focus:'screen-title'});return;}
 if(action==='worked-next'){r.workedStep=Math.min(3,r.workedStep+1);state.hasWork=true;render({focus:'screen-title'});announce(s.steps[r.workedStep].title);return;}
 if(action==='worked-finish'||action==='worked-skip'){r.workedDone=true;state.hasWork=true;state.unlocked=Math.max(1,state.unlocked);go('task',1);return;}
 if(action==='step'){
  if(r.passed)return;const d=s.devices.find(x=>x.id===b.dataset.device);if(!d)return;const old=E.number(r.draft.hours[d.id]);
  const n=Math.min(d.maxHours,Math.max(0,(old===null?0:old)+Number(b.dataset.delta)*d.step));r.draft.hours[d.id]=String(Math.round(n*2)/2);markChanged();render({focus:'hours-'+d.id});return;
 }
 if(action==='submit'){submit();return;}
 if(action==='revise'){r.passed=false;r.feedback=null;r.selfReviewed=false;state.hasWork=true;replay.elapsed=0;stopReplay();render({focus:s.type==='efficiency'?'percent':s.type==='transfer'?'initial':'hours-'+s.devices[0].id,scroll:true});announce('Revision mode. Run the check again before continuing.');return;}
 if(action==='hint'){if(s.hints&&r.hints<s.hints.length){r.hints++;state.hasWork=true;render({focus:'hint-text',scroll:true});announce(s.hints[r.hints-1]);}return;}
 if(action==='replay'){toggleReplay();return;}
});
document.getElementById('modal').addEventListener('cancel',()=>{if(modalReturn?.isConnected)requestAnimationFrame(()=>modalReturn.focus());});
window.addEventListener('pagehide',stopReplay);
window.B2Game=Object.freeze({version:D.version,snapshot:()=>structuredClone(state)});
render();
})();
