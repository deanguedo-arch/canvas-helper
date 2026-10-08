import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root=path.resolve('projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/ch11-ch12-handoff-v1.0.1');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const report=JSON.parse(fs.readFileSync(path.join(root,'BUILD_REPORT.json')));
const map=JSON.parse(fs.readFileSync(path.join(root,'EDITOR_RECONCILIATION.json')));
assert.equal(map.summary.unclassified,0);
const plans=[];
for(const chapter of [11,12]){
 const r=report.chapters[chapter],owner=path.resolve(r.canonicalOwner),candidate=path.join(root,'evaluation',`ch${chapter}-new`);
 const before=fs.readFileSync(path.join(owner,'index.html')),after=fs.readFileSync(path.join(candidate,'index.html'));
 assert.equal(digest(after),r.candidateSha256);
 assert.equal(map.chapters[chapter].candidateSha256,r.candidateSha256);
 assert([r.sourceSha256,r.candidateSha256].includes(digest(before)),`Unreviewed source drift CH${chapter}`);
 const assets=report.assetCopies.filter(a=>a.destination.startsWith(`evaluation/ch${chapter}-new/`)).map(a=>({source:path.join(root,a.destination),target:path.join(owner,path.relative(candidate,path.join(root,a.destination))),sha256:a.sha256}));
 if(chapter===12){const source=path.join(candidate,'assets/teaching-v101/extension-model-lock.js');assets.push({source,target:path.join(owner,'assets/teaching-v101/extension-model-lock.js'),sha256:digest(fs.readFileSync(source))});}
 for(const a of assets){assert.equal(digest(fs.readFileSync(a.source)),a.sha256);if(fs.existsSync(a.target))assert.equal(digest(fs.readFileSync(a.target)),a.sha256,`Asset collision ${a.target}`);}
 const metaPath=path.resolve(owner,'../meta/project.json'),meta=JSON.parse(fs.readFileSync(metaPath));
 plans.push({chapter,owner,before,after,assets,metaPath,meta});
}
// Preflight both chapters before writing either; immutable originals remain in evaluation/*-old.
const receipt={version:1,authorization:'Dean: integrate Chapters11–12 and finish local checks; no SCORM packages or deployment.',integratedAt:new Date().toISOString(),editorMap:path.relative(process.cwd(),path.join(root,'EDITOR_RECONCILIATION.json')),canonicalOverrideMigration:false,releaseAuthorized:false,chapters:[]};
for(const p of plans){
 const backup=path.join(root,'canonical-before',`ch${p.chapter}`);fs.mkdirSync(backup,{recursive:true});
 const metadataBackup=path.join(backup,'project.json');if(!fs.existsSync(metadataBackup))fs.copyFileSync(p.metaPath,metadataBackup);
 for(const a of p.assets){fs.mkdirSync(path.dirname(a.target),{recursive:true});if(!fs.existsSync(a.target))fs.copyFileSync(a.source,a.target);}
 fs.writeFileSync(path.join(p.owner,'index.html'),p.after);
 const id=`ch${p.chapter}-teaching-handoff-v101`,component={id,source:path.relative(process.cwd(),path.join(root,'pro-return')),target:path.relative(process.cwd(),path.join(p.owner,'index.html')),status:'active'};
 p.meta.injectedComponents??=[];if(!p.meta.injectedComponents.some(c=>c.id===id))p.meta.injectedComponents.push(component);
 if(p.chapter===12){const source=path.relative(process.cwd(),path.join(p.owner,'assets/teaching-v101/extension-model-lock.js'));if(!p.meta.canonicalSources.includes(source))p.meta.canonicalSources.push(source);}
 fs.writeFileSync(p.metaPath,JSON.stringify(p.meta,null,2)+'\n');
 assert.equal(digest(fs.readFileSync(path.join(p.owner,'index.html'))),report.chapters[p.chapter].candidateSha256);
 receipt.chapters.push({chapter:p.chapter,canonicalEntry:component.target,beforeSha256:report.chapters[p.chapter].sourceSha256,integratedSha256:report.chapters[p.chapter].candidateSha256,authoringStatus:p.meta.authoringStatus,driver:p.meta.authoring.driverId,assetFiles:new Set(p.assets.map(a=>a.target)).size});
}
fs.writeFileSync(path.join(root,'CANONICAL_INTEGRATION.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));
