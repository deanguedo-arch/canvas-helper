const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict'),c=require('cheerio');
const root=__dirname,base='http://127.0.0.1:4194',points=[['opening','#ce1-03-foundations'],['vocabulary','#ce1-03 > details:last-of-type'],['worked','#ce1-03-worked'],['practice','#ce1-03-practice'],['independent','#ce1-03-apply']];
(async()=>{
 const browser=await chromium.launch({headless:true}),context=await browser.newContext(),errors=[],views=[];fs.mkdirSync(path.join(root,'screens'),{recursive:true});
 for(const v of ['a','b'])for(const [device,width,height] of [['desktop',1280,1000],['mobile',390,900]]){
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height});await page.goto(`${base}/review/${v}/index.html#ce1-03`,{waitUntil:'networkidle'});await page.locator('#ce1-03').waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('#ce1-03').isVisible(),true);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
  if(v==='b'){
   const $=c.load(fs.readFileSync(path.join(root,'lesson-b.html'),'utf8'));
   const expected=$('[data-canvas-helper-edit-key]').toArray().filter(e=>['p','h2','h3','h4'].includes(e.tagName)).map(e=>({key:$(e).attr('data-canvas-helper-edit-key'),text:$(e).text().replace(/\s+/g,' ').trim()}));
   for(const e of expected)assert.equal((await page.locator(`[data-canvas-helper-edit-key="${e.key}"]`).textContent()).replace(/\s+/g,' ').trim(),e.text,'Copy mismatch '+e.key);
  }
  for(const [point,selector] of points){
   if(point==='vocabulary')await page.locator(selector).evaluate(e=>e.open=true);
   await page.locator(selector).evaluate(e=>{const top=document.querySelector('.topbar').getBoundingClientRect().bottom;window.scrollTo({top:e.getBoundingClientRect().top+scrollY-top-12,behavior:'instant'})});
   await page.screenshot({path:path.join(root,'screens',`${v}-${point}-${device}.png`)});
   views.push({version:v,device,point,noHorizontalOverflow:true});
   if(point==='vocabulary')await page.locator(selector).evaluate(e=>e.open=false);
  }
  if(v==='b'){
   const word=page.locator('#ce1-03-foundations .vocab-term').first();await word.focus();await page.keyboard.press('Enter');await page.locator('.vocab-dialog').waitFor({state:'visible'});assert.equal((await page.locator('#vocab-dialog-title').textContent()).trim(),'Route');await page.keyboard.press('Escape');assert.equal(await page.locator('.vocab-dialog').evaluate(e=>e.open),false);assert.equal(await word.evaluate(e=>document.activeElement===e),true);
  }
  await page.close();
 }
 const a=await context.newPage(),b=await context.newPage();await a.goto(base+'/review/a/index.html#ce1-03');await b.goto(base+'/review/b/index.html#ce1-03');
 await b.evaluate(()=>localStorage.setItem('calm10-2026-draft:learning:v3','review isolation sentinel'));
 await b.locator('#ce-b-travel').fill('80');await b.locator('#ce-b-total').fill('1930');await b.locator('[data-review-check="ce-cost"]').click();assert.match(await b.locator('#ce-cost-feedback').textContent(),/month|travel/i);
 await b.locator('#ce-b-travel').fill('800');await b.locator('#ce-b-total').fill('2650');await b.locator('[data-review-check="ce-cost"]').click();assert.match(await b.locator('#ce-cost-feedback').textContent(),/2,650|2650/);
 await b.locator('#ce-final-c').fill('1410');await b.locator('#ce-final-d').fill('2700');await b.locator('#ce-final-response').fill('Review test: C meets Owen’s current preparation, budget and timing. D requires the additional course, funding and longer time. Check the application date and availability.');
 for(const box of await b.locator('#ce1-03-apply .finlit-signoff input').all())await box.check();
 await b.locator('#ce1-03 [data-complete-lesson]').click();
 await b.waitForFunction(()=>JSON.parse(localStorage.getItem('calm10-2026-draft:ce1-03-teacher-v1:b:learning:v3')||'{}').completions?.['ce1-03']);
 assert.equal(await a.locator('#ce-b-travel').inputValue(),'');assert.equal(await a.locator('#ce-final-c').inputValue(),'');assert.equal(await b.evaluate(()=>localStorage.getItem('calm10-2026-draft:learning:v3')),'review isolation sentinel');
 await b.reload({waitUntil:'networkidle'});assert.equal(await b.locator('#ce-b-total').inputValue(),'2650');assert.equal(await b.locator('#ce-final-c').inputValue(),'1410');assert.ok(await b.locator('a.nav-link[data-page-target="ce1-03"]').evaluate(e=>e.classList.contains('lesson-complete')));
 await b.locator('#ce1-03 [data-reopen-lesson]').click();assert.ok(await b.locator('#ce1-03 [data-complete-lesson]').isVisible());
 const media=await b.locator('#ce1-03 video').evaluateAll(nodes=>nodes.map(v=>v.querySelector('source').getAttribute('src')));
 for(const src of media){const r=await context.request.get(new URL(src,base+'/review/b/index.html').href,{headers:{Range:'bytes=0-1023'}});assert.equal(r.status(),206);assert.equal((await r.body()).length,1024);}
 const finlit=b.locator('#ce1-03-method video');await finlit.evaluate(v=>{v.preload='auto';v.muted=true;v.load()});await finlit.evaluate(async v=>{await v.play()});await b.waitForFunction(()=>document.querySelector('#ce1-03-method video').currentTime>0);await finlit.evaluate(v=>v.pause());
 assert.equal((await context.request.get(base+'/BASELINE.json')).status(),404);assert.equal((await context.request.post(base+'/')).status(),405);
 assert.deepEqual(errors,[]);const report={status:'pass',views,renderedCopyMatchesStaticManuscript:true,vocabularyKeyboardOpenCloseAndFocusReturn:true,guidedFeedbackAndRevision:true,finalSaveReloadCompletionAndReopen:true,reviewVersionsIsolated:true,canonicalNamespaceUntouched:true,mediaRangeRequests:media.length,professionalClipPlayback:true,pageErrors:errors};fs.writeFileSync(path.join(root,'render-checks.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({...report,views:views.length}));
})().catch(e=>{console.error(e);process.exit(1)});
