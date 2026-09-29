/* Independent, versioned campaigns and one calendar over the monthly economy. */
window.PPCampaign = (()=>{
  const reviewScope=new URLSearchParams(location.search).get('reviewSession')||(new URLSearchParams(location.search).has('review')?'checks':''),prefix=reviewScope?'paycheckPanicIllustrated.review.'+reviewScope+'.v2.':'paycheckPanicIllustrated.v2.',indexKey=prefix+'index',currentKey=prefix+'selected';
  const MODES={quick:{name:'Quick Run',chapters:12,months:2,description:'12 chapters across 24 months · target 30–50 minutes'},class:{name:'Class Campaign',chapters:24,months:1,description:'24 monthly chapters · designed for 3–6 classes'},life:{name:'Life Sim',chapters:24,months:1,description:'Play individual days and evenings across 24 months'}};
  const P={pace:'class',saving:false,restoring:false,dirty:false,lastSaved:0,activeId:null,revision:0};
  const oldFresh=freshState,oldStart=startGame,oldSleep=sleep,oldNext=beginNewMonth,oldHud=hud,oldPay=applyShiftPay,oldFinish=finishShift;
  const id=()=>crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  function newCalendar(){return{id:id(),version:2,pace:P.pace,lesson:'class',day:1,phase:'day',chapter:1,routine:null,pendingMonths:0,monthsSettled:[],routineMonths:0,playedSeconds:0};}
  freshState=()=>({...oldFresh(),campaign:newCalendar(),transactions:[],activity:null});
  function plain(value,depth=0){if(depth>12)return null;if(value===null||['string','boolean','number'].includes(typeof value))return value;if(Array.isArray(value))return value.map(v=>plain(v,depth+1));if(value&&typeof value==='object'&&Object.getPrototypeOf(value)===Object.prototype){const o={};for(const [k,v]of Object.entries(value))if(typeof v!=='function'&&!['ac','master','_raf','raf','last','touch'].includes(k))o[k]=plain(v,depth+1);return o;}return undefined;}
  function snapshotActivity(){
    if(P.restoring)return G.activity;
    if(screen==='title')return G.activity;
    if(window.PPStats?.active)return {type:'stat',state:plain(PPStats.state)};
    if(MG.active)return{type:'shift',kind:MG.kind,state:Object.fromEntries(['t','score','streak','best','correct','wrong','timeLeft','wave','handicap','data'].map(k=>[k,plain(MG[k])])),game:plain(MG.game)};
    if(CB.active){const game=plain(CB.game);if(CB.kind==='rhythm'&&CB.game.started)game.elapsed=(CB.game.ac.currentTime-CB.game.startT)*1000;return{type:'cabinet',kind:CB.kind,attempt:plain(CB.attempt),game};}
    if(G.pendingShift)return{type:'paystub'};
    return null;
  }
  function flush(){
    P.dirty=false;if(!G.campaign)return false;
    G.campaign.lesson=G.mode;G.activity=snapshotActivity();
    if(!PPFinance.validNumbers(G)){status('Save blocked: invalid number');return false;}
    const position={screen:screen==='title'?(G.lastPosition?.screen||'town'):screen,interiorId,player:{x:player.x,y:player.y,direction:player.direction},inside:{x:iplayer.x,y:iplayer.y,direction:iplayer.direction},returnTo:{...interiorReturn}};
    if(screen==='title'&&G.lastPosition)Object.assign(position,G.lastPosition);else G.lastPosition=position;
    const envelope={schema:2,rules:'illustrated-2',savedAt:new Date().toISOString(),state:G,position,settings:{muted:PPScene.muted,reduced:PPScene.reduced}};
    try{
      const key=prefix+'campaign.'+G.campaign.id,previous=localStorage.getItem(key),revision=previous?(JSON.parse(previous).revision||0):0;if(revision>P.revision){status('Newer save in another tab');return false;}envelope.revision=revision+1;if(previous)localStorage.setItem(key+'.backup',previous);
      localStorage.setItem(key,JSON.stringify(envelope));localStorage.setItem(currentKey,G.campaign.id);
      const list=JSON.parse(localStorage.getItem(indexKey)||'[]').filter(c=>c.id!==G.campaign.id);list.unshift({id:G.campaign.id,name:MODES[G.campaign.pace].name,month:G.month,char:G.char,updated:envelope.savedAt});localStorage.setItem(indexKey,JSON.stringify(list));
      P.activeId=G.campaign.id;P.revision=envelope.revision;P.lastSaved=Date.now();status('Saved');return true;
    }catch(e){status('Save failed — export a backup');return false;}
  }
  function status(text){if($('saveStatus'))$('saveStatus').textContent=text;}
  save=()=>{if(P.restoring)return;if(!P.dirty){P.dirty=true;queueMicrotask(()=>{if(P.dirty)flush();});}};
  P.checkpoint=save;P.flush=flush;
  function restoreSaved(campaignId){
    try{const key=prefix+'campaign.'+campaignId;let record=JSON.parse(localStorage.getItem(key)||'null');if(!record||record.schema!==2||!PPFinance.validNumbers(record.state)){record=JSON.parse(localStorage.getItem(key+'.backup')||'null');}if(!record||record.schema!==2||!PPFinance.validNumbers(record.state))return false;
      G=record.state;G.campaign=G.campaign||newCalendar();P.pace=G.campaign.pace;P.activeId=G.campaign.id;P.revision=record.revision||0;G.lastPosition=record.position;if(record.settings){PPScene.muted=!!record.settings.muted;PPScene.reduced=REDUCED_MOTION=!!record.settings.reduced;document.body.classList.toggle('reduced-motion',PPScene.reduced);$('ppSound').textContent=PPScene.muted?'Sound off':'Sound on';$('ppMotion').textContent=PPScene.reduced?'Reduced motion':'Motion on';$('ppSound').setAttribute('aria-pressed',String(PPScene.muted));$('ppMotion').setAttribute('aria-pressed',String(PPScene.reduced));}return true;
    }catch(e){return false;}
  }
  function continueGame(){
    restoreSaved(G.campaign.id);
    const p=G.lastPosition;P.restoring=true;stopLoops();PPScene.clearInput();PPScene.paused=false;$('pauseScreen').hidden=true;$('title').style.display='none';$('hud').style.display='flex';closeModal();
    screen=p?.screen==='interior'?'interior':'town';interiorId=p?.interiorId||null;if(p){Object.assign(player,p.player);Object.assign(iplayer,p.inside);Object.assign(interiorReturn,p.returnTo);}if(screen==='interior')buildHotspots(MAP_BUILDINGS.find(b=>b.id===interiorId));PPScene.camera();hud();
    if(G.over){const completed=G.month>24;G.over=false;completed?winScreen():gameOver();P.restoring=false;save();return;}
    const a=G.activity;
    if(a?.type==='shift'){mgStart(a.kind);Object.assign(MG,a.state);Object.assign(MG.game,a.game);MG.last=performance.now();if(a.kind==='chaos')MG.game.setButtons(MG.game.frontItem());if(a.kind==='blitz')MG.game.render();if(a.kind==='runner')MG.game.carrying=MG.game.orders.find(o=>o.state==='carrying')||null;mgTop();}
    else if(a?.type==='cabinet'){
      const rng={arcState:G.arcState,casState:G.casState,tokenAttempts:G.arc.tokenAttempts};cbOpen(a.kind,a.attempt,CABS[a.kind].name,'Resumed');Object.assign(CB.game,a.game);CB.game._keyL=false;CB.game._keyR=false;if(a.kind==='claw')$('cbDrop').disabled=CB.game.phase!=='aim';if(a.kind==='wheel'&&CB.game.spinning)$('cbBtns').innerHTML='';G.arcState=rng.arcState;G.casState=rng.casState;G.arc.tokenAttempts=rng.tokenAttempts;
      if(a.kind==='trader')CB.game.render();if(a.kind==='rhythm'&&a.game.started){CB.game.started=false;CB.game.resumeElapsed=a.game.elapsed||0;CB.game.start();}
    }else if(a?.type==='stat'&&window.PPStats)PPStats.resume(a.state);
    else if(G.pendingShift)showPayStub();
    else if(G.checkpoint)renderCheckpoint();
    if(G.onboardDone)clearObjective();else refreshObjective();
    P.restoring=false;save();
  }
  P.continue=continueGame;
  $('btnContinue').replaceWith($('btnContinue').cloneNode(true));$('btnContinue').onclick=continueGame;
  pickMode=()=>{
    $('title').style.display='none';showMenu('Choose your campaign','The same town, activities, and financial rules at three different paces.',Object.entries(MODES).map(([key,m])=>({label:`${m.name}${key==='class'?' — default':''}<br><small>${m.description}</small>`,fn:()=>{P.pace=key;pickLessons();}})));
    modalActions.bx=()=>{closeModal();$('title').style.display='flex';};
  };
  function pickLessons(){showMenu(MODES[P.pace].name,'Choose how learning checkpoints work in this campaign.',[{label:'Classroom — guided lessons and reflection',fn:()=>pickCharacter('class')},{label:'Free play — choose your own checkpoints',fn:()=>pickCharacter('free')}]);}
  startGame=(mode,charId)=>{stopLoops();PPScene.clearInput();PPScene.paused=false;$('pauseScreen').hidden=true;oldStart(mode,charId);G.campaign.lesson=mode;G.campaign.pace=P.pace;P.activeId=G.campaign.id;P.revision=0;PPScene.camera();save();};
  hud=()=>{oldHud();if(!G.campaign)return;const c=G.campaign,m=MODES[c.pace];$('hMonth').parentElement.innerHTML=`<i>${c.pace==='life'?'DAY':'CHAPTER'}</i> <b id="hMonth">${c.pace==='life'?c.day:c.chapter}</b>${c.pace==='life'?' · '+c.phase:'/'+m.chapters} · Month ${Math.min(24,G.month)}`;};
  function routineForm(){
    const r=G.campaign.routine||{work:true,groceries:300,savings:150};for(const k in modalActions)delete modalActions[k];
    modalActions.routine=()=>{const groceries=Number($('routineFood').value),savings=Number($('routineSave').value);if(!Number.isFinite(groceries)||!Number.isFinite(savings)||groceries<0||savings<0){toast('Enter valid non-negative amounts.');return;}G.campaign.routine={work:$('routineWork').checked,groceries:_r2(groceries),savings:_r2(savings),creditMinimum:true};save();closeModal();sleep();};
    modalActions.bx=closeModal;
    openModal(`<h2>Approve your monthly routine</h2><p class="desc">${MODES[G.campaign.pace].name} condenses ordinary days. Review these choices before time advances. New loans, purchases, event choices, career changes, and learning reflections still wait for you.</p><label><input id="routineWork" type="checkbox" ${r.work?'checked':''}> Work scheduled days at 80% base pay when no shift was played</label><label class="field">Monthly groceries <input id="routineFood" type="number" min="0" step="1" value="${r.groceries}"></label><label class="field">Transfer to savings after bills <input id="routineSave" type="number" min="0" step="1" value="${r.savings}"></label><p class="fine">Routine work earns money but earns no played-shift score, skill reward, or promotion evidence. The routine pays the credit minimum when cash remains after essentials. Transfers happen only when cash covers the amount.</p><button data-a="routine">Approve routine & review this month</button><button class="neutral" data-a="bx">Keep playing</button>`);
  }
  function applyRoutine(){
    const r=G.campaign.routine;if(!r)return;if(r.work&&!G.worked)paySkippedShift();
    if(!G.groc.shopped&&r.groceries>0){const cost=Math.min(G.cash,r.groceries);G.cash=_r2(G.cash-cost);noteSpend('groceries',cost);G.groc={cal:Math.round(CAL_TARGET*Math.min(1.1,cost/300)),spent:cost,coffee:0,shopped:true};}
    const minimum=Math.max(0,(G.creditDue??minPaymentCalc(G.debt))-G.ccPaid);if(r.creditMinimum&&minimum>0){const paid=Math.min(minimum,G.debt,Math.max(0,G.cash-G.bills-(G.loan?.pay||0)));G.cash=_r2(G.cash-paid);G.debt=_r2(G.debt-paid);G.ccPaid=_r2(G.ccPaid+paid);noteSpend('debt',paid);}
    if(r.savings>0&&G.cash>=G.bills+r.savings+(G.loan?.pay||0)+(G.loan?.arrears||0)){G.cash=_r2(G.cash-r.savings);G.savings=_r2(G.savings+r.savings);noteSpend('savings',r.savings);}
  }
  paySkippedShift=()=>{if(G.campaign?.pace==='life'||!G.campaign?.routine?.work||G.burnout)return 'No scheduled-work income collected.';let receipt=G.campaign.routinePay;if(receipt?.month!==G.month){const st=payStubMath(Math.round(G.salary*.8));G.cash=_r2(G.cash+st.net);noteIncome(st.net);G.campaign.routineMonths++;receipt=G.campaign.routinePay={month:G.month,net:st.net};}return `Approved work routine: ${fmt$(receipt.net)} net. No played-shift or skill credit.`;};
  sleep=()=>{
    if(MG.active||CB.active||window.PPStats?.active||G.pendingShift)return;if(G.checkpoint){renderCheckpoint();return;}
    const c=G.campaign;if(!c)return oldSleep();
    if(G.month===1&&!G.sawPlanner&&G.mode!=='free'){toast('Make a budget plan at the Bank before ending the first chapter.');return;}
    if(c.pace==='life'&&c.day<30){c.day++;c.phase='day';G.worked=false;G.overtimeDone=false;G.napUsed=false;G.energy=clamp(G.energy+28,0,100);G.stress=clamp(G.stress-4,0,100);if(G.arcEnergyDebt){G.energy=clamp(G.energy-G.arcEnergyDebt,0,100);G.arcEnergyDebt=0;}G.arc.visitMonth=0;G.arc.playsUsed=0;closeModal();hud();save();toast(`Day ${c.day} · a new morning`);return;}
    if(c.pace!=='life'&&!c.routine){routineForm();return;}
    if(c.monthsSettled.includes(G.month)){toast('This month has already been settled.');return;}
    if(c.pace==='quick'&&c.pendingMonths===0)c.pendingMonths=2;
    applyRoutine();const before=G.month;oldSleep();if(G.month!==before){c.monthsSettled.push(before);c.day=1;c.phase='day';if(c.pace==='quick')c.pendingMonths=Math.max(0,c.pendingMonths-1);c.chapter=Math.min(MODES[c.pace].chapters,Math.floor((G.month-1)/MODES[c.pace].months)+1);if(G.month<=24){G.checkpoint={type:'month',html:$('modal').innerHTML};renderCheckpoint();}hud();save();}
  };
  beginNewMonth=()=>beginNewMonthGo();
  beginNewMonthGo=()=>{G.checkpoint=null;showEvent(pickEvent());};
  finishShift=(kind,stats,early)=>{oldFinish(kind,stats,early);if(G.campaign?.pace==='life'){const p=G.pendingShift;p.base=_r2(laneTierPay()/22);p.gross=_r2(p.base*p.mult+(p.tips||0));showShiftResults();}save();};
  applyShiftPay=st=>{if(!G.pendingShift||G.worked)return;oldPay(st);if(G.campaign)G.campaign.phase='evening';save();};
  const oldHome=openHome;openHome=()=>{oldHome();const b=$('modal').querySelector('button');if(b)b.textContent=G.campaign?.pace==='life'?'Sleep — next day':'End month & review';const el=document.createElement('button');el.textContent='Calendar & routine';el.onclick=showCalendar;$('modal').appendChild(el);};MENU_FNS.openHome=()=>openHome();
  function showCalendar(){const c=G.campaign;showMenu(MODES[c.pace].name,`Month ${G.month}/24 · ${c.pace==='life'?'day '+c.day+', '+c.phase:'chapter '+c.chapter+'/'+MODES[c.pace].chapters}. Time played: ${Math.round(c.playedSeconds/60)} minutes.<br>Cash ${fmt$(G.cash)} · Savings ${fmt$(G.savings)} · Card ${fmt$(G.debt)}${G.loan?' · Loan '+fmt$(G.loan.bal):''}<br>Energy ${Math.round(G.energy)} · Happiness ${Math.round(G.happy)} · Stress ${Math.round(G.stress)}<br>Money skill ${G.ms} · Wellness ${G.well} · People skill ${G.ps}`,[{label:c.pace==='life'?'Sleep → next day':'End month & review',fn:sleep},...(c.pace==='life'?[]:[{label:'Change approved routine',fn:routineForm}])]);}
  const calendarBtn=document.createElement('button');calendarBtn.textContent='Calendar';calendarBtn.onclick=()=>{if(!PPScene.busy())showCalendar();};$('worldTools').prepend(calendarBtn);
  const backupBtn=document.createElement('button');backupBtn.textContent='Download save backup';backupBtn.onclick=()=>{flush();const data=localStorage.getItem(prefix+'campaign.'+G.campaign.id);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download='paycheck-panic-'+G.campaign.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};$('pauseScreen').firstElementChild.appendChild(backupBtn);
  const slotsBtn=document.createElement('button');slotsBtn.className='bigbtn ghost';slotsBtn.textContent='Saved campaigns';slotsBtn.onclick=()=>{const list=JSON.parse(localStorage.getItem(indexKey)||'[]');$('title').style.display='none';showMenu('Saved campaigns','Each campaign has its own progress, mode, and activity state.',list.map(c=>({label:`${c.name} · ${c.char} · month ${c.month}`,fn:()=>{if(restoreSaved(c.id))continueGame();else toast('This save could not be loaded.');}})));modalActions.bx=()=>{closeModal();$('title').style.display='flex';};};$('title').appendChild(slotsBtn);
  function stopLoops(){cancelAnimationFrame(MG.raf);MG.active=false;MG.over=true;if(CB.active)cbCleanup();PPStats.suspend();}
  $('ppTitle').onclick=()=>{flush();stopLoops();P.restoring=true;PPScene.paused=true;$('pauseScreen').hidden=true;screen='title';$('title').style.display='flex';$('hud').style.display='none';$('hotspots').style.display='none';$('mgWrap').style.display='none';$('cbWrap').style.display='none';closeModal();P.restoring=false;$('btnContinue').style.display='inline-block';};
  const oldReflect=showReflection;showReflection=()=>{G.checkpoint={type:'reflection'};oldReflect();modalActions.reflectok=()=>{if(!G.refWhys?.[G.month-1]){toast('Choose your reflection first.');return;}G.checkpoint=null;closeModal();beginNewMonth();save();};save();};
  showEvent=ev=>{if(G.over)return;G.checkpoint={type:'event',index:EVENTS.indexOf(ev),stage:'choice'};renderCheckpoint();save();};
  function renderCheckpoint(){const cp=G.checkpoint;if(!cp)return;
    if(cp.type==='reflection'){showReflection();return;}
    for(const k in modalActions)delete modalActions[k];
    if(cp.type==='month'){modalActions.nextmonth=()=>{G.checkpoint=null;closeModal();if(G.mode==='class'&&(G.month-1)%3===0)showReflection();else beginNewMonth();save();};openModal(cp.html,true);return;}
    if(cp.type==='event'){const ev=EVENTS[cp.index];if(!ev){G.checkpoint=null;return;}
      if(cp.stage==='lesson'){modalActions.eventContinue=()=>{G.checkpoint=null;closeModal();save();if(G.campaign.pace==='quick'&&G.campaign.pendingMonths>0)sleep();};openModal(`<h2>${ev.name}</h2>${lessonHTML(ev.choices[cp.choice].lesson)}<button data-a="eventContinue">${G.campaign.pace==='quick'&&G.campaign.pendingMonths?'Continue approved routine':'Continue'}</button>`,true);return;}
      ev.choices.forEach((c,i)=>{modalActions['event'+i]=()=>{if(G.checkpoint?.stage!=='choice')return;cp.stage='lesson';cp.choice=i;const cash=G.cash,debt=G.debt,savings=G.savings;applyFx(c.fx);if(c.flag){G.flags[c.flag]=G.month;if(c.flag==='course1')G.raises.push({amt:100,due:G.month+2});if(c.flag==='faucet')G.faucetDue=G.month+2;}if(c.fn)specialFn(c.fn);const delta=_r2(G.cash-cash);if(delta>0)noteIncome(delta);else if(delta<0)noteSpend('other',-delta);if(G.debt>debt)noteSpend('other',_r2(G.debt-debt));if(G.savings>savings){noteIncome(_r2(G.savings-savings));noteSpend('savings',_r2(G.savings-savings));}checkBroke();hud();if(!G.over)renderCheckpoint();save();};});openModal(`<h2>${ev.name}</h2><p>Choose what happens next.</p>${ev.choices.map((c,i)=>`<button data-a="event${i}">${c.label}</button>`).join('')}`,true);
    }
  }
  window.addEventListener('pagehide',flush);window.addEventListener('beforeunload',flush);
  setInterval(()=>{if(screen!=='title'&&!PPScene.paused){if(G.campaign)G.campaign.playedSeconds++;save();}},1000);
  const selected=localStorage.getItem(currentKey);if(selected&&restoreSaved(selected))$('btnContinue').style.display='inline-block';
  else if(!G.campaign)G.campaign=newCalendar();
  Object.assign(P,{MODES,restoreSaved,showCalendar,plain,snapshotActivity,period:()=>G.campaign?.pace==='life'?(G.month-1)*30+G.campaign.day:G.month});
  Object.assign(window.__game,{freshState,startGame,save,load:restoreSaved,sleep,finishShift,applyShiftPay,trainStat,finance:PPFinance,campaign:P});
  return P;
})();
