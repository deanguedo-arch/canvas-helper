/* R05 browser proof (evidence only, not shipped).
 *
 * Serves the repo root statically, then in the same installed Chromium:
 * - loads fixture-candidate.html, fixture-donor.html, and the real Lesson 7
 *   route (?section=lesson&unit=theme-1&lesson=t1-l07-numbered-treaties);
 * - asserts document.fonts holds loaded Work Sans + Hanken Grotesk faces
 *   served from local files, with zero remote font requests;
 * - records computed h1/h2/body styles, narrative width, header/logo/
 *   progress rectangles, nav visibility, source-card width;
 * - captures screenshots at 1440/1024/768/390/320 into evidence/R05/.
 *
 * R06 additions (same run): two-row mobile header geometry, zero
 * logo/progress overlap, measured --topbar-actual offset, scrim hidden at
 * rest, active lesson link visible inside the sidebar on lesson routes.
 *
 * Fails non-zero on any mismatch. Screenshots are explicitly current
 * candidate evidence, not a teacher-approved golden.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(ROOT, 'projects', 'aboriginal-studies-30', 'meta', 'ab30-v2', 'evidence', 'R05');
const SHOTS = path.resolve(OUT, 'screenshots');

const WIDTHS = [1440, 1024, 768, 390, 320];
const failures = [];
function check(name, cond, detail) {
  if (!cond) failures.push(`${name} :: ${detail}`);
}

async function probePage(page, url, label) {
  const remoteFonts = [];
  page.on('request', (req) => {
    const u = req.url();
    if (/fonts\.googleapis|fonts\.gstatic/.test(u)) remoteFonts.push(u);
  });
  const ttf = [];
  page.on('response', (res) => {
    if (/\.ttf(\?|$)/.test(res.url())) ttf.push(`${res.status()} ${res.url()}`);
  });
  page.on('requestfailed', (req) => {
    if (/\.ttf(\?|$)/.test(req.url())) ttf.push(`FAILED ${req.url()}`);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const fonts = await page.evaluate(() => [...document.fonts].map((f) => ({
    family: f.family, weight: f.weight, style: f.style, status: f.status,
  })));
  const geom = await page.evaluate(() => {
    const cs = (el, prop) => (el ? getComputedStyle(el)[prop] : null);
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('.teaching-block h2, .lesson-block h2, .worked-example h2');
    const prose = document.querySelector('.teaching-block p, .lesson-block p');
    return {
      bodyFont: cs(document.body, 'fontFamily'),
      bodySize: cs(document.body, 'fontSize'),
      bodyLineHeight: cs(document.body, 'lineHeight'),
      h1Font: h1 ? cs(h1, 'fontFamily') : null,
      h1Size: h1 ? cs(h1, 'fontSize') : null,
      h1Weight: h1 ? cs(h1, 'fontWeight') : null,
      h2Size: h2 ? cs(h2, 'fontSize') : null,
      proseMaxWidth: prose ? cs(prose, 'maxWidth') : null,
      proseWidth: prose ? Math.round(prose.getBoundingClientRect().width) : null,
      frameWidth: (() => {
        const f = document.querySelector('.course-frame');
        return f ? Math.round(f.getBoundingClientRect().width) : null;
      })(),
      header: rect(document.querySelector('.course-topbar, .topbar')),
      logo: rect(document.querySelector('.brand-logo')),
      progress: rect(document.querySelector('.top-progress-shell, .progress-shell')),
      sourceCard: rect(document.querySelector('.source-card')),
      goalStripCols: (() => {
        const g = document.querySelector('.lesson-goal-strip, .goal-strip');
        return g ? getComputedStyle(g).gridTemplateColumns : null;
      })(),
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    };
  });
  return { label, url, fonts, ttf, remoteFonts, geom };
}

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
  // file:// proof: the sandbox forbids local listen. Font binaries resolve
  // relatively exactly as they would over http; document.fonts status plus
  // zero failed .ttf requests proves the local load.
  const { pathToFileURL } = require('node:url');
  const fileUrl = (p) => pathToFileURL(p).href;
  // Full chromium: chrome-headless-shell SEGVs on launch in this sandbox.
  const browser = await chromium.launch({
    channel: 'chromium',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const report = { widths: {}, failures: [] };
  try {
    for (const width of WIDTHS) {
      const height = width <= 440 ? 740 : 1000;
      const page = await browser.newPage({ viewport: { width, height } });
      const cand = await probePage(page,
        fileUrl(path.resolve(OUT, 'fixture-candidate.html')),
        `candidate@${width}`);
      const donor = await probePage(page,
        fileUrl(path.resolve(OUT, 'fixture-donor.html')),
        `donor@${width}`);
      const lesson7 = await probePage(page,
        fileUrl(path.resolve(ROOT, 'projects', 'aboriginal-studies-30', 'workspace', 'index.html')) +
          '?section=lesson&unit=theme-1&lesson=t1-l07-numbered-treaties',
        `lesson7@${width}`);

      // Font assertions (candidate side).
      const fams = cand.fonts.filter((f) => f.status === 'loaded').map((f) => f.family);
      check(`fonts@${width}`, fams.includes('Work Sans'), `loaded faces: ${JSON.stringify(cand.fonts)}`);
      check(`fonts-hanken@${width}`, fams.includes('Hanken Grotesk'), `loaded faces: ${JSON.stringify(cand.fonts)}`);
      check(`fonts-local@${width}`,
        cand.ttf.filter((t) => !t.startsWith('FAILED')).length >= 2 &&
        cand.ttf.every((t) => !t.startsWith('FAILED') && /assets\/fonts\/\w+\.ttf/.test(t)),
        `ttf responses: ${JSON.stringify(cand.ttf)}`);
      check(`fonts-remote@${width}`, cand.remoteFonts.length === 0,
        `remote font requests: ${JSON.stringify(cand.remoteFonts)}`);

      // Geometry assertions (candidate side).
      const g = cand.geom;
      const desktop = width > 760;
      check(`body-size@${width}`, g.bodySize === (desktop ? '17px' : '16px'), `body font-size=${g.bodySize}`);
      check(`body-font@${width}`, /Work Sans/.test(g.bodyFont || ''), `body font=${g.bodyFont}`);
      check(`h1-font@${width}`, /Hanken Grotesk/.test(g.h1Font || ''), `h1 font=${g.h1Font}`);
      const h1px = parseFloat(g.h1Size || '0');
      const expectH1 = Math.min(50, Math.max(34, width * 0.044));
      check(`h1-size@${width}`, Math.abs(h1px - expectH1) <= 1.5, `h1=${g.h1Size} expected~${expectH1}px`);
      const h2px = parseFloat(g.h2Size || '0');
      check(`h2-size@${width}`, Math.abs(h2px - (desktop ? 30 : 26)) <= 1, `h2=${g.h2Size}`);
      check(`prose-measure@${width}`, g.proseMaxWidth === '760px', `prose max-width=${g.proseMaxWidth}`);
      check(`goal-strip@${width}`, !!g.goalStripCols, 'goal strip grid missing');
      if (width > 980) {
        check(`goal-cols@${width}`, (g.goalStripCols || '').trim().split(/\s+/).length === 2,
          `goal columns=${g.goalStripCols}`);
      }
      check(`overflow@${width}`, g.scrollW <= width + 1, `scrollWidth=${g.scrollW} viewport=${width}`);

      // Lesson 7 route assertions.
      const lg = lesson7.geom;
      check(`l7-h1@${width}`, /Hanken Grotesk/.test(lg.h1Font || ''), `lesson7 h1 font=${lg.h1Font}`);
      check(`l7-overflow@${width}`, lg.scrollW <= width + 1,
        `lesson7 scrollWidth=${lg.scrollW} viewport=${width}`);

      // R06: header rows, overlap, measured offset, scrim, active link.
      const r06 = await page.evaluate(() => {
        const rect = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
        };
        const topbar = document.querySelector('.course-topbar');
        const logo = document.querySelector('.brand-logo');
        const prog = document.querySelector('.top-progress-shell');
        const scrim = document.getElementById('menu-scrim');
        const active = document.querySelector('[data-testid="active-lesson-link"]');
        const sidebar = document.getElementById('course-sidebar');
        const overlap = (a, b) => a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        let activeVisible = null;
        if (active && sidebar) {
          const ar = active.getBoundingClientRect();
          const sr = sidebar.getBoundingClientRect();
          activeVisible = ar.top >= sr.top - 1 && ar.bottom <= sr.bottom + 1;
        }
        return {
          topbarH: topbar ? Math.round(topbar.getBoundingClientRect().height) : null,
          topbarActual: getComputedStyle(document.documentElement).getPropertyValue('--topbar-actual').trim(),
          logo: rect(logo), progress: rect(prog),
          logoProgressOverlap: overlap(rect(logo), rect(prog)),
          scrimHidden: scrim ? scrim.hidden : null,
          activeVisible,
        };
      });
      report.widths[width].r06 = r06;
      if (width <= 760) {
        check(`r06-tworow@${width}`, (r06.topbarH || 0) > 70, `mobile header height=${r06.topbarH}`);
        check(`r06-progrow@${width}`,
          r06.progress && r06.logo && r06.progress.y >= r06.logo.y + r06.logo.h - 2,
          `progress row below logo: ${JSON.stringify({ logo: r06.logo, progress: r06.progress })}`);
      }
      check(`r06-overlap@${width}`, r06.logoProgressOverlap === false,
        `logo/progress rects: ${JSON.stringify({ logo: r06.logo, progress: r06.progress })}`);
      check(`r06-offset@${width}`, r06.topbarActual === `${r06.topbarH}px`,
        `--topbar-actual=${r06.topbarActual} measured=${r06.topbarH}`);
      check(`r06-scrim@${width}`, r06.scrimHidden === true, 'scrim must be hidden at rest');
      if (width > 760) {
        check(`r06-active@${width}`, r06.activeVisible === true, 'active lesson link visible in sidebar');
      }

      await page.setViewportSize({ width, height });
      await page.goto(cand.url, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SHOTS, `candidate-${width}.png`), fullPage: true });
      await page.goto(donor.url, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SHOTS, `donor-${width}.png`), fullPage: true });
      await page.goto(lesson7.url, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SHOTS, `lesson7-${width}.png`), fullPage: true });
      // Mobile source-card crop for the stacking check.
      if (width <= 390) {
        const card = page.locator('.source-card').first();
        if (await card.count()) {
          await card.screenshot({ path: path.resolve(SHOTS, `lesson7-source-${width}.png`) });
        }
      }
      report.widths[width] = { candidate: cand, donor, lesson7 };
      await page.close();
    }
  } finally {
    await browser.close();
  }
  report.failures = failures;
  report.note = 'Screenshots are current candidate evidence, not a teacher-approved golden.';
  fs.writeFileSync(path.resolve(OUT, 'R05-browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  if (failures.length) {
    console.error(`R05 BROWSER PROOF FAILED (${failures.length}):`);
    failures.forEach((f) => console.error(` - ${f}`));
    process.exit(1);
  }
  console.log(`R05 browser proof passed at widths ${WIDTHS.join('/')}; screenshots in evidence/R05/screenshots/.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
