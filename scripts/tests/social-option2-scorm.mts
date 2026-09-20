import fs from 'node:fs';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { chromium } from 'playwright';
import { buildScormBridgeScript, injectScormBridgeTag, findStorageKeysInScriptSources } from '../lib/scorm.js';
import { resolveScormTracking } from '../lib/scorm-tracking.js';

// Exercise the shared exporter bridge against real canonical Social HTML without
// creating exports, upload ZIPs, or touching an actual learner's browser storage.
const browser = await chromium.launch({ headless: true });
const results: object[] = [];
try {
  for (const grade of (process.env.SCORM_FOCUSED ? [Number(process.env.SCORM_FOCUSED) || 10] : [10,20,30])) for (const issue of (process.env.SCORM_FOCUSED ? [1] : [1,2,3,4])) {
    const slug = `social${grade}-1-related-issue-${issue}-option-2`;
    const base = `projects/${slug}`;
    const html = fs.readFileSync(`${base}/workspace/index.html`, 'utf8');
    const $ = load(html);
    const sources = [html, ...$('script[src]').toArray().map(e => e.attribs.src).filter(s => !s.includes('scorm-bridge') && !/^(?:https?:|\/\/)/.test(s)).map(s => fs.readFileSync(`${base}/workspace/${s}`, 'utf8'))];
    const keys = findStorageKeysInScriptSources(sources, 'unexpected-fallback');
    const complete = `canvas-helper:${slug}:complete`;
    const responses = `canvas-helper:${slug}:responses`;
    const evidence = `canvas-helper:${slug}:manual-evidence-notes`;
    for (const key of [complete,responses,evidence]) assert.ok(keys.includes(key), `${slug}: missing store ${key}`);
    const explicit = JSON.parse(fs.readFileSync(`${base}/workspace/scorm-tracking.json`, 'utf8'));
    const report = resolveScormTracking(html, keys, '2004', explicit);
    assert.ok(Object.values(report.features).every(Boolean));
    const required = report.contract!.completion!.requiredIds;
    assert.deepEqual(required, JSON.parse(html.match(/const (?:lessonIds|completionIds)\s*=\s*(\[[^;]*\]);/)![1]));
    const markers = new Set($('[data-complete-id]').toArray().map(e=>e.attribs['data-complete-id']));
    for (const id of required) assert.ok(markers.has(id));
    const oldId = $('#study-guide textarea[data-response-id]').first().attr('data-response-id')!;
    const toolId = $('#position-builder textarea[data-response-id]').first().attr('data-response-id')!;
    const frayerId = $('#core-vocabulary textarea[data-response-id]').first().attr('data-response-id')!;
    assert.ok(oldId && toolId && frayerId);
    const seed = JSON.stringify({version:1,projectSlug:slug,values:{
      [complete]:JSON.stringify([required[0]]),
      [responses]:JSON.stringify({[oldId]:'Existing recall answer'}),
      [evidence]:JSON.stringify([{id:'old-evidence',detail:'Existing Evidence Bank entry'}])
    }});
    const bridge = buildScormBridgeScript({projectSlug:slug,version:'2004',storageKeys:keys,tracking:report.contract});
    const entry = injectScormBridgeTag(html);
    async function launch(suspend: string, priorValues: Record<string,string> = {}, automatic = false) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.clock.install({time:new Date('2026-09-18T12:00:00Z')});
      await page.clock.pauseAt(new Date('2026-09-18T12:00:01Z'));
      await page.addInitScript('window.__name = (fn) => fn;');
      await page.addInitScript(({saved,priorValues}) => {
        const state = {values:{...priorValues,'cmi.suspend_data':saved} as Record<string,string>,terminated:0,fail:false,reject:""};
        (window as any).__socialLms = state;
        (window as any).API_1484_11 = {Initialize:()=> 'true',GetValue:(k:string)=>state.values[k]||'',SetValue:(k:string,v:string)=>{if(k===state.reject || (/^cmi\.interactions\.\d+\.timestamp$/.test(k) && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(v)))return "false";state.values[k]=v;if (/^cmi\.interactions\.\d+\.id$/.test(k)) state.values['cmi.interactions._count']=String(Math.max(Number(state.values['cmi.interactions._count']||0),Number(k.split('.')[2])+1));return 'true';},Commit:()=>state.fail?'false':'true',Terminate:()=>{state.terminated++;return 'true';}};
      }, {saved:suspend,priorValues});
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.pathname === `/projects/${slug}/workspace/index.html`) return route.fulfill({contentType:'text/html',body:automatic ? entry : entry.replace('data-scorm-save-mode="automatic"','')});
        if (url.pathname === `/projects/${slug}/workspace/scorm-bridge.js`) return route.fulfill({contentType:'text/javascript',body:bridge});
        return url.origin === 'http://127.0.0.1:8768' ? route.continue() : route.abort();
      });
      await page.goto(`http://127.0.0.1:8768/projects/${slug}/workspace/index.html`,{waitUntil:'domcontentloaded'});
      await page.locator('[data-scorm-save]').waitFor({state:automatic ? 'attached' : 'visible'});
      assert.equal(await page.locator('[data-scorm-save]').isEnabled(),true, await page.locator('[data-scorm-status]').innerText());
      return {context,page};
    }
    const first = await launch(seed);
    const page = first.page;
    await page.locator('[data-social-nav-group="student-tools"] > button').click();
    await page.locator('a[data-page-target="position-builder"]').first().click();
    await page.locator(`textarea[data-response-id="${toolId}"]`).fill('New position answer');
    await page.locator('#position-builder [data-tool-collect]').click();
    await page.locator('a[data-page-target="core-vocabulary"]').first().click();
    await page.locator('#core-vocabulary [data-vocabulary-record]:visible details').first().evaluate(e=>{(e as HTMLDetailsElement).open=true;});
    await page.locator(`textarea[data-response-id="${frayerId}"]`).fill('New Frayer notes');
    if (grade===10 && issue===1) {
      await page.locator('#core-vocabulary [data-vocabulary-record]:visible [data-vocabulary-term]').first().click();
      await page.keyboard.press('Escape');
      await page.evaluate(id=>{location.hash='#'+id;},required[0]);
      await page.locator('#'+required[0]).waitFor({state:'visible'});
      await page.locator('#'+required[0]+' [data-textbook-page]').first().click();
      await page.keyboard.press('Escape');
      await page.evaluate(id=>{location.hash='#'+id;},required[1]);
      await page.locator('#'+required[1]).waitFor({state:'visible'});
      await page.locator('#'+required[1]+' [data-complete-id]').click();
      await page.evaluate(()=>{location.hash='#textbook-practice';});
      await page.locator('#textbook-practice').waitFor({state:'visible'});
      await page.locator('[data-book-choose]').first().click();
      await page.locator('[data-book-record]:visible textarea').fill('Practice answer not copied to analytics');
      await page.locator('[data-book-record]:visible [data-book-save]').click();
      await page.locator('[data-book-record]:visible [data-book-collect]').click();
      await page.evaluate(()=>{location.hash='#core-vocabulary';});
      await page.locator('#core-vocabulary').waitFor({state:'visible'});
    }
    await page.clock.runFor(15000);
    await page.getByRole('button',{name:'Save now',exact:true}).click();
    const partial = await page.evaluate(()=> (window as any).__socialLms.values);
    assert.equal(partial['cmi.completion_status'],'incomplete');
    assert.equal(Number(partial['cmi.progress_measure']),(grade===10&&issue===1?2:1)/required.length);
    assert.equal(partial['cmi.location'],'core-vocabulary');
    assert.equal(partial['cmi.session_time'],'PT15.00S');
    assert.ok(!Object.keys(partial).some(k=>/score|success_status/.test(k)), 'Written work must not invent grades');
    const payload = JSON.parse(partial['cmi.suspend_data']);
    assert.equal(JSON.parse(payload.values[responses])[oldId],'Existing recall answer');
    assert.equal(JSON.parse(payload.values[responses])[toolId],'New position answer');
    assert.equal(JSON.parse(payload.values[responses])[frayerId],'New Frayer notes');
    assert.equal(JSON.parse(payload.values[evidence]).length,grade===10&&issue===1?3:2);
    assert.ok(payload.tracking.pageMs['core-vocabulary']>=14900);
    assert.equal(payload.tracking.visibleMs,15000);
    await page.getByRole('button',{name:'Save and Exit',exact:true}).click();
    assert.equal(await page.evaluate(()=> (window as any).__socialLms.terminated),1);
    assert.doesNotMatch(await page.locator('[data-scorm-status]').innerText(),/reporting is unavailable/);
    const saved = await page.evaluate(()=> (window as any).__socialLms.values['cmi.suspend_data']);
    const interactionValues = await page.evaluate(()=> (window as any).__socialLms.values);
    const actionRows = Object.entries(interactionValues).filter(([k])=>k.endsWith('.learner_response')).map(([,v])=>JSON.parse(v as string));
    for (const action of ['page-view','answer-edit','evidence-collected','content-time']) assert.ok(actionRows.some(r=>r.action===action),slug+': missing '+action);
    if(grade===10&&issue===1) for(const action of ['vocabulary-opened','reading-opened','practice-opened','practice-save-clicked','lesson-completed']) assert.ok(actionRows.some(r=>r.action===action),'missing '+action);
    assert.equal(actionRows.find(r=>r.action==='answer-edit'&&r.target===toolId).count,1);
    assert.ok(!JSON.stringify(actionRows).includes('New position answer'));
    await first.context.close();
    const reopened = await launch(saved,interactionValues);
    assert.equal(new URL(reopened.page.url()).hash,'#core-vocabulary');
    const restored = await reopened.page.evaluate(({responses,evidence})=>({answers:JSON.parse(localStorage.getItem(responses)!),bank:JSON.parse(localStorage.getItem(evidence)!)}),{responses,evidence});
    assert.equal(restored.answers[oldId],'Existing recall answer');
    assert.equal(restored.answers[toolId],'New position answer');
    assert.equal(restored.answers[frayerId],'New Frayer notes');
    assert.equal(restored.bank.find((e:any)=>e.id==='old-evidence').detail,'Existing Evidence Bank entry');
    await reopened.page.locator('a[data-page-target="position-builder"]').first().click();
    await reopened.page.locator(`textarea[data-response-id="${toolId}"]`).fill('Second position revision');
    await reopened.page.locator('a[data-page-target="core-vocabulary"]').first().click();
    await reopened.page.evaluate(({complete,required})=>localStorage.setItem(complete,JSON.stringify(required)),{complete,required});
    await reopened.page.clock.runFor(15000);
    await reopened.page.getByRole('button',{name:'Save now',exact:true}).click();
    const finished = await reopened.page.evaluate(()=> (window as any).__socialLms.values);
    assert.equal(finished['cmi.completion_status'],'completed');
    assert.equal(finished['cmi.progress_measure'],'1');
    const editedRow = Object.entries(finished).filter(([k])=>k.endsWith('.learner_response')).map(([,v])=>JSON.parse(v as string)).find(r=>r.action==='answer-edit'&&r.target===toolId);
    assert.equal(editedRow.count,2,'Edit counter continues across launches');
    const toolRowId = 'canvas-helper:answer-edit:' + encodeURIComponent(toolId);
    const rowsBefore = Object.entries(interactionValues).filter(([,v])=>v===toolRowId).map(([k])=>k);
    const rowsAfter = Object.entries(finished).filter(([,v])=>v===toolRowId).map(([k])=>k);
    assert.deepEqual(rowsAfter,rowsBefore,'Repeat edits reuse the same interaction row');
    assert.equal(JSON.parse(finished['cmi.suspend_data']).tracking.activeMs,30000);
    if (grade===10 && issue===1) {
      await reopened.page.locator('a[data-page-target="position-builder"]').first().click();
      await reopened.page.locator(`textarea[data-response-id="${toolId}"]`).fill('Revision with report retry');
      await reopened.page.evaluate(key=>{(window as any).__socialLms.reject=key;},rowsBefore[0].replace(/\.id$/,'.learner_response'));
      await reopened.page.getByRole('button',{name:'Save now',exact:true}).click();
      assert.equal(await reopened.page.evaluate(()=> (window as any).__socialLms.terminated),0);
      assert.match(await reopened.page.locator('[data-scorm-status]').innerText(),/work and session time were saved/);
      assert.ok((await reopened.page.evaluate(()=> (window as any).__socialLms.values['cmi.suspend_data'])).includes('Revision with report retry'));
      const rejectedExit = await launch(saved,interactionValues);
      await rejectedExit.page.locator('a[data-page-target="position-builder"]').first().click();
      await rejectedExit.page.locator(`textarea[data-response-id="${toolId}"]`).fill('Exit despite optional report rejection');
      await rejectedExit.page.evaluate(key=>{(window as any).__socialLms.reject=key;},rowsBefore[0].replace(/\.id$/,'.learner_response'));
      await rejectedExit.page.getByRole('button',{name:'Save and Exit',exact:true}).click();
      assert.equal(await rejectedExit.page.evaluate(()=> (window as any).__socialLms.terminated),1);
      assert.match(await rejectedExit.page.locator('[data-scorm-status]').innerText(),/activity reporting is unavailable/);
      await rejectedExit.context.close();
      await reopened.page.evaluate(()=>{(window as any).__socialLms.reject='';});
      await reopened.page.getByRole('button',{name:'Save now',exact:true}).click();
      const prior = await reopened.page.evaluate(()=> (window as any).__socialLms.values['cmi.suspend_data']);
      await reopened.page.evaluate(key=>localStorage.setItem(key,'x'.repeat(61000)),responses);
      await reopened.page.getByRole('button',{name:'Save and Exit',exact:true}).click();
      assert.equal(await reopened.page.evaluate(()=> (window as any).__socialLms.values['cmi.suspend_data']),prior);
      assert.equal(await reopened.page.evaluate(()=> (window as any).__socialLms.terminated),0);
      assert.match(await reopened.page.locator('[data-scorm-status]').innerText(),/more saved work/);
      await reopened.page.evaluate(({responses,answers})=>{localStorage.setItem(responses,JSON.stringify(answers));(window as any).__socialLms.fail=true;},{responses,answers:restored.answers});
      await reopened.page.getByRole('button',{name:'Save and Exit',exact:true}).click();
      assert.equal(await reopened.page.evaluate(()=> (window as any).__socialLms.terminated),0);
      assert.match(await reopened.page.locator('[data-scorm-status]').innerText(),/could not commit/);
      await reopened.page.evaluate(()=>{(window as any).__socialLms.fail=false;});
      await reopened.page.getByRole('button',{name:'Save and Exit',exact:true}).click();
      assert.equal(await reopened.page.evaluate(()=> (window as any).__socialLms.terminated),1);
    }
    await reopened.context.close();
    if(grade===10 && issue===1) {
      const timing = await launch(saved,interactionValues);
      await timing.page.clock.runFor(360000);
      await timing.page.getByRole('button',{name:'Save now',exact:true}).click();
      const timeState = await timing.page.evaluate(()=>JSON.parse((window as any).__socialLms.values['cmi.suspend_data']).tracking);
      assert.equal(timeState.visibleMs,375000);
      assert.equal(timeState.activeMs,315000);
      await timing.page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
      await timing.page.clock.runFor(60000);
      await timing.page.getByRole('button',{name:'Save now',exact:true}).click();
      const hiddenState = await timing.page.evaluate(()=>JSON.parse((window as any).__socialLms.values['cmi.suspend_data']).tracking);
      assert.equal(hiddenState.visibleMs,timeState.visibleMs);
      assert.equal(hiddenState.activeMs,timeState.activeMs);
      const row = await timing.page.evaluate(()=>Object.entries((window as any).__socialLms.values).filter(([k])=>k.endsWith('.learner_response')).map(([,v])=>JSON.parse(v as string)).find(r=>r.action==='content-time'&&r.target==='core-vocabulary'));
      assert.equal(row.idleSeconds,60000/1000);
      await timing.context.close();
    }
    if (html.includes('data-scorm-save-mode="automatic"')) {
      const auto = await launch(saved,interactionValues,true);
      assert.equal(await auto.page.locator('[data-scorm-controls]').isVisible(),false);
      assert.equal(await auto.page.locator('[data-scorm-save-exit]').count(),0);
      await auto.page.locator('a[data-page-target="position-builder"]').first().click();
      await auto.page.locator(`textarea[data-response-id="${toolId}"]`).fill('Automatically saved position');
      await auto.page.clock.runFor(2000);
      const autoSaved = await auto.page.evaluate(()=> (window as any).__socialLms.values['cmi.suspend_data']);
      assert.ok(autoSaved.includes('Automatically saved position'));
      assert.equal(await auto.page.evaluate(()=> (window as any).__socialLms.terminated),0);
      assert.equal(await auto.page.locator('[data-scorm-controls]').isVisible(),false);
      await auto.page.evaluate(()=>{(window as any).__socialLms.fail=true;});
      await auto.page.locator(`textarea[data-response-id="${toolId}"]`).fill('Commit failure must remain visible');
      await auto.page.clock.runFor(2000);
      assert.equal(await auto.page.locator('[data-scorm-controls]').isVisible(),true);
      assert.match(await auto.page.locator('[data-scorm-status]').innerText(),/could not commit/);
      await auto.page.evaluate(()=>{(window as any).__socialLms.fail=false;});
      await auto.page.getByRole('button',{name:'Save now',exact:true}).click();
      assert.equal(await auto.page.locator('[data-scorm-controls]').isVisible(),false);
      await auto.context.close();
      const autoReopen = await launch(autoSaved,{},true);
      assert.equal(await autoReopen.page.locator(`textarea[data-response-id="${toolId}"]`).evaluate((el:HTMLTextAreaElement)=>el.value),'Automatically saved position');
      await autoReopen.context.close();
    }
    results.push({slug,requiredLessons:required.length,stores:keys,features:report.features,actionReporting:'passed: stable ungraded rows, cumulative counts, per-page time, no answer text',simulatedLms:'passed',liveBrightspaceVerified:false});
    console.log(`${slug}: save/reopen, retained answers/evidence/Frayer notes, resume, completion and timing passed`);
  }
  fs.writeFileSync(process.env.SCORM_FOCUSED ? `projects/${(results[0] as any).slug}/meta/scorm-focused-check.json` : 'projects/social30-1-related-issue-1-option-2/meta/option-two-scorm-integration.json',JSON.stringify({schemaVersion:1,date:'2026-09-18',version:'2004',checks:results,uploadZipsCreated:false,liveBrightspaceVerified:false,deferred:['Actual generated ZIP asset/manifest verification','Brightspace pilot: attempt restoration, completion and timing displays','Broader course E2E and Studio lifecycle']},null,2)+'\n');
} finally { await browser.close(); }
