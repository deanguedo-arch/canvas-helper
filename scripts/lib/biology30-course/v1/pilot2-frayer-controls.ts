import { clearFrayer, replaceFrayerChoice, type TopicState, type TopicStateSchema } from "./pilot2-state.js";
import type { TopicControlSave } from "./pilot2-controls-runtime.js";
export function mountTopicFrayerControls(root:HTMLElement,state:TopicState,schema:TopicStateSchema,controls:{refresh():void;saveDraft():TopicControlSave}) {
  const choices=Array.from(root.querySelectorAll<HTMLSelectElement>('[data-pilot2-frayer-choice]')),status=root.querySelector<HTMLElement>('[data-pilot2-frayer-status]');
  const writing=Array.from(root.querySelectorAll<HTMLElement>('[data-pilot2-frayer-writing]'));
  const active=(id:string)=>schema.families.fixed.includes(id)||state.frayerChoices.includes(id);
  const ready=(id:string)=>(schema.families.responseIds[id]??[]).length===4&&schema.families.responseIds[id].every(field=>Boolean(state.responses[field]?.trim())&&state.responses[field].length<=schema.responses[field].limit);
  function refresh(){
    root.querySelectorAll<HTMLButtonElement>('[data-p2-choose-family]').forEach(button=>{const selected=active(button.dataset.p2ChooseFamily!);button.disabled=selected;button.textContent=selected?'Selected for Frayer':'Choose this concept';});
    choices.forEach((choice,index)=>{choice.value=state.frayerChoices[index]??'';choice.disabled=index===1&&!state.frayerChoices.length;choice.querySelectorAll('option').forEach(option=>{option.disabled=Boolean(option.value&&state.frayerChoices.some((id,slot)=>slot!==index&&id===option.value));});});
    writing.forEach(panel=>{const id=panel.dataset.pilot2FrayerWriting!,collected=state.flags.includes(id+'-collected');panel.hidden=!active(id);const button=panel.querySelector<HTMLButtonElement>('[data-pilot2-collect-toggle]');if(button)button.textContent=collected?'Remove from Process Collection':'Add to Process Collection';const status=panel.querySelector<HTMLElement>('[data-pilot2-collection-status]');if(status)status.textContent=ready(id)?collected?'Collected':'Ready to collect':'Complete all four fields first.';});
    root.querySelectorAll<HTMLButtonElement>('[data-pilot2-frayer-compare]').forEach(button=>{button.disabled=!active(button.dataset.pilot2FrayerCompare!)||!ready(button.dataset.pilot2FrayerCompare!);if(button.disabled){button.setAttribute('aria-expanded','false');button.textContent='Compare with course model';const guide=root.querySelector<HTMLElement>(`#${CSS.escape(button.dataset.pilot2FrayerCompare!+'-guide')}`);if(guide)guide.hidden=true;}});controls.refresh();
  }
  const change=(event:Event)=>{
    const field=event.target;
    if(field instanceof HTMLSelectElement&&field.dataset.pilot2FrayerChoice!==undefined){
      const index=Number(field.dataset.pilot2FrayerChoice),old=state.frayerChoices[index]??null,next=field.value;
      try{
        if(!next){if(old&&schema.families.responseIds[old].some(id=>state.responses[id]?.length))throw new Error('Copy and explicitly clear this family’s writing before removing it.');state.frayerChoices=state.frayerChoices.filter(id=>id!==old);}
        else {const previous=[...state.frayerChoices],replaced=replaceFrayerChoice(state,schema,old,next);if(old)replaced.frayerChoices=previous.map(id=>id===old?next:id);Object.assign(state,replaced);}
        const result=controls.saveDraft();if(status)status.textContent=result.saved?'Family selection saved.':result.message;
      }catch(error){if(status)status.textContent=String(error).replace(/^Error: /,'');}
      refresh();
    }else if(field instanceof HTMLInputElement&&field.dataset.pilot2FrayerClearConfirm){
      const id=field.dataset.pilot2FrayerClearConfirm;const button=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-pilot2-frayer-clear]')).find(button=>button.dataset.pilot2FrayerClear===id);if(button)button.disabled=!field.checked;
    }
  };
  const input=(event:Event)=>{
    const field=event.target;if(!(field instanceof HTMLTextAreaElement)||!field.dataset.pilot2Response)return;
    const family=Object.entries(schema.families.responseIds).find(([,ids])=>ids.includes(field.dataset.pilot2Response!))?.[0];if(!family)return;
    const panel=root.querySelector<HTMLElement>(`#${CSS.escape(family+'-guide')}`);if(panel)panel.hidden=true;
    const button=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-pilot2-frayer-compare]')).find(button=>button.dataset.pilot2FrayerCompare===family);if(button){button.setAttribute('aria-expanded','false');button.textContent='Compare with course model';}refresh();
  };
  const click=(event:Event)=>{
    const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('button'):null;if(!button||button.disabled)return;
    if(button.hasAttribute('data-pilot2-collect-toggle')){refresh();return;}
    const id=button.dataset.pilot2FrayerClear,compare=button.dataset.pilot2FrayerCompare;
    if(id){const confirm=Array.from(root.querySelectorAll<HTMLInputElement>('[data-pilot2-frayer-clear-confirm]')).find(field=>field.dataset.pilot2FrayerClearConfirm===id);if(!confirm?.checked)return;
      try{Object.assign(state,clearFrayer(state,schema,id,true));}catch{if(status)status.textContent='Another current response cannot be saved. Keep a copy or revise it before clearing this family.';return;}
      root.querySelectorAll<HTMLTextAreaElement>('[data-pilot2-response]').forEach(field=>{if(schema.families.responseIds[id].includes(field.dataset.pilot2Response!))field.value='';});confirm.checked=false;button.disabled=true;
      const guide=root.querySelector<HTMLElement>(`#${CSS.escape(id+'-guide')}`);if(guide)guide.hidden=true;
      const result=controls.saveDraft();if(status)status.textContent=result.saved?'This family’s writing was cleared. Other work is unchanged.':'Clear was not saved. Earlier saved writing remains available after reload.';refresh();
    }else if(compare&&active(compare)&&ready(compare)){const guide=root.querySelector<HTMLElement>(`#${CSS.escape(compare+'-guide')}`);if(guide){guide.hidden=!guide.hidden;button.setAttribute('aria-expanded',String(!guide.hidden));button.textContent=guide.hidden?'Compare with course model':'Hide course model';}}
  };
  root.addEventListener('change',change);root.addEventListener('input',input);root.addEventListener('click',click);root.addEventListener('pilot2-state-change',refresh);refresh();
  return {refresh,dispose(){root.removeEventListener('change',change);root.removeEventListener('input',input);root.removeEventListener('click',click);root.removeEventListener('pilot2-state-change',refresh);}};
}
