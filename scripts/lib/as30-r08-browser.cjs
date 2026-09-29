/* R08 browser proof (evidence only, not shipped).
 *
 * Serves the repo root over loopback http (required: localStorage-backed
 * saves and reload persistence do not apply to file://), then in the same
 * installed Chromium drives the REAL Lesson 7 route through the specimen
 * sequence at desktop (1440) and mobile (390):
 * - supported selection: wrong check -> reviewed wrong feedback, correct
 *   check -> reviewed correct feedback, exposure-aware session persists;
 * - repair + independent: draft autosave, explicit first save, criteria
 *   unlock, comparison toggle, revision save, reload persistence;
 * - screenshots: top/teaching/worked/supported/independent/assigned at
 *   1440, top/supported at 390, into evidence/R08/screenshots/.
 *
 * Run OUTSIDE the sandbox (browser engines cannot launch inside it):
 *   node scripts/lib/as30-r08-browser.cjs
 * Fails non-zero on any mismatch. NOT_RUN in-sandbox by construction.
 */
'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(ROOT, 'projects', 'aboriginal-studies-30', 'meta', 'ab30-v2', 'evidence', 'R08');
const SHOTS = path.resolve(OUT, 'screenshots');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

function serve(root) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(String(req.url || '/').split('?')[0]);
    const full = path.normalize(path.join(root, urlPath));
    if (!full.startsWith(root) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      res.writeHead(404); res.end('no');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
    fs.createReadStream(full).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const failures = [];
function check(name, cond, detail) {
  if (!cond) failures.push(`${name} :: ${detail}`);
}

const L7 = '/projects/aboriginal-studies-30/workspace/index.html?section=lesson&unit=theme-1&lesson=t1-l07-numbered-treaties';
const REPAIR_KEY = 't1-l07-numbered-treaties::supported-repair';
const INDEP_KEY = 't1-l07-numbered-treaties::independent-language-gap';

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
}

async function drive(page, base, width) {
  const tag = `w${width}`;
  await page.goto(base + L7, { waitUntil: 'networkidle' });
  const count = async (sel) => page.locator(sel).count();

  check(`${tag}-guide`, await count('[data-testid="lesson-guide"]') === 1, 'lesson guide hook');
  check(`${tag}-sources`, await count('[data-testid="source-details"]') === 4, 'four source disclosures');
  check(`${tag}-choices`, await count('[data-testid^="supported-choice-"]') === 3, 'three choice radios');
  check(`${tag}-checkbtn`, await count('[data-testid="supported-check"]') === 1, 'check button');
  check(`${tag}-feedback-hidden`, await page.locator('[data-testid="supported-feedback"]').isHidden(), 'feedback hidden pre-check');
  check(`${tag}-firstsave`, await count('[data-testid="save-first-response"]') === 2, 'repair + independent first-save buttons');
  check(`${tag}-nocriteria`, await count('[data-testid="comparison-criteria"]') === 0, 'no criteria body pre-save');

  await shot(page, `${tag}-top`);
  await page.locator('.worked-example').scrollIntoViewIfNeeded();
  await shot(page, `${tag}-worked`);
  await page.locator('[data-testid="supported-task"]').scrollIntoViewIfNeeded();
  await shot(page, `${tag}-supported-before`);

  // Supported: intentionally wrong, then correct.
  await page.locator('[data-testid="supported-choice-a"]').check();
  await page.locator('[data-testid="supported-check"]').click();
  const wrongText = await page.locator('[data-testid="supported-feedback"]').innerText();
  check(`${tag}-wrong`, /Not quite yet/.test(wrongText) && /eyewitness claim/.test(wrongText), `wrong feedback: ${wrongText.slice(0, 120)}`);
  await shot(page, `${tag}-supported-wrong`);
  await page.locator('[data-testid="supported-choice-b"]').check();
  await page.locator('[data-testid="supported-check"]').click();
  const rightText = await page.locator('[data-testid="supported-feedback"]').innerText();
  check(`${tag}-correct`, /Correct\./.test(rightText) && /future/.test(rightText), `correct feedback: ${rightText.slice(0, 120)}`);

  // Repair lifecycle.
  const repairBox = page.locator(`[data-activity-response="${REPAIR_KEY}"]`);
  await repairBox.fill('SYNTH repair: signing does not prove agreement; Source A shows surrender versus sharing.');
  await page.waitForTimeout(600); // debounced draft commit
  const repairSection = page.locator('[data-task-id="t1-l07-numbered-treaties::supported-repair"]');
  await repairSection.locator('[data-testid="save-first-response"]').click();
  check(`${tag}-repair-frozen`, await repairSection.locator('[data-testid="first-submission-text"]').count() === 1, 'repair first frozen');
  await repairSection.locator('[data-testid="comparison-toggle"]').click();
  const repairCriteria = await repairSection.locator('[data-testid="comparison-criteria"]').innerText();
  check(`${tag}-repair-criteria`, /overclaim/.test(repairCriteria), 'repair criteria revealed');
  await repairSection.locator('[data-testid="revision-draft"]').fill('SYNTH repair revision with the detail.');
  await repairSection.locator('[data-testid="save-revision"]').click();
  check(`${tag}-repair-rev`, await repairSection.locator('[data-testid="latest-revision-text"]').count() === 1, 'repair revision saved');

  // Independent lifecycle.
  const indepBox = page.locator(`[data-activity-response="${INDEP_KEY}"]`);
  await indepBox.scrollIntoViewIfNeeded();
  await shot(page, `${tag}-independent-before`);
  await indepBox.fill('SYNTH explanation: interpreters bridged the culture gap too; the passage does not judge every interpreter.');
  await page.waitForTimeout(600);
  const indepSection = page.locator(`[data-task-id="${INDEP_KEY}"]`);
  await indepSection.locator('[data-testid="save-first-response"]').click();
  await indepSection.locator('[data-testid="comparison-toggle"]').click();
  const indepCriteria = await indepSection.locator('[data-testid="comparison-criteria"]').innerText();
  check(`${tag}-indep-criteria`, /culture gap/.test(indepCriteria), 'independent criteria revealed');
  await shot(page, `${tag}-independent-after`);

  // Assigned work renders under canonical records.
  check(`${tag}-assigned`, await count('.lesson-questions') === 1, 'assigned booklet questions render');
  await page.locator('.lesson-questions').scrollIntoViewIfNeeded();
  await shot(page, `${tag}-assigned`);

  // Reload persistence.
  await page.reload({ waitUntil: 'networkidle' });
  check(`${tag}-reload-firsts`, await count('[data-testid="first-submission-text"]') === 2, 'both firsts survive reload');
  check(`${tag}-reload-criteria`, await count('[data-testid="comparison-criteria"]') === 2, 'both criteria stay unlocked');
  check(`${tag}-reload-review`, await count('[data-supported-review]') === 1, 'supported shows review state');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  check(`${tag}-overflow`, overflow, 'no horizontal overflow');
}

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
  const { server, port } = await serve(ROOT);
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ channel: 'chromium', args: ['--no-sandbox', '--disable-gpu'] });
  const report = { base, widths: {}, failures: [] };
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width <= 440 ? 740 : 1000 } });
      await drive(page, base, width);
      report.widths[width] = { failures: failures.filter((f) => f.startsWith(`w${width}`)) };
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  report.failures = failures;
  fs.writeFileSync(path.join(OUT, 'browser-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  if (failures.length) {
    console.error(`R08 browser proof FAILED:\n- ${failures.join('\n- ')}`);
    process.exit(1);
  }
  console.log(`R08 browser proof passed; screenshots in ${SHOTS}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
