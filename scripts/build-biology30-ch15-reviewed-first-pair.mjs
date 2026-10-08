import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {load} from 'cheerio';

// Current HTML owner, isolated review only. No historical generator is executed.
const project=path.resolve('projects/biology30-chapter-15');
const root=path.join(project,'meta/teaching-overhaul/2026-10-08-teacher-led/first-pair-v0.1.0');
const intake=path.join(root,'intake');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p,'utf8');
const raw=(s,e)=>s.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
const write=(p,b)=>{assert(!fs.existsSync(p),`Preserve ${p}`);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b,{flag:'wx'});};
const json=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
const expected={
  'workspace/index.html':'7ff098c0763a1eedbe8c7e562e13082aa7a832582f9c73fd1739eaa4c31f0109',
  'workspace/main.js':'45b4b9c7da23646274f59415fa286873fdbdad3a2b8b16b53ccd147c0781f65f',
  'workspace/styles.css':'94fe523654289edd8b0f951dd6782f83dce7d08f5e18a3d903d25576fbfa0ba5',
  'meta/external-generation/authoring/course-config.json':'8ae42534366bf744c39a584059d2b1be871bbdd6ffae2954d1384ad7e802faaf'
};
for(const [p,h]of Object.entries(expected))assert.equal(sha(fs.readFileSync(path.join(project,p))),h,`Current owner drift ${p}`);
const payloads=read(path.join(intake,'SHA256SUMS.txt')).trim().split(/\r?\n/);
for(const line of payloads){const m=/^([a-f0-9]{64})\s+\*?(.+)$/.exec(line);assert(m,line);assert(!m[2].startsWith('/')&&!m[2].split('/').includes('..'));assert.equal(sha(fs.readFileSync(path.join(intake,m[2]))),m[1],m[2]);}
const base=read(path.join(project,'workspace/index.html')),$=load(base,{sourceCodeLocationInfo:true});
const spec=JSON.parse(read(path.join(intake,'STATIC_VALIDATION.json')));
const config=JSON.parse($('#course-data').text()),originalConfig=structuredClone(config);
assert.deepEqual(config,JSON.parse(read(path.join(project,'meta/external-generation/authoring/course-config.json'))),'Native and interaction owner differ');
const edits=[],replacements=[],supplementID='ch15-source-fertilization-detail';
for(const routeSpec of spec.routes){
  const route=routeSpec.lesson;
  assert.equal(sha(raw(base,$('#'+route)[0])),routeSpec.baseRouteSha256,`Current route drift ${route}`);
  assert.equal(raw(base,$('#'+route)[0]),read(path.join(intake,`source/${route}-base.html`)),`Exact source route ${route}`);
  for(const block of routeSpec.blocks){
    const old=$('#'+block.id);assert.equal(old.length,1);
    const before=raw(base,old[0]);assert.equal(sha(before),block.beforeSha256,`Before ${block.id}`);
    const replacement=read(path.join(intake,`fragments/${block.id}.html`));assert.equal(sha(replacement),block.afterSha256,`After ${block.id}`);
    const q=load(replacement,{sourceCodeLocationInfo:true},false),node=q('#'+block.id)[0];assert(node);
    assert.equal(raw(replacement,node),replacement,'Fragment must be exact single root');
    assert.deepEqual(node.attribs,old[0].attribs,`Root attributes ${block.id}`);
    assert.equal(q('input,textarea,select,form,script,iframe').length,0,'No new executable or saved-input surfaces');
    const oldFigures=old.find('figure').toArray(),newFigures=q('figure').toArray().filter(e=>e.attribs.id!==supplementID);
    assert.deepEqual(newFigures.map(e=>raw(replacement,e)),oldFigures.map(e=>raw(base,e)),`Original figures ${block.id}`);
    const oldButtons=old.find('button').toArray().map(e=>raw(base,e)).sort(),newButtons=q('button').toArray().map(e=>raw(replacement,e)).sort();
    assert.deepEqual(newButtons,oldButtons,`Vocabulary controls ${block.id}`);
    for(const attr of ['data-canvas-helper-edit-key','data-canvas-edit-key']){
      const retained=new Set(q(`[${attr}]`).toArray().map(e=>e.attribs[attr]));
      for(const e of old.find(`[${attr}]`).toArray())assert(retained.has(e.attribs[attr]),`Lost editable paragraph ${block.id}`);
    }
    edits.push({start:old[0].sourceCodeLocation.startOffset,end:old[0].sourceCodeLocation.endOffset,text:replacement});
    replacements.push({id:block.id,beforeSha256:sha(before),afterSha256:sha(replacement)});
    if(block.id.endsWith('-worked')){
      const native=config.guidedActivities.find(x=>x.route===route);assert(native?.worked);
      native.worked={...native.worked,title:q('h3').first().text(),scenario:q('h3').first().next('p').text(),steps:q('ol>li').toArray().map(e=>q(e).text())};
    }
  }
}
const data=$('#course-data')[0];edits.push({start:data.sourceCodeLocation.startTag.endOffset,end:data.sourceCodeLocation.endTag.startOffset,text:JSON.stringify(config).replace(/<\//g,'<\\/')});
let output=base;for(const edit of edits.sort((a,b)=>b.start-a.start))output=output.slice(0,edit.start)+edit.text+output.slice(edit.end);
const out=load(output,{sourceCodeLocationInfo:true});
const ids=out('[id]').toArray().map(e=>e.attribs.id);assert.equal(new Set(ids).size,ids.length,'Duplicate IDs');
assert.deepEqual(ids.filter(id=>id!==supplementID),$('[id]').toArray().map(e=>e.attribs.id),'Original ID order changed');
assert.equal(out('#'+supplementID).length,1);assert.equal(out('#'+supplementID).parent().attr('id'),'ch15-l01-teaching-02');
assert.equal(out('#'+supplementID+' img').attr('src'),'./assets/figures/ch15-source-fertilization-detail.jpg');
const restored=structuredClone(config);for(const r of spec.routes)restored.guidedActivities.find(x=>x.route===r.lesson).worked=originalConfig.guidedActivities.find(x=>x.route===r.lesson).worked;
assert.deepEqual(restored,originalConfig,'Non-worked configuration changed');
for(const routeSpec of spec.routes){const route=routeSpec.lesson;
  for(const selector of ['[data-check-question]','[data-writing-question]','[data-guided-item]','[data-note-input]','figure'])
    assert.deepEqual(out('#'+route).find(selector).toArray().filter(e=>e.attribs.id!==supplementID).map(e=>raw(output,e)),$('#'+route).find(selector).toArray().map(e=>raw(base,e)),`Protected ${route} ${selector}`);
}
for(const e of $('.course-page[id]').toArray())if(!spec.routes.some(r=>r.lesson===e.attribs.id))assert.equal(raw(output,out('#'+e.attribs.id)[0]),raw(base,e),`Unrelated route ${e.attribs.id}`);
let reverted=output;
const reversals=replacements.map(r=>{const e=out('#'+r.id)[0];return {start:e.sourceCodeLocation.startOffset,end:e.sourceCodeLocation.endOffset,text:raw(base,$('#'+r.id)[0])};});
const outputData=out('#course-data')[0];reversals.push({start:outputData.sourceCodeLocation.startOffset,end:outputData.sourceCodeLocation.endOffset,text:raw(base,data)});
for(const e of reversals.sort((a,b)=>b.start-a.start))reverted=reverted.slice(0,e.start)+e.text+reverted.slice(e.end);
assert.equal(reverted,base,'Exact whole-index reversibility');
const copy=(a,b)=>{assert(!fs.existsSync(b),`Preserve ${b}`);if(fs.statSync(a).isDirectory()){fs.mkdirSync(b,{recursive:true});for(const n of fs.readdirSync(a))copy(path.join(a,n),path.join(b,n));}else{fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(a,b,fs.constants.COPYFILE_EXCL);}};
const tree=dir=>{const found=[];function walk(d,p=''){for(const n of fs.readdirSync(d).sort()){const f=path.join(d,n),r=path.posix.join(p,n);assert(!fs.lstatSync(f).isSymbolicLink(),`Mutable link ${r}`);if(fs.statSync(f).isDirectory())walk(f,r);else found.push({path:r,sha256:sha(fs.readFileSync(f))});}}walk(dir);return found;};
assert(!fs.existsSync(path.join(root,'evaluation/new')));
copy(path.join(project,'workspace'),path.join(root,'evaluation/old'));
copy(path.join(project,'workspace'),path.join(root,'evaluation/new'));
const assetPath=spec.supplement.asset.replace(/^learner\//,'');
const supplement=fs.readFileSync(path.join(intake,spec.supplement.asset));assert.equal(sha(supplement),spec.supplement.sha256);
const destination=path.join(root,'evaluation/new',assetPath);assert(!fs.existsSync(destination),'New supplement conflicts');write(destination,supplement);
fs.writeFileSync(path.join(root,'evaluation/new/index.html'),output);
json(path.join(root,'owner/authoring/course-config.json'),config);
const oldTree=tree(path.join(root,'evaluation/old')),newTree=tree(path.join(root,'evaluation/new'));
for(const f of oldTree)if(f.path!=='index.html')assert.equal(newTree.find(n=>n.path===f.path)?.sha256,f.sha256,`Frozen asset ${f.path}`);
assert.equal(newTree.length,oldTree.length+1);
json(path.join(root,'BUILD_RECEIPT.json'),{date:'2026-10-08',currentOwner:expected,verifiedPayloads:payloads.length,replacements,candidateHTML:sha(output),baselineHTML:sha(base),originalIDs:$('[id]').length,originalFigures:$('figure').length,newFigureID:supplementID,supplement:spec.supplement,originalFiles:oldTree.length,candidateFiles:newTree.length,allOriginalAssetsByteExact:true,protectedTasksByteExact:true,reversalByteExact:true,originalIDSequenceRetained:true,changedConfigurationPaths:spec.routes.map(r=>`guidedActivities[route=${r.lesson}].worked`),canonicalChanged:false,teacherAccepted:false,consumedStandard:'v0.3 exact supplied bytes',integrationStandard:'v0.4 existing reconciled boundary',fullBankFreshReview:'Not verified',deferred:['Native interaction and image checks','Whole-bank fresh review including runtime vocabulary/Frayer and cumulative prerequisites','Teacher acceptance','Responsive/keyboard/reader/export','Studio/LMS/release']});
console.log(JSON.stringify({candidateHTML:sha(output),blocks:replacements.length,verifiedPayloads:payloads.length,candidateFiles:newTree.length,canonicalChanged:false}));
