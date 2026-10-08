import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import JSZip from 'jszip';
import {load} from 'cheerio';

const repo=process.cwd(), project=path.join(repo,'projects/biology30-chapter-17');
const out=path.join(project,'meta/teaching-overhaul/2026-10-03-scout-authoring');
const ch11=path.join(repo,'projects/biology30-unit-a-pilot-3/meta/teaching-overhaul');
const sha=b=>createHash('sha256').update(b).digest('hex');
await fs.mkdir(path.dirname(out),{recursive:true});
try{await fs.mkdir(out);await fs.mkdir(path.join(out,'upload-ready'));}catch(error){assert.equal(error.code,'EEXIST');assert.deepEqual(await fs.readdir(out),['upload-ready'],'Refuse overwrite');assert.deepEqual(await fs.readdir(path.join(out,'upload-ready')),[],'Refuse overwrite');}
const inputs=[],packet=new JSZip(),exemplar=new JSZip();
async function add(zip,relative,absolute){const b=await fs.readFile(absolute);zip.file(relative,b);inputs.push({package:zip===packet?'chapter17':'chapter11-exemplar',path:relative,source:absolute,bytes:b.length,sha256:sha(b)});return b;}
async function tree(zip,absolute,relative,exclude=()=>false){for(const x of await fs.readdir(absolute,{withFileTypes:true})){assert(!x.isSymbolicLink());if(exclude(x.name))continue;const a=path.join(absolute,x.name),r=path.posix.join(relative,x.name);if(x.isDirectory())await tree(zip,a,r,exclude);else if(x.isFile())await add(zip,r,a);}}
await tree(packet,path.join(project,'workspace'),'native/workspace',n=>n==='portable');
await add(packet,'native/project.json',path.join(project,'meta/project.json'));
await tree(packet,path.join(project,'meta/external-generation/authoring'),'historical-authoring');
const sourceStandard=path.join(ch11,'2026-10-02-source-handoff/supplied-standard/02_TEACHING_STANDARD.md');
await add(packet,'standards/02_TEACHING_STANDARD.md',sourceStandard);
await add(packet,'standards/SCOUT_CHAPTER_PASS_PROCESS.md',path.join(ch11,'2026-10-03-scout-standard/SCOUT_CHAPTER_PASS_PROCESS.md'));
await add(packet,'standards/CHAPTER11_TEACHING_STANDARD.md',path.join(ch11,'2026-10-03-scout-standard/CHAPTER11_TEACHING_STANDARD.md'));
await add(packet,'sources/Alberta-program-cached-original.pdf',path.join(ch11,'2026-10-02-source-handoff/sources/authority/program.pdf'));
await add(packet,'sources/authority-cache-registry.json',path.join(ch11,'2026-10-02-source-handoff/sources/authority-cache-registry.json'));
const archivePath='/Users/deanguedo/Downloads/biology resources/UnitC.zip';
const archiveBytes=await fs.readFile(archivePath),archive=await JSZip.loadAsync(archiveBytes);
inputs.push({path:'UnitC.zip',source:archivePath,bytes:archiveBytes.length,sha256:sha(archiveBytes),role:'read-only original archive; only selected original members included'});
const deckName='Unit C Part B Mendelian Genetics .pptx';
const deck=await archive.file(deckName).async('nodebuffer');
packet.file('sources/'+deckName,deck);inputs.push({path:'sources/'+deckName,source:archivePath+'!/'+deckName,bytes:deck.length,sha256:sha(deck)});
assert.equal(sha(deck),'da1ce1c0526da4da1aefd1fb6c0f23070f820ce24378c12f9699d1c700e1a985');
const nestedName=Object.keys(archive.files).find(n=>n.startsWith('D2LExport_')&&n.endsWith('.zip'));
const nested=await JSZip.loadAsync(await archive.file(nestedName).async('nodebuffer'));
const qtiNames=Object.keys(nested.files).filter(n=>/quiz_d2l_(59230|59242)\.xml$/.test(n));
assert(qtiNames.length>=1,'Original chapter17 QTI missing');
for(const name of qtiNames){const b=await nested.file(name).async('nodebuffer');packet.file('sources/qti/'+path.basename(name),b);inputs.push({path:'sources/qti/'+path.basename(name),source:archivePath+'!/'+nestedName+'!/'+name,bytes:b.length,sha256:sha(b)});}
// Retain all image resources referenced by selected quiz XML when resolvable.
const imageGaps=[];
for(const name of qtiNames){const raw=await nested.file(name).async('string');const $=load(raw,{xml:true});const refs=new Set();$('mattext').each((_,n)=>{const html=load($(n).text(),{},false);html('img').each((_,img)=>refs.add(img.attribs.src));});for(const ref of refs){const clean=decodeURIComponent(ref||'').split('?')[0];const found=Object.keys(nested.files).filter(n=>!n.startsWith('__MACOSX/')&&!nested.files[n].dir&&(n===clean||n.endsWith('/'+path.basename(clean))));if(found.length===1){const b=await nested.file(found[0]).async('nodebuffer');packet.file('sources/qti-images/'+path.basename(clean),b);inputs.push({path:'sources/qti-images/'+path.basename(clean),source:archivePath+'!/'+nestedName+'!/'+found[0],bytes:b.length,sha256:sha(b)});}else imageGaps.push({quiz:name,reference:ref,matches:found.length});}}
const html=await fs.readFile(path.join(project,'workspace/index.html'),'utf8'),$=load(html);
const routes=$('.course-page').toArray().map(n=>({id:n.attribs.id,title:$(n).find('h1').first().text()}));
for(const route of routes.filter(r=>r.id.startsWith('lesson-')||r.id==='extension'))packet.file('current-lessons/'+route.id+'.html.txt',$.html($('#'+route.id)));
const returned=path.join(ch11,'2026-10-03-scout-standard/returned/Biology30_CH11_Manuscript_Handoff_v1.0.0');
for(const name of ['manuscripts','integration-text'])await tree(exemplar,path.join(returned,name),name);
for(const name of ['CHAPTER_PROGRESSION.md','CONTINUITY_LEDGER.md','BIOLOGY_TEACHING_STANDARD_PROPOSAL.md','OPEN_ISSUES.md','README_TEACHER_DECISION.md','MANIFEST.json'])await add(exemplar,name,path.join(returned,name));
const binding={schemaVersion:1,revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),nativeIndexSha256:sha(html),routes,authoringStatus:'blocked, unchanged',teachingOwner:'projects/biology30-chapter-17/workspace/index.html',interactionOwners:['workspace/main.js','meta/external-generation/authoring/course-config.json','workspace/assets/revision-activities.js','workspace/assets/revision-practice.js'],saveNamespace:'biology30-chapter-17:html:v1; scoped by native LMS owner when applicable',preserve:['routes and current navigation','original assessment/option IDs and keys; flag conflicts, do not silently revise','existing saves and immutable attempts','required progress versus optional practice','approved labeling images and answer mappings','native fonts/styles/layout/vocabulary/reader/media','all Practice & Review and Process Collection surfaces'],sourceNotes:['Historical lesson-content.json must not overwrite current HTML','Prompt-pack is stale; context:project refuses blocked project; this task remains external manuscript/evaluation work, not activation','Cached Alberta program is dated evidence: verify applicable Unit C scope and report gaps rather than invent codes','Full daily plans and Unit C original mixed-chapter tests are not included; historical extracted context is identified separately','Chapter 11 exemplar is a selected teaching direction, not exact-copy teacher/science approval','Dean explicitly selected Chapter17 next; Chapter19 quantitative calibration remains unperformed; assess quantitative teaching in this chapter directly'],originalQuizImageGaps:imageGaps};
packet.file('SOURCE_BINDING_AND_PRESERVATION.json',JSON.stringify(binding,null,2));
const attachments=[];
for(const [stem,zip] of [['Biology30_CH17_Source_Handoff_2026-10-03',packet],['Biology30_CH11_Teaching_Exemplar_v1.0.0',exemplar]]){
 let part=new JSZip(),size=0,count=1;
 async function flush(){if(!size)return;const name=stem+'_Part_'+count+'.zip',b=await part.generateAsync({type:'nodebuffer',compression:'DEFLATE'});assert(b.length<20_000_000,'Single member over attachment limit');const a=path.join(out,'upload-ready',name);await fs.writeFile(a,b,{flag:'wx'});assert.equal(sha(await fs.readFile(a)),sha(b));attachments.push({name,path:a,bytes:b.length,sha256:sha(b)});part=new JSZip();size=0;count++;}
 for(const name of Object.keys(zip.files).sort()){if(zip.files[name].dir)continue;const b=await zip.file(name).async('nodebuffer');if(size+b.length>18_000_000)await flush();part.file(name,b);size+=b.length;}
 await flush();
}
await fs.writeFile(path.join(out,'SOURCE_HANDOFF_MANIFEST.json'),JSON.stringify({preparedAt:new Date().toISOString(),binding,inputs,attachments,sourceReady:'bounded sources assembled; Scout must verify read/attachment before authoring; gaps explicit',authored:false,teacherAccepted:false,integrated:false,released:false,route:'Lead source authority and deterministic source packaging; no worker or Muse; usage savings unknown'},null,2),{flag:'wx'});
console.log(JSON.stringify({out,attachments,routes:routes.filter(r=>r.id.startsWith('lesson-')||r.id==='extension'),imageGaps,canonicalCourseChanged:false}));
