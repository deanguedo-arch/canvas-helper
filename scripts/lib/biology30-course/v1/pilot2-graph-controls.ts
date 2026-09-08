import { emptyGraphDraft, decodeGraphDraft, encodeGraphDraft, compareGraphDraft, type GraphWork } from "./pilot2-graph-work.js";
import { renderBiology30GraphSvg } from "./pilot2-graph-svg.js";
import type { TopicState, TopicStateSchema } from "./pilot2-state.js";
import type { TopicControlSave } from "./pilot2-controls-runtime.js";
import { topicHtml as h, renderTopicDataset } from "./pilot2-render-common.js";

export function mountTopicGraphControls(root:HTMLElement,state:TopicState,schema:TopicStateSchema,works:GraphWork[],controls:{refresh():void;responseChanged(id:string):TopicControlSave}) {
  const dispose:(()=>void)[]=[];
  for(const work of works){
    const panel=Array.from(root.querySelectorAll<HTMLElement>('[data-pilot2-graph-work]')).find(node=>node.dataset.pilot2GraphWork===work.responseId);
    if(!panel)continue;
    const saved=state.responses[work.responseId],decoded=saved?decodeGraphDraft(work,saved):null;
    let draft=decoded?.kind==='graph'?decoded.draft:emptyGraphDraft(work),preserved=decoded?.kind==='preserved-writing'?decoded.original:null;
    const editor=panel.querySelector<HTMLElement>('[data-pilot2-graph-editor]')!,recovery=panel.querySelector<HTMLElement>('[data-pilot2-graph-recovery]')!,original=panel.querySelector<HTMLTextAreaElement>('[data-pilot2-graph-original]')!,confirm=panel.querySelector<HTMLInputElement>('[data-pilot2-graph-recovery-confirm]')!,start=panel.querySelector<HTMLButtonElement>('[data-pilot2-graph-start]')!,explanation=panel.querySelector<HTMLTextAreaElement>('[data-pilot2-graph-explanation]')!,status=panel.querySelector<HTMLElement>('[data-pilot2-graph-status]')!,comparison=panel.querySelector<HTMLElement>('[data-pilot2-graph-comparison]')!;
    if(preserved!==null){editor.hidden=true;recovery.hidden=false;original.value=preserved;}
    function drawings(){
      work.graphs.forEach((graph,index)=>{
        const result=renderBiology30GraphSvg(work,index,draft,`${work.responseId}-draft`),target=panel!.querySelector<HTMLElement>(`[data-pilot2-graph-drawing="${index}"]`)!;
        target.innerHTML=`<figure class="p2-figure"><div class="p2-graph-scroll" role="region" aria-label="Your graph; scroll horizontally on a narrow screen" tabindex="0">${result.svg}</div><figcaption>${h(graph.title)} — your entered values</figcaption><p>${h(result.interpretation)}</p><button type="button" data-pilot2-enlarge aria-haspopup="dialog">Enlarge graph</button></figure>${result.warnings.map(warning=>`<p>${h(warning)}</p>`).join('')}${renderTopicDataset({columns:['Series','Position','Entered value'],rows:result.values.map(value=>[value.series,value.x,value.value??'Not plotted'])},'Your plotted values')}`;
      });
    }
    function compare(force=false){
      comparison.hidden=(!force&&!state.flags.includes(`${work.responseId}-attempted`))||panel!.dataset.pilot2GraphInvalid==='true'||preserved!==null;
      if(comparison.hidden)return;
      const reports=compareGraphDraft(work,draft),findings=panel!.querySelector<HTMLElement>('[data-pilot2-graph-findings]')!;
      const names:Record<string,string>={'blank':'not entered','matches':'matches the supplied value or label','fits-source-values':'contains the supplied values; a larger scale gives less visual detail','scale-too-small':'too small for the supplied values','compare-axis-label':'compare this label with the measured quantity','compare-source-value':'compare this point with the supplied value'};
      findings.innerHTML=reports.map((report,index)=>`<section><h5>${h(work.graphs[index].title)}</h5><ul>${report.axes.map((value,axis)=>`<li>${['Horizontal label','Vertical label','Vertical maximum'][axis]}: ${h(names[value])}</li>`).join('')}${report.series.flatMap((series,s)=>series.points.map((value,p)=>`<li>${h(work.graphs[index].series[s].label)} at ${h(work.graphs[index].x[p])}: ${h(names[value])}</li>`)).join('')}</ul></section>`).join('');
      const model=emptyGraphDraft(work);
      model.g.forEach((plot,index)=>{plot.a=[...work.graphs[index].expectedAxes];plot.p=work.graphs[index].series.map(series=>[...series.expected]);});
      findings.innerHTML+=`<h4>Read-only comparison graphs</h4>${work.graphs.map((graph,index)=>{const answer=renderBiology30GraphSvg(work,index,model,`${work.responseId}-answer`);return `<figure class="p2-figure"><div class="p2-graph-scroll" role="region" aria-label="Comparison graph; scroll horizontally on a narrow screen" tabindex="0">${answer.svg}</div><figcaption>${h(graph.title)} — supplied values</figcaption><p>${h(answer.interpretation)}</p><button type="button" data-pilot2-enlarge aria-haspopup="dialog">Enlarge comparison graph</button></figure>`;}).join('')}<p>${h(work.modelExplanation)}</p>`;
    }
    function restore(){
      panel!.querySelectorAll<HTMLSelectElement>('[data-pilot2-graph-axis]').forEach(field=>{const [g,a]=field.dataset.pilot2GraphAxis!.split(':').map(Number);field.value=draft.g[g].a[a]===null?'':String(draft.g[g].a[a]);});
      panel!.querySelectorAll<HTMLInputElement>('[data-pilot2-graph-point]').forEach(field=>{const [g,s,p]=field.dataset.pilot2GraphPoint!.split(':').map(Number);field.value=draft.g[g].p[s][p]===null?'':String(draft.g[g].p[s][p]);});explanation.value=draft.e;drawings();compare();
    }
    function update(){
      if(preserved!==null)return;
      try{
        panel!.querySelectorAll<HTMLInputElement>('[data-pilot2-graph-point]').forEach(field=>{if(field.validity.badInput)throw new Error('Finish the number before saving this construction.');const [g,s,p]=field.dataset.pilot2GraphPoint!.split(':').map(Number);draft.g[g].p[s][p]=field.value.trim()===''?null:Number(field.value);});
        panel!.querySelectorAll<HTMLSelectElement>('[data-pilot2-graph-axis]').forEach(field=>{const [g,a]=field.dataset.pilot2GraphAxis!.split(':').map(Number);draft.g[g].a[a]=field.value.trim()===''?null:Number(field.value);});
        draft.e=explanation.value;const serialized=encodeGraphDraft(work,draft,schema.responses[work.responseId].limit);
        panel!.dataset.pilot2GraphInvalid='false';state.responses[work.responseId]=serialized;
        const result=controls.responseChanged(work.responseId);status.textContent=result.saved?result.message:'Construction remains visible; saving was not confirmed.';drawings();compare();
      }catch{panel!.dataset.pilot2GraphInvalid='true';status.textContent=`Construction not saved. Use numbers from 0 to 9999.99 with at most two decimal places and an explanation up to ${work.explanationLimit} characters. Current entries remain visible; the previous valid response is retained.`;comparison.hidden=true;controls.refresh();root.dispatchEvent(new Event('pilot2-draft-change'));}
    }
    const input=(event:Event)=>{if(event.target===explanation||event.target instanceof HTMLInputElement&&event.target.dataset.pilot2GraphPoint)update();};
    const change=(event:Event)=>{if(event.target===confirm)start.disabled=!confirm.checked;else if(event.target instanceof HTMLSelectElement&&event.target.dataset.pilot2GraphAxis)update();};
    const startNew=()=>{if(!confirm.checked||preserved===null)return;state.legacy.push({source:`Earlier response: ${work.responseId}`,original:preserved});preserved=null;editor.hidden=false;start.disabled=true;confirm.disabled=true;draft=emptyGraphDraft(work);restore();update();};
    const check=(event:Event)=>{const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('[data-pilot2-check],[data-pilot2-compare]'):null;if(button&&!button.disabled&&(button.dataset.pilot2Check===work.responseId||button.dataset.pilot2Compare===work.responseId))compare(Boolean(button.dataset.pilot2Compare));};
    panel.addEventListener('input',input);panel.addEventListener('change',change);start.addEventListener('click',startNew);root.addEventListener('click',check);restore();
    dispose.push(()=>{panel.removeEventListener('input',input);panel.removeEventListener('change',change);start.removeEventListener('click',startNew);root.removeEventListener('click',check);});
  }
  controls.refresh();return {dispose(){dispose.forEach(cleanup=>cleanup());}};
}

/** Read invalid live entries as text so Copy all never loses a value that the
 * numeric/save guard cannot accept. The last valid graph remains separately saved. */
export function currentUnsavedGraphWork(root:HTMLElement,works:GraphWork[],index:import('./pilot2-activity-index.js').ActivityEntry[]=[]):import('./pilot2-activity-index.js').WorkEntry[] {
 return works.flatMap(work=>{const panel=Array.from(root.querySelectorAll<HTMLElement>('[data-pilot2-graph-work]')).find(panel=>panel.dataset.pilot2GraphWork===work.responseId);if(panel?.dataset.pilot2GraphInvalid!=='true')return[];
 const fields:{label:string;text:string}[]=[];
 panel.querySelectorAll<HTMLSelectElement>('[data-pilot2-graph-axis]').forEach(field=>{const[g,a]=field.dataset.pilot2GraphAxis!.split(':').map(Number);fields.push({label:`${work.graphs[g].title}: ${['horizontal axis','vertical axis','vertical maximum'][a]}`,text:field.selectedOptions[0]?.text??'Not selected'});});
 panel.querySelectorAll<HTMLInputElement>('[data-pilot2-graph-point]').forEach(field=>{const[g,s,p]=field.dataset.pilot2GraphPoint!.split(':').map(Number);fields.push({label:`${work.graphs[g].title}: ${work.graphs[g].series[s].label} at ${work.graphs[g].x[p]}`,text:field.value||'Not plotted'});});
 fields.push({label:'Explanation',text:panel.querySelector<HTMLTextAreaElement>('[data-pilot2-graph-explanation]')!.value});
 return[{id:`${work.responseId}-unsaved-draft`,title:'Unsaved graph draft',category:'Unsaved draft',routeId:index.find(entry=>entry.id===work.responseId)?.routeId??null,focusId:work.responseId,fields}];});
}
