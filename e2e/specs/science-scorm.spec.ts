import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { lookup } from 'mime-types';
import { buildScormBridgeScript, injectScormBridgeTag } from '../../scripts/lib/scorm.js';
import { resolveScormTracking } from '../../scripts/lib/scorm-tracking.js';

const slugs = ['biology30-unit-a-pilot-3', 'biology30-chapter-12', 'biology30-chapter-13', 'chemistry30-unit-a-pilot'];
async function launch(page: Page, slug: string, suspend = '', learner = 'student-one', actualPackage = false) {
  const root = path.resolve('projects', slug, actualPackage ? 'exports/scorm-2004-review' : 'workspace');
  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  const contract = JSON.parse(await readFile(path.join(root, 'scorm-tracking.json'), 'utf8'));
  const report = resolveScormTracking(html, [], '2004', contract);
  const bridge = actualPackage ? await readFile(path.join(root, 'scorm-bridge.js'), 'utf8') : buildScormBridgeScript({ projectSlug: slug, version: '2004', storageKeys: [], tracking: report.contract });
  await page.addInitScript(({ suspend, learner }) => {
    if (window !== window.top) return;
    const lms = { values: { 'cmi.suspend_data': suspend, 'cmi.learner_id': learner } as Record<string,string>, initializes: 0, commits: 0, terminates: 0, fail: false };
    (window as any).scienceLms = lms;
    (window as any).API_1484_11 = {
      Initialize: () => { lms.initializes++; return lms.initializes === 1 ? 'true' : 'false'; },
      GetValue: (key: string) => lms.values[key] || '',
      SetValue: (key: string, value: string) => { if(lms.fail) return 'false'; lms.values[key] = value; return 'true'; },
      Commit: () => { lms.commits++; return lms.fail ? 'false' : 'true'; },
      Terminate: () => { lms.terminates++; return 'true'; }
    };
  }, { suspend, learner });
  await page.route('https://science-scorm.test/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    const relative = pathname.slice(1);
    if (relative === 'scorm-bridge.js') return route.fulfill({contentType: 'text/javascript', body: bridge});
    if (relative === 'index.html') return route.fulfill({contentType: 'text/html', body: injectScormBridgeTag(html)});
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) return route.abort();
    try { await route.fulfill({contentType: String(lookup(target) || 'application/octet-stream'), body: await readFile(target)}); }
    catch { await route.fulfill({status: 404, body: ''}); }
  });
  await page.route(url=>url.protocol==='https:'&&url.hostname!=='science-scorm.test', route=>route.abort());
  await page.goto('https://science-scorm.test/index.html#' + (slug.startsWith('chemistry') ? 'c9-energy' : 'textbook-practice'), {waitUntil:'domcontentloaded'});
}
async function save(page: Page) {
  const result=await page.evaluate(async()=>{const sc=(window as any).__canvasHelperScorm;return {ok:await sc.saveAsync(),error:sc.lastError()};});
  expect(result.ok,result.error).toBe(true);
  return page.evaluate(() => (window as any).scienceLms.values['cmi.suspend_data'] as string);
}
for (const chapter of [12,13]) test(`instructional revision Chapter ${chapter}: actual SCORM formative work resumes without required progress`, async ({page,browser})=>{
 const slug=`biology30-chapter-${chapter}`,errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await launch(page,slug,'','revision-student',true);
 await page.evaluate(()=>location.hash='lesson-01');
 const config=await page.evaluate(()=>(window as any).BIOLOGY_HTML.getConfig()),guided=config.guidedActivities[0].guided.items[0];
 const node=page.locator(`[data-guided-item="${guided.id}"]`);await node.locator('select').selectOption(guided.options.find((x:string)=>x!==guided.answer));await node.locator('button').click();await expect(node.locator('[data-revision-feedback]')).toContainText(guided.hint);
 await node.locator('select').selectOption(guided.answer);await node.locator('button').click();
 const spec=config.transferChecks[0];await page.evaluate(route=>location.hash=route,spec.route);const transfer=page.locator(`[data-transfer="${spec.id}"]`);await expect(transfer.locator('[data-transfer-feedback]')).toBeHidden();
 for(const q of spec.mc)await transfer.getByLabel(q.answer,{exact:true}).check();await transfer.locator('textarea').fill('Independent written explanation, retained without an automatic writing mark.');await transfer.locator('[data-transfer-submit]').click();await expect(transfer.locator('[data-transfer-feedback]')).toBeVisible();
 await expect(page.locator('[data-progress-count]')).toHaveText(`0 of ${chapter===12?9:13} checks`);
 const before=await page.evaluate(()=>(window as any).BIOLOGY_HTML.getSnapshot()),suspend=await save(page);expect(suspend.length).toBeLessThanOrEqual(60000);
 const context=await browser.newContext();try{const resumed=await context.newPage();resumed.on('pageerror',e=>errors.push(e.message));await launch(resumed,slug,suspend,'revision-student',true);const after=await resumed.evaluate(()=>(window as any).BIOLOGY_HTML.getSnapshot());expect(after.guided).toEqual(before.guided);expect(after.transfer).toEqual(before.transfer);expect(after.checks).toEqual(before.checks);expect(after.history).toEqual(before.history);expect(await resumed.evaluate(()=>(window as any).scienceLms.values['cmi.success_status'])).not.toBe('passed');
  const lastGood=await save(resumed);await resumed.evaluate(()=>{(window as any).scienceLms.fail=true;location.hash='lesson-01';});const changed=resumed.locator(`[data-guided-item="${guided.id}"]`);await changed.locator('select').selectOption(guided.answer);await changed.locator('button').click();expect(await resumed.evaluate(()=>(window as any).__canvasHelperScorm.saveAsync())).toBe(false);expect(await resumed.evaluate(()=>(window as any).scienceLms.values['cmi.suspend_data'])).toBe(lastGood);
 }finally{await context.close();}expect(errors).toEqual([]);
});
for (const slug of slugs) test(`${slug}: real writing restores in a fresh browser with one LMS owner`, async ({ page, browser }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await launch(page, slug);
  expect(errors).toEqual([]);
  const selector = slug.startsWith('chemistry') ? '[data-save="c9-energy-explain"]' : '[data-book-text]';
  await page.locator(selector).fill('Evidence saved across devices: ΔH, neurons, photos stay separate.');
  const suspend = await save(page);
  expect(suspend.length).toBeLessThanOrEqual(60000);
  expect(JSON.parse(suspend).values).toEqual({});
  expect(await page.evaluate(() => (window as any).scienceLms.initializes)).toBe(1);
  await expect(page.locator('[data-scorm-save-exit]')).toHaveCount(0);
  const context = await browser.newContext();
  try {
    const reopened = await context.newPage(); reopened.on('pageerror', e => errors.push(e.message));
    await launch(reopened, slug, suspend);
    await expect(reopened.locator(selector)).toHaveValue('Evidence saved across devices: ΔH, neurons, photos stay separate.');
    expect(await reopened.evaluate(() => (window as any).scienceLms.initializes)).toBe(1);
    // A failed write must not replace the valid LMS snapshot or close the attempt.
    const beforeFailure=await save(reopened);
    await reopened.evaluate(() => { (window as any).scienceLms.fail = true; });
    await reopened.locator(selector).fill('New unsent writing');
    expect(await reopened.evaluate(() => (window as any).__canvasHelperScorm.saveAsync())).toBe(false);
    expect(await reopened.evaluate(() => (window as any).scienceLms.values['cmi.suspend_data'])).toBe(beforeFailure);
    expect(await reopened.evaluate(() => (window as any).scienceLms.terminates)).toBe(0);
    await reopened.evaluate(() => { (window as any).scienceLms.fail = false; });
    await save(reopened);
  } finally { await context.close(); }
  expect(errors).toEqual([]);
});

test('managed snapshots reject another learner and isolate a new attempt on a used browser', async ({ page }) => {
  await launch(page, slugs[1]);
  await page.locator('[data-book-text]').fill('Student one private work');
  const suspend = await save(page);
  // Route and API init scripts are replaced in separate pages sharing browser storage.
  const context = page.context();
  const fresh = await context.newPage();
  await launch(fresh, slugs[1], '', 'student-two');
  await expect(fresh.locator('[data-book-text]')).toHaveValue('');
  const wrong = await context.newPage();
  await launch(wrong, slugs[1], suspend, 'student-two');
  await expect(wrong.locator('[data-scorm-status]')).toContainText('another learner');
  expect(await wrong.evaluate(() => (window as any).scienceLms.values['cmi.suspend_data'])).toBe(suspend);
  expect(await wrong.evaluate(() => (window as any).scienceLms.commits)).toBe(0);
});

test('Chapter 11 photo pilot restores the uploaded image through authenticated API calls in a fresh browser', async ({ page, browser }) => {
  let rows:any[]=[],jpeg=Buffer.alloc(0);
  async function connect(p:Page){
    await p.route('https://school.brightspace.com/**',async route=>{
      const req=route.request();
      if(req.headers().authorization!=='Bearer photo-test-token')return route.fulfill({status:403,body:''});
      if(req.method()==='POST'){
        const body=req.postDataBuffer()!,text=body.toString('utf8');
        const comment=JSON.parse(text.split('\r\n\r\n')[1].split('\r\n--')[0]).Text;
        const name=text.match(/filename="([^"]+)"/)![1];
        const start=body.indexOf(Buffer.from('Content-Type: image/jpeg\r\n\r\n'))+'Content-Type: image/jpeg\r\n\r\n'.length;
        const boundary=req.headers()['content-type'].split('boundary=')[1];
        const end=body.indexOf(Buffer.from('\r\n--'+boundary+'--'),start);jpeg=body.subarray(start,end);
        rows=[{Submissions:[{Id:91,Comment:{Text:comment},Files:[{FileId:92,FileName:name}]}]}];
        return route.fulfill({contentType:'application/json',body:'{}'});
      }
      if(req.url().endsWith('/mysubmissions/'))return route.fulfill({contentType:'application/json',body:JSON.stringify(rows)});
      return route.fulfill({contentType:'image/jpeg',body:jpeg});
    });
    await p.evaluate(()=>{const w=window as any;const data=JSON.parse(document.querySelector('#textbook-practice-data')!.textContent!);w.biologyPhotoStore=w.createBiologyBrightspacePhotoStore({origin:'https://school.brightspace.com',orgUnitId:123,folderId:456,apiVersion:'1.82',authorize:async()=> 'photo-test-token',questionIds:[data.questions[0].id]});return w.biologyTextbookPractice.refresh();});
  }
  await launch(page,slugs[0]);test.skip(await page.locator('[data-book-file]').count()===0,'Photo upload controls were explicitly removed from Biology; remote photo pilot is not in this candidate.');await page.locator('[data-book-text]').fill('Photo evidence of my paper work');await connect(page);
  const bytes=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=320;c.height=240;const ctx=c.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,320,240);ctx.fillStyle='black';ctx.fillText('Student diagram',20,40);const blob=await new Promise<Blob>(r=>c.toBlob(b=>r(b!),'image/png'));return Array.from(new Uint8Array(await blob.arrayBuffer()));});
  await page.locator('[data-book-file]').setInputFiles({name:'diagram.png',mimeType:'image/png',buffer:Buffer.from(bytes)});
  await expect(page.locator('[data-book-photos] img')).toHaveCount(1);
  await expect.poll(()=>page.locator('[data-book-photos] img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  const suspend=await save(page);expect(jpeg.length).toBeGreaterThan(0);
  const context=await browser.newContext();
  try{
    const reopened=await context.newPage();await launch(reopened,slugs[0],suspend);await connect(reopened);
    // Selecting another question and returning runs the ordinary photo rendering
    // path after the approved connection becomes available.
    await reopened.locator('[data-book-next]').click();await reopened.locator('[data-book-prev]').click();
    await expect(reopened.locator('[data-book-text]')).toHaveValue('Photo evidence of my paper work');
    await expect.poll(()=>reopened.locator('[data-book-photos] img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
    await expect.poll(()=>reopened.locator('[data-textbook-work] img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  }finally{await context.close();}
});

test('managed course capacity failure preserves the last LMS copy and exact visible writing',async({page})=>{
 await launch(page,slugs[2]);await page.locator('[data-book-text]').fill('Last valid response');const previous=await save(page);
 const text=await page.evaluate(()=>Array.from(crypto.getRandomValues(new Uint8Array(60000)),b=>b.toString(16).padStart(2,'0')).join(''));
 await page.locator('[data-book-text]').fill(text);
 expect(await page.evaluate(()=>(window as any).__canvasHelperScorm.saveAsync())).toBe(false);
 expect(await page.evaluate(()=>(window as any).scienceLms.values['cmi.suspend_data'])).toBe(previous);
 await expect(page.locator('[data-book-text]')).toHaveValue(text);
 await expect(page.locator('[data-scorm-status]')).toContainText('last successful LMS save is still safe');
});

test('Chemistry migrates its older compressed native save without a competing API lifecycle',async({page,browser})=>{
 const slug=slugs[3];await launch(page,slug);await page.locator('[data-save="c9-energy-explain"]').fill('Writing from the earlier Chemistry package');await save(page);
 const legacy=await page.evaluate(()=>(window as any).ChapterStateCodec.encode(JSON.stringify((window as any).ChapterDiagnostics.getState())));
 const context=await browser.newContext();try{const reopened=await context.newPage();await launch(reopened,slug,legacy);await expect(reopened.locator('[data-save="c9-energy-explain"]')).toHaveValue('Writing from the earlier Chemistry package');await save(reopened);expect(await reopened.evaluate(()=>(window as any).scienceLms.initializes)).toBe(1);}finally{await context.close();}
});
