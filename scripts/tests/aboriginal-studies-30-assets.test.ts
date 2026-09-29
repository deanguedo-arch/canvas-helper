/**
 * AB30 asset + offline-resilience suite — T21 (ASSET01/02/05-auto).
 *
 * ASSET01: every shipped local reference exists (course data, shell,
 * code literals, stylesheets). ASSET02: the shell carries zero essential
 * network dependencies (no CDN link/script, consent-gated embeds, system
 * font fallbacks, text glyphs). ASSET05: the deliverable allowlist
 * excludes backups/metadata/keys while source backups stay on disk.
 * ASSET03-auto lives in the Theme 3 suite; ASSET04-auto in the mywork
 * suite; both re-run in the T21 matrix step.
 *
 * Runners: `node --test <this file>` (sandbox-usable, import-free) and
 * `npx tsx --test <this file>` (repo convention for lead/CI).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const indexPath = path.resolve(workspaceDir, "index.html");
const cssPath = path.resolve(workspaceDir, "styles.css");
const manifestPath = path.resolve(
  "projects",
  "aboriginal-studies-30",
  "meta",
  "ab30-parity",
  "asset-manifest.json"
);
const ledgerPath = path.resolve(
  "projects",
  "aboriginal-studies-30",
  "meta",
  "ab30-parity",
  "media-ledger.json"
);

const mainSource = readFileSync(mainPath, "utf8");

function sliceTopLevel(kind: "const" | "function", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `const ${name} =`;
  const start = mainSource.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" missing (production drift?)`);
  const lineStart = mainSource.lastIndexOf("\n", start) + 1;
  const boundary = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundary.lastIndex = start + anchor.length;
  const next = boundary.exec(mainSource);
  return (next ? mainSource.slice(lineStart, next.index) : mainSource.slice(lineStart)).trim();
}

type Seam = {
  renderConsentEmbed: (embedUrl: string, title: string) => string;
  renderActivityResource: (resource: Record<string, unknown>) => string;
  renderActivityPromptResources: (resources: Array<Record<string, unknown>>) => string;
  renderMediaFrame: (item: Record<string, unknown>) => string;
  renderFilmEmbed: (embedUrl: string, title: string) => string;
  toEmbedUrl: (url: string) => string;
};

function buildRuntime(): { seam: Seam } {
  const dataContext = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: unknown } };
  vm.createContext(dataContext);
  vm.runInContext(readFileSync(dataPath, "utf8"), dataContext, { filename: "course-data.js" });
  const context = {
    DATA: JSON.parse(JSON.stringify(dataContext.window.ABORIGINAL_STUDIES_30_DATA)),
    console,
    TextEncoder,
    URL,
    URLSearchParams,
  } as Record<string, unknown>;
  vm.createContext(context);
  const script = [
    sliceTopLevel("const", "units"),
    ...["escapeHtml", "toEmbedUrl", "renderConsentEmbed", "renderActivityResource", "renderActivityPromptResources", "renderFilmEmbed", "renderMediaFrame"].map(
      (name) => sliceTopLevel("function", name)
    ),
    `globalThis.__seam = {
      renderConsentEmbed, renderActivityResource, renderActivityPromptResources,
      renderMediaFrame, renderFilmEmbed, toEmbedUrl,
    };`,
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-asset-seam.js" });
  return { seam: (context as { __seam: Seam }).__seam };
}

function loadCourseData(): Record<string, unknown> {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: Record<string, unknown> } };
  vm.createContext(context);
  vm.runInContext(readFileSync(dataPath, "utf8"), context, { filename: "course-data.js" });
  return JSON.parse(JSON.stringify(context.window.ABORIGINAL_STUDIES_30_DATA));
}

function collectLocalRefs(): Set<string> {
  const refs = new Set<string>();
  const walk = (value: unknown): void => {
    if (typeof value === "string" && value.startsWith("./")) refs.add(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(loadCourseData());
  const index = readFileSync(indexPath, "utf8");
  for (const match of index.matchAll(/(?:src|href)="(\.[^"]+)"/g)) refs.add(match[1]);
  for (const match of mainSource.matchAll(/['"`]\.\/assets\/[^'"`]+['"`]/g)) {
    refs.add(match[0].slice(1, -1));
  }
  const css = readFileSync(cssPath, "utf8");
  for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
    const cleaned = match[1].replace(/['"]/g, "").trim();
    if (cleaned.startsWith("./") || cleaned.startsWith(".")) refs.add(cleaned);
  }
  return refs;
}

test("ASSET01-auto: every shipped local reference exists on disk", () => {
  const refs = collectLocalRefs();
  assert.ok(refs.size >= 40, `expected 40+ local refs, got ${refs.size}`);
  const missing: string[] = [];
  for (const ref of refs) {
    const disk = path.resolve(workspaceDir, ref.replace(/^\.\//, ""));
    if (!existsSync(disk) || !statSync(disk).isFile()) missing.push(ref);
  }
  assert.deepEqual(missing, [], `missing local assets: ${missing.slice(0, 10).join(", ")}`);
  assert.ok(refs.has("./assets/brand/nxt-ce-logo-white-with-ce.png"), "brand logo retained");
});

test("ASSET02-auto: shell has zero essential network dependencies", () => {
  const index = readFileSync(indexPath, "utf8");
  assert.ok(!/https?:\/\//.test(index), "index.html must link nothing external");
  assert.ok(!index.includes("fonts.googleapis.com"), "no font CDN");
  assert.ok(!index.includes("font-awesome") && !index.includes("cdnjs"), "no icon CDN");
  assert.ok(!/fa-(solid|regular|brands)/.test(index + mainSource), "no Font Awesome classes anywhere");
  const css = readFileSync(cssPath, "utf8");
  assert.ok(!/https?:\/\//.test(css), "stylesheets must reference nothing external");
  for (const fallback of ["-apple-system", "Segoe UI", "Roboto", "Arial"]) {
    assert.ok(css.includes(fallback), `system fallback present: ${fallback}`);
  }
  assert.ok(css.includes(".icon-glyph"), "glyph style defined");
  assert.ok(!mainSource.includes("autoplay"), "no autoplay permission anywhere");
  assert.ok(mainSource.includes("[data-load-embed]"), "consent handler wired");
  const { seam } = buildRuntime();
  const video = { kind: "video", title: "SYNTH video", url: "https://www.youtube.com/watch?v=SYNTH123" };
  assert.equal(seam.toEmbedUrl(video.url as string), "https://www.youtube.com/embed/SYNTH123");
  for (const html of [seam.renderActivityResource(video), seam.renderActivityPromptResources([video])]) {
    assert.ok(!html.includes("<iframe"), "no unconditional iframe at render");
    assert.ok(html.includes("data-load-embed"), "consent facade with load action");
    assert.ok(html.includes("SYNTH video"), "title visible without loading");
    assert.ok(html.includes("youtube.com"), "source host disclosed before consent");
  }
  const filmHtml = seam.renderMediaFrame({ ...video, moduleCode: "SYNTH" });
  assert.ok(filmHtml.includes("<iframe"), "Film Room embeds load with the selected video");
  assert.ok(filmHtml.includes('loading="eager"'), "Film Room requests its active video immediately");
  assert.ok(!filmHtml.includes("data-load-embed"), "Film Room has no extra load action");
  assert.ok(filmHtml.includes("SYNTH video"), "Film Room iframe keeps an accessible title");
  const facade = seam.renderConsentEmbed("https://www.youtube.com/embed/SYNTH123", "SYNTH <b>title</b>");
  assert.ok(!facade.includes("<b>title</b>"), "facade escapes titles");
  assert.ok(facade.includes("Loading it contacts that service"), "consent note states the cost");
});

test("ASSET05-auto: allowlist ships the course, excludes backups/metadata/keys, keeps sources", () => {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    shipped: Array<{ path: string; bytes: number; sha256: string }>;
    excluded: Array<{ path: string; reason: string }>;
  };
  for (const required of ["index.html", "main.js", "course-data.js", "styles.css", "learning-store.js"]) {
    assert.ok(
      manifest.shipped.some((entry) => entry.path === required),
      `allowlist must ship ${required}`
    );
  }
  for (const entry of manifest.shipped) {
    assert.ok(!entry.path.endsWith(".DS_Store"), `never ship metadata: ${entry.path}`);
    assert.ok(!/archive\.zip$/i.test(entry.path), `never ship nested backups: ${entry.path}`);
    assert.ok(!/key/i.test(entry.path) || entry.path.endsWith(".css"), `never ship key files: ${entry.path}`);
    const disk = path.resolve(workspaceDir, entry.path);
    assert.ok(existsSync(disk), `shipped file must exist: ${entry.path}`);
    assert.equal(statSync(disk).size, entry.bytes, `bytes pinned: ${entry.path}`);
    if (entry.bytes < 1024 * 1024) {
      const actual = createHash("sha256").update(readFileSync(disk)).digest("hex");
      assert.equal(actual, entry.sha256, `hash pinned: ${entry.path}`);
    }
  }
  const excludedPaths = manifest.excluded.map((entry) => entry.path);
  assert.ok(excludedPaths.some((name) => name.endsWith("Archive.zip")), "Archive.zip excluded with reason");
  assert.ok(excludedPaths.some((name) => name.endsWith(".DS_Store")), ".DS_Store excluded with reason");
  for (const entry of manifest.excluded) {
    assert.ok(entry.reason && entry.reason.length > 10, `${entry.path} exclusion reasoned`);
    assert.ok(existsSync(path.resolve(workspaceDir, entry.path)), `source backup intact: ${entry.path}`);
  }
  const refs = collectLocalRefs();
  const shippedPaths = new Set(manifest.shipped.map((entry) => entry.path));
  for (const ref of refs) {
    assert.ok(shippedPaths.has(ref.slice(2)), `referenced asset shipped: ${ref}`);
  }
});

test("LEDGER: every shipped media asset carries a source/permission record", () => {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    shipped: Array<{ path: string; class: string }>;
  };
  const ledger = JSON.parse(readFileSync(ledgerPath, "utf8")) as {
    entries: Array<{ path: string; source: string; permission: string; fallback: string }>;
  };
  const media = manifest.shipped.filter((entry) => entry.class !== "code-shell").map((entry) => entry.path);
  assert.ok(media.length > 50, `expected 50+ media assets, got ${media.length}`);
  const byPath = new Map(ledger.entries.map((entry) => [entry.path, entry]));
  for (const rel of media) {
    const entry = byPath.get(rel);
    assert.ok(entry, `ledger must cover ${rel}`);
    assert.ok((entry?.source ?? "").length > 5, `${rel} source recorded`);
    assert.ok((entry?.permission ?? "").length > 3, `${rel} permission recorded`);
    assert.ok((entry?.fallback ?? "").length > 5, `${rel} fallback recorded`);
  }
  const unverified = ledger.entries.filter((entry) => entry.permission === "unverified").length;
  assert.ok(unverified > 0, "ledger must honestly report unverified permissions (human decision pending)");
});
