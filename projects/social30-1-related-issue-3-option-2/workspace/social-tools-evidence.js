/* Explicit evidence snapshots over real Student Tool response fields. */
(()=>{
'use strict';
document.addEventListener('click',event=>{
const button=event.target.closest('[data-tool-collect]');if(!button)return;
const key=button.dataset.toolCollect;
let scope,title,source;
if(key.startsWith('vocabulary:')){scope=button.closest('[data-frayer-owner]');const record=document.querySelector('[data-vocabulary-record="'+scope.dataset.frayerOwner+'"]');title='Core Vocabulary · '+record.querySelector('h3').textContent;source=title;}
else if(key.startsWith('film:')){scope=button.closest('[data-film-panel]');title='Film Room · '+scope.querySelector('h3').textContent;const link=scope.querySelector('a[href]');source=title+(link?' — '+link.href:'');}
else{scope=document.getElementById(key);title=scope.querySelector('h2').textContent;source=title+' · To what extent are the principles of liberalism viable?';if(key==='source-analysis'){const selected=scope.querySelector('[data-practice-source-select]');if(selected)source+=' — '+(selected.selectedOptions[0]?.textContent||'No practice source selected');}}
const status=button.closest('.social-tool-collect')?.querySelector('[data-tool-collect-status]')||scope.querySelector('[data-tool-collect-status]');
const fields=[...scope.querySelectorAll('textarea[data-response-id],input[data-response-id]:not([type="hidden"])')].filter(f=>f.type!=='radio'&&f.type!=='checkbox');
const filled=fields.filter(f=>f.value.trim());if(!filled.length){status.textContent='Add your writing before saving to Evidence Bank.';fields[0]?.focus();return;}
const parts=filled.map(field=>{persistResponseField(field);const label=field.closest('label')?.cloneNode(true);label?.querySelectorAll('textarea,input,select,button').forEach(n=>n.remove());const previous=field.previousElementSibling;const name=label?.textContent.trim()||(previous?.tagName==='LABEL'?previous.textContent.trim():null)||field.getAttribute('aria-label')||field.placeholder||field.dataset.responseId.split(':').at(-1);return name+'\n'+field.value.trim();});
const id='student-tool-'+key,notes=readManualEvidenceNotes(),old=notes.find(note=>note.id===id);
const entry={...(old||{}),id,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),source,concept:title,detail:parts.join('\n\n'),connection:old?.connection||'',counterpoint:old?.counterpoint||'',origin:'student-tool',toolKey:key,responseIds:filled.map(f=>f.dataset.responseId)};
writeManualEvidenceNotes([entry,...notes.filter(note=>note.id!==id)]);renderManualEvidenceBank();status.textContent=old?'Updated this tool’s evidence entry. Your answers remain unchanged.':'Saved to Evidence Bank. Your answers remain unchanged.';
});
})();
