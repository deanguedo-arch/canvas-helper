const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),c=require('cheerio');
const root=__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(fs.readFileSync(path.join(root,'BASELINE.json')));
for(const [name,hash] of Object.entries(baseline.files))assert.equal(sha(fs.readFileSync(path.join(baseline.canonicalWorkspace,name))),hash,'Canonical file changed: '+name);
const original=fs.readFileSync(path.join(root,'baseline/index.html'),'utf8'),oldArticle=fs.readFileSync(path.join(root,'baseline/ce1-03.html'),'utf8'),proposed=fs.readFileSync(path.join(root,'lesson-b.html'),'utf8');
const old=c.load(oldArticle,{sourceCodeLocationInfo:true}),fresh=c.load(proposed,{sourceCodeLocationInfo:true});
const raws=(text,$,selector)=>$(selector).toArray().map(e=>{const l=e.sourceCodeLocation;return text.slice(l.startOffset,l.endOffset)});
const preserved={};
for(const selector of ['input','textarea','select','fieldset','template','video','.finlit-document','.finlit-route-pair','.finlit-signoff','.finlit-completion','.student-instructions']){
 const a=raws(oldArticle,old,selector),b=raws(proposed,fresh,selector);assert.deepEqual(b,a,'Changed original '+selector);preserved[selector]=a.length;
}
const oldModel=raws(oldArticle,old,'#ce1-03-apply > .finlit-model')[0];assert.equal(raws(proposed,fresh,'#ce1-03-apply > .finlit-model')[0],oldModel.replace('six-month preference','preference of eight months or less').replace('I would keep D as a longer-term backup only if Owen completes the extra course, can cover the cost gap and accepts the longer time.','Choosing C gives Owen the shorter route within his listed-cost limit, but he gives up the diploma’s added exhibit-research work and longer projects. I would keep D as a longer-term backup only if Owen completes the extra course, can cover the cost gap and accepts the longer time.'));
const attrs=($,name)=>$('['+name+']').map((i,e)=>$(e).attr(name)).get();
for(const attr of ['id','data-canvas-helper-edit-key']){
 const a=attrs(old,attr),b=attrs(fresh,attr);a.forEach(x=>assert.ok(b.includes(x),'Lost '+attr+' '+x));assert.equal(new Set(b).size,b.length,'Duplicate '+attr);
}
assert.equal(fresh('details.lesson-vocabulary-help dt').length,4);assert.equal(fresh('details.lesson-vocabulary-help dd').length,4);
assert.equal(fresh('#ce1-03-foundations').find('details,input,textarea,select').length,0);
assert.ok(fresh('#ce1-03-foundations')[0].sourceCodeLocation.endOffset<fresh('fieldset')[0].sourceCodeLocation.startOffset);
const all=c.load(original);
fresh('.vocab-term').each((i,e)=>assert.equal(all('[data-word-view="'+fresh(e).attr('data-vocab-term')+'"]').length,1));
for(const v of ['a','b']){
 const text=fs.readFileSync(path.join(root,'review',v,'index.html'),'utf8'),review=c.load(text,{sourceCodeLocationInfo:true});
 assert.equal(raws(text,review,'#ce1-03')[0],v==='a'?oldArticle:proposed,'Rendered lesson differs from author fragment');
 const oldDOM=c.load(original);oldDOM('article[data-lesson-id]').each((i,e)=>{const id=oldDOM(e).attr('id');if(id!=='ce1-03')assert.equal(review('#'+id).html(),oldDOM(e).html(),'Other lesson changed: '+id)});
 for(const el of review('script[src]').toArray()){
  const name=review(el).attr('src').replace('./',''),src=fs.readFileSync(path.join(root,'baseline',name),'utf8'),actual=fs.readFileSync(path.join(root,'review',v,name),'utf8');
  assert.equal(actual,src.replaceAll('calm10-2026-draft:',`calm10-2026-draft:ce1-03-teacher-v1:${v}:`),'Runtime derivative drift '+name);
 }
 const ids=attrs(review,'id');assert.equal(new Set(ids).size,ids.length,'Repeated full-page ID');
}
assert.equal(300+200+120*4,980);assert.equal(1400-980,420);assert.equal(1600+250+80*10,2650);assert.equal(2650-1400,1250);assert.equal(900+150+60*6,1410);assert.equal(1800+300+50*12,2700);
const report={status:'pass',canonicalRootFilesUnchanged:Object.keys(baseline.files).length,otherLessonsUnchanged:39,exactManuscriptFragmentInReview:true,preserved,allExistingIdsAndEditKeysRetained:true,vocabularyEntries:4,runtimeChanges:'Only delivery namespace prefixes',arithmeticChecked:true};
fs.writeFileSync(path.join(root,'source-checks.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
