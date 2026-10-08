import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {renderBiologyWordReader,BIOLOGY_WORD_READER_CSS} from './word-reader.js';
import {validateBiologyWordRecords} from './word-record.js';
import type {BiologyWordPageData} from './word-page.js';
export function renderAWordPage(html:string,data:BiologyWordPageData){
 validateBiologyWordRecords(data.words,data.categories);
 const $=load(html),page=$('#core-vocabulary'),bank=$('<div data-biology-frayer-bank hidden></div>');
 bank.append(page.children('.vocabulary-tools,.vocabulary-layout'));
 page.append(bank);
 page.find('.page-header>p').not('.eyebrow,.vocab-progress').remove();
 page.find('.page-header h1').after('<p>Explore every word. Choose any eight words for empty saved Frayers and Process Collection. Copy and confirm before removing written work to free a slot.</p>');
 const progress=page.find('[data-vocabulary-progress]');
 progress.removeAttr('data-vocabulary-progress').attr('data-p2-vocabulary-progress','');
 bank.append('<span data-vocabulary-progress hidden></span>');
 page.find('.page-header').after(renderBiologyWordReader(data.words,data.categories));
 for(const w of data.words){
  const article=page.find('[data-biology-word-view="'+w.id+'"]');
  const category=bank.find('[data-vocabulary-entry="'+w.categoryIds[0]+'"]');
  article.append(category.find('.resource-links').first().clone());
 }
 const map={wordIds:data.words.map(w=>w.id),legacyIds:data.categories.map(c=>c.id),limit:240};
 const schema={...map,identity:createHash('sha256').update(JSON.stringify(map)).digest('hex')};
 const payload=JSON.stringify({data:{...data,choicePolicy:'any-eight',wordFrayers:{}},schema}).replace(/</g,'\\u003c');
 page.append('<script type="application/json" id="biology-word-data">'+payload+'</script><style>'+BIOLOGY_WORD_READER_CSS+'</style>');
 return $.html();
}
