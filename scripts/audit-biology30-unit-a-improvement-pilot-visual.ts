import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

import { chromium, type Page } from "playwright";
import sharp from "sharp";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";

const PROJECT = "biology30-unit-a-pilot";
const ROUTES = [
  "overview",
  ...Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
  "library",
  "video-library",
  "review-overview",
  "chapter-11-review",
  "chapter-12-review",
  "chapter-13-review",
  "review-seminar",
  "textbook-unit-review",
  "model-lab",
  "investigation-notebook",
  "practice-hub",
  "glossary-and-data",
  "sources-and-credits"
] as const;
const MEDIA_LESSONS = ["lesson-04", "lesson-09", "lesson-15"] as const;
const MEDIA_FIGURE_SELECTORS: Record<(typeof MEDIA_LESSONS)[number], string> = {
  "lesson-04": "[data-media-treatment]",
  "lesson-09": '[data-source-visual="eye-anatomy-source"]',
  "lesson-15": "[data-media-treatment]"
};
const VIDEO_LESSONS = ["lesson-03", "lesson-04", "lesson-05", "lesson-06", "lesson-07", "lesson-09", "lesson-10", "lesson-12", "lesson-13", "lesson-14", "lesson-15", "lesson-16"] as const;
const SOURCE_VISUAL_LESSONS = [
  { routeId: "lesson-03", visualId: "neuron-anatomy-source" },
  { routeId: "lesson-03", visualId: "neural-tissue-micrograph" },
  { routeId: "lesson-06", visualId: "spinal-cord-cross-section-source" },
  { routeId: "lesson-06", visualId: "brain-functional-regions" },
  { routeId: "lesson-07", visualId: "reflex-arc-anatomy-source" },
  { routeId: "lesson-09", visualId: "eye-anatomy-source" },
  { routeId: "lesson-10", visualId: "ear-anatomy-source" },
  { routeId: "lesson-12", visualId: "endocrine-capillary-network" },
  { routeId: "lesson-13", visualId: "hypothalamus-pituitary-source" }
] as const;
const GENERATED_VISUAL_LESSONS = [
  { routeId: "lesson-01", visualId: "lesson-01-integrated-control" },
  { routeId: "lesson-02", visualId: "lesson-02-control-comparison" },
  { routeId: "lesson-03", visualId: "lesson-03-neuron-roles" },
  { routeId: "lesson-03", visualId: "lesson-03-myelin-saltatory" },
  { routeId: "lesson-04", visualId: "lesson-04-resting-membrane" },
  { routeId: "lesson-05", visualId: "lesson-05-synaptic-transmission" },
  { routeId: "lesson-08", visualId: "lesson-08-sensory-receptors" },
  { routeId: "lesson-09", visualId: "lesson-09-retina-pathway" },
  { routeId: "lesson-10", visualId: "lesson-10-equilibrium" },
  { routeId: "lesson-12", visualId: "lesson-12-endocrine-map" },
  { routeId: "lesson-16", visualId: "lesson-16-stress-response" },
  { routeId: "lesson-17", visualId: "lesson-17-integrated-regulation" }
] as const;
const PRACTICE_FEEDBACK_STATES = [
  { routeId: "lesson-04", practiceId: "lesson-04-check-1", choice: "a" },
  { routeId: "practice-hub", practiceId: "final-practice-20", choice: "a" }
] as const;
const FEEDBACK_FIGURE_LESSONS = ["lesson-02", "lesson-12"] as const;
const VIDEO_ENTRIES = [
  "A44brRGG4Ys", "ZAmUjvgoO0A", "oa6rvUJlg7o", "_0PFBI5K9s4", "vzA3pQB25Xk", "GvUrdCQv3JM", "YcJy28Nnrb8",
  "QY9NTVh-Awo", "DPWEhl7gbu4", "q8NtmDrb_qo", "0-8PvNOdByc", "jYlxv9gUYSs", "aaQWxko6qmk", "4WcZR_k_a0I",
  "o0DYP-u1rNM", "nnCrnWOiKG4", "MJxxFwVu1OM", "Ie2j7GpC4JU", "T8lKKlnnC6M", "LkGOGzpbrCk", "98-6WfdumZY", "ryGMI3SpxCE",
  "eWHH9je2zG4", "BYaR-JgbjCs", "QHkGG4TimvQ", "GYQyWYHt_vk", "cDGmsR2ZILE", "y9Bdi4dnSlg", "XfyGv-xwjlI",
  "k_QhDbUd654", "8IUZjCSkbrc", "v-t1Z5-oPtU", "lgqbs5a6Guw", "qPix_X-9t7E", "SCV_m91mN-Q"
] as const;
const VIEWPORTS = [
  { id: "desktop-1440x900", width: 1440, height: 900 },
  { id: "tablet-1024x768", width: 1024, height: 768 },
  { id: "mobile-390x844", width: 390, height: 844 }
] as const;

type SheetItem = { label: string; subtitle: string; screenshotPath: string };
type Finding = { viewport: string; routeId: string; surface: string; detail: string };

function usage() {
  return "Usage: npm run audit:biology30-unit-a-improvement-pilot:visual -- --project biology30-unit-a-pilot";
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
    ".webp": "image/webp",
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
  if (!address || typeof address === "string") throw new Error("Visual audit could not allocate a local preview port.");
  return {
    url: `http://127.0.0.1:${address.port}/index.html`,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  };
}

async function showRoute(page: Page, routeId: string) {
  const target = page.locator(`[data-page-target="${routeId}"]:not([data-lessons-toggle])`).first();
  if ((await target.count()) !== 1) throw new Error(`Visual audit cannot activate route ${routeId}.`);
  await target.evaluate((node) => (node as HTMLElement).click());
  await page.locator(`section#${routeId}`).waitFor({ state: "visible" });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function buildContactSheets(input: {
  columns: number;
  items: SheetItem[];
  outputDir: string;
  prefix: string;
  repoRoot: string;
  cellWidth: number;
  cellHeight: number;
  itemsPerSheet: number;
}) {
  const sheets: Array<{ path: string; sha256: string; labels: string[] }> = [];
  for (let offset = 0; offset < input.items.length; offset += input.itemsPerSheet) {
    const batch = input.items.slice(offset, offset + input.itemsPerSheet);
    const rows = Math.ceil(batch.length / input.columns);
    const composites: Array<{ input: Buffer; left: number; top: number }> = [];
    for (let index = 0; index < batch.length; index += 1) {
      const item = batch[index];
      const column = index % input.columns;
      const row = Math.floor(index / input.columns);
      const left = column * input.cellWidth;
      const top = row * input.cellHeight;
      const image = await sharp(item.screenshotPath)
        .resize({ width: input.cellWidth - 24, height: input.cellHeight - 66, fit: "contain", background: "#f7f8f5" })
        .png()
        .toBuffer();
      const metadata = await sharp(image).metadata();
      const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${input.cellWidth}" height="54"><rect width="100%" height="100%" fill="#fff"/><text x="12" y="21" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#171b1b">${escapeXml(item.label.slice(0, 72))}</text><text x="12" y="42" font-family="Arial,sans-serif" font-size="12" fill="#5b635d">${escapeXml(item.subtitle.slice(0, 86))}</text></svg>`);
      composites.push({ input: label, left, top });
      composites.push({
        input: image,
        left: left + 12 + Math.floor((input.cellWidth - 24 - (metadata.width ?? 0)) / 2),
        top: top + 58 + Math.floor((input.cellHeight - 66 - (metadata.height ?? 0)) / 2)
      });
    }
    const sheetPath = path.join(input.outputDir, `${input.prefix}-${String(sheets.length + 1).padStart(2, "0")}.png`);
    await sharp({ create: { width: input.columns * input.cellWidth, height: rows * input.cellHeight, channels: 4, background: "#f7f8f5" } })
      .composite(composites)
      .png()
      .toFile(sheetPath);
    sheets.push({
      path: path.relative(input.repoRoot, sheetPath).split(path.sep).join(path.posix.sep),
      sha256: await sha256File(sheetPath),
      labels: batch.map((item) => item.label)
    });
  }
  return sheets;
}

async function inspectRetrieval(page: Page, routeId: string, viewport: (typeof VIEWPORTS)[number]) {
  return page.locator(`#${routeId} .bio-retrieval`).evaluate((retrieval, input) => {
    const prompt = retrieval.children[0] as HTMLElement | undefined;
    const response = retrieval.querySelector<HTMLElement>(".bio-retrieval-response");
    const textarea = response?.querySelector<HTMLElement>("textarea");
    if (!prompt || !response || !textarea) return [`${input.routeId} is missing retrieval prompt, response wrapper, or textarea.`];
    const promptRect = prompt.getBoundingClientRect();
    const responseRect = response.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();
    const findings: string[] = [];
    if (input.width >= 1024) {
      if (Math.abs(promptRect.top - responseRect.top) > 2) findings.push(`Desktop/tablet columns are not top-aligned (${promptRect.top.toFixed(1)} vs ${responseRect.top.toFixed(1)}).`);
      if (promptRect.right + 20 > responseRect.left) findings.push("Prompt and response columns overlap or have insufficient separation.");
    } else {
      if (responseRect.top < promptRect.bottom - 1) findings.push("Mobile response does not stack after the prompt.");
      if (Math.abs(promptRect.left - responseRect.left) > 2) findings.push("Mobile prompt and response do not share the same left edge.");
    }
    if (textareaRect.left < responseRect.left - 1 || textareaRect.right > responseRect.right + 1) findings.push("Textarea extends outside its response wrapper.");
    return findings;
  }, { routeId, width: viewport.width });
}

async function inspectMediaSurface(page: Page, selector: string) {
  return page.locator(selector).evaluate((surface) => {
    const rect = surface.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const overflowingDescendants = Array.from(surface.querySelectorAll<HTMLElement>("*"))
      .filter((node) => {
        if (node.closest("svg") && node.tagName.toLowerCase() !== "svg") return false;
        const child = node.getBoundingClientRect();
        if (child.width === 0 || child.height === 0) return false;
        return child.left < rect.left - 1 || child.right > rect.right + 1;
      })
      .map((node) => {
        const className = typeof node.className === "string" ? node.className.trim().replace(/\s+/g, ".") : "";
        return `${node.tagName.toLowerCase()}${className ? `.${className}` : ""}`;
      })
      .slice(0, 5);
    return {
      outsideViewport: rect.left < -1 || rect.right > viewportWidth + 1,
      ownOverflow: surface.scrollWidth > surface.clientWidth + 1,
      overflowingDescendants
    };
  });
}

async function inspectFeedbackFigure(page: Page, selector: string) {
  return page.locator(selector).evaluate((figure) => {
    const svg = figure.querySelector<SVGSVGElement>("svg[data-feedback-diagram]");
    if (!svg) return ["Feedback figure is missing its semantic SVG."];
    const findings: string[] = [];
    const labels = Array.from(svg.querySelectorAll<SVGTextElement>("[data-feedback-label]"));
    for (const [pathIndex, connector] of Array.from(svg.querySelectorAll<SVGPathElement>("[data-feedback-connector]")).entries()) {
      const matrix = connector.getScreenCTM();
      if (!matrix) {
        findings.push(`Connector ${pathIndex + 1} has no screen transform.`);
        continue;
      }
      const length = connector.getTotalLength();
      const increment = Math.max(1, length / 600);
      for (let distance = 0; distance <= length; distance += increment) {
        const local = connector.getPointAtLength(distance);
        const point = svg.createSVGPoint();
        point.x = local.x;
        point.y = local.y;
        const screen = point.matrixTransform(matrix);
        const hit = labels.find((label) => {
          const rect = label.getBoundingClientRect();
          return screen.x >= rect.left - 1 && screen.x <= rect.right + 1 && screen.y >= rect.top - 1 && screen.y <= rect.bottom + 1;
        });
        if (hit) {
          findings.push(`Connector ${pathIndex + 1} crosses label “${hit.textContent?.trim() || "unlabelled"}”.`);
          break;
        }
      }
    }
    for (const [cardIndex, card] of Array.from(svg.querySelectorAll<SVGGElement>("[data-feedback-card]")).entries()) {
      const box = card.querySelector<SVGRectElement>("rect")?.getBoundingClientRect();
      if (!box) {
        findings.push(`Card ${cardIndex + 1} is missing its boundary.`);
        continue;
      }
      for (const label of Array.from(card.querySelectorAll<SVGTextElement>("[data-feedback-label]"))) {
        const rect = label.getBoundingClientRect();
        if (rect.left < box.left - 1 || rect.right > box.right + 1 || rect.top < box.top - 1 || rect.bottom > box.bottom + 1) {
          findings.push(`Card ${cardIndex + 1} does not contain label “${label.textContent?.trim() || "unlabelled"}”.`);
        }
      }
    }
    const principle = svg.querySelector<SVGGElement>("[data-feedback-principle]");
    const principleBox = principle?.querySelector<SVGRectElement>("rect")?.getBoundingClientRect();
    if (!principle || !principleBox) findings.push("Feedback principle band is missing.");
    else {
      for (const label of Array.from(principle.querySelectorAll<SVGTextElement>("[data-feedback-label]"))) {
        const rect = label.getBoundingClientRect();
        if (rect.left < principleBox.left - 1 || rect.right > principleBox.right + 1 || rect.top < principleBox.top - 1 || rect.bottom > principleBox.bottom + 1) {
          findings.push(`Feedback principle band does not contain label “${label.textContent?.trim() || "unlabelled"}”.`);
        }
      }
    }
    return findings;
  });
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
  const workspaceDir = path.join(repoRoot, "projects", PROJECT, "workspace");
  const generatedAt = new Date().toISOString();
  const outputDir = path.join(repoRoot, ".runtime", "biology30-unit-a-improvement-pilot-visual-audit", generatedAt.replace(/[:.]/g, "-"));
  await mkdir(path.join(outputDir, "routes"), { recursive: true });
  await mkdir(path.join(outputDir, "details"), { recursive: true });
  const server = await startWorkspaceServer(workspaceDir);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const findings: Finding[] = [];
  const contactSheets: Array<{ group: string; viewport: string; path: string; sha256: string; labels: string[] }> = [];
  try {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(server.url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const routeItems: SheetItem[] = [];
      for (const routeId of ROUTES) {
        await showRoute(page, routeId);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 1) findings.push({ viewport: viewport.id, routeId, surface: "route", detail: `Page exceeds the viewport by ${overflow}px.` });
        const screenshotPath = path.join(outputDir, "routes", `${viewport.id}-${routeId}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false, animations: "disabled", caret: "hide", timeout: 60_000 });
        routeItems.push({ label: routeId, subtitle: viewport.id, screenshotPath });
      }
      const sheets = await buildContactSheets({
        columns: viewport.id === "mobile-390x844" ? 3 : 2,
        items: routeItems,
        outputDir,
        prefix: `routes-${viewport.id}`,
        repoRoot,
        cellWidth: viewport.id === "mobile-390x844" ? 300 : 520,
        cellHeight: viewport.id === "mobile-390x844" ? 520 : 360,
        itemsPerSheet: 10
      });
      for (const sheet of sheets) contactSheets.push({ group: "routes", viewport: viewport.id, ...sheet });
    }

    for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(server.url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const textbookItems: SheetItem[] = [];
      const retrievalItems: SheetItem[] = [];
      for (let index = 1; index <= 17; index += 1) {
        const routeId = `lesson-${String(index).padStart(2, "0")}`;
        await showRoute(page, routeId);
        const textbook = page.locator(`#${routeId} [data-textbook-band]`);
        const retrieval = page.locator(`#${routeId} .bio-retrieval`);
        const retrievalPath = path.join(outputDir, "details", `${viewport.id}-${routeId}-retrieval.png`);
        if (await textbook.count()) {
          const textbookPath = path.join(outputDir, "details", `${viewport.id}-${routeId}-textbook.png`);
          await textbook.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
          await textbook.screenshot({ path: textbookPath, animations: "disabled", caret: "hide", timeout: 60_000 });
          textbookItems.push({ label: `${routeId} · textbook`, subtitle: viewport.id, screenshotPath: textbookPath });
          const bandOverflow = await textbook.evaluate((band) => {
            const rect = band.getBoundingClientRect();
            return { left: rect.left, right: rect.right, viewport: document.documentElement.clientWidth };
          });
          if (bandOverflow.left < -1 || bandOverflow.right > bandOverflow.viewport + 1) findings.push({ viewport: viewport.id, routeId, surface: "textbook-band", detail: "Textbook band extends outside the viewport." });
        }
        await retrieval.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
        await retrieval.screenshot({ path: retrievalPath, animations: "disabled", caret: "hide", timeout: 60_000 });
        retrievalItems.push({ label: `${routeId} · retrieval`, subtitle: viewport.id, screenshotPath: retrievalPath });
        for (const detail of await inspectRetrieval(page, routeId, viewport)) findings.push({ viewport: viewport.id, routeId, surface: "retrieval", detail });
      }
      for (const [group, items] of [["textbook-bands", textbookItems], ["retrievals", retrievalItems]] as const) {
        const sheets = await buildContactSheets({
          columns: viewport.id === "mobile-390x844" ? 2 : 2,
          items,
          outputDir,
          prefix: `${group}-${viewport.id}`,
          repoRoot,
          cellWidth: viewport.id === "mobile-390x844" ? 380 : 540,
          cellHeight: viewport.id === "mobile-390x844" ? 410 : 320,
          itemsPerSheet: 9
        });
        for (const sheet of sheets) contactSheets.push({ group, viewport: viewport.id, ...sheet });
      }

      const practiceFeedbackItems: SheetItem[] = [];
      for (const state of PRACTICE_FEEDBACK_STATES) {
        await showRoute(page, state.routeId);
        const selector = `[data-practice-id="${state.practiceId}"]`;
        const item = page.locator(selector);
        await item.locator(`input[value="${state.choice}"]`).check();
        await item.locator("[data-check-practice]").click();
        const textbookLink = item.locator(`[data-practice-textbook-link="${state.practiceId}"]`);
        await textbookLink.waitFor({ state: "visible" });
        await textbookLink.evaluate((element) => element.scrollIntoView({ block: "nearest", inline: "nearest" }));
        const geometry = await inspectMediaSurface(page, selector);
        if (geometry.outsideViewport) findings.push({ viewport: viewport.id, routeId: state.routeId, surface: state.practiceId, detail: "Practice feedback extends outside the viewport." });
        if (geometry.ownOverflow) findings.push({ viewport: viewport.id, routeId: state.routeId, surface: state.practiceId, detail: "Practice feedback has horizontal overflow." });
        if (geometry.overflowingDescendants.length) findings.push({ viewport: viewport.id, routeId: state.routeId, surface: state.practiceId, detail: `Practice feedback descendants extend outside their container: ${geometry.overflowingDescendants.join(", ")}.` });
        const screenshotPath = path.join(outputDir, "details", `${viewport.id}-${state.practiceId}-feedback.png`);
        await item.screenshot({ path: screenshotPath, animations: "disabled", caret: "hide", timeout: 60_000 });
        practiceFeedbackItems.push({ label: `${state.practiceId} · checked answer`, subtitle: viewport.id, screenshotPath });
      }
      const practiceFeedbackSheets = await buildContactSheets({
        columns: 2,
        items: practiceFeedbackItems,
        outputDir,
        prefix: `practice-feedback-${viewport.id}`,
        repoRoot,
        cellWidth: viewport.id === "mobile-390x844" ? 390 : 580,
        cellHeight: viewport.id === "mobile-390x844" ? 620 : 520,
        itemsPerSheet: 2
      });
      for (const sheet of practiceFeedbackSheets) contactSheets.push({ group: "practice-feedback", viewport: viewport.id, ...sheet });

      const feedbackFigureItems: SheetItem[] = [];
      for (const routeId of FEEDBACK_FIGURE_LESSONS) {
        await showRoute(page, routeId);
        const selector = `#${routeId} [data-figure-slot="figure-generic-feedback-loop"]`;
        const figure = page.locator(selector);
        await figure.waitFor({ state: "visible" });
        await figure.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
        const geometry = await inspectMediaSurface(page, selector);
        if (geometry.outsideViewport) findings.push({ viewport: viewport.id, routeId, surface: "generic-feedback", detail: "Feedback figure extends outside the viewport." });
        if (geometry.ownOverflow) findings.push({ viewport: viewport.id, routeId, surface: "generic-feedback", detail: "Feedback figure has horizontal overflow." });
        if (geometry.overflowingDescendants.length) findings.push({ viewport: viewport.id, routeId, surface: "generic-feedback", detail: `Feedback figure descendants extend outside their container: ${geometry.overflowingDescendants.join(", ")}.` });
        for (const detail of await inspectFeedbackFigure(page, selector)) findings.push({ viewport: viewport.id, routeId, surface: "generic-feedback", detail });
        const inlinePath = path.join(outputDir, "details", `${viewport.id}-${routeId}-generic-feedback.png`);
        await figure.screenshot({ path: inlinePath, animations: "disabled", caret: "hide", timeout: 60_000 });
        feedbackFigureItems.push({ label: `${routeId} · feedback loop`, subtitle: `${viewport.id} · inline`, screenshotPath: inlinePath });

        await figure.locator("[data-open-figure-dialog]").click();
        const dialogBody = page.locator("#bio-figure-dialog .bio-figure-dialog__body");
        const enlargedVisual = dialogBody.locator("[data-feedback-diagram]");
        await enlargedVisual.waitFor({ state: "visible" });
        const enlargedPath = path.join(outputDir, "details", `${viewport.id}-${routeId}-generic-feedback-enlarged.png`);
        await enlargedVisual.screenshot({ path: enlargedPath, animations: "disabled", caret: "hide", timeout: 60_000 });
        feedbackFigureItems.push({ label: `${routeId} · feedback loop`, subtitle: `${viewport.id} · enlarged`, screenshotPath: enlargedPath });
        await page.keyboard.press("Escape");
        await figure.locator("[data-open-figure-dialog]").waitFor({ state: "visible" });
      }
      const feedbackFigureSheets = await buildContactSheets({
        columns: 2,
        items: feedbackFigureItems,
        outputDir,
        prefix: `generic-feedback-${viewport.id}`,
        repoRoot,
        cellWidth: viewport.id === "mobile-390x844" ? 390 : 580,
        cellHeight: viewport.id === "mobile-390x844" ? 520 : 440,
        itemsPerSheet: 4
      });
      for (const sheet of feedbackFigureSheets) contactSheets.push({ group: "generic-feedback", viewport: viewport.id, ...sheet });
    }

    for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(server.url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const lessonMediaItems: SheetItem[] = [];
      for (const routeId of VIDEO_LESSONS) {
        await showRoute(page, routeId);
        const figureSelector = routeId in MEDIA_FIGURE_SELECTORS
          ? MEDIA_FIGURE_SELECTORS[routeId as keyof typeof MEDIA_FIGURE_SELECTORS]
          : null;
        const surfaces = [
          ...(figureSelector ? [{ id: "figure", selector: `#${routeId} ${figureSelector}` }] : []),
          { id: "video", selector: `#${routeId} .bio-video-companion` }
        ];
        for (const surface of surfaces) {
          const locator = page.locator(surface.selector).first();
          await locator.waitFor({ state: "visible" });
          if (surface.id === "video") {
            await locator.locator('iframe[src*="youtube-nocookie.com"]').waitFor({ state: "visible", timeout: 15_000 });
            await page.waitForTimeout(750);
          }
          await locator.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
          const geometry = await inspectMediaSurface(page, surface.selector);
          if (geometry.outsideViewport) findings.push({ viewport: viewport.id, routeId, surface: `media-${surface.id}`, detail: "Media surface extends outside the viewport." });
          if (geometry.ownOverflow) findings.push({ viewport: viewport.id, routeId, surface: `media-${surface.id}`, detail: "Media surface has horizontal overflow." });
          if (geometry.overflowingDescendants.length) findings.push({ viewport: viewport.id, routeId, surface: `media-${surface.id}`, detail: `Media descendants extend outside their container: ${geometry.overflowingDescendants.join(", ")}.` });
          const screenshotPath = path.join(outputDir, "details", `${viewport.id}-${routeId}-${surface.id}.png`);
          await locator.screenshot({ path: screenshotPath, animations: "disabled", caret: "hide", timeout: 60_000 });
          lessonMediaItems.push({ label: `${routeId} · ${surface.id}`, subtitle: viewport.id, screenshotPath });
        }
      }
      const lessonMediaSheets = await buildContactSheets({
        columns: viewport.id === "mobile-390x844" ? 2 : 2,
        items: lessonMediaItems,
        outputDir,
        prefix: `media-slice-${viewport.id}`,
        repoRoot,
        cellWidth: viewport.id === "mobile-390x844" ? 390 : 580,
        cellHeight: viewport.id === "mobile-390x844" ? 470 : 420,
        itemsPerSheet: 6
      });
      for (const sheet of lessonMediaSheets) contactSheets.push({ group: "media-slice", viewport: viewport.id, ...sheet });

      const sourceVisualItems: SheetItem[] = [];
      for (const { routeId, visualId } of SOURCE_VISUAL_LESSONS) {
        await showRoute(page, routeId);
        const selector = `#${routeId} [data-source-visual="${visualId}"]`;
        const locator = page.locator(selector);
        await locator.waitFor({ state: "visible" });
        await locator.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
        await locator.locator(":scope > img").evaluate(async (image) => {
          const target = image as HTMLImageElement;
          if (!target.complete) await new Promise<void>((resolve) => target.addEventListener("load", () => resolve(), { once: true }));
          await target.decode();
        });
        const geometry = await inspectMediaSurface(page, selector);
        if (geometry.outsideViewport) findings.push({ viewport: viewport.id, routeId, surface: visualId, detail: "Source visual extends outside the viewport." });
        if (geometry.ownOverflow) findings.push({ viewport: viewport.id, routeId, surface: visualId, detail: "Source visual has horizontal overflow." });
        if (geometry.overflowingDescendants.length) findings.push({ viewport: viewport.id, routeId, surface: visualId, detail: `Source visual descendants extend outside their container: ${geometry.overflowingDescendants.join(", ")}.` });
        const screenshotPath = path.join(outputDir, "details", `${viewport.id}-${routeId}-${visualId}.png`);
        await locator.screenshot({ path: screenshotPath, animations: "disabled", caret: "hide", timeout: 60_000 });
        sourceVisualItems.push({ label: `${routeId} · ${visualId}`, subtitle: viewport.id, screenshotPath });
      }
      const sourceVisualSheets = await buildContactSheets({
        columns: 2,
        items: sourceVisualItems,
        outputDir,
        prefix: `source-visuals-${viewport.id}`,
        repoRoot,
        cellWidth: viewport.id === "mobile-390x844" ? 390 : 580,
        cellHeight: viewport.id === "mobile-390x844" ? 520 : 440,
        itemsPerSheet: 6
      });
      for (const sheet of sourceVisualSheets) contactSheets.push({ group: "source-visuals", viewport: viewport.id, ...sheet });

      const generatedVisualItems: SheetItem[] = [];
      for (const { routeId, visualId } of GENERATED_VISUAL_LESSONS) {
        await showRoute(page, routeId);
        const selector = `#${routeId} [data-generated-visual="${visualId}"]`;
        const locator = page.locator(selector);
        await locator.waitFor({ state: "visible" });
        await locator.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
        await locator.locator(":scope > img").evaluate(async (image) => {
          const target = image as HTMLImageElement;
          if (!target.complete) await new Promise<void>((resolve) => target.addEventListener("load", () => resolve(), { once: true }));
          await target.decode();
        });
        const geometry = await inspectMediaSurface(page, selector);
        if (geometry.outsideViewport) findings.push({ viewport: viewport.id, routeId, surface: visualId, detail: "Generated visual extends outside the viewport." });
        if (geometry.ownOverflow) findings.push({ viewport: viewport.id, routeId, surface: visualId, detail: "Generated visual has horizontal overflow." });
        if (geometry.overflowingDescendants.length) findings.push({ viewport: viewport.id, routeId, surface: visualId, detail: `Generated visual descendants extend outside their container: ${geometry.overflowingDescendants.join(", ")}.` });
        const screenshotPath = path.join(outputDir, "details", `${viewport.id}-${routeId}-${visualId}.png`);
        await locator.screenshot({ path: screenshotPath, animations: "disabled", caret: "hide", timeout: 60_000 });
        generatedVisualItems.push({ label: `${routeId} · ${visualId}`, subtitle: viewport.id, screenshotPath });
      }
      const generatedVisualSheets = await buildContactSheets({
        columns: 2,
        items: generatedVisualItems,
        outputDir,
        prefix: `generated-visuals-${viewport.id}`,
        repoRoot,
        cellWidth: viewport.id === "mobile-390x844" ? 390 : 580,
        cellHeight: viewport.id === "mobile-390x844" ? 520 : 440,
        itemsPerSheet: 4
      });
      for (const sheet of generatedVisualSheets) contactSheets.push({ group: "generated-visuals", viewport: viewport.id, ...sheet });

      await showRoute(page, "video-library");
      const videoLibraryItems: SheetItem[] = [];
      for (const videoId of VIDEO_ENTRIES) {
        await page.locator("#video-library [data-video-select]").evaluate((select, id) => {
          (select as HTMLSelectElement).value = String(id);
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }, videoId);
        const panel = page.locator(`#video-library [data-video-panel="${videoId}"]`);
        await panel.waitFor({ state: "visible" });
        await panel.locator('iframe[src*="youtube-nocookie.com"]').waitFor({ state: "visible", timeout: 15_000 });
        await page.waitForTimeout(750);
        const geometry = await inspectMediaSurface(page, `#video-library [data-video-panel="${videoId}"]`);
        if (geometry.outsideViewport) findings.push({ viewport: viewport.id, routeId: "video-library", surface: videoId, detail: "Selected video panel extends outside the viewport." });
        if (geometry.ownOverflow) findings.push({ viewport: viewport.id, routeId: "video-library", surface: videoId, detail: "Selected video panel has horizontal overflow." });
        if (geometry.overflowingDescendants.length) findings.push({ viewport: viewport.id, routeId: "video-library", surface: videoId, detail: `Video panel descendants extend outside their container: ${geometry.overflowingDescendants.join(", ")}.` });
        const layout = page.locator("#video-library .bio-video-library-layout");
        const screenshotPath = path.join(outputDir, "details", `${viewport.id}-video-library-${videoId}.png`);
        await layout.screenshot({ path: screenshotPath, animations: "disabled", caret: "hide", timeout: 60_000 });
        const title = (await panel.locator("[data-video-panel-heading]").textContent())?.trim() || videoId;
        videoLibraryItems.push({ label: title, subtitle: `${viewport.id} · ${videoId}`, screenshotPath });
      }
      const videoLibrarySheets = await buildContactSheets({
        columns: viewport.id === "mobile-390x844" ? 2 : 2,
        items: videoLibraryItems,
        outputDir,
        prefix: `video-library-states-${viewport.id}`,
        repoRoot,
        cellWidth: viewport.id === "mobile-390x844" ? 390 : 580,
        cellHeight: viewport.id === "mobile-390x844" ? 500 : 430,
        itemsPerSheet: 5
      });
      for (const sheet of videoLibrarySheets) contactSheets.push({ group: "video-library-states", viewport: viewport.id, ...sheet });
    }

    const report = {
      schemaVersion: 1,
      project: PROJECT,
      generatedAt,
      status: findings.length === 0 ? "geometry-passed-visual-inspection-required" : "geometry-failed",
      viewports: VIEWPORTS,
      routes: ROUTES,
      auditedRouteViewportCount: ROUTES.length * VIEWPORTS.length,
      textbookBandViewportCount: 16 * 2,
      retrievalViewportCount: 17 * 2,
      mediaSurfaceViewportCount: (VIDEO_LESSONS.length + MEDIA_LESSONS.length) * 2,
      sourceVisualViewportCount: SOURCE_VISUAL_LESSONS.length * 2,
      generatedVisualViewportCount: GENERATED_VISUAL_LESSONS.length * 2,
      videoLibraryStateViewportCount: VIDEO_ENTRIES.length * 2,
      practiceFeedbackViewportCount: PRACTICE_FEEDBACK_STATES.length * 2,
      feedbackFigureViewportCount: FEEDBACK_FIGURE_LESSONS.length * 2,
      contactSheets,
      geometry: { pass: findings.length === 0, findingCount: findings.length, findings },
      visualInspection: {
        required: true,
        status: "pending",
        instruction: "Open every listed contact sheet and inspect text fit, overlap, hierarchy, responsive reflow, textbook controls, retrieval alignment, checked-answer textbook links, both generic feedback figures inline and enlarged, representative figures, all twelve generated lesson visuals, all nine source visuals, lesson video companions, and every Video Library state before handoff."
      }
    };
    const reportPath = path.join(outputDir, "visual-audit.json");
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`Visual audit report: ${path.relative(repoRoot, reportPath)}`);
    for (const sheet of contactSheets) console.log(`Open for visual inspection: ${sheet.path}`);
    if (findings.length) throw new Error(`Visual geometry audit found ${findings.length} defect(s).`);
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
