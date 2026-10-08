import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import * as cheerio from 'cheerio';
import {refineWorkedExamples} from './refinements.mjs';
import {remaining} from './remaining-visuals.mjs';
import {addRelationships} from './relationships.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const workspace=path.resolve(root,'../../../workspace');
const source=process.argv[2] || '/tmp/calm-style-c-audit/CALM_Style_C_ALL_IN_ONE';
const output=path.join(root,'site');
const namespace='calm10-style-c-five-review-2026-10-06';
const raw=fs.readFileSync(path.join(workspace,'index.html'),'utf8');
const $=cheerio.load(raw);
const records=JSON.parse(fs.readFileSync(path.join(source,'COMPLETE_MANIFEST.json'),'utf8')).records;
const pilotIds=['fl1-01','fl1-03','fl2-03','fl3-03','ce1-05'];
const ids=records.map(r=>r.lesson_id);
fs.mkdirSync(output,{recursive:true});
for(const file of fs.readdirSync(workspace)){
  if(!/\.(css|js)$/.test(file))continue;
  let data=fs.readFileSync(path.join(workspace,file),'utf8');
  if(file.endsWith('.js'))data=data.replaceAll('calm10-2026-draft',namespace);
  fs.writeFileSync(path.join(output,file),data);
}
const intro={
 'fl1-01':'Use the picture to keep this pay period separate from the year-to-date totals. Follow gross pay, current deductions and the amount deposited as we check Mika’s payment below.',
 'fl1-03':'Read these graphs from left to right. Each step is a transaction, and the dashed line marks a zero balance. Compare the original timing with the confirmed split before following the calendar below.',
 'fl2-03':'Follow the first payment into the second month. Notice which part pays interest, which part reduces the debt, and how the remaining balance becomes the next opening balance.',
 'fl3-03':'Read from the outside of the diagram inward: the account arrangement supplies rules, while the holding inside supplies its own access, risk and return. Then follow why those features fit Noor’s six-month need.',
 'ce1-05':'Trace the English and Art prerequisites first, then check the elective slots and submission deadlines. Use this picture alongside the explanation and timetable below; it shows Tariq’s selected pathway, not a complete graduation audit.'
};
const desktop={'fl1-01':'final.jpg','fl1-03':'final.png','fl2-03':'final.jpg','fl3-03':'fl3-03-editorial.jpg','ce1-05':'ce1-05-pathway.jpg'};
const mobile={'fl1-01':['mobile-01.jpg','mobile-02.jpg'],'fl1-03':['mobile-chart.png'],'fl2-03':[],'fl3-03':['fl3-03-mobile.jpg'],'ce1-05':['ce1-05-mobile-01-prerequisites.jpg','ce1-05-mobile-02-capacity.jpg','ce1-05-mobile-03-deadlines.jpg']};
const labels={'fl1-01':'Pay stub','fl1-03':'Cash flow','fl2-03':'Loan payment','fl3-03':'Account and holding','ce1-05':'School pathway'};
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for(const id of ids){
 const r=records.find(x=>x.lesson_id===id);
 const config=remaining[id];
 const target=$(`#${config?.anchor||id+'-stage-4'}`);
 if(!r||target.length!==1)throw Error('Missing review source '+id);
 if(config){
  const rasters=r.files.filter(f=>/\.(jpg|png)$/.test(f.path));
  desktop[id]=path.basename(rasters.find(f=>!f.path.includes('mobile')).path);
  mobile[id]=rasters.filter(f=>f.path.includes('mobile')).map(f=>path.basename(f.path));
  intro[id]=config.intro;
  if(config.replace){
   const paragraphs=target.children('p');
   const old=paragraphs.eq(config.replace[0]);
   let explanation=escape(config.explanation);
   for(const index of config.replace){
    if(paragraphs.eq(index).find('a,input,button:not(.vocab-term)').length)throw Error('Refinement would remove controls '+id);
    paragraphs.eq(index).find('button.vocab-term').each((_,e)=>{
     const term=$(e).text();
     const pattern=new RegExp('\\b'+term+'\\b','i');
     if(!pattern.test(explanation))throw Error('Missing vocabulary in refinement '+id+': '+term);
     explanation=explanation.replace(pattern,$(e).toString());
    });
   }
   old.html(explanation);
   for(const index of config.replace.slice(1))paragraphs.eq(index).remove();
  }
 }
 const assetDir=path.join(output,'visuals',id);fs.mkdirSync(assetDir,{recursive:true});
 for(const name of [desktop[id],...mobile[id]])fs.copyFileSync(path.join(source,'assets',id,name),path.join(assetDir,name));
 const image=(name,alt)=>`<a href="./visuals/${id}/${name}" target="_blank" rel="noopener" aria-label="Open larger view: ${escape(alt)}"><img src="./visuals/${id}/${name}" alt="${escape(alt)}" loading="lazy" decoding="async"></a>`;
 const panels=mobile[id].map((name,i)=>`<div class="visual-mobile-panel">${image(name,`${r.alt}${mobile[id].length>1?` Panel ${i+1} of ${mobile[id].length}.`:''}`)}</div>`).join('');
 const figure=`<figure class="visual-review-figure" data-visual-review="${id}"><p class="visual-reading-intro">${escape(intro[id])}</p><div class="visual-desktop${panels?' has-mobile':''}">${image(desktop[id],r.alt)}</div>${panels?`<div class="visual-mobile">${panels}</div>`:''}<figcaption>${escape(r.caption)} <span class="visual-open-note">Select the image for a larger view.</span></figcaption><details class="visual-text-equivalent"><summary>Read the diagram in words</summary><p>${escape(r.long_equivalent)}</p></details></figure>`;
 if(config?.before){
  const before=target.children(config.before).first();
  if(before.length)before.before(figure);
  else if(config.before==='.learning-next')target.children('p').last().before(figure);
  else throw Error('Missing placement node '+id);
 }
 else if(config?.after)target.children(config.after).eq(config.afterIndex||0).after(figure);
 else if(config?.afterParagraph!==undefined)target.children('p').eq(config.afterParagraph).after(figure);
 else if(target.children('.student-instructions').length)target.children('.student-instructions').after(figure);
 else target.children('p').eq(1).before(figure);
 if(target.find(`[data-visual-review="${id}"]`).length!==1)throw Error('Figure not inserted '+id);
}
refineWorkedExamples($);
addRelationships($);
$('.course-frame').prepend(`<aside class="visual-review-bar" aria-label="Visual preview navigation"><strong>Course visual review</strong><p>38 supplied visuals with lesson-specific reading guidance. Preview work saves separately.</p><nav aria-label="Choose a visual"><a href="./visual-index.html">Browse all 38 visuals</a>${pilotIds.map(id=>`<a href="#${id}-stage-4">${labels[id]}</a>`).join('')}<a href="http://127.0.0.1:4195/index.html" target="_blank" rel="noopener">Current course</a></nav></aside>`);
$('head').append('<link rel="stylesheet" href="./visual-review.css">');
$('title').text('CALM 10 · Course visual review');
fs.writeFileSync(path.join(output,'index.html'),$.html());
const entries=records.map(r=>({id:r.lesson_id,title:$(`#${r.lesson_id}`).find('h1').first().text()||r.title,anchor:remaining[r.lesson_id]?.anchor||r.lesson_id+'-stage-4',desktop:desktop[r.lesson_id],mobile:mobile[r.lesson_id]}));
fs.writeFileSync(path.join(output,'visual-index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CALM visual review index</title><link rel="stylesheet" href="./styles.css"><link rel="stylesheet" href="./visual-review.css"></head><body><main class="visual-index"><h1>Review the course visuals</h1><p>Open each picture in its teaching context. All 38 new visuals are included; the approved library floor plan and safety sequence remain in their existing lessons. The five previously reviewed examples retain their refinements. This expanded copy saves separately from the current course.</p><p><a href="./index.html?revision=3-all-visuals#ce1-01">Open the course</a></p><ol>${entries.map(e=>`<li><a href="./index.html?revision=3-all-visuals#${e.anchor}"><strong>${e.id.toUpperCase()}</strong> — ${escape(e.title)}</a></li>`).join('')}</ol></main></body></html>`);
fs.writeFileSync(path.join(root,'BUILD.json'),JSON.stringify({revision:3,sourceSha256:crypto.createHash('sha256').update(raw).digest('hex'),namespace,lessons:ids,entries,figureCount:$('[data-visual-review]').length,source:'canonical workspace snapshot; supplied Style C figures; review-only teaching refinements',canonicalEdited:false},null,2)+'\n');
console.log('Built isolated course visual review: '+ids.length+' supplied figures.');
