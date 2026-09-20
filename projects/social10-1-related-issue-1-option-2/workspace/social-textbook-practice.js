/* Social-only views over canonical textbook question and response owners. */
(()=>{
'use strict';
const root=document.getElementById('textbook-practice'),records=[...root.querySelectorAll('[data-book-record]')],tiles=[...root.querySelectorAll('[data-book-choose]')],filter=root.querySelector('[data-book-filter]'),status=root.querySelector('[data-book-status]');
let selected=records[0];
const answer=r=>r.querySelector('textarea'),saved=r=>r.querySelector('[data-book-saved]');
function state(r){const value=answer(r).value;return !value.trim()?'Not started':saved(r).value===value?'Saved':'Draft';}
function states(){for(const r of records){const text=state(r);r.querySelector('[data-book-question-state]').textContent=text;tiles.find(t=>t.dataset.bookChoose===r.dataset.bookRecord).querySelector('[data-book-tile-state]').textContent=text;}}
function visible(){return records.filter(r=>filter.value==='all'||r.dataset.bookTopicId===filter.value);}
function choose(record,focus=false){if(!record)return;selected=record;for(const r of records)r.hidden=r!==selected;for(const tile of tiles)tile.setAttribute('aria-pressed',String(tile.dataset.bookChoose===selected.dataset.bookRecord));const list=visible(),i=list.indexOf(selected);selected.querySelector('[data-book-prev]').disabled=i===0;selected.querySelector('[data-book-next]').disabled=i===list.length-1;states();if(focus)selected.querySelector('h3').focus();}
filter.addEventListener('change',()=>{root.querySelectorAll('[data-book-category]').forEach(c=>c.hidden=filter.value!=='all'&&c.dataset.bookCategory!==filter.value);choose(visible().includes(selected)?selected:visible()[0]);});
root.addEventListener('input',event=>{if(event.target.matches('textarea')){states();status.textContent='Draft saved automatically in this browser. Select Save question work when ready.';}});
root.addEventListener('click',event=>{
const tile=event.target.closest('[data-book-choose]');if(tile){choose(records.find(r=>r.dataset.bookRecord===tile.dataset.bookChoose),true);return;}
if(event.target.closest('[data-book-prev]'))choose(visible()[visible().indexOf(selected)-1],true);
if(event.target.closest('[data-book-next]'))choose(visible()[visible().indexOf(selected)+1],true);
if(event.target.closest('[data-book-collect]')){
 const writing=answer(selected).value.trim();if(!writing){status.textContent='Write a response before collecting evidence.';answer(selected).focus();return;}
 persistResponseField(answer(selected));
 const id='textbook-practice-'+selected.dataset.bookRecord,notes=readManualEvidenceNotes(),existing=notes.find(note=>note.id===id);
 const source=selected.querySelector('h3').textContent,topic=root.querySelector('[data-book-category="'+selected.dataset.bookTopicId+'"] h3').textContent;
 const entry={...(existing||{}),id,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),source,concept:'Textbook Practice · '+topic,detail:writing,connection:existing?.connection||'',counterpoint:existing?.counterpoint||'',origin:'textbook-practice',questionId:selected.dataset.bookRecord,responseId:answer(selected).dataset.responseId};
 writeManualEvidenceNotes([entry,...notes.filter(note=>note.id!==id)]);renderManualEvidenceBank();
 status.textContent=existing?'Updated this question’s collected evidence in Evidence Bank.':'Collected in Evidence Bank with its textbook page and question reference.';
}
if(event.target.closest('[data-book-save]')){persistResponseField(answer(selected));saved(selected).value=answer(selected).value;persistResponseField(saved(selected));states();status.textContent='Question work saved in this browser. Ungraded.';}
});
const dialog=document.querySelector('.social-book-enlarge-dialog');let trigger;
root.addEventListener('click',event=>{const button=event.target.closest('[data-book-enlarge]');if(!button)return;trigger=button;dialog.querySelector('img').src=button.dataset.bookEnlarge;dialog.showModal();dialog.querySelector('button').focus();});
dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
root.querySelector('[data-book-print]').onclick=()=>{for(const r of records){let copy=r.querySelector('.book-print-answer');if(!copy){copy=document.createElement('pre');copy.className='book-print-answer';r.append(copy);}copy.textContent=answer(r).value||'(No writing yet)';}document.body.classList.add('printing-textbook-work');window.print();};window.addEventListener('afterprint',()=>document.body.classList.remove('printing-textbook-work'));
choose(selected);
})();
