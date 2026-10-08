import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';

const parent=path.resolve('projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer');
const trial=path.join(parent,'teacher-led-batch-06-07-v0.1.0');
const packet=path.join(trial,'source-handoff'), returned=path.join(trial,'pro-return');
const prior=path.join(parent,'teacher-led-batch-01-03-04-v0.1.0/evaluation');
const output=path.join(trial,'evaluation');
const read=(root,p)=>fs.readFileSync(path.join(root,p));
const json=(root,p)=>JSON.parse(read(root,p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const assert=(ok,m)=>{if(!ok)throw Error(m);};
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
assert(!fs.existsSync(output),'Preserve existing comparison; version anew.');
const protections=json(packet,'contracts/SOURCE_PROTECTION.json');
const protect=()=>{for(const r of protections)assert(sha(fs.readFileSync(r.file))===r.sha256,`Protected drift: ${r.file}`);};
protect();
const manifest=json(returned,'MANIFEST.json');
assert(manifest.files.length===66,'Unexpected return inventory.');
for(const r of manifest.files){assert(!path.isAbsolute(r.path)&&!r.path.split('/').includes('..'),'Unsafe path');const b=read(returned,r.path);assert(b.length===r.bytes&&sha(b)===r.sha256,`Payload mismatch ${r.path}`);}
for(const l of read(returned,'CHECKSUMS.sha256').toString().trim().split('\n')){const m=/^([a-f0-9]{64})\s+\*?(.+)$/.exec(l);assert(m&&!path.isAbsolute(m[2])&&!m[2].split('/').includes('..'),'Unsafe checksum');assert(sha(read(returned,m[2]))===m[1],`Checksum ${m[2]}`);}
const boundaries=json(packet,'contracts/REPLACEMENT_BOUNDARIES.json');
const original=read(prior,'new/index.html');
assert(sha(original)===boundaries.ownerSha256&&original.equals(read(packet,'current/index.html')),'Frozen owner mismatch');
const old=load(original.toString()), vocabulary=new Set(JSON.parse(old('#course-data').text()).words.map(w=>w.id));
const sources=json(packet,'sources/SELECTED_SLIDES.json'), sourceHashes=new Set(sources.flatMap(s=>s.images.map(i=>i.sha256)));
const exact=(e,t)=>t.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
const parts=[],assets=new Set(),replacements=[];let cursor=0;
for(const b of boundaries.lessons){
 parts.push(original.subarray(cursor,b.startByte));
 const before=original.subarray(b.startByte,b.endByteExclusive).toString(),fragment=read(returned,`${b.lessonId}.teaching-fragment.html`).toString();
 assert(sha(before)===b.beforeSha256,'Boundary mismatch');
 const a=load(before,{sourceCodeLocationInfo:true},false),f=load(fragment,{sourceCodeLocationInfo:true},false);
 assert(!f('script,style,iframe,object,embed,link,input,select,textarea,form,[data-save-note]').length,'Active element outside scope');
 for(const e of f('*').toArray())for(const [n,v]of Object.entries(e.attribs))assert(!/^on/i.test(n)&&n!=='style'&&!/javascript:/i.test(v),'Unsafe attribute');
 for(const tag of b.preservedOuterTags)assert(fragment.includes(tag),'Outer tag drift');
 for(const e of a('[data-canvas-helper-edit-key]').toArray()){const k=e.attribs['data-canvas-helper-edit-key'],n=f(`[data-canvas-helper-edit-key="${k}"]`);assert(n.length===1&&n.attr('data-canvas-edit-key')===e.attribs['data-canvas-edit-key'],'Edit key drift');}
 const terms=new Set(f('[data-term-id]').toArray().map(e=>e.attribs['data-term-id']));
 for(const e of a('[data-term-id]').toArray())assert(terms.has(e.attribs['data-term-id']),'Existing vocabulary link lost');
 for(const e of f('[data-term-id]').toArray())assert(e.tagName==='button'&&e.attribs.class==='bio-term'&&e.attribs.type==='button'&&e.attribs['aria-haspopup']==='dialog'&&vocabulary.has(e.attribs['data-term-id']),'Unbound vocabulary');
 for(const e of a('figure[data-figure-id]').toArray()){const n=f(`figure[data-figure-id="${e.attribs['data-figure-id']}"]`);assert(n.length===1&&exact(e,before)===exact(n[0],fragment),'Locked figure drift');}
 for(const e of f('button').toArray())assert(['data-term-id','data-enlarge-figure'].some(k=>k in e.attribs),'New behavior');
 for(const e of f('img').toArray()){const src=e.attribs.src;assert(e.attribs.alt?.trim(),'Missing alt');assert(/^\.\/assets\/teaching-batch2-v010\/[a-zA-Z0-9._-]+$/.test(src)||src==='./assets/figures/ch17-abo.svg','Unexpected asset');assert(src.includes('/figures/')?sha(read(returned,src))===sha(read(prior,`new/${src}`)):sourceHashes.has(sha(read(returned,src))),'Source pixels drift');assets.add(src);}
 parts.push(Buffer.from(fragment));cursor=b.endByteExclusive;replacements.push({lesson:b.lessonId,fragmentSha256:sha(fragment)});
}
parts.push(original.subarray(cursor));const candidate=Buffer.concat(parts),c=load(candidate.toString());
const ids=c('[id]').toArray().map(e=>e.attribs.id);assert(new Set(ids).size===ids.length,'Duplicate ID');
for(const id of ['course-data','textbook-data','textbook-practice-data'])assert(c('#'+id).text()===old('#'+id).text(),'Native data drift');
for(let i=1;i<=15;i++)if(![6,7].includes(i)){const id='#lesson-'+String(i).padStart(2,'0');assert(old(id).toString()===c(id).toString(),'Other lesson drift');}
assert(JSON.stringify(old('[data-note-id],[data-save-note],[data-check-id],[data-check-question],[data-writing-question]').toArray().map(e=>e.attribs))===JSON.stringify(c('[data-note-id],[data-save-note],[data-check-id],[data-check-question],[data-writing-question]').toArray().map(e=>e.attribs)),'Native controls drift');
fs.mkdirSync(output);fs.cpSync(path.join(prior,'new'),path.join(output,'baseline'),{recursive:true,errorOnExist:true});fs.cpSync(path.join(output,'baseline'),path.join(output,'new'),{recursive:true,errorOnExist:true});
fs.writeFileSync(path.join(output,'new/index.html'),candidate);
for(const src of assets)if(src.includes('teaching-batch2-v010')){const dest=path.join(output,'new',src);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(returned,src),dest,fs.constants.COPYFILE_EXCL);}
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);let nativeCount=0;
for(const file of walk(path.join(output,'baseline'))){const r=path.relative(path.join(output,'baseline'),file);if(r!=='index.html'){assert(sha(fs.readFileSync(file))===sha(read(output,'new/'+r)),'Native file drift');nativeCount++;}}
const viewer='/Users/deanguedo/Documents/Codex/2026-10-04/task/source-assessment-trial-v0.3.0/evaluation/source';
const dir=path.join(output,'source');fs.mkdirSync(dir);fs.copyFileSync(path.join(packet,'sources/original-114-slides.pptx'),path.join(dir,'original-114-slides.pptx'));fs.copyFileSync(path.join(viewer,'Attachment51.png'),path.join(dir,'Attachment51.png'));
const s=load(read(viewer,'viewer.html').toString()),keep=new Set(sources.map(r=>String(r.slide)));
s('div.slide[data-slide]').each((_,e)=>{if(!keep.has(e.attribs['data-slide']))s(e).remove();});
for(const r of sources){const slide=s(`div.slide[data-slide="${r.slide}"]`);assert(slide.length===1,'Missing source slide');slide.find('img').each((_,e)=>{if(e.attribs.src!=='Attachment51.png')s(e).remove();});const xml=load(read(packet,`sources/slide-xml/slide-${r.slide}.xml`).toString(),{xmlMode:true});for(const pic of xml('p\\:pic').toArray()){const rel=xml(pic).find('a\\:blip').attr('r:embed'),asset=r.images.find(i=>i.relationshipId===rel);assert(asset,'Source association absent');const t=xml(pic).find('a\\:xfrm').first(),off=t.find('a\\:off')[0]?.attribs,ext=t.find('a\\:ext')[0]?.attribs;assert(off&&ext,'Source transform absent');const name=path.basename(asset.file);if(!fs.existsSync(path.join(dir,name)))fs.copyFileSync(path.join(packet,asset.file),path.join(dir,name));slide.append(`<img src="${name}" alt="Original illustration from slide ${r.slide}" style="position:absolute;left:${Number(off.x)/12700}px;top:${Number(off.y)/12700}px;width:${Number(ext.cx)/12700}px;height:${Number(ext.cy)/12700}px;">`);}}
s('.render-note').text('Original slide layout; picture identities/placements restored from PPTX relationships. Historical wording remains unchanged; animations and fonts may differ.');
const groups={'06':[[49,52,'49–52 · Incomplete dominance'],[53,58,'53–58 · Source expression examples']],'07':[[67,69,'67–69 · Multiple alleles and ABO'],[70,71,'70–71 · Probability and family evidence']]};
write(path.join(dir,'viewer.html'),s.html().replace(/const groups=.*?;\n/,`const groups=${JSON.stringify(groups)};\n`).replace(/const lesson=new URL.*?;const ranges=/,"const requestedLesson=new URL(location.href).searchParams.get('lesson');const lesson=groups[requestedLesson]?requestedLesson:'06';const ranges="));
let wrapper=read(prior,'index.html').toString().replace(/<title>.*?<\/title>/,'<title>Chapter 17 lessons 6 and 7 — teaching comparison</title>').replace(/<select id="lesson">.*?<\/select>/,`<select id="lesson">${boundaries.lessons.map(b=>`<option value="${b.lessonId.slice(-2)}">${b.lessonId.slice(-2)} · ${b.title}</option>`).join('')}</select>`).replaceAll('57231','57241').replaceAll('57232','57242').replaceAll('lesson-01','lesson-06').replaceAll('lesson=01','lesson=06').replaceAll('New · teacher-led batch 1','New · teacher-led lessons 6–7').replace("const number=['01','03','04'].includes(value)?value:'01';lesson.value=number;","const number=['06','07'].includes(value)?value:'06';lesson.value=number;");
wrapper=wrapper.replace(/<details class="note"[\s\S]*?<\/details>/,'<details class="note" style="padding:8px 16px;border-bottom:1px solid #cbd2cb"><summary>Review notes: retained checks and source limits</summary><p>New lessons 6–7 are proposals for Dean’s review. Existing checks, saving and progress stay unchanged; foundational teaching overlaps some checks, so these are supported review rather than fresh transfer. Lesson 7’s protected textbook links still point to 596/598; ABO source pages are 604–606. Optional historical-source and wording issues remain recorded for later decisions. Earlier revisions 1–5 are preserved; 8–15 remain previous versions. No live course integration.</p></details>');
write(path.join(output,'index.html'),wrapper);protect();
const report={sourceOwnerSha256:sha(original),candidateSha256:sha(candidate),payloadsVerified:66,protectedSourceFilesUnchanged:protections.length,unchangedNativeFiles:nativeCount,replacements,nonTeachingBytesExact:true,nativeDataAndControlsExact:true,otherLessonsExact:true,teacherAccepted:false,canonicalIntegrated:false,released:false};write(path.join(output,'preservation-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({output,...report},null,2));
