// Review derivative owner: reads the frozen baseline and authored copy, never writes the course.
const fs=require('fs'),path=require('path'),c=require('cheerio'),crypto=require('crypto');
const root=__dirname,base=path.join(root,'baseline'),spec={...require('./career-copy-1.cjs'),...require('./career-copy-2.cjs')};
const ids=Object.keys(spec),sha=x=>crypto.createHash('sha256').update(x).digest('hex'),esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;');
const changes=[];
const openings=require('./career-openings.cjs'),alberta=require('./alberta-course-review.cjs');
for(const [id,o] of Object.entries(openings)){
 const s=spec[id];
 if(s.foundation){
  const core=s.foundation.slice(2,-2);
  s.foundation=[['h3',o.title],...o.intro.map(x=>['p',x]),...(id==='ce1-05'?alberta.teaching:[]),...core,['p',o.bridge]];
 }else s.opening=[['h3',o.title],...o.intro.map(x=>['p',x])];
}

function author(id){
 let html=fs.readFileSync(path.join(base,id+'.html'),'utf8'),$=c.load(html,{sourceCodeLocationInfo:true}),s=spec[id],edits=[];
 const raw=e=>html.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
 const replace=(e,value)=>edits.push({start:e.sourceCodeLocation.startOffset,end:e.sourceCodeLocation.endOffset,value});
 const children=el=>$(el).children().toArray();
 let counter=0;
 const termMap=$('details.lesson-vocabulary-help .vocab-term').toArray().map(e=>[$(e).text(),$(e).attr('data-vocab-term')]);
 function vocab(text){
  let d=c.load('<div>'+text+'</div>',{sourceCodeLocationInfo:true});
  // Only new prose text nodes; native dotted word controls and popup are reused.
  const walk=e=>{for(let n of [...(e.children||[])]){if(n.type==='text'){let x=n.data;for(let [label,key] of termMap){if(!key)continue;let re=new RegExp('\\b'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');let m=x.match(re);if(m)x=x.replace(re,`<button type="button" class="vocab-term" data-vocab-term="${esc(key)}" aria-haspopup="dialog">${m[0]}</button>`);}if(x!==n.data)d(n).replaceWith(x);}else if(n.type==='tag'&&!['button','a'].includes(n.name))walk(n);}};walk(d('div')[0]);return d('div').html();
 }
 function render(items,old=[]){let pools={};for(let e of old){(pools[e.name]||=[]).push(e);}let output=items.map(([tag,text])=>{let e=(pools[tag]||[]).shift(),attrs='';if(e){for(let a of ['id','data-canvas-helper-edit-key'])if($(e).attr(a))attrs+=' '+a+'="'+esc($(e).attr(a))+'"';}if(!attrs.includes('data-canvas-helper-edit-key'))attrs+=' data-canvas-helper-edit-key="'+id+'-teacher-prose-'+(++counter)+'"';return '<'+tag+attrs+'>'+vocab(text)+'</'+tag+'>';});
  // All authored keys from the source must have an owner after rewriting.
  for(let pool of Object.values(pools))for(let e of pool)if($(e).attr('id')||$(e).attr('data-canvas-helper-edit-key'))throw Error('Unused keyed prose '+id+' '+e.name+' '+$(e).attr('data-canvas-helper-edit-key'));
  return output.join('\n');
 }
 function rewriteSection(el,items,eligible){
  const nodes=children(el),old=nodes.filter(eligible),first=old[0];if(!first)throw Error('No prose '+id);
  let body=nodes.map(e=>e===first?render(items,old):old.includes(e)?'':raw(e)).join('\n');
  const l=el.sourceCodeLocation;edits.push({start:l.startTag.endOffset,end:l.endTag.startOffset,value:'\n'+body+'\n'});
 }
 const prose=e=>['p','h3'].includes(e.name)&&!$(e).is('.section-label,.learning-next')&&!$(e).find('a').length;
 if(s.foundation)rewriteSection($('#'+id+'-foundations')[0],s.foundation,prose);
 const opening=$('#'+id+'-stage-1')[0];if(s.opening)rewriteSection(opening,s.opening,prose);else rewriteSection(opening,s.orientation.map(p=>['p',p]),e=>e.name==='p'&&!$(e).hasClass('section-label'));
 rewriteSection($('#'+id+'-stage-3')[0],s.method,e=>prose(e)&&!($(e).text().startsWith('Optional first-step hint:'))&&!($(e).attr('data-canvas-helper-edit-key')||'').endsWith('-method-next'));
 // Reading guide sits after the person is introduced and immediately before the first document.
 const caseEl=$('#'+id+'-stage-2')[0],caseNodes=children(caseEl),document=caseNodes.find(e=>$(e).is('.document-table,.finlit-document'))||caseNodes.find(e=>e.name==='fieldset');
 edits.push({start:document.sourceCodeLocation.startOffset,end:document.sourceCodeLocation.startOffset,value:render(s.caseGuide.map(p=>['p',p]))+'\n'});
 const worked=$('#'+id+'-stage-4')[0],wn=children(worked),paras=wn.filter(e=>e.name==='p'&&!$(e).is('.section-label,.learning-next'));
 const model=paras.find(e=>/^(Completed |“During |Revised board:)/.test($(e).text().trim()));if(!model)throw Error('No worked model '+id);
 let modelIndex=wn.indexOf(model),pre=paras.filter(e=>wn.indexOf(e)<modelIndex),post=paras.filter(e=>wn.indexOf(e)>modelIndex&&!/^(Completed revision note:|Revised board:)/.test($(e).text().trim()));
 const hasTableBefore=wn.some(e=>$(e).hasClass('document-table')&&wn.indexOf(e)<modelIndex);
 if(hasTableBefore){const table=wn.find(e=>$(e).hasClass('document-table'));edits.push({start:table.sourceCodeLocation.startOffset,end:table.sourceCodeLocation.startOffset,value:render(s.workedBefore.map(p=>['p',p]),pre)+'\n'});for(let e of pre)replace(e,'');}
 else if(pre.length){replace(pre[0],render(s.workedBefore.map(p=>['p',p]),pre));for(let e of pre.slice(1))replace(e,'');}
 else edits.push({start:model.sourceCodeLocation.startOffset,end:model.sourceCodeLocation.startOffset,value:render(s.workedBefore.map(p=>['p',p]))+'\n'});
 if(post.length){replace(post[0],render(s.workedAfter.map(p=>['p',p]),post));for(let e of post.slice(1))replace(e,'');}else edits.push({start:model.sourceCodeLocation.endOffset,end:model.sourceCodeLocation.endOffset,value:'\n'+render(s.workedAfter.map(p=>['p',p]))});
 const practice=$('#'+id+'-stage-5')[0],pn=children(practice),group=pn.find(e=>$(e).hasClass('authored-response-group'));
 // Keep the changed-case notice. Replace duplicated instructions with the connected field explanation.
 const oldPractice=pn.filter(e=>e.name==='p'&&!$(e).is('.section-label,.learning-next')&&wn.indexOf(e)<0);
 const redundant=oldPractice.filter(e=>/^(In Revised elective sequence|First select|Write short notes|Calculation feedback|Select |Choose the second)/.test($(e).text()));
 edits.push({start:group.sourceCodeLocation.startOffset,end:group.sourceCodeLocation.startOffset,value:render(s.practiceBefore.map(p=>['p',p]),redundant)+'\n'});for(let e of redundant)replace(e,'');
 const independent=$('#'+id+'-stage-7 > .student-instructions')[0];edits.push({start:independent.sourceCodeLocation.startOffset,end:independent.sourceCodeLocation.startOffset,value:render(s.independentBefore.map(p=>['p',p]))+'\n'});
 const end=$('#'+id+'-stage-8')[0],sign=children(end).find(e=>e.name==='fieldset');if(!sign)throw Error('No signoff '+id);edits.push({start:sign.sourceCodeLocation.startOffset,end:sign.sourceCodeLocation.startOffset,value:render(s.closing.map(p=>['p',p]))+'\n'});
 edits.sort((a,b)=>b.start-a.start||b.end-a.end);let last=html.length+1;for(let e of edits){if(e.end>last)throw Error('Overlapping edits '+id);html=html.slice(0,e.start)+e.value+html.slice(e.end);last=e.start;}
 for(let [old,next] of s.corrections||[]){if(!html.includes(old))throw Error('Missing correction '+id+' '+old);html=html.replace(old,next);changes.push({id,type:'model-fidelity',before:old,after:next});}
 if(id==='ce1-06'){html=html.replaceAll('Check my calculation','Check this calculation');changes.push({id,type:'control-wording',before:'Check my calculation',after:'Check this calculation',reason:'Instruction wording must match the retained calculation buttons.'});}
 if(id==='ce1-04'){html=html.replace(/<p data-canvas-helper-edit-key="ce1-04-foundation-task">[\s\S]*?<\/p>/,'<p class="learning-next" data-canvas-helper-edit-key="ce1-04-foundation-task"><strong>Next:</strong> <a href="#ce1-04-stage-3" data-section-target="ce1-04-stage-3">Learn how to label the information</a>. We will use those labels to read Noor’s two records.</p>');html=html.replaceAll('Source period 2024–2026; section update','Forecast period 2024–2026; section update');changes.push({id,type:'date-label',before:'Source period 2024–2026',after:'Forecast period 2024–2026',reason:'Forecast coverage must not be read as employment measurement period.'});}
 if(id==='ce1-02'){html=html.replace('Nia’s interests and two profiles, so the method transfers','Nia’s interests and two profiles. Nia has no particular employer posting in this case, so neither profile can settle the hours or requirements of one opening. The method transfers');}
 if(id==='ce1-01'){
  html=html.replace(/<p data-support-copy-status="" role="status">Before revising,[\s\S]*?<\/p>/,'<p data-support-copy-status="" role="status">No first attempt kept yet.</p>');
  // Video transcript remains exact; teaching attribution now matches what it actually teaches.
  const replacements=[['Use the video’s distinction as you read: Jordan’s poster action supports a skill claim; the predictable-schedule preference helps frame a question about work.','The video explains influences on values. This lesson adds a separate distinction: Jordan’s poster action supports a skill claim, while the predictable-schedule preference helps frame a question about work.'],['Keep the two kinds of evidence separate in your practice response: what the person did, and what the person wants work to support.','The video helps explain where values can come from. In your practice response, use the lesson’s method to keep an observed action separate from a preference about work.']];
  for(let [a,b]of replacements){if(!html.includes(a))throw Error('Missing video correction');html=html.replace(a,b);changes.push({id,type:'media-purpose',before:a,after:b});}
  let d=c.load(html,{sourceCodeLocationInfo:true});const intro=d('p').toArray().find(e=>d(e).text().includes('Listen for')||d(e).text().includes('listen for'));if(intro){const text=d(intro).text();if(text.includes('preference')&&text.includes('demonstrate')){const l=intro.sourceCodeLocation;html=html.slice(0,l.startOffset)+'<p data-canvas-helper-edit-key="ce1-01-media-intro">Before watching, listen for how family, friends and culture can influence what people value. Think about Jordan’s preference for predictable time outside work. The clip helps explain influences on values; the notebook supplies the separate evidence about Jordan’s actions and skills. You can read the transcript instead of watching.</p>'+html.slice(l.endOffset);changes.push({id,type:'media-purpose',before:text,after:'Listen for influences on values; use the notebook for skill evidence.'});}}
 }
 if(id==='ce1-05'){
 html=alberta.tasks(html);
 changes.push({id,type:'alberta-course-task-revision',version:alberta.version,reason:'Replace invented course names with Alberta courses; correct INF2050 prerequisite; distinguish diploma requirements from fictional provider conditions. Prior review answers retain their previous prompt.'});
 }
 fs.writeFileSync(path.join(root,'manuscripts',id+'.html'),html);return html;
}
const authored=Object.fromEntries(ids.map(id=>[id,author(id)]));
const baseline=fs.readFileSync(path.join(base,'index.html'),'utf8'),all=c.load(baseline,{sourceCodeLocationInfo:true});let candidate=baseline;const replacements=ids.map(id=>({loc:all('#'+id)[0].sourceCodeLocation,html:authored[id]})).sort((a,b)=>b.loc.startOffset-a.loc.startOffset);for(let r of replacements)candidate=candidate.slice(0,r.loc.startOffset)+r.html+candidate.slice(r.loc.endOffset);
// Register the exact pre-revision review wording without rewriting any prior registry versions.
{
 const d=c.load(candidate,{sourceCodeLocationInfo:true}),registry=d('#historical-task-registry')[0],loc=registry.sourceCodeLocation;
 const data=JSON.parse(d(registry).text()),priorHtml=fs.readFileSync(path.join(root,'revision-1/manuscripts/ce1-05.html'),'utf8'),prior=c.load(priorHtml);
 data.versionPrompts||={};data.versions||={};data.fields||={};
 const promptId='ce1-05-career-review-revision-1';
 const prompt=prior('article').clone();prompt.find('script,template').remove();
 data.versionPrompts[promptId]=prompt.text().replace(/\s+/g,' ').trim();
 prior('[data-save-key]').each((i,e)=>{const key=prior(e).attr('data-save-key'),v=prior(e).attr('data-task-version')||'career-review-revision-1';data.versions[v]||={};data.versions[v][key]={label:prior(e).closest('.authored-field').find('label').first().text()||prior(e).closest('fieldset').find('legend').first().text()||key,promptId};if(!prior(e).attr('data-task-version'))data.fields[key]={...(data.fields[key]||{}),lessonId:'ce1-05',version:v,promptId};});
 // Unversioned prior support fields need an explicit fallback prompt as well.
 for(const key of Object.keys(data.fields))if(data.fields[key].promptId===promptId)data.fields[key].prompt=data.versionPrompts[promptId];
 candidate=candidate.slice(0,loc.startTag.endOffset)+JSON.stringify(data).replaceAll('<','\\u003c')+candidate.slice(loc.endTag.startOffset);
}
const normalize=s=>s.replace(/\s+/g,' ').trim();
function manuscript(id,html){let d=c.load(html);function md(n){if(n.type==='text')return n.data;if(n.type!=='tag')return '';const tag=n.name,child=()=>n.children.map(md).join('');if(['script','template'].includes(tag))return '';if(tag==='button')return d(n).hasClass('vocab-term')?d(n).text():'\n[Control: '+d(n).text()+']\n';if(tag==='select')return '\n[Selection options: '+normalize(d(n).text())+']\n';if(tag==='textarea')return '\n[Response field: '+(d(n).attr('placeholder')||'write here')+']\n';if(tag==='input')return d(n).attr('type')==='checkbox'?'[ ] ':'';if(/^h[1-6]$/.test(tag))return '\n\n'+'#'.repeat(+tag[1])+' '+normalize(d(n).text())+'\n\n';if(tag==='p')return '\n\n'+child().trim()+'\n\n';if(tag==='a')return '['+normalize(d(n).text())+']('+d(n).attr('href')+')';if(tag==='strong')return '**'+child()+'**';if(tag==='summary')return '\n\n**Disclosure: '+normalize(d(n).text())+'**\n\n';if(tag==='dt')return '\n\n**'+normalize(d(n).text())+'** — ';if(tag==='li')return '\n- '+child().trim()+'\n';if(tag==='legend')return '\n\n**Question: '+normalize(d(n).text())+'**\n\n';if(tag==='label')return '\n\n'+child().trim()+'\n';if(tag==='video')return '\n[Video: '+d(n).find('source').attr('src')+']\n';if(tag==='table'){let rows=d(n).find('tr').toArray().map(r=>d(r).children('th,td').toArray().map(e=>normalize(d(e).text())));return '\n\n'+rows.map((r,i)=>'| '+r.join(' | ')+' |'+(i===0?'\n| '+r.map(()=>'---').join(' | ')+' |':'')).join('\n')+'\n\n';}return child();}let content='# '+id.toUpperCase()+' — complete proposed learner manuscript\n\nReview B. Original supplied documents, controls and intentional model reveals are included. Not canonically integrated.\n\n'+md(d('#'+id)[0]).replace(/\n{3,}/g,'\n\n');fs.writeFileSync(path.join(root,'manuscripts',id+'.md'),content);return sha(content);}
const hashes={};for(let id of ids)hashes[id]={article:sha(authored[id]),manuscript:manuscript(id,authored[id])};
for(let [v,html]of[['a',baseline],['b',candidate]]){let dest=path.join(root,'review',v);fs.mkdirSync(dest,{recursive:true});for(let f of Object.keys(JSON.parse(fs.readFileSync(path.join(root,'BASELINE.json'))).files)){if(f==='index.html')continue;let data=fs.readFileSync(path.join(base,f));if(f.endsWith('.js'))data=data.toString().replaceAll('calm10-2026-draft:',`calm10-2026-draft:career-standard-v1:${v}:`);fs.writeFileSync(path.join(dest,f),data);}let banner=`<nav class="review-switch" aria-label="Career lesson review"><strong>Version ${v.toUpperCase()} · ${v==='a'?'current lessons':'revised teacher narration · revision 2'}</strong><a href="../../">Choose a lesson to compare</a><span>Review work saves separately from the course and other review version.</span></nav>`;fs.writeFileSync(path.join(dest,'index.html'),html.replace('</head>','<link rel="stylesheet" href="../../review.css"></head>').replace('<main class="course-frame">','<main class="course-frame">'+banner));}
fs.copyFileSync(path.join(root,'../ce1-03-teacher-narrative-v1/review.css'),path.join(root,'review.css'));
const points=[['Opening','foundations'],['Worked example','stage-4'],['Guided practice','stage-5'],['Independent task','stage-7']];
const sections=ids.map(id=>{let title=all('#'+id+' > header h1').first().text();return `<section id="${id}"><h2>${id.toUpperCase()} · ${title}</h2><p><a href="review/b/index.html#${id}"><strong>Read complete B</strong></a> · <a href="review/a/index.html#${id}">Read A</a> · <a href="manuscripts/${id}.md">Complete manuscript</a></p><table><thead><tr><th>Review point</th><th>A · Current</th><th>B · Proposed</th></tr></thead><tbody>${points.map(([label,anchor])=>{if(id==='ce1-04'&&anchor==='foundations')anchor='stage-1';return `<tr><td>${label}</td><td><a href="review/a/index.html#${id}-${anchor}">Read A here</a></td><td><a href="review/b/index.html#${id}-${anchor}">Read B here</a></td></tr>`}).join('')}<tr><td>Core vocabulary</td><td><a href="review/a/index.html#${id}">Open disclosure in A</a></td><td><a href="review/b/index.html#${id}">Open disclosure in B</a></td></tr></tbody></table><details><summary>Compare the opening instructions</summary><div class="review-pair"><blockquote><strong>A</strong><p>${all('#'+id+'-foundations > p:not(.section-label),#'+id+'-stage-1 > p:not(.section-label)').first().text()}</p></blockquote><blockquote><strong>B</strong><p>${c.load(authored[id])('#'+id+'-foundations > p:not(.section-label),#'+id+'-stage-1 > p:not(.section-label)').first().text()}</p></blockquote></div></details><details><summary>Inspect B on desktop and mobile</summary><div class="review-pair"><figure><figcaption>Desktop · opening</figcaption><a href="screens/${id}-b-opening-desktop.png"><img src="screens/${id}-b-opening-desktop.png" alt="${id} proposed opening on desktop" loading="lazy"></a></figure><figure class="review-mobile"><figcaption>Mobile · opening</figcaption><a href="screens/${id}-b-opening-mobile.png"><img src="screens/${id}-b-opening-mobile.png" alt="${id} proposed opening on mobile" loading="lazy"></a></figure></div></details></section>`}).join('\n');
fs.writeFileSync(path.join(root,'index.html'),`<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CALM · Career lessons review</title><link rel="stylesheet" href="review/a/styles.css"><link rel="stylesheet" href="review.css"></head><body><main class="review-main"><h1>Career planning: the next six lessons</h1><p>CE1-03 established the accepted teaching approach. Revision 2 makes the lesson purpose, starting situation, learning sequence and final response visible before the examples. CE1-05 now uses Alberta course names and explains graduation separately from program preparation.</p><p><strong>A preserves the current course. B is a review proposal.</strong> Both use the native course shell and separate saved-work namespaces. Read each B from the opening to the final task before judging it.</p><p><a href="STANDARD.md">CALM teaching standard</a> · <a href="AUDIT.md">Remaining 39 lessons audit</a></p>${sections}<section><h2>Review decision</h2><p>Tell me which lessons you accept as B, or list the changes you want by lesson. This batch does not replace the current course. The workplace, financial-literacy and personal-information lessons remain later work.</p></section></main></body></html>`);
fs.writeFileSync(path.join(root,'REVIEW_MANIFEST.json'),JSON.stringify({schemaVersion:1,revision:2,status:'awaiting-user-review',canonicalIntegrated:false,lessons:ids,hashes,corrections:changes,storagePrefixes:{a:'calm10-2026-draft:career-standard-v1:a:',b:'calm10-2026-draft:career-standard-v1:b:'}},null,2)+'\n');console.log('Six complete manuscripts and isolated native review versions assembled.');
