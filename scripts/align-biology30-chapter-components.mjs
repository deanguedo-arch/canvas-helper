import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';

const reference=load(fs.readFileSync('projects/biology30-unit-a-pilot-3/workspace/index.html','utf8'));
const referenceWords=JSON.parse(reference('#pilot3-words').text()).data.words;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readerRuntime=fs.readFileSync('scripts/lib/biology30-chapters/component-reader.js','utf8');
const componentCss=fs.readFileSync('scripts/lib/biology30-chapters/components.css','utf8');
for(const chapter of [12,13]){
  const dir=`projects/biology30-chapter-${chapter}/workspace`;
  const $=load(fs.readFileSync(`${dir}/index.html`,'utf8'));
  const data=JSON.parse($('#course-data').text());
  for(const w of data.words){const match=referenceWords.find(r=>r.term.toLowerCase()===w.term.toLowerCase());if(match)w.whatItDoes=match.whatItDoes;}
  $('#course-data').text(JSON.stringify(data));
  $('.nav-number').each((i,e)=>$(e).text(`${Number($(e).text())}.`));
  $('[id^="lesson-"] .eyebrow').first();
  $('[id^="lesson-"] > .p2-topic > .page-header > .eyebrow').text(`Learn · Chapter ${chapter}`);
  $('[id^="lesson-"] .terms-line button').removeClass('bio-term');
  // Convert only lesson prose term occurrences: never alter answer fields or source keys.
  const names=data.words.map(w=>({name:w.term,id:w.id})).sort((a,b)=>b.name.length-a.name.length);
  for(const section of $('[id^="lesson-"] [data-teaching], [id^="lesson-"] .content-section').toArray()){
    if($(section).hasClass('review-instructions'))continue;
    const seen=new Set();
    const walk=node=>{for(const child of [...(node.children??[])]){
      if(child.type==='text'){
        const text=child.data;let result='',last=0;
        const pattern=new RegExp(`(?<![\\p{L}\\p{N}_])(${names.map(w=>w.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})(?![\\p{L}\\p{N}_])`,'giu');
        for(const m of text.matchAll(pattern)){const w=names.find(w=>w.name.toLowerCase()===m[0].toLowerCase());if(seen.has(w.id))continue;seen.add(w.id);result+=esc(text.slice(last,m.index))+`<button type="button" class="bio-term" data-term-id="${w.id}">${esc(m[0])}</button>`;last=m.index+m[0].length;}
        if(last)$(child).replaceWith(result+esc(text.slice(last)));
      }else if(child.type==='tag'&&!['a','button','nav','summary','label','input','textarea','select','script','style','h1','h2','h3','fieldset'].includes(child.name))walk(child);
    }};walk(section);
  }
  $('.terms-line').addClass('lesson-term-strip');
  $('.vocab-help>summary').text('Vocabulary help');
  $('[id^="lesson-"] .textbook-band').each((i,e)=>{const link=$(e).find('[data-open-pdf]'),first=link.attr('data-open-pdf');const pages=$(e).text().match(/pp?\.\s*(\d+(?:[–-]\d+)?)/)?.[1]??first;$(e).html(`<div><p class="section-label">In the textbook</p><p><strong>Chapter ${chapter} · ${pages.includes('–')||pages.includes('-')?'pp.':'p.'} ${pages}</strong></p></div><a class="text-link" href="#textbook-library" data-open-pdf="${first}">Open at p. ${first}</a>`);});
  $('[id^="lesson-"] .page-guide>summary').each((i,e)=>{if(!$(e).text().includes('Textbook →'))$(e).append(' — Textbook → lesson → required check → finish');});
  const vocab=$('#core-vocabulary .p2-topic');
  const filters=vocab.find('.vocabulary-filters').closest('.content-section');
  const frayers=vocab.find('.frayer-section').remove();
  filters.find('.vocabulary-grid').remove();
  const nav=data.lessons.map((l,i)=>{const words=data.words.filter(w=>w.lesson===i+1);return words.length?`<section class="word-category"><h2>${esc(l.title)}</h2>${words.map(w=>`<button type="button" class="text-link" data-biology-select-word="${w.id}" data-word-card="${w.id}">${esc(w.term)}<small>Reference available</small></button>`).join('')}</section>`:'';}).join('');
  vocab.append(`<div class="vocabulary-layout" data-biology-word-reader><nav class="vocabulary-index" aria-label="Vocabulary topics and words">${nav}</nav><div class="vocabulary-reader"><article data-biology-word-details></article><div data-word-frayer-home></div></div></div>`);
  vocab.find('[data-word-frayer-home]').append(frayers);
  const lo=chapter===12?404:434,hi=chapter===12?433:471,title=chapter===12?'Sensory Reception':'Hormonal Regulation of Homeostasis';
  const book=$('#textbook-library .p2-topic');book.find('.content-section').remove();
  const guide=reference('#textbook-library .page-guide').clone();guide.find('[data-canvas-helper-edit-key]').removeAttr('data-canvas-helper-edit-key');book.append(guide);
  book.append(`<div class="content-section"><h2>Chapter ${chapter} · ${title}</h2><p>${data.pdfPages} PDF pages · printed pp. ${lo}–${hi}</p><p><a data-library-fullscreen href="assets/textbook/chapter-${chapter}.pdf" target="_blank" rel="noopener">Open chapter full screen</a> · <a data-library-download href="assets/textbook/chapter-${chapter}.pdf" download>Download chapter</a></p><iframe data-library-textbook title="Chapter ${chapter} textbook" src="assets/textbook/chapter-${chapter}.pdf#page=1" style="width:100%;height:72vh;border:1px solid var(--border)"></iframe></div>`);
  fs.mkdirSync(`${dir}/assets/textbook`,{recursive:true});
  fs.writeFileSync(`${dir}/assets/textbook/chapter-${chapter}.pdf`,Buffer.from($('#textbook-data').text().trim(),'base64'));
  let runtime=fs.readFileSync(`${dir}/main.js`,'utf8');
  runtime=runtime.replace(/function openWord\(id\)\{[^\n]*\}/,`function openWord(id){showVocabularyPopup(id);}`);
  runtime=runtime.replace(/function filterVocabulary\(\)\{[^\n]*\}/,`function filterVocabulary(){filterWordIndex();}`);
  runtime=runtime.replace(/openDialog\(`Chapter \$\{C.chapter\} textbook[^\n]+/,'openDialog(`Textbook page ${printed}`,`<iframe class="embedded-pdf" title="Chapter ${C.chapter} textbook at printed page ${printed}" src="${src}"></iframe><div class="textbook-dialog-actions"><a href="${src}" target="_blank" rel="noopener">Open this page in a new window</a></div>`,\'pdf-dialog textbook-dialog\'); const subtitle=document.createElement(\'p\');subtitle.className=\'textbook-subtitle\';subtitle.textContent=`Chapter ${C.chapter}: PDF page ${physical} of ${C.pdfPages}`;$(\'#dialog-title\').after(subtitle);');
  runtime=runtime.replace("dialog.addEventListener('close',()=>{", "dialog.addEventListener('close',()=>{restoreFrayerHome();$$('.textbook-subtitle',dialog).forEach(e=>e.remove());");
  runtime=runtime.replace(/\n\}\)\(\);\s*$/,()=>`\n${readerRuntime}\n})();\n`);
  fs.writeFileSync(`${dir}/main.js`,runtime);
  fs.writeFileSync(`${dir}/index.html`,$.html());
  fs.appendFileSync(`${dir}/styles.css`,'\n'+componentCss);
  // Portable output is derived from the canonical workspace, with its textbook embedded.
  $('link[rel="stylesheet"]').remove();$('head').append(`<style>${fs.readFileSync(`${dir}/styles.css`,'utf8')}</style>`);
  $('script[src="./main.js"]').remove();$('body').append(`<script>${runtime}</script>`);
  fs.writeFileSync(`${dir}/Biology30_Chapter${chapter}.html`,$.html());
  console.log(`Chapter ${chapter}: reader, contextual terms, textbook components and navigation aligned.`);
}
