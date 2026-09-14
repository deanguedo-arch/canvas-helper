import {chooseWord,removeWordFrayer,type WordFrayerSchema,type WordFrayerState} from './word-frayer-state.js';
import {mountBiologyWordReader} from './word-reader.js';
import type {BiologyWordPageData} from './word-page.js';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const labels=['My definition in context','Essential characteristics or mechanism','Example or evidence','Non-example or common confusion'];
export function mountWordFrayerControls(root:HTMLElement,data:BiologyWordPageData,schema:WordFrayerSchema,owner:{get():WordFrayerState;set(slots:WordFrayerState):void;save():{saved:boolean;message:string}}){
 const reader=root.querySelector<HTMLElement>('[data-biology-word-reader]')!,controller=mountBiologyWordReader(reader);
 // Opt-in authored empty states remain canonical; existing course adapters are unchanged.
 const authoredEmpty=new Map([...root.querySelectorAll<HTMLElement>('[data-word-frayer][data-word-empty-canonical]')].map(node=>[node.dataset.wordFrayer!,node.innerHTML]));
 const legacy=root.ownerDocument.createElement('section');legacy.className='collection-section';legacy.dataset.wordLegacy='';reader.after(legacy);
 const status=(message:string)=>{root.querySelectorAll<HTMLElement>('[data-word-save-status]').forEach(n=>n.textContent=message);};
 const summary=()=>{const slots=owner.get();const progress=root.querySelector<HTMLElement>('[data-p2-vocabulary-progress]');if(progress)progress.textContent=`${slots.filter(s=>s.collected).length} of 8`;};
 function render(){
  for(const word of data.words){
   let node=root.querySelector<HTMLElement>(`[data-word-frayer="${CSS.escape(word.id)}"]`);
   if(!node){const view=reader.querySelector<HTMLElement>(`[data-biology-word-view="${CSS.escape(word.id)}"]`)!;view.querySelector('[data-biology-word-frayer]')?.remove();node=root.ownerDocument.createElement('section');node.className='frayer';node.dataset.wordFrayer=word.id;node.id='word-frayer-'+word.id;view.append(node);}
   const slot=owner.get().find(s=>s.kind==='word'&&s.id===word.id);
   if(!slot&&authoredEmpty.has(word.id)){
    if(node.querySelector('[data-word-answer]'))node.innerHTML=authoredEmpty.get(word.id)!;
    continue;
   }
   node.innerHTML=`<div class="frayer-heading"><div><p class="section-label">Frayer model</p><h3>${esc(word.term)}</h3></div></div>`+(slot?`<div class="frayer-grid">${labels.map((label,i)=>`<label>${label}<textarea rows="3" data-word-answer="${i}" aria-label="${esc(word.term+': '+label)}">${esc(slot.answers[i])}</textarea><small>Up to ${schema.limit} characters. Longer drafts stay visible but are not saved.</small></label>`).join('')}</div><div class="save-row"><button type="button" data-word-collect>${slot.collected?'Remove from Process Collection':'Add to Process Collection'}</button><button type="button" class="text-link" data-word-copy>Copy my Frayer</button></div><details><summary>Remove this word and free a slot</summary><p>This removes only this word’s four answers and collection status. Copy your writing first.</p><label><input type="checkbox" data-word-remove-confirm> I want to remove this word and its writing.</label><button type="button" data-word-remove>Remove this word</button></details>`:`<p>Choose any eight words. Choosing opens an empty Frayer; it does not fill in your answers.</p><button type="button" data-word-choose>Choose this word</button>`)+`<p data-word-save-status role="status" aria-live="polite"></p>`;
   if(slot&&word.modelFrayer){
    const button=root.ownerDocument.createElement('button');button.type='button';button.dataset.wordCompare='';button.textContent='Compare with course model';button.disabled=slot.answers.some(a=>!a.trim()||a.length>schema.limit);
    const guide=root.ownerDocument.createElement('div');guide.className='course-model';guide.dataset.wordModel='';guide.hidden=true;
    guide.innerHTML='<h4>Course model for '+esc(word.term)+'</h4><dl>'+word.modelFrayer.map((a,i)=>'<div><dt>'+labels[i]+'</dt><dd>'+esc(a)+'</dd></div>').join('')+'</dl>';
    node.append(button,guide);
   }
  }
  const old=owner.get().filter(s=>s.kind==='legacy');legacy.hidden=!old.length;
  legacy.innerHTML='<h2>Preserved earlier Frayers</h2><p>These retain their original category labels and writing. Each occupies one of the eight slots until you explicitly remove it. No writing has been assigned to a different word.</p>'+old.map(s=>`<article data-word-legacy-record="${esc(s.id)}"><h3>${esc(data.categories.find(c=>c.id===s.id)?.label??s.id)}</h3><dl>${s.answers.map((a,i)=>`<div><dt>${labels[i]}</dt><dd>${esc(a)}</dd></div>`).join('')}</dl><button type="button" class="text-link" data-word-copy>Copy earlier Frayer</button><label><input type="checkbox" data-word-remove-confirm> I have kept a copy and want to remove this earlier Frayer.</label><button type="button" data-word-remove>Remove earlier Frayer and free a slot</button><p data-word-save-status role="status"></p></article>`).join('');summary();
 }
 const transact=(next:WordFrayerState)=>{const before=owner.get();owner.set(next);const result=owner.save();if(!result.saved){owner.set(before);status(result.message);return false;}render();status(result.message);return true;};
 const input=(event:Event)=>{const field=event.target as HTMLTextAreaElement;if(!field.matches('textarea[data-word-answer]'))return;const id=field.closest<HTMLElement>('[data-word-frayer]')!.dataset.wordFrayer!,slot=owner.get().find(s=>s.kind==='word'&&s.id===id)!;slot.answers[Number(field.dataset.wordAnswer)]=field.value;slot.collected=false;const result=owner.save();status(result.message);summary();const collect=field.closest<HTMLElement>('[data-word-frayer]')!.querySelector<HTMLButtonElement>('[data-word-collect]')!;collect.textContent='Add to Process Collection';const compare=field.closest<HTMLElement>('[data-word-frayer]')!.querySelector<HTMLButtonElement>('[data-word-compare]');if(compare){compare.disabled=slot.answers.some(a=>!a.trim()||a.length>schema.limit);if(compare.disabled)field.closest<HTMLElement>('[data-word-frayer]')!.querySelector<HTMLElement>('[data-word-model]')!.hidden=true;}};
 const click=async(event:Event)=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('button');if(!button)return;
  const node=button.closest<HTMLElement>('[data-word-frayer],[data-word-legacy-record]');if(!node)return;
  const kind=node.hasAttribute('data-word-frayer')?'word':'legacy',id=node.dataset.wordFrayer??node.dataset.wordLegacyRecord!;
  try{
   if(button.hasAttribute('data-word-compare')){const slot=owner.get().find(s=>s.kind===kind&&s.id===id);if(slot?.answers.every(a=>a.trim()&&a.length<=schema.limit)){const guide=node.querySelector<HTMLElement>('[data-word-model]');if(guide)guide.hidden=!guide.hidden;}}
   if(button.hasAttribute('data-word-choose'))transact(chooseWord(owner.get(),schema,id));
   if(button.hasAttribute('data-word-remove'))transact(removeWordFrayer(owner.get(),schema,kind,id,Boolean(node.querySelector<HTMLInputElement>('[data-word-remove-confirm]')?.checked)));
   const slot=owner.get().find(s=>s.kind===kind&&s.id===id);
   if(button.hasAttribute('data-word-collect')&&slot){const next=structuredClone(owner.get()),target=next.find(s=>s.kind===kind&&s.id===id)!;if(!target.collected&&target.answers.some(a=>!a.trim()||a.length>schema.limit))throw Error('Complete all four fields within their limits before collecting.');target.collected=!target.collected;transact(next);}
   if(button.hasAttribute('data-word-copy')&&slot){const text=[node.querySelector('h3')!.textContent,...slot.answers.map((a,i)=>labels[i]+': '+a)].join('\n\n');try{await navigator.clipboard.writeText(text);status('Frayer copied.');}catch{let copy=node.querySelector<HTMLTextAreaElement>('[data-word-copy-fallback]');if(!copy){copy=root.ownerDocument.createElement('textarea');copy.dataset.wordCopyFallback='';copy.readOnly=true;copy.setAttribute('aria-label','Copy of this Frayer');node.append(copy);}copy.value=text;copy.focus();copy.select();status('Clipboard unavailable. Copy the selected text manually before removing.');}}
  }catch(error){status(String(error).replace(/^Error: /,''));}
 };
 const reveal=(event:Event)=>{const target=(event as CustomEvent<HTMLElement>).detail;const id=target?.closest<HTMLElement>('[data-word-frayer]')?.dataset.wordFrayer;if(id)controller.selectWord(id);};
 root.addEventListener('input',input);root.addEventListener('click',click);root.addEventListener('pilot2-state-change',summary);root.addEventListener('pilot2-reveal-target',reveal);render();
 return{dispose(){controller.dispose();root.removeEventListener('input',input);root.removeEventListener('click',click);root.removeEventListener('pilot2-state-change',summary);root.removeEventListener('pilot2-reveal-target',reveal);legacy.remove();}};
}
