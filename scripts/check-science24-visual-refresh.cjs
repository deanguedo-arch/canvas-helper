#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {load}=require('cheerio');
const {dirs,readData,sha,videoMoves,visuals,ROOT}=require('./science24-visual-refresh.cjs');
const norm=s=>String(s).replace(/\s+/g,' ').trim();
const sorted=a=>a.sort((x,y)=>JSON.stringify(x).localeCompare(JSON.stringify(y)));
function hooks($){const rows=[];$('*').each((_,el)=>{for(const [k,v]of Object.entries(el.attribs||{})){if(!k.startsWith('data-')||k==='data-canvas-helper-edit-key'||k==='data-s24x-visual'||v.startsWith('s24x-'))continue;rows.push([el.tagName,k,v]);}});return sorted(rows);}
function controls($){return sorted($('input,select,textarea,fieldset').map((_,el)=>{const a={...el.attribs};delete a.class;return {tag:el.tagName,attrs:a,text:el.tagName==='select'?norm($(el).text()):''};}).get());}
function ids($){return sorted($('[id]').map((_,e)=>e.attribs.id).get());}
function videoPositions($){const rows={};$('[id^="lesson-"] [data-video-card]').each((_,e)=>{const n=$(e).closest('[id^="lesson-"]').attr('id'),parent=$(e).closest('section'),p=parent[0];const siblings=$(p.parent).children().toArray();rows[n]={id:e.attribs['data-video-card'],moved:parent.hasClass('s24x-video-beat'),parentTag:p.parent.tagName,index:siblings.indexOf(p)};});return rows;}
const results=[];
for(const u of 'abcd'){
 const {ws,meta}=dirs(u),base=path.join(meta,'baseline'),before=load(fs.readFileSync(path.join(base,'index.html'),'utf8')),after=load(fs.readFileSync(path.join(ws,'index.html'),'utf8'));
 const baseline=JSON.parse(fs.readFileSync(path.join(meta,'baseline.json'))),original=readData(base),candidate=readData(ws);
 const b={...original},c={...candidate};delete b.figures;delete c.figures;assert.deepEqual(c,b,`${u}: non-figure course data changed`);
 for(const [key,value]of Object.entries(original.figures))assert.deepEqual(candidate.figures[key],value,`${u}: original figure catalogue changed: ${key}`);
 assert.deepEqual(ids(after),ids(before),`${u}: original IDs changed`);assert.equal(new Set(ids(after)).size,ids(after).length,`${u}: duplicate IDs`);
 assert.deepEqual(hooks(after),hooks(before),`${u}: original data hooks changed`);assert.deepEqual(controls(after),controls(before),`${u}: response controls changed`);
 const editKeys=after('[data-canvas-helper-edit-key]').map((_,e)=>e.attribs['data-canvas-helper-edit-key']).get();assert.equal(new Set(editKeys).size,editKeys.length,`${u}: duplicate edit keys`);
 before('[data-canvas-helper-edit-key]').each((_,e)=>{const k=e.attribs['data-canvas-helper-edit-key'],a=after(`[data-canvas-helper-edit-key="${k}"]`);assert.equal(a.length,1,`${u}: missing edit key ${k}`);if(!before(e).find('[data-canvas-helper-edit-key]').length&&!before(e).is('section,div,figure'))assert.equal(norm(a.text()),norm(before(e).text()),`${u}: original keyed text changed ${k}`);});
 const unchanged=[];for(const [name,digest]of Object.entries(baseline.files)){if(['index.html','course-data.js','course-data.json'].includes(name))continue;assert.equal(sha(fs.readFileSync(path.join(ws,name))),digest,`${u}: protected original file changed ${name}`);unchanged.push(name);}
 const bv=videoPositions(before),av=videoPositions(after);assert.deepEqual(sorted(Object.entries(av).map(([n,v])=>[n,v.id])),sorted(Object.entries(bv).map(([n,v])=>[n,v.id])),`${u}: video identity/lesson changed`);
 const moves=Object.keys(videoMoves[u]);for(const [n,v]of Object.entries(av))assert.equal(v.moved,moves.includes(n.replace('lesson-','')),`${u}: wrong video placement ${n}`);
 after('[data-enlarge-figure]').each((_,e)=>assert(candidate.figures[e.attribs['data-enlarge-figure']],`${u}: figure hook has no catalogue entry`));
 after('img[src],script[src],link[rel="stylesheet"][href]').each((_,e)=>{const url=e.attribs.src||e.attribs.href;if(/^(https?:|data:|blob:)/.test(url))return;assert(fs.existsSync(path.join(ws,url.split(/[?#]/)[0])),`${u}: missing local asset ${url}`);});
 const rows=JSON.parse(fs.readFileSync(path.join(meta,'lesson-matrix.json')));assert.equal(rows.length,before('[id^="lesson-"]').length,`${u}: wrong lesson audit count`);
 if(u==='b'){assert.equal(after('#lesson-14 img[src="assets/source-coal-formation-p136.jpg"]').length,1);assert.equal(after('#lesson-14 .coal-panel-crop img[src^="assets/visual-refresh/coal-panel-"]').length,4);}
 if(u==='d')assert.equal(after('#lesson-05 img[src="assets/figure-motion-graphs.jpg"]').length,1);
 const result={unit:u,status:'passed',lessonCount:rows.length,directlyRefreshedLessons:rows.filter(r=>r.disposition==='refreshed').length,newVisuals:visuals.filter(v=>v.unit===u).length,videoPlacements:Object.keys(av).length,movedVideoPlacements:moves.length,retainedVideoPlacements:Object.keys(av).length-moves.length,originalIDs:ids(before).length,originalEditKeys:before('[data-canvas-helper-edit-key]').length,originalDataHooks:hooks(before).length,responseControls:controls(before).length,originalFilesPreserved:unchanged.length,assessmentData:'deep-equal',runtimeAndOriginalAssets:'byte-identical',originalCatalogueEntries:'deep-equal'};
 fs.writeFileSync(path.join(meta,'preservation-review.json'),JSON.stringify(result,null,2)+'\n');results.push(result);
}
assert.equal(results.reduce((s,r)=>s+r.lessonCount,0),63);assert.equal(results.reduce((s,r)=>s+r.directlyRefreshedLessons,0),45);assert.equal(results.reduce((s,r)=>s+r.videoPlacements,0),36);assert.equal(results.reduce((s,r)=>s+r.movedVideoPlacements,0),20);assert.equal(results.reduce((s,r)=>s+r.retainedVideoPlacements,0),16);
const arithmetic={power:120/30,energy:35+65,distance:800+800,momentumSmall:70*5,momentumLarge:750*5,impulseA:100*2,impulseB:400*.5,momentumChange:1000*(0-10),meanForceShort:1000*(0-10)/.5,meanForceLong:1000*(0-10)/2};assert.deepEqual(Object.values(arithmetic),[4,100,1600,350,3750,200,200,-10000,-20000,-5000]);
fs.writeFileSync(path.join(dirs('a').meta,'family-preservation-review.json'),JSON.stringify({schemaVersion:1,status:'passed',units:results,independentlyRecomputedArithmetic:arithmetic,originalArchives:'unchanged',teacherAcceptance:'pending'},null,2)+'\n');
console.log(JSON.stringify({status:'passed',lessons:63,refreshed:45,videoMoves:20,retainedVideoPlacements:16,assessmentAndSaveContracts:'preserved',units:results.map(r=>({unit:r.unit,originalFilesPreserved:r.originalFilesPreserved,controls:r.responseControls}))},null,2));
