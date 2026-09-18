/* Idempotent mechanical integration of the shared practice shell and manifests.
 * Does not regenerate lessons, labeling banks, vocabulary or existing activities. */
import fs from 'node:fs';
import {load} from 'cheerio';
import postcss from 'postcss';
// Use Chemistry's actual component rules, scoped so Biology's shell is intact.
const reference=postcss.parse(fs.readFileSync('projects/chemistry30-unit-a-pilot/workspace/styles.css','utf8'));
const allowed=/^\.(?:book-(?:controls|question-list|page-questions|question-header|question-captures|capture-actions|question-capture|answer-workspace)|button|text-link|actions|page-guide|note|field-label)(?:\b|[.:#[ >])/;
reference.walkRules(rule=>{const selectors=rule.selectors.filter(s=>allowed.test(s));if(!selectors.length)rule.remove();else rule.selectors=selectors.map(s=>'#textbook-practice#textbook-practice '+s);});
reference.walkAtRules(at=>{if(at.name!=='media'||!at.nodes||!at.nodes.length)at.remove();});
const referenceCSS='\n/* Chemistry reference component rules, scoped to this page. */\n'+reference.toString();
const slugs={11:'biology30-unit-a-pilot-3',12:'biology30-chapter-12',13:'biology30-chapter-13'};
const topicMaps=JSON.parse(fs.readFileSync('scripts/lib/biology30-chapters/textbook-topics.json','utf8'));
for(const [c,slug] of Object.entries(slugs)){
 const chapter=Number(c),dir=`projects/${slug}/workspace`,manifest=JSON.parse(fs.readFileSync(`${dir}/assets/textbook-practice/manifest.json`,'utf8'));
 const $=load(fs.readFileSync(`${dir}/index.html`,'utf8'));
 const lessons=$('.course-page[id^="lesson-"]').filter((i,e)=>/^lesson-\d\d$/.test($(e).attr('id')));
 for(const q of manifest.questions){const mapping=topicMaps[c][`${q.group}@${q.page}`]||topicMaps[c][q.group];if(!mapping)throw Error(`Missing topic group: ${q.id}`);q.topics=Object.entries(mapping).filter(([topic,numbers])=>numbers.includes(q.number)).map(([topic])=>'lesson-'+topic.padStart(2,'0'));if(!q.topics.length)throw Error(`Unmapped question: ${q.id}`);}
 manifest.topics=lessons.map((i,e)=>({id:$(e).attr('id'),label:$(e).find('h1').first().text()})).get().filter(t=>manifest.questions.some(q=>q.topics.includes(t.id)));
 fs.writeFileSync(`${dir}/assets/textbook-practice/manifest.json`,JSON.stringify(manifest));fs.writeFileSync(`projects/${slug}/meta/textbook-practice-manifest.json`,JSON.stringify(manifest,null,2)+'\n');
 if(!$('#textbook-practice').length){
  $('nav.course-nav .nav-group').filter((i,e)=>$(e).children('summary').text().includes('Practice')).find('.nav-links').append('<a class="nav-link" href="#textbook-practice">Textbook Practice</a>');
  $('#process-collection').before(`<section class="course-page" id="textbook-practice" hidden data-textbook-practice>
   <header class="page-header"><p class="eyebrow">Practice &amp; Review</p><h1>Textbook Practice</h1><p>Use the original Chapter ${chapter} questions to explain your thinking, draw diagrams and work with supplied data. This optional practice does not affect required chapter-check progress.</p>
   <details class="page-guide"><summary>How to use Textbook Practice</summary><ol>
   <li><strong>Choose a question.</strong> Use the question menu. Questions are grouped by their textbook page and question group. “Not started”, “Draft” and “Saved” describe your work, not whether your answer is correct.</li>
   <li><strong>Read the original question.</strong> Find the selected question number on the image. Answer all its lettered parts. Other questions on the same page are context, not extra work for this response. Reference pages are included below when needed. Select Enlarge question to zoom, or See full textbook page.</li>
   <li><strong>Write or draw your response.</strong> Type your explanation in your own words. For a drawing, graph or table, work on paper and follow your teacher’s submission instructions. Include labels, units and every required part. Use only supplied diagrams or data for analysis activities; do not perform the investigation procedures shown on a source page.</li>
   
   <li><strong>Save when ready.</strong> Writing drafts autosave. Select Save question work to mark your current writing Saved. An edit changes the status back to Draft. Saving is ungraded: it does not check correctness, reveal answers or provide a score.</li>
   <li><strong>Continue or keep a copy.</strong> Use Previous / Next, or choose another question. Find your writing in All My Work. You can print or save that page as a PDF.</li>
   </ol><p><strong>Expected work:</strong> complete the questions your teacher assigns, or choose questions you need to practise. You do not need to complete this optional page to finish the chapter.</p></details></header>
   <div class="content-section"><label for="book-question-picker">Choose a textbook question</label><select id="book-question-picker" data-book-picker></select><h2 data-book-title tabindex="-1"></h2><p>Question work: <strong data-book-question-state>Not started</strong> · Ungraded</p>
   <div class="book-actions"><button type="button" data-book-prev>Previous</button><button type="button" data-book-next>Next</button><button type="button" data-book-enlarge>Enlarge question</button><button type="button" data-book-fullpage>See full textbook page</button></div><div data-book-images></div>
   <label for="book-written-response">Your written response (include question-part letters)</label><textarea id="book-written-response" data-book-text></textarea>
   <div data-book-photos></div><div class="book-actions"><button type="button" data-book-save>Save question work</button></div>
   <div data-book-remove-confirm hidden role="group" aria-label="Confirm photo removal"><p>Remove this photo from this question? Your writing and other photos will remain.</p><div class="book-actions"><button type="button" data-book-confirm-remove>Remove photo</button><button type="button" data-book-cancel-remove>Keep photo</button></div></div><p data-book-status aria-live="polite"></p></div></section>`);
  $('#process-collection').append('<div class="content-section"><h2>Textbook question work</h2><p>Draft and saved question responses. Optional and ungraded.</p><div data-textbook-work data-canvas-helper-studio-edit="annotation-only"></div></div>');
  $('body').append('<dialog data-book-enlarge-dialog aria-label="Enlarged textbook question or photo"><button type="button" data-book-enlarge-close>Close</button><p>Scroll to read the enlarged original image.</p><div data-book-enlarge-images></div></dialog>');
 }
 $('#textbook-practice-data').remove();$('script[src="./main.js"],script[src*="pilot3-runtime"]').first().before(`<script type="application/json" id="textbook-practice-data">${JSON.stringify(manifest)}</script>`);
 if(!$('[data-book-question-grid]').length)$('[data-book-picker]').after('<div class="book-question-grid" data-book-question-grid aria-label="Textbook questions grouped by page"></div>');
 $('.book-picker-help').remove();$('[data-book-picker]').before('<span class="book-picker-help">Choose a question below. Its original textbook image appears above your work.</span>');
 $('[data-book-picker]').prev('label').remove();
 $('[data-book-picker]').attr('hidden','');$('label[for="book-question-picker"]').attr('hidden','');
 $('#textbook-practice .page-guide li').first().html('<strong>Choose a question.</strong> Select a question tile below. Questions are grouped by textbook page and question group. “Not started”, “Draft” and “Saved” describe your work, not whether your answer is correct.');
 const guide=$('#textbook-practice .page-guide summary');if(guide.text()==='How to use Textbook Practice')guide.html('<strong>How to use Textbook Practice</strong> — Choose a question → respond → add photos if needed → save');
 $('#textbook-practice').attr('data-testid','textbook-practice');$('[data-book-question-grid],[data-book-images],[data-book-photos]').attr('data-canvas-helper-studio-edit','annotation-only');
 $('#textbook-practice .page-header h1,#textbook-practice .page-guide li,#textbook-practice .page-guide summary').each((i,e)=>{if(!$(e).attr('data-canvas-helper-edit-key'))$(e).attr('data-canvas-helper-edit-key',`ch${chapter}-textbook-guide-${i}`);});
 const photoDialog=$.html($('[data-book-enlarge-dialog]'));$('[data-book-enlarge-dialog]').remove();$('script[src="./main.js"],script[src*="pilot3-runtime"]').first().before(photoDialog);
 // Chemistry renderBook/renderBookWork topology with Biology content/adapters.
 const page=$('#textbook-practice'),content=page.children('.content-section').first();
 page.addClass('biology-book-reference');page.find('.page-guide').addClass('page-guide--support').insertBefore(content);page.find('.page-guide summary').html('<strong>How to complete textbook practice</strong><span>choose question → read → show your process → save</span>');
 if(!page.find('.book-introduction').length)content.before('<p class="book-introduction">Select a question from its textbook page group. Read the captured question above your work. A numbered question may have several subparts: label them in your response. Save your writing for review; these responses are not automatically marked.</p><aside class="note book-source-note"><strong>Use the source critically</strong><p>Use the supplied figures and data for paper-based analysis. Do not perform investigation procedures shown in the scans or invent experimental observations. Follow your teacher’s current instructions.</p></aside>');
 page.find('.book-picker-help').remove();
 if(!page.find('.book-controls').length)content.prepend(`<div class="book-controls"><label for="book-chapter">Choose chapter<select id="book-chapter"><option>Chapter ${chapter} · ${manifest.questions.length} questions</option></select></label><p class="small">Choose a question below. Its textbook image appears above your work.</p></div>`);
 page.find('.book-controls label').html('<span>Choose a topic</span><select id="book-chapter" data-book-topic></select>');page.find('.book-controls p').text('Choose a topic, then a question below. Questions covering several topics share the same saved work.');
 page.find('.page-guide li').first().html('<strong>Choose a topic.</strong> Select a lesson topic to narrow the question tiles, All chapter questions to see everything, or Chapter review — mixed topics for the final review. Then choose a question from its page group. Only topics with matching textbook questions are listed.');
 page.find('[data-book-question-grid]').attr('class','book-question-list');
 if(!page.find('.book-question-header').length){const title=page.find('[data-book-title]'),state=page.find('[data-book-question-state]').parent();title.before('<header class="book-question-header"><div class="book-selected-title"></div><div class="actions"></div></header>');const head=page.find('.book-question-header');head.find('.book-selected-title').append(title,state);head.find('.actions').append(page.find('[data-book-prev]'),page.find('[data-book-next]'));state.html('<span data-book-position></span><span data-book-question-state>Not started</span>').addClass('small');}
 page.find('[data-book-prev]').text('Previous question');page.find('[data-book-next]').text('Next question');
 if(!page.find('.book-question-captures').length){page.find('[data-book-images]').before('<section class="book-question-captures" aria-label="Textbook question"><div class="book-capture-actions"><p class="small">Answer every part of the question below.</p><div class="actions"></div></div></section>');const captures=page.find('.book-question-captures');captures.find('.actions').append(page.find('[data-book-enlarge]'),page.find('[data-book-fullpage]'));captures.append(page.find('[data-book-images]'));}
 page.find('[data-book-prev],[data-book-next],[data-book-enlarge]').attr('class','button secondary');page.find('[data-book-fullpage]').attr('class','text-link');page.find('.book-actions').filter((i,e)=>!$(e).children().length).remove();
 page.find('label[for="book-written-response"]').addClass('field-label');
 if(!$('link[href="./assets/textbook-practice.css"]').length)$('head').append('<link rel="stylesheet" href="./assets/textbook-practice.css">');
 fs.writeFileSync(`${dir}/assets/textbook-practice.css`,fs.readFileSync('scripts/lib/biology30-chapters/textbook-practice.css','utf8')+referenceCSS);
 $('#textbook-practice-runtime').remove();$('#brightspace-photo-runtime').remove();
 if(chapter!==11){
  fs.copyFileSync('scripts/lib/biology30-chapters/brightspace-photo-store.js',`${dir}/assets/brightspace-photo-store.js`);
  $('script[src="./assets/brightspace-photo-store.js"],script[src="assets/brightspace-photo-store.js"]').remove();
  $('script[src="./main.js"]').before('<script id="brightspace-photo-runtime" src="./assets/brightspace-photo-store.js"></script>');
  fs.copyFileSync('scripts/lib/biology30-chapters/textbook-practice.js',`${dir}/assets/textbook-practice.js`);
  $('script[src="./main.js"]').before('<script id="textbook-practice-runtime" src="./assets/textbook-practice.js"></script>');
  const path=`${dir}/main.js`;let js=fs.readFileSync(path,'utf8');
  const adapter=`window.mountBiologyTextbookPractice({chapter:C.chapter,read:()=>S.textbookWork||{},write:async(id,record)=>{if(!change(next=>{(next.textbookWork??={})[id]=record;}))throw Error('Chapter response storage failed.');}});\n`;
  js=js.replace(adapter,'');
  const boot=js.indexOf("renderAllChecks();['flash'");if(boot<0)throw Error('Chapter boot marker not found');js=js.slice(0,boot)+adapter+js.slice(boot);
  fs.writeFileSync(path,js);
 }
 // Link every lesson to its first relevant printed-page question group.
 $('.textbook-practice-lesson-link').remove();lessons.each((i,e)=>{const id=$(e).attr('id'),topic=manifest.topics.find(t=>t.id===id);const isReview=$(e).find('h1').first().text().toLowerCase().includes('review');if(!topic&&!isReview)return;$(e).find('.content-section').last().append(`<p class="textbook-practice-lesson-link"><a href="#textbook-practice" data-textbook-topic="${isReview?'chapter-review':id}">Optional textbook practice for ${isReview?'chapter review':topic.label}</a></p>`);});
 let html=$.html();
 // Cheerio must not flatten the chapter's existing empty-response formatting.
 const original=fs.readFileSync(`${dir}/index.html`,'utf8');for(const match of original.matchAll(/(<textarea\b[^>]*>)\n<\/textarea>/g))html=html.replace(match[1]+'</textarea>',match[0]);
 fs.writeFileSync(`${dir}/index.html`,html);
 const metaPath=`projects/${slug}/meta/project.json`,meta=JSON.parse(fs.readFileSync(metaPath,'utf8'));
 for(const path of ['scripts/lib/biology30-chapters/brightspace-photo-store.js','scripts/lib/biology30-chapters/textbook-practice.js','scripts/lib/biology30-chapters/textbook-practice.css','scripts/lib/biology30-chapters/textbook-topics.json','scripts/render-biology30-textbook-practice.py'])if(!meta.canonicalSources.includes(path))meta.canonicalSources.push(path);
 const component={id:'optional-textbook-practice',status:'active',source:'scripts/lib/biology30-chapters/textbook-practice.js',manifest:`projects/${slug}/meta/textbook-practice-manifest.json`,notes:'Optional ungraded records use the existing chapter save owner. Photos are browser-local IndexedDB only; print/PDF is the portable record. No change to required progress or older save IDs.'};
 meta.injectedComponents??=[];meta.injectedComponents=meta.injectedComponents.filter(x=>x.id!==component.id);meta.injectedComponents.push(component);fs.writeFileSync(metaPath,JSON.stringify(meta,null,2)+'\n');
}
