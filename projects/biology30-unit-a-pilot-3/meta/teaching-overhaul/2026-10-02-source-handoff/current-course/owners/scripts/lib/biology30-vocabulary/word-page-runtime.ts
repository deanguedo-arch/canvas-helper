import {mountBiologyWordReader} from './word-reader.js';
import type {BiologyWordPageData} from './word-page.js';

/** Loans the actual controls, never cloned textareas or a second persistence record. */
export function mountTopicWordPage(root:HTMLElement,data:BiologyWordPageData,unlocked:(id:string)=>boolean,refresh:()=>void,learned:(route:string)=>boolean=()=>false){
 const reader=root.querySelector<HTMLElement>('[data-biology-word-reader]');if(!reader)return{dispose(){}};
 const doc=root.ownerDocument;
 let selected='',loanWord='',suspended=false,loans:{node:HTMLElement;marker:Comment}[]=[];
 const restore=()=>{for(const {node,marker} of loans)marker.replaceWith(node);loans=[];loanWord='';};
 const loan=(node:HTMLElement|null,slot:HTMLElement)=>{if(!node)return;const marker=doc.createComment('Original saved-control home');node.before(marker);loans.push({node,marker});slot.append(node);};
 function show(){
  for(const button of reader!.querySelectorAll<HTMLElement>('[data-biology-select-word]')){
   const label=button.querySelector<HTMLElement>('[data-biology-word-state]');
   if(label)label.textContent=data.wordRoutes?.[button.dataset.biologySelectWord!]&&learned(data.wordRoutes[button.dataset.biologySelectWord!])?'Learned':'Reference available';
  }
  if(suspended)return;
  if(loanWord===selected&&loans.length&&unlocked(data.wordFrayers[selected]))return;
  restore();
  const view=[...reader!.querySelectorAll<HTMLElement>('[data-biology-word-view]')].find(n=>n.dataset.biologyWordView===selected);if(!view)return;
  const owner=data.wordFrayers[selected],status=view.querySelector<HTMLElement>('[data-biology-word-frayer-status]')!;
  status.textContent=!owner?'This word has a reference entry, but no separate saved Frayer is required. The module retains six anchors and two learner choices.':!unlocked(owner)?'Begin the associated lesson to unlock this saved Frayer. The word explanation is available now.':'This is the same saved writing used in the lesson vocabulary panel.';
  if(owner&&unlocked(owner)){
   const slot=view.querySelector<HTMLElement>('[data-biology-word-frayer-slot]')!;
   loan(root.querySelector<HTMLElement>(`[data-biology-frayer-record="${CSS.escape(owner)}"]`),slot);
   loan(root.querySelector<HTMLElement>('.p2-family-choices'),slot);
   loanWord=selected;
  }
 }
 const select=(event:Event)=>{selected=(event as CustomEvent).detail.wordId;show();refresh();};
 reader.addEventListener('biology-word-selected',select);
 const controller=mountBiologyWordReader(reader);
 const pause=()=>{suspended=true;restore();};const resume=()=>{suspended=false;show();};
 const reveal=(event:Event)=>{const target=(event as CustomEvent<HTMLElement>).detail;const record=target?.closest<HTMLElement>('[data-biology-frayer-record]')?.dataset.biologyFrayerRecord??target?.closest<HTMLElement>('[data-p2-family-panel]')?.dataset.p2FamilyPanel;
  if(!record)return;const id=Object.keys(data.wordFrayers).find(id=>data.wordFrayers[id]===record);if(id){controller.selectWord(id);const view=reader.querySelector<HTMLElement>(`[data-biology-word-view="${CSS.escape(id)}"]`);const details=view?.querySelector<HTMLDetailsElement>('[data-biology-word-frayer]');if(details)details.open=true;}
 };
 root.addEventListener('biology-word-popup-open',pause);root.addEventListener('biology-word-popup-close',resume);
 root.addEventListener('pilot2-reveal-target',reveal);root.addEventListener('pilot2-state-change',show);
 return{dispose(){restore();controller.dispose();reader.removeEventListener('biology-word-selected',select);root.removeEventListener('biology-word-popup-open',pause);root.removeEventListener('biology-word-popup-close',resume);root.removeEventListener('pilot2-reveal-target',reveal);root.removeEventListener('pilot2-state-change',show);}};
}
