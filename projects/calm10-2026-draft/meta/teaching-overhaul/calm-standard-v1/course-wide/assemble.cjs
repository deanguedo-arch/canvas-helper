// Review-only owner. Frozen current B is the input; canonical and Version A are never written.
const fs=require('fs'),path=require('path'),c=require('cheerio'),crypto=require('crypto');
const jurisdictionCopy=require('./jurisdiction-copy.cjs');
const root=__dirname,parent=path.dirname(root),spec={...require('./workplace-copy.cjs'),...require('./economic-copy.cjs'),...require('./lending-copy.cjs'),...require('./saving-copy.cjs'),...require('./privacy-copy.cjs')};
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),esc=x=>x.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const before=fs.readFileSync(path.join(root,'accepted-career-review-index.html'),'utf8'),full=c.load(before,{sourceCodeLocationInfo:true}),authored={};
fs.mkdirSync(path.join(root,'manuscripts'),{recursive:true});
for(const [id,s] of Object.entries(spec)){
 let html=fs.readFileSync(path.join(root,id+'-before.html'),'utf8'),$=c.load(html,{sourceCodeLocationInfo:true}),edits=[],counter=0;
 const raw=e=>html.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset),replace=(e,value)=>edits.push({start:e.sourceCodeLocation.startOffset,end:e.sourceCodeLocation.endOffset,value}),insert=(e,value)=>edits.push({start:e.sourceCodeLocation.startOffset,end:e.sourceCodeLocation.startOffset,value});
 const terms=$('details.lesson-vocabulary-help .vocab-term').toArray().map(e=>[$(e).text(),$(e).attr('data-vocab-term')]);
 function vocab(x){
  const labels=terms.filter(([word,key])=>word&&key).sort((a,b)=>b[0].length-a[0].length),keys=new Map(labels.map(([word,key])=>[word.toLowerCase(),key]));
  if(!labels.length)return esc(x);
  const re=new RegExp('\\b('+labels.map(([word])=>word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi'),used=new Set();let output='',offset=0;
  for(const m of x.matchAll(re)){output+=esc(x.slice(offset,m.index));const label=m[0].toLowerCase();output+=used.has(label)?esc(m[0]):'<button type="button" class="vocab-term" data-vocab-term="'+esc(keys.get(label))+'" aria-haspopup="dialog">'+esc(m[0])+'</button>';used.add(label);offset=m.index+m[0].length;}
  return output+esc(x.slice(offset));
 }
 function render(text,e,tag='p') {let attrs='';if(e)for(const a of ['id','data-canvas-helper-edit-key'])if($(e).attr(a))attrs+=' '+a+'="'+esc($(e).attr(a))+'"';if(!attrs.includes('data-canvas-helper-edit-key'))attrs+=' data-canvas-helper-edit-key="'+id+'-course-teaching-'+(++counter)+'"';return '<'+tag+attrs+'>'+vocab(text)+'</'+tag+'>';}
 const foundation=$('#'+id+'-foundations')[0];if(!foundation)throw Error('Missing foundation '+id);
 const fn=$(foundation).children().toArray(),ordinary=fn.filter(e=>['p','h3'].includes(e.name)&&!$(e).is('.section-label,.learning-next'));
 const title=ordinary.find(e=>e.name==='h3'),purpose=ordinary.find(e=>e.name==='p'),reading=ordinary.find(e=>($(e).attr('data-canvas-helper-edit-key')||'').endsWith('foundations-reading')),next=ordinary.find(e=>($(e).attr('data-canvas-helper-edit-key')||'').endsWith('foundations-next'));
 replace(title,render(s.title,title,'h3'));
 replace(purpose,[render(s.purpose,purpose),render(s.context),render(s.journey,reading),render(s.product,next)].join('\n'));
 if(reading)replace(reading,'');if(next)replace(next,'');
 if(s.retainPilot)edits.push({start:foundation.sourceCodeLocation.endTag.startOffset,end:foundation.sourceCodeLocation.endTag.startOffset,value:'\n'+render(s.bridge)+'\n'});
 if(!s.retainPilot){
  const opening=$('#'+id+'-stage-1'),op=opening.children('p').toArray().filter(e=>!$(e).is('.section-label,.learning-next')&&!/^(Vocabulary\.|Useful terms\.|Optional)/.test($(e).text()));
  // Remove the second orientation that formerly repeated the same route. Keep native vocabulary/reference prose.
  op.forEach((e,i)=>{if(i===0)replace(e,render(s.bridge,e));else{if($(e).attr('id')||$(e).attr('data-canvas-helper-edit-key'))throw Error('Keyed redundant orientation needs an owner '+id);replace(e,'');}});
  opening.children('ol').each((i,e)=>{if($(e).attr('id')||$(e).attr('data-canvas-helper-edit-key'))throw Error('Keyed old roadmap '+id);replace(e,'');});
  const method=$('#'+id+'-stage-3'),mp=method.children('p').toArray().filter(e=>!$(e).is('.section-label,.learning-next')&&!$(e).find('a').length&&!/^Optional/.test($(e).text()));
  // Reconcile repeated abstract explanations; retain calculation-bearing paragraphs and dated source notes.
  if(mp.length>=2&&!mp.slice(0,2).some(e=>/\d/.test($(e).text()))){mp.slice(0,2).forEach((e,i)=>replace(e,render(s.method[i],e)));}
  else if(mp[0])insert(mp[0],s.method.map(x=>render(x)).join('\n')+'\n');
  const worked=$('#'+id+'-stage-4'),wp=worked.children('p').toArray().filter(e=>!$(e).is('.section-label,.learning-next')&&!$(e).find('a').length),model=wp.find(e=>/^(Completed|Complete |Here is|Here’s|Improved decision|“)/.test($(e).text().trim()));
  if(wp[0]){if(!/\d/.test($(wp[0]).text())&&wp[0]!==model)replace(wp[0],render(s.worked[0],wp[0]));else insert(wp[0],render(s.worked[0])+'\n');}
  const practice=$('#'+id+'-stage-5'),pg=practice.children('.student-instructions')[0]||practice.children('.authored-response-group')[0];if(!pg)throw Error('No practice group '+id);insert(pg,render(s.practice)+'\n');
  const independent=$('#'+id+'-stage-7'),ig=independent.children('.student-instructions')[0];if(!ig)throw Error('No independent instructions '+id);insert(ig,render(s.independent)+'\n');
  const closing=$('#'+id+'-stage-8 >fieldset')[0];if(!closing)throw Error('No closing '+id);insert(closing,render(s.close)+'\n');
 }
 edits.sort((a,b)=>b.start-a.start||b.end-a.end);let last=html.length+1;for(const e of edits){if(e.end>last)throw Error('Overlap '+id);html=html.slice(0,e.start)+e.value+html.slice(e.end);last=e.start;}
 // Specific audit repairs: preserve controls, answers and documents while making the supplied instructions accurate.
 if(id==='co1-02')html=html.replace('[Place the approved library floor-plan image here, followed by the same text description above.]','Use the approved floor plan and its text description below to locate the spill, clear route and Morgan.');
 if(id==='co1-03')html=html.replaceAll('Turn those notes into <strong>My practice answer</strong>, 4–6 sentences. Read it aloud or silently, then open','Read your three notes as the parts of an answer, aloud or silently, then open');
 if(id==='co2-02')html=html.replace('Try “My video pause response: observation, missing information and next safe action” before opening its comparison model.','Use Cam’s coworker comment in the next section. Try its three fields before opening their comparison model.');
 if(id==='fl1-06')html=html.replaceAll('Use two confirmed updates','Use three confirmed updates');
 if(id==='fl2-01'){
  // The model previously introduced the premise only after the learner had answered.
  const d=c.load(html,{sourceCodeLocationInfo:true}),p=d('#fl2-01-stage-5 >.student-instructions')[0];const l=p.sourceCodeLocation;html=html.slice(0,l.startOffset)+'<p data-canvas-helper-edit-key="fl2-01-course-changed-allowance"><strong>Changed allowance for this practice:</strong> Alex can repay at most $40 monthly for the first six months, then $60 monthly. The separate $20 setup fund and both offers are unchanged. Check the first six scheduled payments before choosing the changed-allowance answer.</p>\n'+html.slice(l.startOffset);
 }
 if(id==='fl4-04')html=html.replace('Mina can decline the $157.50 total because the price exceeds the intended budget, or decide it is acceptable and choose to purchase; no budget or competing offer is supplied, so neither choice is forced.','Mina can decline the disclosed $157.50 total or decide it is acceptable and choose to purchase. No budget limit or competing offer is supplied, so neither choice is forced.');
 html=jurisdictionCopy(html,id);
 authored[id]=html;fs.writeFileSync(path.join(root,'manuscripts',id+'.html'),html);
 let d=c.load(html);d('script,template').remove();let md='# '+id.toUpperCase()+' — complete proposed lesson\n\nReview only. Native documents, models, professional media and response controls are retained.\n\n';
 function walk(n){if(n.type==='text')return n.data;if(n.type!=='tag')return '';let child=()=>n.children.map(walk).join('');if(/^h[1-6]$/.test(n.name))return '\n\n'+'#'.repeat(+n.name[1])+' '+d(n).text().trim()+'\n\n';if(n.name==='p')return '\n\n'+child().trim()+'\n\n';if(n.name==='li')return '\n- '+child().trim()+'\n';if(n.name==='summary')return '\n\n**Disclosure: '+d(n).text().trim()+'**\n\n';if(n.name==='button')return d(n).hasClass('vocab-term')?d(n).text():'\n[Control: '+d(n).text()+']\n';if(n.name==='textarea')return '\n[Response field]\n';if(n.name==='select')return '\n[Options: '+d(n).text().replace(/\s+/g,' ')+']\n';if(n.name==='a')return '['+d(n).text()+']('+d(n).attr('href')+')';if(n.name==='video')return '\n[Video: '+d(n).find('source').attr('src')+']\n';if(n.name==='table')return '\n\n'+d(n).find('tr').toArray().map(e=>'| '+d(e).children('td,th').toArray().map(t=>d(t).text().replace(/\s+/g,' ')).join(' | ')+' |').join('\n')+'\n\n';if(n.name==='legend'||n.name==='label'||n.name==='dt')return '\n\n**'+d(n).text().trim()+'**\n\n';return child();}
 md+=walk(d('#'+id)[0]).replace(/\n{3,}/g,'\n\n');fs.writeFileSync(path.join(root,'manuscripts',id+'.md'),md);
}
let candidate=before;for(const id of Object.keys(spec).sort((a,b)=>full('#'+b)[0].sourceCodeLocation.startOffset-full('#'+a)[0].sourceCodeLocation.startOffset)){const l=full('#'+id)[0].sourceCodeLocation;candidate=candidate.slice(0,l.startOffset)+authored[id]+candidate.slice(l.endOffset);}
// Apply the same authored clarifications to the retained career lessons and course opening.
{const $=c.load(candidate,{sourceCodeLocationInfo:true}),ids=['overview','ce1-01','ce1-02','ce1-03','ce1-04','ce1-05','ce1-06','ce1-07'];for(const id of ids.sort((a,b)=>$('#'+b)[0].sourceCodeLocation.startOffset-$('#'+a)[0].sourceCodeLocation.startOffset)){const l=$('#'+id)[0].sourceCodeLocation,html=candidate.slice(l.startOffset,l.endOffset);candidate=candidate.slice(0,l.startOffset)+jurisdictionCopy(html,id)+candidate.slice(l.endOffset);}}
candidate=candidate.replace('Version B · proposed teacher narration','Version B · course-wide teaching review').replace('Version B · revised teacher narration · revision 2','Version B · course-wide teaching review · revision 4');
candidate=candidate.replace('</head>','<link rel="stylesheet" href="./stage-headings.css">\n</head>');
fs.copyFileSync(path.join(root,'stage-headings.css'),path.join(parent,'review/b/stage-headings.css'));
candidate=candidate.replace('</head>','<link rel="stylesheet" href="./course-shell.css">\n</head>');
fs.copyFileSync(path.join(root,'course-shell.css'),path.join(parent,'review/b/course-shell.css'));
fs.writeFileSync(path.join(parent,'review/b/index.html'),candidate);
fs.writeFileSync(path.join(root,'MANIFEST.json'),JSON.stringify({revision:4,status:'course-wide-review-awaiting-choice',lessonCount:40,newlyRevised:Object.keys(spec),acceptedCareer:['ce1-01','ce1-02','ce1-04','ce1-05','ce1-06','ce1-07'],acceptedExemplar:'ce1-03',jurisdictionClarifications:'jurisdiction-copy.cjs',frozenInputSha256:sha(before),reviewBsha256:sha(candidate),canonicalWritten:false,reviewStorageNamespace:'calm10-2026-draft:career-standard-v1:b:',lessons:Object.fromEntries(Object.entries(authored).map(([id,h])=>[id,{sha256:sha(h),manuscript:'manuscripts/'+id+'.md'}]))},null,2)+'\n');
console.log('Assembled 33 remaining proposals; retained seven career lessons; wrote review B only.');
