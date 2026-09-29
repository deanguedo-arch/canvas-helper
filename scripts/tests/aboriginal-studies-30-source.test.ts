/**
 * AB30 source-contract suite — T03 (tests + manifests scope).
 *
 * Verifies SRC01–SRC08 against the real production bundle, the real export
 * mirrors, and the T03 developer manifests. Import-free (node: builtins
 * only) so both `node --test` (sandbox) and `npx tsx --test` (lead/CI) run it.
 *
 * What is independently verified vs locked:
 * - PDF booklet/criteria/rubric/novel wording was read by the implementer
 *   with pypdf during T03 recon; the suite locks the verified anchors,
 *   hashes, and counts so any drift fails loudly. Re-running the pypdf
 *   cross-checks is the lead's +human half (sources recorded in
 *   source-ledger.json).
 * - DOCX mirrors are parsed with a dependency-free zip reader below and
 *   compared sentence-by-sentence against the live instructions.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { inflateRawSync } from "node:zlib";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const evidenceDir = path.resolve("projects", "aboriginal-studies-30", "meta", "ab30-parity");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const indexPath = path.resolve(workspaceDir, "index.html");

type JsonRecord = Record<string, unknown>;
type Assignment = JsonRecord & {
  id: string;
  title?: string;
  summary?: string;
  instructionsHtml?: string;
  links?: Array<{ name?: string; url?: string }>;
  textbook?: { label?: string; file?: string; title?: string };
  htmlPath?: string;
  docxPath?: string;
};

const mainSource = readFileSync(mainPath, "utf8");
const dataSource = readFileSync(dataPath, "utf8");
const indexSource = readFileSync(indexPath, "utf8");

function sha12(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 12);
}
console.log(`[ab30-source] tested inputs: main.js=${sha12(mainSource)} course-data.js=${sha12(dataSource)}`);

function loadCourseData(source: string): JsonRecord {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: JsonRecord } };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "course-data.js" });
  const data = context.window.ABORIGINAL_STUDIES_30_DATA;
  assert.ok(data && typeof data === "object", "course-data.js must assign window.ABORIGINAL_STUDIES_30_DATA");
  return JSON.parse(JSON.stringify(data)) as JsonRecord;
}

const DATA = loadCourseData(dataSource);
const assignments = DATA["assignments"] as Assignment[];
const units = DATA["units"] as Array<{ id: string; lessons?: Array<{ id: string; textbook?: { label?: string; file?: string } }> }>;

type ManifestAssignment = {
  id: string;
  visible: boolean;
  officialAnchors: string[];
  currentWordingSha12: string;
  observedRequired: string[];
  observedOptional: string[];
};
type AssignmentManifest = {
  schemaVersion: number;
  assignments: ManifestAssignment[];
  versions: Record<string, { selectedVersion: string } & JsonRecord>;
  holds: Array<{ id: string; reason: string; owningTicket: string }>;
};
const manifest = JSON.parse(readFileSync(path.resolve(evidenceDir, "assignment-manifest.json"), "utf8")) as AssignmentManifest;
const ledger = JSON.parse(readFileSync(path.resolve(evidenceDir, "source-ledger.json"), "utf8")) as {
  localLibrary: Array<{ file: string; pdfPages?: number }>;
};
const editorialLog = JSON.parse(readFileSync(path.resolve(evidenceDir, "editorial-log.json"), "utf8")) as {
  entries: Array<{ id: string; date: string; area: string; before: string; after: string; source: string; reason: string }>;
};

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
  vm.runInContext(parts.join("\n\n"), context, { filename: "ab30-source-seam.js" });
  return (context as { __seam: Record<string, (...args: never[]) => unknown> }).__seam;
}

function htmlToText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sentences(value: string): string[] {
  return value
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function readZipEntry(zipPath: string, entryName: string): string {
  const buf = readFileSync(zipPath);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  assert.ok(eocd >= 0, `EOCD not found in ${zipPath}`);
  const count = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n += 1) {
    assert.equal(buf.readUInt32LE(offset), 0x02014b50, `central header ${n} in ${zipPath}`);
    const method = buf.readUInt16LE(offset + 10);
    const compSize = buf.readUInt32LE(offset + 20);
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    const name = buf.toString("utf8", offset + 46, offset + 46 + nameLen);
    const localOffset = buf.readUInt32LE(offset + 42);
    if (name === entryName) {
      const localNameLen = buf.readUInt16LE(localOffset + 26);
      const localExtraLen = buf.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      const comp = buf.subarray(dataStart, dataStart + compSize);
      return (method === 8 ? inflateRawSync(comp) : comp).toString("utf8");
    }
    offset += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`entry ${entryName} not found in ${zipPath}`);
}

const PRIVATE_DOC_IDS = ["12LtUq2b_pdDksNJUs71Z8rYiJjlS3SHar9RJmK48Ecs", "1kd3XGjh72_cedciCp1M_wps0NyYxo8ZqAw72_n2MUEM"];

// ---------------------------------------------------------------------------
// SRC01 — one canonical definition; lesson/page/HTML/DOCX parity.
// ---------------------------------------------------------------------------

test("SRC01-canonical: every assignment has one manifest definition matching live wording + official anchors", () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(assignments.length, 12);
  const manifestIds = manifest.assignments.map((entry) => entry.id).sort();
  assert.deepEqual(
    assignments.map((assignment) => assignment.id).sort(),
    manifestIds
  );
  for (const assignment of assignments) {
    const entry = manifest.assignments.find((item) => item.id === assignment.id) as ManifestAssignment;
    assert.equal(
      sha12(assignment.instructionsHtml ?? ""),
      entry.currentWordingSha12,
      `${assignment.id} live wording must match the frozen manifest hash`
    );
    const liveText = htmlToText(assignment.instructionsHtml ?? "");
    for (const anchor of entry.officialAnchors) {
      assert.ok(liveText.includes(anchor), `${assignment.id} must carry verified official anchor: ${anchor}`);
    }
  }
});

test("SRC01-exports: HTML and DOCX mirrors match live requirements with no private-doc links", () => {
  for (const assignment of assignments) {
    const liveText = htmlToText(assignment.instructionsHtml ?? "");
    const liveSentences = sentences(liveText);
    assert.ok(liveSentences.length > 0, `${assignment.id} must have instruction sentences`);

    const htmlFile = path.resolve(workspaceDir, String(assignment.htmlPath).replace(/^\.\//, ""));
    assert.ok(existsSync(htmlFile), `${assignment.id} HTML mirror must exist`);
    const mirrorSource = readFileSync(htmlFile, "utf8");
    const mirrorText = htmlToText(/<main>([\s\S]*)<\/main>/.exec(mirrorSource)?.[1] ?? "");
    for (const sentence of liveSentences) {
      assert.ok(mirrorText.includes(sentence), `${assignment.id} HTML mirror must contain: ${sentence.slice(0, 60)}`);
    }

    const docxFile = path.resolve(workspaceDir, String(assignment.docxPath).replace(/^\.\//, ""));
    assert.ok(existsSync(docxFile), `${assignment.id} DOCX mirror must exist`);
    const docxText = htmlToText(readZipEntry(docxFile, "word/document.xml"));
    const flatDocx = docxText.replace(/\s+/g, "");
    for (const sentence of liveSentences) {
      assert.ok(
        flatDocx.includes(sentence.replace(/\s+/g, "")),
        `${assignment.id} DOCX mirror must contain: ${sentence.slice(0, 60)}`
      );
    }

    const isShell = /^aboriginal-studies-30-theme-\d-assignment$/.test(assignment.id);
    if (!isShell) {
      for (const docId of PRIVATE_DOC_IDS) {
        assert.ok(!mirrorText.includes(docId), `${assignment.id} HTML mirror must not link the private criteria docs`);
        assert.ok(!docxText.includes(docId), `${assignment.id} DOCX mirror must not link the private criteria docs`);
      }
      assert.ok(
        mirrorSource.includes("critical-response-criteria.pdf") &&
          mirrorSource.includes("critical-response-rubric.pdf"),
        `${assignment.id} HTML mirror must reference the bundled criteria PDFs`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// SRC02 — R07 4.3 version agreement: legacy preserved byte-identical,
// Halfbreed active ONLY as a versioned new-candidate profile.
// ---------------------------------------------------------------------------

test("SRC02: legacy 4-3 prompt intact; Halfbreed active as versioned profile with teacher review pending", () => {
  const live = assignments.find((assignment) => assignment.id === "4-3-personal-response") as Assignment & {
    activeProfile?: string;
    legacyVersion?: string;
    profiles?: Record<string, { summary?: string; instructionsHtml?: string; source?: string; rubric?: string }>;
  };
  const liveText = htmlToText(live.instructionsHtml ?? "");
  for (const anchor of ["Dead Indian", "The Inconvenient Indian", "CHOOSE ONE"]) {
    assert.ok(liveText.includes(anchor), `legacy 4-3 prompt must retain: ${anchor}`);
  }
  assert.ok(
    !/halfbreed/i.test(String(live.summary ?? "")),
    "top-level legacy summary must not leak Halfbreed wording"
  );
  assert.ok(
    !assignments.some((assignment) => /halfbreed/i.test(String(assignment.title)) && assignment.id !== "4-3-personal-response"),
    "no Halfbreed assignment may render alongside the legacy record"
  );
  assert.ok(live.profiles, "4-3 record must carry versioned profiles");
  assert.equal(live.activeProfile, "v2-halfbreed", "new-candidate default is Halfbreed");
  assert.equal(live.legacyVersion, "legacy-inconvenient-indian");
  assert.equal(
    live.profiles?.["legacy-inconvenient-indian"]?.summary,
    live.summary,
    "legacy profile duplicates the preserved top-level summary byte-identically"
  );
  assert.equal(
    live.profiles?.["legacy-inconvenient-indian"]?.instructionsHtml,
    live.instructionsHtml,
    "legacy profile duplicates the preserved top-level instructions byte-identically"
  );
  const halfbreed = live.profiles?.["v2-halfbreed"];
  assert.ok(halfbreed, "Halfbreed profile must exist");
  for (const anchor of [
    "choose ONE of the following study questions",
    "Maria's description of Halfbreed culture",
    "barriers does she encounter",
    "discriminate against Maria's family",
    "moved away from her home community",
    "/16",
    "2-3 paragraphs",
  ]) {
    assert.ok(halfbreed?.summary?.includes(anchor), `Halfbreed profile must carry official wording: ${anchor}`);
  }
  assert.ok(halfbreed?.source?.includes("AB30-T4"), "Halfbreed profile must cite its official source");
  const versions = manifest.versions["4-3-personal-response"] as {
    selectedVersion: string;
    newCandidateVersion: string;
    halfbreedCandidate: { status: string; linkedReader: string; novel: string; teacherReview: string };
  };
  assert.equal(versions.selectedVersion, "legacy-inconvenient-indian", "legacy stays the stored-data default");
  assert.equal(versions.newCandidateVersion, "v2-halfbreed");
  assert.equal(versions.halfbreedCandidate.status, "active-new-candidate");
  assert.ok(versions.halfbreedCandidate.novel.includes("Maria Campbell"), "candidate must name the edition");
  assert.ok(
    versions.halfbreedCandidate.teacherReview.includes("pending"),
    "teacher review of the activation must stay explicitly pending"
  );
  assert.ok(
    !/approv/i.test(versions.halfbreedCandidate.teacherReview),
    "no teacher approval may be stamped or implied"
  );
  const readerFile = path.resolve(workspaceDir, versions.halfbreedCandidate.linkedReader.replace(/^\.\//, ""));
  assert.ok(existsSync(readerFile), "candidate linked reader PDF must exist in the library");
});

// ---------------------------------------------------------------------------
// SRC03 — no automatic keys; holds recorded and owned.
// ---------------------------------------------------------------------------

function promptFieldNames(value: unknown, out: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) promptFieldNames(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value as JsonRecord)) {
      out.push(key);
      promptFieldNames(item, out);
    }
  }
}

test("SRC03: student bundle serves no answer keys; unresolved holds are owned, not auto-resolved", () => {
  const fieldNames: string[] = [];
  promptFieldNames(DATA["themeActivities"], fieldNames);
  const keyish = fieldNames.filter((name) => /^(answer|correct|key|solution|marking)/i.test(name));
  assert.deepEqual(keyish, [], `prompts must not carry answer-key fields: ${keyish.join(", ")}`);
  for (const [label, source] of [
    ["course-data.js", dataSource],
    ["main.js", mainSource],
    ["index.html", indexSource],
  ] as const) {
    assert.ok(!/answer[\s-]?key/i.test(source), `${label} must not serve answer-key content`);
  }
  assert.ok(manifest.holds.length >= 5, "known holds must be recorded");
  for (const hold of manifest.holds) {
    assert.ok(hold.id && hold.reason && hold.owningTicket, "every hold must name a reason and owning ticket");
  }
});

// ---------------------------------------------------------------------------
// SRC04 — required vs suggested modes survive verbatim.
// ---------------------------------------------------------------------------

test("SRC04: required and optional response modes persist without escalation", () => {
  for (const assignment of assignments.filter((item) => !/^aboriginal-studies-30-theme-\d-assignment$/.test(item.id))) {
    const entry = manifest.assignments.find((item) => item.id === assignment.id) as ManifestAssignment;
    const liveText = htmlToText(assignment.instructionsHtml ?? "");
    for (const phrase of entry.observedRequired) {
      assert.ok(liveText.includes(phrase), `${assignment.id} must keep required phrase: ${phrase.slice(0, 50)}`);
    }
    for (const phrase of entry.observedOptional) {
      assert.ok(liveText.includes(phrase), `${assignment.id} must keep suggestion verbatim: ${phrase.slice(0, 50)}`);
    }
    if (assignment.id === "attawapiskat-report") {
      // R07 named exception (E-R07-03): the official booklet itself says
      // "must" — verified source requirement, not course escalation.
      assert.ok(
        /must include the following elements/i.test(liveText),
        "attawapiskat-report must carry the booklet's own must-include requirement"
      );
    } else {
      assert.ok(
        !/must include the following elements/i.test(liveText),
        `${assignment.id} suggestions must not be escalated into hidden requirements`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// SRC05 — student pages exclude machine paths and authoring disputes.
// ---------------------------------------------------------------------------

test("SRC05: bundle excludes machine paths and audit disputes; attribution remains", () => {
  for (const [label, source] of [
    ["course-data.js", dataSource],
    ["main.js", mainSource],
    ["index.html", indexSource],
  ] as const) {
    assert.ok(!/[A-Za-z]:\\\\/.test(source), `${label} must not contain Windows paths`);
    assert.ok(!/\/Users\//.test(source), `${label} must not contain absolute user paths`);
    assert.ok(!/sourceAudit/.test(source), `${label} must not ship the authoring audit`);
  }
  const dataText = JSON.stringify(DATA);
  assert.ok(dataText.includes("critical-response-criteria.pdf"), "criteria attribution must remain");
  assert.ok(dataText.includes("critical-response-rubric.pdf"), "rubric attribution must remain");
  assert.ok(dataText.includes("Textbook Chapter"), "textbook attribution must remain");
});

// ---------------------------------------------------------------------------
// SRC06 — steps and rubric match the supplied criteria.
// ---------------------------------------------------------------------------

test("SRC06-steps: response steps run Statement/Evidence/Interpret/Connect with official starters", () => {
  const seam = loadSeam(["renderWrittenSteps"]);
  const html = String((seam["renderWrittenSteps"] as () => unknown)());
  const order = ["Statement.", "Evidence.", "Interpret.", "Connect."].map((heading) => {
    const index = html.indexOf(`<strong>${heading}</strong>`);
    assert.ok(index >= 0, `steps must include the ${heading} heading`);
    return index;
  });
  assert.deepEqual([...order].sort((a, b) => a - b), order, "steps must run in criteria order");
  assert.ok(!html.includes("Conclude"), "steps must not silently replace Connect with Conclude");
  for (const starter of [
    "This means that",
    "This tells us that",
    "This shows that",
    "From this we know",
    "Now we understand that",
    "Therefore",
    "This is important because",
  ]) {
    assert.ok(html.includes(starter), `steps must include official starter: ${starter}`);
  }
  assert.ok(html.includes("criteria handout"), "worked example must attribute the criteria handout");
});

test("SRC06-rubric: rubric table matches the supplied rubric levels, weight, and descriptors", () => {
  const seam = loadSeam(["WRITTEN_RUBRIC"]);
  // Normalize across the vm realm boundary (vm arrays carry the vm prototype).
  const rubric = JSON.parse(JSON.stringify(seam["WRITTEN_RUBRIC"])) as {
    title: string;
    total: number;
    levels: Array<{ name: string; points: number }>;
    criteria: Array<{ name: string; cells: string[] }>;
  };
  assert.equal(rubric.title, "Critical Response Rubric");
  assert.equal(rubric.total, 16);
  assert.deepEqual(
    rubric.levels.map((level) => `${level.name} ${level.points}`),
    ["Excellent 4", "Proficient 3", "Acceptable 2", "Limited 1"]
  );
  const byName = new Map(rubric.criteria.map((criterion) => [criterion.name, criterion.cells.join(" | ")]));
  assert.ok(byName.has("Comprehension ×2"), "comprehension must carry the x2 weight");
  for (const phrase of ["Insightful", "deliberate", "in-depth", "perceptive"]) {
    assert.ok(String(byName.get("Comprehension ×2")).includes(phrase), `comprehension must include: ${phrase}`);
  }
  for (const phrase of ["precise", "complete", "free of factual errors", "skillfully"]) {
    assert.ok(String(byName.get("Evidence")).includes(phrase), `evidence must include: ${phrase}`);
  }
  for (const phrase of ["arrangement", "control", "conclusion", "sustained", "flowing", "mechanics"]) {
    assert.ok(String(byName.get("Communication Skills")).includes(phrase), `communication must include: ${phrase}`);
  }
});

// ---------------------------------------------------------------------------
// SRC07 — textbook buttons resolve to real PDF pages.
// ---------------------------------------------------------------------------

test("SRC07: printed-page references resolve inside the real chapter PDFs", () => {
  const seam = loadSeam(["chapterPrintedStarts", "libraryPageCounts", "chapterFileName", "chapterPdfPage", "lessonStartPage"]);
  const realCounts = new Map(
    ledger.localLibrary.filter((entry) => entry.pdfPages).map((entry) => [entry.file, entry.pdfPages as number])
  );
  const codedCounts = seam["libraryPageCounts"] as unknown as Record<string, number>;
  for (const [file, real] of realCounts) {
    if (!(file in codedCounts)) continue; // only library files the runtime paginates
    assert.equal(codedCounts[file], real, `${file} coded page count must match the real PDF`);
  }
  const chapterPdfPage = seam["chapterPdfPage"] as (file: string, printed: number) => number;
  const lessonStartPage = seam["lessonStartPage"] as (item: unknown) => number;
  assert.equal(chapterPdfPage("./assets/library/chapter-1.pdf", 2), 1, "printed start maps to PDF page 1");
  assert.equal(chapterPdfPage("./assets/library/chapter-4.pdf", 108), 1, "printed start maps to PDF page 1");
  const refs: Array<{ id: string; textbook?: { label?: string; file?: string } }> = [];
  for (const unit of units) {
    for (const lesson of unit.lessons ?? []) refs.push({ id: lesson.id, textbook: lesson.textbook });
  }
  for (const assignment of assignments) refs.push({ id: assignment.id, textbook: assignment.textbook });
  for (const ref of refs) {
    if (!ref.textbook?.file || !ref.textbook?.label) continue;
    const printed = lessonStartPage(ref);
    const pdf = chapterPdfPage(ref.textbook.file, printed);
    const real = realCounts.get(ref.textbook.file);
    assert.ok(real, `${ref.id} textbook file must be a recorded library PDF`);
    assert.ok(pdf >= 1 && pdf <= (real as number), `${ref.id} printed p.${printed} must resolve inside ${ref.textbook.file}`);
  }
});

// ---------------------------------------------------------------------------
// SRC08 — corrections carry before/after/source; alignment unclaimed without it.
// ---------------------------------------------------------------------------

test("SRC08: every correction has before/after text with source; outcomes mapping stays an explicit hold", () => {
  assert.ok(editorialLog.entries.length >= 4, "editorial log must record the T03 corrections");
  for (const entry of editorialLog.entries) {
    for (const field of ["id", "date", "area", "before", "after", "source", "reason"] as const) {
      assert.ok(entry[field], `log entry ${entry.id} must record ${field}`);
    }
  }
  const ids = editorialLog.entries.map((entry) => entry.id);
  for (const id of ["E-T03-01", "E-T03-02", "E-T03-03", "E-T03-04"]) {
    assert.ok(ids.includes(id), `editorial log must contain ${id}`);
  }
  const outcomes = manifest.holds.find((hold) => hold.id === "official-outcomes-map");
  assert.ok(outcomes, "outcomes alignment must remain an explicit hold until the official document is mapped");
});
