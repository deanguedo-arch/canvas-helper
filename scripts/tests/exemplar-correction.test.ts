import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {captureStandardsCheckpoint,decideStandardsCandidate,resolveStandard,standardsContext} from '../lib/course-standards.ts';
test('correction capture keeps notes local; explicit exact scoped promotion updates generation and review together',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'transfer-correction-'));
 try {
 await mkdir(path.join(root,'projects/biology-sample/meta'),{recursive:true});await mkdir(path.join(root,'config/course-standards'),{recursive:true});
 await writeFile(path.join(root,'config/course-standards/v1.json'),JSON.stringify({schemaVersion:1,id:'v1',version:1,parent:null,rules:{targetGrade:10,maxParagraphWords:120},blueprint:['context','explanation','worked','guided','independent-check'],requirements:[]}));
 await writeFile(path.join(root,'config/course-standards/promotion-queue.json'),JSON.stringify({schemaVersion:1,revision:0,candidates:[],releases:[],bindings:{}}));
 async function file(name:string,kind:string){const text=JSON.stringify({schemaVersion:1,correctionId:'purpose-before-prose',kind,instructions:[kind==='generation'?'Plan each activity by its unique teaching purpose.':'Compare adjacent activities for duplicated inference.']});await writeFile(path.join(root,name),text);return {path:name,sha256:createHash('sha256').update(text).digest('hex')};}
 const correction={schemaVersion:1,id:'purpose-before-prose',scope:'reusable',status:'proposed',teacherCorrection:'PRIVATE TEACHER NOTE TEST ONLY',generation:await file('generation.json','generation'),review:await file('review.json','review')};
 const correctionPath=path.join(root,'projects/biology-sample/meta/exemplar-correction.json');await writeFile(correctionPath,JSON.stringify(correction));
 let queue=await captureStandardsCheckpoint('biology-sample','review','synthetic-correction',root);
 assert.equal(queue.releases.length,0);assert.equal(JSON.stringify(queue).includes(correction.teacherCorrection),false);
 assert.equal((await resolveStandard(root,'biology-sample')).transferStrategy,undefined);
 await assert.rejects(decideStandardsCandidate({id:queue.candidates[0].id,revision:queue.revision,decision:'family',transferSignature:'wrong'},root),/signature/);
 queue=await decideStandardsCandidate({id:queue.candidates[0].id,revision:queue.revision,decision:'family',transferSignature:queue.candidates[0].transferProposal!.signature},root);
 assert.equal(queue.releases.length,1);assert.match(await standardsContext(root,'biology-sample'),/Plan each activity.*Compare adjacent/);assert.equal((await resolveStandard(root,'english-sample','english')).transferStrategy,undefined);
 await writeFile(path.join(root,'review.json'),'changed');await assert.rejects(standardsContext(root,'biology-sample'),/evidence changed/);
 correction.scope='lesson-specific';await writeFile(correctionPath,JSON.stringify(correction));const local=await captureStandardsCheckpoint('biology-sample','review','local-correction',root);assert.equal(local.candidates.at(-1)!.transferProposal,undefined);
 }finally{await rm(root,{recursive:true,force:true});}
});
