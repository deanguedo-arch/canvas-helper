import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {load} from 'cheerio';

// Additive review artifact. Never invokes a legacy generator or changes the course owner.
const project=path.resolve('projects/biology30-chapter-15');
const parent=path.join(project,'meta/teaching-overhaul/2026-10-08-teacher-led');
const root=path.join(parent,'complete-teaching-v0.1.0');
const previous=path.join(parent,'first-pair-v0.1.0/evaluation/new');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p,'utf8');
const raw=(s,e)=>s.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
const write=(p,b)=>{if(fs.existsSync(p)){assert.equal(sha(fs.readFileSync(p)),sha(b),`Preserve different bytes ${p}`);return;}fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b,{flag:'wx'});};
const json=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
const packages=[
  ['03-04','65cbf4edaef83a7e58d8aafb25e61f1541001ccc9422328db927de68d209a68c'],
  ['05-06','c9cd6005d38938df325ac3feefd5f62b51b8a9be878ce04cec42befc6e39bd7c'],
  ['07-08','9383b26b04e3db8c0340306bcfb2fdd334e7b14dccd9159e3cd07a49e74989ea'],
  ['09-10','e794424ccaa4cc608fa55912b601cf710154813defdda0c066af7cce5bf28b54'],
  ['11-12','2e02adbcb07880c81793681e4fd50eaa6f7f95cf6ae2ede787716a301734b723']
].map(([span,hash])=>({span,hash,name:`Biology30_CH15_${span}_Conditional_Content_Handoff_v0.1.0.zip`}));
packages.push({span:'headings',hash:'52b77a8b6e65ec5b656628e47b15b15c3221e4c526cd2ce654b9add48c52bf01',name:'Biology30_CH15_09-12_CH16_01-02_Heading_Only_Correction_v0.1.0.zip'});
const current={
  'workspace/index.html':'7ff098c0763a1eedbe8c7e562e13082aa7a832582f9c73fd1739eaa4c31f0109',
  'workspace/main.js':'45b4b9c7da23646274f59415fa286873fdbdad3a2b8b16b53ccd147c0781f65f',
  'workspace/styles.css':'94fe523654289edd8b0f951dd6782f83dce7d08f5e18a3d903d25576fbfa0ba5',
  'meta/external-generation/authoring/course-config.json':'8ae42534366bf744c39a584059d2b1be871bbdd6ffae2954d1384ad7e802faaf'
};
for(const [p,h]of Object.entries(current))assert.equal(sha(fs.readFileSync(path.join(project,p))),h,`Owner drift ${p}`);
assert.equal(sha(fs.readFileSync(path.join(previous,'index.html'))),'9df5d0862c281fac3f23438be46e0828c962a6c14508fbb66b1936e1ac7d58d7','Previous candidate drift');
if(process.argv.includes('--prepare')){
  assert(!fs.existsSync(path.join(root,'intake')),'Preserve existing intake');
  const report=execFileSync('python3',['-c',String.raw`
import sys,json,zipfile,hashlib,re
from pathlib import Path
root=Path(sys.argv[1]); packages=json.loads(sys.argv[2]); reports=[]
for p in packages:
 source=Path('/Users/deanguedo/Downloads')/p['name']
 assert hashlib.sha256(source.read_bytes()).hexdigest()==p['hash'],source
 with zipfile.ZipFile(source) as z:
  assert z.testzip() is None,source
  assert len(z.namelist())==len(set(z.namelist())),source
  for n in z.namelist():
   assert not n.startswith('/') and '..' not in Path(n).parts,n
   assert ((z.getinfo(n).external_attr >> 16) & 0o170000)!=0o120000,n
  lines=z.read('SHA256SUMS.txt').decode().strip().splitlines()
  for line in lines:
   m=re.fullmatch(r'([a-f0-9]{64})\s+\*?(.+)',line); assert m,line
   assert hashlib.sha256(z.read(m[2])).hexdigest()==m[1],m[2]
  target=root/p['span']; assert not target.exists(),target
  z.extractall(target)
  reports.append(dict(span=p['span'],zipSha256=p['hash'],verifiedPayloads=len(lines),crc=True))
print(json.dumps(reports))
`,path.join(root,'intake'),JSON.stringify(packages)],{encoding:'utf8'});
  json(path.join(root,'INTAKE_RECEIPT.json'),JSON.parse(report));
  console.log(report.trim());
  process.exit(0);
}
assert(process.argv.includes('--build'),'Choose --prepare or --build');
assert(!fs.existsSync(path.join(root,'evaluation')),'Preserve previous complete candidate');
const base=read(path.join(previous,'index.html')),$=load(base,{sourceCodeLocationInfo:true});
const config=JSON.parse($('#course-data').text()),originalConfig=structuredClone(config);
const canonical=read(path.join(project,'workspace/index.html'));
const canonicalConfig=JSON.parse(load(canonical)('#course-data').text());
assert.deepEqual(canonicalConfig,JSON.parse(read(path.join(project,'meta/external-generation/authoring/course-config.json'))));
const guards=JSON.parse(read(path.join(root,'intake/headings/REPAIR_GUARDS.json')));
const edits=[],replacements=[],routes=[],supplements=[],newIDs=new Set();
for(const p of packages.filter(x=>x.span!=='headings')){
  const intake=path.join(root,'intake',p.span),spec=JSON.parse(read(path.join(intake,'STATIC_VALIDATION.json')));
  for(const line of read(path.join(intake,'SHA256SUMS.txt')).trim().split(/\r?\n/)){
    const m=/^([a-f0-9]{64})\s+\*?(.+)$/.exec(line);assert(m);assert.equal(sha(fs.readFileSync(path.join(intake,m[2]))),m[1],m[2]);
  }
  if(spec.supplement){
    const asset=(spec.supplement.asset||spec.supplement.path).replace(/^.*?learner\//,'learner/');
    const b=fs.readFileSync(path.join(intake,asset));assert.equal(sha(b),spec.supplement.sha256);
    supplements.push({asset,sha256:sha(b),intake});
  }
  for(const r of spec.routes){
    routes.push(r.lesson);assert.equal(sha(raw(base,$('#'+r.lesson)[0])),r.baseRouteSha256,`Route drift ${r.lesson}`);
    assert.equal(raw(base,$('#'+r.lesson)[0]),read(path.join(intake,`source/${r.lesson}-base.html`)));
    const guard=guards.find(g=>g.batch.startsWith('ch15-')&&g.lesson===r.lesson);
    let repaired,repairedDoc;
    if(guard){
      assert.equal(guard.deliveredCandidateSha256,r.candidateRouteSha256);
      assert.equal(guard.historicalBaseSha256,r.baseRouteSha256);
      repaired=read(path.join(root,'intake/headings',guard.batch,`${r.lesson}-heading-repaired-candidate.html`));
      assert.equal(sha(repaired),guard.repairedCandidateSha256);
      repairedDoc=load(repaired,{sourceCodeLocationInfo:true});
    }
    for(const block of r.blocks){
      const old=$('#'+block.id);assert.equal(old.length,1);
      const before=raw(base,old[0]);assert.equal(sha(before),block.beforeSha256);
      let replacement=read(path.join(intake,`fragments/${block.id}.html`));assert.equal(sha(replacement),block.afterSha256);
      if(guard){
        const g=guard.blocks.find(x=>x.id===block.id);assert(g);assert.equal(g.beforeSha256,sha(replacement));
        const corrected=raw(repaired,repairedDoc('#'+block.id)[0]);assert.equal(sha(corrected),g.afterSha256);
        const permitted=block.id.endsWith('-worked')
          ?replacement.replace('<h3>Worked example</h3>','<p class="section-label">Worked example</p>').replace('<h4>','<h3>').replace('</h4>','</h3>')
          :replacement.replace('<h3>','<h2>').replace('</h3>','</h2>');
        assert.equal(corrected,permitted,`Heading-only repair ${block.id}`);replacement=corrected;
      }
      const q=load(replacement,{sourceCodeLocationInfo:true},false),node=q('#'+block.id)[0];assert(node);
      assert.equal(raw(replacement,node),replacement);assert.deepEqual(node.attribs,old[0].attribs);
      assert.equal(q('input,textarea,select,form,script,iframe').length,0);
      const oldFigureIDs=new Set(old.find('figure').toArray().map(e=>e.attribs.id));
      for(const e of q('figure').toArray())if(!oldFigureIDs.has(e.attribs.id)){assert(e.attribs.id);newIDs.add(e.attribs.id);}
      assert.deepEqual(q('figure').toArray().filter(e=>oldFigureIDs.has(e.attribs.id)).map(e=>raw(replacement,e)),old.find('figure').toArray().map(e=>raw(base,e)),`Figures ${block.id}`);
      assert.deepEqual(q('button').toArray().map(e=>raw(replacement,e)).sort(),old.find('button').toArray().map(e=>raw(base,e)).sort(),`Terms ${block.id}`);
      for(const attr of ['data-canvas-helper-edit-key','data-canvas-edit-key']){
        const retained=new Set(q(`[${attr}]`).toArray().map(e=>e.attribs[attr]));
        for(const e of old.find(`[${attr}]`).toArray())assert(retained.has(e.attribs[attr]),`Edit key ${block.id}`);
      }
      edits.push({start:old[0].sourceCodeLocation.startOffset,end:old[0].sourceCodeLocation.endOffset,text:replacement});
      replacements.push({id:block.id,route:r.lesson,beforeSha256:sha(before),afterSha256:sha(replacement),headingRepaired:!!guard});
      write(path.join(root,'owner/authoring/reviewed-fragments',`${block.id}.html`),replacement);
      if(block.id.endsWith('-worked')){
        const native=config.guidedActivities.find(x=>x.route===r.lesson);assert(native?.worked);
        native.worked={...native.worked,title:q('h3').first().text(),scenario:q('h3').first().next('p').text(),steps:q('ol>li').toArray().map(e=>q(e).text())};
      }
    }
  }
}
assert.equal(replacements.length,38);assert.equal(newIDs.size,3);assert.equal(supplements.length,3);
const data=$('#course-data')[0];edits.push({start:data.sourceCodeLocation.startTag.endOffset,end:data.sourceCodeLocation.endTag.startOffset,text:JSON.stringify(config).replace(/<\//g,'<\\/')});
let output=base;for(const e of edits.sort((a,b)=>b.start-a.start))output=output.slice(0,e.start)+e.text+output.slice(e.end);
const out=load(output,{sourceCodeLocationInfo:true});
const ids=out('[id]').toArray().map(e=>e.attribs.id);assert.equal(new Set(ids).size,ids.length);assert.deepEqual(ids.filter(id=>!newIDs.has(id)),$('[id]').toArray().map(e=>e.attribs.id));
const restored=structuredClone(config);for(const route of routes){const original=originalConfig.guidedActivities.find(x=>x.route===route);if(original)restored.guidedActivities.find(x=>x.route===route).worked=original.worked;}
assert.deepEqual(restored,originalConfig,'Non-worked config drift');
for(const e of $('.course-page[id]').toArray())if(!routes.includes(e.attribs.id))assert.equal(raw(output,out('#'+e.attribs.id)[0]),raw(base,e),`Unrelated ${e.attribs.id}`);
for(const route of routes)for(const selector of ['[data-check-question]','[data-writing-question]','[data-guided-item]','[data-note-input]'])assert.deepEqual(out('#'+route).find(selector).toArray().map(e=>raw(output,e)),$('#'+route).find(selector).toArray().map(e=>raw(base,e)),`Protected ${route} ${selector}`);
const reversal=replacements.map(r=>{const e=out('#'+r.id)[0];return {start:e.sourceCodeLocation.startOffset,end:e.sourceCodeLocation.endOffset,text:raw(base,$('#'+r.id)[0])};});
const d=out('#course-data')[0];reversal.push({start:d.sourceCodeLocation.startOffset,end:d.sourceCodeLocation.endOffset,text:raw(base,data)});
let reverted=output;for(const e of reversal.sort((a,b)=>b.start-a.start))reverted=reverted.slice(0,e.start)+e.text+reverted.slice(e.end);assert.equal(reverted,base,'Exact whole-index reversal');
const copy=(a,b)=>{assert(!fs.existsSync(b));fs.cpSync(a,b,{recursive:true,errorOnExist:true,force:false});};
copy(path.join(project,'workspace'),path.join(root,'evaluation/baseline'));copy(previous,path.join(root,'evaluation/new'));
for(const s of supplements)write(path.join(root,'evaluation/new',s.asset.replace(/^learner\//,'')),fs.readFileSync(path.join(s.intake,s.asset)));
fs.writeFileSync(path.join(root,'evaluation/new/index.html'),output);
write(path.join(root,'owner/workspace/index.html'),output);json(path.join(root,'owner/authoring/course-config.json'),config);
const tree=dir=>{const a=[];function walk(d,p=''){for(const n of fs.readdirSync(d).sort()){const f=path.join(d,n),r=path.posix.join(p,n);assert(!fs.lstatSync(f).isSymbolicLink());if(fs.statSync(f).isDirectory())walk(f,r);else a.push({path:r,sha256:sha(fs.readFileSync(f))});}}walk(dir);return a;};
const oldTree=tree(path.join(root,'evaluation/baseline')),newTree=tree(path.join(root,'evaluation/new'));
for(const f of oldTree)if(f.path!=='index.html')assert.equal(newTree.find(n=>n.path===f.path)?.sha256,f.sha256);
assert.equal(newTree.length,oldTree.length+4);
json(path.join(root,'BUILD_RECEIPT.json'),{date:'2026-10-08',currentOwner:current,previousCandidate:sha(base),candidateHTML:sha(output),canonicalChanged:false,integratedLessons:'01–12',newReplacements:replacements,cumulativeBlocks:46,newFigureIDs:[...newIDs],cumulativeSourceSupplements:4,originalIDs:load(canonical)('[id]').length,candidateIDs:ids.length,originalFiles:oldTree.length,candidateFiles:newTree.length,protectedTasksByteExact:true,originalAssetsByteExact:true,wholeIndexReversalByteExact:true,headingOnlyGuardsVerified:true,changedConfigOnly:'guidedActivities[route=lesson-03 through lesson-11].worked teaching mirror',fullBankFreshReview:'Not verified',teacherAccepted:false,deferred:['Installed image/keyboard/mobile checks','Optional save/reload and native controls','Whole-bank fresh review with CH14 prerequisites','Protected assessment decisions','Teacher acceptance','Studio/LMS/release']});
let comparison=read(path.join(parent,'first-pair-v0.1.0/evaluation/index.html'));
const options=out('.course-page[id^="lesson-"]').toArray().map(e=>`<option value="${e.attribs.id.slice(-2)}">${out(e).find('.page-header h1').first().text()}</option>`).join('');
comparison=comparison.replace(/<select id="lesson">[\s\S]*?<\/select>/,`<select id="lesson">${options}</select>`).replace("['01','02'].includes(initial)","Array.from(picker.options).some(o=>o.value===initial)").replaceAll('57623','57643').replaceAll('57621','57641').replaceAll('57610/?lesson=09','57630/?lesson=11').replaceAll('lessons 1–2','complete chapter').replace('Lessons 1–2:','Lessons 1–12:').replace('One exact teacher-source image added.','Four exact source supplements added.');
assert.equal((comparison.match(/<option /g)||[]).length,12);
write(path.join(root,'evaluation/index.html'),comparison);
console.log(JSON.stringify({candidateHTML:sha(output),blocks:38,cumulativeBlocks:46,candidateFiles:newTree.length,canonicalChanged:false}));
