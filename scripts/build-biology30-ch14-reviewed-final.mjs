import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {load} from 'cheerio';

// Isolated cumulative comparison. Never regenerate the canonical historical builder.
const project=path.resolve('projects/biology30-chapter-14');
const parent=path.join(project,'meta/teaching-overhaul/2026-10-08-teacher-led');
const previous=path.join(parent,'first-ten-v0.1.0');
const root=path.join(parent,'complete-teaching-v0.1.0');
const owner=path.join(root,'owner');
const intakeName='Biology30_CH14_Review11_Extension_Conditional_Content_v0.1.0';
const metadataName='Biology30_CH14_Review11_Extension_Metadata_Correction_v0.1.1';
const intake=path.join(root,'intake',intakeName),metadata=path.join(root,'intake',metadataName);
const python='/Users/deanguedo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p,'utf8');
const raw=(s,e)=>s.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
const write=(p,b)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b,{flag:'wx'});};
const json=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
const copy=(a,b)=>{assert(!fs.existsSync(b),`Preserve ${b}`);fs.cpSync(a,b,{recursive:true,errorOnExist:true,force:false});};
const canonical={
 'workspace/index.html':'054b823d5758a702041f24fd06b15a77d69cdfff63323cd5ffd7e803bf8936b8',
 'workspace/main.js':'295522cb7ae3dbc4bd845b8916b41605c6c771dc9b11d041e01af7565b173d0b',
 'meta/external-generation/scripts/build_chapter.py':'f389fa6ace53dd19e2e3f4c7d336d32f7391656e0d66799404a90695883d06e0',
 'meta/external-generation/scripts/content.py':'15f3e496a739a40f7de85ccfa8a8dcaadfb0a4ebb4274f4c36c272244d542a2e',
 'meta/external-generation/authoring/course-config.json':'d3467ba67cc5b2bbbf8cc26fb3b8e0a8f8754102ebe545fd607ef2180149c74d'
};
const check=()=>{for(const [p,h]of Object.entries(canonical))assert.equal(sha(fs.readFileSync(path.join(project,p))),h,p);
 assert.equal(sha(fs.readFileSync(path.join(previous,'evaluation/new/index.html'))),'ed8a93ef5a42a7c57998f2d8f3fae1372f534cf071a6101e786fd7a915e32cf4');};
const targets=['#ch14-l11-teaching-01','#ch14-l11-teaching-02','#ch14-review-worked','#extension > .p2-topic > div.content-section:first-of-type'];
function payloads(dir){const lines=read(path.join(dir,'SHA256SUMS.txt')).trim().split(/\r?\n/);for(const line of lines){const m=/^([a-f0-9]{64})\s+\*?(.+)$/.exec(line);assert(m);assert(!path.isAbsolute(m[2])&&!m[2].split('/').includes('..'));assert.equal(sha(fs.readFileSync(path.join(dir,m[2]))),m[1],m[2]);}return lines.length;}
check();
if(process.argv.includes('--prepare')){
 assert(!fs.existsSync(root),'Never overwrite an earlier candidate');fs.mkdirSync(root);
 for(const [name,hash]of [[intakeName,'06ff7ea7bdb1add31e4301c94b84c384df90f79c1ba325638ce3d66a66d407e5'],[metadataName,'18c7a28b043b5cebc6bed9de583abb090763ed1b5a80899f12b08122a651fe67']]){
  const zip=path.join('/Users/deanguedo/Downloads',name+'.zip');assert.equal(sha(fs.readFileSync(zip)),hash);
  execFileSync(python,['-c',`import sys,zipfile,pathlib
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None
 for n in z.namelist():
  p=pathlib.PurePosixPath(n)
  assert not p.is_absolute() and '..' not in p.parts
 z.extractall(sys.argv[2])`,zip,path.join(root,'intake')]);
 }
 const counts={content:payloads(intake),metadata:payloads(metadata)};
 const manifest=JSON.parse(read(path.join(metadata,'PRESERVATION_MANIFEST.json')));
 const hashRows=JSON.parse(execFileSync(python,['-c',`import json,sys,hashlib
from lxml import html
m=json.load(open(sys.argv[1])); out=[]
for f in sys.argv[2:]:
 doc=html.fromstring(open(f,encoding='utf-8').read()); rows=[]
 for t in m['replacement_targets']:
  xp=t.get('exact_xpath') or '//*[@id="'+t['selector'][1:]+'"]'
  nodes=doc.xpath(xp); assert len(nodes)==1
  b=html.tostring(nodes[0],encoding='utf-8',method='html',with_tail=False)
  h=hashlib.sha256(b).hexdigest(); assert h==t['original_dom_sha256'], (f,t['selector'],h)
  rows.append({'selector':t['selector'],'sha256':h,'bytes':len(b)})
 out.append({'file':f,'targets':rows})
print(json.dumps(out))`,path.join(metadata,'PRESERVATION_MANIFEST.json'),path.join(project,'workspace/index.html'),path.join(previous,'evaluation/new/index.html'),path.join(intake,'frozen/workspace/index.html')],{encoding:'utf8'}));
 assert.equal(sha(fs.readFileSync(path.join(intake,'frozen/Course_Production_Standards_v0.4.txt'))),manifest.standard.sha256);
 copy(path.join(previous,'owner'),owner);
 copy(path.join(previous,'evaluation/new'),path.join(root,'evaluation/baseline'));
 for(const f of fs.readdirSync(path.join(intake,'candidate')))copy(path.join(intake,'candidate',f),path.join(owner,'authoring/reviewed-fragments',f));
 json(path.join(root,'RECONCILIATION.json'),{canonical,previousCandidate:'ed8a93ef5a42a7c57998f2d8f3fae1372f534cf071a6101e786fd7a915e32cf4',verifiedPayloads:counts,correctedMetadataVersion:'0.1.1',contentVersion:'0.1.0',targetHashes:hashRows,historicalWholeOwnerDifferencesRetained:['overview override','approved lesson04 PNG pointer','native runtime repairs'],protectedDecisionsApplied:false,canonicalChanged:false});
 console.log(JSON.stringify({prepared:root,verifiedPayloads:counts,fourTargetsMatch:true}));
}else if(process.argv.includes('--build')){
 assert(!fs.existsSync(path.join(root,'evaluation/new')),'Preserve candidate');payloads(intake);payloads(metadata);
 const builder=read(path.join(owner,'scripts/build_chapter.py'));
 assert(builder.includes('return reviewed_final_teaching(s+worked(g)+transfer_html(transfer)+required(final)+footer(11)'));
 assert(builder.includes('reviewed_final_teaching(str(exbody))'));
 const base=read(path.join(root,'evaluation/baseline/index.html')),$=load(base,{sourceCodeLocationInfo:true});
 const fragments=read(path.join(owner,'authoring/reviewed-fragments/lesson-11.teaching-fragments.html'));
 const q=load(fragments,{sourceCodeLocationInfo:true},false);
 const ex=read(path.join(owner,'authoring/reviewed-fragments/extension.teaching-fragment.html'));
 const x=load(ex,{sourceCodeLocationInfo:true},false);
 const replacementSources=targets.map((selector,i)=>i<3?raw(fragments,q(selector)[0]):raw(ex,x('div.content-section')[0]));
 const edits=[],receipts=[];
 for(let i=0;i<4;i++){
  const selector=targets[i],old=$(selector);assert.equal(old.length,1);let after=replacementSources[i];
  const next=load(after,{sourceCodeLocationInfo:true},false);
  assert.equal(next('input,textarea,select,form,script,button,iframe,img,figure,a').length,0,'Teaching must remain inert');
  if(i<2){const t=old.find('.comparison-table')[0],nt=next('.comparison-table')[0];assert.equal($.html(t),next.html(nt),'Original table DOM');after=after.replace(raw(after,nt),raw(base,t));}
  if(i===3){for(const text of old.find('p').toArray().slice(1,3).map(e=>raw(base,e)))assert(after.includes(text),'Original A/B case bytes');}
  const attrs=old[0].attribs;for(const [name,value]of Object.entries(attrs))assert.equal(next('div').first().attr(name),value,`Target attribute ${name}`);
  receipts.push({selector,beforeSha256:sha(raw(base,old[0])),afterSha256:sha(after)});
  edits.push({start:old[0].sourceCodeLocation.startOffset,end:old[0].sourceCodeLocation.endOffset,text:after});
 }
 let output=base;for(const e of edits.sort((a,b)=>b.start-a.start))output=output.slice(0,e.start)+e.text+output.slice(e.end);
 const out=load(output,{sourceCodeLocationInfo:true});let reverted=output;
 const reverse=targets.map(selector=>{const e=out(selector)[0];return {start:e.sourceCodeLocation.startOffset,end:e.sourceCodeLocation.endOffset,text:raw(base,$(selector)[0])};});
 for(const e of reverse.sort((a,b)=>b.start-a.start))reverted=reverted.slice(0,e.start)+e.text+reverted.slice(e.end);
 assert.equal(reverted,base,'Exact four-block reversal');
 assert.equal(raw(output,out('#course-data')[0]),raw(base,$('#course-data')[0]),'All runtime configuration exact');
 assert.deepEqual(out('[id]').toArray().map(e=>e.attribs.id),$('[id]').toArray().map(e=>e.attribs.id),'ID sequence');
 for(const e of $('.course-page[id]').toArray())if(!['lesson-11','extension'].includes(e.attribs.id))assert.equal(raw(output,out('#'+e.attribs.id)[0]),raw(base,e),`Unchanged route ${e.attribs.id}`);
 for(const route of ['lesson-11','extension'])for(const sel of ['[data-check-question]','[data-writing-question]','[data-guided-item]','[data-note-input]','[data-transfer]','[data-extension-model]','textarea','input','button','[data-term-id]'])assert.deepEqual(out('#'+route).find(sel).toArray().map(e=>raw(output,e)),$('#'+route).find(sel).toArray().map(e=>raw(base,e)),`Protected ${route} ${sel}`);
 // Confirm every supplied visible prose string, without rewriting the manuscript.
 let proseStrings=0;for(const src of [fragments,ex]){const p=load(src);for(const e of p('h2,h3,p,li').toArray()){const t=p(e).text().replace(/\s+/g,' ').trim();assert(out.text().replace(/\s+/g,' ').includes(t),`Missing manuscript ${t}`);proseStrings++;}}
 check();fs.writeFileSync(path.join(owner,'workspace/index.html'),output);
 copy(path.join(owner,'workspace'),path.join(root,'evaluation/new'));
 function tree(dir,p=''){return fs.readdirSync(dir).sort().flatMap(n=>{const f=path.join(dir,n),r=path.posix.join(p,n);assert(!fs.lstatSync(f).isSymbolicLink());return fs.statSync(f).isDirectory()?tree(f,r):[{path:r,sha256:sha(fs.readFileSync(f))}];});}
 const before=tree(path.join(root,'evaluation/baseline')),after=tree(path.join(root,'evaluation/new'));assert.equal(before.length,after.length);for(const f of before)if(f.path!=='index.html')assert.equal(after.find(x=>x.path===f.path).sha256,f.sha256,f.path);
 json(path.join(root,'BUILD_RECEIPT.json'),{candidateHTML:sha(output),previousHTML:sha(base),canonicalHTML:canonical['workspace/index.html'],replacements:receipts,proseStrings,frozenFiles:after.length,allAssetsByteExact:true,allConfigurationByteExact:true,assessmentContractsByteExact:true,reversalByteExact:true,previousTenRoutesByteExact:true,originalIDSequenceExact:true,canonicalChanged:false,protectedDecisionsApplied:false,teacherAcceptance:'Only lessons01–02 accepted; remaining lessons/review/extension pending',nativeRuntime:'Not yet verified',release:'Not requested'});
 console.log(JSON.stringify({candidateHTML:sha(output),blocks:4,frozenFiles:after.length,canonicalChanged:false}));
}else throw Error('Use --prepare or --build');
