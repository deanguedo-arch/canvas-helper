import {topicHtml as h} from '../biology30-course/v1/pilot2-render-common.js';
import {renderBiology30Topic,TOPIC_COMPONENT_CSS} from '../biology30-course/v1/pilot2-render-topic.js';
import {renderPresentationShell} from '../biology30-course/v1/pilot2-presentation-shell.js';
import {renderTopicVocabulary} from '../biology30-course/v1/pilot2-render-vocabulary.js';
import {renderTopicCollectionPage,TOPIC_COLLECTION_CSS} from '../biology30-course/v1/pilot2-collection-view.js';
import {TOPIC_FIGURE_VIEWER_CSS} from '../biology30-course/v1/pilot2-figure-viewer.js';
import {VOCABULARY_PANEL_CSS} from '../biology30-vocabulary/panel.js';
import {validateTopicActivityIndex,type ActivityEntry} from '../biology30-course/v1/pilot2-activity-index.js';
import {biology20Profile} from './profile.js';
import type {loadBiology20FirstTopicProof} from './first-topic-proof.js';
type Proof=Awaited<ReturnType<typeof loadBiology20FirstTopicProof>>;
export const proofSupportPages=[['a-chapter-1-practice','Chapter 1 Practice'],['a-chapter-2-practice','Chapter 2 Practice'],['a-review-seminar','Review Seminar'],['a-final-practice','Final Practice'],['a-models','Models and Data Lab'],['a-textbook','Textbook Library'],['a-video-library','Video Library']] as const;

/** A complete navigation surface around a plainly labelled partial candidate. */
export function renderBiology20ProofShell(proof:Proof){
 const pages=new Map<string,{title:string;html:string}>();
 const notice='<p class="p2-course-intro">Development preview — only the first lesson is interactive. This is not a complete module.</p>';
 pages.set(proof.design.topicId,{title:proof.design.title,html:notice+renderBiology30Topic(proof.design.topicId,proof.input)});
 for(const t of proof.vocabularyLayout.topics.slice(1))pages.set(t.id,{title:t.title,html:`<div class="p2-topic"><header class="page-header"><h1>${h(t.title)}</h1><p>This lesson is not assembled in this preview yet. This notice does not unlock its Frayers or count as completed work.</p></header>${t.parts.map(p=>`<section id="${h(p.id)}"><h2>${h(p.title)}</h2><p>Planned teaching destination.</p></section>`).join('')}</div>`});
 for(const [id,title] of proofSupportPages)pages.set(id,{title,html:`<div class="p2-topic"><header class="page-header"><h1>${h(title)}</h1><p>Not yet assembled. This development preview contains no completed ${h(title.toLowerCase())} activity.</p></header></div>`});
 pages.set('a-core-vocabulary',{title:'Core Vocabulary',html:renderTopicVocabulary(proof.vocabulary,proof.vocabularyLayout,proof.input.state)});
 pages.set('a-all-my-work',{title:'Saved work',html:renderTopicCollectionPage()});
 pages.set('a-glossary',{title:'Glossary and Data',html:`<div class="p2-topic"><header class="page-header"><h1>Glossary</h1><p>Current authored definitions. Data library still in development.</p></header><dl>${proof.vocabulary.introducedTerms.map(t=>`<div><dt>${h(t.term)}</dt><dd>${h(t.definition)}</dd></div>`).join('')}</dl></div>`});
 pages.set('a-advanced',{title:'Advanced Learning',html:`<div class="p2-topic"><header class="page-header"><h1>Advanced Learning</h1><p>Optional first-lesson extensions. Additional authored blocks await lesson assembly.</p></header><ul>${proof.input.instruction.parts.map(p=>`<li><a href="#${h(proof.design.topicId)}" data-pilot2-return-route="${h(proof.design.topicId)}" data-pilot2-return-focus="${h(p.advanced.id)}">${h(p.advanced.title)}</a> — 6 minutes (provisional)</li>`).join('')}</ul></div>`});
 pages.set('a-sources-and-credits',{title:'Sources and Credits',html:'<div class="p2-topic"><header class="page-header"><h1>Sources and Credits</h1><p>Teaching order follows the supplied Biology 20 Unit A deck and daily plans. Scientific/source review and textbook links are incomplete.</p><p>The producer comparison is a generated conceptual illustration, not microscopy or field observation. The system-boundary and albedo diagrams use illustrative models.</p><p>Hanken Grotesk and Work Sans fonts are used under their bundled Open Font Licenses.</p></header></div>'});
 const profile=biology20Profile('a'),contract={...proof.vocabularyLayout,requiredRoutes:[...proof.vocabularyLayout.requiredRoutes,...proofSupportPages.slice(0,4).map(p=>p[0])]};
 const overviewHtml=`<header class="overview-hero"><h1>${h(profile.presentation.opening[0])}</h1><p>${h(profile.presentation.opening[1])}</p><p><strong>Development preview, not a completed course.</strong> The full navigation is present. Only the first lesson, vocabulary and saved-work tools are currently interactive; other destinations are labelled unfinished.</p><a class="button" href="#${h(proof.design.topicId)}" data-page-target="${h(proof.design.topicId)}">Open the first lesson</a></header><section class="overview-intro"><div><h2>What is available</h2><p>Three illustrated teaching sections, worked examples, guided questions, optional Advanced Learning and shared vocabulary/Frayers. Timing and full-module completion requirements have not been finalized.</p></div></section>`;
 return renderPresentationShell({title:profile.title,logoPath:'assets/brand/nxt-ce-logo-white-with-ce.png',seminar:{id:'a-review-seminar'},topic:{contract,practice:proof.input.practice},overviewHtml},pages,TOPIC_COMPONENT_CSS+TOPIC_COLLECTION_CSS+TOPIC_FIGURE_VIEWER_CSS+VOCABULARY_PANEL_CSS,profile.presentation);
}

/** Derived index for the existing partial schema; no synthetic saved activities. */
export function proofActivityIndex(proof:Proof){
 const index:ActivityEntry[]=[],schema=proof.input.state,topic=proof.design.topicId;
 const grouped=new Set<string>();
 for(const f of proof.vocabulary.conceptFamilies){const ids=schema.families.responseIds[f.id];ids.forEach(id=>grouped.add(id));index.push({id:f.id,title:f.label,category:'Frayer',routeId:'a-core-vocabulary',focusId:f.id,responses:ids.map((id,i)=>({id,label:['Definition','Mechanism','Evidence','Confusion'][i]})),choices:[],flags:[{id:f.id+'-collected',label:'Collected'}]});}
 for(const id of Object.keys(schema.responses).filter(id=>!grouped.has(id))){const r=proof.design.responses.find((r:{id:string})=>r.id===id),p=proof.input.practice.find(p=>p.id===id);index.push({id,title:r?.prompt??p?.prompt??id,category:'Lesson response',routeId:topic,focusId:id,responses:[{id,label:'Your writing'}],choices:[],flags:[]});}
 for(const id of Object.keys(schema.choices)){const p=proof.input.practice.find(p=>p.id===id)!;index.push({id,title:p.prompt,category:'Practice',routeId:topic,focusId:id,responses:[],choices:[{id,label:'Your selection',options:Object.fromEntries(p.options!.map((text,i)=>[String(i),text]))}],flags:[]});}
 for(const id of Object.keys(schema.flags).filter(id=>!proof.vocabulary.conceptFamilies.some(f=>id===f.id+'-collected'))){const advanced=proof.input.instruction.parts.find(p=>id===p.advanced.id+'-complete')?.advanced;const focus=advanced?.id??(id.endsWith('-attempted')?id.slice(0,-10):id===topic+'-evidence-collected'?topic+'-evidence':topic+'-media');index.push({id,title:advanced?.title??'Lesson activity status',category:advanced?'Advanced Learning':'Activity status',routeId:topic,focusId:focus,responses:[],choices:[],flags:[{id,label:'Marked complete or attempted'}]});}
 validateTopicActivityIndex(index,schema);return index;
}
