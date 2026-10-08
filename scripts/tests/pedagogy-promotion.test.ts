import assert from "node:assert/strict";
import { mkdtemp,mkdir,readFile,writeFile,rm,copyFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { load } from "cheerio";
import { repoRoot } from "../lib/paths.ts";
import { captureStandardsCheckpoint,decideStandardsCandidate,resolveStandard,readStandardsQueue,inspectPinnedStandard } from "../lib/course-standards.ts";
import { checkStandardLesson,checkStandardHtml,renderStandardLesson,starterLesson } from "../lib/standard-lesson.ts";
import { createCodexStudioCourse } from "../lib/codex-course.ts";
import { handleCourseStandardsRoute } from "../../app/server/routes/course-standards.ts";
import { biologyLesson,modeledBiologyLesson } from "./fixtures/standards-biology.ts";

async function fixture(){
 const root=await mkdtemp(path.join(os.tmpdir(),'canvas-pedagogy-'));
 await mkdir(path.join(root,'config/course-standards'),{recursive:true});
 await copyFile(path.join(repoRoot,'config/course-standards/v1.json'),path.join(root,'config/course-standards/v1.json'));
 await writeFile(path.join(root,'package.json'),JSON.stringify({scripts:{'course:doctor':'node -e "process.exit(0)" --',verify:'node -e "process.exit(0)" --'}}));
 const existing=await createCodexStudioCourse({repoRoot:root,slug:'biology-existing',title:'Biology feedback',courseCode:'Biology 30',summary:'Synthetic preserved v1 course.',lesson:biologyLesson});
 return {root,existing,cleanup:()=>rm(root,{recursive:true,force:true})};
}
const approval=(q:Awaited<ReturnType<typeof readStandardsQueue>>,decision:'universal'|'family'|'course-specific')=>({id:q.candidates[0].id,revision:q.revision,decision,rule:'modeledReasoningBeforeGuided' as const,value:true as const,proposalSignature:q.candidates[0].teachingProposal!.signature});

test('real HTTP capture → explicit family approval → fresh lesson inheritance preserves existing pinned version',async()=>{
 const {root,existing,cleanup}=await fixture();
 const originalHtml=await readFile(existing.workspaceEntry,'utf8');const originalPin=await readFile(path.join(existing.projectRoot,'meta/course-standard.json'),'utf8');
 const server=createServer((request,response)=>void handleCourseStandardsRoute(request.url!,request,response,root));
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
 const post=(route:string,body:unknown)=>fetch(origin+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try{
  const capture=await post('/api/course-standards/capture',{project:'biology-existing',identity:'synthetic-reviewed-worked-example'});assert.equal(capture.status,200);
  let q=await capture.json();const proposal=q.candidates[0].teachingProposal;assert.ok(proposal);assert.equal(proposal.rule,'modeledReasoningBeforeGuided');assert.match(proposal.evidence.observed,/no explicit action-and-why/);assert.ok(proposal.evidence.sourceFingerprint);assert.equal(proposal.example.after.length,2);assert.equal(JSON.stringify(q).includes('Suppose glucose rises after lunch'),false);
  const again=await post('/api/course-standards/capture',{project:'biology-existing',identity:'synthetic-reviewed-worked-example'});assert.equal((await again.json()).candidates.length,1);
  const pending=await resolveStandard(root,'new-biology','biology');assert.equal(pending.id,'outreach-v1');
  const invalid=await post('/api/course-standards/decide',{...approval(q,'family'),value:false});assert.equal(invalid.status,400);
  const unsigned=await post('/api/course-standards/decide',{...approval(q,'family'),proposalSignature:'wrong'});assert.equal(unsigned.status,400);
  const approved=await post('/api/course-standards/decide',approval(q,'family'));assert.equal(approved.status,200);q=await approved.json();
  const standard=await resolveStandard(root,'new-biology','biology');assert.equal(standard.id,'outreach-v2');assert.equal(standard.parent,'outreach-v1');assert.equal(standard.rules.modeledReasoningBeforeGuided,true);assert.equal(standard.blueprintVersion,'outreach-modeled-reasoning-v2');assert.deepEqual(standard.blueprint,['context','explanation','worked','modeled-reasoning','guided','independent-check']);assert.deepEqual((standard.provenance as any).teachingProposal,proposal);
  assert.equal((await resolveStandard(root,'new-english','english')).id,'outreach-v1');
  assert.ok(checkStandardLesson(biologyLesson,standard).some(e=>e.includes('modeled-reasoning')));assert.deepEqual(checkStandardLesson(modeledBiologyLesson,standard),[]);
  const draft=starterLesson('New inherited lesson',standard);assert.equal(draft.sections['modeled-reasoning'].reasoningSteps?.length,2);
  const fresh=await createCodexStudioCourse({repoRoot:root,slug:'biology-fresh',title:'Fresh Biology reasoning',courseCode:'Biology 30',summary:'Synthetic pedagogical inheritance.',lesson:modeledBiologyLesson});
  const html=await readFile(fresh.workspaceEntry,'utf8');assert.deepEqual(checkStandardHtml(html,standard),[]);
  const $=load(html);assert.deepEqual($('.standard-lesson [data-lesson-stage]').map((_,el)=>$(el).attr('data-lesson-stage')).get(),standard.blueprint);assert.equal($('[data-modeled-reasoning] > li').length,2);
  $('[data-lesson-stage="modeled-reasoning"]').insertAfter('[data-lesson-stage="guided"]');assert.ok(checkStandardHtml($.html(),standard).some(e=>e.includes('before guided')));
  const missingWhy=html.replace('data-reasoning-why','missing-why');assert.ok(checkStandardHtml(missingWhy,standard).some(e=>e.includes('action-and-why')));
  const broken=structuredClone(modeledBiologyLesson);broken.sections['modeled-reasoning'].reasoningSteps![0].why='';assert.throws(()=>renderStandardLesson(broken,standard),/action-and-why/);
  assert.equal(await readFile(existing.workspaceEntry,'utf8'),originalHtml);assert.equal(await readFile(path.join(existing.projectRoot,'meta/course-standard.json'),'utf8'),originalPin);assert.equal((await inspectPinnedStandard('biology-existing',originalHtml,root)).status,'pass');
  assert.equal((await inspectPinnedStandard('biology-fresh',html,root)).status,'pass');
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));await cleanup();}
});

test('typed teaching approval rejects stale source, altered proposal and conflicting blueprint without releases',async()=>{
 const {root,existing,cleanup}=await fixture();try{
 let q=await captureStandardsCheckpoint('biology-existing','review','synthetic-evidence',root);
 const html=await readFile(existing.workspaceEntry,'utf8');await writeFile(existing.workspaceEntry,html+'<!-- concurrent curriculum edit -->');await assert.rejects(decideStandardsCandidate(approval(q,'universal'),root),/source changed/);await writeFile(existing.workspaceEntry,html);
 const queuePath=path.join(root,'config/course-standards/promotion-queue.json');const original=await readFile(queuePath,'utf8');const changed=JSON.parse(original);changed.candidates[0].teachingProposal.rationale='altered proposal';await writeFile(queuePath,JSON.stringify(changed));await assert.rejects(decideStandardsCandidate(approval(q,'universal'),root),/evidence changed/);await writeFile(queuePath,original);
 const seedPath=path.join(root,'config/course-standards/v1.json');const seed=await readFile(seedPath,'utf8');const bad=JSON.parse(seed);bad.blueprint=['context','explanation','guided','worked','independent-check'];await writeFile(seedPath,JSON.stringify(bad));await assert.rejects(decideStandardsCandidate(approval(q,'universal'),root),/blueprint changed/);await writeFile(seedPath,seed);
 const conflicting=JSON.parse(seed);conflicting.rules.modeledReasoningBeforeGuided=true;await writeFile(seedPath,JSON.stringify(conflicting));await assert.rejects(decideStandardsCandidate({...approval(q,'universal'),rule:'maxParagraphWords',value:100},root),/Conflicting modeled-reasoning blueprint/);await writeFile(seedPath,seed);
 await assert.rejects(decideStandardsCandidate({...approval(q,'universal'),value:false as any},root),/Exact evidence-backed/);
 assert.equal((await readStandardsQueue(root)).releases.length,0);
 q=await decideStandardsCandidate({...approval(q,'universal'),decision:'defer'},root);assert.equal(q.releases.length,0);assert.equal((await resolveStandard(root)).id,'outreach-v1');q=await decideStandardsCandidate({...approval(q,'universal'),revision:q.revision,decision:'skip'},root);assert.equal(q.releases.length,0);
 assert.equal(await readFile(existing.workspaceEntry,'utf8'),html);
 }finally{await cleanup();}
});

test('universal and course-specific pedagogy scopes retain explicit lineage and do not auto-adopt pinned courses',async()=>{
 for(const decision of ['universal','course-specific'] as const){const {root,existing,cleanup}=await fixture();try{const q=await captureStandardsCheckpoint('biology-existing','export','synthetic-export-checkpoint',root);await decideStandardsCandidate(approval(q,decision),root);assert.equal((await resolveStandard(root,'biology-existing','biology')).rules.modeledReasoningBeforeGuided,true);assert.equal((await resolveStandard(root,'another-course','english')).rules.modeledReasoningBeforeGuided,decision==='universal'?true:undefined);const pin=JSON.parse(await readFile(path.join(existing.projectRoot,'meta/course-standard.json'),'utf8'));assert.equal(pin.id,'outreach-v1');assert.equal(pin.rules.modeledReasoningBeforeGuided,undefined);}finally{await cleanup();}}
});
