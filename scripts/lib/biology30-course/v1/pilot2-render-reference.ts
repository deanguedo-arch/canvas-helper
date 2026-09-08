import type {TopicContract} from './pilot2-contract.js';
import type {TopicStateSchema} from './pilot2-state.js';
import type {TopicRenderInputs} from './pilot2-render-topic.js';
import {validateTopicTextbookQuestion,renderTopicTeachingLink,type TopicTextbookQuestion} from './pilot2-render-textbook.js';
import {renderTopicResponse} from './pilot2-render-controls.js';
import {topicHtml as h} from './pilot2-render-common.js';

export function renderTopicTextbookPage(groups:{id:string;chapter:number|null;textbookUnit:number|null;items:TopicTextbookQuestion[]}[],contract:TopicContract,schema:TopicStateSchema) {
  const ids=groups.flatMap(group=>[group.id,...group.items.map(item=>item.id)]);
  if(!groups.length||new Set(ids).size!==ids.length||groups.some(group=>!group.items.length))throw new Error('Textbook page inventory drift');
  const u=schema.unit.toLowerCase();
  return `<div class="p2-topic"><header class="page-header"><p class="eyebrow">Resources</p><h1>Textbook Library</h1><p>Read the local chapters and use exact page links beside lessons and practice. Textbook reinforcement is optional.</p></header><div class="p2-hub-layout p2-textbook-layout" data-p2-hub><nav aria-label="Choose a textbook chapter">${groups.map(group=>`<button type="button" data-p2-panel-target="${h(group.id)}">${h(group.chapter?`Chapter ${group.chapter}`:`Unit ${group.textbookUnit} Review`)}</button>`).join('')}<button type="button" data-p2-panel-target="${u}-sources">Sources and Credits</button></nav><div class="p2-hub-reader">${groups.map(group=>{
    const first=group.items[0];validateTopicTextbookQuestion(first,schema);
    return `<section id="${h(group.id)}" data-p2-panel tabindex="-1" hidden><h2>${h(group.chapter?`Chapter ${group.chapter}`:`Textbook Unit ${group.textbookUnit}`)}</h2><p class="resource-links"><a href="${h(first.chapterPdf)}#page=${group.chapter?1:first.physicalPage}" target="_blank" rel="noopener">Open PDF in a new tab</a><a href="${h(first.chapterPdf)}#page=${first.physicalPage}" target="_blank" rel="noopener">Open review at p. ${first.printedPage}</a></p><iframe class="library-frame" title="${h(group.chapter?`Chapter ${group.chapter} textbook`:`Unit ${group.textbookUnit} review`)}" src="${h(first.chapterPdf)}#page=${group.chapter?1:first.physicalPage}" loading="lazy"></iframe><details><summary>Review questions and course links</summary><ul>${group.items.map(item=>{validateTopicTextbookQuestion(item,schema);const route=`${u}-${group.chapter?`chapter-${group.chapter}`:'final'}-practice`;if(!schema.routes.includes(route))throw new Error('Missing textbook practice return route');return `<li><a href="#${h(route)}" data-pilot2-return-route="${h(route)}" data-pilot2-return-focus="${h(item.id)}">Question ${item.questionNumber}: ${h(item.title)}</a> · printed page ${item.printedPage} · <a href="${h(item.chapterPdf)}#page=${item.physicalPage}" target="_blank" rel="noopener">Open source question</a></li>`;}).join('')}</ul></details></section>`;
  }).join('')}<section id="${u}-sources" data-p2-panel tabindex="-1" hidden><h2>Sources and Credits</h2><section><h3>Curriculum and class materials</h3><p>The Alberta Biology 20–30 Program of Studies and Biology 30 performance standards guide the learning. Supplied daily plans, chapter notes and textbook chapters guide the sequence and reference links.</p></section><section><h3>Figures and observations</h3><p>Course-authored diagrams, generated illustrations and selected supplied figures support the teaching. Captions distinguish models from observations and describe their limits. Source materials remain in local course development use.</p></section><section><h3>Typography</h3><p>Hanken Grotesk and Work Sans are distributed under the SIL Open Font License.</p></section></section></div></div></div>`;

}
export function renderTopicGlossary(vocabulary:TopicRenderInputs['vocabulary'],contract:TopicContract) {
  const introduced=vocabulary.introducedTerms.map(term=>({term:term.term,definition:term.definition,partId:term.firstTeachingPartId})),preserved=vocabulary.preservedGlossaryEntries.map(term=>({term:term.term,definition:term.definition,partId:null}));
  const entries=[...introduced,...preserved].sort((a,b)=>a.term.localeCompare(b.term,'en'));
  return `<div class="p2-topic"><h1>Glossary</h1><p>Use these definitions for reference. The required lessons introduce terms where you first need them.</p><label>Find a term<input type="search" data-pilot2-glossary-search></label><p data-pilot2-glossary-status role="status"></p><dl>${entries.map(entry=>`<div data-pilot2-glossary-term="${h(entry.term)}"><dt><strong>${h(entry.term)}</strong></dt><dd><p>${h(entry.definition)}</p>${entry.partId?renderTopicTeachingLink(contract,entry.partId):''}</dd></div>`).join('')}</dl></div>`;
}
export function mountTopicGlossary(root:HTMLElement) {
  const search=root.querySelector<HTMLInputElement>('[data-pilot2-glossary-search]'),status=root.querySelector<HTMLElement>('[data-pilot2-glossary-status]'),entries=Array.from(root.querySelectorAll<HTMLElement>('[data-pilot2-glossary-term]'));
  if(!search||!status)throw new Error('Missing glossary controls');
  const update=()=>{const query=search.value.trim().toLocaleLowerCase();let visible=0;for(const entry of entries){entry.hidden=!(entry.textContent??'').toLocaleLowerCase().includes(query);if(!entry.hidden)visible++;}status.textContent=`${visible} of ${entries.length} terms shown.`;};
  search.addEventListener('input',update);update();return{dispose(){search.removeEventListener('input',update);}};
}
export function renderTopicAdvancedIndex(contract:TopicContract,instruction:TopicRenderInputs['instruction']) {
  return `<div class="p2-topic"><h1>Advanced Learning</h1><p>Optional extensions appear beside their related teaching. Open one below to return to that exact activity.</p>${contract.topics.map(topic=>`<section><h2>${h(topic.title)}</h2><ul>${topic.parts.map(part=>{const advanced=instruction.parts.find(item=>item.partId===part.id)?.advanced;if(!advanced||!advanced.optional||advanced.completionRequired)throw new Error(`Missing optional Advanced activity: ${part.id}`);return `<li><a href="#${h(topic.id)}" data-pilot2-return-route="${h(topic.id)}" data-pilot2-return-focus="${h(advanced.id)}">${h(advanced.title)}</a></li>`;}).join('')}</ul></section>`).join('')}</div>`;
}
export function renderTopicNotes(schema:TopicStateSchema) {
  return `<div class="p2-topic"><h1>My notes</h1><p>Keep questions, connections and next steps here. These notes also appear in All My Work and do not change required completion.</p><section id="${schema.unit.toLowerCase()}-process-note" tabindex="-1">${renderTopicResponse(schema,`${schema.unit.toLowerCase()}-process-note`,'Your notes')}</section></div>`;
}
