/** Bounded, one-time content intake. Emits a patch; never overwrites canonical HTML. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {load} from 'cheerio';
import {termMatches} from './lib/biology30-vocabulary/panel.js';

if(process.argv.includes('--chapter')){await import('./lib/biology30-pilot3/import-chapter.js');await new Promise<void>(resolve=>process.stdout.write('',()=>resolve()));process.exit(0);}

const source='/Users/deanguedo/Downloads/Biology30_Chapter11_Integrated.html';
const project='projects/biology30-unit-a-pilot-3';
const target=project+'/workspace/index.html';
const bytes=fs.readFileSync(source), sha=createHash('sha256').update(bytes).digest('hex');
const input=load(bytes.toString()), before=fs.readFileSync(target,'utf8'), doc=load(before);
if(doc('[data-integrated-source]').length)throw Error('Already integrated: edit canonical HTML, do not reimport.');
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const assets=[
 {selector:'#neuron-structure > .lesson-block:nth-of-type(1) img',topic:'neuron-structure',index:0,file:'integrated-neuron.png',caption:'Read from dendrites to axon terminals. This is a simplified illustration of a typical multipolar neuron, not every neuron shape.'},
 {topic:'neuron-structure',index:1,file:'integrated-myelin.png',caption:'Compare where the impulse is regenerated. The arrows are a shorthand: the axon remains continuous beneath the sheath. Schwann cells shown here form peripheral myelin; CNS myelin is made by oligodendrocytes.'},
 {topic:'reflexes',index:1,file:'integrated-withdrawal.svg',caption:'Follow the spinal withdrawal circuit, then the separate path toward the brain. This is a simplified pathway, not a scale drawing or the wiring of every reflex.'},
].map(a=>{const img=input('#'+a.topic+' > .lesson-block img').eq(a.index);const src=img.attr('src')!;return {...a,bytes:Buffer.from(src.split(',')[1],'base64'),alt:img.attr('alt')!};});
const videos=['overview','neuron-structure','reflexes'].flatMap(topic=>input('#'+topic+' [data-video]').map((_,el)=>({id:input(el).attr('data-video')!,title:input(el).attr('data-title')!,focus:input(el).find('.video-focus').text(),topic})).get());
const video=(v:typeof videos[number])=>`<section class="video-support" data-video="${esc(v.id)}"><h3>${esc(v.title)}</h3><p>${esc(v.focus)}</p><div data-video-slot></div><button type="button" data-load-video>Load video</button> <a href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener">Watch on YouTube</a><p class="muted">From the supplied Chapter 11 integrated lesson. The written explanation above covers the idea if playback is unavailable.</p></section>`;
const figure=(a:typeof assets[number])=>`<figure><a href="assets/source/${a.file}" target="_blank" rel="noopener"><img src="assets/source/${a.file}" alt="${esc(a.alt)}" loading="lazy"></a><figcaption>${esc(a.caption)} Supplied integrated-course illustration. Select the image to enlarge.</figcaption></figure>`;
const reading=(p:number)=>`<p><a href="#textbook-library" data-book-page="${p-359}">Textbook p. ${p}</a></p>`;
const section=(content:string)=>`<section class="content-section" data-teaching data-integrated-source="${sha}">${content}</section>`;
const overview=input('#overview .lesson-copy').clone();overview.find('details').remove();
const overviewParts:string[]=[];let group='';
overview.children().each((_,el)=>{if(el.tagName==='h3'&&group){overviewParts.push(group);group='';}group+=input.html(el);});if(group)overviewParts.push(group);
const blocks=overviewParts.map((s,i)=>section((i===0?'<h2>Nervous communication</h2>':'')+s.replace(/<h3/g,'<h2').replace(/<\/h3>/g,'</h2>')+(i===overviewParts.length-1?reading(367)+video(videos[0]):'')));
for(const topic of ['neuron-structure','reflexes'])input('#'+topic+' > .lesson-block').each((i,el)=>{
 const copy=input(el).find('.lesson-copy').clone();
 copy.find('[id]').removeAttr('id');copy.find('h3').each((_,h)=>{input(h).replaceWith('<h2>'+input(h).html()+'</h2>');});
 // Keep the existing course's table treatment; do not import source CSS or behaviour.
 copy.find('.table-scroll').each((_,t)=>input(t).replaceWith(input(t).html()!));
 copy.find('aside').each((_,a)=>input(a).replaceWith('<p>'+input(a).html()+'</p>'));
 let html=copy.html()!;
 if(topic==='neuron-structure'&&i===0)html+=figure(assets[0])+reading(372)+video(videos[1]);
 if(topic==='neuron-structure'&&i===1){html=html.replace('Schwann cells are glial cells that wrap around an axon to form myelin.','In the peripheral nervous system, Schwann cells are glial cells that wrap around an axon to form myelin.');html+=figure(assets[1]);}
 if(topic==='reflexes'&&i===2)html+=figure(assets[2])+reading(370)+reading(371)+videos.filter(v=>v.topic==='reflexes').map(video).join('');
 blocks.push(section(html));
});
const lesson=doc('#lesson-01 > .p2-topic');
lesson.children('[data-teaching]').first().before(blocks.join('\n'));lesson.children('[data-teaching]:not([data-integrated-source])').remove();
const wordData=JSON.parse(doc('#biology-word-data').text()||'null');
const words=wordData?.words??JSON.parse(fs.readFileSync('projects/biology30-unit-a-pilot-2/meta/word-details.json','utf8')).words;
doc('#lesson-01 [data-teaching]').each((_,section)=>{const seen=new Set<string>();const walk=(n:any)=>{for(const child of [...(n.children??[])]){if(child.type==='text'){const text=child.data,matches=termMatches(text,words.map((w:any)=>w.term),seen);if(matches.length){let at=0,out='';for(const m of matches){out+=esc(text.slice(at,m.start))+`<button type="button" class="bio-term" data-bio-term="${esc(m.term)}" data-bio-term-route="lesson-01" aria-haspopup="dialog">${esc(text.slice(m.start,m.end))}</button>`;at=m.end;}doc(child).replaceWith(out+esc(text.slice(at)));}}else if(!['a','button','script','style','label','summary','figcaption','h2','h3'].includes(child.name))walk(child);}};walk(section);});
const lib=doc('#video-library > .p2-topic');lib.children('.content-section').remove();lib.append(videos.map(v=>`<div class="content-section">${video(v)}<p><a href="#lesson-01">Return to Neuron Structure</a></p></div>`).join('\n'));
doc('[data-canvas-helper-edit-key="p3-content-2231"]').text('Teaching wording is adapted from the teacher-supplied Biology30_Chapter11_Integrated.html, topics 1–3, checked against Chapter 11 slides 1–20 and textbook pp. 367–372. Three supplied illustrations are included; these are conceptual drawings, not empirical evidence or textbook figures. Labeling and quiz figures retain their original textbook/Brightspace sources. Original third-party permissions remain a release check.');
let k=0;doc('#lesson-01 [data-integrated-source], #video-library .content-section').find('h2,h3,p,li,th,td,caption,a,button,figure,img').each((_,e)=>{if(!doc(e).attr('data-canvas-helper-edit-key'))doc(e).attr('data-canvas-helper-edit-key','p3-integrated-'+(++k));});
// Patch only selected route HTML: unrelated word records and stored IDs remain byte-identical.
let after=before;
for(const id of ['lesson-01','video-library','sources-and-credits']){
 const original=load(before)('#'+id).toString();const replacement=doc('#'+id).toString();
 // Original serialization can normalize entities; select the exact source span instead.
 const start=after.indexOf('<section class="course-page" id="'+id+'"');if(start<0)throw Error('Missing exact route '+id);
 const next=after.indexOf('<section class="course-page"',start+1);const end=next<0?after.indexOf('</main>',start):next;
 const chunk=after.slice(start,end);const close=chunk.lastIndexOf('</section>')+10;if(close<10)throw Error('Route end');
 after=after.slice(0,start)+replacement+chunk.slice(close)+after.slice(end);
}
if(process.argv.includes('--extract')){
 const dest='projects/resources/biology30-pilot3-review/'+sha;fs.mkdirSync(dest,{recursive:true});const saved=path.join(dest,'Biology30_Chapter11_Integrated.html');
 if(fs.existsSync(saved)&&createHash('sha256').update(fs.readFileSync(saved)).digest('hex')!==sha)throw Error('Archive conflict');fs.copyFileSync(source,saved);
 for(const a of assets){const p=project+'/workspace/assets/source/'+a.file;if(fs.existsSync(p)&&!fs.readFileSync(p).equals(a.bytes))throw Error('Asset conflict');fs.writeFileSync(p,a.bytes);}
 console.log(JSON.stringify({sourceSha256:sha,archivedSource:saved,selectedTopics:['overview','neuron-structure','reflexes'],teachingSections:blocks.length,videos,images:assets.map(({bytes,...a})=>({...a,sha256:createHash('sha256').update(bytes).digest('hex')})),excluded:[{source:'overview figure 1',reason:'Axon leader points to myelin; omitted.'},{source:'reflexes figure 4',reason:'Motor cell body drawn outside spinal cord; omitted.'},{source:'topics 4–14',reason:'Outside agreed one-lesson test.'},{source:'physical investigations and additional questions',reason:'Existing source-backed local activities retained; no duplicate saved fields or equipment requirements.'}]}));
}else{
 const {createTwoFilesPatch}=createRequire(import.meta.url)('diff');
 const unified=createTwoFilesPatch(target,target,before,after,'','',{context:0});
 const body=unified.slice(unified.indexOf('@@')).replace(/^@@.*@@.*$/gm,'@@').replace(/^\\ No newline at end of file\n?/gm,'').trimEnd();
 console.log('*** Begin Patch\n*** Update File: '+target+'\n'+body+'\n*** End Patch');
}
