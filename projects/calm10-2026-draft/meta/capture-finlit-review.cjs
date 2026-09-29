/* Refreshes paired screenshots for the teacher-only FINLIT comparison page. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('../../../node_modules/playwright');

const base = process.env.CALM_REVIEW_BASE_URL || 'http://127.0.0.1:4189';
const workspace = path.resolve(__dirname, '../workspace');
if (fs.readFileSync(path.join(workspace, 'index.html'), 'utf8').includes('finlit-integrated')) {
  throw new Error('These A/B images are a historical review record. Do not overwrite them from the integrated course.');
}
const output = path.join(workspace, 'review-assets', 'finlit');
fs.mkdirSync(output, { recursive: true });

const points = {
  'ce1-03': [
    ['opening', 'ce1-03-stage-1', 'ce1-03-opening'],
    ['documents', 'ce1-03-stage-2', 'ce1-03-documents'],
    ['method', 'ce1-03-finlit', 'ce1-03-method'],
    ['practice', 'ce1-03-stage-5', 'ce1-03-practice'],
    ['apply', 'ce1-03-stage-7', 'ce1-03-apply'],
  ],
  'fl3-04': [
    ['opening', 'fl3-04-stage-1', 'fl3-04-opening'],
    ['documents', 'fl3-04-stage-2', 'fl3-04-documents'],
    ['compounding', 'fl3-06-finlit', 'fl3-04-compounding'],
    ['practice', 'fl3-04-stage-5', 'fl3-04-practice'],
    ['apply', 'fl3-04-stage-7', 'fl3-04-apply'],
  ],
};

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [lesson, views] of Object.entries(points)) {
      for (const [size, viewport] of Object.entries({ desktop: { width: 1440, height: 820 }, mobile: { width: 390, height: 780 } })) {
        const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
        const page = await context.newPage();
        for (const [point, currentId, proposedId] of views) {
          for (const [version, id] of [['a', currentId], ['b', proposedId]]) {
            const route = version === 'a'
              ? `index.html#${lesson === 'fl3-04' && point === 'compounding' ? 'fl3-06' : lesson}`
              : `${lesson}-finlit-review.html`;
            await page.goto(`${base}/${route}`, { waitUntil: 'domcontentloaded' });
            await page.locator(`#${id}`).waitFor({ state: 'visible' });
            await page.evaluate(() => document.fonts.ready);
            await page.locator(`#${id}`).evaluate(element => {
              const top = element.getBoundingClientRect().top + window.scrollY - 83;
              window.scrollTo({ top, behavior: 'instant' });
            });
            await page.waitForTimeout(100);
            const filename = `${lesson}-${point}-${size}-${version}.jpg`;
            await page.screenshot({ path: path.join(output, filename), type: 'jpeg', quality: 79, animations: 'disabled' });
            console.log(filename);
          }
        }
        await context.close();
      }
    }
  } finally { await browser.close(); }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
