import {load} from 'cheerio';
import {adaptTopicHubs} from '../biology30-course/v1/pilot2-a-hubs.js';
import {topicHtml as h} from '../biology30-course/v1/pilot2-render-common.js';
import type {loadBiology20UnitA} from './unit-a-inputs.js';

/** Supply the established Biology 30 hub hierarchy without changing activity/state identities. */
export function presentUnitAHubs(a:Awaited<ReturnType<typeof loadBiology20UnitA>>,pages:Map<string,{title:string;html:string}>,books:{file:string;title:string;pages:string}[]){
 for(const [id,page] of pages){
  const $=load(page.html,null,false);
  $('.p2-topic').each((_i,node)=>{
   const body=$(node),heading=body.children('h1').first();
   if(!heading.length)return;
   const label=/practice|seminar/.test(id)?'Practice & Review':/models|investigations|work|notes|advanced/.test(id)?'Process Collection':'Resources';
   const intro=heading.next('p'),header=$(`<header class="page-header"><p class="eyebrow">${label}</p></header>`);
   heading.before(header);header.append(heading);if(intro.length)header.append(intro);
   if(!/-(models|investigations)$/.test(id))body.children().not(header).wrapAll('<section class="collection-section p2-unpadded"></section>');
   else{
    const panels=body.children('section'),nav=$('<nav aria-label="Choose an activity"></nav>'),reader=$('<div class="p2-hub-reader"></div>'),layout=$('<div class="p2-hub-layout" data-p2-hub></div>');
    for(const panel of panels.toArray()){const p=$(panel),target=p.attr('id')!;p.attr('data-p2-panel','').attr('hidden','');nav.append(`<button type="button" data-p2-panel-target="${h(target)}">${h(p.find('h2,h3').first().text())}</button>`);reader.append(p);}
    header.append(body.children('p'));layout.append(nav,reader);body.append(layout);
   }
  });
  if(id==='a-textbook'){
   const body=$('.p2-topic');body.children('.collection-section').remove();
   body.append(`<div class="p2-hub-layout p2-textbook-layout" data-p2-hub><nav>${books.map((b,i)=>`<button type="button" data-p2-panel-target="a-book-${i}">${h(b.title)}</button>`).join('')}</nav><div class="p2-hub-reader">${books.map((b,i)=>`<section id="a-book-${i}" data-p2-panel hidden><h2>${h(b.title)}</h2><p class="resource-links"><a href="assets/${h(b.file)}#page=1" target="_blank" rel="noopener">Open PDF · printed pages ${h(b.pages)}</a></p><p>Supporting reading, not additional required physical or group tasks. Use the system boundaries and limitations developed in the lessons.</p><iframe class="library-frame" title="${h(b.title)}" src="assets/${h(b.file)}#page=1" loading="lazy"></iframe></section>`).join('')}</div></div>`);
  }
  if(id==='a-core-vocabulary'){
   $('[data-p2-vocabulary-filter] option[value="all"]').attr('selected','');
   $('.page-header>p').eq(1).text('Browse all 35 terms in 10 concept families. Meanings are available in the term list below; begin the related lesson to unlock its Frayer. Six anchors plus two choices share the same saved work as the in-lesson panel.');
   $('.vocabulary-tools').after('<p class="collection-section"><a href="#a-glossary" data-page-target="a-glossary">Browse all 35 terms and definitions in Glossary and Data</a></p>');
   for(const family of a.input.vocabulary.conceptFamilies){
    // Reference explanations are available before a lesson; only Frayer work is gated.
    const panel=$(`[data-p2-family-panel="${family.id}"]`),content=panel.find('[data-p2-family-content]');
    const reference=$('<div class="p2-family-content" data-p2-family-reference></div>');
    reference.append(content.children().not('.frayer'));
    panel.find('[data-p2-family-locked]').before(reference);
    panel.find('[data-p2-family-locked]>p').last().text('Begin this lesson to unlock the Frayer tools. The reference explanations above are available now.');
    const terms=family.termIds.map(id=>a.input.vocabulary.introducedTerms.find(t=>t.id===id)!).filter(Boolean);
    $(`[data-p2-family-target="${family.id}"]`).append(`<small>${terms.map(t=>h(t.term)).join(' · ')}</small>`);
    $(`[data-p2-family-panel="${family.id}"]>h2`).after(`<details class="family-term-definitions"><summary>${terms.length} terms and meanings</summary><dl>${terms.map(t=>`<div><dt><strong>${h(t.term)}</strong></dt><dd>${h(t.definition)}</dd></div>`).join('')}</dl></details>`);
   }
  }
  if(id==='a-glossary')$('.collection-section>label').append($('[data-pilot2-glossary-status]'));
  if(id==='a-sources-and-credits'){
   const content=$('.collection-section');content.removeClass('collection-section p2-unpadded').addClass('source-list');
   content.children('p').each((i,p)=>{$(p).wrap('<article></article>');$(p).before(`<h2>${['Illustrations and data','Review boundaries','Fonts'][i]}</h2>`);});
  }
  page.html=$.html();
 }
 adaptTopicHubs({topic:a.input,models:a.integrated.models,seminar:a.integrated.seminar,textbookGroups:[],videos:[]},pages,{preserveSources:true,standaloneWork:true,omitDiploma:true});
}
