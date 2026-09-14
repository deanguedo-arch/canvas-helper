import {mountVocabularyPanel,type VocabularyFamily} from '../../biology30-vocabulary/panel.js';
import type {ActivityInputs} from './pilot2-activity-index.js';
import type {TopicState} from './pilot2-state.js';
import type {TopicControlSave} from './pilot2-controls-runtime.js';
import type {RenderTopicVocabulary} from './pilot2-render-vocabulary.js';
import {mountTopicWordPage} from '../../biology30-vocabulary/word-page-runtime.js';
import type {BiologyWordPageData} from '../../biology30-vocabulary/word-page.js';
import {mountWordFrayerControls} from '../../biology30-vocabulary/word-frayer-runtime.js';

export function mountTopicVocabularyPanel(root:HTMLElement,input:ActivityInputs,state:TopicState,controls:{refresh():void;saveDraft():TopicControlSave}){
  const source=input.vocabulary as RenderTopicVocabulary;
  const families:VocabularyFamily[]=source.conceptFamilies.map(f=>({id:f.id,label:f.label,meaning:f.meaning,wordAnalysis:[f.wordAnalysis.treatment,f.wordAnalysis.caution],routes:input.contract.topics.filter(t=>t.parts.some(p=>f.teachingPartIds.includes(p.id))).map(t=>t.id)}));
  let lastMessage='Writing saves as you type. Each field allows 240 characters.';
  const observe=(event:Event)=>{const detail=(event as CustomEvent).detail;if(detail?.message)lastMessage=detail.message;};
  root.addEventListener('pilot2-state-change',observe);
  const dataElement=root.querySelector('#biology-word-data');
  const wordData:BiologyWordPageData|undefined=dataElement?JSON.parse(dataElement.textContent!):undefined;
  const unlocked=(id:string)=>{const route=root.querySelector<HTMLElement>(`[data-p2-family-panel="${CSS.escape(id)}"]`)?.dataset.p2UnlockRoute;return Boolean(route&&state.visited.includes(route));};
  const freelyChosen=Boolean(input.state.wordFrayers&&wordData);
  const wordPage=wordData?(freelyChosen?mountWordFrayerControls(root,wordData,input.state.wordFrayers!,{get:()=>state.wordFrayers!,set:slots=>{state.wordFrayers=slots;},save:()=>controls.saveDraft()}):mountTopicWordPage(root,wordData,unlocked,()=>controls.refresh(),route=>state.visited.includes(route))):undefined;
  const wordFamilies:VocabularyFamily[]=wordData?wordData.categories.map(c=>({id:c.id,label:c.label,meaning:'',wordAnalysis:[],routes:[...new Set(c.wordIds.map(id=>wordData.wordRoutes?.[id]).filter((r):r is string=>Boolean(r)))]})):families;
  const panel=mountVocabularyPanel({root,families:wordFamilies,
    words:wordData?.words,wordFrayers:freelyChosen?Object.fromEntries(wordData!.words.map(w=>[w.id,w.id])):wordData?.wordFrayers,
    terms:wordData?wordData.words.map(w=>({term:w.term,definition:w.definition,familyIds:w.categoryIds})):source.introducedTerms.filter(t=>source.conceptFamilies.some(f=>f.termIds.includes(t.id))).map(t=>({term:t.term,definition:t.definition,familyIds:source.conceptFamilies.filter(f=>f.termIds.includes(t.id)).map(f=>f.id)})),
    sections:()=>Array.from(root.querySelectorAll('.p2-part > .lesson-block,.p2-part > .worked-example,.p2-part > .p2-advanced,.p2-walkthrough-frame')),
    route:section=>section.closest<HTMLElement>('[data-pilot2-topic]')!.dataset.pilot2Topic!,
    unlocked:freelyChosen?()=>true:unlocked,
    frayer:id=>freelyChosen?root.querySelector<HTMLElement>(`[data-word-frayer="${CSS.escape(id)}"]`):wordData?root.querySelector<HTMLElement>(`[data-biology-frayer-record="${CSS.escape(id)}"]`):root.querySelector<HTMLElement>(`[data-p2-family-panel="${CSS.escape(id)}"] .frayer`),
    choices:()=>freelyChosen?null:root.querySelector<HTMLElement>('.p2-family-choices'),refresh:()=>controls.refresh(),status:()=>lastMessage,
    selectedFamilies:()=>state.frayerChoices,
  });
  const choose=(event:Event)=>{const button=event.target instanceof Element?event.target.closest<HTMLElement>('dialog.bio-vocabulary [data-p2-choose-family]'):null;
    if(button&&state.frayerChoices.length===2&&!state.frayerChoices.includes(button.dataset.p2ChooseFamily!)){
      event.stopPropagation();const manager=root.querySelector<HTMLDetailsElement>('.p2-family-choices');if(manager)manager.open=true;
      const status=root.querySelector<HTMLElement>('[data-pilot2-frayer-status]');if(status)status.textContent='Both choices are occupied. Use the concept-family selector above to open a chosen Frayer. Keep a copy and explicitly clear its writing before replacing that choice.';
    }
  };
  root.addEventListener('click',choose,true);
  return {dispose(){panel.dispose();wordPage?.dispose();root.removeEventListener('click',choose,true);root.removeEventListener('pilot2-state-change',observe);}};
}
