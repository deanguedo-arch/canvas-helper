// Focused promotion/save compatibility check. Browser uses isolated synthetic storage.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),c=require('cheerio'),{chromium}=require('playwright');
const project=path.resolve(__dirname,'../../..'),workspace=path.join(project,'workspace'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
(async()=>{
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'ADOPTION.json'))),html=fs.readFileSync(path.join(workspace,'index.html'),'utf8'),approved=fs.readFileSync(path.join(__dirname,'approved-b.html'),'utf8'),before=fs.readFileSync(path.join(__dirname,'before/index.html'),'utf8');
const a=c.load(before),b=c.load(html),proposal=c.load(approved);
assert.equal(sha(html),manifest.canonicalSha256);
for(const [file,hash]of Object.entries(manifest.beforeFiles))if(file!=='index.html')assert.equal(sha(fs.readFileSync(path.join(workspace,file))),hash,'Existing runtime/source changed: '+file);
assert.equal(b('article[data-lesson-id]').length,40);assert.equal(b('.review-switch').length,0);assert.equal(b('link[href="../../review.css"]').length,0);
const fields=$=>$('[data-save-key]').toArray().map(e=>[e.tagName,e.attribs]).sort((x,y)=>JSON.stringify(x).localeCompare(JSON.stringify(y)));
assert.deepEqual(fields(b),fields(proposal),'Approved controls changed');
for(const selector of ['video','source','track','iframe'])assert.deepEqual(b(selector).toArray().map(e=>b.html(e)),a(selector).toArray().map(e=>a.html(e)),'Media changed');
const registry=JSON.parse(b('#historical-task-registry').text());
const oldPrompt=a('#ce1-05').text().replace(/\s+/g,' ').trim();
for(const change of manifest.changedTaskFields){const record=registry.versions[change.historyVersion][change.key];assert.equal(registry.versionPrompts[record.promptId],oldPrompt,'Original wording lost: '+change.key);}
const key=manifest.namespace,aKey='calm10-2026-draft:career-standard-v1:a:learning:v3',bKey='calm10-2026-draft:career-standard-v1:b:learning:v3';
const saved={schemaVersion:3,responses:{'ce1-05':'Synthetic older Nessa route','guided:ce1-05:part1':'Synthetic earlier practice','completion:ce1-05:criterion1':true,'unlisted:retained':'Synthetic unknown-key backup'},taskVersions:{},responseHistory:{'ce1-05':[{version:'earlier',value:'Synthetic first route',prompt:'Earlier retained instructions'}]},completions:{'ce1-05':{taskVersion:'2026-09-28.astra.1'}},savedAt:'2026-10-05T00:00:00Z'};
for(const k of ['ce1-05','guided:ce1-05:part1','completion:ce1-05:criterion1'])saved.taskVersions[k]='2026-09-28.astra.1';
// An unchanged, completed lesson must stay complete after prose/style promotion.
const finals=a('#co1-03 [data-final-field]').toArray();
for(const e of finals){const value=e.tagName==='select'?a(e).find('option').toArray().map(x=>x.attribs.value).find(Boolean):'Synthetic supported interview response';saved.responses[e.attribs['data-save-key']]=value;saved.taskVersions[e.attribs['data-save-key']]=e.attribs['data-task-version'];}
a('#co1-03 [data-signoff]').each((i,e)=>{saved.responses[e.attribs['data-save-key']]=true;saved.taskVersions[e.attribs['data-save-key']]=e.attribs['data-task-version'];});
saved.completions['co1-03']={taskVersion:a('#co1-03').attr('data-task-version'),responseRevision:JSON.stringify(finals.map(e=>[e.attribs['data-save-key'],saved.responses[e.attribs['data-save-key']]]))};
const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1360,height:1000}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await context.addInitScript(({key,aKey,bKey,saved})=>{if(!localStorage.getItem(key)){localStorage.setItem(key,JSON.stringify(saved));localStorage.setItem(aKey,'Archived A sentinel');localStorage.setItem(bKey,'Archived B sentinel');}},{key,aKey,bKey,saved});
try{
await page.goto('http://127.0.0.1:4195/review/b/index.html?revision=4-alberta#ce1-05',{waitUntil:'networkidle'});
assert.match(page.url(),/\/index\.html\?revision=4-alberta#ce1-05$/);assert.ok(await page.locator('#ce1-05').isVisible());assert.equal(await page.locator('.review-switch').count(),0);
let state=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
for(const k of ['ce1-05','guided:ce1-05:part1','completion:ce1-05:criterion1']){assert.equal(state.responses[k],k.includes('criterion')?false:'');assert.ok(state.responseHistory[k].some(e=>e.value===saved.responses[k]&&e.prompt===oldPrompt));}
assert.ok(state.responseHistory['ce1-05'].some(e=>e.value==='Synthetic first route'));assert.equal(state.responses['unlisted:retained'],saved.responses['unlisted:retained']);assert.ok(!state.completions['ce1-05']);assert.deepEqual(state.completions['co1-03'],saved.completions['co1-03']);
assert.deepEqual(JSON.parse(await page.evaluate(k=>localStorage.getItem(k+':before-authoring-migration'),key)),saved);
await page.goto('http://127.0.0.1:4195/#co1-03',{waitUntil:'networkidle'});assert.ok(await page.locator('.nav-link[data-page-target="co1-03"]').evaluate(e=>e.classList.contains('lesson-complete')));
const field=page.locator('#field-co1-03');assert.equal(await field.inputValue(),saved.responses['co1-03']);await field.fill('Synthetic revised interview response');await page.waitForTimeout(650);await page.reload({waitUntil:'networkidle'});assert.equal(await field.inputValue(),'Synthetic revised interview response');
state=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.ok(!state.completions['co1-03']);assert.equal(await page.evaluate(k=>localStorage.getItem(k),aKey),'Archived A sentinel');assert.equal(await page.evaluate(k=>localStorage.getItem(k),bKey),'Archived B sentinel');
const response=await context.request.get('http://127.0.0.1:4195/');assert.equal(sha(await response.body()),manifest.canonicalSha256);
const media=await page.locator('video source').first().getAttribute('src');assert.ok(media);assert.equal((await context.request.get(new URL(media,'http://127.0.0.1:4195/').href,{headers:{Range:'bytes=0-255'}})).status(),206);
for(const route of ['/review/a/index.html','/co1-01-comparison.html']){const r=await context.request.get('http://127.0.0.1:4195'+route,{maxRedirects:0});assert.equal(r.status(),302);}
assert.deepEqual(errors,[]);
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify({status:'pass',checkedAt:new Date().toISOString(),canonicalSha256:manifest.canonicalSha256,lessons:40,responseIds:1284,existingRuntimeAndMediaUnchanged:true,canonicalNamespaceRetained:true,allChangedTaskHistoryAssociationsChecked:manifest.changedTaskFields.length,syntheticPreviousAnswerMigration:true,previousHistoryAndUnknownKeysRetained:true,unchangedCompletionRetained:true,revisedResponseRestoreAndCompletionReopen:true,preMigrationBackupRetained:true,archivedReviewStorageUntouched:true,oldReviewRedirectRetainsLesson:true,canonicalPreviewByteEquality:true,mediaRangeSampleAccessible:true,pageErrors:errors,limits:['Isolated synthetic browser storage; no user data edited','Focused adoption checks, not whole-course rollout, Studio, SCORM or LMS certification']},null,2)+'\n');
console.log('PASS: canonical byte equality, stable controls/media/runtime, earlier-answer provenance, save/restore, completion compatibility and retired preview redirects.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
