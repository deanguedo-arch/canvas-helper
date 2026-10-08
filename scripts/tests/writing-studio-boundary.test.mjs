import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, relative } from 'node:path';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { canonical, decodeState, encodeState, strictJSON } from '../../projects/nextstep-writing-studio/workspace/app/codec.js';

const root = resolve('projects/nextstep-writing-studio/workspace');
const synthetic = { tenantKey: 'qa-tenant-private', deploymentScope: 'qa-writing-2026',
  appVersion: '2.0.0-test', tenantSaveLabelVerified: false, status: 'APPROVED' };
const bundle = (await build({ entryPoints: [resolve(root, 'app/main.js')], bundle: true, write: false,
  format: 'iife', platform: 'browser', target: ['es2022'], plugins: [{ name: 'test-config', setup(build) {
    build.onLoad({ filter: /deployment-config\.json$/ }, () => ({ contents: `export default ${JSON.stringify(synthetic)};`, loader: 'js' }));
  } }] })).outputFiles[0].text;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.ttf':'font/ttf' };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
    if (relative(root, path).startsWith('..')) throw Error('Outside workspace');
    const served = path === root ? resolve(root, 'index.html') : path;
    const bytes = await readFile(served);
    res.writeHead(200, { 'Content-Type': types[extname(served)] || 'application/octet-stream' }); res.end(bytes);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch (error) { server.close(); throw error; }

const modelSource=(await build({entryPoints:[resolve(root,'app/model.js')],bundle:true,write:false,format:'esm',platform:'node',target:['node22']})).outputFiles[0].text;
const {newWorkspace,newProject,documentText,validateWorkspace,validateBackup}=await import(`data:text/javascript;base64,${Buffer.from(modelSource).toString('base64')}`);

async function pageFor({ wire = '', readFailure = false, writeFailure = false, commitFailure = false,
  initializeFailure = false, mode = 'normal', apiDelay=0, waitUntilReady=true, forceIndexedDb = false, localCache = null } = {}) {
  const context = await browser.newContext();
  await context.addInitScript(input => {
    if (input.forceIndexedDb) Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true });
    if (input.localCache) sessionStorage.setItem(`nextstep-writing-studio:${input.localCache.binding.deploymentScope}:${input.localCache.binding.learnerKey}`, JSON.stringify(input.localCache));
    const values = { 'cmi.learner_id': 'test-learner-1', 'cmi.mode': input.mode,
      'cmi.entry': input.wire ? 'resume' : 'ab-initio', 'cmi.suspend_data': input.wire,
      'cmi.location': '', 'cmi.completion_status': 'incomplete' };
    let error = '0';
    window.__mock = { values, calls: [] };
    const api = {
      Initialize: () => { window.__mock.calls.push('Initialize'); error = input.initializeFailure ? '101' : '0'; return input.initializeFailure ? 'false' : 'true'; },
      GetValue: key => { window.__mock.calls.push(`GetValue:${key}`); error = input.readFailure && key === 'cmi.suspend_data' ? '101' : '0'; return values[key] ?? ''; },
      SetValue: (key, value) => { window.__mock.calls.push(`SetValue:${key}`); error = input.writeFailure && key === 'cmi.suspend_data' ? '101' : '0';
        if (error !== '0') return 'false'; values[key] = value; return 'true'; },
      Commit: () => { window.__mock.calls.push('Commit'); error = input.commitFailure ? '101' : '0'; return input.commitFailure ? 'false' : 'true'; },
      Terminate: () => { window.__mock.calls.push('Terminate'); error = '0'; return 'true'; },
      GetLastError: () => error, GetErrorString: () => error
    };
    if(input.apiDelay)setTimeout(()=>window.API_1484_11=api,input.apiDelay);else window.API_1484_11=api;
  }, { wire, readFailure, writeFailure, commitFailure, initializeFailure, mode, apiDelay, forceIndexedDb, localCache });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', async dialog => { errors.push(`dialog: ${dialog.message()}`); await dialog.dismiss(); });
  await page.route('**/writing-studio.bundle.js', route => route.fulfill({ status: 200, body: bundle, contentType: 'text/javascript' }));
  await page.goto(url + '#/projects');
  if(waitUntilReady)await page.locator('#save-indicator').filter({ hasNotText: 'Opening' }).waitFor();
  return { page, context, errors };
}

test('SCORM save reopens with the same draft in a clean browser context', async () => {
  const first = await pageFor();
  assert.ok(!(await first.page.evaluate(() => window.__mock.calls)).some(call => call.startsWith('SetValue:')));
  await first.page.getByRole('link', { name: 'New essay' }).first().click();
  await first.page.locator('#title').fill('Transport essay');
  await first.page.getByRole('button', { name: 'Create essay' }).click();
  await first.page.getByRole('link', { name: 'Draft', exact: true }).click();
  await first.page.locator('.ProseMirror').fill('A draft that must survive a clean reopening.');
  await first.page.getByText('LMS player accepted save').first().waitFor({ timeout: 8000 });
  const wire = await first.page.evaluate(() => window.__mock.values['cmi.suspend_data']);
  assert.match(wire, /^WS1\.[0-9a-f]{64}\./);
  assert.ok(wire.length <= 56000);
  assert.deepEqual(first.errors, []);
  await first.context.close();
  const second = await pageFor({ wire });
  await second.page.getByRole('link', { name: 'Open project' }).click();
  await second.page.getByRole('link', { name: 'Draft', exact: true }).click();
  await second.page.locator('.ProseMirror').getByText('A draft that must survive a clean reopening.').waitFor();
  assert.deepEqual(second.errors, []);
  await second.context.close();
});

test('a failed required read enters recovery without writing', async () => {
  const { page, context } = await pageFor({ readFailure: true });
  await page.getByRole('heading', { name: 'Recovery needed' }).waitFor();
  const calls = await page.evaluate(() => window.__mock.calls);
  assert.ok(!calls.some(call => call.startsWith('SetValue:')));
  await context.close();
});

test('a false Initialize result enters recovery without writing', async () => {
  const { page, context } = await pageFor({ initializeFailure: true });
  await page.getByRole('heading', { name: 'Recovery needed' }).waitFor();
  const calls = await page.evaluate(() => window.__mock.calls);
  assert.ok(!calls.some(call => call.startsWith('SetValue:')));
  await context.close();
});

test('a malformed persisted payload enters recovery without writing', async () => {
  const { page, context } = await pageFor({ wire: 'WS1.bad.invalid' });
  await page.getByRole('heading', { name: 'Recovery needed' }).waitFor();
  const calls = await page.evaluate(() => window.__mock.calls);
  assert.ok(!calls.some(call => call.startsWith('SetValue:')));
  await context.close();
});

test('a failed LMS write keeps the tab copy and never claims success', async () => {
  const { page, context } = await pageFor({ writeFailure: true });
  await page.getByRole('link', { name: 'New essay' }).first().click();
  await page.locator('#title').fill('Pending essay');
  await page.getByRole('button', { name: 'Create essay' }).click();
  await page.getByText(/Save not confirmed:/).first().waitFor({ timeout: 8000 });
  assert.match(await page.locator('#save-indicator').textContent(), /Save not confirmed/);
  const local = await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('nextstep-writing-studio:')).map(key => JSON.parse(sessionStorage.getItem(key))));
  assert.equal(local.length, 1);
  assert.equal(local[0].workspace.projects[0].title, 'Pending essay');
  await context.close();
});

test('a false Commit result remains pending and never claims success', async () => {
  const { page, context } = await pageFor({ commitFailure: true });
  await page.getByRole('link', { name: 'New essay' }).first().click();
  await page.locator('#title').fill('Commit failure essay');
  await page.getByRole('button', { name: 'Create essay' }).click();
  await page.getByText(/Save not confirmed:/).first().waitFor({ timeout: 8000 });
  const calls = await page.evaluate(() => window.__mock.calls);
  assert.ok(calls.includes('SetValue:cmi.suspend_data'));
  assert.ok(calls.includes('Commit'));
  await context.close();
});

test('a second same-origin tab cannot edit the same learner workspace', async () => {
  const first = await pageFor();
  await first.page.getByRole('heading', { name: 'My Work', exact: true }).waitFor();
  const second = await first.context.newPage();
  await second.route('**/writing-studio.bundle.js', route => route.fulfill({ status: 200, body: bundle, contentType: 'text/javascript' }));
  await second.goto(url + '#/projects');
  await second.getByText('Another tab is editing this workspace.').first().waitFor();
  const buttons = second.getByRole('button', { name: 'New essay' });
  assert.equal(await buttons.count(), 0);
  await first.context.close();
});

test('IndexedDB lease fallback permits only one editor tab', async () => {
  const first = await pageFor({ forceIndexedDb: true });
  await first.page.getByRole('heading', { name: 'My Work', exact: true }).waitFor();
  const second = await first.context.newPage();
  await second.route('**/writing-studio.bundle.js', route => route.fulfill({ status: 200, body: bundle, contentType: 'text/javascript' }));
  await second.goto(url + '#/projects');
  await second.getByText('Another tab is editing this workspace.').first().waitFor({ timeout: 8000 });
  await first.context.close();
});

test('WS1 round-trips Unicode and rejects an inflation bomb', async () => {
  const value = { title: 'résumé — 漢字', list: [1, '🌿'], active: true };
  assert.equal(canonical(await decodeState(await encodeState(value))), canonical(value));
  assert.throws(() => strictJSON('{"title":"one","title":"two"}'), /Duplicate JSON key/);
  const raw = Buffer.alloc(1048577, 65);
  const digest = createHash('sha256').update(raw).digest('hex');
  const wire = `WS1.${digest}.${gzipSync(raw).toString('base64')}`;
  await assert.rejects(decodeState(wire), /Inflated payload bound/);
});

async function emptyBoundWire(overrides = {}) {
  const learnerKey = createHash('sha256').update('qa-tenant-private\0qa-writing-2026\0test-learner-1').digest('hex');
  const timestamp = '2026-10-06T18:00:00Z';
  const workspace = { workspaceId: 'workspace-test-0001', revision: 0, headId: 'workspace-head-0001',
    createdAt: timestamp, updatedAt: timestamp, activeProjectId: null, projects: [],
    preferences: { track: 'general', editorFont: 'serif', editorFontSize: 19, lineHeight: 1.7,
      highContrast: false, reduceMotion: 'system', localRecovery: 'session' },
    library: { bookmarks: [] }, activity: [], imports: [] };
  return encodeState({ format: 'nextstep.writing-studio.state', schemaVersion: 1, appVersion: '2.0.0-test',
    binding: { deploymentScope: overrides.deploymentScope || 'qa-writing-2026', learnerKey: overrides.learnerKey || learnerKey }, workspace });
}

test('wrong learner binding is recovery-only and reveals no project controls', async () => {
  const wire = await emptyBoundWire({ learnerKey: '0'.repeat(64) });
  const { page, context } = await pageFor({ wire });
  await page.getByRole('heading', { name: 'Recovery needed' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'New essay' }).count(), 0);
  assert.ok(!(await page.evaluate(() => window.__mock.calls)).some(call => call.startsWith('SetValue:')));
  await context.close();
});

test('wrong deployment scope is recovery-only', async () => {
  const wire = await emptyBoundWire({ deploymentScope: 'qa-other-course-2026' });
  const { page, context } = await pageFor({ wire });
  await page.getByRole('heading', { name: 'Recovery needed' }).waitFor();
  assert.ok(!(await page.evaluate(() => window.__mock.calls)).some(call => call.startsWith('SetValue:')));
  await context.close();
});

test('review mode shows a bound workspace without writing', async () => {
  const wire = await emptyBoundWire();
  const { page, context } = await pageFor({ wire, mode: 'review' });
  await page.getByText('Brightspace review mode: view and export only.').first().waitFor();
  assert.ok(!(await page.evaluate(() => window.__mock.calls)).some(call => call.startsWith('SetValue:')));
  await context.close();
});

test('review mode with conflicting recovery data offers export but no editing path', async () => {
  const wire = await emptyBoundWire();
  const { binding, workspace } = await decodeState(wire);
  const local = structuredClone(workspace); local.headId = 'different-head';
  const localCache = { binding, workspace: local, headId: local.headId, baseRemoteHash: 'different-hash' };
  const { page, context } = await pageFor({ wire, mode: 'review', localCache });
  await page.getByRole('heading', { name: 'Recovery needed' }).waitFor();
  assert.equal(await page.getByRole('button', { name: /Continue with/ }).count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Export this-tab copy' }).count(), 1);
  assert.ok(!(await page.evaluate(() => window.__mock.calls)).some(call => call.startsWith('SetValue:')));
  await context.close();
});

test('a conflicting recovery copy cannot bypass another tab editing lock', async () => {
  const wire = await emptyBoundWire();
  const { binding, workspace } = await decodeState(wire);
  const first = await pageFor({ wire });
  await first.page.getByRole('heading', { name: 'My Work', exact: true }).waitFor();
  const local = structuredClone(workspace); local.headId = 'different-head';
  const localCache = { binding, workspace: local, headId: local.headId, baseRemoteHash: 'different-hash' };
  await first.context.addInitScript(cache => {
    sessionStorage.setItem(`nextstep-writing-studio:${cache.binding.deploymentScope}:${cache.binding.learnerKey}`, JSON.stringify(cache));
  }, localCache);
  const second = await first.context.newPage();
  second.on('dialog', async dialog => { if (dialog.type() === 'confirm') await dialog.accept(); else await dialog.dismiss(); });
  await second.route('**/writing-studio.bundle.js', route => route.fulfill({ status: 200, body: bundle, contentType: 'text/javascript' }));
  await second.goto(url + '#/projects');
  await second.getByRole('heading', { name: 'Recovery needed' }).waitFor();
  await second.getByRole('button', { name: 'Continue with LMS copy' }).click();
  await second.getByRole('heading', { name: 'Recovery needed' }).waitFor();
  assert.ok(!(await second.evaluate(() => window.__mock.calls)).some(call => call.startsWith('SetValue:')));
  await first.context.close();
});

test('teaching practice and labelled models reopen without changing an existing draft', async () => {
  const first = await pageFor();
  await first.page.getByRole('link', { name: 'New essay', exact: true }).click();
  await first.page.locator('#title').fill('Existing assignment');
  await first.page.getByRole('button', { name: 'Create essay' }).click();
  await first.page.getByRole('link', { name: 'Draft', exact: true }).click();
  await first.page.locator('.ProseMirror').fill('My independent draft must stay untouched.');
  await first.page.evaluate(()=>location.hash='/lessons');
  await first.page.getByRole('link', { name: 'Move from summary to analysis', exact: true }).click();
  const response = 'Keeping the object suggests that leaving has not ended its emotional importance.';
  await first.page.locator('#practice-answer').fill(response);
  await first.page.getByRole('button', { name: 'Save practice to my notes', exact: true }).click();
  await first.page.getByText('Practice recorded in your notebook. Check the save status above.').waitFor();
  await first.page.evaluate(()=>location.hash='/explorer/characterization');
  await first.page.getByRole('button', { name: 'Keep this model in my notes', exact: true }).click();
  await first.page.evaluate(()=>location.hash='/study-notes');
  await first.page.getByText(/Original teaching model ·/).first().waitFor();
  await first.page.getByText(response, { exact: true }).waitFor();
  const wire = await first.page.evaluate(() => window.__mock.values['cmi.suspend_data']);
  const decoded = await decodeState(wire);
  assert.equal(decoded.workspace.projects.length, 2);
  assert.equal(decoded.workspace.projects[0].draft.doc.content[0].content[0].text, 'My independent draft must stay untouched.');
  assert.equal(decoded.workspace.projects[1].notes.length, 2);
  assert.deepEqual(first.errors, []);
  await first.context.close();
  const second = await pageFor({ wire });
  await second.page.evaluate(()=>location.hash='/lessons');
  await second.page.getByRole('link', { name: 'Move from summary to analysis', exact: true }).click();
  assert.equal(await second.page.locator('#practice-answer').inputValue(), response);
  assert.deepEqual(second.errors, []);
  await second.context.close();
});

test('review mode keeps lessons usable and makes no writes on close', async () => {
  const { page, context } = await pageFor({ wire: await emptyBoundWire(), mode: 'review' });
  await page.evaluate(()=>location.hash='/critical/explain');
  await page.getByRole('heading', { name: 'Explain the evidence', exact:true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Save practice to my notes', exact: true }).isEnabled(), false);
  await page.locator('#practice-answer').fill('Unsaved independent practice is still available.');
  await page.evaluate(() => window.addEventListener('pagehide', () => sessionStorage.setItem('qa-closed-calls', JSON.stringify(window.__mock.calls))));
  await page.goto(url + '?close-proof=1#/projects');
  const calls = await page.evaluate(() => JSON.parse(sessionStorage.getItem('qa-closed-calls')));
  assert.ok(!calls.some(call => call.startsWith('SetValue:')));
  await context.close();
});

test('corrupt restore allows teaching but no saved changes or exit writes', async () => {
  const { page, context } = await pageFor({ wire: 'WS1.bad.invalid' });
  await page.getByRole('heading', { name: 'Recovery needed' }).waitFor();
  await page.evaluate(()=>location.hash='/critical/explain');
  await page.getByRole('heading', { name: 'Explain the evidence', exact:true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Save practice to my notes', exact: true }).isEnabled(), false);
  await page.evaluate(() => window.addEventListener('pagehide', () => sessionStorage.setItem('qa-corrupt-close', JSON.stringify(window.__mock.calls))));
  await page.goto(url + '?corrupt-close-proof=1#/projects');
  const calls = await page.evaluate(() => JSON.parse(sessionStorage.getItem('qa-corrupt-close')));
  assert.ok(!calls.some(call => call.startsWith('SetValue:')));
  await context.close();
});



async function boundWorkspace(workspace) {
  const envelope=await decodeState(await emptyBoundWire());envelope.workspace=validateWorkspace(workspace);return encodeState(envelope);
}
async function downloadText(download) { return readFile(await download.path(),'utf8'); }
async function openRoute(page,path) { await page.evaluate(path=>location.hash=path,path); }
async function createEssay(page,title) {
  await openRoute(page,'/projects/new');await page.locator('#title').fill(title);
  assert.equal(await page.locator('#type').inputValue(),'critical-analysis');
  assert.equal(await page.locator('select#type').count(),0);
  assert.equal(await page.title(),'Critical Essay Studio');
  await page.getByRole('button',{name:'Create essay',exact:true}).click();
  await page.getByRole('heading',{name:'Plan Your Essay',exact:true}).waitFor();
  return (await page.evaluate(()=>location.hash)).split('/')[2];
}

test('critical preset saves and reopens a free-order essay with source evidence',async()=>{
  const first=await pageFor();const {page}=first;const id=await createEssay(page,'A new English 30-1 essay');
  const card=page.locator('.ws-plan-card').filter({has:page.getByRole('heading',{name:'Controlling Idea',exact:true})});
  await card.getByRole('button',{name:'Edit',exact:true}).click();
  await page.locator('[name="plan-value"]').fill('Responsibility can deepen belonging when judgment serves a changing need.');
  await page.getByRole('button',{name:'Save plan',exact:true}).click();
  // Enter Revision before Evidence and Draft: there is no completion gate.
  await page.getByRole('link',{name:'Revision',exact:true}).click();
  await page.getByRole('heading',{name:'Thought and Understanding',exact:true}).waitFor();
  await page.getByRole('link',{name:'Evidence',exact:true}).click();await page.getByRole('button',{name:'Add evidence',exact:true}).click();
  await page.locator('#content').fill('My verified quotation from my own studied text.');
  await page.locator('#analysis').fill('The contrast changes the role of the central character.');
  await page.locator('#sourceTitle').fill('My studied text');await page.locator('#creator').fill('A text creator');await page.locator('#locator').fill('chapter 4');
  await page.getByRole('button',{name:'Save evidence',exact:true}).click();
  await page.getByRole('link',{name:'Draft',exact:true}).click();
  assert.equal((await page.locator('.ProseMirror').innerText()).trim(),''); // examples never enter the draft
  await page.locator('.ProseMirror').fill('My independently written essay, kept separate from teaching models.');
  await page.getByRole('button',{name:'Save now',exact:true}).click();
  const wire=await page.evaluate(()=>window.__mock.values['cmi.suspend_data']);const {workspace}=await decodeState(wire);
  assert.equal(workspace.projects[0].track,'english-30-1');assert.equal(workspace.projects[0].type,'critical-analysis');assert.equal(workspace.projects[0].plan.length,5);
  assert.equal(workspace.projects[0].evidence[0].content,'My verified quotation from my own studied text.');
  assert.equal(workspace.projects[0].sources[0].title,'My studied text');assert.deepEqual(first.errors,[]);await first.context.close();
  const reopened=await pageFor({wire});await openRoute(reopened.page,`/project/${id}/plan`);
  await reopened.page.getByText('Responsibility can deepen belonging when judgment serves a changing need.',{exact:true}).waitFor();
  await reopened.page.getByRole('link',{name:'Draft',exact:true}).click();assert.equal((await reopened.page.locator('.ProseMirror').innerText()).trim(),'My independently written essay, kept separate from teaching models.');
  assert.deepEqual(reopened.errors,[]);await reopened.context.close();
});

test('critical refocus preserves historical projects plans IDs notebooks and backups',async()=>{
  const workspace=newWorkspace();const old=newProject({title:'Earlier critical draft',type:'critical-analysis',track:'general'});
  old.plan=[{id:'historical-plan-section',kind:'text',label:'Earlier thesis',prompt:'Original hint',value:'My historical thesis',items:[]}];
  old.draft.doc.content[0].content=[{type:'text',text:'The existing essay must not be migrated or rewritten.'}];
  const notebook=newProject({title:'Writing Studio learning notebook',type:'short-response',practiceMode:true,prompt:'Writing Studio learning notebook. Practice and notes shared across assignments.'});
  notebook.notes=[{id:'historical-note-0001',title:'Earlier practice',body:'My saved earlier practice.',kind:'note',originLabel:'learning:lesson:beyond-summary',dateReceived:null,blockId:null,addressed:false,createdAt:notebook.createdAt,updatedAt:notebook.updatedAt}];
  const personal=newProject({title:'Earlier personal response',type:'personal-response',track:'english-30-1'});
  workspace.projects=[old,notebook,personal];workspace.activeProjectId=old.id;
  const first=await pageFor({wire:await boundWorkspace(workspace)});const {page}=first;
  await openRoute(page,`/project/${old.id}/plan`);await page.getByText('My historical thesis',{exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Controlling Idea',exact:true}).count(),0);
  await openRoute(page,'/lessons/beyond-summary');assert.equal(await page.locator('#practice-answer').inputValue(),'My saved earlier practice.');
  await page.locator('#practice-answer').fill('My updated earlier practice.');await page.getByRole('button',{name:'Save practice to my notes',exact:true}).click();
  await page.getByText('Practice recorded in your notebook. Check the save status above.').waitFor();
  await openRoute(page,'/critical/interpretation');await page.locator('#practice-answer').fill('My new critical practice.');await page.getByRole('button',{name:'Save practice to my notes',exact:true}).click();await page.getByText('Practice recorded in your notebook. Check the save status above.').waitFor();
  const stored=(await decodeState(await page.evaluate(()=>window.__mock.values['cmi.suspend_data']))).workspace;
  assert.equal(stored.projects.length,3);assert.equal(canonical(stored.projects[0]),canonical(old));assert.equal(canonical(stored.projects[2]),canonical(personal));assert.equal(stored.projects[1].notes[0].id,'historical-note-0001');assert.equal(stored.projects[1].notes.length,2);
  await openRoute(page,'/settings');const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export backup',exact:true}).click();const bytes=await downloadText(await downloadPromise);const backup=JSON.parse(bytes);validateBackup(backup);assert.equal(backup.kind,'studio');assert.equal(backup.payload.projects[0].id,old.id);
  await page.locator('#backup-file').setInputFiles({name:'round-trip.wstudio',mimeType:'application/json',buffer:Buffer.from(bytes)});
  await page.getByRole('heading',{name:'Review backup import',exact:true}).waitFor();await page.getByRole('button',{name:'Import as new copies',exact:true}).click();
  await page.getByRole('heading',{name:'My Work',exact:true}).waitFor();
  await page.locator('#save-indicator').click(); // existing status opens Settings; ensure pending save flush below via button
  await openRoute(page,'/settings');await page.getByRole('button',{name:'Save now',exact:true}).click();
  const roundtrip=(await decodeState(await page.evaluate(()=>window.__mock.values['cmi.suspend_data']))).workspace;
  assert.equal(roundtrip.projects.length,6);assert.equal(canonical(roundtrip.projects.find(item=>item.id===old.id)),canonical(old));
  const copy=roundtrip.projects.find(item=>item.id!==old.id&&documentText(item.draft.doc)==='The existing essay must not be migrated or rewritten.');assert.ok(copy);assert.notEqual(copy.plan[0].id,old.plan[0].id);assert.equal(copy.plan[0].value,old.plan[0].value);
  assert.deepEqual(first.errors,[]);await first.context.close();
});

test('critical essays stay separate and exports contain only the selected work',async()=>{
  const fixture=await pageFor();const {page}=fixture;const firstId=await createEssay(page,'First essay');await page.getByRole('link',{name:'Draft',exact:true}).click();await page.locator('.ProseMirror').fill('FIRST ESSAY ONLY');
  const secondId=await createEssay(page,'Second essay');await page.getByRole('link',{name:'Draft',exact:true}).click();await page.locator('.ProseMirror').fill('SECOND ESSAY ONLY');await page.getByRole('button',{name:'Save now',exact:true}).click();
  page.removeAllListeners('dialog');page.on('dialog',dialog=>dialog.accept('txt'));let pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export',exact:true}).click();const txt=await downloadText(await pending);assert.match(txt,/SECOND ESSAY ONLY/);assert.doesNotMatch(txt,/FIRST ESSAY|Mara|teaching fiction/);
  await openRoute(page,'/settings');pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export project backup',exact:true}).click();const backup=JSON.parse(await downloadText(await pending));validateBackup(backup);assert.equal(backup.kind,'project');assert.equal(backup.payload.id,secondId);assert.equal(documentText(backup.payload.draft.doc),'SECOND ESSAY ONLY');
  await openRoute(page,`/project/${firstId}/draft`);assert.equal((await page.locator('.ProseMirror').innerText()).trim(),'FIRST ESSAY ONLY');assert.deepEqual(fixture.errors,[]);await fixture.context.close();
});

test('critical teaching needs no project and the supplied light views remain usable narrowly',async()=>{
  const fixture=await pageFor();const {page}=fixture;await openRoute(page,'/home');await page.getByRole('heading',{name:'Critical Essay Studio',exact:true}).waitFor();
  await openRoute(page,'/critical/model');await page.getByRole('heading',{name:'A Light Turned Outward',exact:true}).waitFor();await page.getByRole('button',{name:'Jump to annotated essay'}).click();
  for(const id of ['revision','task','language','openings','evidence','organization','interpretation','explain']){await openRoute(page,`/critical/${id}`);await page.locator('#practice-answer').waitFor();assert.ok(await page.getByRole('heading',{name:'Weaker to stronger',exact:true}).count());}
  assert.equal(await page.evaluate(()=>window.__mock.values['cmi.suspend_data']),'');assert.ok(!(await page.evaluate(()=>window.__mock.calls)).some(call=>call.startsWith('SetValue:')));
  await createEssay(page,'Visual review essay');await page.setViewportSize({width:1448,height:1100});await page.evaluate(()=>document.fonts.ready);await mkdir(resolve(root,'../meta/review'),{recursive:true});await page.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});await page.screenshot({path:resolve(root,'../meta/review/critical-plan-desktop.png'),fullPage:true});
  await openRoute(page,'/settings');await page.getByRole('heading',{name:'Settings',exact:true}).waitFor();await page.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});await page.screenshot({path:resolve(root,'../meta/review/critical-settings-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await openRoute(page,'/critical/explain');await page.locator('#practice-answer').waitFor();await page.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});await page.screenshot({path:resolve(root,'../meta/review/critical-teaching-narrow.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.getByRole('link',{name:'My Work',exact:true}).click();await page.getByRole('link',{name:'Open project',exact:true}).click();await page.getByRole('link',{name:'Plan',exact:true}).click();await page.getByRole('heading',{name:'Plan Your Essay',exact:true}).waitFor();await page.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});await page.screenshot({path:resolve(root,'../meta/review/critical-plan-narrow.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('img').evaluateAll(images=>images.filter(image=>image.complete&&image.naturalWidth===0).length),0);assert.deepEqual(fixture.errors,[]);await fixture.context.close();
});



test('critical review permits intended draft exports without writing',async()=>{
  const workspace=newWorkspace(),project=newProject({title:'Review draft',type:'critical-analysis',track:'english-30-1'});
  project.draft.doc.content[0].content=[{type:'text',text:'Only my review-mode draft belongs in this export.'}];workspace.projects=[project];workspace.activeProjectId=project.id;
  const fixture=await pageFor({wire:await boundWorkspace(workspace),mode:'review'});const {page}=fixture;
  await openRoute(page,`/project/${project.id}/draft`);assert.equal(await page.locator('.ProseMirror').getAttribute('contenteditable'),'false');
  page.removeAllListeners('dialog');page.on('dialog',dialog=>dialog.accept('html'));const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export',exact:true}).click();const html=await downloadText(await pending);
  assert.match(html,/Only my review-mode draft belongs in this export/);assert.doesNotMatch(html,/Mara|The Last Light|teaching story/);
  await page.getByRole('link',{name:'Revision',exact:true}).click();await page.getByRole('button',{name:'Style',exact:true}).click();await page.getByRole('heading',{name:'Matters of Choice',exact:true}).waitFor();assert.equal(await page.locator('#revision-notes').isEnabled(),false);
  assert.ok(!(await page.evaluate(()=>window.__mock.calls)).some(call=>call.startsWith('SetValue:')));assert.deepEqual(fixture.errors,[]);await fixture.context.close();
});


test('critical startup protects saved-work controls while teaching remains readable',async()=>{
  const fixture=await pageFor({apiDelay:1800,readFailure:true,waitUntilReady:false});const {page}=fixture;
  await openRoute(page,'/projects/new');await page.getByRole('heading',{name:'Opening your workspace…',exact:true}).waitFor();assert.equal(await page.locator('#new-project-form').count(),0);
  await openRoute(page,'/critical/task');await page.getByRole('heading',{name:'Understand the task and choose a text',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Save practice to my notes',exact:true}).isEnabled(),false);
  await page.locator('#save-indicator').filter({hasNotText:'Opening'}).waitFor();await openRoute(page,'/projects');await page.getByRole('heading',{name:'Recovery needed',exact:true}).waitFor();assert.ok(!(await page.evaluate(()=>window.__mock.calls)).some(call=>call.startsWith('SetValue:')));assert.deepEqual(fixture.errors,[]);await fixture.context.close();
});
test.after(async () => { await browser.close(); await new Promise(resolve => server.close(resolve)); });
