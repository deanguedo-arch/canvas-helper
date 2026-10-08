import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';

const parent=path.resolve('projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer');
const incoming='/Users/deanguedo/Downloads/Biology30_CH17_Remaining08_15_Extension_Teacher_Transfer_v0.1.0';
const trial=path.join(parent,'teacher-led-remaining-08-15-extension-v0.1.0');
const returned=path.join(trial,'pro-return'),output=path.join(trial,'evaluation');
const prior=path.join(parent,'teacher-led-batch-06-07-v0.1.0/evaluation');
const read=(root,p)=>fs.readFileSync(path.join(root,p));
const json=(root,p)=>JSON.parse(read(root,p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const assert=(ok,m)=>{if(!ok)throw Error(m);};
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const safe=p=>!path.isAbsolute(p)&&!p.split('/').includes('..');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{assert(!e.isSymbolicLink(),'Symlink in intake');return e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)];});
assert(!fs.existsSync(trial),'Existing review is immutable; version anew.');
const manifest=json(incoming,'MANIFEST.json');
assert(manifest.files.length===183,'Unexpected payload inventory.');
const known=new Set(['MANIFEST.json','CHECKSUMS.sha256',...manifest.files.map(r=>r.path)]);
for(const file of walk(incoming))assert(known.has(path.relative(incoming,file)),'Unlisted intake file');
for(const r of manifest.files){assert(safe(r.path),'Unsafe path');const b=read(incoming,r.path);assert(b.length===r.bytes&&sha(b)===r.sha256,`Payload mismatch ${r.path}`);}
for(const l of read(incoming,'CHECKSUMS.sha256').toString().trim().split('\n')){const m=/^([a-f0-9]{64})\s+\*?(.+)$/.exec(l);assert(m&&safe(m[2]),'Unsafe checksum');assert(sha(read(incoming,m[2]))===m[1],`Checksum ${m[2]}`);}
assert(sha(read(incoming,'MANIFEST.json'))==='c650a09092a9808a135990317c9d275cb31e8655b6d609aa6e3f2551b30613e1','Manifest receipt drift');
const map=json(incoming,'INTEGRATION_MAP.json'),protections=json(incoming,'raw-before/SOURCE_PROTECTION.json');
const protect=()=>{for(const r of protections)assert(sha(fs.readFileSync(r.file))===r.sha256,`Protected drift: ${r.file}`);};
protect();
const original=read(prior,'new/index.html'),originalText=original.toString();
assert(sha(original)==='480d60d752d717b9d947098695b043bf85776dff4fcb796725a6506c298f7262','Signed-off current owner drift');
const frozen=read(incoming,'raw-before/frozen-source-owner-index.html');
assert(sha(frozen)===map.sourceOwnerSha256,'Frozen source mismatch');
const old=load(originalText,{sourceCodeLocationInfo:true}),vocabulary=new Set(JSON.parse(old('#course-data').text()).words.map(w=>w.id));
const exact=(e,t)=>t.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
const boundaries=[],assets=new Set();
const relationships=json(incoming,'source-reference/SOURCE_ASSET_RELATIONSHIPS.json');
const sourceImages=new Map(relationships.slides.flatMap(s=>s.shapes.flatMap(p=>p.images||[])).map(i=>[i.sha256,i]));
const ppt=path.join(parent,'teacher-led-batch-06-07-v0.1.0/source-handoff/sources/original-114-slides.pptx');
const member=p=>{assert(/^ppt\/media\/[a-zA-Z0-9._-]+$/.test(p),'Unsafe source member');return execFileSync('unzip',['-p',ppt,p],{maxBuffer:32*1024*1024});};
for(const b of map.lessons){
 const before=read(incoming,`raw-before/${b.route}.before.html`),route=read(incoming,`raw-before/${b.route}.html`);
 assert(sha(route)===b.lessonSha256&&sha(before)===b.beforeSha256,'Raw route mismatch');
 assert(frozen.subarray(b.startByte,b.endByteExclusive).equals(before),'Frozen interval mismatch');
 // Match a complete route in the current owner before locating its teaching bytes.
 const routeStart=original.indexOf(route);assert(routeStart>=0&&original.indexOf(route,routeStart+1)<0,`Current complete route changed: ${b.route}`);
 const local=route.indexOf(before);assert(local>=0&&route.indexOf(before,local+1)<0,'Ambiguous interval');
 const start=routeStart+local,end=start+before.length;
 const header=route.subarray(0,local),suffix=route.subarray(local+before.length);
 assert(sha(header)===b.protectedHeaderSha256&&sha(suffix)===b.protectedSuffixSha256,'Protected route edges drift');
 const fragment=read(incoming,b.fragment),text=fragment.toString();
 assert(fragment.length===b.afterBytes&&sha(fragment)===b.afterSha256,'Fragment drift');
 const a=load(before.toString(),{sourceCodeLocationInfo:true},false),f=load(text,{sourceCodeLocationInfo:true},false);
 assert(!f('script,style,iframe,object,embed,link,input,select,textarea,form,[data-save-note]').length,'New active element outside scope');
 for(const e of f('*').toArray())for(const [n,v]of Object.entries(e.attribs))assert(!/^on/i.test(n)&&n!=='style'&&!/javascript:/i.test(v),'Unsafe attribute');
 for(const tag of b.preservedOuterTags)assert(text.includes(tag),'Outer tag drift');
 for(const id of b.existingIds)assert(f(`[id="${id}"]`).length===1,'Existing ID lost');
 for(const e of a('[data-canvas-helper-edit-key]').toArray()){const k=e.attribs['data-canvas-helper-edit-key'],n=f(`[data-canvas-helper-edit-key="${k}"]`);assert(n.length===1&&n.attr('data-canvas-edit-key')===e.attribs['data-canvas-edit-key'],'Edit key drift');}
 const terms=new Set(f('[data-term-id]').toArray().map(e=>e.attribs['data-term-id']));
 for(const id of b.existingVocabularyIds)assert(terms.has(id),'Existing term lost');
 for(const e of f('[data-term-id]').toArray())assert(e.tagName==='button'&&e.attribs.class==='bio-term'&&e.attribs.type==='button'&&e.attribs['aria-haspopup']==='dialog'&&vocabulary.has(e.attribs['data-term-id']),'Unbound vocabulary');
 for(const e of a('figure[data-figure-id]').toArray()){const n=f(`figure[data-figure-id="${e.attribs['data-figure-id']}"]`);assert(n.length===1&&exact(e,before.toString())===exact(n[0],text),'Locked figure drift');}
 for(const lock of b.lockedNested){const selector=lock.tag+Object.entries(lock.attrs).map(([k,v])=>`[${k}="${v}"]`).join(''),n=f(selector);assert(n.length===1&&sha(exact(n[0],text))===lock.sha256,'Locked subtree hash drift');}
 for(const e of f('button').toArray())assert(['data-term-id','data-enlarge-figure'].some(k=>k in e.attribs),'New button behavior');
 for(const e of f('img').toArray()){
  const src=e.attribs.src;assert(e.attribs.alt?.trim(),'Missing image alt');
  assert(/^\.\/assets\/(teaching-remaining-v010\/[a-zA-Z0-9._-]+|figures\/ch17-(pedigree|linkage|map)\.svg)$/.test(src),'Unexpected asset');
  const bytes=read(incoming,src),h=sha(bytes);
  if(src.includes('/figures/'))assert(h===sha(read(prior,'new/'+src)),'Existing figure pixels changed');
  else if(sourceImages.has(h))assert(h===sha(member(sourceImages.get(h).pptx_member)),'PPT pixels differ');
  else assert(src==='./assets/teaching-remaining-v010/textbook-p607-figure17-24.png'&&h==='9c65e61e53d50be362edc391b7a3eb5a57f335174c5ebb7f429de03637e05614','Unverified image');
  assets.add(src);
 }
 boundaries.push({route:b.route,frozenStartByte:b.startByte,startByte:start,endByteExclusive:end,beforeSha256:sha(before),afterSha256:sha(fragment),before,fragment});
}
boundaries.sort((a,b)=>a.startByte-b.startByte);let cursor=0;const parts=[];
for(const b of boundaries){assert(b.startByte>=cursor,'Overlapping boundaries');parts.push(original.subarray(cursor,b.startByte),b.fragment);cursor=b.endByteExclusive;}parts.push(original.subarray(cursor));
const candidate=Buffer.concat(parts),c=load(candidate.toString());
let reconstructed=candidate.toString();for(const b of [...boundaries].reverse()){const f=b.fragment.toString(),at=reconstructed.indexOf(f);assert(at>=0&&reconstructed.indexOf(f,at+1)<0,'Fragment repeated');reconstructed=reconstructed.slice(0,at)+b.before.toString()+reconstructed.slice(at+f.length);}assert(Buffer.from(reconstructed).equals(original),'Bytes outside teaching changed');
for(let i=1;i<=7;i++){const id='#lesson-'+String(i).padStart(2,'0');assert(exact(old(id)[0],originalText)===exact(load(candidate.toString(),{sourceCodeLocationInfo:true})(id)[0],candidate.toString()),'Signed-off lesson drift');}
for(const id of ['course-data','textbook-data','textbook-practice-data'])assert(c('#'+id).text()===old('#'+id).text(),'Native JSON drift');
const attrs=$=>$('[data-note-id],[data-save-note],[data-check-id],[data-check-question],[data-writing-question],[data-guided-item],[data-transfer]').toArray().map(e=>e.attribs);
assert(JSON.stringify(attrs(old))===JSON.stringify(attrs(c)),'Native controls drift');
const ids=c('[id]').toArray().map(e=>e.attribs.id);assert(new Set(ids).size===ids.length,'Duplicate document ID');
fs.mkdirSync(trial);fs.cpSync(incoming,returned,{recursive:true,errorOnExist:true});fs.mkdirSync(output);
fs.cpSync(path.join(prior,'new'),path.join(output,'baseline'),{recursive:true,errorOnExist:true});fs.cpSync(path.join(output,'baseline'),path.join(output,'new'),{recursive:true,errorOnExist:true});fs.writeFileSync(path.join(output,'new/index.html'),candidate);
for(const src of assets)if(src.includes('teaching-remaining-v010')){const dest=path.join(output,'new',src);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(returned,src),dest,fs.constants.COPYFILE_EXCL);}
let nativeCount=0;for(const file of walk(path.join(output,'baseline'))){const r=path.relative(path.join(output,'baseline'),file);if(r!=='index.html'){assert(sha(fs.readFileSync(file))===sha(read(output,'new/'+r)),'Native file drift');nativeCount++;}}
const sourceDir=path.join(output,'source');fs.mkdirSync(sourceDir);
const viewer='/Users/deanguedo/Documents/Codex/2026-10-04/task/source-assessment-trial-v0.3.0/evaluation/source';
fs.copyFileSync(ppt,path.join(sourceDir,'original-114-slides.pptx'));fs.copyFileSync(path.join(viewer,'Attachment51.png'),path.join(sourceDir,'Attachment51.png'));
const s=load(read(viewer,'viewer.html').toString());
for(const r of relationships.slides){const slide=s(`div.slide[data-slide="${r.slide}"]`);assert(slide.length===1,'Original slide absent');slide.find('img').each((_,e)=>{if(e.attribs.src!=='Attachment51.png')s(e).remove();});for(const pic of r.shapes.filter(p=>p.type==='pic')){const xml=load(pic.xml,{xmlMode:true}),t=xml('a\\:xfrm').first(),off=t.find('a\\:off')[0]?.attribs,ext=t.find('a\\:ext')[0]?.attribs;assert(off&&ext&&pic.images.length===1,'Original picture transform absent');const image=pic.images[0],name=path.basename(image.pptx_member),dest=path.join(sourceDir,name),bytes=member(image.pptx_member);assert(sha(bytes)===image.sha256,'Source picture hash mismatch');if(!fs.existsSync(dest))write(dest,bytes);slide.append(`<img src="${name}" alt="Original illustration from slide ${r.slide}" style="position:absolute;left:${Number(off.x)/12700}px;top:${Number(off.y)/12700}px;width:${Number(ext.cx)/12700}px;height:${Number(ext.cy)/12700}px;">`);}}
s('.render-note').text('Original slide layout; picture identities and placement restored from actual PPTX relationships. Historical source wording is unchanged and may contain documented errors. Fonts and animations may differ.');
const groups={'08':[[59,66,'59–66 · Sex-linked inheritance']],'09':[[72,73,'72–73 · Polygenic traits'],[92,93,'92–93 · Historical expression framing (source caveats)']],'10':[[74,78,'74–78 · Autosomal pedigrees'],[82,85,'82–85 · Family inference']],'11':[[79,81,'79–81 · Sex-linked crosses'],[86,91,'86–91 · Model testing']],'12':[[94,101,'94–101 · Linkage and exchange'],[103,106,'103–106 · Test-cross record']],'13':[[102,110,'102–110 · Frequency and limits'],[111,114,'111–114 · Mapping example']],'15':[[73,73,'73 · Recap'],[90,90,'90 · Pedigree synthesis'],[101,113,'101–113 · Linkage synthesis']]};
let sourceHtml=s.html().replace(/const groups=.*?;\n/,`const groups=${JSON.stringify(groups)};\n`).replace(/const lesson=new URL.*?;const ranges=/,"const requestedLesson=new URL(location.href).searchParams.get('lesson');const lesson=groups[requestedLesson]?requestedLesson:'08';const ranges=");write(path.join(sourceDir,'viewer.html'),sourceHtml);
for(const [route,page]of[['14',614],['extension',618]])write(path.join(sourceDir,route+'.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chapter 17 source context</title><body><h1>${route==='14'?'Genetic testing and counselling':'Biobanks and genetic information'}</h1><p>There is no dedicated PowerPoint section for this topic. The textbook is the primary source; historical clinical or policy passages are not current advice.</p><p><a target="_blank" rel="noopener" href="http://127.0.0.1:57252/assets/textbook/chapter-17.pdf#page=${page-583}">Open textbook printed page ${page}</a></p><iframe title="Original textbook source" style="width:100%;height:75vh;border:0" src="http://127.0.0.1:57252/assets/textbook/chapter-17.pdf#page=${page-583}"></iframe></body></html>`);
let wrapper=read(prior,'index.html').toString().replace(/<title>.*?<\/title>/,'<title>Chapter 17 remaining teaching comparison</title>').replace(/<select id="lesson">.*?<\/select>/,`<select id="lesson">${map.lessons.map(b=>`<option value="${b.route==='extension'?'extension':b.route.slice(-2)}">${b.route==='extension'?'Optional extension':b.route.slice(-2)+' · '+old('#'+b.route+' h1').first().text()}</option>`).join('')}</select>`).replaceAll('57241','57251').replaceAll('57242','57252').replaceAll('lesson-06','lesson-08').replaceAll('lesson=06','lesson=08').replaceAll('New · teacher-led lessons 6–7','New · remaining teacher-led lessons').replaceAll('Baseline before this three-lesson batch','Latest signed-off 1–7 copy · previous 8–15 teaching').replaceAll('New teacher-led batch 1','New teacher-led remaining batch');
wrapper=wrapper.replace("const number=['06','07'].includes(value)?value:'06';lesson.value=number;","const number=['08','09','10','11','12','13','14','15','extension'].includes(value)?value:'08';lesson.value=number;").replace('index.html#lesson-${number}','index.html#${number===\'extension\'?\'extension\':\'lesson-\'+number}').replace('const sourceUrl=`source/viewer.html?lesson=${number}`;','const sourceUrl=number===\'14\'||number===\'extension\'?`source/${number}.html`:`source/viewer.html?lesson=${number}`;');
wrapper=wrapper.replace(/<details class="note"[\s\S]*?<\/details>/,'<details class="note"><summary>Review scope and inherited source limits</summary><p>Signed-off lessons 1–7 are byte-for-byte preserved. Lessons 8–15 and the optional extension use the complete reviewed return, awaiting Dean’s acceptance. All native assessments, optional saved tasks, reader links, progress, fonts and runtime remain unchanged. Inherited source/key errors remain documented in the handoff; some questions need later teacher decisions. No canonical integration or release.</p></details>');
write(path.join(output,'index.html'),wrapper);protect();
const report={intake:'User-supplied extracted folder',archiveHashVerified:false,manifestSha256:sha(read(returned,'MANIFEST.json')),payloadsVerified:manifest.files.length,sourceOwnerSha256:map.sourceOwnerSha256,currentOwnerSha256:sha(original),candidateSha256:sha(candidate),rebase:boundaries.map(({before,fragment,...r})=>r),signedOffLessons1to7Exact:true,bytesOutsideTeachingExact:true,nativeJsonAndControlsExact:true,protectedSourceFilesUnchanged:protections.length,unchangedNativeFiles:nativeCount,newTeachingImages:[...assets].filter(p=>p.includes('teaching-remaining-v010')),teacherAccepted:false,canonicalIntegrated:false,released:false};write(path.join(output,'preservation-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({output,candidateSha256:report.candidateSha256,payloadsVerified:report.payloadsVerified,rebaseRoutes:boundaries.length,protectedSourceFilesUnchanged:protections.length,unchangedNativeFiles:nativeCount},null,2));
