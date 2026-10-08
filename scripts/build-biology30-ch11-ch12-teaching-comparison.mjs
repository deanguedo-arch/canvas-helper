import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as parse5 from 'parse5';
import * as cheerio from 'cheerio';

const intake=path.resolve(process.argv[2]||'/tmp/bio30-ch11-ch12-handoff.HCUsMN');
const root=path.resolve('projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/ch11-ch12-handoff-v1.0.1');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(path.join(intake,p),'utf8');
const json=p=>JSON.parse(read(p));
const assert=(v,m)=>{if(!v)throw Error(m);};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const nodes=(s,predicate)=>{const out=[];function walk(n){if(predicate(n))out.push(n);for(const c of n.childNodes||[])walk(c);}walk(parse5.parseFragment(s,{sourceCodeLocationInfo:true}));return out;};
const raw=(s,n)=>s.slice(n.sourceCodeLocation.startOffset,n.sourceCodeLocation.endOffset);
const edits=(s,list)=>{for(const e of list.sort((a,b)=>b.start-a.start||b.end-a.end))s=s.slice(0,e.start)+e.text+s.slice(e.end);return s;};
const report={version:'1.0.1',scope:'Isolated review candidates only',manifestFiles:0,chapters:{},editorPlacements:[],assetCopies:[],pendingAssessmentDecisions:'Not applied',teacherAcceptance:false};
let vocabularyTemplates=new Map();
for(const f of json('MANIFEST.json').files){const b=fs.readFileSync(path.join(intake,f.path));assert(b.length===f.bytes&&sha(b)===f.sha256,'Intake mismatch '+f.path);report.manifestFiles++;}
for(const line of read('CHECKSUMS.sha256').trim().split('\n')){const m=line.match(/^([a-f0-9]{64})\s+\*?(.+)$/);assert(m&&sha(fs.readFileSync(path.join(intake,m[2])))===m[1],'Checksum mismatch '+line);}
fs.mkdirSync(root,{recursive:true});
if(!fs.existsSync(path.join(root,'pro-return')))fs.cpSync(intake,path.join(root,'pro-return'),{recursive:true,errorOnExist:true,force:false});
const practice11=[...json('lessons-01-03/maps/PRACTICE_MAP.json'),...json('lessons-04-13/maps/PRACTICE_MAP.json')];
const practice12=json('chapter12/maps/PRACTICE_MAP.json');
function writing11(s){
 const changes=[];
 for(const n of nodes(s,n=>attr(n,'data-proposed-activity')!==undefined)){
  const id=attr(n,'data-proposed-activity'),record=practice11.find(r=>(r.id||r.proposed_id)===id);assert(record,'Unknown task '+id);
  const block=raw(s,n),$=cheerio.load(block,null,false),host=$.root().children().first();
  const title=host.children('h3,h4').first().text();
  const help=host.children('details').map((_,e)=>$.html(e)).get().join('\n');
  host.children('h3,h4,label,textarea,button,details,.save-row').remove();
  const stimulus=host.html(),wid=record.proposed_response_id||record.writing_id,qid=record.question_id||id+'-question';
  const text=`<section class="activity" data-activity="${id}" data-activity-mode="writing" data-canvas-helper-edit-key="${id}">
<h2>${esc(title)}</h2><p class="muted">Optional writing practice. Select Start, write and save your response, then compare your reasoning. Select Submit and finish to collect this activity. It is not automatically graded and does not affect required progress.</p>
<div class="save-row"><button type="button" data-start>Start</button><output data-timer>Not started</output></div>
<fieldset data-run-body disabled><div class="question" data-question="${qid}">${stimulus}
<label for="${wid}">Your explanation</label><textarea id="${wid}" data-writing="${wid}" data-answer-limit="3200" rows="6" aria-describedby="${wid}-limit ${wid}-status"></textarea>
<p id="${wid}-limit" class="muted">Maximum 3200 characters. Writing is saved for review, not automatically graded.</p><div class="save-row"><button type="button" data-submit-writing>Save written response</button></div><p id="${wid}-status" data-writing-status role="status"></p>
</div></fieldset>${help}<div class="save-row"><button type="button" data-submit-run>Submit and finish</button><button type="button" data-reset-run hidden>Stop and reset</button><button type="button" data-redo hidden>Redo activity</button></div><p data-run-status role="status"></p></section>`;
  changes.push({start:n.sourceCodeLocation.startOffset,end:n.sourceCodeLocation.endOffset,text});
 }
 return edits(s,changes);
}
function writing12(s){
 const changes=[];
 for(const n of nodes(s,n=>attr(n,'data-proposed-note-id')!==undefined)){
  const id=attr(n,'data-proposed-note-id'),r=practice12.find(r=>r.id===id);assert(r,'Unknown note '+id);
  const d=n.childNodes.find(x=>x.tagName==='details');assert(d,'Missing disclosure '+id);
  changes.push({start:d.sourceCodeLocation.startOffset,end:d.sourceCodeLocation.startOffset,text:`<div class="optional-notes"><label for="${id}-written">Your explanation</label><textarea id="${id}-written" data-note-input="${id}" rows="6" aria-describedby="${id}-status"></textarea><p id="${id}-status" data-note-status="${id}" class="writing-status" role="status">Optional response. Select Save response to collect it. Maximum 5000 characters.</p><div class="save-row"><button type="button" data-save-note="${id}">Save response</button></div></div>\n`});
 }
 return edits(s,changes);
}
function bindings(before,after,chapter,route,ordinal){
 const oldKeyed=nodes(before,n=>attr(n,'data-canvas-helper-edit-key')!==undefined);
 // Preserve native vocabulary buttons on the same term, rather than turning them into glossary-only bold text.
 const old=nodes(before,n=>n.tagName==='button'&&(attr(n,'data-bio-term')!==undefined||attr(n,'data-term-id')!==undefined||attr(n,'data-word')!==undefined));
 for(const n of old){const html=raw(before,n),$=cheerio.load(html,null,false),term=$('button').text().trim(),key=attr(n,'data-canvas-helper-edit-key');
  if(key&&after.includes(`data-canvas-helper-edit-key="${key}"`))continue;
  const candidates=nodes(after,n=>n.tagName==='strong'&&cheerio.load(raw(after,n),null,false).text().trim().toLowerCase()===term.toLowerCase());
  if(candidates.length){const t=candidates[0];after=edits(after,[{start:t.sourceCodeLocation.startOffset,end:t.sourceCodeLocation.endOffset,text:html}]);}
 }
 // Exact same-tag/text matches are safe identities. Rewritten explanations are not.
 const textOf=html=>cheerio.load(html,null,false).text().replace(/\s+/g,' ').trim();
 for(const n of oldKeyed){
  const key=attr(n,'data-canvas-helper-edit-key');
  if(after.includes(`data-canvas-helper-edit-key="${key}"`))continue;
  if(!['h2','h3','h4','p','li','figcaption'].includes(n.tagName))continue;
  const text=textOf(raw(before,n));if(!text)continue;
  const matches=nodes(after,m=>m.tagName===n.tagName&&attr(m,'data-canvas-helper-edit-key')===undefined&&textOf(raw(after,m))===text);
  // Ambiguous repeated sentences retain new identities, not an arbitrary old binding.
  if(matches.length===1){const at=matches[0].sourceCodeLocation.startTag.endOffset-1;after=edits(after,[{start:at,end:at,text:` data-canvas-helper-edit-key="${key}"`}]);}
 }
 const vocabChanges=[];
 for(const n of nodes(after,n=>n.tagName==='strong')){
  const term=cheerio.load(raw(after,n),null,false).text().trim(),template=vocabularyTemplates.get(term.toLowerCase());
  if(!template)continue;
  let markup=template.replace(/\sdata-canvas-helper-edit-key="[^"]*"/g,'').replace(/>[^<>]*<\/button>$/,`>${esc(term)}</button>`);
  if(chapter===11){markup=markup.replace(/\sdata-bio-term-route="[^"]*"/g,'').replace('<button ',`<button data-bio-term-route="${route}" `);}
  vocabChanges.push({start:n.sourceCodeLocation.startOffset,end:n.sourceCodeLocation.endOffset,text:markup});
 }
 after=edits(after,vocabChanges);
 const changes=[];let i=0;
 for(const n of nodes(after,n=>['h2','h3','h4','p','li','figcaption'].includes(n.tagName)&&attr(n,'data-canvas-helper-edit-key')===undefined)){
  // Do not alter a preserved native figure or video subtree.
  let parent=n.parentNode,protectedParent=false;while(parent){if(attr(parent,'data-video')!==undefined||parent.tagName==='figure')protectedParent=true;parent=parent.parentNode;}if(protectedParent)continue;
  const at=n.sourceCodeLocation.startTag.endOffset-1;changes.push({start:at,end:at,text:` data-canvas-helper-edit-key="ch${chapter}-v101-${route}-${ordinal}-${++i}"`});
 }
 after=edits(after,changes);
 const replacementKeys=nodes(after,n=>attr(n,'data-canvas-helper-edit-key')!==undefined).map(n=>attr(n,'data-canvas-helper-edit-key'));
 for(const n of oldKeyed){
  const key=attr(n,'data-canvas-helper-edit-key'),survivor=nodes(after,m=>attr(m,'data-canvas-helper-edit-key')===key)[0];
  const html=raw(before,n),term=attr(n,'data-bio-term')||attr(n,'data-term-id')||attr(n,'data-word');
  report.editorPlacements.push({chapter,route,interval:ordinal,key,tag:n.tagName,originalText:textOf(html),originalHtml:html,originalSha256:sha(Buffer.from(html)),originalFragmentOffset:n.sourceCodeLocation.startOffset,
   status:survivor?'retained same-content identity':term?'superseded vocabulary occurrence; glossary identity unchanged':'superseded teaching content; frozen original recoverable',
   successorKeys:survivor?[key]:replacementKeys,relationship:survivor?'same-content':'interval replacement, not one-to-one',autoRedirect:false,canonicalMigrationApplied:false});
 }
 return after;
}
function copyAssets(s,group,dest){
 return s.replace(/\bsrc="([^"<>]+)"/g,(all,src)=>{
  if(src.startsWith('data:')||/^(https?:|\/\/)/.test(src))return all;
  const relative=src.startsWith('../assets/')?'assets/teaching-v101/'+path.basename(src):src;
  const source=path.join(intake,group,src.startsWith('../')?src.slice(3):src);
  const target=path.join(dest,relative);assert(fs.existsSync(source),'Missing supplied image '+source);
  fs.mkdirSync(path.dirname(target),{recursive:true});const b=fs.readFileSync(source);
  if(fs.existsSync(target))assert(sha(fs.readFileSync(target))===sha(b),'Existing figure drift '+relative);else fs.copyFileSync(source,target);
  report.assetCopies.push({source:path.relative(intake,source),destination:path.relative(root,target),sha256:sha(b)});
  return `src="${relative}"`;
 });
}
function assemble(chapter,slug){
 const owner=path.resolve('projects',slug,'workspace'),source=fs.readFileSync(path.join(owner,'index.html'));
 vocabularyTemplates=new Map();
 for(const n of nodes(source.toString(),n=>n.tagName==='button'&&(attr(n,'data-bio-term')!==undefined||attr(n,'data-term-id')!==undefined))){
  const html=raw(source.toString(),n),term=cheerio.load(html,null,false).text().trim().toLowerCase();
  if((attr(n,'class')||'').includes('bio-term'))vocabularyTemplates.set(term,html);
 }
 const maps=chapter===11?['lessons-01-03','lessons-04-13'].map(g=>({g,map:json(g+'/maps/INTEGRATION_MAP.json')})):[{g:'chapter12',map:json('chapter12/maps/INTEGRATION_MAP.json')}];
 const expected=chapter===11?maps[0].map.owner_sha256:maps[0].map[0].targetOwnerSha256;assert(sha(source)===expected,'Canonical source drift CH'+chapter);
 const dest=path.join(root,'evaluation','ch'+chapter+'-new'),old=path.join(root,'evaluation','ch'+chapter+'-old');
 // Retain the frozen copied assets between rebuilds; only the candidate HTML is regenerated.
 if(!fs.existsSync(path.join(dest,'index.html')))fs.cpSync(owner,dest,{recursive:true});
 if(!fs.existsSync(path.join(old,'index.html')))fs.cpSync(owner,old,{recursive:true});
 const patches=[];let routeCount=0;
 for(const {g,map} of maps)for(const r of chapter===11?map.lessons:map){
  const route=r.lesson||r.route;routeCount++;
  let roots;
  if(chapter===11){const text=read(g+'/fragments/'+route+'.teaching-fragment.html');roots=parse5.parseFragment(text,{sourceCodeLocationInfo:true}).childNodes.filter(n=>n.tagName==='section'&&attr(n,'data-teaching')!==undefined).map(n=>raw(text,n));}
  const intervals=chapter===11?r.sections||r.teaching_replacements:r.intervals;
  for(const [i,v] of intervals.entries()){
   const start=v.source_owner_byte_start??v.owner_byte_start??v.sourceStartUtf8Byte??v.sourceUtf8Byte;
   const end=v.source_owner_byte_end_exclusive??v.owner_byte_end??v.sourceEndUtf8Byte??start;
   const before=source.subarray(start,end),hash=v.before_sha256||v.sourceSha256;
   if(hash)assert(sha(before)===hash,'Boundary drift '+route+':'+i);
   if(v.precedingContextSha256)assert(sha(source.subarray(start-200,start))===v.precedingContextSha256&&sha(source.subarray(start,start+200))===v.followingContextSha256,'Anchor drift '+route+':'+i);
   let after=chapter===11?roots[(v.after_fragment_ordinal||v.proposed_fragment_ordinal)-1]:read(g+'/'+v.replacement);
   assert(sha(Buffer.from(after))===(v.after_sha256||v.proposed_after_sha256||v.replacementSha256),'Fragment hash '+route+':'+i);
   const supplied=after;
   after=chapter===11?writing11(after):writing12(after);
   after=bindings(before.toString(),after,chapter,route,i+1);
   after=copyAssets(after,g,dest);
   after=after.replace(/class="table-scroll"/g,'class="comparison-table"');
   const tableEdits=[];
   for(const table of nodes(after,n=>n.tagName==='table')){
    const parentClass=attr(table.parentNode,'class')||'';
    if(parentClass.includes('comparison-table')||before.toString().includes(raw(after,table)))continue;
    tableEdits.push({start:table.sourceCodeLocation.startOffset,end:table.sourceCodeLocation.endOffset,text:'<div class="comparison-table">'+raw(after,table)+'</div>'});
   }
   after=edits(after,tableEdits);
   const supplied$=cheerio.load(supplied,null,false),integrated$=cheerio.load(after,null,false),normal=s=>s.replace(/\s+/g,' ').trim().toLowerCase();
   const integratedText=normal(integrated$.root().text());
   for(const n of supplied$('p,li,h2,h3,h4,td,th,figcaption').toArray()){
    const content=normal(supplied$(n).text());if(content)assert(integratedText.includes(content),'Supplied learner copy omitted '+route+':'+i+' '+content.slice(0,80));
   }
   if(chapter===12&&v.kind==='insert_after_complete_saved_task')after=after.replace('<details>','<details data-supplementary-extension-model data-locked="true">');
   patches.push({start,end,after:Buffer.from(after),route,ordinal:i+1,beforeSha256:sha(before),suppliedSha256:sha(Buffer.from(supplied)),integratedSha256:sha(Buffer.from(after))});
  }
 }
 const ascending=[...patches].sort((a,b)=>a.start-b.start);let cursor=0,parts=[];
 for(const p of ascending){assert(p.start>=cursor,'Overlapping teaching intervals');parts.push(source.subarray(cursor,p.start),p.after);cursor=p.end;}parts.push(source.subarray(cursor));let result=Buffer.concat(parts).toString();
 if(chapter===11){
  const directions=[];
  for(let i=1;i<=3;i++){
   const key=`p3-l${String(i).padStart(2,'0')}-guide-04`,n=nodes(result,n=>attr(n,'data-canvas-helper-edit-key')===key)[0];assert(n,'Missing guide '+key);
   directions.push({start:n.sourceCodeLocation.startTag.endOffset,end:n.sourceCodeLocation.endTag.startOffset,text:'<strong>Complete the required chapter check.</strong> Open the check near the bottom and select Start. This check uses written responses. Answer in your own words and select Save written response for every response box.'});
  }
  const link=nodes(result,n=>n.tagName==='a'&&attr(n,'data-canvas-helper-edit-key')==='p3-chapter-29')[0];assert(link,'Missing Launch Lab locator');
  directions.push({start:link.sourceCodeLocation.startOffset,end:link.sourceCodeLocation.endOffset,text:raw(result,link).replace('data-book-page="12"','data-book-page="6"').replace('Textbook p. 371','Textbook p. 365')});
  result=edits(result,directions);report.directionCorrections={chapter:11,writingOnlyGuides:['lesson-01','lesson-02','lesson-03'],launchLab:{printed:365,pdfPage:6},source:'lessons-01-03/maps/INSTRUCTION_CORRECTIONS.md',assessmentsUnchanged:true};
 }
 if(chapter===12){const parsed=cheerio.load(result),original=JSON.parse(parsed('#course-data').text()),updated=structuredClone(original);for(const p of practice12){assert(!updated.notes.some(n=>n.id===p.id),'Duplicate note');updated.notes.push(p.proposedNativeBindings['C.notes']);}const node=nodes(result,n=>attr(n,'id')==='course-data')[0],loc=node.sourceCodeLocation;result=edits(result,[{start:loc.startTag.endOffset,end:loc.endTag.startOffset,text:JSON.stringify(updated).replaceAll('<','\\u003c')}]);result=result.replace('</body>','<script src="assets/teaching-v101/extension-model-lock.js"></script>\n</body>');fs.mkdirSync(path.join(dest,'assets/teaching-v101'),{recursive:true});fs.writeFileSync(path.join(dest,'assets/teaching-v101/extension-model-lock.js'),`(()=>{const native=document.querySelector('[data-extension-model]'),added=document.querySelector('[data-supplementary-extension-model]');if(!native||!added)return;const sync=()=>{added.dataset.locked=native.dataset.locked||'true';if(added.dataset.locked==='true')added.open=false;};new MutationObserver(sync).observe(native,{attributes:true,attributeFilter:['data-locked']});sync();})();\n`);}
 fs.writeFileSync(path.join(dest,'index.html'),result);
 const original$=cheerio.load(source.toString()),new$=cheerio.load(result),protectedSelectors=chapter===11?['[data-required-check]','[data-activity]:not([data-teaching] [data-activity])','script','[data-video]']:['[data-check-id]','[data-guided-item]','[data-transfer]','[data-note-input]','[data-video]'];
 const checks=[];
 for(const selector of protectedSelectors){const a=original$(selector).toArray();for(const n of a){const id=original$(n).attr('id')||original$(n).attr('data-activity')||original$(n).attr('data-check-id')||original$(n).attr('data-guided-item')||original$(n).attr('data-transfer')||original$(n).attr('data-note-input')||original$(n).attr('data-video');const html=original$.html(n);assert(result.includes(html)||new$(selector).toArray().some(m=>new$.html(m)===html),'Protected DOM drift '+selector+':'+id);}checks.push({selector,count:a.length,status:'exact'});}
 const newTasks=chapter===11?new$('[data-activity]').filter((_,n)=>new$(n).attr('data-activity').startsWith('ch11-scout')).length:new$('[data-note-input]').filter((_,n)=>new$(n).attr('data-note-input').startsWith('ch12-pre-v1')).length;
 assert(newTasks===(chapter===11?25:9),'Missing native tasks CH'+chapter);
 assert(new$('[data-proposed-writing],.optional-writing-preview').length===0,'Inert writing remains');
 const ids=new$('[id]').map((_,n)=>new$(n).attr('id')).get();assert(new Set(ids).size===ids.length,'Duplicate DOM IDs CH'+chapter);
 const editKeys=new$('[data-canvas-helper-edit-key]').map((_,n)=>new$(n).attr('data-canvas-helper-edit-key')).get();assert(new Set(editKeys).size===editKeys.length,'Duplicate editor keys CH'+chapter);
 report.chapters[chapter]={canonicalOwner:path.relative(process.cwd(),owner),sourceSha256:sha(source),candidateSha256:sha(Buffer.from(result)),routes:routeCount,intervals:patches.length,nativeNewTasks:newTasks,protectedChecks:checks,patches:patches.map(({after,...p})=>p),bytesOutsideTeachingIntervals:chapter===11?'Copied exactly except four enumerated teaching-direction/locator corrections':'Copied exactly except append-only notes metadata and supplementary model-lock script explicitly enumerated',canonicalUnchanged:sha(fs.readFileSync(path.join(owner,'index.html')))===sha(source)};
}
assemble(11,'biology30-unit-a-pilot-3');assemble(12,'biology30-chapter-12');
// Some supplied figures move between intervals. Resolve against the complete
// candidate, not only the interval that originally contained their captions.
for(const chapter of [11,12]){
 const $=cheerio.load(fs.readFileSync(path.join(root,'evaluation',`ch${chapter}-new/index.html`),'utf8'));
 for(const r of report.editorPlacements.filter(r=>r.chapter===chapter)){
  const live=$(`[data-canvas-helper-edit-key="${r.key}"]`);
  if(!live.length)continue;
  const sameText=live.text().replace(/\s+/g,' ').trim()===r.originalText;
  const original=cheerio.load(r.originalHtml,null,false).root().children().first();
  const sameSlot=['section','div'].includes(r.tag)&&original.attr('id')&&original.attr('id')===live.attr('id');
  assert(live.length===1&&live[0].tagName===r.tag&&(sameText||sameSlot),'Unsafe cross-interval editor identity '+r.key);
  r.status=sameText?'retained same-content identity':'retained structural section identity; teaching inside rewritten';r.successorKeys=[r.key];r.relationship=sameText?'same-content':'same named section, not unchanged prose';
 }
}
const identities=report.editorPlacements.map(r=>r.chapter+':'+r.key);
assert(new Set(identities).size===identities.length,'Duplicate reconciliation records');
report.editorReconciliation={records:identities.length,retained:report.editorPlacements.filter(r=>r.status.startsWith('retained')).length,superseded:report.editorPlacements.filter(r=>r.status.startsWith('superseded')).length,unclassified:0,canonicalMigrationApplied:false,teacherAcceptance:'Only reviewed CH12 lesson-01 preview; no blanket route acceptance',policy:'Never redirect a displaced key to unrelated prose. Frozen originals remain recoverable; successor lists identify whole replacement intervals, not semantic one-to-one equivalence.'};
fs.writeFileSync(path.join(root,'EDITOR_RECONCILIATION.json'),JSON.stringify({schemaVersion:1,chapters:Object.fromEntries(Object.entries(report.chapters).map(([k,v])=>[k,{sourceSha256:v.sourceSha256,candidateSha256:v.candidateSha256}])),summary:report.editorReconciliation,records:report.editorPlacements},null,2)+'\n');
fs.writeFileSync(path.join(root,'BUILD_REPORT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({root,manifestFiles:report.manifestFiles,chapters:Object.fromEntries(Object.entries(report.chapters).map(([k,v])=>[k,{routes:v.routes,intervals:v.intervals,nativeTasks:v.nativeNewTasks,sha256:v.candidateSha256}])),editorReview:report.editorPlacements.filter(r=>r.status.includes('pending')||r.status.includes('needed')).length},null,2));
