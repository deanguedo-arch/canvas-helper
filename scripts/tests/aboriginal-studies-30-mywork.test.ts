/**
 * AB30 work-collection + evidence suite — T20 (STATE11-adjacent, ASSET04-auto, COMP05/COMP06-supporting).
 *
 * Proves the All My Work collection on the real store + real production
 * collector/renderer: grouping with prompt/source context and task links,
 * honest local-only submission states, zero key material in evidence,
 * conflict/exposure surfacing, export→import round-trip stability, the
 * mywork route, and the print stylesheet.
 *
 * Runners: `node --test <this file>` (sandbox-usable, import-free) and
 * `npx tsx --test <this file>` (repo convention for lead/CI).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const adapterPath = path.resolve(workspaceDir, "learning-store.js");
const indexPath = path.resolve(workspaceDir, "index.html");
const cssPath = path.resolve(workspaceDir, "styles.css");

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

const SLICE_CONSTS = [
  "units",
  "assignments",
  "themeActivities",
  "ASSIGNMENT_PROMPT_LESSONS",
  "LESSON_DRAFTS",
  "REQUIREMENT_ROLE_OVERRIDES",
  "BOOKLET_SHELL_ASSIGNMENT_IDS",
  "routeableSections",
  "libraryItems",
  "filmRoomItems",
];

const SLICE_FUNCTIONS = [
  "evidenceLessonHome",
  "evidenceLessonById",
  "evidencePromptById",
  "evidenceSubfieldLabel",
  "resolveEvidenceRecord",
  "collectWorkEvidence",
  "evidenceStatusLabel",
  "renderEvidenceGroups",
  "renderEvidenceSubmissions",
  "renderEvidencePractice",
  "renderEvidenceConflicts",
  "getPromptCompletion",
  "requiredPromptFieldKeys",
  "promptExpectsSubfields",
  "activityResponseKey",
  "promptFieldKey",
  "tableFieldId",
  "tableFieldLabel",
  "escapeHtml",
  "lessonRouteHref",
  "roleForRequirement",
  "isKnownLegacyRequirement",
  "requirementItems",
  "requirementDenominator",
  "readCourseResponse",
  "parseRouteFromSearch",
  "resolveLessonRoute",
];

type Evidence = {
  format: string;
  groups: Array<{
    key: string;
    unitId: string | null;
    unitTitle: string | null;
    lessonId: string | null;
    lessonTitle: string | null;
    href: string;
    textbook: string;
    items: Array<Record<string, unknown>>;
  }>;
  practice: {
    runs: Array<Record<string, unknown>>;
    attempts: Array<Record<string, unknown>>;
  };
  conflicts: Array<Record<string, unknown>>;
  counts: Record<string, number>;
};

type Store = {
  exportWork: () => unknown;
  importWork: (pack: unknown) => { ok: boolean; code?: string };
  startPracticeRun: (spec: Record<string, unknown>) => { ok: boolean; run?: { id: string } };
  submitPracticeAttempt: (
    runId: string,
    input: Record<string, unknown>
  ) => { ok: boolean; attemptId?: string };
  init: (options: { storage: unknown }) => unknown;
};

type Seam = {
  collectWorkEvidence: () => Evidence;
  promptFieldKeyFor: (activityId: string, promptId: string, suffix?: string) => string;
  resolveEvidenceRecord: (record: unknown) => Record<string, unknown>;
  renderEvidenceGroups: (evidence: unknown) => string;
  renderEvidencePractice: (evidence: unknown) => string;
  renderEvidenceConflicts: (evidence: unknown) => string;
  parseRouteFromSearch: (search: string) => { section: string };
  readLogicalResponse: (viewKey: string) => string;
  writeLogicalResponse: (viewKey: string, value: string) => { ok: boolean };
  getStore: () => Store;
  reboot: () => unknown;
};

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildRuntime(): { seam: Seam } {
  const context = {
    DATA: (() => {
      const dataContext = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: unknown } };
      vm.createContext(dataContext);
      vm.runInContext(readFileSync(dataPath, "utf8"), dataContext, { filename: "course-data.js" });
      return JSON.parse(JSON.stringify(dataContext.window.ABORIGINAL_STUDIES_30_DATA));
    })(),
    localStorage: (() => {
      const backing = new Map<string, string>();
      return {
        getItem: (key: string): string | null =>
          backing.has(String(key)) ? (backing.get(String(key)) as string) : null,
        setItem: (key: string, value: string): void => {
          backing.set(String(key), String(value));
        },
        removeItem: (key: string): void => {
          backing.delete(String(key));
        },
      };
    })(),
    console,
    TextEncoder,
    URL,
    URLSearchParams,
  } as Record<string, unknown>;
  vm.createContext(context);
  const script = [
    readFileSync(adapterPath, "utf8"),
    "let storeBoot = { ok: true, mode: 'envelope' };",
    ...SLICE_CONSTS.map((name) => sliceTopLevel("const", name)),
    ...SLICE_FUNCTIONS.map((name) => sliceTopLevel("function", name)),
    "storeBoot = AB30Store.init({ storage: localStorage });",
    `globalThis.__seam = {
      collectWorkEvidence, resolveEvidenceRecord, renderEvidenceGroups,
      renderEvidencePractice, renderEvidenceConflicts, parseRouteFromSearch,
      readLogicalResponse, writeLogicalResponse,
      getStore() { return AB30Store; },
      reboot() { return AB30Store.init({ storage: localStorage }); },
      promptFieldKeyFor(activityId, promptId, suffix) {
        const found = evidencePromptById(activityId, promptId);
        return promptFieldKey(found.activity, found.prompt, suffix);
      },
    };`,
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-mywork-seam.js" });
  return { seam: (context as { __seam: Seam }).__seam };
}

const Q28_KEY = "theme-1-online-booklet::q28";
const WRITTEN_KEY = "written::oral-tradition";
const FORMATIVE_KEY = "t1-l07-numbered-treaties::independent-language-gap";

function seedStandardWork(seam: Seam): void {
  assert.equal(plain(seam.writeLogicalResponse(Q28_KEY, "SYNTH five purposes."))["ok"], true);
  assert.equal(plain(seam.writeLogicalResponse(WRITTEN_KEY, "SYNTH oral tradition draft."))["ok"], true);
  assert.equal(plain(seam.writeLogicalResponse(FORMATIVE_KEY, "SYNTH language gap."))["ok"], true);
  const store = seam.getStore();
  const started = plain(
    store.startPracticeRun({
      mode: "matching",
      attemptMode: "independent",
      items: [{ id: "SYNTH-m1", taskId: "practice:1:SYNTH-m1" }],
      seed: 1,
    })
  );
  assert.equal(started["ok"], true);
  const submitted = plain(
    store.submitPracticeAttempt(started["run"]?.["id"] as string, {
      taskId: "practice:1:SYNTH-m1",
      contentVersion: "SYNTH-v1",
      response: "SYNTH reasoning.",
      selectedOptions: ["SYNTH-v1"],
      optionOrder: ["SYNTH-v1", "SYNTH-v2"],
    })
  );
  assert.equal(submitted["ok"], true);
}

test("EVID01: collection groups real saved work with prompt context, roles, and task links", () => {
  const { seam } = buildRuntime();
  seedStandardWork(seam);
  const evidence = plain(seam.collectWorkEvidence());
  assert.equal(evidence.format, "ab30-evidence-v1");
  assert.equal(evidence.counts.records, 3);
  assert.equal(evidence.counts.filledRecords, 3);
  assert.equal(evidence.counts.attempts, 1);
  assert.equal(evidence.counts.runs, 1);
  const lessonGroup = evidence.groups.find((group) => group.lessonId === "t1-l07-numbered-treaties");
  assert.ok(lessonGroup, "Lesson 7 group exists");
  assert.equal(lessonGroup?.unitId, "theme-1");
  assert.ok((lessonGroup?.textbook ?? "").includes("24"), "textbook band rides with the group");
  assert.ok((lessonGroup?.href ?? "").includes("section=lesson"), "group links back to the lesson");
  const q28 = (lessonGroup?.items ?? []).find((item) => item["promptId"] === "q28");
  assert.ok(q28, "Q28 item collected");
  assert.equal(q28?.["kind"], "booklet");
  assert.equal(q28?.["role"], "legacyAssigned");
  assert.equal(q28?.["status"], "fields-complete");
  assert.equal(q28?.["submission"], "local-only");
  assert.ok(String(q28?.["title"] ?? "").startsWith("Q28:"), "prompt number + label in title");
  assert.equal(q28?.["draft"], "SYNTH five purposes.");
  const formative = (lessonGroup?.items ?? []).find((item) => item["kind"] === "formative");
  assert.ok(formative, "formative item collected in the same lesson group");
  assert.equal(formative?.["role"], "formative");
  const written = evidence.groups
    .flatMap((group) => group.items)
    .find((item) => item["kind"] === "written");
  assert.ok(written, "written assignment collected");
  assert.ok(String(written?.["href"] ?? "").includes("section=assignment"), "written links to its task");
  assert.ok(Array.isArray(written?.["links"]), "assignment links preserved on the evidence");
  const attempt = evidence.practice.attempts[0];
  assert.equal(attempt["taskId"], "practice:1:SYNTH-m1");
  assert.equal(attempt["role"], "first");
  assert.equal(attempt["response"], "SYNTH reasoning.");
  assert.deepEqual(attempt["selectedOptions"], ["SYNTH-v1"]);
  assert.ok(attempt["runId"], "attempt links to its run");
  const run = evidence.practice.runs[0];
  assert.equal(run["id"], attempt["runId"]);
  assert.equal(run["answeredCount"], 1);
});

test("EVID02: evidence never carries key material; learner fields stay complete", () => {
  const { seam } = buildRuntime();
  seedStandardWork(seam);
  const evidence = plain(seam.collectWorkEvidence());
  for (const attempt of evidence.practice.attempts) {
    for (const banned of ["key", "accepted", "acceptedAnswers", "feedback", "criteria", "model", "stimulus"]) {
      assert.ok(!(banned in attempt), `attempt must not carry ${banned}`);
    }
    assert.ok("optionOrder" in attempt && "selectedOptions" in attempt, "interpretation context kept");
  }
  const blob = JSON.stringify(evidence);
  assert.ok(!blob.includes("SYNTH-seed"), "no seed/key material anywhere in the pack");
  assert.ok(blob.includes("SYNTH five purposes."), "learner writing present");
});

test("EVID03: empty store renders an honest empty collection, never fake completion", () => {
  const { seam } = buildRuntime();
  const evidence = plain(seam.collectWorkEvidence());
  assert.deepEqual(evidence.groups, []);
  assert.deepEqual(evidence.practice.attempts, []);
  assert.deepEqual(evidence.conflicts, []);
  assert.equal(evidence.counts.filledRecords, 0);
  const html = seam.renderEvidenceGroups(evidence);
  assert.ok(html.includes("No saved work yet"), "honest empty state");
  assert.ok(!html.includes("Complete fields"), "no completion claimed on empty");
});

test("EVID04/COMP06: rendered collection claims local-only, never review or mastery", () => {
  const { seam } = buildRuntime();
  seedStandardWork(seam);
  const evidence = plain(seam.collectWorkEvidence());
  const html =
    seam.renderEvidenceGroups(evidence) +
    seam.renderEvidencePractice(evidence) +
    seam.renderEvidenceConflicts({ ...evidence, conflicts: [{ recordTitle: "SYNTH", status: "unresolved", candidateCount: 2 }] });
  assert.ok(html.includes("Local only"), "local-only chips render");
  for (const banned of [
    "teacher-reviewed",
    "Teacher reviewed",
    "mastered",
    "Mastery",
    "graded",
    "Graded",
    "submitted to",
    "Submitted",
    "host-confirmed",
    "LMS receipt",
  ]) {
    assert.ok(!html.includes(banned), `collection must never claim: ${banned}`);
  }
  assert.ok(html.includes("SYNTH five purposes."), "learner draft renders escaped");
  assert.ok(html.includes("t1-l07-numbered-treaties"), "task links present");
});

test("EVID05/STATE11: canonical work, runs, and exposure survive an export/import round-trip (R02 durable practice domain)", () => {
  const first = buildRuntime();
  seedStandardWork(first.seam);
  const before = plain(first.seam.collectWorkEvidence());
  const pack = plain(first.seam.getStore().exportWork());
  const second = buildRuntime();
  assert.equal(plain(second.seam.getStore().importWork(pack))["ok"], true);
  const after = plain(second.seam.collectWorkEvidence());
  assert.deepEqual(after.groups, before.groups, "records identical after round-trip");
  assert.deepEqual(after.conflicts, before.conflicts, "conflicts identical after round-trip");
  assert.equal(after.practice.attempts.length, 1, "attempts round-trip");
  assert.equal(after.practice.attempts[0]["response"], "SYNTH reasoning.");
  assert.deepEqual(after.practice.attempts[0]["selectedOptions"], ["SYNTH-v1"]);
  assert.equal(after.practice.runs.length, 1, "R02: runs are durable envelope data and round-trip");
  assert.equal(after.practice.runs[0]["mode"], "matching", "R02: run payload intact after round-trip");
  assert.equal(after.practice.attempts[0]["runId"], after.practice.runs[0]["id"], "R02: attempt links to its run after round-trip");
});

test("EVID06: ?section=mywork routes; nav entry exists in the shell", () => {
  const { seam } = buildRuntime();
  assert.equal(plain(seam.parseRouteFromSearch("?section=mywork"))["section"], "mywork");
  assert.equal(plain(seam.parseRouteFromSearch("?section=home"))["section"], "home");
  const index = readFileSync(indexPath, "utf8");
  assert.ok(index.includes('id="nav-mywork"'), "nav button exists");
  assert.ok(index.includes("All My Work"), "nav labelled for learners");
});

test("EVID07/ASSET04-print: print stylesheet covers the full collection", () => {
  const css = readFileSync(cssPath, "utf8");
  assert.ok(css.includes("@media print"), "print block exists");
  assert.ok(css.includes(".mywork-evidence"), "evidence prints");
  assert.ok(css.includes(".mywork-toolbar"), "toolbar hidden in print");
  assert.ok(css.includes("break-inside"), "items kept together on pages");
  assert.ok(css.includes(".course-sidebar"), "chrome hidden in print");
});

test("EVID08: conflicts, exposure flags, and hostile text render safely", () => {
  const { seam } = buildRuntime();
  const conflicts = seam.renderEvidenceConflicts({
    conflicts: [{ recordTitle: "Q28", status: "unresolved", candidateCount: 2, resolution: null }],
  });
  assert.ok(conflicts.includes("2 saved versions"), "candidate count shown");
  assert.ok(conflicts.includes("resolve it where the question lives"), "resolution path stated");
  const practice = seam.renderEvidencePractice({
    practice: {
      runs: [{ mode: "matching", attemptMode: "independent", status: "complete", answeredCount: 1, itemCount: 1 }],
      attempts: [
        {
          taskId: "practice:1:x",
          role: "first",
          reviewState: "submitted",
          response: "<img src=x onerror=alert(1)>",
          selectedOptions: [],
          exposed: ["feedback:att:1"],
        },
      ],
    },
  });
  assert.ok(practice.includes("Model shown for this item"), "exposure flagged");
  assert.ok(!practice.includes("<img src=x"), "attempt text escaped");
  assert.ok(practice.includes("&lt;img"), "escaped text visible");
  const resolved = plain(
    seam.resolveEvidenceRecord({ id: "weird", origins: [], draft: "<b>SYNTH</b>", revision: 1 })
  );
  assert.equal(resolved["kind"], "unmapped", "unknown keys degrade honestly");
  const rendered = seam.renderEvidenceGroups({
    groups: [{ lessonTitle: "Other work", unitTitle: null, href: "", textbook: "", items: [resolved] }],
  });
  assert.ok(!rendered.includes("<b>SYNTH</b>"), "drafts escaped");
});

test("EVID10: table cells collect with resolved row/column labels and partial status", () => {
  const { seam } = buildRuntime();
  const cellKey = seam.promptFieldKeyFor(
    "theme-1-online-booklet",
    "q37",
    "pacific-northwest.environmental-challenges"
  );
  assert.equal(plain(seam.writeLogicalResponse(cellKey, "SYNTH salmon decline."))["ok"], true);
  const evidence = plain(seam.collectWorkEvidence());
  const cell = evidence.groups.flatMap((group) => group.items).find((item) => item["promptId"] === "q37");
  assert.ok(cell, "Q37 cell collected");
  assert.equal(cell?.["subfieldLabel"], "Pacific Northwest / Environmental challenges");
  assert.equal(cell?.["status"], "partial", "one of twelve cells is partial, never complete");
  assert.equal(cell?.["role"], "legacyAssigned");
  const html = seam.renderEvidenceGroups(evidence);
  assert.ok(html.includes("Pacific Northwest / Environmental challenges"), "field label renders");
});

test("EVID09: odd keys (aliases, drafts, unknown assignments) resolve without throwing", () => {
  const { seam } = buildRuntime();
  const store = seam.getStore();
  plain(store.exportWork());
  const cases: Array<[unknown, string]> = [
    [{ id: "assignment:oral-tradition", origins: [{ key: "written::oral-tradition" }], draft: "SYNTH", revision: 1 }, "written"],
    [{ id: "assignment-draft::nope", origins: [{ key: "assignment-draft::nope" }], draft: "", revision: 0 }, "draft"],
    [{ id: "written::nope", origins: [{ key: "written::nope" }], draft: "SYNTH", revision: 2 }, "written"],
    [{ id: "lonely", origins: [], draft: "", revision: 0 }, "unmapped"],
    [{ id: "x", origins: [{ key: "nope::nada" }], draft: "", revision: 0 }, "unmapped"],
  ];
  for (const [record, kind] of cases) {
    const resolved = plain(seam.resolveEvidenceRecord(record));
    assert.equal(resolved["kind"], kind, JSON.stringify(record).slice(0, 60));
    assert.equal(resolved["submission"], "local-only");
  }
});
