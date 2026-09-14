/* Canonical behaviour only: teaching content lives in HTML. */
(function () {
'use strict';
const LIMIT=48000,TEXT_LIMIT=400,FIELDS=['plan','work','evidence','reflection'],PROJECT_FIELDS=['connections','proposal',...FIELDS];
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fieldsFor=(c,id)=>c.projects.includes(id)?PROJECT_FIELDS:FIELDS;
function createState(c){return {schemaVersion:1,projectSlug:c.slug,drafts:{},practice:{},reviewed:[],portfolioIds:[],lastRoute:'overview',updatedAt:new Date().toISOString()};}
function validateState(raw,c){
 if(typeof raw!=='string'||raw.length>LIMIT)throw Error('Backup exceeds the 48,000-character limit.');
 let s;try{s=JSON.parse(raw);}catch{throw Error('This file is not valid JSON.');}
 const keys=['schemaVersion','projectSlug','drafts','practice','reviewed','portfolioIds','lastRoute','updatedAt'];
 if(!plain(s)||Object.keys(s).some(k=>!keys.includes(k))||keys.some(k=>!(k in s)))throw Error('Backup structure is not recognized.');
 if(s.schemaVersion!==1)throw Error('Unsupported backup version.');
 if(s.projectSlug!==c.slug)throw Error('This backup belongs to another course.');
 if(!plain(s.drafts)||!plain(s.practice))throw Error('Malformed draft or practice records.');
 for(const [id,d] of Object.entries(s.drafts)){
  if(!c.ids.includes(id)||!plain(d))throw Error('Unknown module or malformed draft.');
  for(const [k,v]of Object.entries(d))if(!fieldsFor(c,id).includes(k)||typeof v!=='string'||v.length>TEXT_LIMIT||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)||!v.isWellFormed())throw Error('Invalid or oversized draft field.');
 }
 for(const [id,a]of Object.entries(s.practice)){
  if(!c.ids.includes(id)||!plain(a)||Object.keys(a).some(q=>!['decision','transfer'].includes(q))||Object.values(a).some(v=>!Number.isInteger(v)||v<0||v>2))throw Error('Invalid practice record.');
 }
 for(const k of ['reviewed','portfolioIds']){
  const a=s[k];if(!Array.isArray(a)||a.length>c.ids.length||new Set(a).size!==a.length||a.some(id=>!c.ids.includes(id)))throw Error('Invalid or duplicate selections.');
  if(a.some((id,i)=>i>0&&c.ids.indexOf(a[i-1])>c.ids.indexOf(id)))throw Error('Selections are not in course order.');
 }
 if(!c.routes.includes(s.lastRoute)||typeof s.updatedAt!=='string'||s.updatedAt.length>30||!Number.isFinite(Date.parse(s.updatedAt)))throw Error('Invalid route or date.');
 return s;
}
function serialize(s,c){const raw=JSON.stringify(s);validateState(raw,c);return raw;}
function ready(s,c,id){return c.ids.includes(id)&&fieldsFor(c,id).every(k=>typeof s.drafts[id]?.[k]==='string'&&s.drafts[id][k].trim().length>0);}
function savePortfolio(s,c,id){if(!ready(s,c,id))throw Error('Complete every response before saving to Portfolio.');s.portfolioIds=c.ids.filter(k=>k===id||s.portfolioIds.includes(k));}
function calculate(kind,a,b){
 if(!['percentage','margin','multiply'].includes(kind))throw Error('Unknown calculation.');
 if(![a,b].every(Number.isFinite)||a<0||b<0)throw Error('Enter non-negative numbers.');
 if(kind==='percentage'){if(!b)throw Error('The total must be greater than zero.');const result=a/b*100;if(!Number.isFinite(result))throw Error('Result is too large.');return result;}
 if(kind==='margin'){if(!b||a>b)throw Error('Selling price must be positive and at least the cost.');return (b-a)/b*100;}
 const result=a*b;if(!Number.isFinite(result))throw Error('Result is too large.');return result;
}
const api={LIMIT,TEXT_LIMIT,FIELDS,PROJECT_FIELDS,createState,validateState,serialize,ready,savePortfolio,calculate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;
const c=JSON.parse(document.getElementById('course-config').textContent),storageKey='canvas-helper:'+c.slug+':state:v1';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let state=createState(c),storageProblem='';
try{const raw=localStorage.getItem(storageKey);if(raw)state=validateState(raw,c);}catch(e){storageProblem='Saved work could not be loaded: '+e.message+' The stored value is unchanged. Restore a valid backup to recover your work.';}
const notify=message=>{$('#save-status').textContent=message;};
function persist(message='Saved on this device.'){
 state.updatedAt=new Date().toISOString();
 try{localStorage.setItem(storageKey,serialize(state,c));storageProblem='';$('#recovery-message').hidden=true;notify(message);return true;}
 catch(e){notify('Work is in this page only: '+e.message+' Download a backup before closing.');return false;}
}
function showRoute(route,focus=true){
 const [base,anchor]=route.split(':');route=base;
 if(!c.routes.includes(route))route='overview';
 $$('[data-route-panel]').forEach(p=>p.hidden=p.id!==route);
 const section=route.startsWith('module-')?'modules':route.startsWith('project-')?'projects':route;
 $$('[data-nav]').forEach(a=>{if(a.dataset.nav===section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 state.lastRoute=route;document.body.dataset.route=route;document.body.classList.remove('menu-open');$('#menu-toggle').setAttribute('aria-expanded','false');
 if(focus){$('#'+route+' h1')?.focus();window.scrollTo(0,0);if(anchor){const target=document.getElementById(anchor);if(target?.closest('[data-route-panel]')?.id===route)target.scrollIntoView({block:'start'});}}
}
function summary(){return c.title+'\n'+state.portfolioIds.length+' saved portfolio items; '+c.ids.filter(id=>ready(state,c,id)).length+' complete draft records.\nReadiness is not a grade or credit award.\n'+c.ids.map(id=>id+': '+(ready(state,c,id)?'Draft complete':'In progress')+(state.portfolioIds.includes(id)?' · Saved to Portfolio':'')).join('\n');}
function render(){
 const count=c.ids.filter(id=>ready(state,c,id)).length;
 $$('[data-progress]').forEach(n=>n.textContent=count+' of '+c.ids.length+' draft records complete');
 $$('[data-save-portfolio]').forEach(b=>{const id=b.dataset.savePortfolio,saved=state.portfolioIds.includes(id);b.disabled=!ready(state,c,id)||saved;b.textContent=saved?'Saved to Portfolio':'Save to Portfolio';b.setAttribute('aria-pressed',String(saved));});
 $$('[data-draft-status]').forEach(n=>n.textContent=ready(state,c,n.dataset.draftStatus)?'Draft complete — teacher assessment pending':'Draft in progress');
 $$('[data-review-module]').forEach(b=>b.setAttribute('aria-pressed',String(state.reviewed.includes(b.dataset.reviewModule))));
 $('#portfolio-summary').textContent=summary();
 $('#saved-items').innerHTML=state.portfolioIds.length?state.portfolioIds.map(id=>{
  const form=$('[data-draft="'+id+'"]'),title=form.closest('[data-route-panel]').querySelector('h1').textContent;
  return '<article data-saved-item="'+id+'"><h3>'+esc(title)+'</h3><p>'+(ready(state,c,id)?'Draft complete — teacher assessment pending':'Draft in progress; saved membership retained')+'</p><dl>'+fieldsFor(c,id).map(k=>'<dt>'+esc(form.querySelector('[name="'+k+'"]').labels[0].querySelector('span').textContent)+'</dt><dd class="question-context">'+esc(form.querySelector('[name="'+k+'"]').labels[0].querySelector('small').textContent)+'</dd><dd>'+esc(state.drafts[id]?.[k]||'No response yet.')+'</dd>').join('')+'</dl><a href="#'+(c.projects.includes(id)?'project':'module')+'-'+id+'">Continue editing '+id+'</a></article>';
 }).join(''):'<p data-empty-portfolio>No assignments or projects have been saved yet. Complete a module response record, then choose Save to Portfolio.</p>';
}
function feedback(q,choice){
 const correct=Number(q.dataset.correct)===choice;
 q.querySelector('output').textContent=(correct?'Reasoning check: ':'Try again: ')+q.querySelector('[data-feedback="'+choice+'"]').textContent;
 q.querySelector('output').dataset.result=correct?'correct':'retry';
}
function hydrate(){
 $$('[data-draft]').forEach(f=>f.querySelectorAll('textarea').forEach(n=>n.value=state.drafts[f.dataset.draft]?.[n.name]||''));
 $$('[data-question]').forEach(q=>{const selected=state.practice[q.dataset.module]?.[q.dataset.question];q.querySelectorAll('input').forEach(n=>n.checked=selected!==undefined&&Number(n.value)===selected);if(selected!==undefined)feedback(q,selected);else q.querySelector('output').textContent='';});
 render();
}
function printSection(source,title){
 const root=$('#print-root');root.replaceChildren();const h=document.createElement('h1');h.textContent=title;root.append(h);
 let clone;const evidence=source.querySelector('[data-evidence-section]');
 if(evidence){clone=document.createElement('section');clone.append(evidence.cloneNode(true));const rubric=source.querySelector('[data-assessment-rubric]');if(rubric)clone.append(rubric.cloneNode(true));}
 else{clone=source.cloneNode(true);clone.querySelector('header h1')?.remove();}
 clone.hidden=false;
 clone.querySelectorAll('[data-no-print],button,input[type=file],.page-turn').forEach(n=>n.remove());
 clone.querySelectorAll('[hidden]').forEach(n=>n.hidden=false);clone.querySelectorAll('details').forEach(n=>n.open=true);
 clone.querySelectorAll('textarea').forEach(n=>{const p=document.createElement('p');p.textContent=n.value;n.replaceWith(p);});
 clone.querySelectorAll('input').forEach(n=>n.remove());root.append(clone);root.setAttribute('aria-hidden','false');window.print();
}
window.addEventListener('afterprint',()=>{$('#print-root').replaceChildren();$('#print-root').setAttribute('aria-hidden','true');});
document.addEventListener('input',e=>{
 const n=e.target;if(!(n instanceof HTMLTextAreaElement))return;const f=n.closest('[data-draft]');if(!f)return;
 const id=f.dataset.draft;state.drafts[id]||={};const value=n.value.slice(0,TEXT_LIMIT);if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)||!value.isWellFormed()){notify('This response contains unsupported characters. Remove them to save; your previous saved response is unchanged.');return;}state.drafts[id][n.name]=value;persist();render();
});
document.addEventListener('click',e=>{
 const link=e.target.closest('a[href^="#"]');
 if(link){const hash=link.getAttribute('href'),base=hash.slice(1).split(':')[0];if(c.routes.includes(base)){e.preventDefault();if(location.hash!==hash)history.pushState(null,'',hash);showRoute(hash.slice(1));if(!storageProblem)persist();return;}}
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='menu-toggle'){const open=document.body.classList.toggle('menu-open');b.setAttribute('aria-expanded',String(open));}
 if(b.id==='sidebar-toggle'){const collapsed=document.body.classList.toggle('sidebar-collapsed');b.setAttribute('aria-expanded',String(!collapsed));b.textContent=collapsed?'Expand menu':'Collapse menu';}
 if(b.dataset.savePortfolio){try{savePortfolio(state,c,b.dataset.savePortfolio);persist(b.dataset.savePortfolio+' saved to Portfolio.');render();}catch(error){notify(error.message);}}
 if(b.dataset.reviewModule){const id=b.dataset.reviewModule;state.reviewed=c.ids.filter(k=>k===id?!state.reviewed.includes(k):state.reviewed.includes(k));persist('Reading review updated. This does not award a credit.');render();}
 if(b.hasAttribute('data-check')){const q=b.closest('[data-question]'),v=q.querySelector('input:checked');if(!v){q.querySelector('output').textContent='Choose a response first.';return;}state.practice[q.dataset.module]||={};state.practice[q.dataset.module][q.dataset.question]=Number(v.value);feedback(q,Number(v.value));persist('Practice response saved.');}
 if(b.dataset.print){const node=document.getElementById(b.dataset.print);printSection(node,node.querySelector('h1,h2')?.textContent||c.title);}
 if(b.hasAttribute('data-backup')){const blob=new Blob([serialize(state,c)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=c.slug+'-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Backup downloaded.');}
 if(b.hasAttribute('data-copy')){if(!navigator.clipboard){notify('Select and copy the summary text below.');return;}navigator.clipboard.writeText(summary()).then(()=>notify('Summary copied.')).catch(()=>notify('Select and copy the summary text below.'));}
 if(b.hasAttribute('data-calculate')){const box=b.closest('[data-calculator]');try{const n=[...box.querySelectorAll('input')];if(n.some(x=>!x.value.trim()))throw Error('Enter both values.');box.querySelector('output').textContent='Result: '+calculate(box.dataset.calculator,...n.map(x=>Number(x.value))).toFixed(2)+' '+(box.dataset.unit||'');}catch(error){box.querySelector('output').textContent=error.message;}}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('menu-open');$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').focus();}});
$('#restore').addEventListener('change',async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 try{if(file.size>LIMIT*4)throw Error('Backup file is too large.');const candidate=validateState(await file.text(),c);state=candidate;hydrate();history.replaceState(null,'','#'+state.lastRoute);showRoute(state.lastRoute);persist('Backup restored.');$('#restore-message').textContent='Backup restored successfully.';}
 catch(error){$('#restore-message').textContent='Backup was not restored: '+error.message+' Current work is unchanged.';}
});
window.addEventListener('hashchange',()=>{showRoute(location.hash.slice(1));if(!storageProblem)persist();});
hydrate();showRoute(location.hash.slice(1)||state.lastRoute,false);
if(storageProblem){$('#recovery-message').textContent=storageProblem;$('#recovery-message').hidden=false;notify('Stored work needs attention.');}
 window.addEventListener('load',()=>{if(storageProblem){requestAnimationFrame(()=>requestAnimationFrame(()=>{const message=$('#recovery-message');message.tabIndex=-1;message.focus({preventScroll:true});window.scrollTo(0,0);}));}});
window.CTSCourse={...api,storageKey,config:c,serialize:()=>serialize(state,c)};
})();
