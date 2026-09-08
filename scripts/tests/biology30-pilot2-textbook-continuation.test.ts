import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderTopicTextbookQuestion} from '../lib/biology30-course/v1/pilot2-render-textbook.js';

test('actual C/D absent continuation pages render no phantom link; real pages retain their exact link',async()=>{
 for(const unit of ['c','d']){
  const base=`projects/resources/biology30-production/v1/units/unit-${unit}`;
  const [guides,contract,state]=await Promise.all(['textbook-guides','contract','state-schema'].map(async n=>JSON.parse(await readFile(`${base}/pilot2-${n}.json`,'utf8'))));
  for(const item of guides.groups.flatMap((g:any)=>g.items)){
   const html=renderTopicTextbookQuestion(item,contract,state);
   if(item.continuationPhysicalPage==null)assert.ok(!html.includes('Open continuation'));
   else assert.ok(html.includes(`#page=${item.continuationPhysicalPage}"`));
  }
  const item=guides.groups[0].items[0];
  for(const page of [0,-1,1.5,'38'])assert.throws(()=>renderTopicTextbookQuestion({...item,continuationPhysicalPage:page},contract,state),/Invalid continuation/);
 }
});
