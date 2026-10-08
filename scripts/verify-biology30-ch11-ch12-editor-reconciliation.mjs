import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';

const root=path.resolve('projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/ch11-ch12-handoff-v1.0.1');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const map=JSON.parse(read('EDITOR_RECONCILIATION.json'));
const normalize=s=>s.replace(/\s+/g,' ').trim();
const results=[];
for(const chapter of [11,12]){
 const old=read(`evaluation/ch${chapter}-old/index.html`),candidate=read(`evaluation/ch${chapter}-new/index.html`);
 const a=cheerio.load(old),b=cheerio.load(candidate),keys=new Map();
 b('[data-canvas-helper-edit-key]').each((_,e)=>{const key=b(e).attr('data-canvas-helper-edit-key');assert(!keys.has(key),`Duplicate ${key}`);keys.set(key,e);});
 assert.equal(hash(old),map.chapters[chapter].sourceSha256);
 assert.equal(hash(candidate),map.chapters[chapter].candidateSha256);
 const records=map.records.filter(r=>r.chapter===chapter),recordKeys=new Set(records.map(r=>r.key));
 assert.equal(recordKeys.size,records.length);
 for(const r of records){
  assert.equal(hash(r.originalHtml),r.originalSha256);
  assert.equal(a(`[data-canvas-helper-edit-key="${r.key}"]`).length,1);
  assert.equal(a.html(a(`[data-canvas-helper-edit-key="${r.key}"]`)),r.originalHtml);
  assert.equal(r.autoRedirect,false);assert.equal(r.canonicalMigrationApplied,false);
  if(r.status.startsWith('retained')){
   const e=keys.get(r.key);assert(e,`Missing retained ${r.key}`);
   assert.equal(e.tagName,r.tag);
   if(r.relationship==='same-content')assert.equal(normalize(b(e).text()),normalize(r.originalText));
   else {assert(['section','div'].includes(r.tag));const previous=a(`[data-canvas-helper-edit-key="${r.key}"]`);assert(previous.attr('id'));assert.equal(b(e).attr('id'),previous.attr('id'));assert.equal(r.relationship,'same named section, not unchanged prose');}
  }else{assert(r.status.startsWith('superseded'));assert(!keys.has(r.key),`Superseded key still live ${r.key}`);assert.equal(r.relationship,'interval replacement, not one-to-one');}
  for(const successor of r.successorKeys)assert(keys.has(successor),`Absent successor ${successor}`);
 }
 a('[data-canvas-helper-edit-key]').each((_,e)=>{const key=a(e).attr('data-canvas-helper-edit-key');if(!keys.has(key))assert(recordKeys.has(key),`Unaccounted source key ${key}`);});
 // Editor metadata must not change native response, grading or save identifiers.
 for(const attribute of ['data-required-check','data-check-id','data-question','data-writing','data-note-input','data-guided-item','data-transfer','data-activity']){
  const values=$=>$(`[${attribute}]`).map((_,e)=>$(e).attr(attribute)).get();
  const current=values(b);for(const value of values(a))assert(current.includes(value),`Missing native ${attribute}=${value}`);
 }
 for(const e of a('figure,[data-video],link[rel="stylesheet"]').toArray())assert(candidate.includes(a.html(e)),`Original media/style changed CH${chapter}`);
 for(const e of b('img[src],script[src],link[href]').toArray()){
  const value=b(e).attr('src')||b(e).attr('href');if(/^(data:|https?:|\/\/|#)/.test(value))continue;
  assert(fs.existsSync(path.resolve(root,`evaluation/ch${chapter}-new`,value.split(/[?#]/)[0])),`Missing asset ${value}`);
 }
 results.push({chapter,sourceKeys:a('[data-canvas-helper-edit-key]').length,candidateKeys:keys.size,reconciledRecords:records.length,retained:records.filter(r=>r.status.startsWith('retained')).length,superseded:records.filter(r=>r.status.startsWith('superseded')).length,status:'passed'});
}
console.log(JSON.stringify({scope:'Editor reconciliation and static native-contract preservation, not Studio/LMS certification',results},null,2));
