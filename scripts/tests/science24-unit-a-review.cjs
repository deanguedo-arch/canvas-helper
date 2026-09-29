const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const workspace = path.resolve(__dirname, '../../projects/science24-unit-a/workspace');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf' };
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(workspace, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(workspace + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForSelector('body[data-ready="true"]');
    const routes = await page.locator('.course-page').evaluateAll(nodes => nodes.map(node => node.id));
    assert.equal(routes.length, 28);
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of routes) {
        await page.evaluate(value => { location.hash = value; }, route);
        await page.waitForFunction(value => document.querySelector('.course-page:not([hidden])')?.id === value, route);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert.ok(overflow <= 1, `${route} overflows ${width}px viewport by ${overflow}px`);
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => { location.hash = 'textbook-practice'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'textbook-practice');
    assert.equal(await page.locator('#book-tiles [data-book-select]').count(), 21);
    await page.locator('#book-answer').fill('Question 1: evidence from the original page.');
    await page.locator('[data-book-save]').click();
    await page.waitForFunction(() => document.querySelector('[data-book-status]')?.textContent.startsWith('Saved.'));
    await page.locator('[data-enlarge-question]').click();
    assert.equal(await page.locator('#figure-dialog').evaluate(node => node.open), true);
    await page.keyboard.press('Escape');
    await page.reload();
    await page.waitForSelector('body[data-ready="true"]');
    await page.evaluate(() => { location.hash = 'textbook-practice'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'textbook-practice');
    assert.equal(await page.locator('#book-answer').inputValue(), 'Question 1: evidence from the original page.');
    await page.evaluate(() => { location.hash = 'core-vocabulary'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'core-vocabulary');
    await page.locator('#vocab-detail [data-choose-word]').click();
    for (const [key, value] of Object.entries({ meaning: 'Made by human-controlled chemistry', features: 'Designed for a use', example: 'Polymer fibre', nonexample: 'Untreated wool' })) {
      await page.locator(`#vocab-detail [data-frayer-field="${key}"]`).fill(value);
    }
    await page.locator('#vocab-detail [data-collect-word]').click();
    await page.waitForFunction(() => document.querySelector('#frayer-count')?.textContent.includes('1 of 8 collected'));
    await page.reload();
    await page.waitForSelector('body[data-ready="true"]');
    await page.evaluate(() => { location.hash = 'core-vocabulary'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'core-vocabulary');
    assert.equal(await page.locator('#vocab-detail [data-frayer-field="example"]').inputValue(), 'Polymer fibre');
    assert.match(await page.locator('#frayer-count').textContent(), /1 of 8 collected/);
    await page.evaluate(() => { location.hash = 'textbook-library'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'textbook-library');
    const keyLink = page.locator('.workbook-self-check a');
    assert.match(await keyLink.innerText(), /workbook key/i);
    const keyResponse = await page.request.get(new URL(await keyLink.getAttribute('href'), page.url()).href);
    assert.equal(keyResponse.status(), 200);
    assert.ok((await keyResponse.body()).subarray(0, 5).toString() === '%PDF-');
    await page.evaluate(() => { location.hash = 'video-library'; });
    await page.waitForFunction(() => document.querySelector('.course-page:not([hidden])')?.id === 'video-library');
    const videos = await page.locator('#video-select option').evaluateAll(nodes => nodes.map(node => node.value));
    assert.equal(videos.length, 8);
    for (const id of videos) {
      await page.locator('#video-select').selectOption(id);
      assert.ok((await page.locator('#video-library .concept-summary').innerText()).length > 60);
      assert.equal(await page.locator('#video-library iframe').count(), 0);
      assert.equal(await page.locator('#video-library [data-play-video]').getAttribute('data-play-video'), id);
    }
    assert.deepEqual(errors, []);
    console.log(`PASS: ${routes.length} routes at 3 viewports, real IndexedDB textbook/Frayer reload, dialog, and ${videos.length} optional video fallbacks`);
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
