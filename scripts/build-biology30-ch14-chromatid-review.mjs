import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {load} from 'cheerio';

// Additive teaching-only candidate. The accepted v0.1.0 and canonical course stay exact.
const parent=path.resolve('projects/biology30-chapter-14/meta/teaching-overhaul/2026-10-08-teacher-led');
const previous=path.join(parent,'complete-teaching-v0.1.0');
const root=path.join(parent,'complete-teaching-v0.1.1');
const name='Biology30_CH14_Lesson03_Chromatid_Bridge_Conditional_Repair_v0.1.1';
const zip=path.join('/Users/deanguedo/Downloads',name+'.zip');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p,'utf8');
const native=path.join(previous,'evaluation/new/index.html');
const source=path.join(previous,'owner/authoring/reviewed-teaching-copy.json');
assert.equal(sha(fs.readFileSync(zip)),'9b5ebba24405b5404e9b69173b8300cce5ad67babff0218e772e0a7f2a4e5042');
assert.equal(sha(fs.readFileSync(native)),'6d57efbeb6e5b81142a90c5854c3a1453ffda7acd7cdf805fb202667ee1d332a');
assert.equal(sha(fs.readFileSync(source)),'b12c57b96aaac60136e3c3b244fabd4cecc8f05da67961e252220cf938e00753');
const canonicalPath=path.resolve('projects/biology30-chapter-14/workspace/index.html');
assert.equal(sha(fs.readFileSync(canonicalPath)),'054b823d5758a702041f24fd06b15a77d69cdfff63323cd5ffd7e803bf8936b8');
assert(!fs.existsSync(root),'Never replace an existing candidate');
fs.mkdirSync(root);
execFileSync('python3',['-c',`import sys,zipfile,pathlib
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None
 for n in z.namelist():
  p=pathlib.PurePosixPath(n)
  assert not p.is_absolute() and '..' not in p.parts
 z.extractall(sys.argv[2])`,zip,path.join(root,'intake')]);
const intake=path.join(root,'intake',name);
const sums=read(path.join(intake,'SHA256SUMS.txt')).trim().split(/\r?\n/);
for(const line of sums){const m=/^([a-f0-9]{64})\s+\*?(.+)$/.exec(line);assert(m);assert(!path.isAbsolute(m[2])&&!m[2].split('/').includes('..'));assert.equal(sha(fs.readFileSync(path.join(intake,m[2]))),m[1]);}
const manifest=JSON.parse(read(path.join(intake,'REPAIR_MANIFEST.json')));
const oldOwner=JSON.parse(read(source));
const oldParagraph=oldOwner['lesson-03'].sections[1].paragraphs[1];
assert.equal(sha(oldParagraph),manifest.prior_owner_paragraph_text_sha256);
const newParagraph=oldParagraph+' '+manifest.inserted_text;
assert.equal(sha(newParagraph),manifest.new_owner_paragraph_text_sha256);
const copy=structuredClone(oldOwner);copy['lesson-03'].sections[1].paragraphs[1]=newParagraph;
const revertedOwner=structuredClone(copy);revertedOwner['lesson-03'].sections[1].paragraphs[1]=oldParagraph;
assert.deepEqual(revertedOwner,oldOwner);
const base=read(native),$=load(base,{sourceCodeLocationInfo:true});
const selector=manifest.target_selector,node=$(selector);assert.equal(node.length,1);
assert.equal(node.text(),manifest.old_paragraph_visible_text);
const {startOffset:start,endOffset:end}=node[0].sourceCodeLocation;
const before=base.slice(start,end),append=manifest.inserted_text;
assert(before.endsWith('</p>'));
const after=before.slice(0,-4)+' '+append+'</p>';
assert.equal(sha(before),manifest.prior_native_fragment_sha256);
assert.equal(sha(after),manifest.new_native_fragment_sha256);
const supplied=read(path.join(intake,'candidate/lesson-03.paragraph-fragment.html')).trim();
assert.equal(after,supplied);
const output=base.slice(0,start)+after+base.slice(end);
assert.equal(output.slice(0,start)+before+output.slice(start+after.length),base,'Exact paragraph reversal');
const out=load(output);
assert.deepEqual(out('[id]').toArray().map(e=>e.attribs.id),$('[id]').toArray().map(e=>e.attribs.id));
assert.equal(out('#course-data').html(),$('#course-data').html());
assert.deepEqual(out(selector).find('button').toArray().map(e=>out.html(e)),node.find('button').toArray().map(e=>$.html(e)));
fs.cpSync(path.join(previous,'owner'),path.join(root,'owner'),{recursive:true});
fs.cpSync(path.join(previous,'evaluation/new'),path.join(root,'evaluation/new'),{recursive:true});
fs.cpSync(path.join(previous,'evaluation/new'),path.join(root,'evaluation/baseline'),{recursive:true});
const ownerText=read(source),serialized=JSON.stringify(oldParagraph),replacement=JSON.stringify(newParagraph);
assert.equal(ownerText.split(serialized).length,2);
fs.writeFileSync(path.join(root,'owner/authoring/reviewed-teaching-copy.json'),ownerText.replace(serialized,replacement));
fs.writeFileSync(path.join(root,'owner/workspace/index.html'),output);
fs.writeFileSync(path.join(root,'evaluation/new/index.html'),output);
function tree(dir,p=''){return fs.readdirSync(dir).sort().flatMap(n=>{const f=path.join(dir,n),r=path.posix.join(p,n);assert(!fs.lstatSync(f).isSymbolicLink());return fs.statSync(f).isDirectory()?tree(f,r):[{path:r,sha256:sha(fs.readFileSync(f))}];});}
const oldFiles=tree(path.join(previous,'evaluation/new')),newFiles=tree(path.join(root,'evaluation/new'));
assert.equal(oldFiles.length,newFiles.length);for(const f of oldFiles)if(f.path!=='index.html')assert.equal(newFiles.find(x=>x.path===f.path).sha256,f.sha256);
const oldOwnerFiles=tree(path.join(previous,'owner')),newOwnerFiles=tree(path.join(root,'owner'));
assert.equal(oldOwnerFiles.length,newOwnerFiles.length);for(const f of oldOwnerFiles)if(!['workspace/index.html','authoring/reviewed-teaching-copy.json'].includes(f.path))assert.equal(newOwnerFiles.find(x=>x.path===f.path).sha256,f.sha256);
let comparison=read(path.join(previous,'evaluation/index.html')).replaceAll('57633','57673').replaceAll('57631','57671').replaceAll('57630','57670');
comparison=comparison.replace('Current course · frozen baseline','Approved complete teaching · v0.1.0').replace('comparison candidate','chromatid clarification · v0.1.1').replace('review/extension','lesson03 teaching clarification');
comparison=comparison.replace('Previous · first-ten candidate','Approved · complete teaching v0.1.0').replace('New · complete teaching candidate','New · lesson03 clarification v0.1.1').replace('Previous Chapter 14 candidate','Approved Chapter 14 complete candidate').replace('Complete Chapter 14 teaching candidate','Chapter 14 clarification candidate');
comparison=comparison.replace('Lessons 1–2: Dean’s comparison sign-off retained. Lessons 3–11 and extension: awaiting Dean’s acceptance.','Dean accepted the complete v0.1.0 teaching comparison. This separate v0.1.1 copy adds only three explanatory sentences in lesson3; that clarification awaits acceptance.');
fs.writeFileSync(path.join(root,'evaluation/index.html'),comparison);
assert.equal(sha(fs.readFileSync(native)),'6d57efbeb6e5b81142a90c5854c3a1453ffda7acd7cdf805fb202667ee1d332a');
assert.equal(sha(fs.readFileSync(canonicalPath)),'054b823d5758a702041f24fd06b15a77d69cdfff63323cd5ffd7e803bf8936b8');
const receipt={candidateHTML:sha(output),previousHTML:sha(base),payloadsVerified:sums.length,paragraphSelector:selector,ownerField:'lesson-03.sections[1].paragraphs[1]',ownerParagraphSha256:sha(newParagraph),originalFiles:newFiles.length,allNonHTMLAssetsByteExact:true,allConfigurationByteExact:true,protectedControlsByteExact:true,paragraphReversalByteExact:true,sourceOwnerReversalExact:true,priorTeacherAcceptedVersion:'v0.1.0 only',newTeacherAcceptance:'Pending',nativeRuntime:'Pending',canonicalChanged:false,protectedFeedbackChanged:false,release:'Not requested'};
fs.writeFileSync(path.join(root,'BUILD_RECEIPT.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
