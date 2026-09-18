/** Integration acceptance using native browser storage on a real HTTP origin. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,mkdtemp} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
const root=process.cwd(),counts=[11,12,13,15,13,10,12],reports=[];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.pdf':'application/pdf','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
const server=createServer(async(req,res)=>{try{
 const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname),m=u.match(/^\/chapter-(1[4-9]|20)\/(.*)$/);
 if(!m)throw Error('Unknown course');
 const w=path.join(root,`projects/biology30-chapter-${m[1]}/workspace`),file=path.resolve(w,m[2]||'index.html');
 if(!file.startsWith(w+path.sep))throw Error('Invalid path');
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));
}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const selectAnswer=async(page,id,value)=>page.locator(`[data-check-choice="${id}"]`).evaluateAll((els,a)=>{const x=els.find(e=>e.value===a);assertDOM(x);x.click();function assertDOM(x){if(!x)throw Error('Missing answer choice');}},value);
let failed=false;
try{for(let ch=14;ch<=20;ch++){
 const meta=path.join(root,`projects/biology30-chapter-${ch}/meta`),out=path.join(meta,'local-integration-verification');await mkdir(out,{recursive:true});
 const profile=await mkdtemp(path.join(os.tmpdir(),`biology30-ch${ch}-profile-`)),result={chapter:ch,origin:base,storage:'native localStorage; persistent Chromium profile',tests:[],pageErrors:[],failedRequests:[]};
 let ctx,page;
 const record=(name,detail)=>result.tests.push({name,status:'passed',detail});
 const launch=async()=>{ctx=await chromium.launchPersistentContext(profile,{headless:true,reducedMotion:'reduce',viewport:{width:1117,height:902}});page=await ctx.newPage();page.setDefaultTimeout(8000);page.on('pageerror',e=>result.pageErrors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))result.failedRequests.push(r.url());});await page.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());};
 const route=async id=>{await page.evaluate(id=>location.hash=id,id);await page.waitForFunction(id=>document.querySelector('.course-page:not([hidden])')?.id===id,id);};
 try{
  await launch();await page.goto(`${base}/chapter-${ch}/index.html`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.BIOLOGY_HTML);await page.evaluate(()=>document.fonts.ready);
  const C=await page.evaluate(()=>BIOLOGY_HTML.getConfig());assert.equal(C.chapter,ch);assert.equal(C.checks.length,counts[ch-14]);
  record('native runtime and required denominator',C.checks.length);
  const routes=await page.locator('.course-page').evaluateAll(es=>es.map(e=>e.id));for(const id of routes)await route(id);record('every sidebar route opens',routes);
  await route('lesson-01');
  const font=await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily);assert.match(font,/Work Sans/);
  const bold=await page.locator('.terms-line [data-term-id]').first().evaluate(e=>Number(getComputedStyle(e).fontWeight));assert(bold>=700);record('approved loaded typography and bold vocabulary',{font,bold});
  await page.screenshot({path:path.join(out,'lesson-01-desktop.png')});
  const spec=C.checks[0],sec=page.locator(`[data-check-id="${spec.id}"]`);await sec.evaluate(e=>e.closest('details').open=true);await sec.locator('[data-start-check]').click();
  await sec.locator('[data-check-answer]').first().click();assert.equal(await page.evaluate(id=>BIOLOGY_HTML.getSnapshot().checks[id].mc[Object.keys(BIOLOGY_HTML.getSnapshot().checks[id].mc)[0]].attempts.length,spec.id),0);
  const first=spec.mc[0],wrong=first.options.find(a=>a!==first.answer);await selectAnswer(page,first.id,wrong);await page.locator(`[data-check-answer="${first.id}"]`).click();assert.match(await sec.locator('[data-feedback]').first().innerText(),/Hint:/);
  for(const q of spec.mc){await selectAnswer(page,q.id,q.answer);await page.locator(`[data-check-answer="${q.id}"]`).click();}
  assert.equal(await sec.locator('[data-writing-gate]').isDisabled(),false);
  for(const w of spec.writing){await page.locator('#'+w.id).fill(w.model);await page.locator(`[data-save-writing="${w.id}"]`).click();}
  const text=`Real-origin saved Chapter ${ch} work. ${spec.writing[0].model}`;
  await page.locator('#'+spec.writing[0].id).fill(text);assert.match(await page.locator('#'+spec.writing[0].id+'-status').innerText(),/Draft/);await page.locator(`[data-save-writing="${spec.writing[0].id}"]`).click();await sec.locator('[data-finish-check]').click();
  const historic=await page.evaluate(()=>BIOLOGY_HTML.getSnapshot().history[0]);assert.equal(historic.run.mc[first.id].attempts[0].correct,false);record('required gates, draft edit and immutable first attempt');
  await route('textbook-practice');await page.locator('[data-book-text]').fill(text);await page.locator('[data-book-save]').click();await page.waitForFunction(()=>document.querySelector('[data-book-question-state]').textContent==='Saved');
  const bookId=await page.locator('[data-book-text]').getAttribute('data-book-text');
  await ctx.close();await launch();await page.goto(`${base}/chapter-${ch}/index.html#textbook-practice`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.BIOLOGY_HTML);
  assert.equal(await page.locator('[data-book-text]').inputValue(),text);assert.equal(await page.locator('[data-book-question-state]').innerText(),'Saved');assert.equal(await page.evaluate(()=>BIOLOGY_HTML.getSnapshot().history.length),1);record('close browser and reopen restores native writing/history',bookId);
  await page.locator('[data-book-text]').fill(text+' Edited.');await page.waitForFunction(()=>document.querySelector('[data-book-question-state]').textContent==='Draft');await page.reload();assert.equal(await page.locator('[data-book-text]').inputValue(),text+' Edited.');record('textbook edit draft survives reload');
  await page.locator('[data-book-save]').click();await page.locator('[data-book-enlarge]').click();assert.equal(await page.locator('[data-book-enlarge-dialog][open]').count(),1);await page.locator('[data-book-enlarge-close]').click();record('original question enlargement');
  for(const [mode,id]of [['flash','practice'],['blanks','fill-in-the-blanks'],['mc','multiple-choice'],['mixed','mixed-practice']]){
   await route(id);const psec=page.locator(`[data-practice-mode="${mode}"]`);await psec.locator('[data-set-size]').selectOption('5');await psec.locator('[data-practice-start]').click();
   const run=await page.evaluate(mode=>BIOLOGY_HTML.getSnapshot().practice[mode],mode);assert.equal(run.items.length,5);await page.reload();assert.equal((await page.evaluate(mode=>BIOLOGY_HTML.getSnapshot().practice[mode],mode)).id,run.id);
   await psec.locator('[data-reset-request]').click();await psec.locator('[data-reset-cancel]').click();assert.equal((await page.evaluate(mode=>BIOLOGY_HTML.getSnapshot().practice[mode],mode)).id,run.id);
   await psec.locator('[data-reset-request]').click();await psec.locator('[data-reset-confirm]').click();assert.equal(await page.evaluate(mode=>!!BIOLOGY_HTML.getSnapshot().practice[mode],mode),false);assert.equal(await page.evaluate(()=>BIOLOGY_HTML.getSnapshot().history.length),1);
  }record('four practice modes resume; reset/cancel preserve completed history');
  await route('labeling-practice');for(const d of C.labelDiagrams){await page.locator('[data-diagram-select]').selectOption(d.id);await page.locator('[data-start-labels]').click();for(const [letter,answer]of Object.entries(d.answers))await page.locator(`[data-label-answer="${letter}"]`).selectOption(answer);await page.locator('[data-label-check-all]').click();await page.locator('[data-label-finish]').click();const last=await page.evaluate(()=>BIOLOGY_HTML.getSnapshot().history.at(-1));assert.equal(last.kind,'labeling');assert(Object.values(last.run.labels).every(v=>v.attempts.at(-1).correct));}record('all diagram selectors and answer maps work',C.labelDiagrams.length);
  assert.match(await page.locator('[data-progress-count]').innerText(),/^1 of /);record('optional work does not change required progress');
  await route('lesson-01');await page.locator('.terms-line [data-term-id]').first().click();assert.equal(await page.locator('dialog[open]').count(),1);await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);record('vocabulary popup and Escape');
  await route('textbook-library');await page.locator('[data-library-textbook]').waitFor();assert.match(await page.locator('[data-library-textbook]').getAttribute('src'),/^blob:|\.pdf/);record('chapter PDF reader populated');
  for(const width of [1117,980,390,320]){await page.setViewportSize({width,height:width>=980?902:844});for(const id of ['lesson-01','core-vocabulary','textbook-practice','multiple-choice']){await route(id);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`${width}: ${id} overflow`);}await page.waitForFunction(mobile=>document.querySelector('#course-sidebar').inert===mobile,width<=760);if(width===390){await route('lesson-01');assert(await page.locator('#course-sidebar').evaluate(e=>e.getBoundingClientRect().right<=1));await page.locator('[data-menu-button]').click();assert.equal(await page.locator('[data-menu-button]').getAttribute('aria-expanded'),'true');await page.locator('#course-sidebar .nav-link').first().click();await page.waitForFunction(()=>!document.body.classList.contains('nav-open'));await route('lesson-01');await page.screenshot({path:path.join(out,'lesson-01-mobile.png')});}}record('desktop/tablet/mobile navigation and document overflow');
  await page.setViewportSize({width:1117,height:902});await route('process-collection');assert((await page.locator('#process-collection').innerText()).includes(text));await page.emulateMedia({media:'print'});await page.pdf({path:path.join(out,'all-my-work.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});record('All My Work and print include saved writing');
  const key=`biology30-chapter-${ch}:html:v1`,otherCh=ch===20?14:ch+1,other=await ctx.newPage();await other.goto(`${base}/chapter-${otherCh}/index.html#textbook-practice`);await other.waitForFunction(()=>!!window.BIOLOGY_HTML);assert.equal(await other.evaluate(()=>BIOLOGY_HTML.getSnapshot().history.length),0);await other.locator('[data-book-text]').fill('Different chapter isolated work');await other.locator('[data-book-save]').click();assert.equal(await page.evaluate(()=>BIOLOGY_HTML.getSnapshot().history[0].run.writing[Object.keys(BIOLOGY_HTML.getSnapshot().history[0].run.writing)[0]].draft),text);assert.doesNotMatch(await page.locator('[data-local-status]').innerText(),/Another tab/);await other.close();record('two chapters on same origin remain isolated');
  const twin=await ctx.newPage();await twin.goto(`${base}/chapter-${ch}/index.html#textbook-practice`);await twin.locator('[data-book-text]').fill('Newer same-chapter tab work');await twin.locator('[data-book-save]').click();await page.waitForFunction(()=>document.querySelector('[data-local-status]').textContent.includes('Another tab'));const disk=await twin.evaluate(key=>localStorage.getItem(key),key);await route('textbook-practice');await page.locator('[data-book-text]').fill('Visible conflict draft must not overwrite');await page.locator('[data-book-save]').click();assert.equal(await twin.evaluate(key=>localStorage.getItem(key),key),disk);await twin.close();record('genuine storage event blocks stale same-chapter overwrite');
  await page.reload();const saved=await page.evaluate(key=>localStorage.getItem(key),key);await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Integration test write failure','QuotaExceededError');};});await page.locator('[data-book-text]').fill('Visible draft retained after write failure');await page.locator('[data-book-save]').click();await page.waitForFunction(()=>/NOT SAVED|failed|paused/i.test(document.querySelector('[data-local-status]').textContent));assert.equal(await page.locator('[data-book-text]').inputValue(),'Visible draft retained after write failure');assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),saved);record('write failure preserves last native save and visible draft');
  await ctx.close();await launch();await page.goto(`file://${root}/projects/biology30-chapter-${ch}/workspace/portable/Biology30_Chapter${ch}.html#textbook-practice`);await page.waitForFunction(()=>!!window.BIOLOGY_HTML);assert.equal(await page.evaluate(()=>BIOLOGY_HTML.getConfig().chapter),ch);await page.locator('[data-book-text]').fill('Offline portable writing');await page.locator('[data-book-save]').click();await page.reload();assert.equal(await page.locator('[data-book-text]').inputValue(),'Offline portable writing');record('portable file offline startup and native reload saving');
  assert.deepEqual(result.pageErrors,[]);assert.deepEqual(result.failedRequests,[]);record('no runtime errors or missing local requests');
 }catch(e){failed=true;result.tests.push({name:'integration failure',status:'failed',detail:e.stack});if(page&&!page.isClosed())await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});console.error(`Chapter ${ch}: ${e.message}`);
 }finally{if(ctx)await ctx.close().catch(()=>{});result.generatedAt=new Date().toISOString();result.workspaceHtmlSha256=createHash('sha256').update(await readFile(path.join(root,`projects/biology30-chapter-${ch}/workspace/index.html`))).digest('hex');await writeFile(path.join(out,'real-origin-results.json'),JSON.stringify(result,null,2)+'\n');reports.push(result);console.log(`Chapter ${ch}: ${result.tests.filter(t=>t.status==='passed').length} native-origin groups passed; ${result.tests.filter(t=>t.status==='failed').length} failed`);}
}}finally{await new Promise(resolve=>server.close(resolve));}
if(failed)process.exitCode=1;
