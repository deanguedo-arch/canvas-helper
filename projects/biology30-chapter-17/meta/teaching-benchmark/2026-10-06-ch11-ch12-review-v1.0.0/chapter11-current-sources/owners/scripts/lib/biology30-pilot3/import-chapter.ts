/** Continuation of the bounded HTML intake. Emits canonical patches, not a rebuild. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {load} from 'cheerio';
import {termMatches} from '../biology30-vocabulary/panel.js';
const project='projects/biology30-unit-a-pilot-3',file=project+'/workspace/index.html';
const repair=process.argv.includes('--repair');
if(repair)throw Error('Temporary intake repair is retired. Edit the canonical workspace; never restore an old snapshot.');
const snapshot='/tmp/biology30-pilot3-validation.VzOFlG/';
const original=fs.readFileSync((repair?snapshot:'')+file,'utf8'),d=load(original);
if(d('[data-chapter11-complete]').length)throw Error('Already imported. Edit canonical HTML; no regeneration.');
const source='projects/resources/biology30-pilot3-review/9e9e7823d345f21ad251e7e02624d65e005eab7c2f057bca20f23418cfdc94d2/Biology30_Chapter11_Integrated.html';
const s=load(fs.readFileSync(source,'utf8')),faithful=load(fs.readFileSync('projects/biology30-unit-a-class-2026-faithful/workspace/index.html','utf8'));
const esc=(v:any)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const topics=['overview','neuron-structure','reflexes','resting-potential','action-potentials','synapses','drugs','pns','cns','brain','brain-investigation','chapter-review-section','extras','connections'];
const routes=topics.map((_,i)=>'lesson-'+String(i+1).padStart(2,'0'));
const titles=topics.map(id=>s('#'+id+' > .topic-heading h2').text());
const allVideos:any[]=[],assets:any[]=[],findings:string[]=[];
const reviewPages:Record<string,number>={drugs:384,pns:399,'brain-investigation':395,'chapter-review-section':402,connections:400};
const pageLink=(page:number)=>`<a href="#textbook-library" data-book-page="${page-359}">Textbook p. ${page}</a>`;
const video=(v:any)=>`<section class="video-support" data-video="${esc(v.id)}"><h3>${esc(v.title)}</h3><p>${esc(v.focus)}</p><div data-video-slot></div><button type="button" data-load-video>Load video</button> <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Watch on YouTube</a><p class="muted">From the supplied integrated Chapter 11. Use the local explanation if playback is unavailable.</p></section>`;
const header=(title:string,intro:string)=>`<header class="page-header"><p class="eyebrow">Learn · Chapter 11</p><h1>${esc(title)}</h1><p>${esc(intro)}</p></header>`;
const originalData=JSON.parse(d('#pilot3-words').text()),words=originalData.data.words;
const catalogPath=project+'/workspace/assets/pilot3-catalog.js';
const catalogBefore=fs.readFileSync((repair?snapshot:'')+catalogPath,'utf8');const catalog=JSON.parse(catalogBefore.slice(catalogBefore.indexOf('=')+1).trim().replace(/;$/,''));
const mcMap:Record<string,[number,string]>={
 'resting-potential':[2130971,'checkpoint-9'],'action-potentials':[2130972,'checkpoint-11'],synapses:[2130968,'checkpoint-15'],drugs:[2130968,'review111-q6'],pns:[2130969,'chapter-review-pns-pair'],cns:[2130970,'checkpoint-19'],brain:[2130966,'checkpoint-22'],'brain-investigation':[2130980,'checkpoint-27'],'chapter-review-section':[2130979,'chapter-review-q5']
};
// A source question about autonomic effects fits the PNS paired response directly.
const pnsPair=s('#chapter-review-q4').clone().attr('id','chapter-review-pns-pair');
const usedWriting=new Set(['checkpoint-5','checkpoint-8']);
const written=(id:string,prompt:string,max=3200)=>`<label for="${id}">Written response</label><textarea id="${id}" data-writing="${id}" data-answer-limit="${max}" rows="6" aria-describedby="${id}-limit ${id}-status"></textarea><p id="${id}-limit" class="muted">Up to ${max} characters. Drafts can be longer, but must fit before submission. Writing is not automatically graded.</p><button type="button" data-submit-writing>Save written response</button><p data-writing-status id="${id}-status" role="status"></p>`;
const activity=(id:string,title:string,body:string,mode:string,required=false)=>`<section class="activity" data-activity="${id}" data-activity-mode="${mode}"${required?' data-required-check':''}><h2>${esc(title)}</h2><p>${required?'Chapter check':'Optional source practice'} · Select Start when ready. The elapsed timer includes breaks; Submit and finish stops it. Redo preserves earlier attempts.</p><div class="save-row"><button type="button" data-start>Start</button><output data-timer>Not started</output></div><fieldset data-run-body disabled>${body}</fieldset><button type="button" data-submit-run>Submit and finish</button> <button type="button" data-redo hidden>Redo activity</button><p data-run-status role="status"></p></section>`;
function clean(node:any,topic:string){
 const copy=node.clone();copy.find('script,style,iframe,input,textarea,select,.response-editor,.question-controls,.question-pager,.activity-notes').remove();
 copy.find('*').addBack().each((_:any,e:any)=>{for(const a of Object.keys(e.attribs??{}))if(a.startsWith('on')||a==='style'||a==='id'||a.startsWith('data-'))s(e).removeAttr(a);});
 copy.find('a[href]').each((_:any,e:any)=>{const a=s(e),href=a.attr('href')!;if(href.startsWith('data:')){a.removeAttr('href');return;}const match=href.match(/Chapter11_textbook\.pdf#page=(\d+)/);if(match)a.attr('href','#textbook-library').attr('data-book-page',match[1]);else if(href.startsWith('#')){const index=topics.indexOf(href.slice(1));a.attr('href',index>=0?'#'+routes[index]:'#textbook-library');}else if(!/^https?:/.test(href))a.replaceWith(a.text());});
 copy.find('img').each((_:any,e:any)=>{
  const img=s(e),src=img.attr('src')??'',sourceImgs=s('#'+topic+' img').toArray(),idx=sourceImgs.findIndex(n=>s(n).attr('src')===src);
  if(!src.startsWith('data:image/'))throw Error('Unexpected image '+src.slice(0,80));
  if(topic==='extras'){img.closest('figure').remove();findings.push('Slide 64 brain comparison image excluded: no study methods; retained evidence limitations and discussion.');return;}
  const ext=src.startsWith('data:image/svg')?'svg':'png',name=`chapter11-${topic}-${idx}.${ext}`,bytes=Buffer.from(src.split(',')[1],'base64');
  if(!assets.some(a=>a.name===name))assets.push({name,bytes,topic,sourceImage:idx,sha256:createHash('sha256').update(bytes).digest('hex')});
  img.attr('src','assets/source/'+name).removeAttr('width').removeAttr('height').attr('loading','lazy');
  const figure=img.closest('figure');if(figure.length){figure.find('button,.zoom-label').each((_:any,b:any)=>{if(s(b).find('img').length)s(b).replaceWith(s(b).html()!);else s(b).remove();});const a=img.closest('a');if(a.length)a.attr('href','assets/source/'+name).attr('target','_blank').attr('rel','noopener');else img.wrap(`<a href="assets/source/${name}" target="_blank" rel="noopener"></a>`);}
 });
 copy.find('.table-scroll').each((_:any,t:any)=>s(t).replaceWith(s(t).html()!));
 copy.find('button').each((_:any,e:any)=>s(e).replaceWith(s(e).text()));
 return copy.html()??'';
}
function questionContent(q:any,topic:string){const c=q.clone();c.find('.response-editor').remove();return clean(c,topic);}
function paired(topic:string){const spec=mcMap[topic];if(!spec)return'';const [sourceId,qid]=spec,id='check-'+topic,question=id+'-mc';
 const f=faithful(`input[id*="obj-${sourceId}-"]`).first().closest('fieldset');if(!f.length)throw Error('Source MC missing');const key=JSON.parse(f.attr('data-correct-values')!)[0];
 const choices=f.find('input').map((_:any,e:any)=>({value:faithful(e).attr('value')!,label:faithful(e).closest('.practice-choice').find('label').text().trim()})).get();
 catalog.questions.push({id:question,sourceId:'res-quiz-59222:obj-'+sourceId,correct:key});
 const q=topic==='pns'?pnsPair:s('#'+qid);if(!q.length)throw Error('Writing missing '+qid);usedWriting.add(qid);if(topic==='pns')usedWriting.add('chapter-review-q4');
 return activity(id,'Check: '+titles[topics.indexOf(topic)],`<div class="question" data-question="${question}"><h3>${esc(f.find('.practice-prompt').text().trim())}</h3>${choices.map((v:any,i:number)=>`<label class="choice"><input type="radio" name="${question}" value="${esc(v.value)}" data-answer> ${esc(v.label)}</label>`).join('')}<button type="button" data-check>Check answer</button><p data-feedback role="status"></p><fieldset class="paired-writing" data-unlock="${question}" disabled><legend>Explain the related idea</legend>${questionContent(q,topic)}<p>${pageLink(Number(q.find('.question-page').text().match(/p\. (\d+)/)?.[1])||reviewPages[topic]||387)}</p>${written(id+'-written','')}</fieldset></div>`,'paired',true);
}
const existing=d('#lesson-01 [data-teaching]').toArray().map(e=>d(e).toString());
const newPages:string[]=[];
topics.forEach((topic,i)=>{
 let teaching='';
 if(i<3)teaching=(i===0?existing.slice(0,4):i===1?existing.slice(4,7):existing.slice(7)).join('\n');
 else s('#'+topic+' .lesson-copy').each((_,e)=>{
  const copy=s(e).clone();let html=clean(copy,topic);
  // Retain source wording with explicit corrections to over-generalized teaching shortcuts.
  html=html.replace('A broad comparison associates the left hemisphere with more analytical processing and the right with more creative or abstract processing.','Some functions show lateralization, but analytical and creative tasks involve interacting networks in both hemispheres.');
  html=html.replace(/and will not be tested/g,'and are optional in this pilot').replace(/These structures provide context and will not be tested\./g,'These structures provide optional context.');
  html=html.replace('The table gives simplified action categories and examples.','The table gives source study examples; effects depend on receptors.');
  const block=s(e).closest('.lesson-block');const media=block.find('> .lesson-media').clone();media.find('.watch-fold').remove();
  if(media.length)html+=clean(media,topic);
  teaching+=`<section class="content-section" data-teaching>${html}</section>\n`;
 });
 const videos=s('#'+topic+' [data-video]').map((_,e)=>({id:s(e).attr('data-video')!,title:s(e).attr('data-title')!,focus:s(e).find('.video-focus').text(),route:routes[i]})).get();
 allVideos.push(...videos);
 if(i>=3&&videos.length)teaching+=`<div class="content-section">${videos.map(video).join('')}</div>`;
 const check=paired(topic);
 const qs=s('#'+topic+' .question').toArray().filter(q=>!usedWriting.has(s(q).attr('id')!));
 const bank=qs.length?activity('practice-'+topic,'Source practice: '+titles[i],qs.map(q=>{const id='source-'+s(q).attr('id');return `<div class="question" data-question="${id}">${questionContent(s(q),topic)}<p>${pageLink(Number(s(q).find('.question-page').text().match(/p\. (\d+)/)?.[1])||reviewPages[topic]||367)}</p>${written(id+'-written','')}</div>`;}).join(''),'writing'):'';
 const investigations=s('#'+topic+' .activity-fold').map((_,e)=>({title:s(e).find('summary strong').first().text(),question:s(e).find('.original-activity').text().replace(/\s+/g,' ').slice(0,160)})).get();
 const lab=investigations.length?`<div class="content-section"><h2>Investigation reference</h2><p>This online pilot does not ask you to perform physical procedures. Use the lesson diagrams, source photographs and videos for observation. No trial measurements are supplied: do not invent measured results.</p>${investigations.map(a=>`<p>${esc(a.title)} — ${pageLink(topic==='resting-potential'?375:topic==='synapses'?381:topic==='brain-investigation'?393:topic==='brain'?390:371)}</p>`).join('')}</div>`:'';
 const support=i<3?'<p><a href="#practice">Timed flashcards, blanks and labeling</a> · <a href="#lesson-check">Foundation check for topics 1–3</a></p>':'';
 const nav=`<div class="content-section">${support}${i>0?`<a href="#${routes[i-1]}">Previous: ${esc(titles[i-1])}</a> · `:''}${i<topics.length-1?`<a href="#${routes[i+1]}">Next: ${esc(titles[i+1])}</a>`:'<a href="#process-collection">Open Process Collection</a>'}</div>`;
 const intro=i>11?'Optional extension. Use the chapter as evidence; outside research is optional and no personal disclosures are required.':s('#'+topic+' .topic-intro').first().text();
 newPages.push(`<section class="course-page" id="${routes[i]}" data-chapter11-complete="${topic}" hidden><div class="p2-topic">${header(titles[i],intro)}${teaching}${check}${lab}${bank}${nav}</div></section>`);
});
d('#lesson-01').replaceWith(newPages.join('\n'));
d('[data-activity="lesson-check"]').attr('data-required-check','');
const learnLink=d('.nav-link[href="#lesson-01"]');learnLink.replaceWith(routes.map((r,i)=>`<a class="nav-link" href="#${r}">${i+1}. ${esc(titles[i])}</a>`).join('\n'));
d('#overview .p2-topic').html(header('Chapter 11: The Nervous System','Pilot 3 uses all 14 topics from your supplied integrated chapter, within the Biology 30 course shell.')+`<div class="content-section"><p>Study the 11 teaching topics, complete Chapter Review, and explore the two optional extension pages. Topics 1–3 share the foundation check; the remaining teaching topics and Chapter Review have paired multiple-choice and written checks.</p><p>Ten chapter checks contribute to progress. Source practice, flashcards and extensions are additional opportunities, not new mastery claims. Start an activity to begin its elapsed timer; submit to finish. All attempts and redos remain in Process Collection.</p><p>Keep up to eight word Frayers. Saved work stays in this browser, not Brightspace. Download a backup before changing devices or clearing browser data.</p><a class="button primary" href="#lesson-01">Begin Nervous communication</a></div>`);
const lib=d('#video-library > .p2-topic');lib.children('.content-section').remove();lib.append(allVideos.map(v=>`<div class="content-section">${video(v)}<p><a href="#${v.route}">Return to ${esc(titles[routes.indexOf(v.route)])}</a></p></div>`).join('\n'));
lib.find('.page-header>p').last().text('All videos from the supplied Chapter 11, linked to their teaching or optional extension page.');
d('#sources-and-credits .content-section').prepend('<h2>Chapter 11 scope</h2><p>All 14 supplied topics are included. Topic questions and figures retain source identities and textbook destinations. Physical investigations are references for observation, not home-lab requirements. Original MC items are selected from the learner-visible Brightspace Chapter 11 quiz. No new MC questions were invented. Chapters 12–13 are not part of this pilot.</p>');
d('#sources-and-credits .page-header>p').last().text('A local Chapter 11 comparison pilot based on the supplied Biology 30 material.');
d('[data-canvas-helper-edit-key="p3-content-2231"]').text('Teaching wording is adapted from all 14 topics of the teacher-supplied Biology30_Chapter11_Integrated.html. Included images combine supplied conceptual illustrations and original textbook figures, with limitations and original labels retained. Source permissions remain a release check.');
const manifestPath=project+'/meta/project.json',manifestBefore=fs.readFileSync((repair?snapshot:'')+manifestPath,'utf8'),schema=JSON.parse(manifestBefore);schema.authoringStatus='blocked';
for(const route of routes.slice(1))schema.authoring.learnerSurfaces.surfaces.push({htmlPath:'index.html',route:'#'+route,stateKey:null});
for(const route of routes)if(d('#'+route+' details').length)schema.authoring.learnerSurfaces.surfaces.push({htmlPath:'index.html',route:'#'+route,stateKey:'native-details-open'});
schema.referenceOnly.push('scripts/lib/biology30-pilot3/import-chapter.ts');
// Mark every new routine node as canonical; behaviour never regenerates this prose.
let k=0;d('[data-chapter11-complete] [data-teaching]').each((_,section)=>{if(d(section).find('[data-bio-term]').length)return;const seen=new Set<string>();const walk=(n:any)=>{for(const child of [...(n.children??[])]){if(child.type==='text'){const text=child.data,matches=termMatches(text,words.map((w:any)=>w.term),seen);if(matches.length){let at=0,out='';for(const m of matches){out+=esc(text.slice(at,m.start))+`<button type="button" class="bio-term" data-bio-term="${esc(m.term)}" aria-haspopup="dialog">${esc(text.slice(m.start,m.end))}</button>`;at=m.end;}d(child).replaceWith(out+esc(text.slice(at)));}}else if(!['a','button','script','style','label','summary','figcaption','h2','h3'].includes(child.name))walk(child);}};walk(section);});
d('h1,h2,h3,h4,p,li,th,td,caption,a,button,figure,img,label,summary').each((_,e)=>{if(d(e).closest('#core-vocabulary').length)return;if(!d(e).attr('data-canvas-helper-edit-key'))d(e).attr('data-canvas-helper-edit-key','p3-chapter-'+(++k));});
const after=d.html();
const report={source,topics:topics.map((id,i)=>({source:id,route:routes[i],title:titles[i],questionCount:s('#'+id+' .question').length})),requiredChecks:10,pairedChecks:Object.keys(mcMap),images:assets.map(({bytes,...a})=>a),videos:allVideos,findings,sourceQuestionDisposition:'All question banks imported except existing collected Q5/Q8 and paired selections, which have one saved owner. Physical lab procedures remain textbook references; no false measured evidence.',limits:'New written fields: 3200 characters; legacy fields 900; Frayers 240. Local IndexedDB—not SCORM suspend data.'};
if(process.argv.includes('--extract')){for(const a of assets)fs.writeFileSync(project+'/workspace/assets/source/'+a.name,a.bytes);console.log(JSON.stringify(report));}
else{
 const {createTwoFilesPatch}=createRequire(import.meta.url)('diff');const patch=(p:string,a:string,b:string)=>{if(repair)a=fs.readFileSync(p,'utf8');if(a===b)return '';const diff=createTwoFilesPatch(p,p,a,b,'','',{context:3});return '*** Update File: '+p+'\n'+diff.slice(diff.indexOf('@@')).replace(/^@@.*@@.*$/gm,'@@').replace(/^\\ No newline at end of file\n?/gm,'').trimEnd()+'\n';};
 const updates=[patch(file,original,after),patch(catalogPath,catalogBefore,'window.PILOT3_CATALOG = '+JSON.stringify(catalog)+';\n'),patch(manifestPath,manifestBefore,JSON.stringify(schema,null,2)+'\n')];
 const chunks=updates.filter(Boolean);
 const reportPath=project+'/meta/chapter11-intake.json';
 chunks.push(fs.existsSync(reportPath)?patch(reportPath,fs.readFileSync(reportPath,'utf8'),JSON.stringify(report,null,2)+'\n'):'*** Add File: '+reportPath+'\n'+JSON.stringify(report,null,2).split('\n').map(l=>'+'+l).join('\n')+'\n');
 const full='*** Begin Patch\n'+chunks.join('')+'*** End Patch';
 if(process.argv.includes('--slice')){const index=Number(process.argv[process.argv.indexOf('--slice')+1]);process.stdout.write(full.slice(index*30000,(index+1)*30000));}
 else if(process.argv.includes('--stats'))console.log(JSON.stringify({length:full.length,slices:Math.ceil(full.length/30000)}));
 else if(process.argv.includes('--chunk'))console.log('*** Begin Patch\n'+chunks[Number(process.argv[process.argv.indexOf('--chunk')+1])]+'*** End Patch');
 else console.log('*** Begin Patch\n'+chunks.join('')+'*** End Patch');
}
