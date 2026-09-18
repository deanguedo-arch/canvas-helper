/** Export the current labeling inventory and its exact course answer mappings. */
import {readFile,writeFile,mkdir,mkdtemp,copyFile,access,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {load} from 'cheerio';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const root=process.cwd(),output='/Users/deanguedo/Downloads/Biology30_Chapters14_20_Labeling_Images_and_Answers_2026-09-18.zip';
try{await access(output);throw Error('Output already exists; preserve it and choose a new filename.');}catch(e){if(e.code!=='ENOENT')throw e;}
const stage=await mkdtemp(path.join(os.tmpdir(),'biology30-labeling14-20-')),folder='Biology30_Chapters14_20_Labeling_Images_and_Answers',base=path.join(stage,folder),manifest=[],hashes=[];
await mkdir(base,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:1});
 for(let ch=14;ch<=20;ch++){
  const project=`projects/biology30-chapter-${ch}`,workspace=path.join(root,project,'workspace');
  const C=JSON.parse(await readFile(path.join(root,project,'meta/external-generation/authoring/course-config.json'),'utf8'));
  const $=load(await readFile(path.join(workspace,'index.html'),'utf8'));
  assert.deepEqual(C.labelDiagrams,JSON.parse($('#course-data').text()).labelDiagrams,'Authoring/runtime diagram mismatch');
  const dir=path.join(base,`Chapter_${ch}`);await mkdir(path.join(dir,'images'),{recursive:true});await mkdir(path.join(dir,'answer_keys'),{recursive:true});
  for(const d of C.labelDiagrams){
   const source=path.resolve(workspace,d.src);assert(source.startsWith(workspace+path.sep),'Invalid asset path');
   const image=`Chapter_${ch}/images/${d.id}${path.extname(source)}`;await copyFile(source,path.join(base,image));
   assert.equal(hash(await readFile(source)),hash(await readFile(path.join(base,image))));
   let preview=null;
   if(path.extname(source)==='.svg'){
    await page.goto('file://'+source);await page.evaluate(()=>document.fonts.ready);
    preview=`Chapter_${ch}/images/${d.id}.png`;await page.locator('svg').first().screenshot({path:path.join(base,preview)});
   }
   assert(Object.keys(d.answers).length>0&&Object.values(d.answers).every(a=>d.options.includes(a)),'Invalid mapping');
   const key=`Chapter_${ch}/answer_keys/${d.id}_answers.md`;
   const text=`# ${d.title}\n\nChapter ${ch} · Lesson ${d.lesson} · Activity ID: ${d.id}\n\nImage: ../images/${path.basename(image)}\n${preview?'PNG copy: ../images/'+path.basename(preview)+'\n':''}\n| Label | Answer |\n| --- | --- |\n`+Object.entries(d.answers).map(([label,answer])=>`| ${label} | ${answer.replaceAll('|','\\|')} |`).join('\n')+`\n\n${d.reviewNote||''}\n`;
   await writeFile(path.join(base,key),text);
   manifest.push({chapter:ch,id:d.id,title:d.title,lesson:d.lesson,image,pngCopy:preview,answerKey:key,answers:d.answers,options:d.options,sourceAsset:path.relative(root,source),sourceSha256:hash(await readFile(source)),alt:d.alt,reviewNote:d.reviewNote});
  }
  console.log(`Chapter ${ch}: ${C.labelDiagrams.length} images and answer keys`);
 }
}finally{await browser.close();}
assert.equal(manifest.length,44);assert.equal(new Set(manifest.map(d=>d.id)).size,44);
await writeFile(path.join(base,'MASTER_ANSWER_KEY.md'),'# Biology 30 Chapters 14–20: labeling answer key\n\nExact mappings currently used in the courses. This export is not an independent science audit.\n\n'+manifest.map(d=>`## Chapter ${d.chapter} — ${d.title}\n\nActivity: ${d.id} · Lesson ${d.lesson}\n\nImage: ${d.image}\n\n`+Object.entries(d.answers).map(([label,answer])=>`- ${label}: ${answer}`).join('\n')).join('\n\n')+'\n');
await writeFile(path.join(base,'labeling_manifest.json'),JSON.stringify({schemaVersion:1,createdAt:new Date().toISOString(),purpose:'Current course labeling images and answer mappings',diagramCount:44,diagrams:manifest},null,2)+'\n');
await writeFile(path.join(base,'START_HERE.md'),'# Biology 30 labeling images and answers: Chapters 14–20\n\n44 labeling activities: six each in Chapters 14–19 and eight in Chapter 20.\n\nEach chapter folder contains the exact original images used by its labeling activities and an individual Markdown answer key for each activity. SVG originals also have PNG copies for convenient viewing. These copies are renderings, not replacement or corrected diagrams.\n\nMASTER_ANSWER_KEY.md lists all label-to-answer mappings. labeling_manifest.json links each activity, image, lesson and answer key, with original source paths and image hashes.\n\nAnswers are the exact mappings in the current canonical course runtime, reconciled with its authoring config. They have not been independently re-audited for scientific accuracy during this export. No student answers or browser saves are included.\n');
async function inventory(dir,rel=''){for(const n of await readdir(dir)){const f=path.join(dir,n),r=path.posix.join(rel,n),s=await stat(f);if(s.isDirectory())await inventory(f,r);else hashes.push(`${hash(await readFile(f))}  ${r}`);}}
await inventory(base);await writeFile(path.join(base,'SHA256SUMS.txt'),hashes.sort().join('\n')+'\n');
execFileSync('python3',['-c','import pathlib,sys,zipfile\np=pathlib.Path(sys.argv[1]);out=sys.argv[2]\nwith zipfile.ZipFile(out,"x",zipfile.ZIP_DEFLATED) as z:\n for f in sorted(p.rglob("*")):\n  if f.is_file():z.write(f,f.relative_to(p.parent))\nwith zipfile.ZipFile(out) as z:\n assert z.testzip() is None\n',base,output]);
console.log(JSON.stringify({output,diagrams:manifest.length,pngCopies:manifest.filter(d=>d.pngCopy).length,sha256:hash(await readFile(output))}));
