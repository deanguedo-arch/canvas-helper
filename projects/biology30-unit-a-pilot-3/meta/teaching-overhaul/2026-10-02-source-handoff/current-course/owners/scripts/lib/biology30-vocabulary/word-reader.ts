import {renderBiologyWordDetails,validateBiologyWordRecords,type BiologyWordRecord,type BiologyWordCategory} from './word-record.js';
/** Mirrors the established A reader, with selectors scoped to survive B–D's button rules. */
export const BIOLOGY_WORD_READER_CSS=`
[data-biology-word-reader].vocabulary-layout{display:grid;grid-template-columns:280px minmax(0,1fr);border-top:1px solid var(--border)}
[data-biology-word-reader]>.vocabulary-index{display:block;max-height:75vh;overflow:auto;padding:16px;border-right:1px solid var(--border);background:#f8faf7}
[data-biology-word-reader]>.vocabulary-reader{min-width:0;padding:30px 38px}
[data-biology-word-reader] .word-category{margin:0 0 20px;padding:0;border:0}
[data-biology-word-reader] .word-category>h2{margin:8px 10px 10px;font:850 12px/1.5 "Work Sans",sans-serif;letter-spacing:.045em;text-transform:uppercase;color:var(--teal)}
.p2-topic [data-biology-word-reader] .vocabulary-index button[data-biology-select-word],
[data-biology-word-reader] .vocabulary-index button[data-biology-select-word]{display:grid;width:100%;gap:2px;min-height:44px;padding:9px 10px;border:0;border-left:3px solid transparent;border-radius:0;background:transparent;color:var(--ink);font:inherit;text-align:left;text-decoration:none;cursor:pointer;overflow-wrap:anywhere}
.p2-topic [data-biology-word-reader] .vocabulary-index button[data-biology-select-word]:hover,
.p2-topic [data-biology-word-reader] .vocabulary-index button[data-biology-select-word][aria-pressed=true],
[data-biology-word-reader] .vocabulary-index button[data-biology-select-word][aria-pressed=true]{border-left-color:var(--teal);background:#e9f2ee}
[data-biology-word-details]>h2{margin:0 0 18px;font:760 34px/1.1 "Hanken Grotesk",sans-serif}
[data-biology-word-details]>h2{scroll-margin-top:calc(var(--top,64px) + 18px)}
[data-biology-word-reader] .vocabulary-index small{color:var(--muted);font-size:13px}
[data-biology-word-details]>section{padding:18px 0;border-top:1px solid var(--border)}
[data-biology-word-details] .section-label,[data-biology-word-details]>.eyebrow{margin:0 0 7px;color:var(--teal);font:850 12px/1.5 "Work Sans",sans-serif;letter-spacing:.045em;text-transform:uppercase}
[data-biology-word-details]>section>p{margin:18px 0 16px;line-height:1.66}
[data-biology-word-details] .concept-contrast{display:grid;grid-template-columns:1fr 1fr;gap:22px}
[data-biology-word-details] .concept-contrast h3,[data-biology-word-details] .retrieval-mini h3{margin:0 0 6px;font-size:17px}
[data-biology-word-details] .concept-contrast p,[data-biology-word-details] .retrieval-mini p{margin:0;line-height:1.66}
[data-biology-word-details] .retrieval-mini{padding:15px;background:#f1f7f4;margin:18px 0}
[data-biology-word-details] .word-parts{display:flex;flex-wrap:wrap;gap:12px 24px;margin:18px 0}
[data-biology-word-details] .word-parts>div{display:flex;gap:8px}[data-biology-word-details] .word-parts dt{font-weight:800}[data-biology-word-details] .word-parts dd{margin:0;color:var(--muted)}
[data-biology-word-details] .caution-line{padding:12px;background:#faf4e9}
[data-biology-word-reader] [hidden],[data-biology-frayer-bank][hidden]{display:none!important}
[data-biology-word-reader] :focus-visible{outline:3px solid currentColor;outline-offset:3px}
@media(max-width:1100px){[data-biology-word-reader].vocabulary-layout{grid-template-columns:230px minmax(0,1fr)}}
@media(max-width:1000px){[data-biology-word-reader].vocabulary-layout{grid-template-columns:1fr}[data-biology-word-reader]>.vocabulary-index{max-height:min(40vh,320px);border-right:0;border-bottom:1px solid var(--border)}[data-biology-word-reader]>.vocabulary-reader{padding:26px 22px}[data-biology-word-details] .concept-contrast{grid-template-columns:1fr}}
`;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** Canonical word HTML for both course families. No category-owned teaching or save records. */
export function renderBiologyWordReader(words:BiologyWordRecord[],categories:BiologyWordCategory[]){
 validateBiologyWordRecords(words,categories);
 return `<div class="vocabulary-layout" data-biology-word-reader><nav class="vocabulary-index" aria-label="Vocabulary categories and words">${categories.map(c=>`<section class="word-category"><h2>${esc(c.label)}</h2>${c.wordIds.map(id=>`<button class="text-link" type="button" data-biology-select-word="${esc(id)}"><span>${esc(words.find(w=>w.id===id)!.term)}</span><small data-biology-word-state>Reference available</small></button>`).join('')}</section>`).join('')}</nav><div class="vocabulary-reader">${words.map((w,i)=>`<article data-biology-word-view="${esc(w.id)}"${i?' hidden':''}>${renderBiologyWordDetails(w,words,categories)}</article>`).join('')}</div></div>`;
}
/** Selected word is session-only. The owning adapters must attach the preserved Frayer explicitly. */
export function mountBiologyWordReader(root:HTMLElement){
 const views=[...root.querySelectorAll<HTMLElement>('[data-biology-word-view]')];
 const buttons=[...root.querySelectorAll<HTMLButtonElement>('[data-biology-select-word]')];
 const select=(id:string,focus:boolean)=>{
  const view=views.find(v=>v.dataset.biologyWordView===id);if(!view)return;
  for(const v of views)v.hidden=v!==view;
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.biologySelectWord===id));
  if(focus){const heading=view.querySelector<HTMLElement>('h2');heading?.focus({preventScroll:true});heading?.scrollIntoView({block:'start'});}
  root.dispatchEvent(new CustomEvent('biology-word-selected',{bubbles:true,detail:{wordId:id}}));
 };
 const click=(event:Event)=>{const button=(event.target as Element).closest<HTMLElement>('[data-biology-select-word]');if(button&&root.contains(button))select(button.dataset.biologySelectWord!,true);};
 root.addEventListener('click',click);if(views[0])select(views[0].dataset.biologyWordView!,false);
 return {selectWord:(id:string)=>select(id,true),dispose:()=>root.removeEventListener('click',click)};
}
