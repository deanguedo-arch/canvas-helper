import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

import { chromium, type Browser, type Page } from "playwright";
import sharp from "sharp";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";

const DEFAULT_PROJECTS = ["biology30-unit-b", "biology30-unit-c", "biology30-unit-d"] as const;
const VIEWPORTS = [
  { id: "desktop-1440x900", width: 1440, height: 900 },
  { id: "tablet-1024x768", width: 1024, height: 768 },
  { id: "mobile-390x844", width: 390, height: 844 }
] as const;

type ProductionBuild = {
  buildSha256: string;
  interactions: string[];
  interactionPresentationKinds: Record<string, string>;
  learnerRoutes: string[];
  projectSlug: string;
  semanticFigures: string[];
  semanticFigureKinds: Record<string, string>;
  status: string;
  workspace: { sha256: string };
};

type VisualReviewSeed = {
  buildSha256: string;
  projectSlug: string;
  requiredRoutes: string[];
};

type FigureRecord = {
  figureId: string;
  kind: string;
  routeId: string;
  title: string;
  screenshotPath?: string;
  screenshotSha256?: string;
};

type InteractionRecord = {
  interactionId: string;
  kind: string;
  routeId: string;
  title: string;
  screenshotPath?: string;
  screenshotSha256?: string;
};

type GeometryFinding = {
  viewport: string;
  routeId: string;
  figureId?: string;
  interactionId?: string;
  kind: "content-out-of-bounds" | "figure-out-of-bounds" | "figure-overlap" | "interaction-out-of-bounds" | "interaction-overlap" | "page-overflow" | "undersized-text";
  details: string;
};

type SheetItem = {
  label: string;
  subtitle: string;
  screenshotPath: string;
};

function usage() {
  return [
    "Usage: npm run audit:biology30-course-production:visual -- [--project biology30-unit-b]",
    "",
    "Without --project, audits Biology 30 Units B, C, and D. The command verifies each exact blocked build, checks every learner route, scientific model, and reasoning interaction at desktop, tablet, and mobile sizes, and creates route, figure, and interaction contact sheets for visual inspection."
  ].join("\n");
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

async function collectTreeFiles(rootDir: string, relativeDir = ""): Promise<Array<{ path: string; size: number; sha256: string }>> {
  const absoluteDir = path.join(rootDir, relativeDir);
  const entries = (await readdir(absoluteDir, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name));
  const files: Array<{ path: string; size: number; sha256: string }> = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDir.split(path.sep).join(path.posix.sep), entry.name);
    const absolutePath = path.join(rootDir, relativePath);
    if (entry.isDirectory()) {
      files.push(...(await collectTreeFiles(rootDir, relativePath)));
      continue;
    }
    if (!entry.isFile()) throw new Error(`Visual audit cannot hash unsupported workspace entry: ${absolutePath}`);
    const details = await stat(absolutePath);
    files.push({ path: relativePath, size: details.size, sha256: await sha256File(absolutePath) });
  }
  return files;
}

async function hashTree(rootDir: string) {
  const files = await collectTreeFiles(rootDir);
  const hash = createHash("sha256");
  for (const file of files) hash.update(`${file.path}\0${file.size}\0${file.sha256}\n`);
  return hash.digest("hex");
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
  const target = page.locator(`[data-page-target="${routeId}"]`).first();
  if ((await target.count()) !== 1) throw new Error(`Visual audit cannot activate learner route ${routeId}.`);
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
  const results: Array<{ path: string; sha256: string; labels: string[] }> = [];
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
        .resize({ width: input.cellWidth - 24, height: input.cellHeight - 68, fit: "contain", background: "#f7f8f5" })
        .png()
        .toBuffer();
      const metadata = await sharp(image).metadata();
      const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${input.cellWidth}" height="56">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <text x="12" y="22" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#171b1b">${escapeXml(item.label.slice(0, 76))}</text>
        <text x="12" y="44" font-family="Arial, sans-serif" font-size="12" fill="#5b635d">${escapeXml(item.subtitle.slice(0, 94))}</text>
      </svg>`);
      composites.push({ input: label, left, top });
      composites.push({
        input: image,
        left: left + 12 + Math.floor((input.cellWidth - 24 - (metadata.width ?? 0)) / 2),
        top: top + 60 + Math.floor((input.cellHeight - 68 - (metadata.height ?? 0)) / 2)
      });
    }
    const sheetPath = path.join(input.outputDir, `${input.prefix}-${String(results.length + 1).padStart(2, "0")}.png`);
    await sharp({
      create: {
        width: input.columns * input.cellWidth,
        height: rows * input.cellHeight,
        channels: 4,
        background: "#f7f8f5"
      }
    }).composite(composites).png().toFile(sheetPath);
    results.push({
      path: path.relative(input.repoRoot, sheetPath).split(path.sep).join(path.posix.sep),
      sha256: await sha256File(sheetPath),
      labels: batch.map((item) => item.label)
    });
  }
  return results;
}

async function inspectFigureGeometry(page: Page, record: FigureRecord, viewportId: string): Promise<GeometryFinding[]> {
  return page.locator(`[data-semantic-figure-id="${record.figureId}"]`).evaluate((figure, input) => {
    const findings: GeometryFinding[] = [];
    const figureRect = figure.getBoundingClientRect();
    const mainRect = document.querySelector("main#course-main")?.getBoundingClientRect();
    if (mainRect && (figureRect.left < mainRect.left - 1 || figureRect.right > mainRect.right + 1)) {
      findings.push({ viewport: input.viewportId, routeId: input.routeId, figureId: input.figureId, kind: "figure-out-of-bounds", details: "The scientific model extends outside the active learner evidence lane." });
    }
    const cards = Array.from(figure.querySelectorAll<HTMLElement>(".bio-concept-flow > li"));
    const cardRects = cards.map((card) => card.getBoundingClientRect());
    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      const cardRect = cardRects[index];
      for (const child of card.querySelectorAll<HTMLElement>("span, strong, p")) {
        const childRect = child.getBoundingClientRect();
        if (childRect.left < cardRect.left - 1 || childRect.right > cardRect.right + 1 || childRect.top < cardRect.top - 1 || childRect.bottom > cardRect.bottom + 1) {
          findings.push({ viewport: input.viewportId, routeId: input.routeId, figureId: input.figureId, kind: "content-out-of-bounds", details: `Card ${index + 1} content extends outside its boundary: ${child.textContent?.trim().slice(0, 54) ?? "unlabelled content"}.` });
        }
        const fontSize = Number.parseFloat(getComputedStyle(child).fontSize);
        if (fontSize < 11.5) {
          findings.push({ viewport: input.viewportId, routeId: input.routeId, figureId: input.figureId, kind: "undersized-text", details: `Card ${index + 1} contains ${fontSize}px learner text.` });
        }
      }
      for (let otherIndex = index + 1; otherIndex < cards.length; otherIndex += 1) {
        const otherRect = cardRects[otherIndex];
        const overlapX = Math.min(cardRect.right, otherRect.right) - Math.max(cardRect.left, otherRect.left);
        const overlapY = Math.min(cardRect.bottom, otherRect.bottom) - Math.max(cardRect.top, otherRect.top);
        if (overlapX > 1 && overlapY > 1) {
          findings.push({ viewport: input.viewportId, routeId: input.routeId, figureId: input.figureId, kind: "figure-overlap", details: `Cards ${index + 1} and ${otherIndex + 1} overlap by ${overlapX.toFixed(1)}×${overlapY.toFixed(1)}px.` });
        }
      }
    }
    const pageOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    if (pageOverflow > 1) {
      findings.push({ viewport: input.viewportId, routeId: input.routeId, figureId: input.figureId, kind: "page-overflow", details: `The learner page exceeds the viewport by ${pageOverflow}px.` });
    }
    return findings;
  }, { viewportId, routeId: record.routeId, figureId: record.figureId });
}

async function inspectInteractionGeometry(page: Page, record: InteractionRecord, viewportId: string): Promise<GeometryFinding[]> {
  return page.locator(`[data-bio-interaction="${record.interactionId}"]`).evaluate((interaction, input) => {
    const findings: GeometryFinding[] = [];
    const interactionRect = interaction.getBoundingClientRect();
    const mainRect = document.querySelector("main#course-main")?.getBoundingClientRect();
    if (mainRect && (interactionRect.left < mainRect.left - 1 || interactionRect.right > mainRect.right + 1)) {
      findings.push({ viewport: input.viewportId, routeId: input.routeId, interactionId: input.interactionId, kind: "interaction-out-of-bounds", details: "The reasoning interaction extends outside the active learner evidence lane." });
    }
    const buttons = Array.from(interaction.querySelectorAll<HTMLElement>(".bio-model-case-option"));
    const buttonRects = buttons.map((button) => button.getBoundingClientRect());
    if (buttons.length !== 3) {
      findings.push({ viewport: input.viewportId, routeId: input.routeId, interactionId: input.interactionId, kind: "interaction-out-of-bounds", details: `Expected three evidence cases but found ${buttons.length}.` });
    }
    for (let index = 0; index < buttons.length; index += 1) {
      const button = buttons[index];
      const buttonRect = buttonRects[index];
      for (const child of button.querySelectorAll<HTMLElement>("span, strong")) {
        const childRect = child.getBoundingClientRect();
        if (childRect.left < buttonRect.left - 1 || childRect.right > buttonRect.right + 1 || childRect.top < buttonRect.top - 1 || childRect.bottom > buttonRect.bottom + 1) {
          findings.push({ viewport: input.viewportId, routeId: input.routeId, interactionId: input.interactionId, kind: "content-out-of-bounds", details: `Case ${index + 1} content extends outside its boundary: ${child.textContent?.trim().slice(0, 54) ?? "unlabelled content"}.` });
        }
        const fontSize = Number.parseFloat(getComputedStyle(child).fontSize);
        if (fontSize < 11.5) {
          findings.push({ viewport: input.viewportId, routeId: input.routeId, interactionId: input.interactionId, kind: "undersized-text", details: `Case ${index + 1} contains ${fontSize}px learner text.` });
        }
      }
      for (let otherIndex = index + 1; otherIndex < buttons.length; otherIndex += 1) {
        const otherRect = buttonRects[otherIndex];
        const overlapX = Math.min(buttonRect.right, otherRect.right) - Math.max(buttonRect.left, otherRect.left);
        const overlapY = Math.min(buttonRect.bottom, otherRect.bottom) - Math.max(buttonRect.top, otherRect.top);
        if (overlapX > 1 && overlapY > 1) {
          findings.push({ viewport: input.viewportId, routeId: input.routeId, interactionId: input.interactionId, kind: "interaction-overlap", details: `Cases ${index + 1} and ${otherIndex + 1} overlap by ${overlapX.toFixed(1)}×${overlapY.toFixed(1)}px.` });
        }
      }
    }
    const pageOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    if (pageOverflow > 1) {
      findings.push({ viewport: input.viewportId, routeId: input.routeId, interactionId: input.interactionId, kind: "page-overflow", details: `The learner page exceeds the viewport by ${pageOverflow}px.` });
    }
    return findings;
  }, { viewportId, routeId: record.routeId, interactionId: record.interactionId });
}

async function auditProject(input: { browser: Browser; outputRoot: string; project: string; repoRoot: string }) {
  if (!DEFAULT_PROJECTS.includes(input.project as (typeof DEFAULT_PROJECTS)[number])) throw new Error(`Unsupported Biology 30 production project: ${input.project}.`);
  const projectDir = path.join(input.repoRoot, "projects", input.project);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const [build, candidate, manifest, visualSeed] = await Promise.all([
    readJson<ProductionBuild>(path.join(metaDir, "production-build.json")),
    readJson<{ buildSha256: string; studioEditingEnabled: boolean; exportEnabled: boolean }>(path.join(metaDir, "production-candidate.json")),
    readJson<{ authoringStatus: string; authoring?: { driverId?: string; studioEditing?: { enabled?: boolean } } }>(path.join(metaDir, "project.json")),
    readJson<VisualReviewSeed>(path.join(metaDir, "visual-review.json"))
  ]);
  const workspaceSha256 = await hashTree(workspaceDir);
  if (build.projectSlug !== input.project || visualSeed.projectSlug !== input.project || build.buildSha256 !== build.workspace.sha256 || build.buildSha256 !== workspaceSha256 || candidate.buildSha256 !== build.buildSha256 || visualSeed.buildSha256 !== build.buildSha256) {
    throw new Error(`${input.project} visual audit refused drift between the workspace and exact build records.`);
  }
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "proposal-only-v1" || manifest.authoring.studioEditing?.enabled !== false || candidate.studioEditingEnabled || candidate.exportEnabled) {
    throw new Error(`${input.project} visual audit runs only against a blocked proposal-only-v1 candidate.`);
  }

  const outputDir = path.join(input.outputRoot, input.project);
  await mkdir(path.join(outputDir, "routes"), { recursive: true });
  await mkdir(path.join(outputDir, "figures"), { recursive: true });
  await mkdir(path.join(outputDir, "interactions"), { recursive: true });
  const server = await startWorkspaceServer(workspaceDir);
  const page = await input.browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  try {
    await page.goto(server.url, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const actualLearnerRoutes = await page.locator(".course-page").evaluateAll((nodes) => nodes.map((node) => node.id));
    if (build.learnerRoutes.length === 0
      || new Set(build.learnerRoutes).size !== build.learnerRoutes.length
      || JSON.stringify(actualLearnerRoutes) !== JSON.stringify(build.learnerRoutes)) {
      throw new Error(`${input.project} learner-route inventory drift: expected ${JSON.stringify(build.learnerRoutes)}, received ${JSON.stringify(actualLearnerRoutes)}.`);
    }
    const missingRequiredRoutes = visualSeed.requiredRoutes.filter((routeId) => !build.learnerRoutes.includes(routeId));
    if (missingRequiredRoutes.length > 0) {
      throw new Error(`${input.project} visual-review seed references unknown learner routes: ${missingRequiredRoutes.join(", ")}.`);
    }
    const auditedRoutes = build.learnerRoutes;
    const figures: FigureRecord[] = await page.locator("[data-semantic-figure-id]").evaluateAll((nodes) => nodes.map((node) => ({
      figureId: node.getAttribute("data-semantic-figure-id") ?? "",
      kind: node.getAttribute("data-figure-kind") ?? "",
      routeId: node.closest<HTMLElement>(".course-page")?.id ?? "",
      title: node.querySelector("h3")?.textContent?.trim() ?? "Untitled scientific model"
    })));
    const actualFigureIds = figures.map((figure) => figure.figureId);
    if (figures.some((figure) => !figure.figureId || !figure.kind || !figure.routeId) || new Set(actualFigureIds).size !== figures.length || JSON.stringify([...actualFigureIds].sort()) !== JSON.stringify([...build.semanticFigures].sort())) {
      throw new Error(`${input.project} scientific-model inventory drift: expected ${JSON.stringify(build.semanticFigures)}, received ${JSON.stringify(actualFigureIds)}.`);
    }
    const expectedKinds = Object.entries(build.semanticFigureKinds);
    if (expectedKinds.length !== figures.length || new Set(expectedKinds.map(([, kind]) => kind)).size < 7) {
      throw new Error(`${input.project} exact build does not declare a sufficiently varied scientific figure grammar.`);
    }
    for (const figure of figures) {
      const expectedKind = build.semanticFigureKinds[figure.routeId];
      if (!expectedKind || figure.kind !== expectedKind) {
        throw new Error(`${input.project} scientific-model grammar drift on ${figure.figureId}: expected ${expectedKind ?? "an explicit kind"}, received ${figure.kind || "none"}.`);
      }
    }
    const interactions: InteractionRecord[] = await page.locator("[data-bio-interaction]").evaluateAll((nodes) => nodes.map((node) => ({
      interactionId: node.getAttribute("data-bio-interaction") ?? "",
      kind: node.getAttribute("data-interaction-kind") ?? "",
      routeId: node.closest<HTMLElement>(".course-page")?.id ?? "",
      title: node.querySelector("h2")?.textContent?.trim() ?? "Untitled reasoning interaction"
    })));
    const actualInteractionIds = interactions.map((interaction) => interaction.interactionId);
    if (interactions.some((interaction) => !interaction.interactionId || !interaction.kind || !interaction.routeId)
      || new Set(actualInteractionIds).size !== interactions.length
      || JSON.stringify([...actualInteractionIds].sort()) !== JSON.stringify([...build.interactions].sort())) {
      throw new Error(`${input.project} reasoning-interaction inventory drift: expected ${JSON.stringify(build.interactions)}, received ${JSON.stringify(actualInteractionIds)}.`);
    }
    const expectedInteractionKinds = Object.entries(build.interactionPresentationKinds);
    if (expectedInteractionKinds.length !== interactions.length || new Set(expectedInteractionKinds.map(([, kind]) => kind)).size < 7) {
      throw new Error(`${input.project} exact build does not declare a sufficiently varied interaction presentation grammar.`);
    }
    for (const interaction of interactions) {
      const expectedKind = build.interactionPresentationKinds[interaction.routeId];
      if (!expectedKind || interaction.kind !== expectedKind) {
        throw new Error(`${input.project} interaction grammar drift on ${interaction.interactionId}: expected ${expectedKind ?? "an explicit kind"}, received ${interaction.kind || "none"}.`);
      }
    }

    const geometryFindings: GeometryFinding[] = [];
    const routeSheets: Array<{ viewport: string; path: string; sha256: string; routes: string[] }> = [];
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(server.url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const routeItems: SheetItem[] = [];
      for (const routeId of auditedRoutes) {
        await showRoute(page, routeId);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 1) geometryFindings.push({ viewport: viewport.id, routeId, kind: "page-overflow", details: `The learner page exceeds the viewport by ${overflow}px.` });
        const screenshotPath = path.join(outputDir, "routes", `${viewport.id}-${routeId}.png`);
        await page.screenshot({ path: screenshotPath, animations: "disabled", caret: "hide", fullPage: false });
        routeItems.push({ label: routeId, subtitle: `${input.project} · ${viewport.id}`, screenshotPath });
      }
      const sheets = await buildContactSheets({
        columns: 2,
        items: routeItems,
        outputDir,
        prefix: `routes-${viewport.id}`,
        repoRoot: input.repoRoot,
        cellWidth: viewport.width === 390 ? 360 : 520,
        cellHeight: viewport.width === 390 ? 730 : 390,
        itemsPerSheet: 8
      });
      for (const sheet of sheets) {
        routeSheets.push({ viewport: viewport.id, path: sheet.path, sha256: sheet.sha256, routes: sheet.labels });
      }
    }

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(server.url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await showRoute(page, interactions[0].routeId);
      await page.waitForTimeout(600);
      let activeRoute = interactions[0].routeId;
      for (let index = 0; index < interactions.length; index += 1) {
        const interaction = interactions[index];
        if (interaction.routeId !== activeRoute) {
          await showRoute(page, interaction.routeId);
          activeRoute = interaction.routeId;
        }
        geometryFindings.push(...(await inspectInteractionGeometry(page, interaction, viewport.id)));
        if (viewport.id === "desktop-1440x900") {
          await page.addStyleTag({ content: ".bio-global-save,.bio-save-exit{display:none!important}.bio-model--grammar{padding-top:28px!important}" });
          const locator = page.locator(`[data-bio-interaction="${interaction.interactionId}"]`);
          await locator.scrollIntoViewIfNeeded();
          const screenshotPath = path.join(outputDir, "interactions", `${String(index + 1).padStart(2, "0")}-${interaction.interactionId}.png`);
          await locator.screenshot({ path: screenshotPath, animations: "disabled", caret: "hide" });
          interaction.screenshotPath = path.relative(input.repoRoot, screenshotPath).split(path.sep).join(path.posix.sep);
          interaction.screenshotSha256 = await sha256File(screenshotPath);
        }
      }
    }

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(server.url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await showRoute(page, figures[0].routeId);
      await page.waitForTimeout(600);
      let activeRoute = figures[0].routeId;
      for (let index = 0; index < figures.length; index += 1) {
        const figure = figures[index];
        if (figure.routeId !== activeRoute) {
          await showRoute(page, figure.routeId);
          activeRoute = figure.routeId;
        }
        geometryFindings.push(...(await inspectFigureGeometry(page, figure, viewport.id)));
        if (viewport.id === "desktop-1440x900") {
          await page.addStyleTag({ content: ".bio-global-save,.bio-save-exit{display:none!important}.bio-concept-figure{margin-top:0!important}" });
          const locator = page.locator(`[data-semantic-figure-id="${figure.figureId}"]`);
          await locator.scrollIntoViewIfNeeded();
          const screenshotPath = path.join(outputDir, "figures", `${String(index + 1).padStart(2, "0")}-${figure.figureId}.png`);
          await locator.screenshot({ path: screenshotPath, animations: "disabled", caret: "hide" });
          figure.screenshotPath = path.relative(input.repoRoot, screenshotPath).split(path.sep).join(path.posix.sep);
          figure.screenshotSha256 = await sha256File(screenshotPath);
        }
      }
    }

    const figureItems: SheetItem[] = figures.map((figure, index) => {
      if (!figure.screenshotPath) throw new Error(`${figure.figureId} has no desktop screenshot.`);
      return { label: `${index + 1}. ${figure.figureId}`, subtitle: `${figure.title} · ${figure.kind}`, screenshotPath: path.join(input.repoRoot, figure.screenshotPath) };
    });
    const figureSheets = await buildContactSheets({
      columns: 3,
      items: figureItems,
      outputDir,
      prefix: "figures-contact-sheet",
      repoRoot: input.repoRoot,
      cellWidth: 480,
      cellHeight: 360,
      itemsPerSheet: 12
    });
    const interactionItems: SheetItem[] = interactions.map((interaction, index) => {
      if (!interaction.screenshotPath) throw new Error(`${interaction.interactionId} has no desktop screenshot.`);
      return { label: `${index + 1}. ${interaction.interactionId}`, subtitle: `${interaction.title} · ${interaction.kind}`, screenshotPath: path.join(input.repoRoot, interaction.screenshotPath) };
    });
    const interactionSheets = await buildContactSheets({
      columns: 3,
      items: interactionItems,
      outputDir,
      prefix: "interactions-contact-sheet",
      repoRoot: input.repoRoot,
      cellWidth: 480,
      cellHeight: 400,
      itemsPerSheet: 12
    });
    const generatedAt = new Date().toISOString();
    const pass = geometryFindings.length === 0;
    const report = {
      schemaVersion: 1,
      projectSlug: input.project,
      buildSha256: build.buildSha256,
      workspaceTreeSha256: workspaceSha256,
      generatedAt,
      status: pass ? "geometry-passed-awaiting-visual-inspection" : "geometry-failed",
      viewports: VIEWPORTS,
      requiredRoutes: visualSeed.requiredRoutes,
      auditedRoutes,
      auditedRouteViewportCount: auditedRoutes.length * VIEWPORTS.length,
      routeSheets,
      expectedFigureCount: build.semanticFigures.length,
      expectedFigureKinds: build.semanticFigureKinds,
      scientificFigureKindCount: new Set(Object.values(build.semanticFigureKinds)).size,
      figures,
      figureSheets: figureSheets.map((sheet) => ({ path: sheet.path, sha256: sheet.sha256, figureIds: sheet.labels.map((label) => label.replace(/^\d+\.\s*/, "")) })),
      expectedInteractionCount: build.interactions.length,
      interactionPresentationKinds: build.interactionPresentationKinds,
      interactionPresentationKindCount: new Set(Object.values(build.interactionPresentationKinds)).size,
      interactions,
      interactionSheets: interactionSheets.map((sheet) => ({ path: sheet.path, sha256: sheet.sha256, interactionIds: sheet.labels.map((label) => label.replace(/^\d+\.\s*/, "")) })),
      geometry: { pass, findingCount: geometryFindings.length, findings: geometryFindings },
      visualInspection: {
        required: true,
        status: "pending",
        instruction: "Open every route, figure, and interaction contact sheet. Inspect hierarchy, text fit, overlap, model arrows, case-board grammar, responsive reflow, focus affordances, and scientific legibility. Record exact sheet hashes and unresolved findings in visual-review.json; do not set a human score or approval."
      }
    };
    await writeJson(path.join(metaDir, "visual-audit.json"), report);
    if (!pass) throw new Error(`${input.project} visual audit found ${geometryFindings.length} geometry defect(s).`);
    return report;
  } finally {
    await page.close();
    await server.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const knownFlags = new Set(["project", "help", "h"]);
  const unknown = Object.keys(args.flags).filter((flag) => !knownFlags.has(flag));
  if (unknown.length || args.positionals.length) throw new Error(`Unknown arguments: ${[...unknown.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }
  const requestedProject = getStringFlag(args, "project");
  const projects = requestedProject ? [requestedProject] : [...DEFAULT_PROJECTS];
  const repoRoot = process.cwd();
  const generatedAt = new Date().toISOString();
  const outputRoot = path.join(repoRoot, ".runtime", "biology30-course-production-visual-audit", generatedAt.replace(/[:.]/g, "-"));
  await mkdir(outputRoot, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const reports = [];
    for (const project of projects) reports.push(await auditProject({ browser, outputRoot, project, repoRoot }));
    console.log("Biology 30 Units B-D exact-build visual geometry audit passed.");
    for (const report of reports) {
      console.log(`- ${report.projectSlug}: ${report.expectedFigureCount} scientific models; ${report.expectedInteractionCount} reasoning interactions; ${report.auditedRoutes.length} learner routes across ${VIEWPORTS.length} viewports; ${report.buildSha256}`);
      for (const sheet of [...report.routeSheets, ...report.figureSheets, ...report.interactionSheets]) console.log(`  Open for visual inspection: ${sheet.path}`);
    }
    console.log("Status: automated geometry passed; human score and promotion remain pending.");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
