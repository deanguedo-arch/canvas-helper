import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const reviewDir = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(reviewDir, "../../workspace/index.html");
const outputDir = resolve(reviewDir, "originals");

const figures = [
  ["lesson-01", "figure-integrated-control-overview", "lesson-01-integrated-control-current.png"],
  ["lesson-02", "figure-control-system-comparison", "lesson-02-control-comparison-current.png"],
  ["lesson-03", "figure-neuron-types", "lesson-03-neuron-roles-current.png"],
  ["lesson-03", "figure-myelin-saltatory-conduction", "lesson-03-myelin-saltatory-current.png"],
  ["lesson-05", "figure-synaptic-transmission", "lesson-05-synaptic-transmission-current.png"],
  ["lesson-08", "figure-sensory-receptor-families", "lesson-08-sensory-receptor-families-current.png"],
  ["lesson-09", "figure-retina-light-pathway", "lesson-09-retina-light-pathway-current.png"],
  ["lesson-10", "figure-equilibrium-apparatus", "lesson-10-equilibrium-apparatus-current.png"],
  ["lesson-16", "figure-stress-response-comparison", "lesson-16-stress-response-current.png"],
  ["lesson-17", "figure-integrated-nervous-endocrine-case", "lesson-17-integrated-regulation-current.png"],
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  deviceScaleFactor: 1,
});

try {
  await page.goto(pathToFileURL(workspace).href, { waitUntil: "load" });
  for (const [route, slot, filename] of figures) {
    await page.evaluate((routeId) => {
      window.location.hash = routeId;
    }, route);
    await page.waitForTimeout(180);
    const figure = page.locator(`[data-biology-lesson="${route}"] [data-figure-slot="${slot}"]`).filter({ visible: true }).first();
    await figure.scrollIntoViewIfNeeded();
    await figure.screenshot({ path: resolve(outputDir, filename) });
  }
} finally {
  await browser.close();
}

console.log(`Captured ${figures.length} current course figures in ${outputDir}`);
