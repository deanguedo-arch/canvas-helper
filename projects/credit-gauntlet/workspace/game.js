(function () {
  'use strict';
  const M = window.CreditModel;
  const KEY = 'credit-gauntlet:standalone:v1';
  const BACKUP = KEY + ':earlier';
  const screens = ['S01','S02','S03','S04','S05','S06','S07','S08','S09','S10'];
  const params = new URLSearchParams(location.search);
  const preview = params.has('screen');
  const reference = params.get('reference') === '1';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const money = cents => new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',minimumFractionDigits:2}).format(cents/100);
  const label = id => ({small:'Small personal loan',store:'Store card',vehicle:'Vehicle loan'}[id]);
  const titleCase = value => value[0].toUpperCase()+value.slice(1);
  function fresh(completed = false) {
    return {schemaVersion:1,modelVersion:M.VERSION,screen:'S01',route:'variable_60',term:60,firstMonth:0,
      portfolioMonth:0,strategy:'avalanche',revealed:false,eventApplied:false,speed:650,
      paymentPrediction:'',strategyPrediction:'',reflection:'',choicePredictions:{},strategyChosen:false,budgetSeen:false,completed};
  }
  let state = fresh(), timer = null, playing = false, generation = 0, lastToken = null, writesBlocked = false;
  let rawSave = null, opener = null, awaitingResume = false, actionBusy = false;
  const resultCache = new Map();
  function result(route = state.route, strategy = state.strategy) {
    const key = route+':'+strategy;
    if (!resultCache.has(key)) resultCache.set(key,M.portfolio(route,strategy));
    return resultCache.get(key);
  }
  function announce(text) { $('#announcements').textContent = text; }
  function status(text) { $('#save-status').textContent = text; }
  function bind(name, value) { all('[data-bind="'+name+'"]').forEach(el => { el.textContent = value; }); }
  function validSave(value) {
    if(['strategyChosen','budgetSeen'].some(k=>value?.[k]!==undefined&&typeof value[k]!=='boolean'))return false;
    if(value?.choicePredictions!==undefined&&(!value.choicePredictions||typeof value.choicePredictions!=='object'||Array.isArray(value.choicePredictions)||Object.entries(value.choicePredictions).some(([k,v])=>!['cost','first'].includes(k)||!['fixed','variable','avalanche','snowball'].includes(v))))return false;
    if (!value || value.schemaVersion !== 1 || value.modelVersion !== M.VERSION || !screens.includes(value.screen)
      || !M.ROUTES.includes(value.route) || ![36,60,84].includes(value.term)
      || !['avalanche','snowball'].includes(value.strategy) || ![1400,650,200].includes(value.speed)
      || !Number.isInteger(value.firstMonth) || value.firstMonth < 0 || value.firstMonth > 12
      || !Number.isInteger(value.portfolioMonth) || value.portfolioMonth < 0
      || !['revealed','eventApplied','completed'].every(k => typeof value[k] === 'boolean')
      || !['paymentPrediction','strategyPrediction','reflection'].every(k => typeof value[k] === 'string')) return false;
    if (value.paymentPrediction.length > 500 || value.strategyPrediction.length > 500 || value.reflection.length > 1500) return false;
    const r = M.routeInfo(value.route);
    if (!r.eligible && !['S01','S02','S09'].includes(value.screen)) return false;
    if (['S05','S06','S07','S08','S10'].includes(value.screen) && (value.firstMonth !== 12 || !value.eventApplied)) return false;
    if (value.eventApplied && value.firstMonth !== 12) return false;
    if (value.portfolioMonth > (r.eligible ? result(value.route,value.strategy).months : 0)) return false;
    if (value.screen === 'S10' && value.portfolioMonth !== result(value.route,value.strategy).months) return false;
    return true;
  }
  function serialize() { return {...state,updatedAt:new Date().toISOString(),token:Date.now()+':'+Math.random().toString(36).slice(2)}; }
  const host = {
    load() {
      if (preview) return null;
      try { rawSave = localStorage.getItem(KEY); if (!rawSave) return null; const saved = JSON.parse(rawSave);
        if (!validSave(saved)) { writesBlocked = true; return 'invalid'; }
        lastToken = saved.token || null; return saved;
      } catch (error) { if (rawSave) {writesBlocked=true;return 'invalid';} status('Browser saving unavailable');return null; }
    },
    save() {
      if (preview) { status('Preview only · does not change your save'); return; }
      if (writesBlocked || awaitingResume) return;
      try {
        const existing = localStorage.getItem(KEY);
        if (existing && JSON.parse(existing).token !== lastToken) { writesBlocked=true;stop();status('Another tab changed this save · reload to choose the latest version');return; }
        const saved = serialize(); localStorage.setItem(KEY,JSON.stringify(saved)); lastToken=saved.token; rawSave=JSON.stringify(saved);
        status('Saved on this browser'+(state.completed?' · activity completed':''));
      } catch (error) { status('Could not save · keep this page open'); }
    },
    markComplete() { state.completed = true; this.save(); window.dispatchEvent(new CustomEvent('credit-gauntlet-completed',{detail:{modelVersion:M.VERSION}})); },
    flush() { this.save(); }, close() { stop(); this.flush(); }
  };
  window.CreditGauntletHost = host;
  function stop() { playing=false;generation++;clearTimeout(timer);timer=null; }
  function switchScreen(id, focus = true) {
    stop();state.screen=id;render();host.save();
    if(focus) {$('#screen-title').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }
  function openDialog(id, trigger) { stop();renderPlayButton();opener=trigger||document.activeElement;$('#'+id).showModal(); }
  function closeDialog() { all('dialog[open]').forEach(d=>d.close()); if(opener?.isConnected)opener.focus(); }
  function debtCards(target, debts, compact = false) {
    $('#'+target).replaceChildren(...[...debts].sort((a,b)=>['vehicle','small','store'].indexOf(a.id)-['vehicle','small','store'].indexOf(b.id)).map(d => {
      const card=document.createElement('article');card.className='panel debt-card';
      const icon={small:'IC04',store:'IC05',vehicle:'IC01'}[d.id];
      card.innerHTML='<h3>'+d.label+'</h3><img src="assets/'+icon+'.png" alt=""'+(d.id==='store'?' class="debt-cards-icon"':'')+'><p class="debt-balance">'+money(d.balance)+'</p><p class="debt-rate">'+(d.rateBps/100).toFixed(d.rateBps%100?1:0)+'% annual rate</p><p class="debt-note">'+(d.balance===0?'Repaid · no further interest':'Minimum up to '+money(d.minimum))+'</p>';
      return card;
    }));
  }
  function plot(target, debts, steps, maxMonths) {
    const width=Math.max(300,$('#'+target).clientWidth),height=$('#'+target).clientHeight||210,left=66,right=20,top=12,bottom=40;
    const max=1200000,span=width-left-right,plotHeight=height-top-bottom;
    const x=m=>left+(m/maxMonths)*span, y=c=>top+(1-c/max)*plotHeight;
    let svg='<svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Debt balances by completed month. Exact values are available in the full ledger.">';
    for(const dollars of [0,4000,8000,12000]) {const yy=y(dollars*100);svg+='<line x1="'+left+'" y1="'+yy+'" x2="'+(width-right)+'" y2="'+yy+'" stroke="#d3caa8"/><text x="'+(left-9)+'" y="'+(yy+4)+'" text-anchor="end">$'+dollars.toLocaleString('en-CA')+'</text>';}
    for(const m of [0,Math.round(maxMonths/2),maxMonths])svg+='<text x="'+x(m)+'" y="'+(height-15)+'" text-anchor="middle">'+m+'</text>';
    const colors={small:'#846016',store:'#a24330',vehicle:'#126f67'};
    debts.forEach(d=>{const points=[[0,d.balance],...steps.map((s,i)=>[i+1,s.debts.find(v=>v.id===d.id).balance])];
      svg+='<polyline fill="none" stroke="'+colors[d.id]+'" stroke-width="3" '+(d.id==='small'?'stroke-dasharray="5 3"':'')+' points="'+points.map(([m,c])=>x(m)+','+y(c)).join(' ')+'"/>';
      const last=points[points.length-1];svg+='<circle cx="'+x(last[0])+'" cy="'+y(last[1])+'" r="4" fill="'+colors[d.id]+'"/>';
    });
    svg+='<text x="'+(left+span/2)+'" y="'+(height-1)+'" text-anchor="middle">'+(state.screen==='S04'?'Story month':'Months after checkpoint')+'</text></svg>';
    $('#'+target).innerHTML=svg;
  }
  function renderPlayButton() {
    $('#play-control').innerHTML='<img src="assets/'+(playing?'IC11':'IC12')+'.png" alt="">'+(playing?'PAUSE SIMULATION':'PLAY SIMULATION');
    $('#play-control').setAttribute('aria-label',playing?'Pause simulation':'Play simulation');
  }
  function renderResults() {
    const a=result(state.route,'avalanche'),b=result(state.route,'snowball');
    $('#results').replaceChildren(...[a,b].map(p=>{
      const card=document.createElement('article');card.className='panel result-card';
      card.innerHTML='<h3>'+titleCase(p.strategy)+'</h3><p class="big-number">'+money(p.phaseInterest)+'</p><p class="result-caption">interest after the checkpoint</p><p class="result-months">'+p.months+' months after checkpoint</p><p class="result-story">Story month '+p.storyMonth+': all three debts cleared</p><p class="result-first" title="Months after checkpoint" aria-label="First balance cleared: portfolio month '+p.firstClearMonth+'">First balance cleared: month '+p.firstClearMonth+'</p><p class="result-interest">Interest since borrowing: '+money(p.totalInterest)+'</p><p class="result-reserve">Separate reserve retained: $200</p>';
      return card;
    }));
    bind('tradeoff-title',money(b.phaseInterest-a.phaseInterest)+' less interest, or an earlier first payoff');
    bind('tradeoff-copy','Both finish in '+a.months+' months here. Explain the trade-off using the evidence.');
    all('[data-action="finish"]').forEach(el=>{el.textContent=state.completed?'ACTIVITY COMPLETED':'FINISH ACTIVITY';el.disabled=state.completed;});
  }
  function forecastChart() {
    const data=['fixed','variable'].map(kind=>({kind,interest:M.loanSchedule(kind+'_'+state.term,false).interest})),max=Math.max(...data.map(d=>d.interest));
    $('#forecast-chart').innerHTML=data.map(d=>'<div class="forecast-row '+d.kind+'"><div><span>'+titleCase(d.kind)+'</span><strong>'+money(d.interest)+'</strong></div><div class="bar-track"><div class="bar-fill" style="width:'+d.interest/max*100+'%"></div></div></div>').join('');
    const selected=state.choicePredictions?.cost;
    const winner=data[0].interest<data[1].interest?'fixed':'variable',difference=Math.abs(data[0].interest-data[1].interest);
    $('#cost-feedback').textContent=selected?(selected===winner?'Yes. ':'Compare the bars again. ')+titleCase(winner)+' has '+money(difference)+' less vehicle interest if its rate stays unchanged.':'Make an optional choice to uncover the difference.';
    $('#first-feedback').textContent=state.choicePredictions?.first?'Prediction recorded: '+titleCase(state.choicePredictions.first)+'. Watch for the first debt to reach zero.':'Make an optional prediction, then watch the repayments.';
  }
  function strategyPreview(debts) {
    for(const strategy of ['avalanche','snowball']) {
      const target=M.ordered(debts,strategy)[0].id;
      $('[data-strategy-preview="'+strategy+'"]').innerHTML=['vehicle','small','store'].map(id=>{const d=debts.find(v=>v.id===id);return '<div class="target-debt'+(id===target?' target':'')+'"><img src="assets/'+({vehicle:'IC01',small:'IC04',store:'IC05'}[id])+'.png" alt=""><strong>'+({vehicle:'Vehicle',small:'Small loan',store:'Store card'}[id])+'</strong><span>'+d.rateBps/100+'% · '+money(d.balance)+'</span></div>';}).join('');
    }
  }
  function renderNavigation() {
    document.body.dataset.screen=state.screen;
    const round=['S02','S03','S04','S09'].includes(state.screen)?'S02':['S05','S06'].includes(state.screen)?'S05':state.screen;
    const unlocked={S02:true,S05:state.eventApplied,S07:state.eventApplied&&state.budgetSeen,S08:state.eventApplied&&state.strategyChosen,S10:state.eventApplied&&state.portfolioMonth===result().months};
    all('[data-action="round"]').forEach(button=>{button.disabled=!unlocked[button.dataset.screen];if(button.dataset.screen===round)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    $('#round-label').textContent=state.screen==='S01'?'Choose · Learn · Act':state.completed?'Activity completed':'Play at your own pace';
    $('#menu-progress').textContent=state.screen==='S01'?'A fictional CALM 10 decision game. No timer and no grade.':'Your '+M.routeInfo(state.route).kind+' '+M.routeInfo(state.route).months+'-month journey is paused at '+$('#screen-title').textContent.replace(/^S\d\d\s*/,'')+'.';
    $('[data-action="menu-continue"]').textContent=state.screen==='S01'?'START GAME ▶':'CONTINUE GAME ▶';
    $('[data-action="back"]').hidden=state.screen==='S01';
  }
  function render() {
    const screen=$('#'+state.screen),r=M.routeInfo(state.route),c=M.checkpoint(state.route),vehicle=c.debts.find(d=>d.id==='vehicle');
    all('.screen').forEach(el=>{el.hidden=el.id!==state.screen;});
    $('#screen-title').textContent=screen.dataset.title;
    let subtitle=screen.dataset.subtitle;
    if(state.screen==='S02')subtitle='Compare monthly fit and borrowing cost. Choose a loan to inspect one payment.';
    if(state.screen==='S05'){subtitle='The same contract continues. One disclosed rate rise follows payment 12.';$('#screen-title').textContent=r.kind==='variable'?'A rate change affects the variable loan.':'Your fixed loan keeps the same payment.';}
    if(state.screen==='S10')subtitle='Your '+r.kind+' '+r.months+'-month route · compare both strategies from the same checkpoint';
    if(reference && state.route==='variable_60')subtitle=screen.dataset.subtitle;
    $('#screen-subtitle').textContent=subtitle;renderNavigation();
    bind('term-label',state.screen==='S02'?state.term:r.months);bind('old-rate',r.kind==='variable'?'5.0%':'6.5%');bind('event-contract',titleCase(r.kind)+' vehicle loan · same contract');
    bind('initial-payment',money(r.initialPayment));bind('first-interest',money(M.interest(1200000,r.rateBps)));
    bind('first-principal',money(r.initialPayment-M.interest(1200000,r.rateBps)));
    all('.interest-bar').forEach(el=>{el.style.width=(M.interest(1200000,r.rateBps)/r.initialPayment*100)+'%';});
    bind('vehicle-checkpoint',money(vehicle.balance));bind('remaining',r.months-12);bind('new-payment',money(c.vehiclePayment));
    bind('required',money(c.required));bind('extra',money(c.budget-c.required));
    bind('rate-change',r.kind==='variable'?'5.0% → 6.5%':'6.5% → 6.5%');
    bind('payment-increase',r.kind==='variable'?'Increase: '+money(c.eventIncrease)+' per month':'Fixed payment: no change');
    bind('event-explanation',r.kind==='variable'?'This variable contract adjusts the payment to keep the original repayment date. The fixed contract does not change.':"This contract’s rate is fixed, so this event does not change its payment. Its remaining balance still continues.");
    for(const kind of ['fixed','variable']) {
      const option=M.routeInfo(kind+'_'+(state.screen==='S02'?state.term:r.months));bind(kind+'-payment',money(option.initialPayment));bind(kind+'-forecast',money(M.loanSchedule(option.id,false).interest));
      bind(kind+'-fit',option.eligible?'✓ Fits your $340/month budget · '+money(option.initialPayment)+' + $105 = '+money(option.minimums):'⚠ Does not fit the $340/month budget');
      bind(kind+'-gap','Budget gap: '+money(option.gap)+' each month');all('[data-bind="'+kind+'-gap"]').forEach(el=>el.hidden=option.eligible);
    }
    forecastChart();
    all('[data-action="term"]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.term)===state.term)));
    $('.payment-reveal').hidden=!state.revealed;$('.prediction-block').hidden=state.revealed;$('#continue-first-year').disabled=!state.revealed;
    $('#payment-prediction').value=state.paymentPrediction;$('#strategy-prediction').value=state.strategyPrediction;$('#reflection').value=state.reflection;
    $('#simulation-speed').value=String(state.speed);
    if(state.screen==='S04') {const f=M.firstYear(state.route,state.firstMonth);bind('first-month',state.firstMonth);debtCards('first-debts',f.debts);plot('first-chart',M.origin(state.route),f.rows,12);$('#show-event').disabled=state.firstMonth!==12;all('[data-action="first-step"],[data-action="first-skip"]').forEach(el=>el.disabled=state.firstMonth===12);}
    if(state.screen==='S07'){debtCards('strategy-debts',c.debts);strategyPreview(c.debts);}
    if(state.screen==='S08') {
      const p=result(),steps=p.rows.slice(0,state.portfolioMonth),debts=steps.length?steps[steps.length-1].debts:p.start.debts;
      debtCards('simulation-debts',debts,true);plot('portfolio-chart',p.start.debts,steps,p.months);
      bind('strategy-name',titleCase(state.strategy));bind('portfolio-month',state.portfolioMonth);bind('story-month',12+state.portfolioMonth);
      bind('phase-interest',money(steps.reduce((a,s)=>a+s.interest,0)));bind('target-label',label(M.ordered(debts,state.strategy)[0]?.id)||'All debts cleared');renderPlayButton();
    }
    if(state.screen==='S09') {bind('recovery-gap',money(r.gap)+' short each month');bind('recovery-detail','Vehicle '+money(r.initialPayment)+' + other minimums $105.00 = '+money(r.minimums)+'. The monthly debt budget is $340.00.');}
    if(state.screen==='S10')renderResults();
    $('#progress-label').textContent=state.screen==='S01'?'Orientation · about 8–12 minutes':state.screen==='S09'?'Return to loan comparison':state.screen+' · '+r.kind+' rate · '+r.months+' months'+(state.completed?' · completed':'');
    document.title='Credit Gauntlet — '+$('#screen-title').textContent.replace(/^S\d\d\s*/,'');
    if(preview)status('Preview only · does not change your save');
  }
  function advance() {
    if(state.screen!=='S08'||awaitingResume||actionBusy)return;
    actionBusy=true;const p=result();
    if(state.portfolioMonth<p.months)state.portfolioMonth++;
    if(state.portfolioMonth===p.months) {announce('All debts cleared at story month '+p.storyMonth+'. Compare the two methods.');switchScreen('S10');}
    else {render();host.save();if(!playing)announce('Portfolio month '+state.portfolioMonth+'. Interest since checkpoint '+money(p.rows.slice(0,state.portfolioMonth).reduce((a,m)=>a+m.interest,0))+'.');}
    // Prevent a rapid double tap from being interpreted as a second month.
    setTimeout(()=>{actionBusy=false;},180);
  }
  function scheduleTick() {
    const token=generation;
    timer=setTimeout(()=>{if(!playing||token!==generation||state.screen!=='S08')return;advance();if(playing)scheduleTick();},state.speed);
  }
  function startStrategy(strategy) {state.strategyChosen=true;state.strategy=strategy;state.portfolioMonth=0;switchScreen('S08');announce(titleCase(strategy)+' comparison ready. Choose Play or Step.');}
  function resetState() {
    stop();
    try {if(rawSave)localStorage.setItem(BACKUP,rawSave);}catch(error){}
    state=fresh(state.completed);awaitingResume=false;closeDialog();switchScreen('S02');
  }
  function ledger() {
    const r=M.routeInfo(state.route);let rows=[];
    if(['S01','S02','S03','S09'].includes(state.screen)) {
      rows=M.loanSchedule(state.screen==='S02'?'variable_'+state.term:state.route,false).rows;
      $('#ledger-description').textContent='Vehicle-only forecast if its initial rate stays unchanged. These are inspectable figures, not posted game payments.';
    } else {
      const first=M.firstYear(state.route,state.screen==='S04'?state.firstMonth:12);
      rows=first.rows.flatMap(m=>m.rows.map(d=>({...d,storyMonth:m.storyMonth})));
      if(['S08','S10'].includes(state.screen))rows.push(...result().rows.slice(0,state.portfolioMonth).flatMap(m=>m.rows.map(d=>({...d,storyMonth:m.storyMonth}))));
      $('#ledger-description').textContent='Posted payments for '+r.kind+' / '+r.months+' months'+(['S08','S10'].includes(state.screen)?', '+state.strategy:'')+'. Portfolio month 1 is story month 13.';
    }
    $('#ledger-body').replaceChildren(...rows.map(d=>{const tr=document.createElement('tr');for(const cell of [d.storyMonth,label(d.id),(money(d.opening)),(d.rateBps/100)+'%',money(d.interest),money(d.payment),money(d.principal),money(d.closing)]){const td=document.createElement('td');td.textContent=cell;tr.append(td);}return tr;}));
    openDialog('ledger-dialog');
  }
  function downloadEarlier() {
    const blob=new Blob([rawSave||''],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='credit-gauntlet-earlier-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
    const action=button.dataset.action;if(button.tagName==='A')event.preventDefault();
    if(action==='menu'){openDialog('menu-dialog',button);return;}
    if(action==='menu-continue'){awaitingResume=false;closeDialog();if(state.screen==='S01')switchScreen('S02');else{render();status(preview?'Preview only · does not change your save':writesBlocked?'Saving paused · review the earlier save':'Comparison restored · paused');}return;}
    if(action==='menu-new'||action==='new-loan'){if(state.screen==='S01'){awaitingResume=false;closeDialog();switchScreen('S02');}else{closeDialog();openDialog('reset-dialog',button);}return;}
    if(action==='menu-help'){closeDialog();openDialog('help-dialog',button);return;}
    if(action==='back'){const previous={S02:'menu',S03:'S02',S04:'S03',S05:'S04',S06:'S05',S07:'S06',S08:'S07',S09:'S02',S10:'S08'}[state.screen];if(previous==='menu')openDialog('menu-dialog',button);else if(previous)switchScreen(previous);return;}
    if(action==='round'){if(button.disabled)return;switchScreen(button.dataset.screen);return;}
    if(action==='review-balances'){switchScreen('S04');return;}
    if(action==='challenge'){state.choicePredictions={...(state.choicePredictions||{}),[button.dataset.question]:button.dataset.choice};render();host.save();return;}
    if(action==='close-dialog'){closeDialog();if(awaitingResume)openDialog('menu-dialog');return;}
    if(action==='help'){openDialog('help-dialog',button);return;}
    if(action==='ledger'){ledger();return;}
    if(action==='reset'||action==='resume-reset'){closeDialog();openDialog('reset-dialog',button);return;}
    if(action==='confirm-reset'){resetState();return;}
    if(action==='resume'){awaitingResume=false;closeDialog();render();status('Saved comparison restored · paused');return;}
    if(action==='export-save'){downloadEarlier();return;}
    if(action==='discard-save'){
      try{if(rawSave)localStorage.setItem(BACKUP,rawSave);localStorage.removeItem(KEY);lastToken=null;writesBlocked=false;}catch(error){status('Could not preserve earlier save · download it first');return;}
      closeDialog();state=fresh();switchScreen('S02');return;
    }
    if(reference)return;
    if(action==='start'||action==='choices'){switchScreen('S02');return;}
    if(action==='term'){state.choicePredictions={};state.term=Number(button.dataset.term);render();host.save();announce(state.term+'-month comparison selected.');return;}
    if(action==='loan'){state.route=button.dataset.kind+'_'+state.term;state.firstMonth=0;state.portfolioMonth=0;state.eventApplied=false;state.strategyChosen=false;state.budgetSeen=false;state.revealed=false;state.paymentPrediction='';state.strategyPrediction='';state.reflection='';state.choicePredictions={cost:state.choicePredictions?.cost};if(!state.choicePredictions.cost)state.choicePredictions={};switchScreen(M.routeInfo(state.route).eligible?'S03':'S09');return;}
    if(action==='reveal'){state.revealed=true;render();host.save();announce('Payment revealed. '+money(M.interest(1200000,M.routeInfo(state.route).rateBps))+' interest; the rest reduces principal.');$('#continue-first-year').focus();return;}
    if(action==='first-year'){switchScreen('S04');return;}
    if(action==='first-step'||action==='first-skip'){state.firstMonth=action==='first-step'?Math.min(12,state.firstMonth+1):12;render();host.save();announce('Story month '+state.firstMonth+' completed.');return;}
    if(action==='rate-event'){if(state.firstMonth!==12)return;state.eventApplied=true;switchScreen('S05');return;}
    if(action==='budget'){switchScreen('S06');return;}
    if(action==='strategy'){state.budgetSeen=true;switchScreen('S07');return;}
    if(action==='choose-strategy'){startStrategy(button.dataset.strategy);return;}
    if(action==='play'){if(playing){stop();renderPlayButton();host.save();announce('Simulation paused.');}else{playing=true;generation++;renderPlayButton();scheduleTick();announce('Simulation playing.');}return;}
    if(action==='step'){stop();advance();return;}
    if(action==='restart-strategy'){startStrategy(state.strategy);return;}
    if(action==='other-strategy'){startStrategy(state.strategy==='avalanche'?'snowball':'avalanche');return;}
    if(action==='finish'){host.markComplete();render();announce('Activity completed. You can keep exploring the same comparison.');status(preview?'Preview completion · not saved':'Activity completed · saved on this browser');return;}
  });
  for(const [id,key] of [['payment-prediction','paymentPrediction'],['strategy-prediction','strategyPrediction'],['reflection','reflection']])$('#'+id).addEventListener('input',event=>{state[key]=event.target.value;host.save();});
  $('#simulation-speed').addEventListener('change',event=>{state.speed=Number(event.target.value);if(playing){clearTimeout(timer);generation++;scheduleTick();}host.save();});
  $('.term-buttons').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const buttons=all('[data-action="term"]'),i=buttons.indexOf(event.target);if(i<0)return;event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:2))%3;buttons[next].focus();buttons[next].click();
  });
  all('dialog').forEach(d=>{d.addEventListener('close',()=>{if(opener?.isConnected)opener.focus();if((d.id==='reset-dialog'||d.id==='help-dialog')&&awaitingResume)openDialog('menu-dialog');});for(const type of ['cancel','keydown'])d.addEventListener(type,event=>{if((d.id==='resume-dialog'||d.id==='save-dialog'||(d.id==='menu-dialog'&&awaitingResume))&&(type==='cancel'||event.key==='Escape'))event.preventDefault();});});
  window.addEventListener('storage',event=>{if(!preview&&event.key===KEY&&event.newValue!==rawSave){writesBlocked=true;stop();renderPlayButton();status('Another tab changed this save · reload to choose the latest version');}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();renderPlayButton();host.flush();}});
  window.addEventListener('pagehide',()=>host.close());
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(['S04','S08'].includes(state.screen))render();},80);});
  document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement){event.target.style.visibility='hidden';status('An image could not load · all text and controls remain available');}},true);
  if(reference)document.body.classList.add('reference-mode');
  if(preview) {
    state=fresh();state.screen=screens.includes(params.get('screen'))?params.get('screen'):'S02';
    if(M.ROUTES.includes(params.get('route')))state.route=params.get('route');
    state.term=M.routeInfo(state.route).months;
    if(!M.routeInfo(state.route).eligible&&!['S01','S02','S09'].includes(state.screen)){state.route='variable_60';state.term=60;}
    if(['S04','S05','S06','S07','S08','S10'].includes(state.screen)){state.revealed=true;state.firstMonth=12;}
    state.eventApplied=['S05','S06','S07','S08','S10'].includes(state.screen);state.budgetSeen=['S07','S08','S10'].includes(state.screen);state.strategyChosen=['S08','S10'].includes(state.screen);
    if(state.screen==='S10')state.portfolioMonth=result().months;
    if(state.screen==='S09'){state.route='variable_36';state.term=36;}
    render(); window.scrollTo(0,0);
  } else {
    const saved=host.load();
    if(saved==='invalid'){render();status('Earlier save needs review · saving paused');openDialog('save-dialog');}
    else if(saved){state={...fresh(),...saved};if(saved.budgetSeen===undefined)state.budgetSeen=['S07','S08','S10'].includes(saved.screen);if(saved.strategyChosen===undefined)state.strategyChosen=['S08','S10'].includes(saved.screen);awaitingResume=true;render();$('#resume-description').textContent=M.routeInfo(state.route).kind+' rate, '+M.routeInfo(state.route).months+' months. Saved at '+state.screen+', story month '+(state.firstMonth<12?state.firstMonth:12+state.portfolioMonth)+'.';openDialog('menu-dialog');}
    else render();
  }
})();
