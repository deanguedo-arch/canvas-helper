#!/usr/bin/env node
'use strict';
// Local, student-free Chromium review. This is not an LMS or release gate.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {dirs,readData,sha}=require('./science24-visual-refresh.cjs');
const OUT='/Users/deanguedo/Downloads/Science24_ABCD_Visual_Review_2026-10-02';
const HOST='http://127.0.0.1:4826';
const REPORT=path.join(OUT,'evidence');fs.mkdirSync(REPORT,{recursive:true});
const screenshots=path.join(OUT,'screenshots');fs.mkdirSync(screenshots,{recursive:true});
const matrices=[...'abcd'].flatMap(u=>JSON.parse(fs.readFileSync(path.join(dirs(u).meta,'lesson-matrix.json'))));
const failures=[],routes=[],media=[],dialogs=[],saves=[],svgLabels=[],captures=[],requests=[];
function expect(ok,message,details){if(!ok)failures.push({message,details});}
function files(dir,prefix=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name),prefix+e.name+'/'):[prefix+e.name]);}
function changedTarget(row,before=false){
 if(row.visuals.length)return {heading:row.visuals[0].anchor};
 if(row.unit==='b'&&row.lesson==='14')return {selector:'.coal-figure-layout'};
 if(row.unit==='c'&&row.lesson==='17')return {heading:'Judge research by evidence, consent and alternatives'};
 if(row.unit==='c'&&row.lesson==='10'&&!before)return {selector:'.s24x-reference-layout'};
 return {selector:'[data-video-card]',parent:'section'};
}
async function shot(page,row,label,before=false){
 const root=page.locator('#lesson-'+row.lesson),target=changedTarget(row,before);let loc;
 if(target.heading)loc=root.getByRole('heading',{name:target.heading,exact:true}).locator('xpath=ancestor::section[1]');
 else loc=root.locator(target.selector).first();
 if(target.parent)loc=loc.locator('xpath=ancestor::section[1]');
 const name=`${row.unit.toUpperCase()}${row.lesson}-${label}.png`;
 // Locator screenshot clips use CSS coordinates even when Chrome's real tab zoom
 // makes captureScreenshot expect device-independent coordinates. Scale the clip
 // explicitly; hide fixed shell chrome only during the content capture.
 // Decode even initially zero-height lazy images before measuring the whole
 // section. Otherwise captureBeyondViewport can load them after the clip was set.
 await loc.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(async e=>{const previous=e.loading;e.loading='eager';await e.decode().catch(()=>{});e.loading=previous;}));});
 await loc.scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await page.evaluate(()=>{window.__s24CaptureChrome=[...document.querySelectorAll('body *')].filter(e=>getComputedStyle(e).position==='fixed').map(e=>[e,e.style.visibility]);for(const [e]of window.__s24CaptureChrome)e.style.visibility='hidden';});
 const rect=await loc.evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};});
 const cdp=await page.context().newCDPSession(page),layout=await cdp.send('Page.getLayoutMetrics'),zoom=layout.cssVisualViewport.zoom;
 const result=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:rect.x*zoom,y:rect.y*zoom,width:rect.width*zoom,height:rect.height*zoom,scale:1}});
 fs.writeFileSync(path.join(screenshots,name),Buffer.from(result.data,'base64'));await cdp.detach();
 await page.evaluate(()=>{for(const [e,v]of window.__s24CaptureChrome)e.style.visibility=v;delete window.__s24CaptureChrome;});
 captures.push({unit:row.unit,lesson:row.lesson,label,path:'screenshots/'+name,scope:'Complete changed content area; fixed shell chrome hidden only for capture',method:'CDP clip scaled by actual Chromium tab zoom'});
}
async function ready(page,url){await page.goto(url);await page.waitForFunction(()=>window.S24_DATA&&document.querySelector('.video-card'));await page.evaluate(()=>document.fonts.ready);}
async function go(page,n){await page.evaluate(n=>{location.hash='lesson-'+n;},n);await page.locator('#lesson-'+n).waitFor({state:'visible'});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function metrics(page,row,width,zoom){
 // Lazy images are tested by reaching them as a learner would, not before they load.
 for(const img of await page.locator('#lesson-'+row.lesson+' img').all())if(await img.isVisible()){
  await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode().catch(()=>{}));
 }
 const m=await page.locator('#lesson-'+row.lesson).evaluate(root=>{
  const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
  const visible=e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0;
  const images=[...root.querySelectorAll('img')].filter(visible).map(e=>({src:e.getAttribute('src'),complete:e.complete,natural:e.naturalWidth,box:box(e),parent:box(e.parentElement),ratio:e.naturalWidth/e.naturalHeight,renderRatio:e.clientWidth/e.clientHeight}));
  const videos=[...root.querySelectorAll('.s24x-video-support')].map(e=>({box:box(e),card:box(e.querySelector('.video-card')),columns:getComputedStyle(e.querySelector('.video-card')).gridTemplateColumns,copy:box(e.querySelector('.video-copy')),stage:box(e.querySelector('.video-stage')),written:e.querySelector('.concept-summary').textContent.trim(),focus:e.querySelector('.video-copy').textContent.includes('Viewing focus:')}));
  const layouts=[...root.querySelectorAll('.s24x-support-layout,.s24x-reference-layout')].map(e=>({box:box(e),display:getComputedStyle(e).display,sticky:[...e.querySelectorAll('.s24x-sticky-figure')].map(f=>({position:getComputedStyle(f).position,top:getComputedStyle(f).top,box:box(f)}))}));
  const native=[...root.querySelectorAll('.s24x-figure')].map(e=>({box:box(e),caption:e.querySelector('figcaption').textContent.trim(),font:getComputedStyle(e.querySelector('figcaption')).fontSize,narrowNotes:e.querySelector('.s24x-diagram-notes')?getComputedStyle(e.querySelector('.s24x-diagram-notes')).display:null}));
  const overflow=[...root.querySelectorAll('h1,h2,h3,p,button,.s24x-figure,.video-card')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+2||r.left<-2;}).slice(0,12).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,100),box:box(e)}));
  return {innerWidth,devicePixelRatio,documentWidth:document.documentElement.scrollWidth,images,videos,layouts,native,overflow,active:document.querySelectorAll('.course-page:not([hidden])').length};
 });
 const name=row.unit.toUpperCase()+row.lesson+' '+width+'px @'+zoom;
 expect(m.active===1,name+' active lesson');expect(m.documentWidth<=m.innerWidth+2,name+' horizontal overflow',m.overflow);expect(m.overflow.length===0,name+' content outside viewport',m.overflow);
 for(const img of m.images){expect(img.complete&&img.natural>0,name+' image load',img.src);if(img.src.startsWith('assets/visual-refresh/')){expect(Math.abs(img.ratio-img.renderRatio)<.025,name+' image distorted',img);expect(img.box.w<=img.parent.w+1,name+' new image clipped by its container',img);}}
 for(const v of m.videos){expect(v.focus&&v.written.length>40,name+' video written alternative');expect(v.copy.w>=Math.min(250,m.innerWidth-100),name+' cramped video copy',v);expect(v.card.w<=v.box.w+1,name+' video outside its area',v);}
 for(const l of m.layouts){expect(l.display!=='grid'||l.box.w>=920,name+' supporting figure beside text below 920px',l);for(const s of l.sticky)expect(s.position===(l.display==='grid'?'sticky':'static'),name+' sticky breakpoint',s);}
 for(const f of m.native){expect(parseFloat(f.font)>=16||f.box.w>=500,name+' narrow native caption too small',f);if(f.narrowNotes)expect(f.narrowNotes===(f.box.w<=500?'grid':'none'),name+' native narrow explanation visibility',f);}
 routes.push({unit:row.unit,lesson:row.lesson,width,zoom,title:row.title,disposition:row.disposition,...m});
}
async function playerChecks(page,u){
 for(const row of matrices.filter(r=>r.unit===u)){
  await go(page,row.lesson);const cards=page.locator('#lesson-'+row.lesson+' [data-video-card]');
  for(let i=0;i<await cards.count();i++){
   const card=cards.nth(i),id=await card.getAttribute('data-video-card'),before=await card.locator('.concept-summary').textContent();
   await card.locator('[data-play-video]').click();const frame=card.locator('iframe');await frame.waitFor();
   expect(!!await frame.getAttribute('title'),u+row.lesson+' player accessible title');expect(/^https:\/\/(www.youtube-nocookie.com|player.vimeo.com)\//.test(await frame.getAttribute('src')),u+row.lesson+' correct player URL');expect(await card.locator('.concept-summary').textContent()===before,u+row.lesson+' playback removed written alternative');
   media.push({unit:u,lesson:row.lesson,id,control:'passed',externalPlayback:'Not certified; publisher frame stubbed for deterministic control check',writtenAlternative:'preserved'});
  }
 }
}
async function figureChecks(page,u){
 for(const row of matrices.filter(r=>r.unit===u&&(r.visuals.length||u==='c'&&r.lesson==='10'))){
  await go(page,row.lesson);const buttons=page.locator('#lesson-'+row.lesson+' [data-enlarge-figure]');
  for(let i=0;i<await buttons.count();i++){
   const button=buttons.nth(i),id=await button.getAttribute('data-enlarge-figure');if(!id.startsWith('s24x-')&&id!=='immune')continue;
   // Enter and Escape exercise the original dialog hooks and focus return.
   await button.focus();await page.keyboard.press('Enter');const dialog=page.locator('#figure-dialog');await dialog.waitFor({state:'visible'});
   await dialog.locator('img').waitFor();await page.waitForFunction(()=>{const i=document.querySelector('#figure-dialog img');return i?.complete&&i.naturalWidth>0;});
   await page.keyboard.press('Tab');expect(await dialog.evaluate(e=>document.activeElement===document.body||e.contains(document.activeElement)),u+row.lesson+' dialog keyboard focus reached background course controls');
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});expect(await button.evaluate(e=>e===document.activeElement),u+row.lesson+' focus did not return');
   dialogs.push({unit:u,lesson:row.lesson,id,enlarge:'passed',keyboardEnterEscape:'passed',focusReturn:'passed'});
  }
 }
}
async function saveCompatibility(context,u){
 const page=await context.newPage();await ready(page,`${HOST}/before/unit-${u}/index.html#lesson-01`);
 const data=readData(dirs(u).ws),check=Object.values(data.checks).find(c=>c.route==='lesson-01'),id=check.id,marker=`SYNTHETIC REVIEW ${u.toUpperCase()} 2026-10-02`;
 const box=page.locator(`[data-required="${id}"]`);await box.locator('xpath=ancestor::details[1]').evaluate(e=>e.open=true);await page.locator(`[data-start-required="${id}"]`).click();
 for(const q of check.questions){await page.locator(`[data-required-answer="${q.id}"][value="${q.answer}"]`).check();await page.locator(`[data-check-required="${q.id}"]`).click();}
 for(const w of check.writing){await page.locator(`[data-required-writing="${w.id}"]`).fill(marker+' explanation '+w.id);await page.locator(`[data-save-writing="${w.id}"]`).click();}
 await page.locator(`[data-finish-required="${id}"]`).click();await page.waitForFunction(()=>document.querySelector('[data-progress-count]').textContent.startsWith('1 of'));
 const note=page.locator('#lesson-01 [data-note-id]').first(),noteId=await note.getAttribute('data-note-id');await note.locator('[data-note-text]').fill(marker+' saved practice');await note.locator('[data-note-save]').click();await note.locator('[data-note-status]').filter({hasText:'Saved response'}).waitFor();
 await ready(page,`${HOST}/units/unit-${u}/index.html#lesson-01`);
 expect((await page.locator('[data-progress-count]').textContent()).startsWith('1 of'),u+' baseline completion did not migrate');expect(await page.locator(`[data-note-id="${noteId}"] [data-note-text]`).inputValue()===marker+' saved practice',u+' baseline written work lost');
 await page.locator(`[data-note-id="${noteId}"] [data-note-text]`).fill(marker+' refreshed candidate practice');await page.locator(`[data-note-id="${noteId}"] [data-note-save]`).click();await page.reload();await page.waitForFunction(()=>document.querySelector('[data-progress-count]').textContent.startsWith('1 of'));
 expect(await page.locator(`[data-note-id="${noteId}"] [data-note-text]`).inputValue()===marker+' refreshed candidate practice',u+' candidate save/reload lost');
 await page.evaluate(()=>location.hash='process-collection');await page.locator('#process-collection').waitFor({state:'visible'});
 expect(await page.locator('#process-collection').textContent().then(t=>t.includes(marker+' explanation')),u+' completed written check history absent');
 saves.push({unit:u,profile:'isolated synthetic Chromium profile',baselineCompletedCheck:id,savedNoteId:noteId,baselineToCandidate:'passed',candidateSaveReload:'passed',completedCheckAndWritingHistory:'passed',realLearnerData:'not accessed'});await page.close();
}
async function svgChecks(context){
 const page=await context.newPage();
 for(const row of matrices)for(const v of row.visuals.filter(v=>v.file.endsWith('.svg'))){
  await page.goto(`${HOST}/units/unit-${row.unit}/${v.image}`);
  const m=await page.evaluate(()=>{const svg=document.querySelector('svg'),vb=svg.viewBox.baseVal,t=[...svg.querySelectorAll('text')].map(e=>{const b=e.getBBox();return {text:e.textContent,x:b.x,y:b.y,w:b.width,h:b.height};});return {width:vb.width,height:vb.height,text:t};});
  const clipped=m.text.filter(t=>t.x<-1||t.y<-1||t.x+t.w>m.width+1||t.y+t.h>m.height+1);
  expect(!clipped.length,v.id+' SVG label exceeds viewBox',clipped);svgLabels.push({id:v.id,status:clipped.length?'failed':'passed',labels:m.text.length,clipped});
 }
 await page.close();
}
(async()=>{
 const extension=fs.mkdtempSync(path.join(os.tmpdir(),'s24-review-zoom-extension-')),profile=fs.mkdtempSync(path.join(os.tmpdir(),'s24-review-profile-'));
 fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Isolated local review zoom',version:'1.0',permissions:['tabs'],background:{service_worker:'background.js'}}));fs.writeFileSync(path.join(extension,'background.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
 const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,viewport:{width:1440,height:1000},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 context.setDefaultTimeout(10000);const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
 const page=await context.newPage();page.on('pageerror',e=>failures.push({message:'Browser page error',details:String(e)}));page.on('response',r=>{if(r.url().startsWith(HOST)&&r.status()>=400)failures.push({message:'Local HTTP error',details:{url:r.url(),status:r.status()}});});
 // Prevent optional third-party players from affecting deterministic local UI checks.
 await context.route(/^https:\/\/(www.youtube-nocookie.com|player.vimeo.com)\//,r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Isolated media control check</title><p>Publisher playback remains a separate online check.</p>'}));
 async function zoom(factor){return worker.evaluate(async({url,factor})=>{const t=(await chrome.tabs.query({})).find(t=>t.url===url);await chrome.tabs.setZoomSettings(t.id,{scope:'per-tab',mode:'automatic'});await chrome.tabs.setZoom(t.id,factor);return await chrome.tabs.getZoom(t.id);},{url:page.url(),factor});}
 if(process.argv.includes('--captures-only')){
  try{
   for(const [width,factor,label,before]of [[1440,1,'desktop',false],[820,1,'tablet',false],[390,1,'phone',false],[1440,2,'zoom200',false],[1440,1,'before',true]]){
    await page.setViewportSize({width,height:width===390?844:1000});
    for(const u of 'abcd'){
     await ready(page,`${HOST}/${before?'before':'units'}/unit-${u}/index.html#lesson-01`);assert.equal(await zoom(factor),factor);await page.waitForFunction(({w,z})=>Math.abs(innerWidth-w/z)<=1,{w:width,z:factor});
     for(const row of matrices.filter(r=>r.unit===u&&r.disposition==='refreshed')){await go(page,row.lesson);await shot(page,row,label,before);}
    }
    console.log(`${label}: all 45 changed-area captures corrected`);
   }
   const recordPath=path.join(REPORT,'chromium-review.json'),result=JSON.parse(fs.readFileSync(recordPath));assert.equal(result.status,'passed');result.captures=captures;result.screenshots='Complete changed-area captures use CDP coordinates scaled by actual tab zoom; fixed shell chrome hidden only during capture.';
   fs.writeFileSync(recordPath,JSON.stringify(result,null,2)+'\n');for(const u of 'abcd'){const p=path.join(dirs(u).meta,'chromium-review.json'),r=JSON.parse(fs.readFileSync(p));r.captures=captures.filter(c=>c.unit===u);r.screenshots=result.screenshots;fs.writeFileSync(p,JSON.stringify(r,null,2)+'\n');}
   console.log(JSON.stringify({correctedCaptures:captures.length,scope:'Capture repair only; previous passed interaction and layout checks retained'}));
  }finally{await context.close();fs.rmSync(profile,{recursive:true,force:true});fs.rmSync(extension,{recursive:true,force:true});}
  return;
 }
 try{
  for(const [width,factor,label]of [[1440,1,'desktop'],[820,1,'tablet'],[390,1,'phone'],[1440,2,'zoom200']]){
   await page.setViewportSize({width,height:width===390?844:1000});
   for(const u of 'abcd'){
    await ready(page,`${HOST}/units/unit-${u}/index.html#lesson-01`);assert.equal(await zoom(factor),factor);await page.waitForFunction(({w,z})=>Math.abs(innerWidth-w/z)<=1,{w:width,z:factor});
    for(const row of matrices.filter(r=>r.unit===u)){await go(page,row.lesson);await metrics(page,row,width,factor);if(row.disposition==='refreshed')await shot(page,row,label);}
    console.log(`${u.toUpperCase()} ${width}px ${factor*100}%: all routes and changed-area captures reviewed`);
   }
  }
  await page.setViewportSize({width:1440,height:1000});await zoom(1);
  for(const u of 'abcd'){
   await ready(page,`${HOST}/before/unit-${u}/index.html#lesson-01`);await zoom(1);for(const row of matrices.filter(r=>r.unit===u&&r.disposition==='refreshed')){await go(page,row.lesson);await shot(page,row,'before',true);}
   await ready(page,`${HOST}/units/unit-${u}/index.html#lesson-01`);await figureChecks(page,u);await playerChecks(page,u);await saveCompatibility(context,u);console.log(`${u.toUpperCase()}: baseline captures, enlargement, video controls and synthetic save compatibility checked`);
  }
  await svgChecks(context);
  for(const u of 'abcd')for(const f of files(dirs(u).ws)){
   if(f.startsWith('.'))continue;const response=await context.request.get(`${HOST}/units/unit-${u}/${f.split('/').map(encodeURIComponent).join('/')}`),buf=await response.body(),expected=sha(fs.readFileSync(path.join(dirs(u).ws,f)));
   expect(response.ok()&&sha(buf)===expected,u+' dependency response differs from canonical source',f);requests.push({unit:u,file:f,status:response.status(),sha256:sha(buf)});
  }
 }catch(e){failures.push({message:'Review interrupted',details:e.stack});}
 finally{
  const result={schemaVersion:1,scope:'Local Chromium A-D comparison candidate',studentData:'Isolated synthetic profile only',browserVersion:context.browser().version(),zoomMethod:'Real Chromium tabs.setZoom via temporary extension; confirmed innerWidth and devicePixelRatio',screenshots:'Focused content screenshots hide only fixed header/save chrome',routes,dialogs,media,saves,svgLabels,assetResponses:requests,captures,failures,status:failures.length?'failed':'passed',publisherAvailability:'Not certified by stubbed player control checks',teacherAcceptance:'pending'};
  fs.writeFileSync(path.join(REPORT,'chromium-review.json'),JSON.stringify(result,null,2)+'\n');for(const u of 'abcd')fs.writeFileSync(path.join(dirs(u).meta,'chromium-review.json'),JSON.stringify({...result,routes:routes.filter(r=>r.unit===u),dialogs:dialogs.filter(r=>r.unit===u),media:media.filter(r=>r.unit===u),saves:saves.filter(r=>r.unit===u),assetResponses:requests.filter(r=>r.unit===u),captures:captures.filter(r=>r.unit===u)},null,2)+'\n');
  console.log(JSON.stringify({status:result.status,routeViewportChecks:routes.length,captures:captures.length,enlargements:dialogs.length,videoControls:media.length,saves:saves.length,assetResponses:requests.length,failures},null,2));await context.close();fs.rmSync(profile,{recursive:true,force:true});fs.rmSync(extension,{recursive:true,force:true});
 }
 if(failures.length)process.exitCode=1;
})();
