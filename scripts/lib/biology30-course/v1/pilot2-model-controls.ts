import { runBiology30TopicModel } from "./pilot2-models.js";
import { renderTopicModelOutput } from "./pilot2-render-model-output.js";
import type { RenderTopicModel } from "./pilot2-render-model.js";
import type { TopicState, TopicStateSchema } from "./pilot2-state.js";
import type { TopicControlSave } from "./pilot2-controls-runtime.js";
export function mountTopicModelControls(root:HTMLElement,state:TopicState,schema:TopicStateSchema,models:RenderTopicModel[],controls:{refresh():void;saveDraft():TopicControlSave}) {
  const elements=models.map(model=>{
    const panel=Array.from(root.querySelectorAll<HTMLElement>('[data-pilot2-model]')).find(panel=>panel.dataset.pilot2Model===model.id);
    if(!panel)return null;
    return {model,panel,choice:panel.querySelector<HTMLSelectElement>('[data-pilot2-model-choice]')!,button:panel.querySelector<HTMLButtonElement>('[data-pilot2-model-test]')!,result:panel.querySelector<HTMLElement>('[data-pilot2-model-result]')!,status:panel.querySelector<HTMLElement>('[data-pilot2-model-status]')!};
  }).filter(item=>item!==null);
  const clear=(ids:string[])=>{if(ids.some(id=>!schema.flags[id]))throw new Error('Unknown model flag');state.flags=state.flags.filter(id=>!ids.includes(id));};
  function refresh(){
    for(const item of elements){const {model,choice,button,result}=item;choice.value=state.choices[model.id]??'';
      const prediction=state.responses[model.predictionId]??'',ready=Boolean(prediction.trim())&&prediction.length<=schema.responses[model.predictionId].limit&&model.options.includes(choice.value);
      button.disabled=!ready;const show=ready&&state.flags.includes(model.testFlag);result.hidden=!show;item.panel.querySelectorAll<HTMLButtonElement>('[data-pilot2-model-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pilot2ModelCaseValue===choice.value)));const empty=item.panel.querySelector<HTMLElement>('[data-pilot2-model-empty]');if(empty)empty.hidden=show;const predictionField=item.panel.querySelector<HTMLTextAreaElement>(`[data-pilot2-response="${model.predictionId}"]`),explanationField=item.panel.querySelector<HTMLTextAreaElement>(`[data-pilot2-response="${model.explanationId}"]`);if(predictionField)predictionField.disabled=!choice.value;if(explanationField)explanationField.disabled=!show;
      if(show&&result.dataset.resultChoice!==choice.value){result.innerHTML=renderTopicModelOutput(runBiology30TopicModel(model,choice.value));result.dataset.resultChoice=choice.value;}
    }
    controls.refresh();
  }
  const input=(event:Event)=>{const field=event.target;if(field instanceof HTMLTextAreaElement&&models.some(model=>[model.predictionId,model.explanationId].includes(field.dataset.pilot2Response??'')))refresh();};
  const change=(event:Event)=>{
    if(!(event.target instanceof HTMLSelectElement)||!event.target.dataset.pilot2ModelChoice)return;
    const field=event.target,item=elements.find(item=>item.model.id===field.dataset.pilot2ModelChoice);if(!item)return;
    const value=field.value;if(value&&!item.model.options.includes(value))throw new Error('Unknown model scenario');
    if(value)state.choices[item.model.id]=value;else delete state.choices[item.model.id];clear([item.model.testFlag,item.model.collectionFlag]);
    controls.saveDraft();item.status.textContent='Scenario changed. Test it before saving this explanation to the collection.';refresh();
  };
  const click=(event:Event)=>{
    const target=event.target instanceof Element?event.target.closest<HTMLButtonElement>('button'):null;if(!target||target.disabled)return;const caseId=target.dataset.pilot2ModelCase;if(caseId){const item=elements.find(i=>i.model.id===caseId)!;item.choice.value=target.dataset.pilot2ModelCaseValue!;item.choice.dispatchEvent(new Event('change',{bubbles:true}));return;}const button=target.matches('[data-pilot2-model-test]')?target:null;if(!button)return;
    const item=elements.find(item=>item.model.id===button.dataset.pilot2ModelTest);if(!item)return;
    runBiology30TopicModel(item.model,item.choice.value);clear([item.model.testFlag,item.model.collectionFlag]);state.flags.push(item.model.testFlag);
    const saved=controls.saveDraft();item.status.textContent=saved.saved?'Scenario tested and saved. Explain the result.':'Result is available. Saving was not confirmed.';refresh();
  };
  root.addEventListener('input',input);root.addEventListener('change',change);root.addEventListener('click',click);refresh();
  return {refresh,dispose(){root.removeEventListener('input',input);root.removeEventListener('change',change);root.removeEventListener('click',click);}};
}
