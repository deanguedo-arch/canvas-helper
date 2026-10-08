const fs=require('fs'),path=require('path'),assert=require('assert/strict'),c=require('cheerio'),crypto=require('crypto');
const jurisdictionCopy=require('./jurisdiction-copy.cjs');
const root=__dirname,parent=path.dirname(root),m=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST.json'))),base=JSON.parse(fs.readFileSync(path.join(parent,'BASELINE.json'))),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const before=fs.readFileSync(path.join(root,'accepted-career-review-index.html'),'utf8'),after=fs.readFileSync(path.join(parent,'review/b/index.html'),'utf8'),a=c.load(before,{sourceCodeLocationInfo:true}),b=c.load(after,{sourceCodeLocationInfo:true});
for(const [f,h]of Object.entries(base.files))assert.equal(sha(fs.readFileSync(path.join(base.canonicalWorkspace,f))),h,'Canonical changed '+f);
const raw=(html,$,selector)=>$(selector).toArray().map(e=>html.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset));
for(const selector of ['script','video','source','track','iframe'])assert.deepEqual(raw(after,b,selector),raw(before,a,selector),'Course media/runtime changed '+selector);
assert.deepEqual(raw(after,b,'link:not([href="./stage-headings.css"]):not([href="./course-shell.css"])'),raw(before,a,'link'),'Existing styles changed');
assert.equal(b('link[href="./stage-headings.css"]').length,1,'Missing stage-heading presentation');
assert.equal(b('link[href="./course-shell.css"]').length,1,'Missing course-shell presentation');
const report={status:'pass',revision:m.revision,canonicalFilesUnchanged:Object.keys(base.files).length,runtimeAndMediaUnchanged:true,reviewSha256:sha(after),lessons:{}};
for(const id of m.newlyRevised){const ah=fs.readFileSync(path.join(root,id+'-before.html'),'utf8'),bh=fs.readFileSync(path.join(root,'manuscripts',id+'.html'),'utf8'),x=c.load(ah,{sourceCodeLocationInfo:true}),y=c.load(bh,{sourceCodeLocationInfo:true});
 assert.equal(raw(after,b,'#'+id)[0],bh,'Manuscript preview mismatch '+id);
 for(const selector of ['input','textarea','select','button:not(.vocab-term)','table','.authored-hint','details.lesson-vocabulary-help']){
  const expected=selector==='table'&&id==='fl4-04'?(()=>{const h=jurisdictionCopy(ah,id);return raw(h,c.load(h,{sourceCodeLocationInfo:true}),selector);})():raw(ah,x,selector);
  assert.deepEqual(raw(bh,y,selector),expected,'Protected task changed '+id+' '+selector);
 }
 for(const attr of ['id','data-save-key','data-task-version','data-canvas-helper-edit-key']){const old=x('['+attr+']').map((i,e)=>x(e).attr(attr)).get(),next=y('['+attr+']').map((i,e)=>y(e).attr(attr)).get();for(const v of old)assert.ok(next.includes(v),'Lost '+id+' '+attr+' '+v);if(['id','data-canvas-helper-edit-key'].includes(attr))assert.equal(next.length,new Set(next).size,'Duplicate '+id+' '+attr);}
 let models=raw(ah,x,'.authored-model');if(id==='fl4-04')models=models.map(h=>h.replace('Mina can decline the $157.50 total because the price exceeds the intended budget, or decide it is acceptable and choose to purchase; no budget or competing offer is supplied, so neither choice is forced.','Mina can decline the disclosed $157.50 total or decide it is acceptable and choose to purchase. No budget limit or competing offer is supplied, so neither choice is forced.'));
 assert.deepEqual(raw(bh,y,'.authored-model'),models,'Model changed '+id);
 y('.vocab-term').each((i,e)=>{assert.equal(b('[data-word-view="'+y(e).attr('data-vocab-term')+'"]').length,1,'Glossary target '+id);assert.equal(y(e).find('button').length,0,'Nested word control '+id);});
 const orientation=y('#'+id+'-foundations >p').not('.section-label').slice(0,4).text();assert.match(orientation,/In this lesson/);assert.match(orientation,/First|first/);assert.match(orientation,/final/i);
 report.lessons[id]={taskControlsPreserved:true,idsAndEditKeysPreserved:true,modelsPreserved:id==='fl4-04'?'except logged unsupported-budget correction':true,manuscriptMatchesPreview:true};
}
for(const id of [...m.acceptedCareer,m.acceptedExemplar])assert.deepEqual(raw(after,b,'#'+id),raw(before,a,'#'+id).map(h=>jurisdictionCopy(h,id)),'Accepted career changed beyond authored jurisdiction clarifications '+id);
assert.ok(!b('#co1-03-stage-5').text().includes('My practice answer'),'Phantom field remains');assert.ok(!b('#fl4-04-stage-5').text().includes('exceeds the intended budget'),'Unstated budget remains');assert.ok(b('[data-canvas-helper-edit-key="fl2-01-course-changed-allowance"]').length===1,'Practice premise not visible');
fs.writeFileSync(path.join(root,'source-checks.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS: 33 proposals match manuscripts; career changes match authored jurisdiction clarifications; task controls, media and 32 canonical files preserved.');
