import {renderSourceVideoLibrary,renderSourceVideo,type SourceVideo} from './pilot2-source-videos.js';
import {adaptTopicHubs} from './pilot2-a-hubs.js';
import {renderTopicVideoLibrary,TOPIC_MEDIA_CSS,type TopicMediaClip} from './pilot2-media.js';
import {load} from 'cheerio';
import {renderPresentationShell} from './pilot2-presentation-shell.js';
import {renderBiology30Topic,TOPIC_COMPONENT_CSS,type TopicRenderInputs,type TopicFigure} from './pilot2-render-topic.js';
import {renderTopicModel,type RenderTopicModel} from './pilot2-render-model.js';
import {renderTopicVocabulary,type RenderTopicVocabulary} from './pilot2-render-vocabulary.js';
import {renderTopicInvestigation,type RenderTopicInvestigation} from './pilot2-render-investigation.js';
import {renderTopicSeminar,renderTopicPracticePage,type RenderTopicSeminar} from './pilot2-render-review.js';
import {renderTopicTextbookQuestion,type TopicTextbookQuestion} from './pilot2-render-textbook.js';
import {renderTopicTextbookPage,renderTopicGlossary,renderTopicAdvancedIndex,renderTopicNotes} from './pilot2-render-reference.js';
import {renderTopicCollectionPage,TOPIC_COLLECTION_CSS} from './pilot2-collection-view.js';
import {TOPIC_FIGURE_VIEWER_CSS} from './pilot2-figure-viewer.js';
import {buildTopicActivityIndex,type ActivityInputs} from './pilot2-activity-index.js';
import {topicHtml as h} from './pilot2-render-common.js';
import type {TopicBrowserPayload} from './pilot2-browser-entry.js';
import type {Biology30SuspendDataSchema} from './suspend-data.js';

export type TopicCourseInputs={sourceVideos?:SourceVideo[];title:string;summary:string;outcomes:string[];logoPath:string;topic:Omit<TopicRenderInputs,'vocabulary'>&{vocabulary:RenderTopicVocabulary};models:RenderTopicModel[];investigations:RenderTopicInvestigation[];seminar:RenderTopicSeminar;textbookGroups:{id:string;chapter:number|null;textbookUnit:number|null;items:TopicTextbookQuestion[]}[];materials:{sourcePath:string;figure:TopicFigure}[];videos:TopicMediaClip[]};
export function topicCourseActivities(input:TopicCourseInputs):ActivityInputs {
 return {contract:input.topic.contract,state:input.topic.state,framing:input.topic.framing,instruction:input.topic.instruction,practice:{unit:input.topic.state.unit,items:input.topic.practice,counts:{},chapterCounts:{}},vocabulary:input.topic.vocabulary,models:{models:input.models},investigations:{investigations:input.investigations},seminar:input.seminar,textbook:{groups:input.textbookGroups}};
}
/** Pure whole-course assembly. The owning build must verify ALL three frozen
 * contracts and the transitive code/asset closure before invoking this function. */
export function renderTopicCourse(input:TopicCourseInputs,legacySchema?:Biology30SuspendDataSchema) {
 const {topic}=input,{contract,state}=topic,unit=state.unit.toLowerCase(),graphs=topic.graphs??[];
 if(contract.status!=='frozen'||contract.teacherAcceptance!==null)throw new Error('Whole-course rendering requires a frozen, unaccepted author contract');
 if(!/^assets\/[a-zA-Z0-9/_.-]+\.(png|svg|webp)$/.test(input.logoPath)||input.logoPath.includes('..'))throw new Error('Unsafe course logo path');
 const activities=topicCourseActivities(input),index=buildTopicActivityIndex(activities),pages=new Map<string,{title:string;html:string}>(),topicIds=new Set(contract.topics.map(topic=>topic.id));
 const add=(id:string,title:string,html:string)=>{if(pages.has(id)||!state.routes.includes(id))throw new Error(`Duplicate or unregistered course route: ${id}`);pages.set(id,{title,html});};
 for(const lesson of contract.topics)add(lesson.id,lesson.title,renderBiology30Topic(lesson.id,{...topic,videos:input.videos}));
 for(const route of contract.requiredRoutes.filter(id=>!topicIds.has(id))){
  if(route===input.seminar.id)add(route,input.seminar.title,renderTopicSeminar(input.seminar,state));
  else {const chapter=route.match(/-chapter-(\d+)-practice$/)?.[1],title=chapter?`Chapter ${chapter} Practice`:'Final Practice';let html=renderTopicPracticePage(title,route,topic.practice.filter(item=>item.routeId===route),state,graphs);
   const practicePage=load(html,null,false),practiceBody=practicePage('.p2-topic');
   for(const group of input.textbookGroups.filter(group=>chapter?group.chapter===Number(chapter):group.chapter===null)){
    const reinforcement=`<section class="textbook-review-support" id="${h(group.id)}-practice"><h2>Optional textbook reinforcement</h2><p>Attempt the source questions before opening their guides. This work is optional.</p><details><summary>Textbook questions and answer guides</summary>${group.items.map(item=>renderTopicTextbookQuestion(item,contract,state)).join('')}</details><a href="#${h(route)}" data-pilot2-return-route="${h(route)}" data-pilot2-return-focus="${h(topic.practice.find(item=>item.routeId===route)!.id)}">Jump to course questions</a></section>`;
    practiceBody.children('h1').next('p').after(reinforcement);
   }
   html=practicePage.html();
   add(route,title,html);
  }
 }
 add(`${unit}-core-vocabulary`,'Core Vocabulary',renderTopicVocabulary(topic.vocabulary,contract,state));
 add(`${unit}-glossary`,'Glossary',renderTopicGlossary(topic.vocabulary,contract));
 add(`${unit}-models`,'Models and Data Lab',`<div class="p2-topic"><h1>Models and Data Lab</h1>${input.models.map(model=>renderTopicModel(model,state,{lesson:contract.topics.find(t=>t.id===model.teachingTopicId),investigation:input.investigations.find(i=>i.id===model.sourceInvestigationId),teaching:input.topic.framing.topics.find(t=>t.topicId===model.teachingTopicId)})).join('')}</div>`);
 add(`${unit}-investigations`,'Investigations',`<div class="p2-topic"><h1>Investigations</h1><p>Optional extensions use supplied observations. Keep the evidence and model limits visible.</p>${input.investigations.map(item=>renderTopicInvestigation(item,contract,state,graphs,input.materials)).join('')}</div>`);
 add(`${unit}-all-my-work`,'All My Work',renderTopicCollectionPage());
 add(`${unit}-advanced`,'Advanced Learning',renderTopicAdvancedIndex(contract,topic.instruction));
 add(`${unit}-video-library`,'Video Library',input.sourceVideos?.length?renderSourceVideoLibrary(input.sourceVideos):renderTopicVideoLibrary(input.videos,contract));
 add(`${unit}-textbook`,'Textbook',renderTopicTextbookPage(input.textbookGroups,contract,state));
 add(`${unit}-notes`,'My notes',renderTopicNotes(state));
 add(`${unit}-diploma-challenge`,'Diploma Challenge',renderTopicPracticePage('Diploma Challenge',`${unit}-diploma-challenge`,topic.practice.filter(item=>item.role==='challenge'),state,graphs));
 if(pages.size+1!==state.routes.length||!state.routes.includes(`${unit}-overview`))throw new Error('Whole-course route inventory does not match saved state');
 // Reuse A's page hierarchy for hubs and practice; retain every activity ID.
 for(const [id,page]of pages){
  const fragment=load(page.html,null,false),body=fragment('.p2-topic').first(),heading=body.children('h1').first();
  if(heading.length){
   const label=id.includes('practice')||id===input.seminar.id||id.includes('challenge')?'Practice & Review':id.includes('vocabulary')||id.includes('models')||id.includes('investigations')||id.includes('work')||id.includes('notes')||id.includes('advanced')?'Process Collection':'Resources';
   const intro=heading.next('p'),header=fragment(`<header class="page-header"><p class="eyebrow">${label}</p></header>`);
   heading.before(header);header.append(heading);if(intro.length)header.append(intro);
   // Remaining content becomes a padded A-style section without moving IDs.
   if(!id.endsWith('-models')&&!id.endsWith('-investigations'))body.children().not(header).wrapAll('<section class="collection-section p2-unpadded"></section>');
  }
  if(id.endsWith('-models')||id.endsWith('-investigations')){
   const panels=body.children('section'),nav=fragment('<nav aria-label="Choose an activity"></nav>'),reader=fragment('<div class="p2-hub-reader"></div>'),layout=fragment('<div class="p2-hub-layout" data-p2-hub></div>');
   for(const panel of panels.toArray()){const node=fragment(panel),target=node.attr('id')!,title=node.find('h2,h3').first().text();node.attr('data-p2-panel','').attr('hidden','');nav.append(`<button type="button" data-p2-panel-target="${h(target)}">${h(title)}</button>`);reader.append(node);}
   layout.append(nav,reader);body.append(layout);
  }
  // Reuse A's feedback actions, using the existing lesson reading mapping.
  fragment('[data-pilot2-feedback]').each((_i,node)=>{
   const panel=fragment(node),item=topic.practice.find(item=>item.id===panel.attr('data-pilot2-feedback'));
   if(!item)return;
   const book=topic.textbookLinks?.find(book=>book.topicId===item.teachingTopicId);
   if(book)panel.append(`<p class="p2-feedback-reading"><a href="${h(book.pdf)}#page=${book.physicalPage}" target="_blank" rel="noopener">Open the lesson textbook reading at p. ${book.printedPage}</a></p>`);
   const focus=item.teachingPartIds[0]??item.teachingTopicId;
   panel.append(`<p class="p2-feedback-return"><a href="#${h(item.teachingTopicId)}" data-pilot2-return-route="${h(item.teachingTopicId)}" data-pilot2-return-focus="${h(focus)}">Revisit the lesson explanation</a></p>`);
  });
  page.html=fragment.html();
 }
 for(const lesson of contract.topics){const linked=input.sourceVideos?.filter(v=>v.topics.some(t=>t.id===lesson.id))??[];if(!linked.length)continue;const page=pages.get(lesson.id)!,$topic=load(page.html,null,false);const block=`<aside class="lesson-model-link"><div><p class="section-label">Lesson videos</p><h2>Videos from the class PowerPoint</h2><p>Watch these videos here in the lesson.</p>${linked.map(v=>`<p><a href="#${h(lesson.id)}" data-pilot2-return-route="${h(lesson.id)}" data-pilot2-return-focus="${h(lesson.id)}-source-video-${h(v.videoId)}">${h(v.title)}</a></p>`).join('')}</div></aside>`;$topic('.lesson-header').after(block);const inline=`<section class="lesson-block lesson-source-videos"><p class="section-label">Watch and make sense of it</p><h2>Lesson videos</h2><p>Watch the videos from your class PowerPoint, then continue to the illustrated walkthrough and lesson checkpoint below.</p>${linked.map(v=>`<div id="${h(lesson.id)}-source-video-${h(v.videoId)}" tabindex="-1">${renderSourceVideo({...v,topics:v.topics.filter(t=>t.id===lesson.id)},`${lesson.id}-source-player-${v.videoId}`)}<p><a href="#${unit}-video-library" data-pilot2-return-route="${unit}-video-library" data-pilot2-return-focus="source-library-${h(v.videoId)}">Open this video in the Video Library</a></p></div>`).join('')}</section>`;$topic(`[id="${lesson.id}-walkthrough"]`).before(inline);page.html=$topic.html();}
 adaptTopicHubs(input,pages);
 const shell=renderPresentationShell(input,pages,TOPIC_COMPONENT_CSS+TOPIC_MEDIA_CSS+TOPIC_COLLECTION_CSS+TOPIC_FIGURE_VIEWER_CSS);
 const $=load(shell);
 $(`#${unit}-sources-and-credits`).attr('data-p2-presentation-route','');
 $('[data-p2-embed-route]').each((_i,node)=>{const slot=$(node),id=slot.attr('data-p2-embed-route')!,page=$(`[id="${id}"]`);page.attr('data-p2-embedded','');slot.replaceWith(page);});
 // The adapted A shell retains the exact B/C/D required-route sequence.
 $('.lesson-bottom-bar').remove();
 for(const [position,route]of contract.requiredRoutes.entries()){
  const page=$(`[id="${route}"]`),previous=contract.requiredRoutes[position-1],next=contract.requiredRoutes[position+1];
  page.find('.p2-topic > a[data-page-target]').filter((_i,node)=>$(node).text()==='Continue to the next required activity').remove();
  page.append(`<nav class="p2-required-nav" aria-label="Required activity sequence"><a href="#${h(previous??'overview')}" data-page-target="${h(previous??'overview')}">${previous?'Previous required activity':'Course overview'}</a>${next?`<a href="#${h(next)}" data-page-target="${h(next)}">Next: ${h(pages.get(next)!.title)}</a>`:''}</nav>`);
 }
 $('body').children().not('script').wrapAll('<div id="pilot2-course-surface"></div>');
 const payload:TopicBrowserPayload={schemaVersion:1,activities,models:input.models,graphs,...(legacySchema?{legacySchema}:{})};
 const serialized=JSON.stringify(payload).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 // A bundled classic script also opens from a local file; no module fetch or
 // network dependency is needed for the blocked-review candidate.
 $('body').append(`<div id="pilot2-recovery" hidden></div><script type="application/json" id="pilot2-course-data">${serialized}</script><script defer src="assets/pilot2-course.js"></script>`);
 const ids=$('[id]').map((_i,node)=>$(node).attr('id')).get();if(new Set(ids).size!==ids.length)throw new Error('Duplicate whole-course HTML identity');
 for(const entry of index){const page=$(`[id="${entry.routeId}"]`);if(page.length!==1||page.find(`[id="${entry.focusId}"]`).length!==1)throw new Error(`Missing indexed activity in its owning route: ${entry.id}`);}
 if($('[data-response-id],[data-complete-id]').length)throw new Error('Legacy state selectors leaked into Pilot2 course');
 return {html:$.html(),activities,index,routeIds:state.routes,topicCount:contract.topics.length,requiredRouteCount:contract.requiredRoutes.length};
}
