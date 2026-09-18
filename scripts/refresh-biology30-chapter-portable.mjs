import fs from 'node:fs';
import {load} from 'cheerio';
for(const c of [12,13]){
 const dir=`projects/biology30-chapter-${c}/workspace`;
 let js=fs.readFileSync(`${dir}/main.js`,'utf8');
 const marker='// Uses the existing chapter word IDs, state and Frayer controls.';
 if(js.includes(marker))js=js.slice(0,js.indexOf(marker))+fs.readFileSync('scripts/lib/biology30-chapters/component-reader.js','utf8')+'\n})();\n';
 js=js.replace(/\$+\('\.textbook-subtitle',dialog\)\.forEach/g,()=>"$$('.textbook-subtitle',dialog).forEach");
 fs.writeFileSync(`${dir}/main.js`,js);
 const $=load(fs.readFileSync(`${dir}/index.html`,'utf8'));
 if(!$('.chapter-overview').length){
  const chapterOverview={
   12:`<div class="content-section chapter-overview"><h2>How your sensory systems work</h2><p>Sensory receptors detect changes in the environment and inside the body, convert those stimuli into neural signals, and send information through pathways the brain can interpret.</p><h3>By the end of this chapter, I can:</h3><ul class="chapter-outcomes"><li>I can explain how sensory receptors detect and transduce stimuli and how adaptation changes sensation.</li><li>I can trace the path of light through the eye to the retina and explain how rods and cones support vision.</li><li>I can explain how the ear turns vibration into neural information and supports balance.</li><li>I can compare how taste, smell, touch and temperature provide information about the environment.</li><li>I can trace a sensory pathway and explain what changes when one part of the pathway is disrupted.</li></ul><p>Work through the topics, complete the required checks, and use the figures and practice activities to review. Your saved responses and vocabulary work are in Process Collection.</p><a class="button" href="#lesson-01">Begin Topic 1</a></div>`,
   13:`<div class="content-section chapter-overview"><h2>How hormonal regulation works</h2><p>Hormones connect a change inside the body with a response somewhere else. Follow each messenger from its source to its target, then explain how feedback helps regulate the original change.</p><h3>By the end of this chapter, I can:</h3><ul class="chapter-outcomes"><li>I can explain how hormones and target cells communicate to change cell activity.</li><li>I can trace a feedback loop from a regulated variable through its control centre, hormone and target response.</li><li>I can explain how the hypothalamus and pituitary coordinate growth, water balance and other endocrine pathways.</li><li>I can compare endocrine responses involving thyroid hormones, calcium regulation, stress hormones and blood glucose.</li><li>I can predict how a disruption in one part of a pathway changes hormone levels and symptoms.</li></ul><p>Work through the topics, complete the required checks, and use the figures and practice activities to review. Your saved responses and vocabulary work are in Process Collection.</p><a class="button" href="#lesson-01">Begin Topic 1</a></div>`
  };
  $('.overview-intro').before(chapterOverview[c]);
 }
 if($('.chapter-overview').length) $('.overview-intro').before($('.chapter-overview'));
 $('.content-section h2').filter((i,el)=>$(el).text().trim()==='What counts as finished?').closest('.content-section').find('div p').filter((i,el)=>$(el).text().trim().startsWith('Offline use:')).remove();
 $('.terms-line [data-term-id]').addClass('text-link');
 const data=JSON.parse($('#course-data').text());
 for(const w of data.words){if(w.whatItDoes)continue;
  const text=$(`#lesson-${String(w.lesson).padStart(2,'0')} .content-section p`).map((i,e)=>$(e).text()).get().join(' ');
  const sentence=text.split(/(?<=[.!?])\s+/).find(s=>s.toLowerCase().includes(w.term.toLowerCase())&&s.length<500);
  w.whatItDoes=sentence||w.example;
 }
 $('#course-data').text(JSON.stringify(data));
 fs.writeFileSync(`${dir}/index.html`,$.html());
 let css=fs.readFileSync(`${dir}/styles.css`,'utf8');
 const cssMarker='/* Exact reference component geometry with the imported chapter\'s existing state owner. */';
 if(css.includes(cssMarker))css=css.slice(0,css.indexOf(cssMarker));
 css+='\n'+fs.readFileSync('scripts/lib/biology30-chapters/components.css','utf8');
 fs.writeFileSync(`${dir}/styles.css`,css);
 $('link[rel="stylesheet"]').remove();$('head').append(`<style>${fs.readFileSync(`${dir}/styles.css`,'utf8')}</style>`);
 if(fs.existsSync(`${dir}/assets/textbook-practice.css`))$('head').append(`<style>${fs.readFileSync(`${dir}/assets/textbook-practice.css`,'utf8')}</style>`);
 if($('#textbook-practice-data').length){const book=JSON.parse($('#textbook-practice-data').text());const embed=src=>'data:image/jpeg;base64,'+fs.readFileSync(`${dir}/${src.slice(2)}`).toString('base64');for(const page of Object.values(book.pages))page.src=embed(page.src);for(const q of book.questions)for(const crop of q.crops)if(crop.src)crop.src=embed(crop.src);$('#textbook-practice-data').text(JSON.stringify(book));$('#textbook-practice-runtime').remove();$('body').append(`<script>${fs.readFileSync('scripts/lib/biology30-chapters/textbook-practice.js','utf8')}</script>`);}
 const portableData=JSON.parse($('#course-data').text());
 for(const diagram of portableData.labelDiagrams){if(diagram.src.startsWith('./assets/labeling/'))diagram.src='data:image/png;base64,'+fs.readFileSync(`${dir}/${diagram.src.slice(2)}`).toString('base64');}
 $('script[src="./assets/brightspace-photo-store.js"],script[src="assets/brightspace-photo-store.js"]').remove();$('body').append(`<script>${fs.readFileSync('scripts/lib/biology30-chapters/brightspace-photo-store.js','utf8')}</script>`);
 $('#course-data').text(JSON.stringify(portableData));
 for(const name of ['revision-practice','revision-activities'])if(fs.existsSync(`${dir}/assets/${name}.js`)){$(`script[src="./assets/${name}.js"]`).remove();$('body').append(`<script>${fs.readFileSync(`${dir}/assets/${name}.js`,'utf8')}</script>`);}
 $('script[src="./main.js"]').remove();$('body').append(`<script>${js}</script>`);
 fs.writeFileSync(`${dir}/Biology30_Chapter${c}.html`,$.html());
}
