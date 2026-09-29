const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const output = process.argv[2];
if (!output) throw new Error('Usage: node capture-review-screenshots.cjs <output-directory>');

const base = 'http://127.0.0.1:4191/';
const units = {
  a: { figureRoute: 'lesson-05' },
  b: { figureRoute: 'lesson-14' },
  c: { figureRoute: 'lesson-15' },
  d: { figureRoute: 'lesson-05' },
};

async function show(page, unit, route) {
  await page.goto(`${base}science24-unit-${unit}/workspace/#${route}`, { waitUntil: 'domcontentloaded' });
  await page.locator('body[data-ready="true"]').waitFor({ timeout: 12000 });
  await page.locator(`#${route}:not([hidden])`).waitFor({ timeout: 12000 });
}

async function capture(page, unit, route, name, selector) {
  await show(page, unit, route);
  if (selector) {
    const target = page.locator(`#${route} ${selector}`).first();
    if (!(await target.count())) return false;
    await target.scrollIntoViewIfNeeded();
    await target.evaluate(async root => {
      await Promise.all([...root.querySelectorAll('img')].map(image => image.decode()));
    });
  }
  const file = path.join(output, unit, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file });
  return true;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = [];
  try {
    for (const [unit, config] of Object.entries(units)) {
      const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
      const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
      const targets = [
        [desktop, 'overview', 'overview-desktop.png'],
        [phone, 'overview', 'overview-phone.png'],
        [desktop, 'lesson-05', 'lesson-05-desktop.png'],
        [phone, 'lesson-05', 'lesson-05-phone.png'],
        [desktop, config.figureRoute, 'figure-desktop.png', 'figure.science-figure, .coal-figure-layout'],
        [phone, config.figureRoute, 'figure-phone.png', 'figure.science-figure, .coal-figure-layout'],
        [desktop, 'textbook-practice', 'textbook-practice-desktop.png'],
        [desktop, 'core-vocabulary', 'core-vocabulary-desktop.png'],
        [desktop, 'video-library', 'video-library-desktop.png'],
      ];
      for (const [page, route, name, selector] of targets) {
        try { report.push({ unit, route, name, captured: await capture(page, unit, route, name, selector) }); }
        catch (error) { report.push({ unit, route, name, captured: false, error: error.message }); }
      }
      await desktop.close();
      await phone.close();
    }
    const pilot = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    for (const route of ['overview', 'lesson-05']) {
      try {
        await pilot.goto(`${base}biology30-unit-a-pilot-3/workspace/#${route}`, { waitUntil: 'domcontentloaded' });
        await pilot.locator(`#${route}:not([hidden])`).waitFor({ timeout: 12000 });
        fs.mkdirSync(path.join(output, 'biology30-pilot3'), { recursive: true });
        const name = `${route}-desktop.png`;
        await pilot.screenshot({ path: path.join(output, 'biology30-pilot3', name) });
        report.push({ unit: 'biology30-pilot3', route, name, captured: true });
      } catch (error) { report.push({ unit: 'biology30-pilot3', route, captured: false, error: error.message }); }
    }
    await pilot.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(output, 'capture-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Captured ${report.filter(x => x.captured).length}/${report.length} screenshots`);
  for (const entry of report.filter(x => !x.captured)) console.log(`MISS ${entry.unit} ${entry.route}: ${entry.error || 'selector absent'}`);
})().catch(error => { console.error(error); process.exitCode = 1; });
