// One-time, guarded canonical integration. Never regenerate the whole course.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),c=require('cheerio');
const root=__dirname,workspace=path.resolve(root,'../../../workspace');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const indexPath=path.join(workspace,'index.html');
const before=fs.readFileSync(indexPath,'utf8'),oldArticle=fs.readFileSync(path.join(root,'baseline/ce1-03.html'),'utf8'),proposed=fs.readFileSync(path.join(root,'lesson-b.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'COMPARISON_MANIFEST.json')));
assert.equal(sha(proposed),manifest.proposedArticleSHA256,'Proposal changed since review');
const $=c.load(before,{sourceCodeLocationInfo:true}),loc=$('#ce1-03')[0].sourceCodeLocation;
assert.equal(before.slice(loc.startOffset,loc.endOffset),oldArticle,'CE1-03 changed since review; inspect before integrating');
const old=c.load(oldArticle,{sourceCodeLocationInfo:true}),fresh=c.load(proposed,{sourceCodeLocationInfo:true});
const raws=(text,doc,selector)=>doc(selector).toArray().map(e=>{const l=e.sourceCodeLocation;return text.slice(l.startOffset,l.endOffset)});
const preserved={};
for(const selector of ['input','textarea','select','fieldset','template','video','.finlit-document','.finlit-route-pair','.finlit-signoff','.finlit-completion','.student-instructions']){
 const a=raws(oldArticle,old,selector),b=raws(proposed,fresh,selector);assert.deepEqual(b,a,'Changed original '+selector);preserved[selector]=a.length;
}
assert.equal(fresh('#ce1-03').attr('data-task-version'),old('#ce1-03').attr('data-task-version'));
for(const attr of ['id','data-canvas-helper-edit-key']){
 const values=doc=>doc('['+attr+']').toArray().map(e=>doc(e).attr(attr));
 const a=values(old),b=values(fresh);a.forEach(x=>assert.ok(b.includes(x),'Lost '+attr+' '+x));assert.equal(new Set(b).size,b.length);
}
const after=before.slice(0,loc.startOffset)+proposed+before.slice(loc.endOffset);
const afterDOM=c.load(after,{sourceCodeLocationInfo:true}),afterLoc=afterDOM('#ce1-03')[0].sourceCodeLocation;
assert.equal(after.slice(0,afterLoc.startOffset),before.slice(0,loc.startOffset));
assert.equal(after.slice(afterLoc.endOffset),before.slice(loc.endOffset));
assert.equal(new Set(afterDOM('[id]').toArray().map(e=>afterDOM(e).attr('id'))).size,afterDOM('[id]').length);
const baseline=JSON.parse(fs.readFileSync(path.join(root,'BASELINE.json'))),rootHashes={};
for(const name of Object.keys(baseline.files))rootHashes[name]=sha(fs.readFileSync(path.join(workspace,name)));
const record=path.join(root,'canonical-integration');fs.mkdirSync(record);
fs.writeFileSync(path.join(record,'before-index.html'),before,{flag:'wx'});
fs.writeFileSync(path.join(record,'before-root-hashes.json'),JSON.stringify(rootHashes,null,2)+'\n',{flag:'wx'});
// This is the only canonical mutation.
fs.writeFileSync(indexPath,after);
assert.equal(fs.readFileSync(indexPath,'utf8'),after);
for(const [name,hash] of Object.entries(rootHashes))if(name!=='index.html')assert.equal(sha(fs.readFileSync(path.join(workspace,name))),hash,'Unrelated root changed: '+name);
const report={schemaVersion:1,status:'pass',lesson:'ce1-03',teacherAccepted:true,approval:'Dean: i really like it (2026-10-05), accepting the offered Version B choice',integratedAt:new Date().toISOString(),beforeIndexSHA256:sha(before),afterIndexSHA256:sha(after),proposedArticleSHA256:sha(proposed),exactApprovedArticle:true,outsideArticleByteUnchanged:true,otherRootFilesUnchanged:Object.keys(rootHashes).length-1,preserved,allExistingIdsAndEditKeysRetained:true,taskVersionsUnchanged:true,noStorageMigration:true,runtimeAndHistoryRegistryUnchanged:true,route:'Lead: dirty canonical source and saved-state compatibility; deterministic guarded replacement',rollout:false};
fs.writeFileSync(path.join(record,'source-checks.json'),JSON.stringify(report,null,2)+'\n');
manifest.status='teacher-accepted-canonical-integrated';manifest.teacherAccepted=true;manifest.canonicalIntegrated=true;manifest.approval=report.approval;manifest.integratedAt=report.integratedAt;manifest.canonicalIndexSHA256=report.afterIndexSHA256;
fs.writeFileSync(path.join(root,'COMPARISON_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(report));
