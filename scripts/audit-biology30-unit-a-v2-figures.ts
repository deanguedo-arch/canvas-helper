import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

import { chromium, type Browser, type Page } from "playwright";
import sharp from "sharp";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";

const PROJECT_SLUG = "biology30-unit-a";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "tablet", width: 1024, height: 768 },
  { id: "mobile", width: 390, height: 844 }
] as const;

type BuildRecord = {
  buildSha256: string;
  figures: string[];
  status: string;
};

type FigureRecord = {
  figureId: string;
  renderedId: string;
  routeId: string;
  title: string;
  screenshotPath?: string;
  screenshotSha256?: string;
};

type GeometryFinding = {
  viewport: string;
  figureId: string;
  routeId: string;
  kind: "text-overlap" | "text-out-of-bounds" | "connector-text-collision" | "page-overflow" | "unreadable-label" | "responsive-containment";
  details: string;
};

function usage() {
  return [
    "Usage: npm run audit:biology30-unit-a-v2:figures -- \\",
    "  --project biology30-unit-a",
    "",
    "Renders every Biology 30 Unit A figure inside the exact blocked candidate at desktop, tablet, and mobile widths. It writes geometry evidence plus desktop contact sheets for mandatory AI or human visual inspection."
  ].join("\n");
}

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
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
    if (!entry.isFile()) throw new Error(`Figure audit cannot hash unsupported workspace entry: ${absolutePath}`);
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
    ".json": "application/json; charset=utf-8",
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
  if (!address || typeof address === "string") throw new Error("Figure audit could not allocate a local preview port.");
  return {
    url: `http://127.0.0.1:${address.port}/index.html`,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  };
}

async function showRoute(page: Page, routeId: string) {
  const target = page.locator(`[data-page-target="${routeId}"]`).first();
  if ((await target.count()) !== 1) throw new Error(`Figure audit cannot activate learner route ${routeId}.`);
  await target.evaluate((node) => (node as HTMLElement).click());
  await page.locator(`section#${routeId}`).waitFor({ state: "visible" });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
}

async function inventoryFigures(page: Page, expectedFigureIds: string[]): Promise<FigureRecord[]> {
  return page.locator(".bio-figure:has(svg[data-figure-id])").evaluateAll((figures, expectedIds) => figures.map((figure) => {
    const svg = figure.querySelector<SVGSVGElement>("svg[data-figure-id]");
    const route = figure.closest<HTMLElement>(".course-page");
    const renderedId = svg?.dataset.figureId ?? "";
    const figureId = expectedIds.find((expectedId) => renderedId === expectedId || renderedId.endsWith(`-${expectedId}`)) ?? renderedId;
    return {
      figureId,
      renderedId,
      routeId: route?.id ?? "",
      title: svg?.querySelector("title")?.textContent?.trim() ?? "Untitled scientific figure"
    };
  }), expectedFigureIds);
}

async function inspectFigureGeometry(page: Page, figure: FigureRecord, viewportId: string): Promise<GeometryFinding[]> {
  const locator = page.locator(`svg[data-figure-id="${figure.renderedId}"]`);
  return locator.evaluate((svg, input) => {
    const findings: GeometryFinding[] = [];
    const svgRect = svg.getBoundingClientRect();
    const wrapper = svg.closest<HTMLElement>(".bio-figure");
    if (!wrapper) throw new Error(`Figure ${input.figureId} has no semantic wrapper.`);
    const textNodes = Array.from(svg.querySelectorAll<SVGTextElement>("text")).map((node, index) => {
      const rect = node.getBoundingClientRect();
      return { index, text: node.textContent?.trim() ?? "", rect };
    }).filter((entry) => entry.text && entry.rect.width > 0 && entry.rect.height > 0);

    for (let leftIndex = 0; leftIndex < textNodes.length; leftIndex += 1) {
      const left = textNodes[leftIndex];
      if (left.rect.left < svgRect.left - 1 || left.rect.top < svgRect.top - 1 || left.rect.right > svgRect.right + 1 || left.rect.bottom > svgRect.bottom + 1) {
        findings.push({ viewport: input.viewportId, figureId: input.figureId, routeId: input.routeId, kind: "text-out-of-bounds", details: `Label “${left.text}” extends outside the SVG view box.` });
      }
      if (left.rect.height < 9.5) {
        findings.push({ viewport: input.viewportId, figureId: input.figureId, routeId: input.routeId, kind: "unreadable-label", details: `Label “${left.text}” renders only ${left.rect.height.toFixed(1)}px high.` });
      }
      for (let rightIndex = leftIndex + 1; rightIndex < textNodes.length; rightIndex += 1) {
        const right = textNodes[rightIndex];
        const overlapX = Math.min(left.rect.right, right.rect.right) - Math.max(left.rect.left, right.rect.left);
        const overlapY = Math.min(left.rect.bottom, right.rect.bottom) - Math.max(left.rect.top, right.rect.top);
        if (overlapX > 1 && overlapY > 1) {
          findings.push({ viewport: input.viewportId, figureId: input.figureId, routeId: input.routeId, kind: "text-overlap", details: `Labels “${left.text}” and “${right.text}” overlap by ${overlapX.toFixed(1)}×${overlapY.toFixed(1)}px.` });
        }
      }
    }

    for (const connector of svg.querySelectorAll<SVGGeometryElement>("[data-qa-connector]")) {
      const matrix = connector.getScreenCTM();
      const length = connector.getTotalLength();
      if (!matrix || !Number.isFinite(length) || length <= 0) continue;
      for (const label of textNodes) {
        const inset = 2;
        let collides = false;
        for (let distance = 0; distance <= length; distance += 3) {
          const point = connector.getPointAtLength(Math.min(distance, length)).matrixTransform(matrix);
          if (point.x > label.rect.left + inset && point.x < label.rect.right - inset && point.y > label.rect.top + inset && point.y < label.rect.bottom - inset) {
            collides = true;
            break;
          }
        }
        if (collides) {
          findings.push({ viewport: input.viewportId, figureId: input.figureId, routeId: input.routeId, kind: "connector-text-collision", details: `Connector ${connector.dataset.qaConnector ?? "unnamed"} crosses label “${label.text}”.` });
        }
      }
    }

    const pageOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    if (pageOverflow > 1) findings.push({ viewport: input.viewportId, figureId: input.figureId, routeId: input.routeId, kind: "page-overflow", details: `The learner page exceeds its viewport by ${pageOverflow}px while this figure is visible.` });
    const wrapperStyle = getComputedStyle(wrapper);
    if (input.viewportId === "mobile" && (wrapperStyle.overflowX !== "auto" || wrapper.scrollWidth <= wrapper.clientWidth || svgRect.width < 800)) {
      findings.push({ viewport: input.viewportId, figureId: input.figureId, routeId: input.routeId, kind: "responsive-containment", details: `Mobile figure containment is invalid: overflow-x=${wrapperStyle.overflowX}, wrapper=${wrapper.clientWidth}/${wrapper.scrollWidth}px, SVG=${svgRect.width.toFixed(1)}px.` });
    }
    return findings;
  }, { viewportId, figureId: figure.figureId, routeId: figure.routeId });
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function buildContactSheets(repoRoot: string, outputDir: string, figures: FigureRecord[]) {
  const columns = 3;
  const rows = 3;
  const cardWidth = 600;
  const cardHeight = 420;
  const gap = 20;
  const margin = 20;
  const sheetWidth = margin * 2 + columns * cardWidth + (columns - 1) * gap;
  const sheetHeight = margin * 2 + rows * cardHeight + (rows - 1) * gap;
  const results: Array<{ path: string; sha256: string; figureIds: string[] }> = [];

  for (let offset = 0; offset < figures.length; offset += columns * rows) {
    const batch = figures.slice(offset, offset + columns * rows);
    const composites: Array<{ input: Buffer; left: number; top: number }> = [];
    for (let index = 0; index < batch.length; index += 1) {
      const figure = batch[index];
      if (!figure.screenshotPath) throw new Error(`Figure ${figure.figureId} has no desktop screenshot.`);
      const column = index % columns;
      const row = Math.floor(index / columns);
      const left = margin + column * (cardWidth + gap);
      const top = margin + row * (cardHeight + gap);
      const image = await sharp(path.join(repoRoot, figure.screenshotPath))
        .resize({ width: cardWidth - 24, height: cardHeight - 84, fit: "contain", background: "#ffffff" })
        .png()
        .toBuffer();
      const card = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}">
        <rect x="0.5" y="0.5" width="${cardWidth - 1}" height="${cardHeight - 1}" rx="8" fill="#ffffff" stroke="#d9ded8"/>
        <text x="14" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#171b1b">${escapeXml(`${offset + index + 1}. ${figure.routeId} · ${figure.figureId}`)}</text>
        <text x="14" y="49" font-family="Arial, sans-serif" font-size="15" fill="#5b635d">${escapeXml(figure.title.slice(0, 72))}</text>
      </svg>`);
      composites.push({ input: card, left, top });
      composites.push({ input: image, left: left + 12, top: top + 70 });
    }
    const sheetPath = path.join(outputDir, `contact-sheet-${String(results.length + 1).padStart(2, "0")}.png`);
    await sharp({ create: { width: sheetWidth, height: sheetHeight, channels: 4, background: "#f7f8f5" } }).composite(composites).png().toFile(sheetPath);
    results.push({
      path: path.relative(repoRoot, sheetPath).split(path.sep).join(path.posix.sep),
      sha256: await sha256File(sheetPath),
      figureIds: batch.map((figure) => figure.figureId)
    });
  }
  return results;
}

async function auditPage(input: { page: Page; baseUrl: string; figures: FigureRecord[]; outputDir: string; repoRoot: string }) {
  const findings: GeometryFinding[] = [];
  for (const viewport of VIEWPORTS) {
    await input.page.setViewportSize({ width: viewport.width, height: viewport.height });
    await input.page.goto(input.baseUrl, { waitUntil: "domcontentloaded" });
    await input.page.evaluate(() => document.fonts.ready);
    let activeRoute = "";
    for (let index = 0; index < input.figures.length; index += 1) {
      const figure = input.figures[index];
      if (figure.routeId !== activeRoute) {
        await showRoute(input.page, figure.routeId);
        activeRoute = figure.routeId;
      }
      const svg = input.page.locator(`svg[data-figure-id="${figure.renderedId}"]`);
      await svg.scrollIntoViewIfNeeded();
      await svg.evaluate((node) => node.closest<HTMLElement>(".bio-figure")?.scrollTo({ left: 0, behavior: "instant" }));
      findings.push(...(await inspectFigureGeometry(input.page, figure, viewport.id)));
      if (viewport.id === "desktop") {
        const screenshotPath = path.join(input.outputDir, "desktop", `${String(index + 1).padStart(2, "0")}-${figure.figureId}.png`);
        await svg.screenshot({ path: screenshotPath, animations: "disabled", caret: "hide" });
        figure.screenshotPath = path.relative(input.repoRoot, screenshotPath).split(path.sep).join(path.posix.sep);
        figure.screenshotSha256 = await sha256File(screenshotPath);
      }
    }
  }
  return findings;
}

async function runAudit(repoRoot: string, project: string) {
  if (project !== PROJECT_SLUG) throw new Error(`--project must be ${PROJECT_SLUG}.`);
  const projectDir = path.join(repoRoot, "projects", project);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const [build, candidate, projectManifest] = await Promise.all([
    readJson<BuildRecord>(path.join(metaDir, "gate-2-build.json")),
    readJson<{ buildSha256: string; status: string; studioEditingEnabled: boolean; exportEnabled: boolean }>(path.join(metaDir, "production-candidate.json")),
    readJson<{ authoringStatus: string; authoring?: { driverId?: string; studioEditing?: { enabled?: boolean } } }>(path.join(metaDir, "project.json"))
  ]);
  const workspaceSha256 = await hashTree(workspaceDir);
  if (workspaceSha256 !== build.buildSha256 || candidate.buildSha256 !== build.buildSha256) throw new Error("Figure audit refused a candidate whose workspace or production record drifted from the exact Gate 2 build.");
  if (build.status !== "blocked-awaiting-user" || candidate.studioEditingEnabled || candidate.exportEnabled || projectManifest.authoringStatus !== "blocked" || projectManifest.authoring?.driverId !== "proposal-only-v1" || projectManifest.authoring.studioEditing?.enabled !== false) {
    throw new Error("Figure audit runs only against a blocked proposal-only-v1 candidate.");
  }

  const generatedAt = new Date().toISOString();
  const runId = `${build.buildSha256.slice(0, 12)}-${generatedAt.replace(/[:.]/g, "-")}`;
  const outputDir = path.join(repoRoot, ".runtime", "biology30-unit-a-v2-figure-audit", runId);
  await mkdir(path.join(outputDir, "desktop"), { recursive: true });
  const server = await startWorkspaceServer(workspaceDir);
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(server.url, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const figures = await inventoryFigures(page, build.figures);
    const actualIds = figures.map((figure) => figure.figureId);
    const actualRenderedIds = figures.map((figure) => figure.renderedId);
    const expectedIds = [...build.figures];
    if (figures.some((figure) => !figure.figureId || !figure.renderedId || !figure.routeId) || new Set(actualRenderedIds).size !== actualRenderedIds.length || JSON.stringify([...new Set(actualIds)].sort()) !== JSON.stringify([...expectedIds].sort())) {
      throw new Error(`Figure audit inventory drift: expected ${JSON.stringify(expectedIds)}, received ${JSON.stringify(actualIds)}.`);
    }
    const findings = await auditPage({ page, baseUrl: server.url, figures, outputDir, repoRoot });
    const contactSheets = await buildContactSheets(repoRoot, outputDir, figures);
    const geometryPass = findings.length === 0;
    const report = {
      schemaVersion: 1,
      projectSlug: project,
      buildSha256: build.buildSha256,
      workspaceTreeSha256: workspaceSha256,
      generatedAt,
      status: geometryPass ? "geometry-passed-awaiting-visual-inspection" : "geometry-failed",
      expectedFigureCount: expectedIds.length,
      uniqueRenderedFigureCount: new Set(actualIds).size,
      renderedFigureOccurrenceCount: figures.length,
      viewports: VIEWPORTS,
      geometry: { pass: geometryPass, findingCount: findings.length, findings },
      figures,
      contactSheets,
      visualInspection: {
        required: true,
        status: "pending",
        instruction: "Codex or a human reviewer must open every listed contact sheet, inspect all included figures for hierarchy, spacing, label placement, connector alignment, clipping, and scientific legibility, then create gate-3-figure-visual-inspection.json for this exact build and these exact contact-sheet hashes."
      }
    };
    await writeJson(path.join(metaDir, "gate-3-figure-audit.json"), report);
    if (!geometryPass) throw new Error(`Figure audit found ${findings.length} geometry defect(s). See projects/${project}/meta/gate-3-figure-audit.json.`);
    return { report, reportPath: path.join(metaDir, "gate-3-figure-audit.json") };
  } finally {
    await browser?.close();
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
  const project = getStringFlag(args, "project");
  if (!project) throw new Error("--project is required.");
  const result = await runAudit(process.cwd(), project);
  console.log("Biology 30 Unit A exact-build figure geometry audit passed.");
  console.log(`- Report: ${result.reportPath}`);
  console.log(`- Figures: ${result.report.uniqueRenderedFigureCount} unique across ${result.report.renderedFigureOccurrenceCount} course placements`);
  console.log(`- Viewports: ${result.report.viewports.map((viewport) => `${viewport.width}x${viewport.height}`).join(", ")}`);
  for (const sheet of result.report.contactSheets) console.log(`- Open for visual inspection: ${sheet.path}`);
  console.log("Status: automated geometry passed; visual acceptance remains pending until every contact sheet is opened and an exact-hash inspection record is verified.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
