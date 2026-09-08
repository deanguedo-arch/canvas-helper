import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectTopicInputs,readFrozenTopicInputs} from '../lib/biology30-course/v1/pilot2-inputs.js';
import {bundleTopicBrowser} from '../lib/biology30-course/v1/pilot2-browser-bundle.js';
import {validateBiology30TopicContract} from '../lib/biology30-course/v1/pilot2-contract.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
test('owner assembles the full academic inventory without rendering a draft learner course',async()=>{
 const results=await Promise.all((['B','C','D'] as const).map(unit=>inspectTopicInputs(root,unit)));
 assert.deepEqual(results.map(input=>input.index.length),[243,396,186]);
 assert.deepEqual(results.map(input=>input.topic.graphs.reduce((sum,work)=>sum+work.graphs.length,0)),[4,1,2]);
 assert.deepEqual(results.map(input=>input.materials.length),[2,5,0]);
 for(const input of results){
  assert.equal(input.rendered,false);assert.deepEqual(input.videos,[]);assert.equal(input.figureStatus,'complete-author-review');assert.equal(input.pendingFigures.length,0);assert.ok(input.files.some(file=>file.file.endsWith('/pilot2-link-dispositions.json')));assert.equal('html' in input,false);assert.equal(input.topic.contract.teacherAcceptance,null);
  assert.equal(input.topic.figures.length+input.pendingFigures.length,input.topic.contract.topics.flatMap(topic=>topic.parts).length);
  assert.equal(new Set(input.files.map(file=>file.file)).size,input.files.length);
  assert.equal(new Set(input.copies.map(file=>file.destination)).size,input.copies.length);
  assert.ok(input.copies.every(copy=>copy.destination.startsWith('assets/')));
  for(const copy of input.copies)assert.ok(input.files.some(file=>file.file===copy.sourcePath&&file.sha256===copy.sha256));
  assert.ok(input.files.some(file=>file.file.endsWith('/pilot2-legacy-schema.json')));
  assert.ok(input.files.some(file=>file.file.endsWith('/pilot2-state-schema.json')));
 }
 const c=results[1];assert.equal(new Set(c.materials.map(item=>item.figure.src)).size,5);
 assert.equal(c.topic.figures.find(figure=>figure.panels)?.panels?.length,5);
 assert.ok(results[2].topic.graphs.some(work=>work.responseId.startsWith('d-investigation-')));
});
test('production inputs use all-unit frozen contracts and still reject a draft or pending review',async()=>{
 for(const unit of ['B','C','D'] as const){
  const input=await readFrozenTopicInputs(root,unit);
  assert.equal(input.topic.contract.status,'frozen');
  const draft=structuredClone(input.topic.contract);draft.status='draft';
  assert.throws(()=>validateBiology30TopicContract(draft,true),/frozen|freeze/i);
  const pending=structuredClone(input.topic.contract);pending.reviewGates.figuresAndRights.status='pending';
  assert.throws(()=>validateBiology30TopicContract(pending,true),/incomplete: figuresAndRights/);
 }
});
test('actual browser bundle is self-contained and captures precisely the source bytes compiled',async()=>{
 const bundle=await bundleTopicBrowser(root);
 assert.equal(bundle.destination,'assets/pilot2-course.js');assert.equal(bundle.writesPerformed,false);
 assert.equal(bundle.sha256,createHash('sha256').update(bundle.bytes).digest('hex'));
 assert.ok(bundle.files.some(file=>file.file.endsWith('/pilot2-browser-entry.ts')));
 assert.ok(bundle.files.some(file=>file.file.endsWith('/pilot2-session.ts')));
 assert.ok(bundle.files.some(file=>file.file.endsWith('/pilot2-figure-viewer.ts')));
 assert.ok(!bundle.files.some(file=>file.file.endsWith('/pilot2-inputs.ts')||file.file.endsWith('/pilot2-render-course.ts')));
 assert.ok(bundle.bytes.length>1000);
 for(const file of bundle.files)assert.equal(createHash('sha256').update(await readFile(path.join(root,file.file))).digest('hex'),file.sha256);
});
