import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import * as cheerio from 'cheerio';

const root=path.dirname(fileURLToPath(import.meta.url));
const workspace=path.resolve(root,'../../../workspace');
const source=process.argv[2] || '/tmp/calm-style-c-audit/CALM_Style_C_ALL_IN_ONE';
const output=path.join(root,'site');
const namespace='calm10-style-c-five-review-2026-10-06';
const raw=fs.readFileSync(path.join(workspace,'index.html'),'utf8');
const $=cheerio.load(raw);
const records=JSON.parse(fs.readFileSync(path.join(source,'COMPLETE_MANIFEST.json'),'utf8')).records;
const ids=['fl1-01','fl1-03','fl2-03','fl3-03','ce1-05'];
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
 const target=$(`#${id}-stage-4`);
 if(!r||target.length!==1)throw Error('Missing review source '+id);
 const assetDir=path.join(output,'visuals',id);fs.mkdirSync(assetDir,{recursive:true});
 for(const name of [desktop[id],...mobile[id]])fs.copyFileSync(path.join(source,'assets',id,name),path.join(assetDir,name));
 const image=(name,alt)=>`<a href="./visuals/${id}/${name}" target="_blank" rel="noopener" aria-label="Open larger view: ${escape(alt)}"><img src="./visuals/${id}/${name}" alt="${escape(alt)}" loading="lazy" decoding="async"></a>`;
 const panels=mobile[id].map((name,i)=>`<div class="visual-mobile-panel">${image(name,`${r.alt}${mobile[id].length>1?` Panel ${i+1} of ${mobile[id].length}.`:''}`)}</div>`).join('');
 const figure=`<figure class="visual-review-figure" data-visual-review="${id}"><p class="visual-reading-intro">${escape(intro[id])}</p><div class="visual-desktop${panels?' has-mobile':''}">${image(desktop[id],r.alt)}</div>${panels?`<div class="visual-mobile">${panels}</div>`:''}<figcaption>${escape(r.caption)} <span class="visual-open-note">Select the image for a larger view.</span></figcaption><details class="visual-text-equivalent"><summary>Read the diagram in words</summary><p>${escape(r.long_equivalent)}</p></details></figure>`;
 target.children('.student-instructions').after(figure);
}
$('.course-frame').prepend(`<aside class="visual-review-bar" aria-label="Visual preview navigation"><strong>Five-lesson visual preview</strong><p>Supplied Style C artwork in the course. Preview work saves separately.</p><nav aria-label="Choose a visual">${ids.map(id=>`<a href="#${id}-stage-4">${labels[id]}</a>`).join('')}<a href="http://127.0.0.1:4195/index.html" target="_blank" rel="noopener">Current course</a></nav></aside>`);
$('head').append('<link rel="stylesheet" href="./visual-review.css">');
$('title').text('CALM 10 · Five-lesson visual preview');
fs.writeFileSync(path.join(output,'index.html'),$.html());
fs.writeFileSync(path.join(root,'BUILD.json'),JSON.stringify({sourceSha256:crypto.createHash('sha256').update(raw).digest('hex'),namespace,lessons:ids,figureCount:$('[data-visual-review]').length,source:'canonical workspace snapshot; supplied Style C figures',canonicalEdited:false},null,2)+'\n');
console.log('Built isolated five-lesson visual preview.');
