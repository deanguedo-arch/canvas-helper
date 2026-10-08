import {asset,escapeHTML as h,panel} from './ui.js';

const paths={
 atom:'<ellipse cx="32" cy="32" rx="27" ry="10"/><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(120 32 32)"/><circle cx="32" cy="32" r="4" fill="currentColor"/>',
 energy:'<path d="M37 4 13 35h17l-3 25 24-33H34z" fill="currentColor" stroke="none"/>',
 infection:'<circle cx="32" cy="32" r="17"/><path d="M32 5v10m0 34v10M5 32h10m34 0h10M13 13l8 8m22 22 8 8M13 51l8-8m22-22 8-8"/><circle cx="26" cy="27" r="2" fill="currentColor"/><circle cx="38" cy="38" r="2" fill="currentColor"/>',
 genetics:'<path d="M19 5c0 20 26 14 26 34 0 8-8 17-8 20M45 5c0 20-26 14-26 34 0 8 8 17 8 20M20 12h24M24 20h16M24 29h16M20 39h24M23 48h18M27 56h10"/>',
 motion:'<path d="M10 29 16 15h31l7 14v19H10zM16 48v7m32-7v7M13 28h38"/><circle cx="19" cy="39" r="3"/><circle cx="45" cy="39" r="3"/>',
 check:'<path d="m13 32 12 12 26-27"/>',
 light:'<path d="M23 45c0-9-10-10-10-22a19 19 0 0 1 38 0c0 12-10 13-10 22M23 45h18M23 51h18M27 58h10"/>',
 shield:'<path d="m32 5 23 9v18c0 12-14 22-23 27C23 54 9 44 9 32V14zM20 30l9 9 16-18"/>'
};
export function icon(kind){return `<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${paths[kind]||paths.atom}</svg>`;}
const kind={A2:'atom',B1:'energy',B2:'energy',C1:'infection',C2:'genetics',D1:'motion',D2:'motion'};
const mottos={A2:'BUILD. BALANCE. MAKE A DIFFERENCE.',B2:'PLAN. CALCULATE. OPTIMISE.'};
const names={A2:['The Order','Assembly Line','Atom Ledger'],B1:['The Mission','Build the Energy Chain','Energy Accounting'],B2:['The Mission','Your Plan','Your Budget'],C1:['The Case','Transmission Map','Your Reasoning'],C2:['The Case','The Evidence','Your Reasoning'],D1:['The Scenario','The Road Test','Your Reasoning'],D2:['The Mission','The Test Bay','The Results']};
export function photo(alt='Context illustration; use the stated model data for calculations',className='premium-photo'){return `<img class="${className}" src="${asset('assets/premium/scene-v1.png')}" alt="${h(alt)}">`;}
export function polish(root,bank,s,session,m){
 root.dataset.game=bank.game_id;
 const heading=root.querySelector('.game-heading');
 heading.innerHTML=`<div class="game-badge">${icon(kind[bank.game_id])}</div><div><span class="game-eyebrow">GAME ${bank.game_id.endsWith('1')?'1':'2'}</span><h1 tabindex="-1">${h(bank.game_id+' '+bank.title)}</h1></div><div class="premium-heading-aside"><span>${h(mottos[bank.game_id]||'OBSERVE. ANALYSE. CONCLUDE.').replaceAll('. ','.<br>')}</span><div>${icon(kind[bank.game_id])}<small>SAME EVIDENCE.<br>BIGGER THINKING.</small></div></div>`;
 const header=root.querySelector('.course-header');
 header.innerHTML='<div class="course-brand"><span class="science24">Science <em>24</em></span><span class="brand-divider"></span><span class="tagline">Real Science. Brighter Futures.</span></div><div class="nextstep"><span class="chevrons" aria-hidden="true"><svg viewBox="0 0 66 54" aria-hidden="true"><path d="M2 3h15l17 24-17 24H2l17-24zM28 3h15l17 24-17 24H28l17-24z" fill="currentColor"/></svg></span><span>Next Step</span><small>LEARN<br>PRACTISE<br>PROGRESS</small></div>';
 const ws=root.querySelector('.workspace');
 if(session.stage==='brief'){
  ws.className='workspace premium-start';
  ws.innerHTML=`<section class="premium-landing">${photo('Science 24 '+bank.title+' context scene','premium-landing-photo')}<div class="landing-copy"><span class="game-eyebrow">YOUR INVESTIGATION</span><h2>${h(bank.title)}</h2><p>${h(bank.instructions[0])}</p><div class="btn-row"><button class="btn primary" data-action="start">Start investigation →</button><button class="btn" data-action="help">How to play</button></div><p class="small-note">One worked example · Four practice cases · One independent transfer</p></div></section><div class="landing-instructions">${panel('Observe',1,'Make a prediction','<p>'+h(bank.instructions[1])+'</p>')}${panel('Build & Check',2,'Use the stated model','<p>'+h(bank.instructions[2])+'</p>')}${panel('Explain & Review',3,'Keep your evidence','<p>'+h(bank.instructions[3])+'</p>')}</div>`;
 }else if(session.stage==='attempt'||session.stage==='worked'){
  const panels=[...ws.querySelectorAll(':scope > .panel')];
  if((bank.game_id==='D1'||bank.game_id==='D2')&&panels.length===3)ws.append(panels[2],panels[1]);
  [...ws.querySelectorAll(':scope > .panel')].forEach((p,i)=>{p.querySelector('.panel-header h2').textContent=names[bank.game_id][i];p.querySelector('.index').textContent='0'+(i+1);});
  const photos=ws.querySelectorAll('.hero-scene');
  photos.forEach(img=>{img.src=asset('assets/premium/scene-v1.png');img.alt='Context illustration; calculations refer to the supplied case data.';img.classList.add('premium-photo');});
  if(bank.game_id==='A2'){
   photos.forEach(img=>{img.classList.add('small-context');img.src=asset('assets/premium/context-v1.png');img.alt='Illustrative laboratory glassware; bubbles alone do not identify a chemical change.';});
  }
  if(bank.game_id==='D1'||bank.game_id==='D2'){
   photos.forEach(img=>img.classList.add('small-context'));
   ws.querySelector('.panel:nth-child(2) .panel-body').insertAdjacentHTML('afterbegin',photo(bank.game_id==='D1'?'Road scene, illustrative; the replay strip supplies the model positions.':'Controlled test bay, illustrative; the ledger names the occupant or cart system.'));
  }
  if(session.stage==='worked'){
   ws.querySelectorAll('[data-field],[data-step],[data-measure],[data-prediction],[data-action=lock],[data-action=check],[data-action=hint]').forEach(el=>{el.disabled=true;el.setAttribute('aria-disabled','true');});
   ws.querySelectorAll('[data-field=explanation]').forEach(el=>el.closest('label').remove());
   ws.querySelectorAll('[data-action=check],[data-action=hint]').forEach(el=>el.remove());
   ws.querySelector('[data-prediction]')?.closest('.callout').remove();
   ws.querySelector('.panel:first-child .panel-body').insertAdjacentHTML('beforeend',`<div class="callout worked-evidence"><h3>Worked example</h3><p>${h(s.teacherReasoning)}</p><p class="small-note">This is teaching, not an independent learner response.</p></div>`);
  }
 }else if(session.stage==='feedback'){
  const body=ws.querySelector('.panel-body');body.insertAdjacentHTML('afterbegin',photo('Investigation context','premium-photo result-photo'));
  const status=ws.querySelector('[data-feedback-heading]');status.classList.add(m.feedback?.valid?'result-correct':'result-revise');status.insertAdjacentHTML('afterbegin',icon(m.feedback?.valid?'check':'light'));
 }else if(session.stage==='transfer'){
  ws.classList.add('premium-transfer');
  ws.querySelector('.panel:first-child .panel-body').insertAdjacentHTML('afterbegin',`<div class="transfer-banner">${icon('shield')}<div><strong>Independent transfer</strong><span>Fresh evidence. Your first response stays on record.</span></div></div>`);
 }
 const progress=root.querySelector('.progress');if(progress){progress.setAttribute('aria-label','Investigation stages');progress.classList.add('premium-progress');root.querySelector('main').append(progress);}
 const main=root.querySelector('main');
 const footer=document.createElement('footer');footer.className='premium-footer';footer.innerHTML='<span>SCIENCE 24 &nbsp; | &nbsp; LEARN TODAY. A BRIGHTER TOMORROW.</span><span>Next Step <b>→</b></span>';main.after(footer);
 const bottom=root.querySelectorAll('.bottom-strip .status-icon');if(bottom[0])bottom[0].innerHTML=icon('check');if(bottom[1])bottom[1].innerHTML=icon('light');
}
