/**
 * AB30 source-locator links suite — click-to-viewer enhancement.
 *
 * Proves the freeze-safe enhancement (workspace/source-locator-links.js):
 * every Chapter locator in course-data parses to a woven chapter PDF +
 * printed page, each resolves inside the real PDF via the frozen
 * main.js seam (same math the textbook buttons use), non-woven
 * locators are left untouched, the supplied-PDF tail strips cleanly,
 * and the injected button carries the exact data contract the frozen
 * content-body delegation handles.
 *
 * No DOM is available in this harness, so DOM injection itself is
 * covered by construction (pure, tested helpers + a thin query loop);
 * live-browser proof stays NOT_RUN in-sandbox per batch convention.
 *
 * Runners: `node --test <this file>` (sandbox-usable, import-free) and
 * `npx tsx --test <this file>` (repo convention for lead/CI).
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const evidenceDir = path.resolve("projects", "aboriginal-studies-30", "meta", "ab30-parity");
const linksPath = path.resolve(workspaceDir, "source-locator-links.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const mainPath = path.resolve(workspaceDir, "main.js");
const indexPath = path.resolve(workspaceDir, "index.html");

const linksSource = readFileSync(linksPath, "utf8");
const dataSource = readFileSync(dataPath, "utf8");
const mainSource = readFileSync(mainPath, "utf8");

type JsonRecord = Record<string, unknown>;

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadLinks(): Record<string, (...args: never[]) => unknown> {
  // No `document` in this context: the script must export its API and
  // skip the DOM boot without throwing.
  const context = {} as Record<string, unknown>;
  vm.createContext(context);
  vm.runInContext(linksSource, context, { filename: "source-locator-links.js" });
  const exported = (context as Record<string, unknown>)["AB30LocatorLinks"];
  assert.ok(exported && typeof exported === "object", "script must export AB30LocatorLinks without a DOM");
  return plain(exported) as Record<string, (...args: never[]) => unknown>;
}

// NOTE: functions do not survive plain(); re-fetch callable handles here.
function loadLinksLive(): {
  parseChapterLocator: (text: string) => { file: string; printedPage: number; chapter: number } | null;
  stripSuppliedTail: (text: string) => string;
  locatorButtonHtml: (target: { file: string; printedPage: number; chapter: number }) => string;
} {
  const context = {} as Record<string, unknown>;
  vm.createContext(context);
  vm.runInContext(linksSource, context, { filename: "source-locator-links.js" });
  const exported = (context as Record<string, unknown>)["AB30LocatorLinks"] as {
    parseChapterLocator: (text: string) => { file: string; printedPage: number; chapter: number } | null;
    stripSuppliedTail: (text: string) => string;
    locatorButtonHtml: (target: { file: string; printedPage: number; chapter: number }) => string;
  };
  assert.ok(exported, "script must export AB30LocatorLinks without a DOM");
  return exported;
}

function loadCourseData(): JsonRecord {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: JsonRecord } };
  vm.createContext(context);
  vm.runInContext(dataSource, context, { filename: "course-data.js" });
  const data = context.window.ABORIGINAL_STUDIES_30_DATA;
  assert.ok(data && typeof data === "object", "course data must load");
  return plain(data);
}

function sliceTopLevel(source: string, kind: "function" | "const", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `const ${name} =`;
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" must exist in main.js`);
  const lineStart = source.lastIndexOf("\n", start) + 1;
  const boundaryPattern = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundaryPattern.lastIndex = start + anchor.length;
  const next = boundaryPattern.exec(source);
  const slice = (next ? source.slice(lineStart, next.index) : source.slice(lineStart)).trim();
  new vm.Script(slice, { filename: `seam-${name}.js` });
  return slice;
}

function loadSeam(names: string[]): Record<string, (...args: never[]) => unknown> {
  const context = {} as Record<string, unknown>;
  vm.createContext(context);
  const parts = names.map((name) =>
    sliceTopLevel(mainSource, /^(?:WRITTEN_RUBRIC|chapterPrintedStarts|libraryPageCounts)$/.test(name) ? "const" : "function", name)
  );
  parts.push(`globalThis.__seam = { ${names.join(", ")} };`);
  vm.runInContext(parts.join("\n\n"), context, { filename: "ab30-locator-seam.js" });
  return (context as { __seam: Record<string, (...args: never[]) => unknown> }).__seam;
}

const DATA = loadCourseData();
const LINKS = loadLinksLive();
const ledger = JSON.parse(readFileSync(path.resolve(evidenceDir, "source-ledger.json"), "utf8")) as {
  localLibrary: Array<{ file: string; pdfPages?: number }>;
};

function allSourceLocators(): Array<{ lessonId: string; title: string; locator: string }> {
  const found: Array<{ lessonId: string; title: string; locator: string }> = [];
  const units = DATA["units"] as Array<{ lessons?: JsonRecord[] }>;
  for (const unit of units) {
    for (const lesson of unit.lessons || []) {
      for (const block of (lesson["blocks"] as JsonRecord[]) || []) {
        if (block["type"] === "source" && typeof block["locator"] === "string") {
          found.push({
            lessonId: String(lesson["id"]),
            title: String(block["title"]),
            locator: block["locator"] as string,
          });
        }
      }
    }
  }
  return found;
}

test("LOCATOR-LINKS01: every Chapter locator resolves inside its woven chapter PDF", () => {
  const seam = loadSeam(["chapterPrintedStarts", "libraryPageCounts", "chapterFileName", "chapterPdfPage"]);
  const realCounts = new Map(
    ledger.localLibrary.filter((entry) => entry.pdfPages).map((entry) => [entry.file, entry.pdfPages as number])
  );
  const chapterPdfPage = seam["chapterPdfPage"] as (file: string, printed: number) => number;
  const locators = allSourceLocators();
  assert.ok(locators.length > 500, `expected hundreds of source locators, saw ${locators.length}`);
  let woven = 0;
  let skipped = 0;
  for (const entry of locators) {
    const target = LINKS.parseChapterLocator(entry.locator);
    if (!target) {
      skipped += 1;
      assert.ok(
        entry.locator.includes("Walking Together"),
        `${entry.lessonId} ${entry.title}: only Walking Together locators may skip, saw: ${entry.locator}`
      );
      continue;
    }
    woven += 1;
    const label = `${entry.lessonId} ${entry.title} (${entry.locator})`;
    assert.ok(existsSync(path.resolve(workspaceDir, target.file)), `${label} chapter file must exist`);
    const real = realCounts.get(target.file);
    assert.ok(real, `${label} chapter file must be a recorded library PDF`);
    const pdf = chapterPdfPage(target.file, target.printedPage);
    assert.ok(pdf >= 1 && pdf <= (real as number), `${label} printed p.${target.printedPage} must resolve inside ${target.file}`);
  }
  assert.equal(skipped, 5, "exactly the five Walking Together locators skip");
  assert.ok(woven >= 570, `expected 570+ woven locators, saw ${woven}`);
});

test("LOCATOR-LINKS02: parser accepts chapter forms, rejects the rest", () => {
  assert.deepEqual(plain(LINKS.parseChapterLocator("Chapter 1, printed p. 13 (supplied PDF p. 21)") as unknown), {
    file: "./assets/library/chapter-1.pdf",
    printedPage: 13,
    chapter: 1,
  });
  assert.deepEqual(
    plain(LINKS.parseChapterLocator("Chapter 4 profile, printed p. 126 (supplied PDF p. 134)") as unknown),
    { file: "./assets/library/chapter-4.pdf", printedPage: 126, chapter: 4 }
  );
  for (const bad of [
    "Walking Together reading (Indigenous Canada, Module 1), printed p. 5 (file p. 8)",
    "Walking Together: The Oral Tradition (course reading PDF), file p. 18",
    "Chapter 9, printed p. 1 (supplied PDF p. 1)",
    "Chapter 0, printed p. 1 (supplied PDF p. 1)",
    "Chapter 2, printed p. 0 (supplied PDF p. 0)",
    "not a locator",
    "",
  ]) {
    assert.equal(LINKS.parseChapterLocator(bad), null, `must reject: ${bad || "(empty)"}`);
  }
});

test("LOCATOR-LINKS03: supplied-PDF tail strips cleanly; other text untouched", () => {
  assert.equal(
    LINKS.stripSuppliedTail("Chapter 1, printed p. 13 (supplied PDF p. 21)"),
    "Chapter 1, printed p. 13"
  );
  assert.equal(
    LINKS.stripSuppliedTail("Chapter 4 profile, printed p. 126 (supplied PDF p. 134)"),
    "Chapter 4 profile, printed p. 126"
  );
  const walking = "Walking Together: The Oral Tradition (course reading PDF), file p. 18";
  assert.equal(LINKS.stripSuppliedTail(walking), walking, "non-chapter locators keep their page refs");
});

test("LOCATOR-LINKS04: button carries the exact frozen reader contract", () => {
  const html = LINKS.locatorButtonHtml({ file: "./assets/library/chapter-1.pdf", printedPage: 13, chapter: 1 });
  assert.ok(html.includes('class="social-reading-link"'), "reader link class");
  assert.ok(html.includes('data-open-chapter="./assets/library/chapter-1.pdf"'), "chapter file attr");
  assert.ok(html.includes('data-chapter-page="13"'), "PRINTED page attr (main.js converts)");
  assert.ok(html.includes('data-chapter-title="Chapter 1"'), "title attr");
  assert.ok(html.includes(">Read here at page 13</button>"), "visible prompt text");
  const evil = LINKS.locatorButtonHtml({ file: 'x" onmouseover="y', printedPage: 1, chapter: 1 });
  assert.ok(!evil.includes('onmouseover="y'), "attribute values escaped");
  assert.ok(
    mainSource.includes("event.target.closest('[data-open-chapter]')"),
    "frozen delegation still handles the contract"
  );
});

test("LOCATOR-LINKS05: enhancement ships with the course shell", () => {
  const index = readFileSync(indexPath, "utf8");
  assert.ok(
    index.includes('<script src="./source-locator-links.js"></script>'),
    "index.html loads the enhancement after main.js"
  );
  assert.ok(
    index.indexOf("source-locator-links.js") > index.indexOf("./main.js"),
    "enhancement loads after main.js"
  );
  // API-only load must not throw without a DOM (proves the boot guard).
  loadLinks();
});
