/**
 * AB30 practice engine suite — T09 (PRACT01–PRACT12 + runtime attempts).
 *
 * Asserts the finite practice engine against the real production files
 * (workspace practice-data.js + practice-engine.js + learning-store.js +
 * main.js practice UI): the reviewed-item gate, honest sampling, first-save
 * before feedback, ungraded reasoning, reload-stable runs, exposure review
 * labels, keyboard-operable controls, first-attempt immutability,
 * submission-free reflection, narrow fill-in grading, and the honest
 * catalog. Same vm-seam execution model as the other suites (slices
 * asserted present and syntax-checked). Synthetic test items live ONLY in
 * this file — shipped practice derives solely from reviewed course data.
 *
 * STATE08–STATE11 pure proofs live in the state suite (re-run as required
 * evidence); this suite proves the same attempt semantics through the new
 * AB30Store runtime methods. Real keypress delivery and live reload stay
 * with T23/T24; reload is proven here as adapter re-init replay.
 *
 * Runners: `node --test <this file>` (sandbox-usable, import-free) and
 * `npx tsx --test <this file>` (repo convention for lead/CI).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const adapterPath = path.resolve(workspaceDir, "learning-store.js");
const bankPath = path.resolve(workspaceDir, "practice-data.js");
const enginePath = path.resolve(workspaceDir, "practice-engine.js");

const mainSource = readFileSync(mainPath, "utf8");
const dataSource = readFileSync(dataPath, "utf8");
const adapterSource = readFileSync(adapterPath, "utf8");
const bankSource = readFileSync(bankPath, "utf8");
const engineSource = readFileSync(enginePath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-practice] tested inputs: ${JSON.stringify({
    "main.js": sha256Hex(mainSource),
    "practice-data.js": sha256Hex(bankSource),
    "practice-engine.js": sha256Hex(engineSource),
    "learning-store.js": sha256Hex(adapterSource),
  })}`
);

type JsonRecord = Record<string, unknown>;
type VocabEntry = { id: string; term: string; meaning: string; lessonId?: string; unitId?: string };

function loadCourseData(source: string): JsonRecord {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: JsonRecord } };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "course-data.js" });
  const data = context.window.ABORIGINAL_STUDIES_30_DATA;
  assert.ok(data && typeof data === "object", "course-data.js must assign window.ABORIGINAL_STUDIES_30_DATA");
  return data;
}

const DATA = JSON.parse(JSON.stringify(loadCourseData(dataSource))) as JsonRecord;
const vocab = DATA["coreVocabulary"] as VocabEntry[];

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sliceTopLevel(source: string, kind: "function" | "const", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `const ${name} =`;
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" must exist in main.js (production drift?)`);
  const lineStart = source.lastIndexOf("\n", start) + 1;
  const boundaryPattern = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundaryPattern.lastIndex = start + anchor.length;
  const next = boundaryPattern.exec(source);
  const slice = (next ? source.slice(lineStart, next.index) : source.slice(lineStart)).trim();
  assert.ok(slice.length > anchor.length, `seam "${name}" slice must be non-empty`);
  new vm.Script(slice, { filename: `seam-${name}.js` });
  return slice;
}

const SLICE_CONSTS = ["refs", "units", "assignments", "coreVocabulary"];
const SLICE_FUNCTIONS = [
  "escapeHtml",
  "lessonRouteHref",
  "practiceStore",
  "practiceEngine",
  "practiceBank",
  "practiceReady",
  "practiceCatalogHtml",
  "renderPracticeCatalog",
  "practiceItemFromRun",
  "practiceRunProgress",
  "renderPracticeRun",
  "renderPracticeCards",
  "renderQuizzes",
  "startPracticeMode",
  "submitPracticeItem",
  "revisePracticeItem",
  "abandonPracticeRun",
  "finishPracticeRunUi",
];

const seamSource = [
  ...SLICE_CONSTS.map((name) => sliceTopLevel(mainSource, "const", name)),
  ...SLICE_FUNCTIONS.map((name) => sliceTopLevel(mainSource, "function", name)),
].join("\n\n");

type StubElement = {
  innerHTML: string;
  textContent: string;
  value: string;
  addEventListener: () => void;
  querySelector: () => null;
  querySelectorAll: () => unknown[];
  classList: { toggle: () => void; add: () => void; remove: () => void };
};

function makeElement(): StubElement {
  return {
    innerHTML: "",
    textContent: "",
    value: "",
    addEventListener: () => undefined,
    querySelector: () => null,
    querySelectorAll: () => [],
    classList: { toggle: () => undefined, add: () => undefined, remove: () => undefined },
  };
}

type PracticeStore = {
  startPracticeRun: (spec: Record<string, unknown>) => Record<string, unknown>;
  getPracticeRun: (runId: string) => Record<string, unknown> | null;
  listPracticeRuns: () => { runs: Array<Record<string, unknown>>; exposed: Record<string, unknown> };
  getPracticeExposure: () => Record<string, unknown>;
  getPracticeAttempt: (attemptId: string) => Record<string, unknown> | null;
  submitPracticeAttempt: (runId: string, input: Record<string, unknown>) => Record<string, unknown>;
  markPracticeExposed: (itemId: string, exposureId: string) => Record<string, unknown>;
  finishPracticeRun: (runId: string, status: string) => Record<string, unknown>;
  exportWork: () => { activity: { attempts: Array<Record<string, unknown>> } };
  init: (options: { storage: unknown }) => unknown;
};

type PracticeEngine = {
  practiceTaskId: (item: Record<string, unknown>) => string;
  buildMatchingItems: (
    vocabList: unknown,
    count: number,
    seed: unknown,
    bankVersion: string,
    exposedMap?: Record<string, unknown>
  ) => Array<Record<string, unknown>>;
  eligibleItems: (items: unknown) => { eligible: Array<Record<string, unknown>>; excluded: Array<Record<string, unknown>> };
  sampleItems: (
    eligible: unknown,
    count: number,
    seed: unknown
  ) => { items: Array<Record<string, unknown>>; requested: number; offered: number; exhausted: boolean };
  conceptCards: (vocabList: unknown) => Array<Record<string, unknown>>;
  reflect: () => { revealed: boolean; persisted: boolean };
  selectOption: (selection: Record<string, string>, itemId: string, optionId: string) => Record<string, string>;
  moveOrderItem: (order: unknown, fromIndex: number, toIndex: number) => { order: unknown[]; moved: boolean };
  gradeFillIn: (item: unknown, response: string) => { match: boolean; normalized: string; code: string };
  feedbackFor: (item: Record<string, unknown>, selectedId: string) => Record<string, unknown>;
  startRun: (store: unknown, spec: Record<string, unknown>) => Record<string, unknown>;
  submitFirst: (
    store: unknown,
    run: Record<string, unknown>,
    item: Record<string, unknown>,
    input: Record<string, unknown>
  ) => Record<string, unknown>;
  submitRevision: (
    store: unknown,
    run: Record<string, unknown>,
    item: Record<string, unknown>,
    firstAttemptId: string,
    input: Record<string, unknown>
  ) => Record<string, unknown>;
  recordExposure: (store: unknown, itemId: string, exposureId: string) => Record<string, unknown>;
  runStatus: (run: Record<string, unknown>, exposedMap: Record<string, unknown>) => Record<string, unknown>;
};

type PracticeBank = {
  BANK_VERSION: string;
  MODES: Array<Record<string, unknown>>;
  modeById: (modeId: string) => Record<string, unknown> | null;
};

type Seam = {
  practiceCatalogHtml: (modes: Array<Record<string, unknown>>) => string;
  reboot: () => unknown;
  renderPracticeCatalog: () => void;
  renderPracticeRun: (runId: string) => void;
  renderPracticeCards: () => void;
  renderQuizzes: () => void;
  startPracticeMode: (mode: string, attemptMode: string, count: number, seed: unknown) => Record<string, unknown>;
  submitPracticeItem: (runId: string, itemId: string, input: Record<string, unknown>) => Record<string, unknown>;
  revisePracticeItem: (runId: string, itemId: string, input: Record<string, unknown>) => Record<string, unknown>;
  abandonPracticeRun: (runId: string) => Record<string, unknown>;
  finishPracticeRunUi: (runId: string) => Record<string, unknown>;
  setPracticeView: (value: Record<string, unknown>) => void;
  getStore: () => PracticeStore;
  getEngine: () => PracticeEngine;
  getBank: () => PracticeBank;
};

function buildRuntime(options?: { storage?: "stub" | "none" }): {
  seam: Seam;
  elements: Map<string, StubElement>;
  backing: Map<string, string>;
} {
  const backing = new Map<string, string>();
  const stubStorage = {
    getItem: (key: string): string | null => (backing.has(String(key)) ? (backing.get(String(key)) as string) : null),
    setItem: (key: string, value: string): void => {
      backing.set(String(key), String(value));
    },
    removeItem: (key: string): void => {
      backing.delete(String(key));
    },
  };
  const elements = new Map<string, StubElement>();
  const elementFor = (id: string): StubElement => {
    if (!elements.has(id)) elements.set(id, makeElement());
    return elements.get(id) as StubElement;
  };
  const document = {
    getElementById: (id: string): StubElement => elementFor(`id:${id}`),
    querySelector: (selector: string): StubElement => elementFor(`q:${selector}`),
    querySelectorAll: (): unknown[] => [],
    createElement: (): StubElement => makeElement(),
    addEventListener: (): void => undefined,
  };
  const context = {
    DATA,
    document,
    console,
    TextEncoder,
    URL,
    URLSearchParams,
    ...(options?.storage === "none" ? {} : { localStorage: stubStorage }),
  } as Record<string, unknown>;
  vm.createContext(context);
  const script = [
    adapterSource,
    bankSource,
    engineSource,
    "let practiceView = { screen: 'catalog', runId: null, lastResult: null };",
    seamSource,
    options?.storage === "none"
      ? "AB30Store.init({ storage: null });"
      : "AB30Store.init({ storage: localStorage });",
    `globalThis.__seam = {
      practiceCatalogHtml,
      reboot() { return AB30Store.init({ storage: localStorage }); },
      renderPracticeCatalog, renderPracticeRun, renderPracticeCards, renderQuizzes,
      startPracticeMode, submitPracticeItem, revisePracticeItem, abandonPracticeRun, finishPracticeRunUi,
      setPracticeView(v) { practiceView = v; },
      getStore() { return AB30Store; },
      getEngine() { return AB30PracticeEngine; },
      getBank() { return AB30PracticeData; },
    };`,
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-practice-seam.js" });
  return { seam: (context as { __seam: Seam }).__seam, elements, backing };
}

function makeItem(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: "SYNTH-item-1",
    family: "synth",
    mode: "matching",
    concept: "SYNTH concept",
    lessonId: "t1-l01-oral-tradition",
    unitId: "theme-1",
    stimulus: { term: "SYNTH term", termId: "SYNTH-v1" },
    stimulusVersion: "SYNTH-bank-v9",
    prompt: "SYNTH prompt?",
    options: [
      { id: "SYNTH-v1", text: "SYNTH correct meaning." },
      { id: "SYNTH-v2", text: "SYNTH wrong meaning." },
    ],
    optionOrder: ["SYNTH-v1", "SYNTH-v2"],
    key: "SYNTH-v1",
    feedbackByOption: { "SYNTH-v1": "SYNTH correct feedback.", "SYNTH-v2": "SYNTH wrong feedback." },
    version: "SYNTH-bank-v9",
    reviewed: true,
    role: "formative",
    ...(overrides ?? {}),
  };
}

class FakeStore {
  calls: Array<{ method: string; args: unknown[] }> = [];
  runs: Map<string, Record<string, unknown>> = new Map();
  attempts: Array<Record<string, unknown>> = [];
  exposed: Record<string, string[]> = {};
  failOn: Set<string> = new Set();

  private log(method: string, args: unknown[]): void {
    this.calls.push({ method, args });
  }

  startPracticeRun(spec: Record<string, unknown>): Record<string, unknown> {
    this.log("startPracticeRun", [spec]);
    if (this.failOn.has("startPracticeRun")) return { ok: false, code: "SYNTH_WRITE_FAILED" };
    const run = { id: `run:${this.runs.size + 1}`, status: "in-progress", attemptIds: {}, ...(plain(spec) as object) };
    this.runs.set(run.id as string, run);
    return { ok: true, run };
  }

  getPracticeRun(runId: string): Record<string, unknown> | null {
    this.log("getPracticeRun", [runId]);
    return this.runs.get(runId) ?? null;
  }

  submitPracticeAttempt(runId: string, input: Record<string, unknown>): Record<string, unknown> {
    this.log("submitPracticeAttempt", [runId, input]);
    if (this.failOn.has("submitPracticeAttempt")) return { ok: false, code: "SYNTH_WRITE_FAILED", draft: input };
    const attempt = { id: `att:${this.attempts.length + 1}`, reviewState: "submitted", ...(plain(input) as object) };
    this.attempts.push(attempt);
    const run = this.runs.get(runId);
    if (run) {
      const taskAttempts = ((run["attemptIds"] as Record<string, string[]>) ?? {})[input["taskId"] as string] ?? [];
      taskAttempts.push(attempt["id"] as string);
      ((run["attemptIds"] as Record<string, string[]>))[input["taskId"] as string] = taskAttempts;
    }
    return { ok: true, attemptId: attempt["id"], duplicate: false };
  }

  markPracticeExposed(itemId: string, exposureId: string): Record<string, unknown> {
    this.log("markPracticeExposed", [itemId, exposureId]);
    if (this.failOn.has("markPracticeExposed")) return { ok: false, code: "SYNTH_WRITE_FAILED" };
    const list = this.exposed[itemId] ?? [];
    if (!list.includes(exposureId)) list.push(exposureId);
    this.exposed[itemId] = list;
    return { ok: true };
  }
}

function firstStimulus(run: Record<string, unknown>): {
  itemId: string;
  termId: string;
  options: Array<{ id: string }>;
} {
  const stimuli = run["stimuli"] as Array<Record<string, unknown>>;
  const stimulus = stimuli[0]["stimulus"] as Record<string, string>;
  return {
    itemId: (run["itemIds"] as string[])[0],
    termId: stimulus["termId"],
    options: stimuli[0]["options"] as Array<{ id: string }>,
  };
}

function wrongOptionId(run: Record<string, unknown>): string {
  const first = firstStimulus(run);
  const wrong = first.options.find((option) => option.id !== first.termId);
  assert.ok(wrong, "a wrong option must exist");
  return (wrong as { id: string }).id;
}

function runIdOf(started: Record<string, unknown>): string {
  return ((started["run"] as Record<string, unknown>)["id"] as string) ?? "";
}

test("PRACT01: only reviewed eligible items appear; scored selections key stably with feedback", () => {
  const { seam } = buildRuntime();
  const engine = seam.getEngine();
  const mixed = [
    makeItem(),
    makeItem({ id: "SYNTH-unreviewed", reviewed: false }),
    makeItem({ id: "SYNTH-no-key", key: "" }),
    makeItem({ id: "SYNTH-no-feedback", feedbackByOption: { "SYNTH-v1": "SYNTH ok." } }),
    makeItem({ id: "SYNTH-no-version", version: "" }),
    "not-an-item",
  ];
  const gate = plain(engine.eligibleItems(mixed));
  assert.deepEqual(
    gate.eligible.map((item) => item["id"]),
    ["SYNTH-item-1"]
  );
  const reasons = new Map(gate.excluded.map((entry) => [entry["id"], entry["reasons"]]));
  assert.deepEqual(reasons.get("SYNTH-unreviewed"), ["unreviewed"]);
  assert.deepEqual(reasons.get("SYNTH-no-key"), ["missing-key"]);
  assert.deepEqual(reasons.get("SYNTH-no-feedback"), ["missing-feedback"]);
  assert.deepEqual(reasons.get("SYNTH-no-version"), ["missing-version"]);
  assert.deepEqual(reasons.get("unknown"), ["not-an-item"]);
  const bank = seam.getBank();
  const built = plain(engine.buildMatchingItems(vocab, 10, "SYNTH-seed-1", bank.BANK_VERSION));
  assert.equal(built.length, 10);
  assert.deepEqual(plain(engine.eligibleItems(built))["excluded"], []);
  const rebuilt = plain(engine.buildMatchingItems(vocab, 10, "SYNTH-seed-1", bank.BANK_VERSION));
  assert.deepEqual(
    built.map((item) => item["id"]),
    rebuilt.map((item) => item["id"]),
    "stable item ids per seed"
  );
  assert.deepEqual(built[0]["optionOrder"], rebuilt[0]["optionOrder"], "stable option order per seed");
  for (const item of built) {
    for (const option of item["options"] as Array<{ id: string }>) {
      assert.ok(
        (item["feedbackByOption"] as Record<string, string>)[option.id],
        `feedback for option ${option.id}`
      );
    }
  }
});

test("PRACT02: wrong answers get explanatory feedback plus a teaching link", () => {
  const { seam } = buildRuntime();
  const engine = seam.getEngine();
  const bank = seam.getBank();
  const [item] = plain(engine.buildMatchingItems(vocab, 1, "SYNTH-seed-2", bank.BANK_VERSION));
  const wrongId = ((item["optionOrder"] as string[]) ?? []).find((id) => id !== item["key"]) as string;
  const wrong = plain(engine.feedbackFor(item, wrongId));
  assert.equal(wrong["correct"], false);
  assert.ok(String(wrong["text"]).includes("Not quite"), "explanatory, not just right/wrong");
  assert.ok(String(wrong["text"]).includes(item["concept"] as string), "names the concept");
  assert.ok(wrong["lessonId"] && wrong["unitId"], "carries the teaching-link target");
  const right = plain(engine.feedbackFor(item, item["key"] as string));
  assert.equal(right["correct"], true);
  const live = buildRuntime();
  const started = plain(live.seam.startPracticeMode("matching", "independent", 1, "SYNTH-seed-2b"));
  assert.equal(started["ok"], true);
  const liveRunId = runIdOf(started);
  live.seam.setPracticeView({ screen: "run", runId: liveRunId, lastResult: null });
  live.seam.renderPracticeRun(liveRunId);
  const before = live.elements.get("id:content-body")?.innerHTML ?? "";
  assert.ok(!before.includes("Not quite"), "no feedback before an answer is saved");
  const liveRun = plain(live.seam.getStore().getPracticeRun(liveRunId)) as Record<string, unknown>;
  const submit = plain(
    live.seam.submitPracticeItem(liveRunId, (liveRun["itemIds"] as string[])[0], {
      selectedOptions: [wrongOptionId(liveRun)],
      response: "",
    })
  );
  assert.equal(submit["ok"], true);
  live.seam.renderPracticeRun(liveRunId);
  const after = live.elements.get("id:content-body")?.innerHTML ?? "";
  assert.ok(after.includes("Not quite"), "explanatory feedback renders after save");
  assert.ok(after.includes("Revisit the lesson"), "teaching link renders");
  assert.ok(after.includes("data-lesson-link"), "teaching link routes to the lesson");
});

test("PRACT03: independent firsts save before feedback shows; failure keeps the draft", () => {
  const { seam } = buildRuntime();
  const engine = seam.getEngine();
  const failing = new FakeStore();
  failing.failOn.add("submitPracticeAttempt");
  const item = makeItem();
  const failed = plain(
    engine.submitFirst(failing as never, { id: "run:9", attemptMode: "independent" }, item, {
      selectedOptions: ["SYNTH-v2"],
      response: "SYNTH reasoning",
    })
  );
  assert.equal(failed["ok"], false);
  assert.equal(failed["code"], "SYNTH_WRITE_FAILED");
  assert.deepEqual(failed["draft"], { selectedOptions: ["SYNTH-v2"], response: "SYNTH reasoning" });
  assert.ok(!("feedback" in failed), "no feedback without a save");
  assert.ok(
    !failing.calls.some((call) => call.method === "markPracticeExposed"),
    "no exposure recorded on failure"
  );
  const working = new FakeStore();
  const runResult = plain(
    engine.startRun(working as never, { mode: "matching", attemptMode: "independent", items: [item], seed: 1 })
  );
  assert.equal(runResult["ok"], true);
  const saved = plain(
    engine.submitFirst(working as never, { id: "run:1", attemptMode: "independent" }, item, {
      selectedOptions: ["SYNTH-v1"],
      response: "",
    })
  );
  assert.equal(saved["ok"], true);
  assert.ok(saved["feedback"], "feedback follows the save");
  assert.equal(working.attempts.length, 1, "attempt stored before feedback returned");
  const mem = buildRuntime({ storage: "none" });
  const memStart = plain(mem.seam.startPracticeMode("matching", "independent", 2, "SYNTH-seed-3"));
  assert.equal(memStart["ok"], false);
  assert.equal(memStart["code"], "no-durable-storage");
});

test("PRACT04: wrong answers keep stored reasoning; writing is never keyword-graded", () => {
  const { seam } = buildRuntime();
  const engine = seam.getEngine();
  const fake = new FakeStore();
  const item = makeItem();
  plain(engine.startRun(fake as never, { mode: "matching", attemptMode: "independent", items: [item], seed: 2 }));
  const reasoning = "SYNTH because treaties matter";
  const result = plain(
    engine.submitFirst(fake as never, { id: "run:1", attemptMode: "independent" }, item, {
      selectedOptions: ["SYNTH-v2"],
      response: reasoning,
    })
  );
  assert.equal(result["ok"], true);
  assert.equal(fake.attempts.length, 1);
  assert.deepEqual(fake.attempts[0]["selectedOptions"], ["SYNTH-v2"]);
  assert.equal(fake.attempts[0]["response"], reasoning, "reasoning stored verbatim");
  assert.ok(!("score" in result) && !("grade" in result), "no grade computed");
  const live = buildRuntime();
  const started = plain(live.seam.startPracticeMode("matching", "independent", 1, "SYNTH-seed-4"));
  const liveRunId = runIdOf(started);
  const liveRun = plain(live.seam.getStore().getPracticeRun(liveRunId)) as Record<string, unknown>;
  const liveSubmit = plain(
    live.seam.submitPracticeItem(liveRunId, (liveRun["itemIds"] as string[])[0], {
      selectedOptions: [wrongOptionId(liveRun)],
      response: reasoning,
    })
  );
  assert.equal(liveSubmit["ok"], true);
  const attempts = plain(live.seam.getStore().exportWork()).activity.attempts;
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0]["response"], reasoning);
});

test("PRACT05: reload replays items/stimuli/versions/order; keying is by stable id", () => {
  const live = buildRuntime();
  const started = plain(live.seam.startPracticeMode("matching", "independent", 3, "SYNTH-seed-5"));
  const liveRunId = runIdOf(started);
  const before = plain(live.seam.getStore().getPracticeRun(liveRunId));
  live.seam.reboot();
  const after = plain(live.seam.getStore().getPracticeRun(liveRunId));
  assert.deepEqual(after, before, "run replays identical after reload");
  live.seam.setPracticeView({ screen: "run", runId: liveRunId, lastResult: null });
  live.seam.renderPracticeRun(liveRunId);
  const html = live.elements.get("id:content-body")?.innerHTML ?? "";
  const firstItemId = ((before as Record<string, unknown>)["itemIds"] as string[])[0];
  const values: string[] = [];
  for (const match of html.matchAll(/<input\b([^>]*?)>/g)) {
    const attrs = match[1];
    if (attrs.includes(`data-practice-option="${firstItemId}"`)) {
      values.push((/value="([^"]+)"/.exec(attrs) ?? [])[1] as string);
    }
  }
  const pinned = ((before as Record<string, unknown>)["optionOrders"] as string[][])[0];
  assert.deepEqual(values, pinned, "rendered options follow pinned order, keyed by stable id");
});

test("PRACT06: sampling is without replacement; exhaustion is honest", () => {
  const { seam } = buildRuntime();
  const engine = seam.getEngine();
  const bank = seam.getBank();
  const built = plain(engine.buildMatchingItems(vocab, 94, "SYNTH-seed-6", bank.BANK_VERSION));
  const eligible = plain(engine.eligibleItems(built))["eligible"] as Array<Record<string, unknown>>;
  const sample = plain(engine.sampleItems(eligible, 10, "SYNTH-seed-6"));
  assert.equal(sample.items.length, 10);
  assert.equal(new Set(sample.items.map((item) => item["id"])).size, 10, "no replacement");
  assert.equal(sample["exhausted"], false);
  const over = plain(engine.sampleItems(eligible, 9999, "SYNTH-seed-6"));
  assert.equal(over["offered"], eligible.length);
  assert.equal(over["requested"], 9999);
  assert.equal(over["exhausted"], true, "exhaustion declared with honest counts");
});

test("PRACT07: exposed stimuli label review, never fresh independent evidence", () => {
  const { seam } = buildRuntime();
  const engine = seam.getEngine();
  const bank = seam.getBank();
  const built = plain(engine.buildMatchingItems(vocab, 5, "SYNTH-seed-7", bank.BANK_VERSION, {}));
  const exposedId = built[0]["id"] as string;
  const rebuilt = plain(
    engine.buildMatchingItems(vocab, 5, "SYNTH-seed-7", bank.BANK_VERSION, { [exposedId]: ["feedback:att:1"] })
  );
  assert.deepEqual(
    built.map((item) => item["id"]),
    rebuilt.map((item) => item["id"]),
    "same seed, same items"
  );
  assert.equal(rebuilt[0]["review"], true, "exposed item flagged review");
  assert.ok(
    rebuilt.slice(1).every((item) => item["review"] === false),
    "fresh items stay fresh"
  );
  const status = plain(
    engine.runStatus(
      { itemIds: rebuilt.map((item) => item["id"]), attemptIds: {}, status: "in-progress" },
      { [exposedId]: ["feedback:att:1"] }
    )
  );
  assert.deepEqual(status["review"], [exposedId]);
  const live = buildRuntime();
  const started = plain(live.seam.startPracticeMode("matching", "independent", 3, "SYNTH-seed-7b"));
  const liveRunId = runIdOf(started);
  const run = plain(live.seam.getStore().getPracticeRun(liveRunId)) as Record<string, unknown>;
  const firstId = (run["itemIds"] as string[])[0];
  assert.equal(plain(live.seam.getStore().markPracticeExposed(firstId, "feedback:SYNTH"))["ok"], true);
  live.seam.setPracticeView({ screen: "run", runId: liveRunId, lastResult: null });
  live.seam.renderPracticeRun(liveRunId);
  const html = live.elements.get("id:content-body")?.innerHTML ?? "";
  assert.ok(html.includes("(Review)"), "exposed-unanswered item labelled review");
});

test("PRACT08: matching runs on native keyboard controls; order ops transition honestly", () => {
  const live = buildRuntime();
  const started = plain(live.seam.startPracticeMode("matching", "independent", 2, "SYNTH-seed-8"));
  live.seam.setPracticeView({ screen: "run", runId: runIdOf(started), lastResult: null });
  live.seam.renderPracticeRun(runIdOf(started));
  const html = live.elements.get("id:content-body")?.innerHTML ?? "";
  const radios = [...html.matchAll(/<input\b([^>]*type="radio"[^>]*)>/g)];
  assert.ok(radios.length >= 8, `expected option radios, got ${radios.length}`);
  for (const radio of radios) {
    const id = (/id="([^"]+)"/.exec(radio[1]) ?? [])[1] as string;
    assert.ok(id && new RegExp(`<label[^>]*for="${id}"`).test(html), `radio #${id} labelled`);
  }
  assert.ok(html.includes("<fieldset") && html.includes("<legend>"), "options grouped with legend");
  const engine = live.seam.getEngine();
  assert.deepEqual(plain(engine.selectOption({}, "i1", "o2")), { i1: "o2" });
  assert.deepEqual(plain(engine.selectOption({ i1: "o1" }, "i1", "o2")), { i1: "o2" });
  assert.deepEqual(plain(engine.moveOrderItem(["a", "b", "c"], 0, 2)), { order: ["b", "c", "a"], moved: true });
  assert.equal(plain(engine.moveOrderItem(["a", "b"], 5, 0))["moved"], false);
});

test("PRACT09: revisions append; firsts stay immutable; feedback never rewrites history", () => {
  const live = buildRuntime();
  const started = plain(live.seam.startPracticeMode("matching", "independent", 1, "SYNTH-seed-9"));
  const liveRunId = runIdOf(started);
  const run = plain(live.seam.getStore().getPracticeRun(liveRunId)) as Record<string, unknown>;
  const itemId = (run["itemIds"] as string[])[0];
  const first = plain(
    live.seam.submitPracticeItem(liveRunId, itemId, {
      selectedOptions: [wrongOptionId(run)],
      response: "SYNTH first reasoning",
    })
  );
  assert.equal(first["ok"], true);
  const firstId = first["attemptId"] as string;
  const key = firstStimulus(run).termId;
  const revision = plain(
    live.seam.revisePracticeItem(liveRunId, itemId, { selectedOptions: [key], response: "" })
  );
  assert.equal(revision["ok"], true);
  const attempts = plain(live.seam.getStore().exportWork()).activity.attempts;
  assert.equal(attempts.length, 2, "first + revision both stored");
  const original = attempts.find((attempt) => attempt["id"] === firstId);
  assert.equal(original?.["response"], "SYNTH first reasoning");
  assert.deepEqual(original?.["selectedOptions"], [wrongOptionId(run)]);
  assert.equal(original?.["role"], "first");
  const rev = attempts.find((attempt) => attempt["id"] === revision["attemptId"]);
  assert.equal(rev?.["role"], "revision");
  assert.equal(rev?.["revisionOf"], firstId);
});

test("PRACT10: reflection and concept cards produce no submission, score, or grade", () => {
  const live = buildRuntime();
  const engine = live.seam.getEngine();
  assert.deepEqual(plain(engine.reflect()), { revealed: true, persisted: false });
  assert.equal(engine.reflect.length, 0, "reflect takes no store and cannot persist");
  live.seam.setPracticeView({ screen: "cards", runId: null, lastResult: null });
  live.seam.renderPracticeCards();
  const html = live.elements.get("id:content-body")?.innerHTML ?? "";
  assert.ok(html.includes("concept-card"), "cards render");
  assert.ok(!html.includes("<form"), "no forms on cards");
  assert.ok(!html.includes("data-practice-submit"), "no submit controls on cards");
  assert.ok(!html.includes("data-practice-option"), "no scored controls on cards");
  const cardsSlice = sliceTopLevel(mainSource, "function", "renderPracticeCards");
  assert.ok(!cardsSlice.includes("submitPracticeAttempt"), "card path cannot submit");
  assert.ok(!cardsSlice.includes("startPracticeRun"), "card path cannot start runs");
});

test("PRACT11: fill-in grading is narrow reviewed matching, never fuzzy", () => {
  const { seam } = buildRuntime();
  const engine = seam.getEngine();
  const item = { accepted: ["Numbered Treaties", "Treaty 6"], normalize: "narrow" };
  for (const good of ["Numbered Treaties", "  numbered treaties ", "NUMBERED  TREATIES", "Treaty 6", "treaty 6"]) {
    assert.equal(plain(engine.gradeFillIn(item, good))["match"], true, JSON.stringify(good));
  }
  for (const bad of [
    "Numbered Treaty",
    "Numbered Treatie",
    "Treaties",
    "Treaty",
    "Numbered",
    "Treaty Six",
    "The Numbered Treaties are important",
  ]) {
    assert.equal(plain(engine.gradeFillIn(item, bad))["match"], false, JSON.stringify(bad));
  }
  assert.equal(plain(engine.gradeFillIn({}, "anything"))["code"], "no-reviewed-key");
  assert.equal(
    plain(engine.gradeFillIn({ accepted: ["x"], normalize: "fuzzy" }, "x"))["code"],
    "unreviewed-rule"
  );
});

test("PRACT12: offered modes run; unoffered modes show reasons; the page is never falsely empty", () => {
  const live = buildRuntime();
  const modes = (plain(live.seam.getBank()) as { MODES: Array<Record<string, unknown>> }).MODES;
  assert.equal(
    modes.filter((mode) => mode["offered"]).length,
    3,
    "matching + concept-cards + selected-response offered"
  );
  assert.equal(
    modes.filter((mode) => !mode["offered"]).length,
    4,
    "four modes honestly unoffered"
  );
  for (const mode of modes.filter((entry) => !entry["offered"])) {
    assert.ok(
      typeof mode["reason"] === "string" && (mode["reason"] as string).length > 10,
      `${String(mode["id"])} states its reason`
    );
  }
  live.seam.setPracticeView({ screen: "catalog", runId: null, lastResult: null });
  live.seam.renderPracticeCatalog();
  const html = live.elements.get("id:content-body")?.innerHTML ?? "";
  assert.ok(html.includes("Start matching"), "offered mode runs");
  assert.ok(html.includes("Start source practice"), "reviewed selected-response bank runs");
  assert.ok(html.includes("Open concept cards"), "cards run");
  assert.ok(html.includes("Not offered yet"), "honest unoffered section");
  assert.ok(html.includes("Fill in the term"), "each unoffered mode named");
  assert.ok(!html.includes("No quizzes loaded yet"), "legacy empty card gone while modes exist");
  const emptyCatalog = live.seam.practiceCatalogHtml([]);
  assert.ok(emptyCatalog.includes("No practice available yet"), "all-empty bank states itself");
  const allOff = live.seam.practiceCatalogHtml(
    modes.map((mode) => ({ ...mode, offered: false, reason: "SYNTH reason." }))
  );
  assert.ok(
    allOff.includes("No practice available yet") && allOff.includes("SYNTH reason."),
    "all-off bank states itself with reasons"
  );
});

test("RUNTIME-ATTEMPTS: submit/duplicate/finish/abandon/unknown paths through the real store", () => {
  const live = buildRuntime();
  const store = live.seam.getStore();
  const started = plain(live.seam.startPracticeMode("matching", "independent", 1, "SYNTH-seed-10"));
  assert.equal(started["ok"], true);
  const liveRunId = runIdOf(started);
  const run = plain(store.getPracticeRun(liveRunId)) as Record<string, unknown>;
  assert.equal(run["status"], "in-progress");
  assert.equal((run["itemIds"] as string[]).length, 1);
  const itemId = (run["itemIds"] as string[])[0];
  const first = plain(
    live.seam.submitPracticeItem(liveRunId, itemId, { selectedOptions: [], response: "SYNTH written only" })
  );
  assert.equal(first["ok"], true);
  assert.equal(first["duplicate"], false);
  const attempt = plain(store.getPracticeAttempt(first["attemptId"] as string)) as Record<string, unknown>;
  assert.equal(attempt["reviewState"], "submitted");
  assert.equal(attempt["role"], "first");
  assert.ok(String(attempt["taskId"]).startsWith("practice:"), "practice task namespace");
  assert.deepEqual(attempt["selectedOptions"], []);
  assert.equal(attempt["response"], "SYNTH written only");
  assert.ok(
    Array.isArray(attempt["optionOrder"]) && (attempt["optionOrder"] as unknown[]).length > 0,
    "option order pinned"
  );
  const dup = plain(
    live.seam.submitPracticeItem(liveRunId, itemId, { selectedOptions: [], response: "SYNTH written only" })
  );
  assert.equal(dup["ok"], true);
  assert.equal(dup["duplicate"], true, "identical resubmission deduplicates");
  assert.equal(dup["attemptId"], first["attemptId"]);
  assert.equal(plain(store.exportWork()).activity.attempts.length, 1, "duplicate stores once");
  const finished = plain(live.seam.finishPracticeRunUi(liveRunId));
  assert.equal(finished["ok"], true);
  assert.equal((plain(store.getPracticeRun(liveRunId)) as Record<string, unknown>)["status"], "complete");
  const started2 = plain(live.seam.startPracticeMode("matching", "supported", 1, "SYNTH-seed-11"));
  const runId2 = runIdOf(started2);
  const abandoned = plain(live.seam.abandonPracticeRun(runId2));
  assert.equal(abandoned["ok"], true);
  assert.equal((plain(store.getPracticeRun(runId2)) as Record<string, unknown>)["status"], "abandoned");
  assert.equal(plain(live.seam.submitPracticeItem("run:999", itemId, {}))["code"], "unknown-run");
  assert.equal(plain(live.seam.submitPracticeItem(liveRunId, "nope", {}))["code"], "unknown-item");
  const run2 = plain(store.getPracticeRun(runId2)) as Record<string, unknown>;
  assert.equal(
    plain(live.seam.revisePracticeItem(runId2, (run2["itemIds"] as string[])[0], {}))["code"],
    "no-first-attempt"
  );
});
