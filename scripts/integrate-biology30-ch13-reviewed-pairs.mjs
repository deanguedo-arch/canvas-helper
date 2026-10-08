import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { load } from 'cheerio';

// Immutable intake and isolated assembly. No writes to canonical course or older candidates.
const repo = process.cwd();
const archive = '/Users/deanguedo/Downloads/Biology30_CH13_06-13_Master_Integration_Handoff_v0.1.0.zip';
const source = '/Users/deanguedo/Documents/Codex/2026-10-08/task-2/comparison/ch13-teacher-pass-v0.2.1/new';
const root = path.join(repo, 'projects/biology30-chapter-13/meta/teaching-overhaul/2026-10-08-teacher-led/master-integration-v0.3.0');
const latest = '/Users/deanguedo/Documents/Codex/2026-10-08/task-2/comparison/ch13-teacher-pass-v0.3.2/new';
const reconciledRoot = path.join(path.dirname(root), 'master-integration-v0.4.0');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const write = (file, bytes) => { fs.mkdirSync(path.dirname(file), {recursive:true});fs.writeFileSync(file, bytes, {flag:'wx'}); };
const json = (file, value) => write(file, JSON.stringify(value,null,2)+'\n');
const safe = name => { assert(!name.includes('\\') && !path.posix.isAbsolute(name) && !name.split('/').includes('..'), `Unsafe archive path ${name}`); return name; };
const checksums = async zip => {
  const text = await zip.file('CHECKSUMS.sha256').async('string');
  for (const line of text.trim().split(/\r?\n/)) {
    const match = /^([a-f0-9]{64})\s+\*?(.+)$/.exec(line); assert(match, 'Invalid checksum line');
    const name = safe(match[2]); assert(zip.file(name), `Missing ${name}`);
    assert.equal(sha(await zip.file(name).async('nodebuffer')),match[1],`Checksum ${name}`);
  }
};
const extract = async (zip, target) => {
  for (const name of Object.keys(zip.files).sort()) {
    safe(name); if(zip.files[name].dir)continue;
    write(path.join(target,name), await zip.file(name).async('nodebuffer'));
  }
};
if (process.argv.includes('--inspect')) {
  assert(!fs.existsSync(root), 'Preserve existing intake; do not overwrite');
  const bytes=fs.readFileSync(archive), master=await JSZip.loadAsync(bytes,{checkCRC32:true});
  await checksums(master);
  const manifest=JSON.parse(await master.file('MASTER_MANIFEST.json').async('string'));
  const verified=[];
  const packages=[];
  for(const spec of manifest.packages) {
    const b=await master.file(safe(spec.path)).async('nodebuffer');
    assert.equal(b.length,spec.bytes);assert.equal(sha(b),spec.sha256);
    const zip=await JSZip.loadAsync(b,{checkCRC32:true});await checksums(zip);
    const m=JSON.parse(await zip.file('MANIFEST.json').async('string'));
    for(const f of m.files) { const payload=await zip.file(safe(f.path)).async('nodebuffer'); assert.equal(payload.length,f.bytes,f.path);assert.equal(sha(payload),f.sha256,f.path); }
    packages.push({zip,spec});verified.push({package:spec.path,sha256:sha(b),payloads:m.files.length,crc:true,checksums:true});
  }
  const base=fs.readFileSync(path.join(source,'index.html'),'utf8');
  assert.equal(sha(base),'15df5967cc8fe94173c1d5a69ed485f28d52fcdbd292c9b1df62145b9264f9bc','Current candidate drift');
  const $=load(base,{sourceCodeLocationInfo:true});
  const raw=e=>base.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
  for(const {zip} of packages) {
    const compatibility=JSON.parse(await zip.file('COMPATIBILITY.json').async('string'));
    for(const lesson of compatibility.lessons) assert.equal(sha(raw($(`#lesson-${String(lesson.lesson).padStart(2,'0')}`)[0])),lesson.baseRouteSha256,`Route ${lesson.lesson} drift`);
  }
  await extract(master,path.join(root,'intake/master'));
  for(const {zip,spec} of packages)await extract(zip,path.join(root,'intake/pairs',path.basename(spec.path,'.zip')));
  json(path.join(root,'INTAKE_RECEIPT.json'),{sourceArchive:archive,sourceArchiveSha256:sha(bytes),base:path.join(source,'index.html'),baseSha256:sha(base),verified,routeBasesMatch:true,ownershipResolution:'Other task verified idle/interrupted after Dean confirmed stop; no messages or restart sent.',canonicalIntegrated:false});
  console.log(JSON.stringify({root,verified,routeBasesMatch:true},null,2));
} else if(process.argv.includes('--build-reconciled')) {
  assert(!fs.existsSync(reconciledRoot), 'Preserve existing reconciled candidate; choose a new version for later changes');
  const expected = {
    'index.html':'74088c927f8a2d4660e5c781e3ed6f5494bead160e94fb79fecc2f045cfde2af',
    'main.js':'e6c0fe539c253bd73de6e9b672e070a8e534e0404319b64a92bc900798a901ad',
    'styles.css':'db0dc21929ed0fec8aee45633ef0fd9de2e3cae5b48ac207d0390ee8472fb344'
  };
  const tree = directory => {
    const entries=[];
    const walk=(dir,prefix='')=>{for(const name of fs.readdirSync(dir).sort()){
      const file=path.join(dir,name),relative=path.posix.join(prefix,name),stat=fs.statSync(file);
      if(fs.lstatSync(file).isSymbolicLink())assert(fs.realpathSync(file).startsWith(path.join(repo,'projects/biology30-chapter-13/workspace')+path.sep),`Unexpected external symlink: ${relative}`);
      if(stat.isDirectory())walk(file,relative);else entries.push({path:relative,bytes:stat.size,sha256:sha(fs.readFileSync(file))});
    }};walk(directory);return entries;
  };
  const beforeTree=tree(latest);
  for(const [file,hash]of Object.entries(expected))assert.equal(sha(fs.readFileSync(path.join(latest,file))),hash,`Late owner drift ${file}`);
  const canonical=path.join(repo,'projects/biology30-chapter-13/workspace/index.html');
  const canonicalHash=sha(fs.readFileSync(canonical));
  assert.equal(canonicalHash,'341c2f943c4178bc2abf3d56290f0d8f2cb31e6b78b2b89b187694385ebc62e6','Canonical owner drift');
  // Reverify intake payloads rather than trusting the historical inspection receipt.
  const master=await JSZip.loadAsync(fs.readFileSync(archive),{checkCRC32:true});await checksums(master);
  assert.equal(sha(fs.readFileSync(archive)),'bf051abfe3a31465bf72df700c93c24625a54b71b24c5f99c594c42ea996ccc4');
  const manifest=JSON.parse(await master.file('MASTER_MANIFEST.json').async('string'));
  const base=fs.readFileSync(path.join(latest,'index.html'),'utf8');
  const $=load(base,{sourceCodeLocationInfo:true});
  const raw=(text,e)=>text.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
  const selected=(q,text,selector)=>q(selector).toArray().map(e=>raw(text,e));
  const replacements=[],alreadyInstalled=[],routeRecords=[],assetChecks=[],sourceStandards=[];
  for(const spec of manifest.packages){
    const bytes=await master.file(safe(spec.path)).async('nodebuffer');assert.equal(sha(bytes),spec.sha256);assert.equal(bytes.length,spec.bytes);
    const zip=await JSZip.loadAsync(bytes,{checkCRC32:true});await checksums(zip);
    const directory=path.join(root,'intake/pairs',path.basename(spec.path,'.zip'));
    const fileManifest=JSON.parse(await zip.file('MANIFEST.json').async('string'));
    for(const f of fileManifest.files){const local=fs.readFileSync(path.join(directory,safe(f.path)));assert.equal(local.length,f.bytes);assert.equal(sha(local),f.sha256,`Intake drift ${f.path}`);}
    const map=JSON.parse(fs.readFileSync(path.join(directory,'INTEGRATION_MAP.json')));
    const compatibility=JSON.parse(fs.readFileSync(path.join(directory,'COMPATIBILITY.json')));
    for(const lesson of compatibility.lessons){
      const id=`lesson-${String(lesson.lesson).padStart(2,'0')}`,hash=sha(raw(base,$(`#${id}`)[0]));
      const installed=lesson.lesson<=7;
      assert.equal(hash,installed?lesson.candidateRouteSha256:lesson.baseRouteSha256,`Route drift ${id}`);
      routeRecords.push({...lesson,package:spec.path,observedRouteSha256:hash,action:installed?'verified-already-installed':'replace-named-blocks'});
    }
    for(const block of map.blocks){
      const node=$(`#${block.id}`);assert.equal(node.length,1,block.id);const before=raw(base,node[0]);
      if(block.lessonId==='lesson-06'||block.lessonId==='lesson-07'){
        assert.equal(sha(before),block.newBlockSha256,`Installed block drift ${block.id}`);alreadyInstalled.push({id:block.id,sha256:sha(before)});continue;
      }
      assert.equal(sha(before),block.oldBlockSha256,`Base block drift ${block.id}`);
      const fragment=fs.readFileSync(path.join(directory,safe(block.fragmentFile)),'utf8');
      const fragmentDoc=load(fragment,{sourceCodeLocationInfo:true}),newNode=fragmentDoc(`#${block.id}`);assert.equal(newNode.length,1);
      const after=raw(fragment,newNode[0]);assert.equal(sha(after),block.newBlockSha256,`Manuscript drift ${block.id}`);
      assert.equal(after.slice(0,after.indexOf('>')+1),block.exactOpeningTag);
      assert.deepEqual(node.find('figure').toArray().map(e=>raw(base,e)),newNode.find('figure').toArray().map(e=>raw(fragment,e)),`Figures changed ${block.id}`);
      replacements.push({id:block.id,lessonId:block.lessonId,start:node[0].sourceCodeLocation.startOffset,end:node[0].sourceCodeLocation.endOffset,before,after,beforeSha256:sha(before),afterSha256:sha(after)});
    }
    const assets=path.join(directory,'assets/teaching-review');
    if(fs.existsSync(assets))for(const name of fs.readdirSync(assets)){
      const relative=`assets/teaching-review/${name}`,hash=sha(fs.readFileSync(path.join(assets,name)));
      assert.equal(sha(fs.readFileSync(path.join(latest,relative))),hash,`Reviewed image identity ${name}`);assetChecks.push({path:relative,sha256:hash});
    }
    const standards=path.join(directory,'source');
    if(fs.existsSync(standards))for(const f of fs.readdirSync(standards).filter(n=>/Standards.*\.txt/.test(n)))sourceStandards.push({package:spec.path,file:`source/${f}`,sha256:sha(fs.readFileSync(path.join(standards,f)))});
  }
  assert.equal(replacements.length,28);assert.equal(alreadyInstalled.length,10);
  let result=base;
  replacements.sort((a,b)=>a.start-b.start);
  for(let i=1;i<replacements.length;i++)assert(replacements[i-1].end<=replacements[i].start);
  for(const r of [...replacements].reverse())result=result.slice(0,r.start)+r.after+result.slice(r.end);
  let doc=load(result,{sourceCodeLocationInfo:true});
  for(const r of routeRecords){const id=`lesson-${String(r.lesson).padStart(2,'0')}`;assert.equal(sha(raw(result,doc(`#${id}`)[0])),r.candidateRouteSha256,`Complete reviewed route ${id}`);}
  // Separately authorized locator repair, outside manuscript boundaries.
  const band=doc('#lesson-11 .textbook-band');assert.equal(band.length,1);
  const bandBefore=raw(result,band[0]);
  const bandAfter=bandBefore.replace('pp. 440–441','pp. 454–455').replace('data-open-pdf="440"','data-open-pdf="454"').replace('Open at p. 440','Open at p. 454');
  assert.notEqual(bandBefore,bandAfter);assert(bandAfter.includes('pp. 454–455')&&bandAfter.includes('data-open-pdf="454"')&&!bandAfter.includes('440'));
  const loc=band[0].sourceCodeLocation;
  result=result.slice(0,loc.startOffset)+bandAfter+result.slice(loc.endOffset);
  replacements.push({id:'lesson-11-textbook-band',selector:'#lesson-11 .textbook-band',lessonId:'lesson-11',before:bandBefore,after:bandAfter,beforeSha256:sha(bandBefore),afterSha256:sha(bandAfter),repair:true});
  doc=load(result,{sourceCodeLocationInfo:true});
  let restored=result;
  const restore=replacements.map(r=>({...r,loc:doc(r.selector||`#${r.id}`)[0].sourceCodeLocation})).sort((a,b)=>b.loc.startOffset-a.loc.startOffset);
  for(const r of restore)restored=restored.slice(0,r.loc.startOffset)+r.before+restored.slice(r.loc.endOffset);
  assert.equal(restored,base,'Every outside-boundary byte preserved');
  for(const selector of ['script','figure','textarea','input','select','[data-check-id]','[data-guided]','[data-transfer]','[data-save-note]','[data-note]'])assert.deepEqual(selected(doc,result,selector),selected($,base,selector),`Protected parity ${selector}`);
  // The reviewed prose relocates existing inline vocabulary occurrences. Preserve
  // their exact bytes and multiplicity per lesson, not their old prose order.
  const vocabularyParity=[];
  for(let n=1;n<=13;n++){
    const route=`#lesson-${String(n).padStart(2,'0')}`;
    const before=selected($,base,`${route} button.bio-term`),after=selected(doc,result,`${route} button.bio-term`);
    assert.deepEqual([...after].sort(),[...before].sort(),`Exact native vocabulary inventory ${route}`);
    vocabularyParity.push({lesson:n,count:before.length,exactBytesAndMultiplicity:true,sequenceExact:JSON.stringify(after)===JSON.stringify(before)});
  }
  assert.deepEqual(doc('[id]').toArray().map(e=>doc(e).attr('id')),$('[id]').toArray().map(e=>$(e).attr('id')),'Ordered stable IDs');
  for(let n=1;n<=7;n++){const id=`lesson-${String(n).padStart(2,'0')}`;assert.equal(raw(result,doc(`#${id}`)[0]),raw(base,$(`#${id}`)[0]),`Earlier route preserved ${id}`);}
  assert.equal(doc('#lesson-13 .worked-example').length,1);
  assert.equal(raw(result,doc('#lesson-13 .worked-example')[0]),raw(base,$('#lesson-13 .worked-example')[0]));
  // Recheck ownership boundary immediately before candidate writes.
  assert.deepEqual(tree(latest),beforeTree,'Concurrent late tree change');assert.equal(sha(fs.readFileSync(canonical)),canonicalHash);
  const next=path.join(reconciledRoot,'evaluation/new');
  // Freeze resolved bytes, not live symlinks into the canonical workspace.
  fs.mkdirSync(path.dirname(next),{recursive:true});fs.cpSync(latest,next,{recursive:true,errorOnExist:true,force:false,dereference:true});
  fs.cpSync(latest,path.join(reconciledRoot,'evaluation/old'),{recursive:true,errorOnExist:true,force:false,dereference:true});
  const assertFrozen=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})){assert(!entry.isSymbolicLink(),`Unfrozen snapshot link: ${path.join(directory,entry.name)}`);if(entry.isDirectory())assertFrozen(path.join(directory,entry.name));}};
  assertFrozen(next);assertFrozen(path.join(reconciledRoot,'evaluation/old'));
  fs.writeFileSync(path.join(next,'index.html'),result);
  const afterTree=tree(next);
  for(const f of beforeTree)if(f.path!=='index.html')assert.equal(afterTree.find(a=>a.path===f.path)?.sha256,f.sha256,`Complete tree preservation ${f.path}`);
  const receipt={version:'0.4.0',base:latest,sourceSha256:sha(base),candidateSha256:sha(result),baseTree:beforeTree,candidateTree:afterTree,
    ownership:'Sole integration writer; stopped task verified idle/interrupted; Dean approval verified in local coordination task 01a11cd6-96d8-7434-9074-7f06934c2021.',
    routeRecords:routeRecords.map(r=>({...r,integratedRouteSha256:sha(raw(result,doc(`#lesson-${String(r.lesson).padStart(2,'0')}`)[0]))})),
    blocks:replacements.map(({before,after,start,end,...r})=>r),alreadyInstalled,assetChecks,sourceStandards,vocabularyParity,
    protectedParity:true,exactOutsideReplacementRecovery:true,completeLateTreePreserved:true,lesson05Repair:'Retained verbatim from v0.3.2; explanation already distinguishes direct and indirect hGH routes. Native verification separate.',
    lesson11Repair:'Only reading band and printed-page shortcut corrected to 454–455; native reader verification separate.',
    latestStandardReconciliation:'v0.3 transfer HTTP 403; not consumed. Frozen package standards recorded, no retroactive authorship claim.',
    canonicalIntegrated:false,teacherAccepted:false,lmsVerified:false,release:'out of scope'};
  json(path.join(reconciledRoot,'ASSEMBLY_RECEIPT.json'),receipt);
  write(path.join(reconciledRoot,'BOUNDED_DIFF.patch'),replacements.map(r=>`--- v0.3.2/${r.lessonId}/${r.id}\n+++ v0.4.0/${r.lessonId}/${r.id}\n${r.before.split('\n').map(s=>'-'+s).join('\n')}\n${r.after.split('\n').map(s=>'+'+s).join('\n')}\n`).join('\n'));
  console.log(JSON.stringify({candidate:path.join(next,'index.html'),sha256:sha(result),manuscriptBlocks:28,alreadyInstalled:10,readerRepairs:1,protectedParity:true,completeLateTreePreserved:true}));
} else if(process.argv.includes('--build')) {
  // Late task output superseded this intake's v0.2.1 assembly base.
  // Reconcile v0.3.2, including its lesson 05 assets and mobile CSS, before enabling assembly.
  throw Error('Assembly paused: late v0.3.2 contains reviewed lessons 06/07 and additional diagram/mobile fixes. Do not build from the stale v0.2.1 intake base; resolve LATE_STATE_RECONCILIATION.json first.');
  const receipt=JSON.parse(fs.readFileSync(path.join(root,'INTAKE_RECEIPT.json'),'utf8'));
  const base=fs.readFileSync(path.join(source,'index.html'),'utf8');assert.equal(sha(base),receipt.baseSha256);
  const $=load(base,{sourceCodeLocationInfo:true});const raw=(text,e)=>text.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
  const replacements=[];const lessons=[];const assetChecks=[];
  for(const spec of receipt.verified) {
    const directory=path.join(root,'intake/pairs',path.basename(spec.package,'.zip'));
    const map=JSON.parse(fs.readFileSync(path.join(directory,'INTEGRATION_MAP.json'),'utf8'));
    const compatibility=JSON.parse(fs.readFileSync(path.join(directory,'COMPATIBILITY.json'),'utf8'));
    for(const block of map.blocks) {
      const old=$(`#${block.id}`);assert.equal(old.length,1,block.id);const oldText=raw(base,old[0]);assert.equal(sha(oldText),block.oldBlockSha256,block.id);
      const fragment=fs.readFileSync(path.join(directory,safe(block.fragmentFile)),'utf8');const doc=load(fragment,{sourceCodeLocationInfo:true});const node=doc(`#${block.id}`);assert.equal(node.length,1);
      const replacement=raw(fragment,node[0]);assert.equal(sha(replacement),block.newBlockSha256,block.id);
      assert.equal(replacement.slice(0,replacement.indexOf('>')+1),block.exactOpeningTag);
      const beforeFigures=old.find('figure').toArray().map(e=>sha(raw(base,e)));
      const afterFigures=node.find('figure').toArray().map(e=>sha(raw(fragment,e)));
      assert.deepEqual(afterFigures,beforeFigures,`Locked figures ${block.id}`);
      replacements.push({id:block.id,lessonId:block.lessonId,start:old[0].sourceCodeLocation.startOffset,end:old[0].sourceCodeLocation.endOffset,before:oldText,after:replacement,beforeSha256:sha(oldText),afterSha256:sha(replacement)});
    }
    for(const lesson of compatibility.lessons)lessons.push({...lesson,package:spec.package});
    const assets=path.join(directory,'assets/teaching-review');
    if(fs.existsSync(assets))for(const name of fs.readdirSync(assets)){
      const relative=`assets/teaching-review/${name}`;const b=fs.readFileSync(path.join(assets,name));assert.equal(sha(fs.readFileSync(path.join(source,relative))),sha(b),`Existing reviewed asset mismatch: ${name}`);assetChecks.push({file:relative,sha256:sha(b),reused:true});
    }
  }
  replacements.sort((a,b)=>a.start-b.start);
  for(let i=1;i<replacements.length;i++)assert(replacements[i-1].end<=replacements[i].start,'Overlapping boundaries');
  let result=base;for(const r of [...replacements].reverse())result=result.slice(0,r.start)+r.after+result.slice(r.end);
  const doc=load(result,{sourceCodeLocationInfo:true});
  for(const lesson of lessons){const id=`lesson-${String(lesson.lesson).padStart(2,'0')}`;assert.equal(sha(raw(result,doc(`#${id}`)[0])),lesson.candidateRouteSha256,`Exact candidate ${id}`);}
  // Reverse each named block at its NEW position to prove every other byte survives.
  let restored=result;
  const reversed=replacements.map(r=>({...r,location:doc(`#${r.id}`)[0].sourceCodeLocation})).sort((a,b)=>b.location.startOffset-a.location.startOffset);
  for(const r of reversed)restored=restored.slice(0,r.location.startOffset)+r.before+restored.slice(r.location.endOffset);
  assert.equal(restored,base,'Outside-boundary preservation');
  const selected=(q,text,selector)=>q(selector).toArray().map(e=>raw(text,e));
  for(const selector of ['script','figure','button.bio-term','textarea','input','select'])assert.deepEqual(selected(doc,result,selector),selected($,base,selector),`Protected ${selector}`);
  for(let n=1;n<=5;n++){const id=`lesson-${String(n).padStart(2,'0')}`;assert.equal(raw(result,doc(`#${id}`)[0]),raw(base,$(`#${id}`)[0]),`Earlier ${id}`);}
  for(const id of ['ch13-l13-worked'])assert.equal(raw(result,doc(`#${id}`)[0]),raw(base,$(`#${id}`)[0]));
  const newDirectory=path.join(root,'evaluation/new');const oldDirectory=path.join(root,'evaluation/old');
  assert(!fs.existsSync(newDirectory)&&!fs.existsSync(oldDirectory),'Preserve assembled candidate');
  fs.mkdirSync(path.dirname(newDirectory),{recursive:true});
  fs.cpSync(source,newDirectory,{recursive:true,errorOnExist:true,force:false});
  fs.cpSync(source,oldDirectory,{recursive:true,errorOnExist:true,force:false});
  // Generated isolated entry, not a direct patch of a canonical owner.
  fs.writeFileSync(path.join(newDirectory,'index.html'),result);
  const evaluationSource=fs.readFileSync('/Users/deanguedo/Documents/Codex/2026-10-08/task-2/comparison/ch13-teacher-pass-v0.2.1/index.html','utf8');
  write(path.join(root,'evaluation/index.html'),evaluationSource.replaceAll('Original · completed course','Previous · v0.2.1').replaceAll('New · teacher-led trial','New · v0.3.0 lessons 06–13'));
  const records=replacements.map(({before,after,...r})=>r);
  json(path.join(root,'ASSEMBLY_RECEIPT.json'),{version:'0.3.0',sourceSha256:sha(base),candidateSha256:sha(result),blocks:records,lessons,assetChecks,exactOutsideReplacementRecovery:true,protectedScriptsFiguresVocabularyFieldsExact:true,lessons01to05Exact:true,lesson13WorkedExact:true,canonicalIntegrated:false,teacherAccepted:false,repairsDeferred:['L05 first overview figure explanation: separate pending scope','L11 reader navigation 440–441 vs 454–455: separate pending scope'],release:'out of scope'});
  write(path.join(root,'BOUNDED_DIFF.patch'),replacements.map(r=>`--- v0.2.1/${r.lessonId}/${r.id}\n+++ v0.3.0/${r.lessonId}/${r.id}\n@@ exact named block @@\n${r.before.split('\n').map(s=>'-'+s).join('\n')}\n${r.after.split('\n').map(s=>'+'+s).join('\n')}\n`).join('\n'));
  assert.equal(sha(fs.readFileSync(path.join(source,'index.html'))),receipt.baseSha256,'Previous source unchanged');
  assert.equal(sha(fs.readFileSync(path.join(repo,'projects/biology30-chapter-13/workspace/index.html'))),'341c2f943c4178bc2abf3d56290f0d8f2cb31e6b78b2b89b187694385ebc62e6','Canonical owner drift');
  console.log(JSON.stringify({candidate:path.join(newDirectory,'index.html'),sha256:sha(result),blocks:replacements.length,lessons:lessons.length,allProtectionChecksPassed:true},null,2));
} else throw Error('Use --inspect for immutable intake, or --build-reconciled for the approved v0.3.2 continuation. Stale --build is disabled.');
