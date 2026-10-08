// Historical scoped adapter. Do not rerun over later canonical edits.
const fs=require('fs'),path=require('path');const ch=require(path.join(process.cwd(),'node_modules/cheerio'));
const copy=require('./instruction-copy.cjs');
const base='projects/calm10-2026-draft/';const htmlPath=base+'workspace/index.html',cssPath=base+'workspace/authored-lessons.css';
const before=fs.readFileSync(htmlPath,'utf8');const $=ch.load(before,{sourceCodeLocationInfo:true});
if($('.student-instructions').length!==3)throw Error('Expected approved CE1-01 pilot only');
const raw=e=>{const l=e.sourceCodeLocation;return before.slice(l.startOffset,l.endOffset)};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function label(field){const id=$(field).attr('id');let l=$(`label[for="${id}"]`).first();if(!l.length)l=$(field).closest('label');l=l.clone();l.find('input,select,textarea,button,small,.field-feedback,.field-note').remove();return l.text().trim().replace(/\s+/g,' ');}
function stages(id){return id==='co1-01'?['co1-01-example','co1-01-practice','co1-01-apply']:['ce1-03','fl3-04'].includes(id)?[id+'-worked',id+'-practice',id+'-apply']:[id+'-stage-4',id+'-stage-5',id+'-stage-7'];}
const replacements=[],report=[];
for(const [id,config] of Object.entries(copy)){
 const ids=stages(id);if(ids.some(s=>!$('#'+s).length))throw Error('Missing stage '+id);
 for(let kind=0;kind<3;kind++){
  const stage=$('#'+ids[kind]),node=stage[0];const children=stage.children().toArray();const heading=stage.children('h2,h3').first();
  const controls=kind===2?stage.find('[data-final-field]'):kind===1?stage.find(id==='co1-01'?'#co1-01-review-match,#co1-01-review-context,#co1-01-review-action,#co1-01-review-result,#co1-01-review-sentence':id==='ce1-03'?'#ce-b-travel,#ce-b-total,#ce-b-entry,#ce-b-backup':id==='fl3-04'?'#fl-fee-diff,#fl-fee-claim,#fl-fee-explain': '[id^="field-guided-"]:not([id$="-video"])'):$([]);
  const fields=controls.toArray().filter(e=>$(e).attr('id')&&$(e).attr('type')!=='hidden');
  // Actual field IDs for the two FINLIT fee inputs are resolved below if their historic IDs differ.
  if(kind===1&&id==='fl3-04'&&fields.length!==3){fields.splice(0,fields.length,...stage.find('input[id],select[id],textarea[id]').filter((i,e)=>$(e).attr('type')!=='hidden').toArray());}
  if(kind>0&&!fields.length)throw Error('No fields '+ids[kind]);
  const expected=kind===1?config.practice:config.apply;
  if(kind>0&&expected&&expected.length!==fields.length)throw Error(`${ids[kind]} copy ${expected.length} fields ${fields.length}`);
  const optional=[],visibleTask=[],removed=new Set();
  // Existing professional-media connections become additional guidance; media itself is outside this boundary.
  for(const e of children)if($(e).hasClass('finlit-connection')){optional.push(raw(e));removed.add(e);}
  let fieldList=null;
  if(kind>0){
   const lists=stage.children('ol,ul').toArray();
   fieldList=lists.find(e=>$(e).children('li').length===fields.length&&$(e).find('li>strong').length===fields.length);
   if(!expected&&!fieldList)throw Error('Missing field instructions '+ids[kind]);
   if(fieldList)removed.add(fieldList);
   const actions=/^(Enter\b|Fields:|Write\b|Prepare\b|Create\b|Complete\b|Fill\b|Now write\b|In Observation\b|Draft\b|Use (four|these three|three) fields\b|Make one coherent\b|Use the same decision sequence:|Read both documents\.)/;
   const feedback=/^(Feedback:|Calculation feedback:|Correct amounts|The correct (cash|category|amount)|Targets are|Targets:|The payment exceeds|The first choice|Six \$30 deposits|Show a first-step hint:|Use Show a first-step hint)/;
   for(const e of children){const el=$(e);if(el[0].tagName!=='p'||el.attr('class')||removed.has(e))continue;const text=el.text().trim();if(kind===1&&feedback.test(text)){optional.push(raw(e));removed.add(e);continue;}
    if(kind===1&&/^(Choose|Select|First choose)\b/.test(text)&&/The (first|second|third|correct)|Feedback:|Reducing flexible/.test(text)){optional.push(raw(e));removed.add(e);continue;}
    if(actions.test(text)){visibleTask.push(raw(e));removed.add(e);}
   }
  }
  const phase=['worked','guided','independent'][kind];const headingId=`${id}-instructions-${phase}`;
  const title=['Instructions: read the worked example','Instructions: build your practice response','Instructions: write your independent response'][kind];
  let steps;
  if(kind===0){steps=config.read.map(row=>{const [title,detail]=row.split('|');return `<li><strong>${esc(title)}</strong>${esc(detail)}</li>`}).join('');}
  else if(fieldList){
   // Keep every existing field-specific requirement, using the actual field name for its linked heading.
   steps=$(fieldList).children('li').toArray().map((e,i)=>{const clone=$(e).clone();clone.children('strong').first().remove();return `<li><strong><a href="#${esc($(fields[i]).attr('id'))}">${esc(label(fields[i]))}</a></strong>${clone.html().trim().replace(/^\s*[—–:-]\s*/,'')}</li>`}).join('');
  }else{steps=fields.map((e,i)=>`<li><strong><a href="#${esc($(e).attr('id'))}">${esc(label(e))}</a></strong>${esc(expected[i])}</li>`).join('');}
  const model=stage.find('details.authored-model,details.finlit-model,details.review-model').first();
  const modelText=model.children('summary').text().trim();
  const intro=kind===0?`<p><strong>Read first; you do not need to write here.</strong> Follow the completed example below using these reading steps. It shows how to build an answer from the supplied evidence before you try the method.</p>`:kind===1?`<p><strong>Your turn, with support.</strong> Use this practice situation and the supplied records. Follow the numbered steps in the matching fields below.</p>`:`<p><strong>Use the new situation above.</strong> Work through the numbered fields using this case’s facts. Keep earlier example amounts and events separate from this response.</p>`;
  let review=kind===0?'':kind===1?`<p><strong>Check and revise:</strong> Use the check controls beside any choices or calculations and read their feedback. ${modelText?`Open <strong>${esc(modelText)}</strong> when you need help, then revise your fields.`:'Use the comparison model below when you need help, then revise your fields.'}</p>`:`<p><strong>Review and finish:</strong> Check your response against the lesson’s four sign-off statements, revise as needed, then select <strong>Complete lesson</strong>. Completion records your review; it does not automatically grade your writing.</p>`;
  // Avoid claiming every practice has a choice/calculation check.
  if(kind===1&&!stage.find('select,button[data-check-number],button[data-support-number],button.finlit-check-button,button[data-check-flexible],button[data-check-guided]').length)review=`<p><strong>Compare and revise:</strong> Open <strong>${esc(modelText||'Compare your response with a model')}</strong> when you need help. Check your reasoning against the supplied records, then revise your fields.</p>`;
  const extraLead=kind===0?'<p><strong>What is a worked example?</strong> An answer that is already completed, with the decisions or calculations explained. As you read, connect the answer to the records; you do not need to copy it.</p>':kind===1?'<p><strong>How to use the support:</strong> Try a step using the supplied facts. If you are unsure, open a first-step hint or the comparison model. Use it to improve your reasoning rather than copy identical wording.</p>':'<p><strong>How to review your writing:</strong> Your wording may differ from the model. Check that each claim or calculation uses this case’s evidence and that you explain any limits or missing information.</p>';
  const listAttrs=fieldList?$(fieldList).attr('data-canvas-helper-edit-key'):null;
  const panel=`<section class="student-instructions" aria-labelledby="${headingId}" data-canvas-helper-edit-key="${headingId}"><h4 id="${headingId}">${title}</h4>${intro}${visibleTask.join('\n')}<ol class="student-guide" data-canvas-helper-edit-key="${esc(listAttrs||id+'-'+phase+'-instruction-actions')}">${steps}</ol>${review}<details class="student-extra-guidance" data-canvas-helper-edit-key="${id}-${phase}-extra-guidance"><summary>Show more guidance</summary><div class="student-extra-guidance-body">${extraLead}<p>${esc(config.help)}</p>${optional.join('\n')}</div></details></section>`;
  let insertBefore;
  if(kind===0){insertBefore=children.find(e=>e.sourceCodeLocation.startOffset>(heading[0]?.sourceCodeLocation.endOffset||0)&&!removed.has(e)&&!$(e).hasClass('section-label')&&!$(e).hasClass('finlit-anchor'));}
  else{insertBefore=children.find(e=>$(e).is('div.authored-response-group,div.finlit-field-grid,label.pilot-field,div.review-practice-step'));
   if(id==='co1-01'&&kind===2)insertBefore=stage.children('label.pilot-field').first()[0];
   if(!insertBefore)throw Error('Missing controls anchor '+ids[kind]);}
  // Construct only this stage's inner HTML with original byte slices, preserving nested controls/model adjacency.
  const start=node.sourceCodeLocation.startTag.endOffset,end=node.sourceCodeLocation.endTag.startOffset;
  let cursor=start,body='';for(const e of children){const l=e.sourceCodeLocation;if(!l)continue;body+=before.slice(cursor,l.startOffset);if(e===insertBefore)body+=panel+'\n';if(!removed.has(e))body+=raw(e);cursor=l.endOffset;}body+=before.slice(cursor,end);
  if(!body.includes(headingId))throw Error('Panel missing');
  replacements.push({start,end,body});report.push({lesson:id,stage:ids[kind],phase,fields:fields.map(e=>$(e).attr('id')),visibleOriginalTaskParagraphs:visibleTask.length,originalGuidanceMoved:optional.length});
 }
}
let html=before;for(const r of replacements.sort((a,b)=>b.start-a.start))html=html.slice(0,r.start)+r.body+html.slice(r.end);
fs.writeFileSync(htmlPath,html);
let css=fs.readFileSync(cssPath,'utf8');const marker='/* CE1-01 instructions retain the colour family of their containing section. */';const at=css.indexOf(marker);if(at<0)throw Error('CSS pilot boundary missing');css=css.slice(0,at)+`/* Approved instruction pattern: essential actions visible; extra guidance expandable. */
.authored-stage-4, .pilot-stage--model, .finlit-stage--worked { --instruction-background: #f4f0e7; --instruction-border: #d9d3c6; }
.authored-stage-5, .pilot-stage--practice, .finlit-stage--practice { --instruction-background: #eaf2ed; --instruction-border: #bed0c4; }
.authored-stage-7, #co1-01-apply, .finlit-stage--apply { --instruction-background: #f2f5ee; --instruction-border: #cbd5c7; }
.authored-lesson .student-instructions { margin: 24px 0; padding: 20px; border: 1px solid var(--instruction-border); background: var(--instruction-background); }
.authored-lesson .student-instructions > h4 { margin: 0 0 16px; font-size: 18px; line-height: 1.4; color: var(--green); }
.authored-lesson div.student-guide { margin: 24px 0; }
.authored-lesson .student-instructions > div.student-guide { margin: 0; }
.authored-lesson div.student-guide p { margin: 0 0 14px; }
.authored-lesson div.student-guide p:last-child { margin-bottom: 0; }
.authored-lesson .student-instruction-label { display: block; margin-bottom: 4px; color: var(--green); }
.authored-lesson ol.student-guide { margin: 20px 0 0; padding-left: 26px; border-top: 1px solid var(--instruction-border); }
.authored-lesson ol.student-guide > li { padding: 16px 4px 16px 6px; border-bottom: 1px solid var(--instruction-border); }
.authored-lesson ol.student-guide > li:last-child { border-bottom: 0; }
.authored-lesson ol.student-guide > li::marker { color: var(--green); font-weight: 800; }
.authored-lesson ol.student-guide > li > strong:first-child { display: block; margin-bottom: 5px; }
.authored-lesson .student-instructions .finlit-connection { border-color: var(--instruction-border); }
.authored-lesson .student-instructions > p:last-child { margin-bottom: 0; }
.authored-lesson .student-extra-guidance { margin-top: 16px; border-top: 1px solid var(--instruction-border); }
.authored-lesson .student-extra-guidance > summary { padding: 14px 0; color: var(--green); font-weight: 800; cursor: pointer; }
.authored-lesson .student-extra-guidance > summary:focus-visible { outline: 2px solid var(--green); outline-offset: 3px; }
.authored-lesson .student-extra-guidance-body { padding: 2px 0 6px; }
.authored-lesson .student-extra-guidance-body > div.student-guide { margin-top: 0; }
.authored-lesson .student-extra-guidance-body > :last-child { margin-bottom: 0; }
@media (max-width: 760px) {
  .authored-lesson .student-instructions { padding: 16px 14px; }
  .authored-lesson ol.student-guide { padding-left: 22px; }
  .authored-lesson ol.student-guide > li { padding-left: 4px; }
}
`;
fs.writeFileSync(cssPath,css);fs.writeFileSync(path.join(__dirname,'adaptation-map.json'),JSON.stringify(report,null,2));console.log({lessons:Object.keys(copy).length,newInstructionAreas:report.length});
