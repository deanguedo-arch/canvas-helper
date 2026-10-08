import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { exemplarTransferContext, sampleBinding, transferReviewChecks, activityInteractionChecks, validateActivityInteractions, type ExemplarTransfer } from '../lib/exemplar-transfer.ts';
import { buildProjectAuthoringContext, inspectCourseAuthoringProject } from '../lib/course-authoring/context.ts';
import { inspectPinnedStandard } from '../lib/course-standards.ts';
import { generatePromptPack } from '../lib/intelligence/apply/prompt-pack.ts';
import { buildEnglishFactoryProject } from '../lib/english-unit/factory-build.js';
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
async function fixture() {
 const root = await mkdtemp(path.join(os.tmpdir(), 'exemplar-transfer-'));
 await mkdir(path.join(root, 'projects/biology-sample/meta'), {recursive:true});
 async function file(name: string, text: string) { await writeFile(path.join(root,name),text); return {path:name,sha256:sha(text)}; }
 const strategy = await file('strategy.md','Connected teaching functions, adapted to subject.');
 const passage = await file('passage.html','A continuous axon; later lessons teach ion movement.');
 const record: ExemplarTransfer = {schemaVersion:1,sourceBindings:[passage],strategy,exemplar:{id:'chapter11',version:'1.0.0',files:[passage]},decisions:[{function:'deferral',passage,locator:'first-use definition',decision:'Define enough for structure; defer ions.'}],sampleLessons:['lesson-02'],plans:[{lesson:'lesson-02',purpose:'Explain allele separation',prerequisites:['allele'],progression:['parent pair','gamete','fertilisation'],subjectRequirements:['diploid to haploid'],deferred:['grid to lesson03'],activities:[{id:'fresh',purpose:'Distinguish copying from separation',changedInference:'Repair a diagram'}]}]};
 async function save() {await writeFile(path.join(root,'projects/biology-sample/meta/exemplar-transfer.json'),JSON.stringify(record));}
 async function accepted() {
 record.sample={version:'0.1',files:[await file('sample.html','Illustrative test fixture only; not teacher-approved copy.')],instructionalReview:{path:'unused',sha256:''},technicalReview:{path:'unused',sha256:''}};
 const binding=sampleBinding(record);
 record.sample.instructionalReview=await file('instructional.json',JSON.stringify({kind:'instructional',binding,reviewer:'Synthetic reviewer',unresolved:[],checks:Object.fromEntries(transferReviewChecks.map(c=>[c,'Synthetic passage finding']))}));
 record.sample.technicalReview=await file('technical.json',JSON.stringify({kind:'technical',binding,reviewer:'Synthetic checker',unresolved:[]}));
 record.sample.interactionReview=await file('interaction.json',JSON.stringify({kind:'activity-interaction',binding,reviewer:'Synthetic interaction checker',unresolved:[],activities:[{id:'fresh',checks:Object.fromEntries(activityInteractionChecks.map(c=>[c,'Synthetic per-activity evidence'])),evidence:record.sample.files}]}));
 record.sample.teacherDecision={teacher:'Dean',decision:'accepted',binding,evidence:await file('decision.json',JSON.stringify({teacher:'Dean',decision:'accepted',binding,exactWords:'SYNTHETIC TEST ONLY',source:'test fixture'}))};
 const batchBinding=sha(JSON.stringify({acceptedBinding:binding,files:record.sample.files}));
 record.continuation={lessons:['lesson-02'],acceptedBinding:binding,previousBatchFiles:record.sample.files,previousBatchReview:await file('batch.json',JSON.stringify({kind:'instructional',binding:batchBinding,reviewer:'Synthetic reviewer',unresolved:[],checks:Object.fromEntries(transferReviewChecks.map(c=>[c,'Synthetic batch finding']))}))};
 await save();
 }
 return {root,record,file,save,accepted,cleanup:()=>rm(root,{recursive:true,force:true})};
}
test('unadopted projects remain unassessed and do not get changed',async()=>{const f=await fixture();try { assert.match(await exemplarTransferContext('biology-sample',f.root),/unassessed/); } finally {await f.cleanup();}});
test('sample plan is bounded; default continuation stops without teacher acceptance',async()=>{const f=await fixture();try {await f.save();assert.match(await exemplarTransferContext('biology-sample',f.root,'sample'),/lesson-02.*STOP/);await assert.rejects(exemplarTransferContext('biology-sample',f.root),/continuation/);f.record.continuation={lessons:['lesson-02'],acceptedBinding:'',previousBatchFiles:[],previousBatchReview:f.record.strategy};await f.save();await assert.rejects(exemplarTransferContext('biology-sample',f.root),/Dean must accept/);}finally {await f.cleanup();}});
test('accepted exact sample allows continuation; copy or strategy drift stops it',async()=>{const f=await fixture();try {await f.accepted();assert.match(await exemplarTransferContext('biology-sample',f.root),/not automatic teaching certification/);await writeFile(path.join(f.root,'sample.html'),'changed');await assert.rejects(exemplarTransferContext('biology-sample',f.root),/Stale/);await f.accepted();await writeFile(path.join(f.root,'strategy.md'),'changed');await assert.rejects(exemplarTransferContext('biology-sample',f.root),/Stale/);}finally {await f.cleanup();}});
test('technical review cannot substitute for instructional review; unresolved and stale reviews stop',async()=>{const f=await fixture();try {await f.accepted();f.record.sample!.instructionalReview=f.record.sample!.technicalReview;await f.save();await assert.rejects(exemplarTransferContext('biology-sample',f.root),/instructional review/);await f.accepted();const binding=sampleBinding(f.record);f.record.sample!.instructionalReview=await f.file('bad.json',JSON.stringify({kind:'instructional',binding,reviewer:'reviewer',unresolved:['jump'],checks:{}}));await f.save();await assert.rejects(exemplarTransferContext('biology-sample',f.root),/unresolved/);}finally {await f.cleanup();}});
test('plans and exemplar decisions invalidate sample acceptance; duplicate activity purposes fail',async()=>{const f=await fixture();try {await f.accepted();f.record.decisions[0].decision='Different judgment';await f.save();await assert.rejects(exemplarTransferContext('biology-sample',f.root),/Dean must accept/);f.record.plans[0].activities.push({...f.record.plans[0].activities[0],id:'duplicate'});await f.save();await assert.rejects(exemplarTransferContext('biology-sample',f.root,'sample'),/plan required/);}finally {await f.cleanup();}});
test('evidence path traversal and symlink escapes fail closed',async()=>{const f=await fixture();try {await f.save();f.record.strategy.path='../outside';await f.save();await assert.rejects(exemplarTransferContext('biology-sample',f.root,'sample'),/relative/);await symlink('/etc/hosts',path.join(f.root,'escape'));f.record.strategy.path='escape';await f.save();await assert.rejects(exemplarTransferContext('biology-sample',f.root,'sample'),/escapes/);}finally {await f.cleanup();}});
// This real entry point must gate BEFORE source lookup or output writing.
test('prompt-pack generation invokes gate and rejects invalid slugs before writes',async()=>{await assert.rejects(generatePromptPack('../outside',{mode:'off'} as never),/Invalid project/);});

test('real authoring context stops adopted continuation while doctor and ordinary standards inspection remain unaffected',async()=>{
 const f=await fixture();try {
 await f.save();const project='biology-sample';const workspace=path.join(f.root,'projects',project,'workspace');await mkdir(workspace,{recursive:true});const entry=path.join(workspace,'index.html');await writeFile(entry,'<main>synthetic</main>');
 await writeFile(path.join(f.root,'projects',project,'meta/project.json'),JSON.stringify({id:project,slug:project,sourcePath:path.join(f.root,'source.html'),inputKind:'html',brightspaceTarget:'course-page',previewModes:['workspace'],workspaceEntrypoint:entry,rawEntrypoint:path.join(f.root,'projects',project,'raw/original.html'),learningSource:'other',learningTrust:'auto',learningUpdatedAt:'2026-10-04',createdAt:'2026-10-04',updatedAt:'2026-10-04',migrationState:'migrated',projectType:'generated-course',preferredWorkflows:['generated-course'],canonicalEntry:entry,canonicalSources:[entry],authoringStatus:'active',exportTargets:[{target:'scorm',enabled:true}]}));
 assert.equal((await inspectCourseAuthoringProject(project,f.root)).status,'pass');
 const denied=await buildProjectAuthoringContext(project,f.root);assert.equal(denied.text,null);assert.match(denied.report.issues.map(i=>i.message).join(' '),/continuation/);
 assert.match((await buildProjectAuthoringContext(project,f.root,'sample')).text!,/lesson-02/);
 assert.equal((await inspectPinnedStandard(project,'<main>unchanged</main>',f.root)).status,'unadopted');
 }finally {await f.cleanup();}
});


test('substantive factory generation rejects pending adopted continuation before recipe reads or learner writes',async()=>{const f=await fixture();try{await f.save();await assert.rejects(buildEnglishFactoryProject({repoRoot:f.root,projectSlug:'biology-sample'}),/pending representative sample acceptance/);await assert.rejects(readFile(path.join(f.root,'projects/biology-sample/workspace/index.html')),/ENOENT/);}finally{await rm(f.root,{recursive:true,force:true});}});


test('text-only or unrelated save evidence cannot satisfy every sample activity interaction',async()=>{const f=await fixture();try{await f.accepted();const binding=sampleBinding(f.record);delete f.record.sample!.interactionReview;await f.save();await assert.rejects(exemplarTransferContext('biology-sample',f.root),/activity interaction review required/);await f.accepted();f.record.sample!.interactionReview=await f.file('wrong-interaction.json',JSON.stringify({kind:'activity-interaction',binding,reviewer:'checker',unresolved:[],activities:[{id:'unrelated-required-check',checks:Object.fromEntries(activityInteractionChecks.map(c=>[c,'unrelated native smoke test'])),evidence:f.record.sample!.files}]}));await assert.rejects(validateActivityInteractions(f.record,f.root,binding),/fresh/);f.record.sample!.interactionReview=await f.file('text-only.json',JSON.stringify({kind:'activity-interaction',binding,reviewer:'checker',unresolved:[],activities:[{id:'fresh',checks:{stimulus:'Paragraph present',feedback:'Model opens'},evidence:f.record.sample!.files}]}));await assert.rejects(validateActivityInteractions(f.record,f.root,binding),/End-to-end/);}finally{await f.cleanup();}});
