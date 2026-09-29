// Structural guard for the authored sequence, including approved FINLIT flows. Not a release gate.
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),$=load(fs.readFileSync(root+'/workspace/index.html','utf8'));
const failures=[],check=(ok,msg)=>{if(!ok)failures.push(msg);};
const lessons=$('article[data-lesson-id]');check(lessons.length===40,'40 routes');
const ids=new Set();$('[id]').each((i,e)=>{const id=$(e).attr('id');check(!ids.has(id),'Duplicate id '+id);ids.add(id);});
lessons.each((i,e)=>{
 const l=$(e),id=l.attr('id');
 check(l.find(`[data-save-key="${id}"][data-final-field]`).length===1,id+' retained main evidence key');
 check(l.find('[data-signoff]').length===4,id+' four signoffs');
 check(l.find('[data-complete-lesson]').length===1,id+' completion action');
 check(l.find('[data-reopen-lesson]').length===1,id+' reopen action');
 check(l.find('.source-checkpoint').length===0,id+' no source prerequisite');
 if(['ce1-03','fl3-04'].includes(id)){
  check(l.children('details.finlit-reference:not([open])').length>=2,id+' collapsed references');
  for(const stage of ['opening','documents','method','worked','practice','checks','apply'])check(l.find('#'+id+'-'+stage).length===1,id+' '+stage);
  check(l.find('#'+id+'-checks [data-review-choice]').length===6,id+' six understanding checks');
  check(l.find('#'+id+'-practice .finlit-model').length===1,id+' guided model');
  check(l.find('#'+id+'-apply .finlit-model').length===1,id+' independent model');
  check(l.find('#'+id+'-apply [data-final-field]').length>0,id+' final fields beside case');
  l.find('[data-review-choice]').each((j,e)=>{const q=$(e);check(q.find('input[type=radio]').length===3,id+' three explained choices');check(q.find('[data-review-messages]').length===1,id+' choice feedback');});
  return;
 }
 check(l.children('details.source-access-card:not([open])').length===1,id+' collapsed optional reference');
 if(id==='co1-01'){check(l.find('[data-practice-id]').length===7,id+' six questions plus document check');return;}
 check(l.children('.authored-stage').length===8,id+' eight teaching stages');
 check(l.find('.authored-stage [data-question]').length===7,id+' six questions plus document check');
 check(l.find('.authored-stage-5>.authored-model').length===1,id+' guided comparison');
 check(l.find('.authored-stage-7>.authored-model').length===1,id+' independent comparison');
 check(l.find('.authored-stage-7 [data-final-field]').length>0,id+' final fields beside case');
 l.find('.authored-stage [data-question]').each((j,e)=>{const q=$(e);check(q.find('input[type=radio]').length===4,id+' four choices');check(q.find('legend').text().trim().length>8,id+' meaningful question');check(!!q.attr('data-correct'),id+' answer key');});
});
const finlit=JSON.parse(fs.readFileSync(__dirname+'/finlit-media-candidates.json')).media;
check($('video').length===23,'23 preserved lesson video placements');
for(const item of finlit){
 const target=item.lessonId==='fl3-06'?'fl3-04':item.lessonId,l=$('#'+target);
 const matches=l.find('video').filter((i,e)=>($(e).attr('src')||$(e).find('source').attr('src')||'').replace(/^\.\//,'')===item.assetPath.replace(/^\.\//,''));
 check(matches.length===1,target+' original FINLIT asset '+item.assetPath);
 if(['ce1-03','fl3-04'].includes(target))continue;
 const block=l.find('[data-finlit-integration]');
 check(block.length===1,item.lessonId+' FINLIT section');check(block.find('.finlit-check input').length===3,item.lessonId+' three media check choices');check(l.find('.finlit-connection').length===3,item.lessonId+' example practice and final connections');check(block.find('[data-final-field]').length===0,item.lessonId+' media check remains practice');
}
check($('#fl3-04-compounding [data-final-field]').length===0,'compounding investigation optional');
check($('#fl2-01-finlit-inquiry [data-final-field]').length===0,'borrowing investigation optional');
for(const id of ['co1-01','fl1-01','fl1-05','fl2-05'])check($('#'+id+'-finlit-activity').length===0,id+' mismatched PDF task removed');
check($('#fl4-02-finlit-classify [data-review-choice]').length===3,'three supplied fraud mechanisms');
check($('#fl4-05-cra-reading').length===1,'CRA guidance beside Nico');
check($('a[href*="finlit-compounding.pdf"]').length>0,'compounding original available');
check($('a[href*="finlit-decision-steps.pdf"]').length>0,'decision original available');
const report={passed:!failures.length,scope:'Authored static lesson structure only; no LMS, accessibility or Studio certification',lessonCount:lessons.length,failures};
fs.writeFileSync(__dirname+'/implementation/structure-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
