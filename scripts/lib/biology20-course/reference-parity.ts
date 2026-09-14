import {load} from 'cheerio';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {topicHtml as h} from '../biology30-course/v1/pilot2-render-common.js';
import {renderSourceVideo,renderSourceVideoLibrary,type SourceVideo} from '../biology30-course/v1/pilot2-source-videos.js';
import type {loadBiology20UnitA} from './unit-a-inputs.js';

type Pages=Map<string,{title:string;html:string}>;
/** Explicit A Pilot 2 resource behavior, composed with the existing shared runtime. */
export async function completeUnitAResources(a:Awaited<ReturnType<typeof loadBiology20UnitA>>,pages:Pages){
 const base=path.resolve('projects/resources/biology20-production/v1/units/a');
 const source=JSON.parse(await readFile(path.join(base,'source-videos.json'),'utf8'));
 const support=JSON.parse(await readFile(path.join(base,'textbook-support.json'),'utf8'));
 const deck=JSON.parse(await readFile(path.resolve(base,'../../extracted/decks/a.json'),'utf8'));
 if(deck.sha256!==source.sourceSha256)throw Error('PowerPoint source hash drift');
 const videos:SourceVideo[]=source.videos.map((v:any)=>{
  const t=a.input.contract.topics.find(t=>t.id===v.topicId);
  if(!t?.parts.some(p=>p.id===v.partId)||!deck.slides.find((s:any)=>s.number===v.slide)?.media.some((m:any)=>m.target?.includes('v='+v.id)))throw Error('Video source/placement drift: '+v.id);
  return {videoId:v.id,title:v.title,provider:v.provider,chapter:t.chapter,metadataReachable:v.status===200,sourceLabels:[`Unit A PowerPoint · slide ${v.slide}`],topics:[{id:t.id,title:t.title,walkthroughId:t.id+'-walkthrough',checkpointId:t.id+'-media'}]};
 });
 if(new Set(videos.map(v=>v.videoId)).size!==16)throw Error('Unit A PowerPoint video inventory drift');
 pages.set('a-video-library',{title:'Video Library',html:renderSourceVideoLibrary(videos)});
 for(const t of a.input.contract.topics){
  const page=pages.get(t.id)!,$=load(page.html,null,false);
  for(const v of source.videos.filter((v:any)=>v.topicId===t.id)){
   const video=videos.find(x=>x.videoId===v.id)!;
   $(`[id="${v.partId}"]>.lesson-block`).first().after(`<section class="lesson-block lesson-source-videos" id="${t.id}-video-${v.id}" data-p2-video-part="${v.partId}"><p class="section-label">Watch and make sense of it</p><p><strong>Watch for:</strong> ${h(v.watchFor)}</p><p>This is the video linked in your class PowerPoint. Use it alongside the lesson explanation or choose the illustrated walkthrough. No extra required response is added.</p>${renderSourceVideo(video,`${t.id}-player-${v.id}`)}<p><a class="text-link" href="#a-video-library" data-pilot2-return-route="a-video-library" data-pilot2-return-focus="source-library-${v.id}">Find this video in the Video Library</a></p></section>`);
  }
  page.html=$.html();
 }
 const destinations=new Map<string,{id:string;route:string}>();
 for(const term of a.input.vocabulary.introducedTerms){
  const page=pages.get(term.firstTeachingTopicId)!,$=load(page.html,null,false),part=$(`[id="${term.firstTeachingPartId}"]`);
  const regex=new RegExp(`(?<![\\p{L}\\p{N}])${term.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?![\\p{L}\\p{N}])`,'iu');
  // Focus an actual occurrence, never the section's first response field.
  const target=part.find('.lesson-block p,.lesson-block dt,.lesson-block dd').filter((_,n)=>regex.test($(n).text())).first();
  if(!target.length)throw Error('Missing authored term context: '+term.term);
  const id=target.attr('id')??`a-term-context-${term.id}`;target.attr('id',id).attr('tabindex','-1').attr('data-p2-reading-target','');
  destinations.set(term.id,{id,route:term.firstTeachingTopicId});page.html=$.html();
 }
 const bookFiles=['textbook-chapter-1.pdf','textbook-chapter-2a.pdf','textbook-chapter-2b.pdf'];
 const familyTargets=new Map<string,{id:string;route:string}>();
 for(const family of a.input.vocabulary.conceptFamilies){
  const partId=family.teachingPartIds[0],topic=a.input.contract.topics.find(t=>t.parts.some(p=>p.id===partId))!,page=pages.get(topic.id)!,$=load(page.html,null,false),target=$(`[id="${partId}"] .lesson-block p`).first();
  if(!target.length)throw Error('Missing family teaching context '+family.id);
  const id=target.attr('id')??family.id+'-teaching-context';target.attr('id',id).attr('tabindex','-1').attr('data-p2-reading-target','');familyTargets.set(family.id,{id,route:topic.id});page.html=$.html();
 }
 const bookLink=(pdf:string,physical:number,label:string)=>`<a class="text-link" href="${h(pdf)}#page=${physical}">${h(label)}</a>`;
 for(const [route,page] of pages){
  const $=load(page.html,null,false);
  $('[data-p2-source-video]').attr('data-p2-source-require-http','');
  const review=support.reviews.find((r:any)=>r.route===route);
  if(review){const firstQuestion=a.practice.find(p=>p.routeId===route)!;
   $('.page-header').first().after(`<section class="textbook-review-support" id="${route}-textbook-review"><p class="section-label">Textbook ${route==='a-final-practice'?'unit':'chapter'} review</p><h2>${h(review.title)}</h2><p>Attempt ${h(review.questions.label)}. ${route==='a-final-practice'?'The textbook calls this material Unit 1; this course calls it Unit A.':''}</p><p>This is optional extra review. Use it to strengthen ideas before the course questions. Keep your work in your own notes; opening this guide does not add a saved response.</p><p class="resource-links">${review.summary?bookLink('assets/'+bookFiles[review.file],review.summary.physical,`Open summary p. ${review.summary.printed}`):''}${bookLink('assets/'+bookFiles[review.file],review.questions.physical,`Open questions p. ${review.questions.printed}`)}<a class="text-link" href="#${route}" data-pilot2-return-route="${route}" data-pilot2-return-focus="${firstQuestion.id}">Go to the course questions</a></p><div class="textbook-review-reveal"><button class="button button--secondary" type="button" data-p2-textbook-group-attempt aria-expanded="false">I attempted the textbook review</button><span>The comparison guide opens after you confirm an attempt.</span></div><details data-p2-textbook-group-guide hidden><summary>Check your work</summary><p>Authored comparison notes for the selected questions. This is not a teacher-only answer key.</p>${review.guides.map(([title,text]:string[])=>`<section><h3>${h(title)}</h3><p>${h(text)}</p></section>`).join('')}</details></section>`);
  }
  if(route==='a-review-seminar')$('.review-orientation').append(`<p class="resource-links">${bookLink('assets/'+bookFiles[0],28,'Open Chapter 1 summary · p. 29')}${bookLink('assets/'+bookFiles[2],23,'Open Chapter 2 summary · p. 63')}</p>`);
  if(route==='a-core-vocabulary')for(const family of a.input.vocabulary.conceptFamilies){
   const panel=$(`[data-p2-family-panel="${family.id}"]`),target=familyTargets.get(family.id)!,topic=a.input.contract.topics.find(t=>t.id===target.route)!;
   const reading=support.familyReadings[family.id];if(!reading)throw Error('Missing family reading '+family.id);
   panel.find('.resource-links').html(`<a class="text-link" href="#${topic.id}" data-pilot2-return-route="${topic.id}" data-pilot2-return-focus="${target.id}">See it in Lesson ${a.input.contract.topics.indexOf(topic)+1}</a>${bookLink('assets/'+bookFiles[reading.file],reading.physical,`Textbook p. ${reading.printed}`)}`);
   panel.find('.p2-family-content>section').filter((_,n)=>$(n).children('h3').text()==='Retrieve the idea').addClass('retrieval-mini');
  }
  for(const term of a.input.vocabulary.introducedTerms){
   const dest=destinations.get(term.id)!;
   if(route==='a-glossary')$('[data-pilot2-glossary-term]').filter((_,n)=>$(n).attr('data-pilot2-glossary-term')===term.term).find('a').attr('data-pilot2-return-focus',dest.id).addClass('text-link').text('See this term in its lesson');
   $('.lesson-term-row').filter((_,n)=>$(n).find('dt').text()===term.term).find('a').first().attr('data-pilot2-return-focus',dest.id).addClass('text-link');
  }
  if(route==='a-textbook'){
   $('.library-panel').each((i,n)=>{const panel=$(n);panel.find('h2').attr('id',`a-book-${i}-title`).attr('tabindex','-1');panel.find('iframe').attr('data-p2-book-base',`assets/${bookFiles[i]}`).attr('src',`assets/${bookFiles[i]}#page=1&zoom=page-width`);panel.find('.library-panel-header').append('<p data-p2-book-location>Open at the beginning of this source PDF.</p>');});
  }else{
   $('a[href*="textbook-chapter-"]').each((_,n)=>{const link=$(n),href=link.attr('href')!,i=bookFiles.findIndex(f=>href.includes(f)),physical=Number(href.match(/#page=(\d+)/)?.[1]??1);if(i<0||!Number.isInteger(physical))throw Error('Invalid textbook destination');link.attr('data-p2-open-book',`a-book-${i}`).attr('data-p2-book-page',String(physical)).attr('data-pilot2-return-route','a-textbook').attr('data-pilot2-return-focus',`a-book-${i}-title`).attr('href','#a-textbook').removeAttr('target').addClass('text-link');});
  }
  page.html=$.html();
 }
 return {videos:videos.length,termDestinations:[...destinations]};
}

// A Pilot 2 uses a centered reading measure, including on wide desktop displays.
export const UNIT_A_PARITY_CSS=`
.main .course-frame,body.sidebar-collapsed .main .course-frame{max-width:1120px;margin-left:auto;margin-right:auto}
.p2-topic .resource-links a.text-link,.p2-topic a.text-link{font-weight:800}
.p2-topic [data-p2-reading-target]{scroll-margin-top:100px}
.p2-topic .resource-links{gap:18px;flex-wrap:wrap}
.library-panel-header{flex-wrap:wrap}.library-panel-header>[data-p2-book-location]{flex-basis:100%}
.p2-topic .library-tabs button{border:1px solid #aeb8af;padding:8px 13px;background:#fff}
.p2-topic .library-tabs button[aria-selected=true]{border-color:var(--teal);background:#e8f3ef}
@media(max-width:760px){.main .course-frame{max-width:100%}}
`;
