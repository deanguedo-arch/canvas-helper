import test from 'node:test';
import assert from 'node:assert/strict';
import {mapBiology20Topics} from '../lib/biology20-course/topic-map.js';
test('respiration continuation shares one topic and keeps two pacing days',()=>{
 const result=mapBiology20Topics('c',[5],[{name:'Chapter 5 Daily Plans.docx',sha256:'fixture',rows:[{cells:['Day','Topic','Activities']},{cells:['29','Cellular Respiration Part 1','Go through slides 30–40']},{cells:['30','Cellular Respiration Part 2','Continue slides 30–40']}]}],Array.from({length:11},(_,i)=>({number:i+30,paragraphs:['Test']})));
 assert.equal(result.topics.length,1);assert.equal(result.topics[0].calendarDays,2);assert.equal(result.topics[0].planRows.length,2);assert.equal(result.topics[0].slideNumbers.length,11);assert.deepEqual(result.topics[0].outcomeIds,[]);
});
test('unexplained source overlaps fail rather than silently deduplicating',()=>{
 assert.throws(()=>mapBiology20Topics('a',[1],[{name:'Chapter 1 Daily Plans.docx',sha256:'fixture',rows:[{cells:['Day','Topic','Activities']},{cells:['1','One','slides 1–2']},{cells:['2','Two','slides 2–3']}]}],[1,2,3].map(number=>({number,paragraphs:['Test']}))),/duplicate slide ownership/);
});
