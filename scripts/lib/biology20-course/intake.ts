import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,mkdtemp,rename,rm,lstat,readdir} from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import {load} from 'cheerio';
import pdf from 'pdf-parse';
import {normalizeArchivePath,decodeD2lText,inspectBrightspaceArchiveBuffer} from '../science-comparison.js';
import {validateProjectManifestPolicy} from '../project-manifest-policy.js';
import type {ProjectManifest} from '../types.js';

export const ROOT='projects/resources/biology20-production/v1';
export const MODULES=[
 {id:'a',title:'Energy and Matter Exchange in the Biosphere',chapters:[1,2],deck:'Bio 20 Unit A Notes.pptx'},
 {id:'b',title:'Ecosystems and Population Change',chapters:[3,4],deck:'B20 Unit B Notes.pptx'},
 {id:'c',title:'Photosynthesis and Cellular Respiration',chapters:[5],deck:'B20 Unit C Notes.pptx'},
 {id:'d-part-1',title:'Digestion, Respiration and Circulation',chapters:[6,7,8],deck:'B20 Unit D Part 1 Notes.pptx'},
 {id:'d-part-2',title:'Excretion and Muscular Systems',chapters:[9,10],deck:'B20 Unit D Part 2 Slides.pptx'}
] as const;
export const PROGRAM_URL='https://education.alberta.ca/media/159727/bio203007.pdf';
export const sha=(value:Buffer|string)=>createHash('sha256').update(value).digest('hex');
const exists=async(f:string)=>lstat(f).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e;});
const json=(value:unknown)=>JSON.stringify(value,null,2)+'\n';
/** Intake is not publication: credentials stay only in the preserved original. */
export function redactSourceText(text:string){return text.replace(/(?:login|password|username)\s*:\s*\S+/gi,'[teacher credential removed]');}
export function sourceDisposition(name:string){
 if(/(?:questiondb|quiz_d2l_|(?:^|[ /_])(?:exam|test|key|answers?)(?:[ ._/]|$)|\bexam\b|\btest\b|\bkey\b|\banswers?\b)/i.test(name))return 'restricted-assessment-reference';
 if(/\.(?:swf|exe|js)$/i.test(name))return 'inactive-legacy-runtime';
 return 'reference-pending-selection';
}
export async function safeZip(bytes:Buffer){
 const z=await JSZip.loadAsync(bytes,{createFolders:false}),seen=new Set<string>();let expanded=0;
 for(const e of Object.values(z.files)){
  const name=normalizeArchivePath(e.unsafeOriginalName??e.name);
  if(seen.has(name))throw Error(`Duplicate normalized archive member: ${name}`);seen.add(name);
  const mode=typeof e.unixPermissions==='number'?e.unixPermissions:0;
  if((mode&0o170000)===0o120000)throw Error(`Archive symlink refused: ${name}`);
  const size=(e as unknown as {_data?:{uncompressedSize:number}})._data?.uncompressedSize??0;expanded+=size;
  if(size>1_500_000_000||expanded>6_000_000_000||seen.size>25000)throw Error('Archive exceeds bounded intake size');
 }
 await JSZip.loadAsync(bytes,{createFolders:false,checkCRC32:true});
 return z;
}
const xml=(text:string)=>load(text,{xmlMode:true});
function paragraphs(text:string){const $=xml(text);return $('*').filter((_i,e)=>e.type==='tag'&&(e.name==='a:p'||e.name==='w:p')).map((_i,e)=>$(e).find('*').filter((_j,n)=>n.type==='tag'&&(n.name==='a:t'||n.name==='w:t')).map((_j,n)=>$(n).text()).get().join('')).get().map(t=>redactSourceText(t.trim())).filter(Boolean);}
function relationships(text:string){const $=xml(text);return $('Relationship').map((_i,e)=>({id:$(e).attr('Id')!,type:$(e).attr('Type')!,target:$(e).attr('Target')!,external:$(e).attr('TargetMode')==='External'})).get();}
async function bytes(z:JSZip,name:string){const entry=z.file(name);if(!entry)throw Error(`Missing source member ${name}`);return entry.async('nodebuffer');}
export async function sourceTree(root:string){const files:Record<string,string>={};async function walk(rel:string){for(const name of (await readdir(path.join(root,rel))).sort()){const key=path.posix.join(rel,name),s=await lstat(path.join(root,key));if(s.isSymbolicLink())throw Error(`Protected source is a symlink: ${key}`);if(s.isDirectory())await walk(key);else files[key]=sha(await readFile(path.join(root,key)));}}await walk('');return{sha256:sha(json(files)),files};}

export async function intakeBiology20(repo:string,bundle:string){
 const root=path.join(repo,ROOT),targets=MODULES.map(m=>path.join(repo,'projects',`biology20-unit-${m.id}`));
 for(const f of [root,...targets])if(await exists(f))throw Error(`Refusing to overwrite existing Biology 20 input: ${f}`);
 const stat=await lstat(bundle);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Bundle must be a regular file');
 const original=await readFile(bundle),outerHash=sha(original),outer=await safeZip(original);
 for(const m of MODULES)if(!outer.file(m.deck))throw Error(`Missing required deck: ${m.deck}`);
 for(let chapter=1;chapter<=10;chapter++)if(!outer.file(`Chapter ${chapter} Daily Plans.docx`))throw Error(`Missing chapter ${chapter} plan`);
 const response=await fetch(PROGRAM_URL,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error(`Official curriculum HTTP ${response.status}`);
 const program=Buffer.from(await response.arrayBuffer()),programResult=await pdf(program);
 if(programResult.numpages<70||!programResult.text.includes('20–A')&&!programResult.text.includes('20– A'))throw Error('Official source is not the full Biology 20–30 program');
 const reference:Record<string,unknown>={};for(const slug of ['biology30-unit-a-pilot-2','biology30-unit-b','biology30-unit-c','biology30-unit-d'])reference[slug]=await sourceTree(path.join(repo,'projects',slug,'workspace'));
 await mkdir(path.dirname(root),{recursive:true});const stage=await mkdtemp(path.join(path.dirname(root),'.intake-'));const resources=path.join(stage,'resources');await mkdir(resources);
 const promoted:string[]=[];
 const put=async(relative:string,data:Buffer|string)=>{const f=path.join(resources,relative);await mkdir(path.dirname(f),{recursive:true});await writeFile(f,data);};
 const blob=async(data:Buffer,ext:string)=>{const rel=`assets/${sha(data)}${ext.toLowerCase()}`;if(!await exists(path.join(resources,rel)))await put(rel,data);return rel;};
 try{
  await put(`_sources/${outerHash}.zip`,original);await put('authority/program.pdf',program);await put('authority/program.txt',programResult.text);
  await put('authority/source.json',json({url:PROGRAM_URL,retrievedAt:new Date().toISOString(),sha256:sha(program),pages:programResult.numpages,course:'BIO 20',mappingStatus:'pending',notBiology30PerformanceStandards:true}));
  await put('reference/biology30-workspaces.json',json(reference));
  const inventory:any[]=[],decks:any[]=[],plans:any[]=[],exports:any[]=[],findings:any[]=[];
  for(const entry of Object.values(outer.files).filter(e=>!e.dir&&!e.name.startsWith('__MACOSX/'))){
   const data=await entry.async('nodebuffer'),member={name:entry.name,sha256:sha(data),bytes:data.length,locator:`_sources/${outerHash}.zip!/${entry.name}`};inventory.push(member);
   const z=await safeZip(data);
   if(entry.name.endsWith('.pptx')){
    const module=MODULES.find(m=>m.deck===entry.name);if(!module)throw Error(`Unmapped teaching deck: ${entry.name}`);
    const slides:any[]=[];
    for(const n of Object.keys(z.files).filter(n=>/^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a,b)=>Number(a.match(/(\d+)\.xml$/)![1])-Number(b.match(/(\d+)\.xml$/)![1]))){
     const number=Number(n.match(/(\d+)\.xml$/)![1]),text=decodeD2lText(await bytes(z,n)),relFile=`ppt/slides/_rels/slide${number}.xml.rels`,rels=z.file(relFile)?relationships(decodeD2lText(await bytes(z,relFile))):[],media:any[]=[];let notes:string[]=[];
     for(const rel of rels){
      if(rel.external){media.push({...rel,status:'link-pending-content-caption-rights-review'});continue;}
      const target=normalizeArchivePath(path.posix.join(path.posix.dirname(n),rel.target));
      if(rel.type.endsWith('/notesSlide')){notes=paragraphs(decodeD2lText(await bytes(z,target)));continue;}
      if(rel.type.endsWith('/image'))media.push({...rel,path:await blob(await bytes(z,target),path.posix.extname(target)),sourceMember:target,status:'pending-scientific-and-visual-review'});
     }
     slides.push({number,paragraphs:paragraphs(text),notes,media,disposition:'pending-topic-mapping'});
    }
    const record={...member,module:module.id,slideCount:slides.length,slides};decks.push(record);await put(`extracted/decks/${module.id}.json`,json(record));
   }else if(entry.name.endsWith('.docx')){
    const text=decodeD2lText(await bytes(z,'word/document.xml')),$=xml(text),rows=$('w\\:tr').map((_i,r)=>({cells:$(r).children('w\\:tc').map((_j,c)=>paragraphs($.xml(c)).join('\n')).get()})).get();
    const record={...member,paragraphs:paragraphs(text),rows};plans.push(record);
    if(/Unit [BC] Review/.test(entry.name)&&record.paragraphs.some(t=>/Unit A Textbook/.test(t)))findings.push({source:entry.name,finding:'Review label says Unit A inside a different unit plan',disposition:'correct-label-after-textbook-folio-check'});
   }else if(entry.name.endsWith('.zip')){
    const inspection=await inspectBrightspaceArchiveBuffer(data),id=/Winter 2020/.test(entry.name)?'system-2020':'class-2026-27',members:any[]=[];
    for(const inner of Object.values(z.files).filter(e=>!e.dir&&!e.name.startsWith('__MACOSX/'))){
     const b=await inner.async('nodebuffer'),disposition=sourceDisposition(inner.name),item:any={path:inner.name,bytes:b.length,sha256:sha(b),disposition};
     if(/\.html?$/i.test(inner.name)&&disposition==='reference-pending-selection'){
      const $=load(decodeD2lText(b));$('script,style').remove();item.title=$('title').text();item.links=$('a[href]').map((_i,a)=>({text:$(a).text(),href:$(a).attr('href')})).get();
      await put(`extracted/brightspace/${id}/${sha(b)}.txt`,redactSourceText($('body').text().replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n').trim()));item.textPath=`extracted/brightspace/${id}/${sha(b)}.txt`;
     }
     if(id==='system-2020'&&/^_\d+.*inquirybio.*\.pdf$/i.test(inner.name)){item.assetPath=await blob(b,'.pdf');const parsed=await pdf(b);item.pdfPages=parsed.numpages;item.textPath=`extracted/textbook/${sha(b)}.txt`;await put(item.textPath,parsed.text);}
     members.push(item);
    }
    await put(`extracted/brightspace/${id}/imsmanifest.xml`,await bytes(z,inspection.manifestPath));
    const record={...member,id,inspection,members};exports.push(record);await put(`extracted/brightspace/${id}/catalogue.json`,json(record));
   }else throw Error(`Unexpected bundle member: ${entry.name}`);
  }
  if(exports.length!==2)throw Error('Expected exactly two Brightspace exports');
  await put('extracted/plans.json',json(plans));
  findings.push({finding:'Calendar pacing is not a measured duration; chapter 5 repeats respiration over two days',disposition:'merge-continuation-into-one-topic; preserve-two-day-allocation'},{finding:'Slide 100 is assigned at the respiratory/circulatory boundary',disposition:'inspect-slide-and-map-once-with-cross-reference'},{finding:'No standalone Unit A review plan in outer bundle',disposition:'resolve-from-current-class-export-and-chapter-reviews'},{finding:'Physical investigations require online adaptations',disposition:'author-supplied-evidence; no-physical-performance-claim'});
  await put('source-dispositions.json',json({schemaVersion:1,findings,secureMaterial:'original-archive-only; no automatic learner selection',sourcePrecedence:['official-curriculum','daily-plans-and-slides','textbook-and-current-class-support','system-2020-support'],academicReview:'pending'}));
  const manifest={schemaVersion:1,course:'BIO 20',createdAt:new Date().toISOString(),bundle:{path:`_sources/${outerHash}.zip`,sha256:outerHash,originalName:path.basename(bundle)},members:inventory,modules:MODULES.map(m=>({id:m.id,chapters:m.chapters,slideCount:decks.find(d=>d.module===m.id).slideCount})),sourceCount:inventory.length,slideCount:decks.reduce((sum,d)=>sum+d.slideCount,0),authoritySha256:sha(program),learnerFilesCreated:false};
  await put('resource-manifest.json',json(manifest));
  for(const module of MODULES){
   const slug=`biology20-unit-${module.id}`,canonical=`${ROOT}/units/${module.id}/contract.json`;
   await put(`units/${module.id}/contract.json`,json({schemaVersion:1,profileId:'biology20-topic-sequence-v1',courseId:'biology20',moduleId:module.id,slug,title:module.title,chapters:module.chapters,status:'intake-complete',sourceManifestSha256:sha(json(manifest)),topics:[],requiredRoutes:[],delivery:'independent-online',frayer:{fixedCount:6,choiceCount:2},storage:{namespace:`${slug}:state:v1`,target:44000,hardLimit:48000},teacherAcceptance:null}));
   const project:ProjectManifest={id:slug,slug,createdAt:manifest.createdAt,updatedAt:manifest.createdAt,title:`Biology 20 — ${module.id.toUpperCase().replace('-PART-',' Part ')}: ${module.title}`,sourcePath:`${ROOT}/_sources/${outerHash}.zip`,inputKind:'brightspace-zip',brightspaceTarget:'course-page',previewModes:['workspace'],workspaceEntrypoint:'workspace/index.html',rawEntrypoint:'',learningSource:'other',learningTrust:'curated',learningUpdatedAt:new Date().toISOString(),migrationState:'migrated',projectType:'conversion',preferredWorkflows:['conversion'],canonicalEntry:canonical,canonicalSources:[canonical,`${ROOT}/resource-manifest.json`],generatedOutputs:[],authoringStatus:'blocked',authoring:{driverId:'proposal-only-v1',familyId:'biology20-production',qualityProfile:'biology20-topic-sequence-v1',studioEditing:{enabled:false}},exportTargets:[{target:'html',enabled:false},{target:'scorm',enabled:false}]};
   const checked=validateProjectManifestPolicy(project);if(checked.errors.length)throw Error(JSON.stringify(checked.errors));
   const p=path.join(stage,slug,'meta');await mkdir(p,{recursive:true});await writeFile(path.join(p,'project.json'),json(project));await writeFile(path.join(p,'prompt-pack.md'),`# ${project.title}\n\nCanonical source: ${canonical}\n\nApproved conversion: five modules, daily-plan sequence, fully online, continuous build. Reuse final Biology 30 presentation and interactions; do not edit its outputs. Intake only: no learner candidate exists yet. No release, Studio editing, deployment, or export authority.\n`);
  }
  for(const slug of Object.keys(reference))if(json(await sourceTree(path.join(repo,'projects',slug,'workspace')))!==json(reference[slug]))throw Error(`Biology 30 reference changed during intake: ${slug}`);
  await rename(resources,root);promoted.push(root);
  for(let i=0;i<MODULES.length;i++){await rename(path.join(stage,`biology20-unit-${MODULES[i].id}`),targets[i]);promoted.push(targets[i]);}
  return {resourceRoot:ROOT,modules:MODULES.length,slides:manifest.slideCount,bundleSha256:outerHash,status:'intake-complete; learner authoring pending'};
 }catch(error){for(const f of promoted.reverse())await rm(f,{recursive:true,force:true});throw error;}finally{await rm(stage,{recursive:true,force:true});}
}
