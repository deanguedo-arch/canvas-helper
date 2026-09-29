const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, stat } = require('node:fs/promises');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png', '.pdf':'application/pdf' };

for (const unit of ['a','b','c','d']) {
  const source = fs.readFileSync(path.join(root, `projects/science24-unit-${unit}/workspace/state-store.js`), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: `unit-${unit}-state-store.js` });
  const payload = sandbox.window.S24Storage.empty();
  payload.frayers.test = { fields: { meaning:'x'.repeat(320), features:'', example:'', nonexample:'' }, status:'draft', versions:[] };
  assert.equal(sandbox.window.S24Storage.validate(payload), true, `Unit ${unit} must retain long Frayer drafts`);
  const main = fs.readFileSync(path.join(root, `projects/science24-unit-${unit}/workspace/main.js`), 'utf8');
  assert.match(main, /const before=clone\(state\)[\s\S]{0,700}if\(!ok\)\{state=before/, `Unit ${unit} completion must roll back after failed save`);
}

for (const unit of ['b','c']) {
  const html = fs.readFileSync(path.join(root, `projects/science24-unit-${unit}/workspace/index.html`), 'utf8');
  const headings = html.match(/<h1\b[^>]*>/g) || [];
  assert.ok(headings.length > 0, `Unit ${unit} must expose route headings`);
  assert.ok(headings.every(heading => /\btabindex="-1"/.test(heading)), `Every Unit ${unit} route heading must accept programmatic focus`);
}

for (const unit of ['c','d']) {
  const html = fs.readFileSync(path.join(root, `projects/science24-unit-${unit}/workspace/index.html`), 'utf8');
  const reviewLesson = unit === 'c' ? '18' : '13';
  const match = new RegExp(`<section\\b[^>]*\\bid="lesson-${reviewLesson}"[^>]*>`).exec(html);
  const start = match?.index ?? -1;
  assert.notEqual(start, -1, `Unit ${unit} integrated review route must exist`);
  const end = html.indexOf('<section class="course-page"', start + 1);
  const review = html.slice(start, end === -1 ? undefined : end);
  assert.match(review, /Eight checked selections and two saved synthesis responses/, `Unit ${unit} review guide must describe its actual 8 + 2 task structure`);
}

const unitCData = fs.readFileSync(path.join(root, 'projects/science24-unit-c/workspace/course-data.json'), 'utf8');
assert.doesNotMatch(unitCData, /workbook key incorrectly claims|shown chart does not contain/i, 'Unit C current learner data must not retain the false Q12 source criticism');

const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) return res.writeHead(302, { location: pathname.replace(/\/$/, '') + '/index.html' }).end();
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/projects`;
  const browser = await chromium.launch({ headless:true });
  try {
    const context = await browser.newContext({ viewport:{ width:390, height:844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto(`${base}/science24-unit-a/workspace/#lesson-05`);
    await page.waitForSelector('body[data-ready="true"]');
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'lesson-05');
    assert.equal(await page.locator('#lesson-05 .energy-direction-panel').count(), 2);
    assert.equal(await page.locator('#lesson-05 img[src*="exo-endo-generated"]').count(), 0);
    assert.equal(await page.evaluate(() => S24_DATA.labeling.find(item => item.id === 's24-a-label-energy').image), 'assets/label-energy.svg');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 1), 'Unit A lesson 5 must not overflow at phone width');

    await page.evaluate(() => { location.hash = 'core-vocabulary'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'core-vocabulary');
    await page.locator('#vocab-detail [data-choose-word]').click();
    const longDraft = 'x'.repeat(320);
    await page.locator('#vocab-detail [data-frayer-field="meaning"]').fill(longDraft);
    for (const key of ['features','example','nonexample']) await page.locator(`#vocab-detail [data-frayer-field="${key}"]`).fill('Saved draft text');
    await page.waitForTimeout(500); // Autosave debounce is 350 ms; wait for this edit's transaction.
    await page.waitForFunction(() => document.querySelector('#save-status')?.textContent.startsWith('Saved in this browser'));
    await page.reload();
    await page.waitForSelector('body[data-ready="true"]');
    await page.evaluate(() => { location.hash = 'core-vocabulary'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'core-vocabulary');
    assert.equal(await page.locator('#vocab-detail [data-frayer-field="meaning"]').inputValue(), longDraft);
    await page.locator('#vocab-detail [data-collect-word]').click();
    await assert.rejects(async () => {
      await page.waitForFunction(() => document.querySelector('#vocab-detail [data-frayer-status]')?.textContent.includes('Collected.'), null, { timeout:400 });
    });
    assert.match(await page.locator('#vocab-detail [data-frayer-status]').textContent(), /shorten it before collecting/i);

    await page.evaluate(() => { location.hash = 'lesson-01'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'lesson-01');
    const required = page.locator('#lesson-01 [data-required]');
    await required.evaluate(element => { element.closest('details').open = true; });
    await required.locator('[data-start-required]').evaluate(button => button.click());
    const checkId = await required.getAttribute('data-required');
    const answers = await page.evaluate(id => S24_DATA.checks[id].questions.map(question => ({ id:question.id, answer:question.answer })), checkId);
    for (const answer of answers) {
      await required.locator(`input[data-required-answer="${answer.id}"][value="${answer.answer}"]`).check();
      await required.locator(`[data-check-required="${answer.id}"]`).click();
      await required.locator(`[data-qid="${answer.id}"] .feedback`).waitFor();
    }
    const writingIds = await page.evaluate(id => S24_DATA.checks[id].writing.map(item => item.id), checkId);
    for (const id of writingIds) {
      await required.locator(`[data-required-writing="${id}"]`).fill('A complete saved explanation for the focused persistence check.');
      await required.locator(`[data-save-writing="${id}"]`).click();
      await page.waitForFunction(value => document.querySelector(`[data-writing-status="${value}"]`)?.textContent === 'Saved written response', id);
    }
    await page.evaluate(() => {
      const original = IDBDatabase.prototype.transaction;
      IDBDatabase.prototype.transaction = function(names, mode, ...rest) {
        if (mode === 'readwrite') throw new DOMException('Simulated storage full', 'QuotaExceededError');
        return original.call(this, names, mode, ...rest);
      };
    });
    await required.locator('[data-finish-required]').click();
    await page.waitForFunction(() => !document.querySelector('#save-alert').hidden);
    assert.match(await required.locator('.run-status').textContent(), /Completion was not saved/);
    assert.equal(await required.locator('[data-finish-required]').count(), 1, 'Failed completion must keep the active run visible');
    assert.doesNotMatch(await page.locator('[data-progress-count]').textContent(), /1 of 15/);

    await page.goto(`${base}/science24-unit-c/workspace/#lesson-15`);
    await page.waitForSelector('body[data-ready="true"]');
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'lesson-15');
    assert.equal(await page.locator('#lesson-15 [data-figure-id="pedigree-q11"]').count(), 1);
    assert.equal(await page.locator('#lesson-15 [data-figure-id="pedigree-q12"]').count(), 1);
    assert.match(await page.locator('#lesson-15').innerText(), /different pedigrees/i);
    assert.match(await page.locator('#lesson-15').innerText(), /supports recessive inheritance/i);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 1), 'Unit C lesson 15 must not overflow at phone width');

    await page.evaluate(() => { location.hash = 'lesson-18'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'lesson-18');
    assert.match(await page.locator('#lesson-18 .page-guide').textContent(), /Eight checked selections and two saved synthesis responses/);

    await page.goto(`${base}/science24-unit-d/workspace/#lesson-05`);
    await page.waitForSelector('body[data-ready="true"]');
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'lesson-05');
    assert.equal(await page.locator('#lesson-05 .motion-graph-source picture').count(), 1);
    assert.equal(await page.locator('#lesson-05 .motion-graph-source img').count(), 1);
    assert.match(await page.locator('#lesson-05 .motion-graph-source img').evaluate(element => element.currentSrc), /figure-motion-graphs-mobile\.jpg$/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 1), 'Unit D lesson 5 must not overflow at phone width');
    assert.deepEqual(errors, []);
    console.log('PASS: A–D long Frayer draft validation and completion rollback source checks; A05 phone figure/labeling; A real-browser long-draft reload and failed completion retention; C15 source separation and C18 guide; D05 single responsive graph figure');
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode=1; });
