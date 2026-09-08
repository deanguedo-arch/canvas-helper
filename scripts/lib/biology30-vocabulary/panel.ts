/** A view over the owning course's real Frayer controls, never a second save model. */
export type VocabularyFamily = {id:string;label:string;meaning:string;wordAnalysis:string[];routes:string[]};
export type VocabularyTerm = {term:string;definition?:string;familyIds:string[]};
export type VocabularyPanelAdapter = {
  root:HTMLElement; families:VocabularyFamily[]; terms:VocabularyTerm[];
  sections():Element[]; route(section:Element):string;
  unlocked(id:string):boolean; frayer(id:string):HTMLElement|null;
  choices?():HTMLElement|null; selectedFamilies?():string[]; refresh():void; status():string;
};
export const VOCABULARY_PANEL_CSS = `
button.bio-term{display:inline;min-height:0;padding:0;border:0;border-radius:0;background:none;color:inherit;font:inherit;text-align:inherit;text-decoration:underline dotted;text-underline-offset:.2em;cursor:pointer}
button.bio-term:hover,button.bio-term:focus-visible{text-decoration-style:solid;outline-offset:3px}
dialog.bio-vocabulary{position:fixed;inset:0 0 0 auto;margin:0;width:min(36rem,100%);height:100dvh;max-height:100dvh;max-width:100%;box-sizing:border-box;border:0;border-left:1px solid var(--border,#ccc);border-radius:0;background:var(--surface,#fff);color:var(--ink,#222);padding:1.25rem;overflow:auto;overscroll-behavior:contain}
dialog.bio-vocabulary::backdrop{background:#0005}
.bio-vocabulary header{display:flex;align-items:start;justify-content:space-between;gap:1rem}
.bio-vocabulary h2{margin:0 0 1rem}.bio-vocabulary p{line-height:1.6}
.bio-vocabulary button,.bio-vocabulary select,.bio-vocabulary summary{min-height:44px;font:inherit}
.bio-vocabulary label{display:block}.bio-vocabulary select{max-width:100%;width:100%}
.bio-vocabulary textarea{display:block;box-sizing:border-box;width:100%;font:inherit;line-height:1.5;resize:vertical;padding:.6rem}
.bio-vocabulary .frayer-grid{grid-template-columns:1fr}.bio-vocabulary .save-row{flex-wrap:wrap}
.bio-vocabulary :focus-visible{outline:3px solid currentColor;outline-offset:3px}
.bio-vocabulary [hidden]{display:none!important}
.bio-vocabulary [data-bio-save-status]{position:sticky;bottom:0;background:var(--surface,#fff);padding:.5rem 0}
@media(max-width:600px){dialog.bio-vocabulary{width:100%;border:0;padding:1rem}}
@media print{dialog.bio-vocabulary{display:none!important}button.bio-term{text-decoration:none}}
`;

const excluded='a,button,nav,summary,label,input,textarea,select,[contenteditable]:not([contenteditable="false"]),script,style,dialog,.stop-check,.guided-practice,.p2-writing,.p2-practice,[data-practice-id],[data-checkpoint],.word-lens';
const word=(value:string|undefined)=>Boolean(value&&/[\p{L}\p{N}_]/u.test(value));
/** Literal names only; Unicode boundaries, longest phrase first, no stemming. */
export function termMatches(text:string,terms:string[],seen=new Set<string>()) {
  const names=[...new Set(terms.map(t=>t.toLocaleLowerCase()))].sort((a,b)=>b.length-a.length),lower=text.toLocaleLowerCase();
  const matches:{start:number;end:number;term:string}[]=[];
  for(let i=0;i<text.length;){
    const name=names.find(name=>!seen.has(name)&&lower.startsWith(name,i)&&!word(text[i-1])&&!word(text[i+name.length]));
    if(name){matches.push({start:i,end:i+name.length,term:name});seen.add(name);i+=name.length;}else i++;
  }
  return matches;
}

export function mountVocabularyPanel(adapter:VocabularyPanelAdapter) {
  const {root}=adapter,doc=root.ownerDocument,win=doc.defaultView!;
  const terms=new Map<string,VocabularyTerm>();
  for(const item of adapter.terms){const key=item.term.toLocaleLowerCase(),old=terms.get(key);terms.set(key,old?{...old,familyIds:[...new Set([...old.familyIds,...item.familyIds])]}:item);}
  const style=doc.createElement('style');style.textContent=VOCABULARY_PANEL_CSS;root.append(style);
  const dialog=doc.createElement('dialog');dialog.className='bio-vocabulary';dialog.dataset.testid='vocabulary-panel';dialog.setAttribute('aria-labelledby','bio-vocabulary-title');
  dialog.innerHTML='<header><h2 id="bio-vocabulary-title"></h2><button type="button" data-bio-close aria-label="Close vocabulary">Close</button></header><label data-bio-family-label>Concept family<select data-bio-family></select></label><div data-bio-meaning></div><details data-bio-frayer><summary>My Frayer</summary><p data-bio-locked></p><div data-bio-frayer-slot></div><div data-bio-choices-slot></div></details><p data-bio-save-status role="status" aria-live="polite"></p>';
  root.append(dialog);
  const get=<T extends Element>(selector:string)=>dialog.querySelector<T>(selector)!;
  const familySelect=get<HTMLSelectElement>('[data-bio-family]'),meaning=get<HTMLElement>('[data-bio-meaning]'),slot=get<HTMLElement>('[data-bio-frayer-slot]');
  let trigger:HTMLButtonElement|null=null,current:VocabularyTerm|null=null;
  let loans:{node:HTMLElement;marker:Comment}[]=[],scrolls:{node:Element;x:number;y:number}[]=[],windowScroll=[0,0],oldOverflow='';
  const restoreLoans=()=>{for(const {node,marker} of loans){marker.replaceWith(node);}loans=[];};
  const loan=(node:HTMLElement|null,target:Element)=>{if(!node)return;const marker=doc.createComment('Frayer home');node.before(marker);loans.push({node,marker});target.append(node);};
  const status=()=>{get<HTMLElement>('[data-bio-save-status]').textContent=adapter.status();};
  function showFamily(){
    restoreLoans();meaning.replaceChildren();const family=adapter.families.find(f=>f.id===familySelect.value);if(!family||!current)return;
    const paragraph=(text:string)=>{const p=doc.createElement('p');p.textContent=text;meaning.append(p);};
    const belongs=current.familyIds.includes(family.id);
    paragraph(belongs&&current.definition?current.definition:`${belongs?'Family-level explanation':'My chosen Frayer'} — ${family.label}: ${family.meaning}`);
    if(belongs&&current.definition)paragraph(`Concept family — ${family.label}: ${family.meaning}`);
    const heading=doc.createElement('h3');heading.textContent='Word structure';meaning.append(heading);
    for(const note of family.wordAnalysis)paragraph(note);
    const unlocked=adapter.unlocked(family.id);get<HTMLElement>('[data-bio-locked]').textContent=unlocked?'The same Frayer and saved work as Core Vocabulary. Six anchors and two learner choices.':'The meaning is available now. Begin the associated lesson to unlock this Frayer.';
    if(unlocked){loan(adapter.frayer(family.id),slot);loan(adapter.choices?.()??null,get('[data-bio-choices-slot]'));adapter.refresh();}
    status();
  }
  const close=()=>{if(dialog.open)dialog.close();};
  const onClose=()=>{restoreLoans();doc.documentElement.style.overflow=oldOverflow;for(const item of scrolls){item.node.scrollLeft=item.x;item.node.scrollTop=item.y;}win.scrollTo(...windowScroll as [number,number]);trigger?.focus({preventScroll:true});};
  const click=(event:Event)=>{
    const target=event.target instanceof Element?event.target.closest<HTMLButtonElement>('[data-bio-term]'):null;if(!target||!root.contains(target))return;
    current=terms.get(target.dataset.bioTerm!)??null;if(!current)return;trigger=target;
    const route=target.dataset.bioTermRoute!;
    familySelect.replaceChildren();for(const family of adapter.families.filter(f=>current!.familyIds.includes(f.id)).sort((a,b)=>Number(b.routes.includes(route))-Number(a.routes.includes(route)))){const option=doc.createElement('option');option.value=family.id;option.textContent=family.label;familySelect.append(option);}
    for(const id of adapter.selectedFamilies?.()??[]){if(current.familyIds.includes(id))continue;const family=adapter.families.find(f=>f.id===id);if(family){const option=doc.createElement('option');option.value=id;option.textContent=`My chosen Frayer: ${family.label}`;familySelect.append(option);}}
    get<HTMLElement>('[data-bio-family-label]').hidden=familySelect.options.length<2;
    get<HTMLElement>('#bio-vocabulary-title').textContent=target.textContent;
    get<HTMLDetailsElement>('[data-bio-frayer]').open=false;
    windowScroll=[win.scrollX,win.scrollY];scrolls=[];for(let parent:Element|null=target.parentElement;parent;parent=parent.parentElement)scrolls.push({node:parent,x:parent.scrollLeft,y:parent.scrollTop});
    oldOverflow=doc.documentElement.style.overflow;showFamily();dialog.showModal();doc.documentElement.style.overflow='hidden';get<HTMLButtonElement>('[data-bio-close]').focus({preventScroll:true});
  };
  for(const section of adapter.sections()){
    const seen=new Set<string>(),walker=doc.createTreeWalker(section,win.NodeFilter.SHOW_TEXT),nodes:Text[]=[];
    while(walker.nextNode()){const text=walker.currentNode as Text;if(text.parentElement&&!text.parentElement.closest(excluded))nodes.push(text);}
    for(const node of nodes){const matches=termMatches(node.data,[...terms.keys()],seen);if(!matches.length)continue;const fragment=doc.createDocumentFragment();let position=0;
      for(const match of matches){fragment.append(node.data.slice(position,match.start));const button=doc.createElement('button');button.type='button';button.className='bio-term';button.dataset.bioTerm=match.term;button.dataset.bioTermRoute=adapter.route(section);button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',`Vocabulary: ${node.data.slice(match.start,match.end)}`);button.textContent=node.data.slice(match.start,match.end);fragment.append(button);position=match.end;}fragment.append(node.data.slice(position));node.replaceWith(fragment);
    }
  }
  // A saves at document level and B-D at the course root. A microtask can run
  // between bubbling listeners, before the owner has produced the new result.
  const afterInput=()=>win.setTimeout(status,0);
  root.addEventListener('click',click);dialog.addEventListener('close',onClose);get('[data-bio-close]').addEventListener('click',close);familySelect.addEventListener('change',showFamily);dialog.addEventListener('input',afterInput);dialog.addEventListener('change',afterInput);dialog.addEventListener('click',afterInput);win.addEventListener('hashchange',close);
  return {dispose(){close();restoreLoans();root.removeEventListener('click',click);win.removeEventListener('hashchange',close);dialog.remove();style.remove();}};
}
