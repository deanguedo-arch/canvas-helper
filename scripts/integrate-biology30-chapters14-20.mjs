/** Initial external-generation intake. Refuses existing projects; never forces import. */
import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile,cp,symlink,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=process.cwd(),stage=path.join(root,'projects/incoming/biology30-chapters14-20-handoff');
const inputs=[['/Users/deanguedo/Downloads/Biology30_Chapter14_Exact_Template_Handoff.zip',[14]],['/Users/deanguedo/Downloads/Biology30_Chapters15_20_Complete_Handoff.zip',[15,16,17,18,19,20]]];
const sha=b=>createHash('sha256').update(b).digest('hex');
const exists=async p=>{try{await access(p);return true;}catch{return false;}};
const styleHashes={'styles.css':'94fe523654289edd8b0f951dd6782f83dce7d08f5e18a3d903d25576fbfa0ba5','assets/textbook-practice.css':'4101415cce977a4a8553754a01cea3d33ad194add1198db00ddc0ba99bfeea12'};
for(let ch=14;ch<=20;ch++)if(await exists(path.join(root,`projects/biology30-chapter-${ch}`))){
 const p=path.join(root,`projects/biology30-chapter-${ch}/meta`),m=JSON.parse(await readFile(path.join(p,'project.json'),'utf8'));
 if(await exists(path.join(p,'integration-receipt.json'))||m.sourcePath!==path.join(stage,`chapter-${ch}/workspace/index.html`))throw Error(`Existing Chapter ${ch}: reconcile before intake.`);
}
const staged=await exists(stage);
await mkdir(stage,{recursive:true});
for(const [zip]of inputs){
 const names=execFileSync('unzip',['-Z1',zip],{encoding:'utf8',maxBuffer:8e6}).trim().split('\n');
 if(names.some(n=>n.startsWith('/')||n.split('/').includes('..')||n.includes('\\')))throw Error('Unsafe archive member.');
 execFileSync('unzip',['-tqq',zip]);
 if(!staged)execFileSync('unzip',['-q',zip,'-d',stage]);
}
for(const [zip,chapters]of inputs)for(const ch of chapters){
 const source=path.join(stage,`chapter-${ch}`),slug=`biology30-chapter-${ch}`,dest=path.join(root,'projects',slug),w=path.join(dest,'workspace'),meta=path.join(dest,'meta'),owner=path.join(meta,'external-generation');
 for(const [rel,hash]of Object.entries(styleHashes))if(sha(await readFile(path.join(source,'workspace',rel)))!==hash)throw Error(`${slug}: style mismatch ${rel}`);
 if(!await exists(path.join(meta,'project.json'))){
  // The generic normalizer merges non-executable JSON/PDF scripts. Register a
  // temporary intake shell, then install the intact delivered document/assets.
  const registration=path.join(stage,`${slug}-registration.html`);
  await writeFile(registration,`<!DOCTYPE html><html><head><title>Biology 30 - Chapter ${ch}</title></head><body><h1>Biology 30 - Chapter ${ch}</h1></body></html>`);
  execFileSync(process.execPath,[path.join(root,'node_modules/tsx/dist/cli.mjs'),'scripts/import-site.ts',registration,'--slug',slug,'--source','other','--learner-mode','off'],{cwd:root,stdio:'pipe',maxBuffer:10e6});
 }
 await cp(path.join(source,'workspace/index.html'),path.join(dest,'raw/original.html'));
 // Preserve delivered data/script types and exact canonical learner asset bytes.
 await cp(path.join(source,'workspace'),w,{recursive:true,force:true});
 await mkdir(owner,{recursive:true});
 for(const rel of ['authoring','scripts','verification','README.md','SHA256SUMS.txt'])if(await exists(path.join(source,rel)))await cp(path.join(source,rel),path.join(owner,rel),{recursive:true});
 await cp(path.join(source,'portable'),path.join(w,'portable'),{recursive:true});
 await symlink('../../workspace',path.join(owner,'workspace'),'dir');
 await symlink('../../workspace/portable',path.join(owner,'portable'),'dir');
 const m=JSON.parse(await readFile(path.join(meta,'project.json'),'utf8'));
 Object.assign(m,{sourcePath:zip,title:`Biology 30 - Chapter ${ch}`,projectType:'generated-course',preferredWorkflows:['generated-course','injection/integration'],canonicalEntry:`projects/${slug}/workspace/index.html`,canonicalSources:[`projects/${slug}/workspace/main.js`,`projects/${slug}/workspace/assets`,`projects/${slug}/workspace/styles.css`,`projects/${slug}/meta/external-generation/authoring/course-config.json`,`projects/${slug}/meta/external-generation/authoring/textbook-question-manifest.json`,...(ch===14?[`projects/${slug}/meta/external-generation/scripts/content.py`,`projects/${slug}/meta/external-generation/scripts/build_chapter.py`]:[`projects/${slug}/workspace/index.html`])],authoringStatus:'blocked',generatedOutputs:[`projects/${slug}/workspace/portable/Biology30_Chapter${ch}.html`],regenerateCommand:`cd projects/${slug}/meta/external-generation && python3 scripts/${ch===14?'build_chapter.py':'build.py'}${ch===14?' && python3 scripts/patch_runtime.py && python3 scripts/assemble_portable.py':''}`,exportTargets:[{target:'brightspace',enabled:false,notes:'Local integration candidate; deployment and LMS verification deferred.'}],importedFirstPassOrigin:{sourceSystem:'other',generator:'chatgpt-pro',sourcePath:zip,sourceSha256:sha(await readFile(zip)),importedAt:new Date().toISOString()},sourceOfTruthNotes:ch===14?'Generated teaching HTML is owned by the delivered content.py/build_chapter.py; native runtime remains editable. Preserve exact CSS, stable identities and namespaces. Developer sources are under meta/external-generation. Portable is derived. Do not generic-reimport.':'Teaching markup is owned by current workspace/index.html; interaction data by meta/external-generation/authoring/course-config.json and original questions by textbook-question-manifest.json. Initial lesson-content.json is historical and must not overwrite HTML. Portable is derived. Preserve script/data types, exact CSS, IDs, native saving and optional-progress isolation. Do not generic-reimport.'});
 await writeFile(path.join(meta,'project.json'),JSON.stringify(m,null,2)+'\n');
 await writeFile(path.join(meta,'integration-receipt.json'),JSON.stringify({chapter:ch,sourceArchive:zip,sourceArchiveSha256:m.importedFirstPassOrigin.sourceSha256,importedAt:m.importedFirstPassOrigin.importedAt,workspaceHtmlSha256:sha(await readFile(path.join(w,'index.html'))),portableSha256:sha(await readFile(path.join(w,`portable/Biology30_Chapter${ch}.html`))),styleHashes,status:'local-integration-awaiting-verification',deferred:['deployment','Brightspace','teacher/source acceptance','Studio readiness']},null,2)+'\n');
 console.log(`${slug}: delivered workspace preserved; ownership registered; portable available`);
}
