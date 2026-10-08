import {load} from 'cheerio';
import {renderBiologyWordReader,BIOLOGY_WORD_READER_CSS} from './word-reader.js';
import {validateBiologyWordRecords,type BiologyWordRecord,type BiologyWordCategory} from './word-record.js';

export type BiologyWordPageData={words:BiologyWordRecord[];categories:BiologyWordCategory[];wordFrayers:Record<string,string>;wordRoutes?:Record<string,string>;wordTargets?:Record<string,string>;choicePolicy?:'any-eight'};
/** Preserve the owner's controls and selectors, but remove competing category explanations. */
export function renderTopicWordPage(html:string,data:BiologyWordPageData){
 validateBiologyWordRecords(data.words,data.categories);
 const $=load(html,null,false);
 for(const [wordId,familyId] of Object.entries(data.wordFrayers)){
  if(!data.words.some(w=>w.id===wordId)||!data.categories.some(c=>c.id===familyId&&c.wordIds.includes(wordId)))throw Error('Invalid explicit Frayer binding '+wordId);
 }
 if(new Set(Object.values(data.wordFrayers)).size!==Object.keys(data.wordFrayers).length)throw Error('A saved Frayer cannot silently belong to multiple words');
 const panels=$('[data-p2-family-panel]');
 const linksByFamily=new Map(panels.toArray().map(node=>[$(node).attr('data-p2-family-panel')!,$(node).find('.resource-links').first().toString()]));
 if(panels.toArray().some(n=>!data.categories.some(c=>c.id===$(n).attr('data-p2-family-panel'))))throw Error('Word/category source inventory does not match the owning page');
 const bank=$('<div data-biology-frayer-bank hidden></div>');
 bank.append($('.vocabulary-tools')).append($('.vocabulary-layout'));
 $('.p2-topic').append(bank);
 for(const panel of panels.toArray()){
  const node=$(panel),familyId=node.attr('data-p2-family-panel')!,frayer=node.find('.frayer');
  if(frayer.length!==1)throw Error('Expected one original Frayer '+familyId);
  frayer.attr('data-biology-frayer-record',familyId);
  const word=data.words.find(w=>data.wordFrayers[w.id]===familyId);
  if(!word&&data.choicePolicy!=='any-eight')throw Error('Existing Frayer has no reviewed word target '+familyId);
  const category=data.categories.find(c=>c.id===familyId)!;
  frayer.find('.frayer-heading h3').text(word?.term??category.label);
  frayer.prepend($('<p data-biology-legacy-notice></p>').text(`Earlier writing in this record was labelled “${category.label}”. It remains unchanged and has not been assigned to a different word.`));
  frayer.find('.course-model').prepend('<p>Original broader-concept comparison guide. This is retained context, not a new word-specific model answer.</p>');
  const content=node.find('[data-p2-family-content]');content.empty().append(frayer);
  node.children('h2').text(word?.term??category.label);
 }
 $('.page-header>p').first().nextAll('p').filter((_,e)=>!$(e).hasClass('vocab-progress')).remove();
 $('.page-header h1').after(data.choicePolicy==='any-eight'?'<p>Explore every word. Choose any eight words for your own saved Frayers and Process Collection. Remove a chosen word to free a slot; copy and confirm before removing written work.</p>':'<p>Select a word within a category. Every explanation below belongs to that word. Meanings are available now; saved Frayers retain their lesson unlock and six-anchor/two-choice rules.</p>');
 $('.page-header').after(renderBiologyWordReader(data.words,data.categories));
 $('[data-biology-word-view]').each((_,node)=>{
  const wordId=$(node).attr('data-biology-word-view')!;
  $(node).append('<details data-biology-word-frayer><summary>My Frayer</summary><p data-biology-word-frayer-status></p><div data-biology-word-frayer-slot></div></details>');
  const source=data.words.find(w=>w.id===wordId)!;
  // Exact return links were already resolved by the owning resource renderer.
  const links=linksByFamily.get(source.categoryIds[0]);
  const route=data.wordRoutes?.[wordId],focus=data.wordTargets?.[wordId];
  if(route&&focus){const link=$('<a>See this word in the lesson</a>').attr('href','#'+route).attr('data-pilot2-return-route',route).attr('data-pilot2-return-focus',focus);$(node).find('[data-biology-word-details]').append($('<p class="resource-links"></p>').append(link));}
  else if(links)$(node).find('[data-biology-word-details]').append(links);
 });
 const serial=JSON.stringify(data).replace(/</g,'\\u003c');
 $('.p2-topic').append(`<script type="application/json" id="biology-word-data">${serial}</script>`);
 $('.p2-topic').append(`<style>${BIOLOGY_WORD_READER_CSS}</style>`);
 return $.html();
}
