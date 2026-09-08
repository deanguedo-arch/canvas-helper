import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {inspectTopicOwnerCode} from '../lib/biology30-course/v1/pilot2-owner-closure.js';
import {assertTopicInputClosure,TOPIC_BASELINE,verifyTopicProtectedBaseline,preflightTopicBuild} from '../lib/biology30-course/v1/pilot2-preflight.js';
import {inspectTopicInputs} from '../lib/biology30-course/v1/pilot2-inputs.js';
import {topicProjectE2EContract} from '../lib/biology30-course/v1/pilot2-build.js';
import {validateProjectContract} from '../../e2e/lib/project-contract-schema.js';
const root=process.cwd(),hash=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
test('production closure follows the connected owner, browser and cold source verifier without writing',async()=>{
 const owner=await inspectTopicOwnerCode(root);assert.equal(owner.writesPerformed,false);
 for(const suffix of ['pilot2-build.ts','pilot2-inputs.ts','pilot2-render-course.ts','pilot2-preflight.ts','pilot2-media-controls.ts','prepare-biology30-course-resources.py','app/shared/course-editability.ts','package-lock.json'])assert.ok(owner.files.some(file=>file.file.endsWith(suffix)),suffix);
 assert.equal(new Set(owner.files.map(file=>file.file)).size,owner.files.length);
 for(const file of owner.files)assert.equal(hash(await readFile(path.join(root,file.file))),file.sha256,file.file);
});
test('input closure refuses uncovered academic inputs, assets and changed external branding',()=>{
 const academic='projects/resources/biology30-production/v1/pilot2/example.json',brand='projects/resources/biology30-unit-a-pilot/v2/assets/brand/logo.png',sha='1'.repeat(64);
 assertTopicInputClosure('B',[{file:academic,sha256:sha},{file:brand,sha256:sha}],{[academic]:sha},[{file:brand,sha256:sha}]);
 assert.throws(()=>assertTopicInputClosure('B',[{file:academic,sha256:sha}],{},[]),/missing or changed/);
 assert.throws(()=>assertTopicInputClosure('B',[{file:brand,sha256:'2'.repeat(64)}],{},[{file:brand,sha256:sha}]),/missing or changed/);
});
test('protected A baseline is exact and frozen contracts pass cold production preflight',async()=>{
 const sha=hash(await readFile(path.join(root,TOPIC_BASELINE)));
 assert.equal((await verifyTopicProtectedBaseline(root,sha)).protectedTrees,4);
 await assert.rejects(verifyTopicProtectedBaseline(root,'0'.repeat(64)),/baseline changed/);
 for(const unit of ['B','C','D'] as const)assert.equal((await preflightTopicBuild(root,unit)).protectedBaseline.protectedTrees,4);
});
test('generated project checks target actual Pilot 2 routes and collection controls',async()=>{
 for(const unit of ['B','C','D'] as const){
  const input=await inspectTopicInputs(root,unit),raw=topicProjectE2EContract(`biology30-unit-${unit.toLowerCase()}`,input);
  const contract=validateProjectContract(raw,'synthetic generated metadata',{requireDeepTargets:true});
  assert.ok(contract.learnerCourse?.enabled);assert.equal(contract.learnerCourse.routes.length,input.topic.state.routes.length);
  assert.ok(contract.learnerCourse.routes.includes('overview'));assert.ok(!contract.learnerCourse.routes.includes(`${unit.toLowerCase()}-overview`));
  const changed=structuredClone(raw);changed.learnerCourse.evidenceScenario.collectionRoute='missing-route';assert.throws(()=>validateProjectContract(changed,'wrong collection route'),/missing from/);
 }
});
