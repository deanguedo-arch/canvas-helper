#!/usr/bin/env node
// Read-only rendered inventory for the instructional figures in Science 24 A-C.
// Start the local previews, then run with --output <path> to keep an audit snapshot.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('playwright');

const units = {
  a: 'http://127.0.0.1:4182/',
  b: 'http://127.0.0.1:4191/science24-unit-b/workspace/',
  c: 'http://127.0.0.1:4191/science24-unit-c/workspace/'
};
const outputIndex = process.argv.indexOf('--output');
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : null;
if (outputIndex >= 0 && !output) throw new Error('--output needs a path');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function auditUnit(browser, unit, url, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await page.goto(`${url}#lesson-01`, { waitUntil: 'domcontentloaded' });
    const lessonIds = await page.locator('section[id^="lesson-"]').evaluateAll(nodes => nodes.map(node => node.id));
    const figures = [];
    for (const lesson of lessonIds) {
      await page.evaluate(id => { location.hash = id; }, lesson);
      await page.waitForFunction(id => document.getElementById(id)?.hidden === false, lesson);
      const count = await page.locator(`#${lesson} figure.science-figure`).count();
      for (let index = 0; index < count; index++) {
        const figure = page.locator(`#${lesson} figure.science-figure`).nth(index);
        const image = figure.locator('img').first();
        if (!await image.count()) continue;
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(node => node.decode().catch(() => {}));
        const measured = await figure.evaluate((node, data) => {
          const image = node.querySelector('img');
          const caption = node.querySelector('figcaption');
          const section = node.closest('.content-section');
          const pair = node.closest('.visual-reading-pair,.coal-figure-layout');
          const partner = pair && [...pair.children].find(child => child !== node);
          const box = item => {
            if (!item) return null;
            const rect = item.getBoundingClientRect();
            return { width: Math.round(rect.width), height: Math.round(rect.height), top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
          };
          const imageBox = box(image), partnerBox = box(partner), pairBox = box(pair);
          return {
            unit: data.unit, lesson: data.lesson, index: data.index,
            heading: section?.querySelector('h2')?.textContent.trim() || '',
            figureClass: node.className,
            src: image.getAttribute('src'), alt: image.getAttribute('alt') || '',
            title: node.querySelector('.figure-toolbar strong,.figure-header strong')?.textContent.trim() || '',
            caption: caption?.textContent.trim().replace(/\s+/g, ' ') || '',
            hasEnlarge: !!node.querySelector('[data-enlarge-figure]'),
            loaded: image.complete && image.naturalWidth > 0,
            intrinsic: { width: image.naturalWidth, height: image.naturalHeight },
            section: box(section), figure: box(node), image: imageBox,
            captionHeight: box(caption)?.height || 0,
            captionFontPx: caption ? Number.parseFloat(getComputedStyle(caption).fontSize) : null,
            layout: pair?.className || 'block',
            partner: partnerBox,
            pairedBlankSpacePx: pairBox && partnerBox && imageBox && partnerBox.top < imageBox.bottom
              ? Math.max(0, Math.round(pairBox.height - partnerBox.height)) : 0,
            documentOverflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth),
            viewportWidth: data.width
          };
        }, { unit, lesson, index: index + 1, width });
        figures.push(measured);
      }
    }
    return { unit, width, figures, pageErrors };
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const runs = [];
    for (const width of [1594, 800, 390]) {
      for (const [unit, url] of Object.entries(units)) runs.push(await auditUnit(browser, unit, url, width));
    }
    const files = {};
    for (const unit of Object.keys(units)) {
      for (const name of ['index.html', `unit-${unit}.css`]) {
        const file = path.resolve(`projects/science24-unit-${unit}/workspace/${name}`);
        files[path.relative(process.cwd(), file)] = digest(file);
      }
    }
    for (const run of runs) {
      for (const figure of run.figures) {
        const asset = path.resolve(`projects/science24-unit-${run.unit}/workspace/${figure.src}`);
        figure.assetSha256 = fs.existsSync(asset) ? digest(asset) : null;
        if (!figure.src.endsWith('.svg') || !fs.existsSync(asset)) continue;
        const svg = fs.readFileSync(asset, 'utf8');
        const sizes = [...svg.matchAll(/font-size\s*(?:=|:)\s*["']?(\d+(?:\.\d+)?)/g)].map(match => Number(match[1]));
        const viewBox = svg.match(/\bviewBox\s*=\s*["']([^"']+)["']/);
        const viewBoxWidth = viewBox ? Number(viewBox[1].trim().split(/[\s,]+/)[2]) : figure.intrinsic.width;
        if (!sizes.length || !viewBoxWidth) continue;
        figure.svgSmallestAuthoredFontPx = Math.min(...sizes);
        figure.svgSmallestRenderedFontPx = Math.round(10 * Math.min(...sizes) * figure.image.width / viewBoxWidth) / 10;
      }
    }
    const report = { generatedAt: new Date().toISOString(), purpose: 'Rendered visual placement inventory; qualitative teaching decisions are recorded separately.', files, runs };
    if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
    process.stdout.write(JSON.stringify({ output, counts: runs.map(run => ({ unit: run.unit, width: run.width, figures: run.figures.length, pageErrors: run.pageErrors.length, overflow: run.figures.filter(figure => figure.documentOverflowPx > 0).length })) }) + '\n');
  } finally {
    await browser.close();
  }
})().catch(error => { process.stderr.write(`${error.stack || error}\n`); process.exitCode = 1; });
