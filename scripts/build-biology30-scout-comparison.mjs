import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cp,mkdir,readFile,readdir,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {load} from 'cheerio';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.join(repo,'projects/biology30-unit-a-pilot-3');
const sourceRoot=path.join(project,'workspace');
const reviewRoot=path.join(project,'meta/teaching-overhaul/2026-10-03-scout-standard');
const returned=path.join(reviewRoot,'returned/Biology30_CH11_Manuscript_Handoff_v1.0.0');
const target=path.join(reviewRoot,'comparison-copy');
const sha=x=>createHash('sha256').update(x).digest('hex');
async function inventory(root,prefix=''){
 const files=[];
 for(const item of (await readdir(path.join(root,prefix),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
  assert(!item.isSymbolicLink(),'No symlinks');
  const relative=path.posix.join(prefix,item.name);
  if(item.isDirectory())files.push(...await inventory(root,relative));
  else if(item.isFile()){const bytes=await readFile(path.join(root,relative));files.push({path:relative,bytes:bytes.length,sha256:sha(bytes)});}
 }
 return files;
}
const sourceFiles=await inventory(sourceRoot);
const original=await readFile(path.join(sourceRoot,'index.html'));
const map=JSON.parse(await readFile(path.join(returned,'INTEGRATION_MAP.json'),'utf8'));
assert.equal(sha(original),map.native_entry.sha256,'Native source drift: rebase before evaluation');
const patches=[],records=[];
function bound(b){const bytes=original.subarray(b.start_inclusive,b.end_exclusive);assert.equal(sha(bytes),b.sha256);return bytes;}
for(const route of map.manuscript_routes){
 bound(route.native_route);bound(route.insertion_after_header);
 const file=route.teaching_fragment_candidate;
 const bytes=await readFile(path.join(returned,file.path));
 assert.equal(sha(bytes),file.sha256);
 assert.equal(sha(await readFile(path.join(returned,route.approved_copy_candidate))),route.manuscript_sha256);
 const f=load(bytes.toString(),{},false);
 const tags=new Set('section h2 p strong figure div span small figcaption button h3 ol li label textarea details summary table thead tr th tbody td a img em'.split(' '));
 f('*').each((_,node)=>{
  assert(tags.has(node.name),'Untrusted fragment tag '+node.name);
  for(const [key,value] of Object.entries(node.attribs)){
   assert(!/^on/i.test(key)&&!['style','srcdoc','action','formaction'].includes(key),'Unsafe attribute');
   if(['src','href'].includes(key))assert(!/^(javascript:|data:|vbscript:|\/\/)/i.test(value),'Unsafe URL');
  }
 });
 assert.equal(f('[data-writing],[data-answer],[data-question],[data-activity],script').length,0);
 for(const image of f('img').toArray()){
  const src=image.attribs.src;assert(src.startsWith('assets/')&&!src.includes('..'));
  await stat(path.join(sourceRoot,src));
 }
 for(const child of route.replace_teaching_only_children){
  bound(child.boundary);patches.push({start:child.boundary.start_inclusive,end:child.boundary.end_exclusive,text:''});
 }
 patches.push({start:route.insertion_after_header.end_exclusive,end:route.insertion_after_header.end_exclusive,text:'\n'+bytes.toString()});
 for(const edit of route.header_text_edits){
  bound(edit.native_inner);assert.equal(sha(edit.proposed_inner_html),edit.proposed_inner_sha256);
  patches.push({start:edit.native_inner.start_inclusive,end:edit.native_inner.end_exclusive,text:edit.proposed_inner_html});
 }
 records.push({id:route.lesson_id,fragment:file.path,sha256:file.sha256,formativeFields:f('textarea').length});
}
let revised=original;
let next=original.length;
for(const p of patches.sort((a,b)=>b.start-a.start)){
 assert(p.end<=next,'Overlapping source edits');next=p.start;
 revised=Buffer.concat([revised.subarray(0,p.start),Buffer.from(p.text),revised.subarray(p.end)]);
}
const baseline=load(original.toString()),candidate=load(revised.toString());
const contract=$=>({
 activities:$('[data-activity]').toArray().map(n=>$.html(n)),
 vocabulary:$('#pilot3-words').text(),
 textbook:$('#textbook-practice-data').text(),
 required:$('[data-required-check]').toArray().map(n=>n.attribs['data-activity']),
 routes:$('.course-page').toArray().map(n=>n.attribs.id)
});
assert.deepEqual(contract(candidate),contract(baseline),'Native assessment/data contract changed');
const ids=candidate('[id]').toArray().map(n=>n.attribs.id);
assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
assert.equal(candidate('[data-pro-formative] textarea').length,27);
await mkdir(target); // Exclusive candidate; never overwrite a teacher-edited preview.
const css=String.raw`
.evaluation-switch{padding:12px 20px;border-bottom:1px solid #d9ded8;font-size:14px;line-height:1.5;background:#eef3ee}
.evaluation-switch a{font-weight:700;margin-inline-start:16px}
.pro-practice>h3:first-child,.pro-teaching>h2:first-child{margin-top:0}
.pro-practice .pro-response{margin:24px 0}
.pro-response label{display:block;font-weight:700;margin-bottom:12px}
.pro-response textarea{display:block;width:100%;min-height:140px;margin:0 0 12px}
.pro-practice details{margin:22px 0;border-block:1px solid #d9ded8;padding:0 18px}
.pro-practice summary{padding:14px 0;color:#154212;font-weight:760;cursor:pointer}
.pro-practice details[open]>summary{margin-bottom:14px}
.pro-table-wrap{overflow-x:auto;margin:24px 0}.pro-table-wrap table{border-collapse:collapse;width:100%;min-width:540px}
.pro-table-wrap td,.pro-table-wrap th{padding:12px;border:1px solid #d9ded8;text-align:left;vertical-align:top}
.pro-table-wrap th{background:#eef3ee}
.pro-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:12px;align-items:center}
.pro-flow-node{display:grid;gap:8px;padding:18px;border:1px solid #d9ded8;background:#eef3ee}
.pro-flow-cns{border:2px dashed #146c60}.pro-flow-arrow{font-size:24px}
@media(max-width:650px){.pro-flow{grid-template-columns:1fr}.pro-flow-arrow{transform:rotate(90deg);text-align:center}}
@media print{.evaluation-switch{display:none}}
`;
async function compileRuntime(namespace){
 const projection=namespace+':generated-practice-resume';

const runtimePath = path.join(repo, 'scripts/lib/biology30-pilot3/runtime.ts');
const nativeRuntime = await readFile(runtimePath, 'utf8');
assert(nativeRuntime.includes("const scorm=(window as any).__canvasHelperScorm;"));
assert(nativeRuntime.includes("const NS=lms?scorm.scopeKey('biology30-unit-a-pilot-3:v1'):'biology30-unit-a-pilot-3:v1';"));
const reviewRuntime = nativeRuntime
  .replace('const scorm=(window as any).__canvasHelperScorm;', 'const scorm:any=undefined; // Evaluation copy must never connect to an LMS.')
  .replace("const NS=lms?scorm.scopeKey('biology30-unit-a-pilot-3:v1'):'biology30-unit-a-pilot-3:v1';", `const NS=${JSON.stringify(namespace)};`)
  .replace("const PROJECTION_KEY='biology30-unit-a-pilot-3:generated-practice-resume:v1';", `const PROJECTION_KEY=${JSON.stringify(projection)};`);
const bundle = await build({ stdin: { contents: reviewRuntime, resolveDir: path.dirname(runtimePath), sourcefile: 'teaching-evaluation-runtime.ts', loader: 'ts' },
  bundle: true, platform: 'browser', format: 'iife', target: 'es2022', write: false, metafile: true,
  plugins: [{ name: 'evaluation-photo-isolation', setup(build) {
    build.onLoad({ filter: /biology30-chapters\/(textbook-practice|brightspace-photo-store)\.js$/ }, async args => {
      let contents = await readFile(args.path, 'utf8');
      if (args.path.endsWith('/textbook-practice.js')) {
        assert(contents.includes('biology30-chapter-${chapter}:textbook-photos:v1'));
        contents = contents.replace('biology30-chapter-${chapter}:textbook-photos:v1', `${namespace}:chapter-\${chapter}:textbook-photos`);
      }
      contents = contents.replaceAll('global.__canvasHelperScorm', 'undefined');
      return { contents, loader: 'js' };
    });
  } }] });
const bundled = bundle.outputFiles[0].text;
assert(!bundled.includes('biology30-unit-a-pilot-3:v1'));
assert(!bundled.includes('biology30-unit-a-pilot-3:generated-practice-resume:v1'));
assert(!bundled.includes('biology30-chapter-${chapter}:textbook-photos:v1'));

 return {bundled,nativeRuntimeSha256:sha(nativeRuntime)};
}
const outputs=[];
for(const [version,$] of [['old',baseline],['new',candidate]]){
 const namespace='biology30-ch11:scout-comparison:2026-10-03:v1:'+version;
 const compiled=await compileRuntime(namespace);
 const destination=path.join(target,version);
 await cp(sourceRoot,destination,{recursive:true,filter:s=>!['index.html','pilot3-runtime.js','scorm-tracking.json'].includes(path.basename(s))});
 $('title').text('Biology 30 - Chapter 11 | '+(version==='new'?'New teaching evaluation':'Original teaching comparison'));
 const other=version==='new'?'old':'new';
 $('.course-page .page-header').prepend('<p class="evaluation-switch">'+(version==='new'?'NEW · Scout teaching evaluation':'OLD · Original teaching')+' · separate test saves <a data-compare-switch href="../'+other+'/index.html#lesson-01">Open '+other+' version of this page</a></p>');
 $('head').append('<link rel="stylesheet" href="comparison.css">');
 // Only links follow the current native route; no new content/state owner.
 $('body').append('<script src="comparison-links.js"></script>');
 await writeFile(path.join(destination,'index.html'),$.html());
 await writeFile(path.join(destination,'assets/pilot3-runtime.js'),compiled.bundled);
 await writeFile(path.join(destination,'comparison.css'),css);
 await writeFile(path.join(destination,'comparison-links.js'),"(()=>{const update=()=>document.querySelectorAll('[data-compare-switch]').forEach(a=>{a.href=a.getAttribute('href').split('#')[0]+(location.hash||'#overview');});update();addEventListener('hashchange',update);})();");
 outputs.push({version,namespace,...compiled,bundled:undefined});
}
await writeFile(path.join(target,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><title>Chapter 11 comparison</title><link rel="stylesheet" href="new/styles.css"><main style="max-width:900px;margin:60px auto;padding:32px"><h1>Chapter 11 teaching comparison</h1><p>Compare the original teaching with the complete Scout manuscript in the same Biology course layout. Both are separate evaluation copies with isolated test saves.</p><p><a href="new/index.html#lesson-01">Open new teaching</a></p><p><a href="old/index.html#lesson-01">Open original teaching</a></p><p>Use the comparison link at the top of each page to switch versions of that lesson. New optional practice spaces are not saved or graded. Native checks and other course activities retain their original behaviour.</p><p>Teacher approval, science acceptance, deployment and Brightspace testing remain separate.</p></main></html>');
assert.deepEqual(await inventory(sourceRoot),sourceFiles,'Canonical files changed');
const files=await inventory(target);
const manifest={schemaVersion:1,role:'separate working comparison; not canonical or approved',root:'comparison-copy',entry:'new/index.html#lesson-01',sourceWorkspace:path.relative(repo,sourceRoot),sourceIndexSha256:sha(original),sourceWorkspaceFiles:sourceFiles,files,lessons:records,outputs,nativeContractsUnchanged:true,canonicalCourseChanged:false,teacherAccepted:false,released:false,route:'Deterministic snapshot/compile; lead retains hash-bound integration, trust and save isolation; no worker',deferred:['full science acceptance','teacher acceptance','SCORM/Brightspace','rollout E2E']};
await writeFile(path.join(reviewRoot,'COMPARISON_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({target,lessons:records.length,formativeFields:27,requiredChecks:contract(candidate).required.length,files:files.length,canonicalChanged:false}));

