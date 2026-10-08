import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { inspectCourseAuthoringProject } from './lib/course-authoring/context.js';

const records=[];
for(const dir of (await fs.readdir('projects',{withFileTypes:true})).filter(x=>x.isDirectory()&&/^ela\d/.test(x.name)).sort((a,b)=>a.name.localeCompare(b.name))){
 const root=path.resolve('projects',dir.name),manifestPath=path.join(root,'meta/project.json');
 let manifest:any;try{manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));}catch{continue;}
 const declared=manifest.canonicalEntry||manifest.workspaceEntrypoint||'workspace/index.html';
 const entry=path.isAbsolute(declared)?declared:declared.startsWith('projects/')?path.resolve(declared):path.join(root,declared);
 const doctor=await inspectCourseAuthoringProject(dir.name);
 let html:string;try{html=await fs.readFile(entry,'utf8');}catch{records.push({slug:dir.name,doctor:doctor.status,missingEntry:entry,issues:doctor.issues});continue;}
 const $=load(html),missing=new Set<string>(),remoteScripts:string[]=[],syntaxErrors:any[]=[];
 $('script[src],link[rel="stylesheet"][href],img[src],iframe[src],source[src]').each((_,el)=>{
  const value=$(el).attr('src')||$(el).attr('href')||'';
  if($(el).is('script')&&/^https?:\/\//.test(value))remoteScripts.push(value);
  if(!value||/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(value))return;
  let decoded:string;try{decoded=decodeURIComponent(value.split(/[?#]/)[0]);}catch{missing.add(value);return;}
  if(decoded.startsWith('/')){missing.add('root-relative dependency: '+value);return;}
  const asset=path.resolve(path.dirname(entry),decoded);if(!path.relative(root,asset).startsWith('..'))try{requireFile(asset);}catch{missing.add(value);}
 });
 function requireFile(file:string){return fsSync.statSync(file).isFile()||(()=>{throw Error('Not file');})();}
 $('script:not([src])').each((index,el)=>{
  const type=$(el).attr('type')||'';if(type&&!/^(?:text\/javascript|application\/javascript)$/.test(type))return;
  try{new vm.Script($(el).html()||'',{filename:`${dir.name}:script-${index}`});}catch(error){syntaxErrors.push({index,message:String(error)});}
 });
 const ids=$('[id]').map((_,e)=>$(e).attr('id')).get();const duplicates=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
 records.push({slug:dir.name,title:manifest.title,driver:manifest.authoring?.driverId,doctor:doctor.status,doctorIssues:doctor.issues,sha256:createHash('sha256').update(html).digest('hex'),missingLocalAssets:[...missing],remoteScripts,syntaxErrors,duplicateIds:duplicates,sections:$('section[id]').length,localUtilities:$('link[data-ela-local-utilities]').length===1});
}
import fsSync from 'node:fs';
const failures=records.filter(x=>x.doctor!=='pass'||'missingEntry'in x||x.missingLocalAssets?.length||x.remoteScripts?.length||x.syntaxErrors?.length);
const report={schemaVersion:1,boundary:'ELA canonical learner entries; static/doctor sweep, not full interaction or LMS proof',records,failures:failures.length};
const out=path.resolve('projects/ela30-1-modern-drama/meta/studio-population-sweep/catalog-audit.json');await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,JSON.stringify(report,null,2)+'\n');
for(const r of records)console.log(JSON.stringify({slug:r.slug,doctor:r.doctor,missing:'missingEntry'in r?1:r.missingLocalAssets?.length,remoteRuntime:r.remoteScripts?.length,syntax:r.syntaxErrors?.length,duplicateIds:r.duplicateIds?.length}));
console.log(`${records.length} ELA courses; ${failures.length} static/doctor failures. Report: ${out}`);
if(failures.length)process.exitCode=1;
