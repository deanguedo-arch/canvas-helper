import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

import { chromium, type Locator, type Page } from "playwright";
import sharp from "sharp";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";

const PROJECT = "biology30-unit-a-pilot";
const VIEWPORTS = [
  { id: "desktop-1440x900", width: 1440, height: 900 },
  { id: "tablet-1024x768", width: 1024, height: 768 },
  { id: "mobile-390x844", width: 390, height: 844 }
] as const;
const WORD_LENSES = [
  { lessonId: "lesson-01", entryIds: ["homeostasis", "regulated-variable-set-point", "control-system-roles"] },
  { lessonId: "lesson-02", entryIds: ["negative-feedback", "endocrine-signalling"] },
  { lessonId: "lesson-03", entryIds: ["neuron-structure", "myelin-conduction"] },
  { lessonId: "lesson-04", entryIds: ["resting-membrane-potential", "action-potential", "membrane-potential-phases"] },
  { lessonId: "lesson-05", entryIds: ["synaptic-transmission"] },
  { lessonId: "lesson-06", entryIds: ["central-peripheral-systems", "somatic-autonomic-systems", "sympathetic-parasympathetic"] },
  { lessonId: "lesson-07", entryIds: ["reflex-arc"] },
  { lessonId: "lesson-08", entryIds: ["sensory-transduction", "sensory-receptor-classes", "sensory-adaptation"] },
  { lessonId: "lesson-09", entryIds: ["sensory-transduction", "vision-pathway"] },
  { lessonId: "lesson-10", entryIds: ["sensory-transduction", "hearing-equilibrium-pathway"] },
  { lessonId: "lesson-11", entryIds: ["scientific-explanation", "sensory-adaptation"] },
  { lessonId: "lesson-12", entryIds: ["endocrine-signalling", "negative-feedback"] },
  { lessonId: "lesson-13", entryIds: ["hypothalamus-pituitary-axis", "water-salt-regulation"] },
  { lessonId: "lesson-14", entryIds: ["thyroid-calcium-feedback", "antagonistic-hormones"] },
  { lessonId: "lesson-15", entryIds: ["blood-glucose-regulation", "antagonistic-hormones"] },
  { lessonId: "lesson-16", entryIds: ["stress-response", "water-salt-regulation"] },
  { lessonId: "lesson-17", entryIds: ["homeostasis", "negative-feedback", "scientific-explanation"] }
] as const;
const FIXED_ENTRY_VALUES = {
  definition: "A threshold-triggered voltage event that is regenerated along an axon.",
  characteristics: "Voltage-gated sodium and potassium channels act in sequence, followed by a refractory period.",
  example: "Sodium entry drives a rising phase after threshold in the Lesson 4 membrane model.",
  "non-example": "A subthreshold graded change that fades before triggering the complete channel sequence."
} as const;
const CHOICE_ENTRY_VALUES = {
  definition: "Autonomic divisions that coordinate organ-specific responses to changing conditions.",
  characteristics: "They use distinct pathways and receptors and often produce opposing effects in the same organ.",
  example: "During acute stress, sympathetic output can increase heart activity while reducing digestive activity.",
  "non-example": "A universal switch that raises or lowers the activity of every organ in the same way."
} as const;

type SheetItem = { label: string; subtitle: string; screenshotPath: string };
type Finding = { viewport: string; surface: string; detail: string };

function usage() {
  return "Usage: npm run audit:biology30-unit-a-core-vocabulary-pilot:visual -- --project biology30-unit-a-pilot";
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

function contentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  return ({
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".ttf": "font/ttf",
    ".woff2": "font/woff2"
  } as Record<string, string>)[extension] ?? "application/octet-stream";
}

async function startWorkspaceServer(workspaceDir: string) {
  const absoluteRoot = path.resolve(workspaceDir);
  const server = createServer(async (request, response) => {
    try {
      const requestPath = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname);
      const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
      const targetPath = path.resolve(absoluteRoot, relativePath);
      if (targetPath !== absoluteRoot && !targetPath.startsWith(`${absoluteRoot}${path.sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const body = await readFile(targetPath);
      response.writeHead(200, { "Content-Type": contentType(targetPath), "Cache-Control": "no-store" });
      response.end(body);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      response.writeHead(code === "ENOENT" ? 404 : 500).end(code === "ENOENT" ? "Not found" : "Server error");
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Vocabulary visual audit could not allocate a local preview port.");
  return {
    url: `http://127.0.0.1:${address.port}/index.html`,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  };
}

async function showRoute(page: Page, routeId: string) {
  await page.evaluate((id) => {
    const nextHash = `#${id}`;
    if (window.location.hash === nextHash) window.dispatchEvent(new HashChangeEvent("hashchange"));
    else window.location.hash = nextHash;
  }, routeId);
  await page.locator(`section#${routeId}`).waitFor({ state: "visible" });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
}

async function resetLearnerState(page: Page, url: string) {
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
}

async function inspectSurface(locator: Locator, viewportId: string, surface: string, findings: Finding[]) {
  const geometry = await locator.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const overlaps: string[] = [];
    const textareas = Array.from(node.querySelectorAll<HTMLElement>("textarea")).filter((field) => field.getClientRects().length > 0);
    for (let first = 0; first < textareas.length; first += 1) {
      const a = textareas[first].getBoundingClientRect();
      for (let second = first + 1; second < textareas.length; second += 1) {
        const b = textareas[second].getBoundingClientRect();
        if (a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1) overlaps.push(`${first + 1}/${second + 1}`);
      }
    }
    return {
      left: rect.left,
      right: rect.right,
      viewportWidth,
      ownOverflow: node.scrollWidth > node.clientWidth + 1,
      pageOverflow: document.documentElement.scrollWidth - viewportWidth,
      overlaps
    };
  });
  if (geometry.left < -1 || geometry.right > geometry.viewportWidth + 1) findings.push({ viewport: viewportId, surface, detail: "Surface extends outside the viewport." });
  if (geometry.ownOverflow) findings.push({ viewport: viewportId, surface, detail: "Surface has horizontal overflow." });
  if (geometry.pageOverflow > 1) findings.push({ viewport: viewportId, surface, detail: `Page exceeds the viewport by ${geometry.pageOverflow}px.` });
  if (geometry.overlaps.length) findings.push({ viewport: viewportId, surface, detail: `Frayer response fields overlap: ${geometry.overlaps.join(", ")}.` });
}

async function capture(locator: Locator, outputPath: string) {
  await locator.evaluate((node) => node.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" }));
  await locator.screenshot({ path: outputPath, animations: "disabled", caret: "hide", timeout: 60_000 });
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function buildContactSheet(input: {
  items: SheetItem[];
  outputPath: string;
  columns: number;
  cellWidth: number;
  cellHeight: number;
}) {
  const rows = Math.ceil(input.items.length / input.columns);
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  for (let index = 0; index < input.items.length; index += 1) {
    const item = input.items[index];
    const column = index % input.columns;
    const row = Math.floor(index / input.columns);
    const left = column * input.cellWidth;
    const top = row * input.cellHeight;
    const image = await sharp(item.screenshotPath)
      .resize({ width: input.cellWidth - 24, height: input.cellHeight - 70, fit: "contain", background: "#f7f8f5" })
      .png()
      .toBuffer();
    const metadata = await sharp(image).metadata();
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${input.cellWidth}" height="58"><rect width="100%" height="100%" fill="#fff"/><text x="12" y="22" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#171b1b">${escapeXml(item.label)}</text><text x="12" y="44" font-family="Arial,sans-serif" font-size="12" fill="#5b635d">${escapeXml(item.subtitle)}</text></svg>`);
    composites.push({ input: label, left, top });
    composites.push({
      input: image,
      left: left + 12 + Math.floor((input.cellWidth - 24 - (metadata.width ?? 0)) / 2),
      top: top + 62 + Math.floor((input.cellHeight - 70 - (metadata.height ?? 0)) / 2)
    });
  }
  await sharp({ create: { width: input.columns * input.cellWidth, height: rows * input.cellHeight, channels: 4, background: "#f7f8f5" } })
    .composite(composites)
    .png()
    .toFile(input.outputPath);
}

async function fillFrayer(page: Page, entryId: string, values: Record<string, string>) {
  const panel = page.locator(`[data-vocabulary-entry="${entryId}"]`);
  for (const [field, value] of Object.entries(values)) await panel.locator(`[data-vocabulary-field="${field}"]`).fill(value);
  await page.waitForTimeout(350);
}

async function selectVocabularyEntry(page: Page, entryId: string) {
  const desktopTarget = page.locator(`[data-vocabulary-entry-target="${entryId}"]`);
  if (await desktopTarget.isVisible()) await desktopTarget.click();
  else await page.locator("[data-vocabulary-entry-select]").selectOption(entryId);
  await page.locator(`[data-vocabulary-entry="${entryId}"]`).waitFor({ state: "visible" });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const knownFlags = new Set(["project", "help", "h"]);
  const unknown = Object.keys(args.flags).filter((flag) => !knownFlags.has(flag));
  if (unknown.length || args.positionals.length) throw new Error(`Unknown arguments: ${[...unknown.map((flag) => `--${flag}`), ...args.positionals].join(", ")}`);
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }
  const project = getStringFlag(args, "project") ?? PROJECT;
  if (project !== PROJECT) throw new Error(`This visual audit is scoped only to ${PROJECT}.`);

  const repoRoot = process.cwd();
  const workspacePath = path.join(repoRoot, "projects", PROJECT, "workspace", "index.html");
  const vocabularyContract = JSON.parse(await readFile(path.join(repoRoot, "projects", PROJECT, "meta", "core-vocabulary.json"), "utf8")) as {
    entries: Array<{ id: string; label: string; category: string }>;
  };
  if (vocabularyContract.entries.length !== 28) throw new Error(`Expected 28 Core Vocabulary entries, found ${vocabularyContract.entries.length}.`);
  const workspaceSha256 = await sha256File(workspacePath);
  const generatedAt = new Date().toISOString();
  const outputDir = path.join(repoRoot, ".runtime", "biology30-unit-a-core-vocabulary-pilot-visual-audit", generatedAt.replace(/[:.]/g, "-"));
  const screenshotDir = path.join(outputDir, "screenshots");
  await mkdir(screenshotDir, { recursive: true });
  const server = await startWorkspaceServer(path.dirname(workspacePath));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.removeItem("biology30-unit-a-pilot:state:v1");
    localStorage.removeItem("biology30-unit-a-pilot:complete");
    localStorage.removeItem("biology30-unit-a-pilot:responses");
  });
  const externalRequests = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") externalRequests.add(`${request.method()} ${url.origin}${url.pathname}`);
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") await route.continue();
    else await route.abort();
  });

  const findings: Finding[] = [];
  const sheets: Array<{ group: string; viewport: string; path: string; sha256: string; labels: string[] }> = [];
  try {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await resetLearnerState(page, server.url);
      await showRoute(page, "core-vocabulary");
      const stateItems: SheetItem[] = [];

      const homePath = path.join(screenshotDir, `${viewport.id}-homeostasis-browser.png`);
      const homeSurface = page.locator("#core-vocabulary .bio-vocabulary-layout");
      await inspectSurface(homeSurface, viewport.id, "homeostasis-browser", findings);
      await capture(homeSurface, homePath);
      stateItems.push({ label: "Concept browser + homeostasis", subtitle: viewport.id, screenshotPath: homePath });

      const search = page.locator("[data-vocabulary-search]");
      await search.fill("glyc-");
      const searchPath = path.join(screenshotDir, `${viewport.id}-search-state.png`);
      await inspectSurface(homeSurface, viewport.id, "search-state", findings);
      await capture(homeSurface, searchPath);
      stateItems.push({ label: "Search by word part", subtitle: `${viewport.id} · glyc-`, screenshotPath: searchPath });
      await search.fill("");

      const filter = page.locator("[data-vocabulary-filter]");
      await filter.selectOption("sensory-systems");
      const filterPath = path.join(screenshotDir, `${viewport.id}-filtered-state.png`);
      await inspectSurface(homeSurface, viewport.id, "filtered-state", findings);
      await capture(homeSurface, filterPath);
      stateItems.push({ label: "Course-section filter", subtitle: `${viewport.id} · Sensory Systems`, screenshotPath: filterPath });
      await filter.selectOption("all");

      await showRoute(page, "investigation-notebook");
      const collectionSurface = page.locator("#investigation-notebook [aria-labelledby='process-core-vocabulary']");
      const emptyCollectionPath = path.join(screenshotDir, `${viewport.id}-process-collection-empty.png`);
      await inspectSurface(collectionSurface, viewport.id, "process-collection-empty", findings);
      await capture(collectionSurface, emptyCollectionPath);
      stateItems.push({ label: "Process Collection", subtitle: `${viewport.id} · empty vocabulary state`, screenshotPath: emptyCollectionPath });

      await showRoute(page, "core-vocabulary");
      await selectVocabularyEntry(page, "action-potential");
      const actionPanel = page.locator('[data-vocabulary-entry="action-potential"]');
      const actionPath = path.join(screenshotDir, `${viewport.id}-action-potential-reading.png`);
      await inspectSurface(actionPanel, viewport.id, "action-potential-reading", findings);
      await capture(actionPanel, actionPath);
      stateItems.push({ label: "Fixed concept", subtitle: `${viewport.id} · meaning, morphology, mechanism`, screenshotPath: actionPath });

      await fillFrayer(page, "action-potential", FIXED_ENTRY_VALUES);
      const fixedPath = path.join(screenshotDir, `${viewport.id}-fixed-frayer-complete.png`);
      const fixedSurface = actionPanel.locator(".bio-frayer");
      await inspectSurface(fixedSurface, viewport.id, "fixed-frayer-complete", findings);
      await capture(fixedSurface, fixedPath);
      stateItems.push({ label: "Fixed Frayer", subtitle: `${viewport.id} · complete attempt`, screenshotPath: fixedPath });

      await actionPanel.locator('[data-reveal-vocabulary-model="action-potential"]').click();
      const modelPath = path.join(screenshotDir, `${viewport.id}-course-model-revealed.png`);
      await inspectSurface(fixedSurface, viewport.id, "course-model-revealed", findings);
      await capture(fixedSurface, modelPath);
      stateItems.push({ label: "Course-model comparison", subtitle: `${viewport.id} · revealed after four-part attempt`, screenshotPath: modelPath });
      await actionPanel.locator('[data-collect-vocabulary="action-potential"]').click();

      await selectVocabularyEntry(page, "sympathetic-parasympathetic");
      const choicePanel = page.locator('[data-vocabulary-entry="sympathetic-parasympathetic"]');
      await choicePanel.locator("[data-choose-vocabulary]").click();
      await fillFrayer(page, "sympathetic-parasympathetic", CHOICE_ENTRY_VALUES);
      const choicePath = path.join(screenshotDir, `${viewport.id}-learner-choice-frayer.png`);
      await inspectSurface(choicePanel, viewport.id, "learner-choice-frayer", findings);
      await capture(choicePanel, choicePath);
      stateItems.push({ label: "Selected learner choice", subtitle: `${viewport.id} · opaque terminology caution`, screenshotPath: choicePath });

      await selectVocabularyEntry(page, "regulated-variable-set-point");
      await page.locator('[data-choose-vocabulary="regulated-variable-set-point"]').click();
      await selectVocabularyEntry(page, "scientific-explanation");
      const limitPanel = page.locator('[data-vocabulary-entry="scientific-explanation"]');
      await limitPanel.locator("[data-choose-vocabulary]").click();
      const limitPath = path.join(screenshotDir, `${viewport.id}-choice-limit.png`);
      await inspectSurface(limitPanel, viewport.id, "choice-limit", findings);
      await capture(limitPanel, limitPath);
      stateItems.push({ label: "Two-choice limit", subtitle: `${viewport.id} · third choice remains unavailable`, screenshotPath: limitPath });

      await showRoute(page, "investigation-notebook");
      const collectionPath = path.join(screenshotDir, `${viewport.id}-process-collection-populated.png`);
      await inspectSurface(collectionSurface, viewport.id, "process-collection-populated", findings);
      await capture(collectionSurface, collectionPath);
      stateItems.push({ label: "Process Collection", subtitle: `${viewport.id} · populated vocabulary state`, screenshotPath: collectionPath });

      await showRoute(page, "core-vocabulary");
      for (const entry of vocabularyContract.entries) {
        await selectVocabularyEntry(page, entry.id);
        await inspectSurface(page.locator(`[data-vocabulary-entry="${entry.id}"]`), viewport.id, `${entry.id}-full-entry`, findings);
      }

      const stateSheetPath = path.join(outputDir, `core-vocabulary-states-${viewport.id}.png`);
      await buildContactSheet({
        items: stateItems,
        outputPath: stateSheetPath,
        columns: viewport.id === "mobile-390x844" ? 2 : 2,
        cellWidth: viewport.id === "mobile-390x844" ? 390 : 620,
        cellHeight: viewport.id === "mobile-390x844" ? 560 : 520
      });
      sheets.push({ group: "core-vocabulary-states", viewport: viewport.id, path: path.relative(repoRoot, stateSheetPath), sha256: await sha256File(stateSheetPath), labels: stateItems.map((item) => item.label) });

      const wordLensItems: SheetItem[] = [];
      for (const mapping of WORD_LENSES) {
        await showRoute(page, mapping.lessonId);
        const lens = page.locator(`#${mapping.lessonId} .bio-word-lens`);
        await inspectSurface(lens, viewport.id, `${mapping.lessonId}-word-lens`, findings);
        const wordLensPath = path.join(screenshotDir, `${viewport.id}-${mapping.lessonId}-word-lens.png`);
        await capture(lens, wordLensPath);
        wordLensItems.push({ label: `${mapping.lessonId} Word lens`, subtitle: `${viewport.id} · ${mapping.entryIds.join(", ")}`, screenshotPath: wordLensPath });
      }
      const wordLensSheetPath = path.join(outputDir, `word-lenses-${viewport.id}.png`);
      await buildContactSheet({
        items: wordLensItems,
        outputPath: wordLensSheetPath,
        columns: viewport.id === "mobile-390x844" ? 2 : 2,
        cellWidth: viewport.id === "mobile-390x844" ? 390 : 620,
        cellHeight: viewport.id === "mobile-390x844" ? 300 : 250
      });
      sheets.push({ group: "word-lenses", viewport: viewport.id, path: path.relative(repoRoot, wordLensSheetPath), sha256: await sha256File(wordLensSheetPath), labels: wordLensItems.map((item) => item.label) });
    }

    const zoomItems: SheetItem[] = [];
    for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await resetLearnerState(page, server.url);
      await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      await showRoute(page, "core-vocabulary");
      const surface = page.locator("#core-vocabulary .bio-vocabulary-layout");
      await inspectSurface(surface, `${viewport.id}-200-percent`, "core-vocabulary-zoom", findings);
      const screenshotPath = path.join(screenshotDir, `${viewport.id}-200-percent.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false, animations: "disabled", caret: "hide" });
      zoomItems.push({ label: "Core Vocabulary at 200%", subtitle: viewport.id, screenshotPath });
    }
    const zoomSheetPath = path.join(outputDir, "core-vocabulary-200-percent.png");
    await buildContactSheet({ items: zoomItems, outputPath: zoomSheetPath, columns: 2, cellWidth: 620, cellHeight: 520 });
    sheets.push({ group: "zoom", viewport: "desktop-and-mobile", path: path.relative(repoRoot, zoomSheetPath), sha256: await sha256File(zoomSheetPath), labels: zoomItems.map((item) => item.label) });

    const report = {
      schemaVersion: 1,
      project: PROJECT,
      generatedAt,
      workspaceSha256,
      status: findings.length === 0 ? "geometry-passed-visual-inspection-required" : "geometry-failed",
      scope: "Stage 2 complete 28-family Core Vocabulary implementation",
      viewports: VIEWPORTS,
      conceptEntryViewportCount: VIEWPORTS.length * vocabularyContract.entries.length,
      conceptStateViewportCount: VIEWPORTS.length * 10,
      wordLensViewportCount: VIEWPORTS.length * WORD_LENSES.length,
      zoomViewportCount: 2,
      blockedExternalRequestCount: externalRequests.size,
      blockedExternalRequests: [...externalRequests],
      contactSheets: sheets,
      geometry: { pass: findings.length === 0, findingCount: findings.length, findings },
      visualInspection: {
        required: true,
        status: "pending",
        instruction: "Open all seven listed contact sheets. Inspect default, search, filtered, fixed, selected-choice, model-reveal, choice-limit, empty and populated Process Collection states; all 17 Word Lens placements; desktop, tablet, mobile, and 200 percent zoom. Automated geometry also inspects every one of the 28 concept entries at every viewport."
      }
    };
    const reportPath = path.join(outputDir, "visual-audit.json");
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`Core Vocabulary visual audit report: ${path.relative(repoRoot, reportPath)}`);
    for (const sheet of sheets) console.log(`Open for visual inspection: ${sheet.path}`);
    if (findings.length) throw new Error(`Core Vocabulary visual geometry audit found ${findings.length} defect(s).`);
  } finally {
    await page.close();
    await browser.close();
    await server.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
