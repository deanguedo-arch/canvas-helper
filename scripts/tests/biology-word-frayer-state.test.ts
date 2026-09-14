import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseWord,removeWordFrayer,packWordFrayers,unpackWordFrayers,type WordFrayerSchema,type WordFrayerState} from '../lib/biology30-vocabulary/word-frayer-state.js';
const schema:WordFrayerSchema={identity:'a'.repeat(64),wordIds:Array.from({length:249},(_,i)=>'word-'+i),legacyIds:['old-category'],limit:240};
test('any eight words, no compulsory anchors, duplicate choices do not consume slots',()=>{
 let slots:WordFrayerState=[];for(const id of schema.wordIds.slice(100,108))slots=chooseWord(slots,schema,id);
 assert.equal(slots.length,8);assert.equal(chooseWord(slots,schema,'word-100'),slots);assert.throws(()=>chooseWord(slots,schema,'word-1'),/eight slots/);
 slots=removeWordFrayer(slots,schema,'word','word-100',false);slots=chooseWord(slots,schema,'word-248');assert.equal(slots.at(-1)!.id,'word-248');
});
test('written removal requires confirmation and leaves unrelated work unchanged',()=>{
 let slots=chooseWord([],schema,'word-1');slots[0].answers=['My meaning','Mechanism','Example','Non-example'];slots[0].collected=true;slots=chooseWord(slots,schema,'word-2');const untouched=structuredClone(slots[1]);
 assert.throws(()=>removeWordFrayer(slots,schema,'word','word-1',false),/confirm/);assert.equal(slots[0].answers[0],'My meaning');
 const next=removeWordFrayer(slots,schema,'word','word-1',true);assert.deepEqual(next,[untouched]);
});
test('word map identity prevents silent reassignment; Unicode round trips without truncation',()=>{
 for(const char of ['x','漢','😀','\\']){let slots:WordFrayerState=[];for(const id of schema.wordIds.slice(-8))slots=chooseWord(slots,schema,id);for(const s of slots)s.answers.fill(char.repeat(Math.floor(240/char.length)));assert.deepEqual(unpackWordFrayers(packWordFrayers(slots,schema),schema),slots);}
 const packed=packWordFrayers(chooseWord([],schema,'word-248'),schema);assert.throws(()=>unpackWordFrayers(packed,{...schema,identity:'b'.repeat(64)}),/map changed/);
 const oversized=chooseWord([],schema,'word-1');oversized[0].answers[0]='x'.repeat(241);assert.throws(()=>packWordFrayers(oversized,schema),/not truncated/);assert.equal(oversized[0].answers[0].length,241);
});
