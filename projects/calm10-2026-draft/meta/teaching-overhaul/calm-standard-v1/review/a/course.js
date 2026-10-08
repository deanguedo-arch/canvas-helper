(() => {
  "use strict";
  const storageKey = "calm10-2026-draft:career-standard-v1:a:learning:v3";
  const legacyStorageKeys = ["calm10-2026-draft:career-standard-v1:a:portfolio:v2", "calm10-2026-draft:career-standard-v1:a:portfolio:v1"];
  const fields = [...document.querySelectorAll("[data-save-key]")];
  const responseFields = fields.filter(field => field.matches("[data-lesson-evidence]"));
  const fieldKeys = new Set(fields.map(field => field.dataset.saveKey));
  const versionedFields = fields.filter(field => field.dataset.taskVersion);
  const status = document.getElementById("save-status");
  const maxStoredCharacters = 2000000; // Browser-only envelope; SCORM capacity is a separate release check.
  const lessonCount = document.querySelectorAll("article[data-lesson-id]").length;
  const pages = [...document.querySelectorAll(".course-page")];
  const pageIds = new Set(pages.map(page => page.id));
  const menuButton = document.querySelector("[data-menu-button]");
  const menuScrim = document.querySelector("[data-menu-scrim]");
  const mobileNavigation = window.matchMedia("(max-width: 760px)");
  function updateMenuButton() {
    if (!menuButton) return;
    const open = mobileNavigation.matches
      ? document.body.classList.contains("nav-open")
      : !document.body.classList.contains("nav-collapsed");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", `${open ? "Collapse" : "Open"} course navigation`);
    menuButton.textContent = open ? (mobileNavigation.matches ? "×" : "←") : "☰";
  }
  function closeMenu() {
    document.body.classList.remove("nav-open");
    if (menuScrim) menuScrim.hidden = true;
    updateMenuButton();
  }
  function showPage() {
    const wanted = decodeURIComponent(location.hash.slice(1));
    const section = document.getElementById(wanted);
    const id = pageIds.has(wanted) ? wanted : section?.closest('.course-page')?.id || 'overview';
    pages.forEach(page => { page.hidden = page.id !== id; });
    document.querySelectorAll("[data-page-target]").forEach(link => {
      const active = link.dataset.pageTarget === id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      if (active) link.closest(".nav-group")?.setAttribute("open", "");
    });
    closeMenu();
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    setTimeout(() => { if (section && wanted !== id) section.scrollIntoView(); else window.scrollTo(0, 0); }, 80);
  }
  menuButton?.addEventListener("click", () => {
    if (mobileNavigation.matches) {
      const open = document.body.classList.toggle("nav-open");
      if (menuScrim) menuScrim.hidden = !open;
    } else {
      document.body.classList.toggle("nav-collapsed");
    }
    updateMenuButton();
  });
  menuScrim?.addEventListener("click", closeMenu);
  window.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  mobileNavigation.addEventListener("change", closeMenu);
  window.addEventListener("hashchange", showPage);
  showPage();
  const registryData = JSON.parse(document.getElementById('historical-task-registry')?.textContent || '{}');
  const registry = registryData.fields || registryData;
  const oldPrompt = key => registry[key]?.prompt || registryData.prompts?.[registry[key]?.lessonId];
  function historicalPrompt(key, version) {
    const record = registryData.versions?.[version]?.[key];
    return record?.prompt || registryData.versionPrompts?.[record?.promptId] ||
      (version === registry[key]?.version ? oldPrompt(key) : null);
  }
  function retainResponse(s, key, value, version) {
    s.responseHistory[key] ||= [];
    s.responseHistory[key].push({version, value, retainedAt:new Date().toISOString(),
      label:registryData.versions?.[version]?.[key]?.label || registry[key]?.label || key,
      prompt:historicalPrompt(key, version) || 'Exact task wording is unavailable for this saved version. The response is retained without assigning it the revised instructions.'});
  }
  const groups = new Map();
  fields.forEach(f => { const k=f.dataset.saveKey; if(!groups.has(k))groups.set(k,[]);groups.get(k).push(f); });
  let state={schemaVersion:3,extensionVersion:1,responses:{},taskVersions:{},responseHistory:{},completions:{}}, pendingSave, lastSaved='', conflicted=false, externalCopy=null;
  const lessons=[...document.querySelectorAll('article[data-lesson-id]')];
  const clone=x=>JSON.parse(JSON.stringify(x));
  function setStatus(t){if(status)status.textContent=t;}
  function read(list){const f=list[0];if(f.type==='checkbox')return f.checked;if(f.type==='radio')return list.find(x=>x.checked)?.value||'';return f.value;}
  function put(list,v){list.forEach(f=>{if(f.type==='checkbox')f.checked=v===true;else if(f.type==='radio')f.checked=f.value===v;else f.value=typeof v==='string'?v:'';});}
  function snapshot(){const s=clone(state);groups.forEach((list,k)=>{s.responses[k]=read(list);if(list[0].dataset.taskVersion)s.taskVersions[k]=list[0].dataset.taskVersion;});s.savedAt=new Date().toISOString();return s;}
  function validate(v){const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);if(v?.schemaVersion!==3||!obj(v.responses)||v.course&&v.course!=='calm10-2026-draft')throw Error('Not a CALM backup');const keyOK=k=>/^[a-z0-9][a-z0-9:_-]{0,119}$/i.test(k)&&!['__proto__','constructor','prototype'].includes(k);for(const [k,x]of Object.entries(v.responses))if(!keyOK(k)||!['string','boolean'].includes(typeof x))throw Error('Invalid response');for(const n of ['taskVersions','responseHistory','completions'])if(v[n]&&!obj(v[n]))throw Error('Invalid '+n);for(const[k,x]of Object.entries(v.taskVersions||{}))if(!keyOK(k)||typeof x!=='string')throw Error('Invalid version');for(const[k,entries]of Object.entries(v.responseHistory||{})){if(!keyOK(k)||!Array.isArray(entries)||entries.some(x=>!obj(x)||!['string','boolean'].includes(typeof x.value)))throw Error('Invalid history');}if(JSON.stringify(v).length>maxStoredCharacters)throw Error('Backup exceeds browser envelope');return v;}
  function stage(raw) {
    const s=clone(validate(raw));
    s.taskVersions||={};s.responseHistory||={};s.completions||={};s.extensionVersion=1;
    groups.forEach((list,k)=>{
      const version=list[0].dataset.taskVersion,old=s.responses[k];
      if(version&&s.taskVersions[k]!==version&&old!==undefined&&old!==''&&old!==false){
        retainResponse(s,k,old,s.taskVersions[k]||registry[k]?.version||'pre-repair');
        s.responses[k]=list[0].type==='checkbox'?false:'';
        delete s.completions[list[0].closest('[data-lesson-id]')?.id];
      }
      if(version)s.taskVersions[k]=version;
    });
    // Removed prompts remain readable in Earlier Work, without becoming answers to new tasks.
    for(const [k,record] of Object.entries(registryData.retiredFields||{})) {
      if(groups.has(k)||!Object.prototype.hasOwnProperty.call(s.responses,k))continue;
      const old=s.responses[k];
      if(old!==''&&old!==false)retainResponse(s,k,old,s.taskVersions[k]||record.version||'pre-repair');
      delete s.responses[k];delete s.taskVersions[k];
    }
    return s;
  }
  function apply(s){state=s;groups.forEach((list,k)=>put(list,s.responses[k]));renderHistory();render();document.dispatchEvent(new Event('calm:restore'));}
  function persist(s=snapshot()){if(conflicted){setStatus('Saving paused: choose between the two copies in My Work. Your entries remain here.');return false;}try{const raw=JSON.stringify(s);if(raw.length>maxStoredCharacters)throw Error('capacity');localStorage.setItem(storageKey,raw);lastSaved=raw;state=s;setStatus('Saved in this browser');return true;}catch{setStatus('Not saved in this browser. Keep this page open and download a backup from My Work.');return false;}}
  function save(){clearTimeout(pendingSave);pendingSave=null;const ok=persist();render();return ok;}
  function finals(l){return [...l.querySelectorAll('[data-final-field]')];}
  function signature(l){return JSON.stringify(finals(l).map(f=>[f.dataset.saveKey,read(groups.get(f.dataset.saveKey))]));}
  function validFinal(l){return finals(l).length>0&&finals(l).every(f=>{const v=read(groups.get(f.dataset.saveKey));return typeof v==='string'&&v.trim()!==''&&(f.type!=='number'||Number.isFinite(Number(v)))&&f.checkValidity();});}
  function reopen(l){delete state.completions[l.id];l.querySelectorAll('[data-signoff]').forEach(x=>x.checked=false);}
  function render(){let drafted=0,complete=0;for(const l of lessons){if(finals(l).some(f=>String(read(groups.get(f.dataset.saveKey))).trim()))drafted++;let c=state.completions[l.id];if(c&&(c.taskVersion!==l.dataset.taskVersion||c.responseRevision!==signature(l)||!validFinal(l)||![...l.querySelectorAll('[data-signoff]')].every(x=>x.checked)))delete state.completions[l.id];const done=!!state.completions[l.id];if(done)complete++;document.querySelectorAll(`.nav-link[data-page-target="${l.id}"]`).forEach(link=>{link.classList.toggle('lesson-complete',done);let mark=link.querySelector('.completion-mark');if(!mark){mark=document.createElement('span');mark.className='completion-mark';link.prepend(mark);}mark.textContent=done?'✓ ':'';mark.setAttribute('aria-label',done?'Complete: ':'');});l.querySelector('[data-complete-lesson]')?.toggleAttribute('hidden',done);l.querySelector('[data-reopen-lesson]')?.toggleAttribute('hidden',!done);const out=l.querySelector('[data-completion-status]');if(out&&done)out.textContent='Complete — your response and review are saved in this browser.';}
 const progress=document.getElementById('response-progress');if(progress)progress.textContent=`${complete} of ${lessons.length} complete · ${drafted} drafted`;const bar=document.getElementById('response-progress-fill');if(bar)bar.style.width=complete/lessons.length*100+'%';const work=document.querySelector('[data-work-list]');if(work){work.replaceChildren();lessons.forEach(l=>{let a=document.createElement('a');a.href='#'+l.id;a.textContent=(state.completions[l.id]?'✓ Complete — ':'')+l.querySelector('h1').textContent;work.append(a);});}}
  try{const raw=localStorage.getItem(storageKey);if(raw){const s=stage(JSON.parse(raw));if(JSON.stringify(s)!==raw){try{validate(s);localStorage.setItem(storageKey+':before-authoring-migration',raw);localStorage.setItem(storageKey,JSON.stringify(s));lastSaved=JSON.stringify(s);apply(s);setStatus('Earlier work retained with its task wording; current tasks are ready.');}catch{conflicted=true;apply(s);setStatus('Migration could not be saved. Original work is intact; download this copy before continuing.');}}else{lastSaved=raw;apply(s);setStatus('Restored from this browser');}}}catch{conflicted=true;setStatus('Saved data could not be read. It has not been replaced. Download the stored copy from My Work.');}
  fields.forEach(f=>{const edit=()=>{if(f.hasAttribute('data-final-field')){const l=f.closest('[data-lesson-id]');if(l){reopen(l);const out=l.querySelector('[data-completion-status]');if(out)out.textContent='Response changed. Review the four statements again when ready.';}}setStatus(conflicted?'Saving paused — download or choose a copy in My Work.':'Saving…');render();clearTimeout(pendingSave);pendingSave=setTimeout(save,350);};f.addEventListener('input',edit);f.addEventListener('change',()=>{if(f.type==='checkbox'||f.type==='radio'||f.tagName==='SELECT')edit();});f.addEventListener('blur',()=>{if(pendingSave)save();});});
  lessons.forEach(l=>{l.querySelector('[data-complete-lesson]')?.addEventListener('click',()=>{const out=l.querySelector('[data-completion-status]');if(!validFinal(l)||![...l.querySelectorAll('[data-signoff]')].every(x=>x.checked)){out.textContent='Fill every independent response field and check all four review statements first.';return;}state.completions[l.id]={taskVersion:l.dataset.taskVersion,completedAt:new Date().toISOString(),responseRevision:signature(l)};if(!save()){delete state.completions[l.id];out.textContent='Completion could not be saved. Download your work and resolve the saving message first.';render();}});l.querySelector('[data-reopen-lesson]')?.addEventListener('click',()=>{reopen(l);save();const out=l.querySelector('[data-completion-status]');out.textContent='Reopened. Your responses are still here.';});});
  function download(name,content,type='application/json'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  document.getElementById('download-backup')?.addEventListener('click',()=>download('CALM_10_Backup.json',JSON.stringify({...snapshot(),course:'calm10-2026-draft'},null,2)));
  document.getElementById('download-stored-copy')?.addEventListener('click',()=>download('CALM_10_Stored_Copy.json',externalCopy||localStorage.getItem(storageKey)||'{}'));
  document.getElementById('download-recovery-copies')?.addEventListener('click',()=>{const copies={};for(const suffix of ['before-authoring-migration','before-restore','before-conflict-choice','other-tab-copy']){const raw=localStorage.getItem(storageKey+':'+suffix);if(raw)copies[suffix]=raw;}download('CALM_10_Recovery_Copies.json',JSON.stringify(copies,null,2));});
  document.getElementById('restore-backup')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>maxStoredCharacters*4)throw Error('File too large');const incoming=stage(JSON.parse(await file.text()));const raw=JSON.stringify(incoming);validate(incoming);if(!confirm(`Restore ${Object.keys(incoming.responses).length} saved fields and ${Object.keys(incoming.completions).length} completion records? The current copy will be retained as a recovery backup. Cancel keeps everything unchanged.`))return;const current=JSON.stringify(snapshot());localStorage.setItem(storageKey+':before-restore',current);localStorage.setItem(storageKey,raw);conflicted=false;lastSaved=raw;apply(incoming);setStatus('Backup restored; the prior copy is retained.');}catch{setStatus('Backup was not restored. The current work is unchanged. Check the file format and available browser space.');}finally{e.target.value='';}});
  window.addEventListener('storage',e=>{if(e.key===storageKey&&e.newValue!==lastSaved){clearTimeout(pendingSave);conflicted=true;externalCopy=e.newValue;setStatus('Another tab saved a different copy. Saving paused; compare/download both in My Work.');document.querySelector('[data-conflict-panel]')?.removeAttribute('hidden');}});
  document.querySelector('[data-use-other-copy]')?.addEventListener('click',()=>{try{const incoming=stage(JSON.parse(externalCopy));if(!confirm('Use the other tab’s copy? Your current entries will be retained in a recovery backup.'))return;localStorage.setItem(storageKey+':before-conflict-choice',JSON.stringify(snapshot()));conflicted=false;apply(incoming);save();document.querySelector('[data-conflict-panel]').hidden=true;}catch{setStatus('Other copy could not be loaded; download both copies.');}});
  document.querySelector('[data-keep-this-copy]')?.addEventListener('click',()=>{if(!confirm('Keep this tab’s work? The other copy will be retained as a recovery backup.'))return;try{localStorage.setItem(storageKey+':other-tab-copy',externalCopy||'{}');conflicted=false;if(save())document.querySelector('[data-conflict-panel]').hidden=true;}catch{conflicted=true;setStatus('Could not preserve both copies. Download both before choosing.');}});
  function workText(){const s=snapshot();return ['CALM 10 — My work','Completion records self-review, not a writing grade.',...Object.entries(s.responses).filter(([k,v])=>v!==''&&v!==false).map(([k,v])=>`${groups.get(k)?.[0]?.closest('[data-lesson-id]')?.querySelector('h1')?.textContent||k}\n${document.querySelector(`label[for="${groups.get(k)?.[0]?.id}"]`)?.textContent||k}\n${v}`),'EARLIER WORK',JSON.stringify(s.responseHistory,null,2)].join('\n\n');}
  document.getElementById('download-work')?.addEventListener('click',()=>download('CALM_10_My_Work.txt',workText(),'text/plain'));
  document.getElementById('download-legacy-work')?.addEventListener('click',()=>download('CALM_10_Earlier_Drafts.json',JSON.stringify(legacyStorageKeys.map(key=>({key,saved:localStorage.getItem(key)})),null,2)));
  document.getElementById('print-work')?.addEventListener('click',()=>{document.getElementById('print-portfolio')?.remove();const p=document.createElement('pre');p.id='print-portfolio';p.textContent=workText();document.body.append(p);window.print();});
  window.addEventListener('afterprint',()=>document.getElementById('print-portfolio')?.remove());window.addEventListener('pagehide',()=>{if(pendingSave)save();});
  // History is learner data: render only with textContent.
  function renderHistory(){
  const historyRoot=document.querySelector('[data-all-history]');if(historyRoot){historyRoot.replaceChildren();for(const[k,entries]of Object.entries(state.responseHistory)){for(const entry of entries){const d=document.createElement('details'),summary=document.createElement('summary'),p=document.createElement('pre');summary.textContent=(entry.label||registry[k]?.label||k)+' — '+(entry.version||'earlier task');p.textContent=(entry.prompt||historicalPrompt(k,entry.version)||'Exact earlier task wording unavailable for this version.')+'\n\nYOUR EARLIER RESPONSE\n'+entry.value;d.append(summary,p);historyRoot.append(d);}}}
  }
  renderHistory();
  render();
})();
