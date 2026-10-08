const fs=require('fs'),path=require('path'),assert=require('assert/strict'),c=require('cheerio');
const dir=__dirname,workspace=path.resolve(dir,'../../../workspace');
const before=fs.readFileSync(dir+'/before/index.html','utf8'),after=fs.readFileSync(workspace+'/index.html','utf8');
const $b=c.load(before,{sourceCodeLocationInfo:true}),$a=c.load(after,{sourceCodeLocationInfo:true});let assertions=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);assertions++;};
const attrs=['id','name','type','step','min','max','data-save-key','data-task-version','data-answer','data-tolerance','data-final-field','data-lesson-evidence','data-signoff','value','required'];
const values=($,field)=>Object.fromEntries(attrs.filter(a=>$(field).attr(a)!==undefined).map(a=>[a,$(field).attr(a)]));
$b('[data-save-key]').each((_,field)=>{const f=$b(field),key=f.attr('data-save-key');const next=$a(`[data-save-key="${key}"]`).filter((_,candidate)=>!f.is('[type=radio]')||($a(candidate).attr('value')===f.attr('value')&&$a(candidate).attr('name')===f.attr('name')));eq(next.length,1,'Field exists '+key);eq(values($a,next[0]),values($b,field),'Stable field '+key);if(f.is('select'))eq(next.find('option').map((_,o)=>[$a(o).attr('value'),$a(o).text()]).get(),f.find('option').map((_,o)=>[$b(o).attr('value'),$b(o).text()]).get(),'Options '+key);});
const pilot=($,s)=>{const loc=$('#fl2-03')[0].sourceCodeLocation;return s.slice(loc.startOffset,loc.endOffset)};eq(pilot($a,after),pilot($b,before),'FL2-03 exact reviewed article');
const media=$=>$('video,video source,track,iframe').map((_,e)=>({tag:e.tagName,attrs:e.attribs})).get();eq(media($a),media($b),'All professional media unchanged');
const oldLinks=$=>$('a[href]').map((_,e)=>$(e).attr('href')).get();const available=oldLinks($a);for(const href of oldLinks($b)){let i=available.indexOf(href);assert(i>=0,'Old link retained '+href);available.splice(i,1);assertions++;}
eq($a('#historical-task-registry').text(),$b('#historical-task-registry').text(),'History registry');
eq($a('template[data-learning-support]').length,39,'39 adapted lessons');let controls=0;
$a('template[data-learning-support]').each((_,t)=>{const root=$a(t).parent(),data=JSON.parse($a(t).text());eq(root.find(`[data-save-key="${data.firstKey}"]`).length,1,'First-copy field');data.items.forEach((item,i)=>{controls++;eq(root.find(`[data-support-item="${i}"]`).length,1,'Control '+item.key);eq(root.find(`[data-save-key="${item.attempt}"]`).length,1,'Attempt '+item.key);for(const fid of item.fields||[item.field].filter(Boolean))eq(root.find(`[id="${fid}"]`).length,1,'Field '+fid);if(item.output)eq(root.find(`[id="${item.output}"]`).length,1,'Feedback '+item.key);assert(Object.values(item.hints).every(h=>h&&h.trim()),'Hints present');assertions++;});});
eq(controls,396,'396 support controls');
const report={assertions,lessons:39,controls,videoCount:$a('video').length,historyRegistryUnchanged:true,existingFieldContractsUnchanged:true,pilotUnchanged:true};fs.writeFileSync(dir+'/compatibility.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
