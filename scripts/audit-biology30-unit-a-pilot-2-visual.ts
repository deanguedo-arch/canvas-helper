import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

import { chromium, type Locator, type Page } from "playwright";
import sharp from "sharp";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";

const PROJECT = "biology30-unit-a-pilot-2";
const STORAGE_KEY = `${PROJECT}:state:v1`;
const ROUTES = [
  ["overview", "Overview"],
  ["lesson-01", "Lesson 1 · Neuron Structure"],
  ["lesson-02", "Lesson 2 · Action Potentials"],
  ["lesson-03", "Lesson 3 · Synaptic Transmission"],
  ["lesson-04", "Lesson 4 · PNS and CNS"],
  ["lesson-05", "Lesson 5 · The Brain"],
  ["chapter-11-practice", "Chapter 11 Practice"],
  ["lesson-06", "Lesson 6 · Sensory Reception"],
  ["lesson-07", "Lesson 7 · Photoreception and the Eye"],
  ["lesson-08", "Lesson 8 · Hearing and Balance"],
  ["chapter-12-practice", "Chapter 12 Practice"],
  ["lesson-09", "Lesson 9 · Homeostasis"],
  ["lesson-10", "Lesson 10 · Pituitary Hormones Part 1"],
  ["lesson-11", "Lesson 11 · Pituitary Hormones Part 2"],
  ["lesson-12", "Lesson 12 · Thyroid and Parathyroid Glands"],
  ["lesson-13", "Lesson 13 · Pancreas and Adrenal Glands"],
  ["chapter-13-practice", "Chapter 13 Practice"],
  ["review-seminar", "Review Seminar"],
  ["final-practice", "Final Practice"],
  ["process-collection", "Process Collection"],
  ["core-vocabulary", "Core Vocabulary"],
  ["advanced-learning", "Advanced Learning"],
  ["textbook-library", "Textbook Library"],
  ["video-library", "Video Library"],
  ["model-lab", "Models and Data Lab"],
  ["glossary-and-data", "Glossary and Data"],
  ["sources-and-credits", "Sources and Credits"]
] as const;
const ADVANCED_GATE_B_REPRESENTATIVES = [
  ["lesson-01", "l01-b01", "Neuron form and functional role"],
  ["lesson-02", "l02-b01", "Pump, leak channels, and ion gradients"],
  ["lesson-03", "l03-b01", "Electrical-to-chemical conversion"],
  ["lesson-04", "l04-b01", "Tracing afferent and efferent information"],
  ["lesson-05", "l05-b01", "Hemispheres and contralateral evidence without neuromyths"],
  ["lesson-06", "l06-b01", "Receptor thresholds and transduction response curves"],
  ["lesson-07", "l07-b01", "Accommodation and refraction"],
  ["lesson-08", "l08-b01", "Mechanical energy transfer through the middle ear"],
  ["lesson-09", "l09-b01", "Dynamic ranges and changing set points"],
  ["lesson-10", "l10-b01", "Comparing neural and hormone routes into the pituitary"],
  ["lesson-11", "l11-b01", "Osmotic concentration and osmoreceptor-response data"],
  ["lesson-12", "l12-b01", "Primary and secondary thyroid patterns"],
  ["lesson-13", "l13-b01", "Integrating glucose hormones during eating, fasting, and exercise"]
] as const;
const VIEWPORTS = [
  { id: "desktop-1440x900", width: 1440, height: 900 },
  { id: "tablet-1024x768", width: 1024, height: 768 },
  { id: "mobile-390x844", width: 390, height: 844 }
] as const;
const TEXTBOOK_REVIEW_STATES = [
  ["chapter-11-practice", "Chapter 11 textbook review"],
  ["chapter-12-practice", "Chapter 12 textbook review"],
  ["chapter-13-practice", "Chapter 13 textbook review"],
  ["final-practice", "Unit A — Textbook Unit 5 Review"]
] as const;

type SheetItem = { label: string; subtitle: string; screenshotPath: string };
type Finding = { viewport: string; surface: string; detail: string };

function usage() {
  return "Usage: npm run audit:biology30-unit-a-pilot-2:visual -- --project biology30-unit-a-pilot-2";
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
  const root = path.resolve(workspaceDir);
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname);
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const target = path.resolve(root, relative);
      if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const body = await readFile(target);
      response.writeHead(200, { "Content-Type": contentType(target), "Cache-Control": "no-store" });
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
  if (!address || typeof address === "string") throw new Error("Pilot 2 visual audit could not allocate a local port.");
  return {
    url: `http://127.0.0.1:${address.port}/index.html`,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  };
}

async function showRoute(page: Page, routeId: string) {
  await page.evaluate((id) => {
    const hash = `#${id}`;
    if (window.location.hash === hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
    else window.location.hash = hash;
  }, routeId);
  await page.locator(`section#${routeId}`).waitFor({ state: "visible" });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
}

async function inspectPage(page: Page, viewport: string, surface: string, findings: Finding[]) {
  const geometry = await page.evaluate(() => {
    const visible = Array.from(document.querySelectorAll<HTMLElement>("img,svg,table,fieldset,textarea,.practice-item,.science-figure,.video-stage,.illustrated-equivalent li,.illustrated-equivalent li>div,.model-path li,.textbook-review-support,.textbook-review-answer-list li,.advanced-learning-block,.advanced-evidence,[data-advanced-index-item],.collection-tools,.process-work-item"))
      .filter((node) => node.getClientRects().length > 0);
    return {
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      invalid: visible.flatMap((node) => {
        const rect = node.getBoundingClientRect();
        if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width < 1 || rect.height < 1) {
          return [`${node.tagName.toLowerCase()} has invalid rendered dimensions`];
        }
        if (node.scrollWidth > node.clientWidth + 2 && !node.matches("table,.comparison-table,.library-frame")) {
          return [`${node.tagName.toLowerCase()}${node.className ? `.${String(node.className).split(" ")[0]}` : ""} clips horizontal content`];
        }
        return [];
      }).slice(0, 12)
    };
  });
  if (geometry.pageOverflow > 1) findings.push({ viewport, surface, detail: `Page exceeds viewport by ${geometry.pageOverflow}px.` });
  for (const detail of geometry.invalid) findings.push({ viewport, surface, detail });
}

async function captureFullPage(page: Page, filePath: string) {
  await page.screenshot({ path: filePath, fullPage: true, animations: "disabled", caret: "hide", timeout: 90_000 });
}

async function captureLocator(locator: Locator, filePath: string) {
  await locator.evaluate((node) => node.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" }));
  await locator.screenshot({ path: filePath, animations: "disabled", caret: "hide", timeout: 90_000 });
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function buildContactSheets(input: {
  items: SheetItem[];
  outputDir: string;
  prefix: string;
  repoRoot: string;
  columns?: number;
  itemsPerSheet?: number;
}) {
  const columns = input.columns ?? 2;
  const itemsPerSheet = input.itemsPerSheet ?? 6;
  const cellWidth = 760;
  const cellHeight = 620;
  const sheets: Array<{ path: string; sha256: string; labels: string[] }> = [];
  for (let offset = 0; offset < input.items.length; offset += itemsPerSheet) {
    const batch = input.items.slice(offset, offset + itemsPerSheet);
    const rows = Math.ceil(batch.length / columns);
    const composites: Array<{ input: Buffer; left: number; top: number }> = [];
    for (let index = 0; index < batch.length; index += 1) {
      const item = batch[index];
      const left = (index % columns) * cellWidth;
      const top = Math.floor(index / columns) * cellHeight;
      const image = await sharp(item.screenshotPath)
        .resize({ width: cellWidth - 24, height: cellHeight - 72, fit: "contain", background: "#f7f8f5" })
        .png()
        .toBuffer();
      const metadata = await sharp(image).metadata();
      const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cellWidth}" height="60"><rect width="100%" height="100%" fill="#fff"/><text x="12" y="23" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#171b1b">${escapeXml(item.label.slice(0, 76))}</text><text x="12" y="46" font-family="Arial,sans-serif" font-size="12" fill="#5b635d">${escapeXml(item.subtitle.slice(0, 100))}</text></svg>`);
      composites.push({ input: label, left, top });
      composites.push({
        input: image,
        left: left + 12 + Math.floor((cellWidth - 24 - (metadata.width ?? 0)) / 2),
        top: top + 64 + Math.floor((cellHeight - 72 - (metadata.height ?? 0)) / 2)
      });
    }
    const filePath = path.join(input.outputDir, `${input.prefix}-${String(sheets.length + 1).padStart(2, "0")}.png`);
    await sharp({ create: { width: columns * cellWidth, height: rows * cellHeight, channels: 4, background: "#f7f8f5" } })
      .composite(composites)
      .png()
      .toFile(filePath);
    sheets.push({
      path: path.relative(input.repoRoot, filePath).split(path.sep).join(path.posix.sep),
      sha256: await sha256File(filePath),
      labels: batch.map((item) => item.label)
    });
  }
  return sheets;
}

async function saveState(page: Page, state: unknown) {
  const flag = `pilot2-audit-state-${Date.now()}`;
  await page.addInitScript(({ key, value, flag }) => {
    if (sessionStorage.getItem(flag) === "applied") return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem(flag, "applied");
  }, { key: STORAGE_KEY, value: state, flag });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
}

async function seedProcessCollection(page: Page, density: "empty" | "representative" | "dense") {
  const state = await page.evaluate((density) => {
    const registryNode = document.querySelector("[data-process-collection-registry]");
    const registry = JSON.parse(registryNode?.textContent || "{\"records\":[]}") as {
      records: Array<{
        kind: string;
        selectKey?: string;
        stateRef: Record<string, any>;
        courseEvidence?: Record<string, any>;
      }>;
    };
    const fixedFrayers = JSON.parse(document.documentElement.getAttribute("data-fixed-vocabulary") || "[]") as string[];
    const allFrayers = registry.records.filter((record) => record.kind === "frayer" && record.selectKey);
    const choiceIds = allFrayers.map((record) => record.selectKey as string).filter((id) => !fixedFrayers.includes(id)).slice(0, 2);
    const state: any = {
      version: 6,
      route: "process-collection",
      responses: {},
      practice: {},
      completedRoutes: [],
      visitedLessons: [],
      investigations: [],
      evidenceIds: [],
      vocabulary: { activeId: fixedFrayers[0] || choiceIds[0] || "", choiceIds, collectedIds: [] },
      media: { paths: {}, checkpoints: {}, needsCheckRoutes: [] },
      models: { activeId: "myelin", results: {}, predictions: {}, predictionChoices: {}, explanations: {}, explanationChoices: {}, collectedIds: [] },
      textbookReviewAttempts: [],
      advanced: { completedIds: [] }
    };
    if (density === "empty") {
      return state;
    }
    const limits: Record<string, number> = density === "representative"
      ? { retrieval: 1, "evidence-slip": 1, practice: 1, "media-checkpoint": 1, frayer: 1, model: 1, investigation: 1, "review-seminar": 1, "textbook-review": 1, "process-note": 1 }
      : { retrieval: 13, "evidence-slip": 13, practice: 6, "media-checkpoint": 3, frayer: 2, model: 2, investigation: 1, "review-seminar": 1, "textbook-review": 1, "process-note": 1 };
    const used: Record<string, number> = {};
    for (const record of registry.records) {
      const limit = limits[record.kind] || 0;
      if ((used[record.kind] || 0) >= limit) continue;
      const ref = record.stateRef;
      if (!ref) continue;
      if (ref.kind === "response") {
        state.responses[ref.responseId] = record.kind === "process-note"
          ? "Compare fast neural communication with slower hormone signalling as the unit develops."
          : `Saved learner reasoning for ${record.kind.replace(/-/g, " ")}.`;
        if (ref.collectedBy === "evidenceIds") state.evidenceIds.push(ref.responseId);
      } else if (ref.kind === "practice") {
        const choices = Object.keys(record.courseEvidence?.choices || {});
        const choice = record.courseEvidence?.answer || choices[0] || "a";
        state.practice[ref.practiceId] = { choice, submitted: true, correct: choice === record.courseEvidence?.answer };
      } else if (ref.kind === "media") {
        const choice = record.courseEvidence?.answer || "a";
        state.media.paths[ref.checkpointId] = "local";
        state.media.checkpoints[ref.checkpointId] = { choice, submitted: true, correct: true };
      } else if (ref.kind === "frayer") {
        if (!fixedFrayers.includes(ref.entryId) && !choiceIds.includes(ref.entryId)) continue;
        const labels = ["definition", "characteristics", "example", "non-example"];
        ref.responseIds.forEach((id: string, index: number) => { state.responses[id] = `Learner ${labels[index]} for this concept.`; });
        state.vocabulary.collectedIds.push(ref.entryId);
      } else if (ref.kind === "model") {
        const choice = record.courseEvidence?.choices?.[0]?.id;
        if (!choice) continue;
        state.models.results[ref.modelId] = choice;
        state.models.predictions[ref.modelId] = "I predict the changed condition will alter the highlighted step.";
        state.models.explanations[ref.modelId] = "The evidence connects the changed condition to the observed result.";
        state.models.collectedIds.push(ref.modelId);
        state.models.activeId = ref.modelId;
      } else if (ref.kind === "investigation") {
        ref.responseIds.forEach((id: string) => { state.responses[id] = "Saved investigation observation and evidence-based claim."; });
        state.investigations.push(ref.checkpointId);
      } else if (ref.kind === "textbook") {
        state.textbookReviewAttempts.push(ref.attemptId);
      }
      used[record.kind] = (used[record.kind] || 0) + 1;
    }
    return state;
  }, density);
  const flag = `pilot2-process-audit-${density}-${Date.now()}`;
  await page.addInitScript(({ key, value, flag }) => {
    if (sessionStorage.getItem(flag) === "applied") return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem(flag, "applied");
  }, { key: STORAGE_KEY, value: state, flag });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
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
  if (project !== PROJECT) throw new Error(`This audit is scoped only to ${PROJECT}.`);

  const repoRoot = process.cwd();
  const workspacePath = path.join(repoRoot, "projects", PROJECT, "workspace", "index.html");
  const workspaceSha256 = await sha256File(workspacePath);
  const generatedAt = new Date().toISOString();
  const outputDir = path.join(repoRoot, ".runtime", "biology30-unit-a-pilot-2-visual-audit", generatedAt.replace(/[:.]/g, "-"));
  const screenshotDir = path.join(outputDir, "screenshots");
  const sheetDir = path.join(outputDir, "contact-sheets");
  await mkdir(screenshotDir, { recursive: true });
  await mkdir(sheetDir, { recursive: true });

  const server = await startWorkspaceServer(path.dirname(workspacePath));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const externalRequests = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") externalRequests.add(`${request.method()} ${url.origin}${url.pathname}`);
  });

  const findings: Finding[] = [];
  const routeItemsByViewport = new Map<string, SheetItem[]>();
  const stateItems: SheetItem[] = [];
  const processCollectionItems: SheetItem[] = [];
  try {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(server.url, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      const items: SheetItem[] = [];
      for (const [routeId, label] of ROUTES) {
        await showRoute(page, routeId);
        await inspectPage(page, viewport.id, routeId, findings);
        const screenshotPath = path.join(screenshotDir, `${viewport.id}-${routeId}.png`);
        await captureFullPage(page, screenshotPath);
        items.push({ label, subtitle: viewport.id, screenshotPath });
      }
      routeItemsByViewport.set(viewport.id, items);
    }

    const processViewports = [
      ...VIEWPORTS.map((viewport) => ({ ...viewport, textZoom: false })),
      { id: "text-zoom-200", width: 1440, height: 900, textZoom: true }
    ];
    for (const viewport of processViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(server.url, { waitUntil: "domcontentloaded" });
      for (const density of ["empty", "representative", "dense"] as const) {
        await seedProcessCollection(page, density);
        if (viewport.textZoom) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        await showRoute(page, "process-collection");
        await inspectPage(page, viewport.id, `process-collection-${density}`, findings);
        const screenshotPath = path.join(screenshotDir, `process-collection-${viewport.id}-${density}.png`);
        await captureFullPage(page, screenshotPath);
        processCollectionItems.push({
          label: `Process Collection · ${density}`,
          subtitle: viewport.id,
          screenshotPath
        });
      }
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(server.url, { waitUntil: "domcontentloaded" });
    await seedProcessCollection(page, "empty");
    await page.evaluate(() => document.fonts.ready);

    await showRoute(page, "overview");
    const expandedSidebarPath = path.join(screenshotDir, "state-sidebar-expanded.png");
    await page.screenshot({ path: expandedSidebarPath, animations: "disabled", caret: "hide" });
    stateItems.push({ label: "Course navigation · expanded", subtitle: "Five learner-facing groups with full labels", screenshotPath: expandedSidebarPath });
    await page.locator("[data-sidebar-toggle]").click();
    await page.locator("body.sidebar-collapsed").waitFor({ state: "attached" });
    const collapsedSidebarPath = path.join(screenshotDir, "state-sidebar-collapsed.png");
    await page.screenshot({ path: collapsedSidebarPath, animations: "disabled", caret: "hide" });
    stateItems.push({ label: "Course navigation · collapsed", subtitle: "Compact rail while the lesson remains readable", screenshotPath: collapsedSidebarPath });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("body.sidebar-collapsed").waitFor({ state: "attached" });
    await page.locator("[data-sidebar-toggle]").click();

    for (const [routeId, label] of Array.from({ length: 13 }, (_value, index) => {
      const lessonNumber = String(index + 1).padStart(2, "0");
      return [`lesson-${lessonNumber}`, `Lesson ${index + 1}`] as const;
    })) {
      await showRoute(page, routeId);
      const lesson = page.locator(`#${routeId}`);
      const headerPath = path.join(screenshotDir, `state-${routeId}-header.png`);
      await captureLocator(lesson.locator(".lesson-header"), headerPath);
      stateItems.push({ label: `${label} header`, subtitle: "Goal, prerequisites, textbook, and words", screenshotPath: headerPath });

      const firstPractice = lesson.locator("[data-practice-id]").first();
      await firstPractice.locator("input").first().check();
      await firstPractice.locator("[data-check-practice]").click();
      const practicePath = path.join(screenshotDir, `state-${routeId}-feedback.png`);
      await captureLocator(firstPractice, practicePath);
      stateItems.push({ label: `${label} guided feedback`, subtitle: "Misconception feedback and textbook repair link", screenshotPath: practicePath });

    }

    for (const [routeId, blockId, title] of ADVANCED_GATE_B_REPRESENTATIVES) {
      await showRoute(page, routeId);
      const advanced = page.locator(`[data-advanced-block-id="${blockId}"]`);
      await advanced.evaluate((node) => ((node as HTMLDetailsElement).open = true));
      await inspectPage(page, "desktop-1440x900-expanded", `${routeId}-${blockId}`, findings);
      const advancedPath = path.join(screenshotDir, `state-${routeId}-${blockId}-advanced.png`);
      await captureLocator(advanced, advancedPath);
      stateItems.push({ label: `${routeId.replace("lesson-", "Lesson ")} · Advanced Learning`, subtitle: `${title} · evidence, exact model link, and synchronized completion`, screenshotPath: advancedPath });
    }

    const figureCaptures = [
      ["lesson-01", '[data-figure-id="myelin-saltatory"]', "Lesson 1 · myelin", "Selected myelin and saltatory-conduction illustration"],
      ["lesson-01", '[data-figure-id="neuron-roles"]', "Lesson 1 · neuron roles", "Selected sensory, interneuron, and motor pathway illustration"],
      ["lesson-02", '[data-figure-id="resting-membrane-potential"]', "Lesson 2 · resting membrane", "Selected membrane-potential illustration"],
      ["lesson-02", '[data-figure-id="action-potential-voltage-graph"]', "Lesson 2 · voltage graph", "Required membrane-voltage-versus-time graph and complete data equivalent"],
      ["lesson-03", ".sequence-model", "Lesson 3 · synaptic sequence", "Six-step semantic transmission model"],
      ["lesson-03", '[data-figure-id="synaptic-transmission"]', "Lesson 3 · synaptic transmission", "Selected chemical-synapse illustration"],
      ["lesson-05", '[data-figure-id="complete-brain-anatomy"]', "Lesson 5 · complete brain anatomy", "Required lobes, thalamus, hypothalamus, cerebellum, pons, medulla, and spinal cord"],
      ["lesson-06", '[data-figure-id="sensory-receptor-families"]', "Lesson 6 · receptor families", "Selected sensory-receptor illustration"],
      ["lesson-07", '[data-figure-id="retina-light-pathway"]', "Lesson 7 · retina pathway", "Selected retinal pathway illustration"],
      ["lesson-08", '[data-figure-id="equilibrium-apparatus"]', "Lesson 8 · equilibrium", "Selected vestibular-system illustration"],
      ["lesson-09", '[data-figure-id="integrated-control"]', "Lesson 9 · integrated control", "Selected homeostasis control illustration"],
      ["lesson-09", '[data-figure-id="control-system-comparison"]', "Lesson 9 · control comparison", "Selected nervous-endocrine comparison"],
      ["lesson-09", '[data-figure-id="endocrine-body-map"]', "Lesson 9 · endocrine map", "Selected Unit A endocrine map"],
      ["lesson-11", '[data-figure-id="adh-response-graph"]', "Lesson 11 · ADH graph", "Required ADH, urine-volume, and urine-concentration data relationship"],
      ["lesson-13", '[data-figure-id="blood-glucose-feedback"]', "Lesson 13 · glucose feedback", "Pancreatic-islet and blood-glucose feedback model"],
      ["lesson-13", '[data-figure-id="diabetes-urinalysis-evidence"]', "Lesson 13 · urinalysis evidence", "Non-diagnostic supplied-data comparison"],
      ["lesson-13", '[data-figure-id="adrenal-anatomy"]', "Lesson 13 · adrenal anatomy", "Adrenal cortex and medulla anatomy model"],
      ["lesson-13", '[data-figure-id="adrenal-response-comparison"]', "Lesson 13 · adrenal responses", "Rapid and longer stress-response comparison"],
      ["final-practice", '[data-figure-id="integrated-regulation"]', "Final Practice · integrated regulation", "Selected nervous-endocrine synthesis illustration"]
    ] as const;
    for (const [routeId, selector, label, subtitle] of figureCaptures) {
      await showRoute(page, routeId);
      const filePath = path.join(screenshotDir, `state-figure-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.png`);
      await captureLocator(page.locator(`#${routeId} ${selector}`), filePath);
      stateItems.push({ label, subtitle, screenshotPath: filePath });
    }

    await saveState(page, {
      version: 3,
      route: "process-collection",
      responses: {
        [`${PROJECT}:lesson-01:evidence-slip`]: "Myelin limits current loss, so action potentials are regenerated mainly at nodes and the signal travels faster.",
        [`${PROJECT}:core-vocabulary:reflex-arc:definition`]: "A rapid pathway from receptor to sensory input, a CNS connection, motor output, and an effector.",
        [`${PROJECT}:core-vocabulary:reflex-arc:characteristics`]: "It links a stimulus to a rapid response through an organized neural pathway.",
        [`${PROJECT}:core-vocabulary:reflex-arc:example`]: "A withdrawal response after touching a hot surface.",
        [`${PROJECT}:core-vocabulary:reflex-arc:non-example`]: "A hormone travelling through blood for a slower response.",
        [`${PROJECT}:investigation:reflex-response:pattern`]: "The five values vary, but most cluster near 20 cm.",
        [`${PROJECT}:investigation:reflex-response:claim`]: "Response distance is similar across trials, with normal trial-to-trial variation."
      },
      practice: {},
      completedRoutes: ["lesson-01"],
      visitedLessons: ["lesson-01"],
      investigations: [`${PROJECT}:investigation:reflex-response`],
      vocabulary: { activeId: "reflex-arc", choiceIds: [], collectedIds: ["reflex-arc"] },
      media: {
        paths: { [`${PROJECT}:media:A44brRGG4Ys:checkpoint`]: "local" },
        checkpoints: {
          [`${PROJECT}:media:A44brRGG4Ys:checkpoint`]: { choice: "b", submitted: true, correct: true }
        },
        needsCheckRoutes: []
      },
      models: {
        activeId: "thyroid-calcium",
        results: { "thyroid-calcium": "low-calcium" },
        collectedIds: ["thyroid-calcium"]
      }
    });
    await showRoute(page, "process-collection");
    const collectionPath = path.join(screenshotDir, "state-process-collection-populated.png");
    await captureFullPage(page, collectionPath);
    stateItems.push({ label: "Populated Process Collection", subtitle: "Evidence Slip, investigation, Frayer model, and saved model evidence", screenshotPath: collectionPath });

    await showRoute(page, "core-vocabulary");
    const learnedPath = path.join(screenshotDir, "state-vocabulary-learned.png");
    await captureFullPage(page, learnedPath);
    stateItems.push({ label: "Vocabulary · learned so far", subtitle: "Only Lesson 1 concepts are available", screenshotPath: learnedPath });
    await page.locator("[data-vocabulary-filter]").selectOption("all");
    const futurePath = path.join(screenshotDir, "state-vocabulary-future.png");
    await captureFullPage(page, futurePath);
    stateItems.push({ label: "Vocabulary · future terms", subtitle: "Names and teaching lesson only; explanations remain locked", screenshotPath: futurePath });
    await page.setViewportSize({ width: 1265, height: 902 });
    await page.locator('[data-vocabulary-target="regulated-variable-set-point"]').click();
    await inspectPage(page, "annotated-1265x902", "core-vocabulary-locked-preview", findings);
    const lockedVocabularyPath = path.join(screenshotDir, "state-vocabulary-locked-preview-1265x902.png");
    await captureFullPage(page, lockedVocabularyPath);
    stateItems.push({ label: "Vocabulary · future concept selected", subtitle: "Locked Lesson 9 concept explains when it opens and links to the teaching lesson", screenshotPath: lockedVocabularyPath });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('[data-vocabulary-target="reflex-arc"]').click();
    const frayerPath = path.join(screenshotDir, "state-vocabulary-frayer.png");
    await captureLocator(page.locator('[data-vocabulary-entry="reflex-arc"]'), frayerPath);
    stateItems.push({ label: "Vocabulary · collected Frayer", subtitle: "Four fields and saved course-model comparison", screenshotPath: frayerPath });

    await showRoute(page, "advanced-learning");
    await page.evaluate(() => window.scrollTo(0, 0));
    const advancedEmptyPath = path.join(screenshotDir, "state-advanced-learning-empty.png");
    await page.screenshot({ path: advancedEmptyPath, animations: "disabled", caret: "hide" });
    stateItems.push({ label: "Advanced Learning checklist · empty", subtitle: "All 40 Advanced Learning blocks are available", screenshotPath: advancedEmptyPath });

    const activeAdvancedChecks = page.locator('#advanced-learning [data-advanced-index-item] [data-advanced-complete]');
    for (let index = 0; index < 3; index += 1) await activeAdvancedChecks.nth(index).check();
    await page.evaluate(() => window.scrollTo(0, 0));
    const advancedPartialPath = path.join(screenshotDir, "state-advanced-learning-partial.png");
    await page.screenshot({ path: advancedPartialPath, animations: "disabled", caret: "hide" });
    stateItems.push({ label: "Advanced Learning checklist · partial", subtitle: "Three blocks complete; required progress remains separate", screenshotPath: advancedPartialPath });

    for (let index = 3; index < await activeAdvancedChecks.count(); index += 1) await activeAdvancedChecks.nth(index).check();
    await page.evaluate(() => window.scrollTo(0, 0));
    await inspectPage(page, "desktop-1440x900-completed", "advanced-learning-checklist", findings);
    const advancedCompletePath = path.join(screenshotDir, "state-advanced-learning-all-complete.png");
    await page.screenshot({ path: advancedCompletePath, animations: "disabled", caret: "hide" });
    stateItems.push({ label: "Advanced Learning checklist · all complete", subtitle: "All 40 optional blocks complete; required progress remains separate", screenshotPath: advancedCompletePath });

    const lessonMedia = [
      ["lesson-01", "A44brRGG4Ys"], ["lesson-02", "oa6rvUJlg7o"], ["lesson-03", "YcJy28Nnrb8"],
      ["lesson-04", "QY9NTVh-Awo"], ["lesson-05", "0-8PvNOdByc"], ["lesson-06", "qPix_X-9t7E"],
      ["lesson-07", "o0DYP-u1rNM"], ["lesson-08", "Ie2j7GpC4JU"], ["lesson-09", "eWHH9je2zG4"],
      ["lesson-10", "QHkGG4TimvQ"], ["lesson-11", "BYaR-JgbjCs"], ["lesson-12", "cDGmsR2ZILE"],
      ["lesson-13", "y9Bdi4dnSlg"], ["lesson-13", "v-t1Z5-oPtU"]
    ] as const;
    for (const [routeId, videoId] of lessonMedia) {
      await showRoute(page, routeId);
      const panel = page.locator(`#${routeId} [data-video-entry="${videoId}"]`);
      const checkpointId = await panel.getAttribute("data-media-checkpoint-id");
      if (!checkpointId) throw new Error(`Missing required media checkpoint for ${routeId}/${videoId}.`);
      await panel.locator(`[data-media-path="${checkpointId}"][value="local"]`).check();
      const answer = await panel.locator(`[data-media-check-feedback="${checkpointId}"]`).getAttribute("data-answer");
      if (!answer) throw new Error(`Missing media answer for ${checkpointId}.`);
      await panel.locator(`[data-media-check-choice="${checkpointId}"][value="${answer}"]`).check();
      await panel.locator(`[data-check-media="${checkpointId}"]`).click();
      const filePath = path.join(screenshotDir, `state-media-${routeId}-${videoId}.png`);
      await captureLocator(panel, filePath);
      stateItems.push({ label: `${routeId.replace("lesson-", "Lesson ")} media · ${videoId}`, subtitle: "Complete local walkthrough with shared checkpoint", screenshotPath: filePath });
    }

    await page.setViewportSize({ width: 1265, height: 902 });
    if (!(await page.locator("body").evaluate((node) => node.classList.contains("sidebar-collapsed")))) {
      await page.locator("[data-sidebar-toggle]").click();
    }
    await showRoute(page, "lesson-01");
    const lessonOneMedia = page.locator('#lesson-01 [data-video-entry="A44brRGG4Ys"]');
    const lessonOneCheckpoint = await lessonOneMedia.getAttribute("data-media-checkpoint-id");
    if (!lessonOneCheckpoint) throw new Error("Lesson 1 is missing its required media checkpoint.");
    await lessonOneMedia.locator(`[data-media-path="${lessonOneCheckpoint}"][value="local"]`).check();
    await inspectPage(page, "annotated-1265x902-collapsed", "lesson-01-illustrated-walkthrough", findings);
    const annotatedWalkthroughPath = path.join(screenshotDir, "state-lesson-01-walkthrough-annotated-1265x902.png");
    await captureLocator(lessonOneMedia, annotatedWalkthroughPath);
    stateItems.push({ label: "Lesson 1 illustrated walkthrough · annotated width", subtitle: "Two-column step layout at 1265×902 with course navigation collapsed", screenshotPath: annotatedWalkthroughPath });
    await page.setViewportSize({ width: 1440, height: 900 });
    if (await page.locator("body").evaluate((node) => node.classList.contains("sidebar-collapsed"))) {
      await page.locator("[data-sidebar-toggle]").click();
    }

    for (const [routeId] of Array.from({ length: 13 }, (_value, index) => [`lesson-${String(index + 1).padStart(2, "0")}`] as const)) {
      await showRoute(page, routeId);
      const terms = page.locator(`#${routeId} details.lesson-term-inventory`);
      await terms.evaluate((node) => ((node as HTMLDetailsElement).open = true));
      const filePath = path.join(screenshotDir, `state-${routeId}-all-terms.png`);
      await captureLocator(terms, filePath);
      stateItems.push({ label: `${routeId.replace("lesson-", "Lesson ")} · all terms`, subtitle: "New terms separated from terms used again", screenshotPath: filePath });
    }

    await showRoute(page, "lesson-01");
    await page.locator('#lesson-01 .textbook-band [data-open-textbook]').click();
    const textbookPath = path.join(screenshotDir, "state-textbook-exact-page.png");
    await captureFullPage(page, textbookPath);
    stateItems.push({ label: "Textbook exact-page link", subtitle: "Chapter 11 selected at the lesson's physical PDF page", screenshotPath: textbookPath });

    for (const [routeId, label] of TEXTBOOK_REVIEW_STATES) {
      await showRoute(page, routeId);
      const support = page.locator(`#${routeId} [data-textbook-review-route="${routeId}"]`);
      const filePath = path.join(screenshotDir, `state-${routeId}-textbook-review-collapsed.png`);
      await captureLocator(support, filePath);
      stateItems.push({ label: `${label} · collapsed`, subtitle: "Optional assignment, exact-page links, and attempt gate before course questions", screenshotPath: filePath });
    }

    await showRoute(page, "final-practice");
    const finalTextbookSupport = page.locator('#final-practice [data-textbook-review-route="final-practice"]');
    await finalTextbookSupport.locator("[data-textbook-review-attempt]").click();
    await inspectPage(page, "desktop-1440x900-expanded", "final-practice-textbook-review", findings);
    const finalTextbookExpandedPath = path.join(screenshotDir, "state-final-practice-textbook-review-expanded.png");
    await captureLocator(finalTextbookSupport, finalTextbookExpandedPath);
    stateItems.push({ label: "Unit A — Textbook Unit 5 Review · expanded", subtitle: "Complete corrected 51-answer native guide after the learner confirms an attempt", screenshotPath: finalTextbookExpandedPath });
    await finalTextbookSupport.locator("[data-textbook-review-hide]").click();

    await page.setViewportSize({ width: 390, height: 844 });
    await showRoute(page, "final-practice");
    await finalTextbookSupport.locator("[data-textbook-review-attempt]").click();
    await inspectPage(page, "mobile-390x844-expanded", "final-practice-textbook-review", findings);
    const finalTextbookMobilePath = path.join(screenshotDir, "state-final-practice-textbook-review-expanded-mobile.png");
    await captureLocator(finalTextbookSupport, finalTextbookMobilePath);
    stateItems.push({ label: "Unit A textbook answer guide · mobile", subtitle: "All 51 answers reflow at 390×844 with no nested scrolling", screenshotPath: finalTextbookMobilePath });
    await finalTextbookSupport.locator("[data-textbook-review-hide]").click();
    await page.setViewportSize({ width: 1440, height: 900 });

    for (const routeId of ["chapter-11-practice", "chapter-12-practice", "chapter-13-practice"] as const) {
      await showRoute(page, routeId);
      const firstPractice = page.locator(`#${routeId} [data-practice-id]`).first();
      await firstPractice.locator("input").first().check();
      await firstPractice.locator("[data-check-practice]").click();
      const filePath = path.join(screenshotDir, `state-${routeId}-feedback.png`);
      await captureLocator(firstPractice, filePath);
      stateItems.push({ label: `${routeId.replace(/-/g, " ")} feedback`, subtitle: "Answer explanation and exact textbook repair link", screenshotPath: filePath });
    }

    await showRoute(page, "review-seminar");
    const seminarPath = path.join(screenshotDir, "state-review-seminar-sessions.png");
    await captureFullPage(page, seminarPath);
    stateItems.push({ label: "Review Seminar", subtitle: "Three scaffolded saved reasoning sessions", screenshotPath: seminarPath });

    await showRoute(page, "final-practice");
    const finalFirst = page.locator('#final-practice [data-practice-id][data-required="true"]').first();
    await finalFirst.locator("input").first().check();
    await finalFirst.locator("[data-check-practice]").click();
    const finalFeedbackPath = path.join(screenshotDir, "state-final-practice-feedback.png");
    await captureLocator(finalFirst, finalFeedbackPath);
    stateItems.push({ label: "Final Practice feedback", subtitle: "Core item feedback and textbook repair link", screenshotPath: finalFeedbackPath });
    const challenge = page.locator("#final-practice details.final-challenge");
    await challenge.evaluate((node) => ((node as HTMLDetailsElement).open = true));
    const challengePath = path.join(screenshotDir, "state-final-practice-challenge.png");
    await captureLocator(challenge, challengePath);
    stateItems.push({ label: "Diploma Challenge", subtitle: "Six optional items kept separate from completion", screenshotPath: challengePath });

    await showRoute(page, "video-library");
    const videoIds = await page.locator("[data-video-select]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-video-select") || ""));
    for (const [index, videoId] of videoIds.entries()) {
      await page.locator(`[data-video-select="${videoId}"]`).click();
      const panel = page.locator(`[data-video-panel="${videoId}"]`);
      await panel.locator("iframe").waitFor({ state: "visible" });
      await page.waitForTimeout(1_200);
      const filePath = path.join(screenshotDir, `state-video-${String(index + 1).padStart(2, "0")}.png`);
      await captureLocator(panel, filePath);
      stateItems.push({ label: `Video entry ${index + 1}`, subtitle: (await panel.locator("h2").innerText()).slice(0, 100), screenshotPath: filePath });
    }

    await showRoute(page, "model-lab");
    const representativeModelStates = [
      ["myelin", "damaged-myelin"],
      ["action-potential", "potassium-stays-open"],
      ["synapse", "receptor"],
      ["nervous-system", "reversed"],
      ["brain", "language"],
      ["sensory", "sustained-odor"],
      ["eye", "blind-spot"],
      ["hearing", "high-frequency"],
      ["homeostasis", "missing-return"],
      ["pituitary", "adh-route"],
      ["adh", "low-adh"],
      ["thyroid-calcium", "low-calcium"],
      ["glucose", "low-insulin"]
    ] as const;
    for (const [modelId, choiceId] of representativeModelStates) {
      await page.locator(`[data-model-select="${modelId}"]`).click();
      const panel = page.locator(`[data-model-panel="${modelId}"]`);
      await panel.locator(`[data-model-choice="${choiceId}"]`).click();
      await panel.locator("[data-model-prediction]").fill("I predict that this change will alter the highlighted step and produce a visible change in the evidence.");
      await panel.locator("[data-test-model]").click();
      await panel.locator("[data-model-explanation]").fill("The evidence shows how the changed condition affected the mechanism compared with the stated baseline.");
      await inspectPage(page, "desktop-1440x900", `model-lab-${modelId}-${choiceId}`, findings);
      const filePath = path.join(screenshotDir, `state-model-${modelId}.png`);
      await captureLocator(panel, filePath);
      stateItems.push({ label: `Models and Data Lab · ${modelId}`, subtitle: `${choiceId.replace(/-/g, " ")} · prediction, test evidence, and explanation`, screenshotPath: filePath });
    }

    await page.locator('[data-model-select="glucose"]').click();
    const glucosePanel = page.locator('[data-model-panel="glucose"]');
    await glucosePanel.locator('[data-model-choice="rapid-stress"]').click();
    await glucosePanel.locator("[data-model-prediction]").fill("A rapid response should use the adrenal medulla and epinephrine before the slower cortisol pathway dominates.");
    await glucosePanel.locator("[data-test-model]").click();
    await glucosePanel.locator("[data-model-explanation]").fill("The pathway evidence distinguishes the fast neural-medullary response from the slower endocrine stress response.");
    await inspectPage(page, "desktop-1440x900", "model-lab-glucose-rapid-stress", findings);
    const glucosePath = path.join(screenshotDir, "state-model-glucose-rapid-stress.png");
    await captureLocator(glucosePanel, glucosePath);
    stateItems.push({ label: "Models and Data Lab · rapid stress pathway", subtitle: "Completed prediction and causal-pathway evidence state", screenshotPath: glucosePath });

    await page.locator('[data-model-select="action-potential"]').click();
    const actionPanel = page.locator('[data-model-panel="action-potential"]');
    await actionPanel.locator('[data-model-choice="sodium-opens"]').click();
    await actionPanel.locator("[data-model-prediction]").fill("Opening voltage-gated sodium channels should move the membrane voltage toward the action-potential peak.");
    await actionPanel.locator("[data-test-model]").click();
    await actionPanel.locator("details.model-static-equivalent").evaluate((node) => ((node as HTMLDetailsElement).open = true));
    await inspectPage(page, "desktop-1440x900", "model-lab-action-potential-static-equivalent", findings);
    const staticPath = path.join(screenshotDir, "state-model-action-potential-static-equivalent.png");
    await captureLocator(actionPanel, staticPath);
    stateItems.push({ label: "Models and Data Lab · complete static equivalent", subtitle: "Seven phases and data tables available without operating the graph explorer", screenshotPath: staticPath });

    await page.setViewportSize({ width: 1117, height: 902 });
    if (!(await page.locator("body").evaluate((node) => node.classList.contains("sidebar-collapsed")))) {
      await page.locator("[data-sidebar-toggle]").click();
    }
    await showRoute(page, "model-lab");
    await page.locator('[data-model-select="pituitary"]').click();
    const pituitaryPanel = page.locator('[data-model-panel="pituitary"]');
    await pituitaryPanel.locator("[data-model-choice]").last().click();
    await pituitaryPanel.locator("[data-model-prediction]").fill("Changing the selected route should alter the source, release site, or target shown in the hormone pathway.");
    await pituitaryPanel.locator("[data-test-model]").click();
    await inspectPage(page, "annotated-1117x902-collapsed", "model-lab-pituitary", findings);
    const annotatedModelPath = path.join(screenshotDir, "state-model-pituitary-annotated-1117x902.png");
    await page.screenshot({ path: annotatedModelPath, animations: "disabled", caret: "hide" });
    stateItems.push({ label: "Models and Data Lab · annotated width", subtitle: "Pituitary investigation at 1117×902 with the course navigation collapsed", screenshotPath: annotatedModelPath });

    await page.setViewportSize({ width: 1440, height: 900 });
    if (await page.locator("body").evaluate((node) => node.classList.contains("sidebar-collapsed"))) {
      await page.locator("[data-sidebar-toggle]").click();
    }

    await showRoute(page, "lesson-01");
    await page.locator('#lesson-01 [data-figure-id="myelin-saltatory"] [data-enlarge-figure]').click();
    const dialogPath = path.join(screenshotDir, "state-figure-enlarged.png");
    await captureLocator(page.locator("[data-figure-dialog]"), dialogPath);
    stateItems.push({ label: "Enlarged myelin figure", subtitle: "Keyboard dialog and full-resolution image", screenshotPath: dialogPath });
    await page.keyboard.press("Escape");

    await page.goto(server.url, { waitUntil: "domcontentloaded" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    for (const [routeId] of ROUTES) {
      await showRoute(page, routeId);
      await inspectPage(page, "text-zoom-200", routeId, findings);
    }
    await showRoute(page, "final-practice");
    await page.locator('#final-practice [data-textbook-review-attempt]').click();
    await inspectPage(page, "text-zoom-200-expanded", "final-practice-textbook-review", findings);
  } finally {
    await browser.close();
    await server.close();
  }

  const contactSheets = [];
  for (const viewport of VIEWPORTS) {
    contactSheets.push(...await buildContactSheets({
      items: routeItemsByViewport.get(viewport.id) ?? [],
      outputDir: sheetDir,
      prefix: `routes-${viewport.id}`,
      repoRoot,
      itemsPerSheet: 8
    }));
  }
  contactSheets.push(...await buildContactSheets({
    items: stateItems,
    outputDir: sheetDir,
    prefix: "interaction-states",
    repoRoot,
    itemsPerSheet: 8
  }));
  contactSheets.push(...await buildContactSheets({
    items: processCollectionItems,
    outputDir: sheetDir,
    prefix: "process-collection-states",
    repoRoot,
    itemsPerSheet: 3
  }));

  const report = {
    schemaVersion: 1,
    profileId: "biology30-unit-a-pilot-2-process-collection-index-visual-audit-v1",
    project: PROJECT,
    generatedAt,
    workspaceSha256,
    viewports: VIEWPORTS,
    routeCount: ROUTES.length,
    routeScreenshotCount: [...routeItemsByViewport.values()].reduce((sum, items) => sum + items.length, 0),
    stateScreenshotCount: stateItems.length,
    processCollectionStateScreenshotCount: processCollectionItems.length,
    findings,
    externalRequests: [...externalRequests].sort(),
    contactSheets,
    manualInspection: {
      required: true,
      allContactSheetsOpened: false,
      inspectedAt: null,
      decision: "pending"
    }
  };
  const reportPath = path.join(outputDir, "report.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Visual audit report: ${path.relative(repoRoot, reportPath)}`);
  console.log(`Workspace SHA-256: ${workspaceSha256}`);
  console.log(`Route screenshots: ${report.routeScreenshotCount}`);
  console.log(`State screenshots: ${report.stateScreenshotCount}`);
  console.log(`Contact sheets: ${contactSheets.length}`);
  console.log(`Geometry findings: ${findings.length}`);
  for (const sheet of contactSheets) console.log(`- ${sheet.path}`);
  if (findings.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
