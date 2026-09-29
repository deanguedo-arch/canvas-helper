/**
 * AB30 store-v2 suite — R02 (single writer + safe migration).
 *
 * Executes the REAL learning-store.js in vm. Fixtures are exact package
 * bytes copied to scripts/tests/fixtures/ab30-parity/v2-*.json (provenance:
 * AB30_BIO_PARITY_EXECUTION_v2/tests/fixtures/, sha pinned in R02 record).
 * Import-free: runs under plain `node --test`.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const storeSource = readFileSync(path.resolve(workspaceDir, "learning-store.js"), "utf8");
const mainSource = readFileSync(path.resolve(workspaceDir, "main.js"), "utf8");
const fixturePath = path.resolve("scripts", "tests", "fixtures", "ab30-parity", "v2-legacy-states.json");
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8")) as {
  storageKeys: { activity: string; ui: string; progress: string };
  cases: Array<{ id: string; values?: Record<string, unknown>; rawValues?: Record<string, string> }>;
};

const KEY_A = "aboriginal-studies-30.activityResponses";
const KEY_U = "aboriginal-studies-30.ui";
const KEY_P = "aboriginal-studies-30.progress";

function fakeStorage(seed?: Record<string, string>): any {
  const m = new Map<string, string>(Object.entries(seed || {}));
  return {
    getItem: (k: string): string | null => (m.has(String(k)) ? (m.get(String(k)) as string) : null),
    setItem: (k: string, v: string): void => { m.set(String(k), String(v)); },
    removeItem: (k: string): void => { m.delete(String(k)); },
    _dump: (): Record<string, string> => Object.fromEntries(m),
  };
}

function boot(storage: any): any {
  const ctx: any = { console, localStorage: storage, TextEncoder };
  vm.createContext(ctx);
  vm.runInContext(storeSource, ctx, { filename: "learning-store.js" });
  vm.runInContext("AB30Store.init({ storage: localStorage });", ctx);
  return ctx;
}

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seedFromCase(id: string): Record<string, string> {
  const found = fixtures.cases.find((c) => c.id === id);
  assert.ok(found, `fixture ${id} present`);
  const seed: Record<string, string> = {};
  for (const [k, v] of Object.entries(found.values || {})) seed[k] = JSON.stringify(v);
  for (const [k, v] of Object.entries(found.rawValues || {})) seed[k] = v;
  return seed;
}

test("R02-MIG01: flat fixture migrates to v2; aliases conflict, unknowns kept", () => {
  const ctx = boot(fakeStorage(seedFromCase("flat-alias-conflict")));
  const stored = JSON.parse(ctx.localStorage.getItem(KEY_A));
  assert.equal(stored.schema, "ab30-store-v2", "activity is v2 after init");
  assert.ok(stored.records["assignment:oral-tradition"], "aliased assignment record exists");
  assert.ok(stored.conflicts.some((c: any) => c.recordId === "assignment:oral-tradition"), "divergent alias drafts conflict, not overwrite");
  assert.equal(stored.records["theme-1-online-booklet::q37::arctic-challenges"].draft, "SYNTHETIC one chart cell.", "chart cell exact");
  assert.deepEqual(stored.legacy.raw["unknown-old-field"], { lines: ["retained", null, 42], futureField: true }, "unknown object preserved exactly");
  assert.ok(Array.isArray(stored.migrationHistory) && stored.migrationHistory.length === 1, "one history entry");
  const ui = JSON.parse(ctx.localStorage.getItem(KEY_U));
  assert.equal(ui.section, "home", "nav props preserved");
  assert.ok(!("practiceRuns" in ui), "no practice keys in projected ui");
});

test("R02-MIG02: v1 session migrates; run moves to envelope, origin labelled", () => {
  const ctx = boot(fakeStorage(seedFromCase("v1-session-and-first-character-origin")));
  const stored = JSON.parse(ctx.localStorage.getItem(KEY_A));
  assert.equal(stored.schema, "ab30-store-v2");
  assert.ok(stored.practice.runs["run:7"], "ui run moved into envelope practice domain");
  assert.equal(stored.practice.runs["run:7"].mode, "matching", "run payload intact");
  assert.ok(Object.keys(stored.practice.exposure).length > 0, "exposure moved");
  assert.ok(stored.practice.counter >= 7, "counter preserved");
  const rec = stored.records["theme-1-online-booklet::assignment-1-1"];
  assert.equal(rec.originNote, "legacy-first-write-artefact", "single-char origin labelled, not a first attempt");
  assert.equal(rec.origins[0].value, "S", "origin bytes untouched");
  const ui = JSON.parse(ctx.localStorage.getItem(KEY_U));
  assert.ok(!("practiceRuns" in ui) && !("practiceExposed" in ui) && !("practiceRunCounter" in ui), "ui practice stripped");
  assert.equal(ui.activeLessonId, "t1-l07-numbered-treaties", "nav props preserved");
});

test("R02-MIG03: corrupt raw enters recovery, never overwrites", () => {
  const seed = seedFromCase("corrupt-raw");
  const before = { ...seed };
  const ctx = boot(fakeStorage(seed));
  const mode = vm.runInContext("AB30Store.mode()", ctx);
  assert.equal(mode, "memory", "corrupt activity -> memory recovery mode");
  const after = ctx.localStorage._dump();
  assert.deepEqual(after, before, "recovery writes nothing over the corrupt raws");
});

test("R02-MIG04: migration is idempotent (retry twice, byte-identical)", () => {
  const runOnce = (): Record<string, string> => {
    const ctx = boot(fakeStorage(seedFromCase("v1-session-and-first-character-origin")));
    return ctx.localStorage._dump();
  };
  const first = runOnce();
  // Second run starts from the COMMITTED first output (crash-replay shape).
  const ctx2 = boot(fakeStorage({ ...first }));
  const second = ctx2.localStorage._dump();
  assert.equal(second[KEY_A], first[KEY_A], "activity bytes identical on retry");
  assert.equal(second[KEY_U], first[KEY_U], "ui bytes identical on retry");
  const stored = JSON.parse(second[KEY_A]);
  assert.equal(stored.migrationHistory.length, 1, "no duplicate history entries");
  assert.equal(Object.keys(stored.practice.runs).length, 1, "no duplicate runs");
});

test("R02-OWN01 (F1 regression): practice run survives nav patches + re-init", () => {
  const storage = fakeStorage();
  const ctx = boot(storage);
  const started = vm.runInContext(
    "AB30Store.startPracticeRun({ mode: 'matching', itemIds: ['a','b'], optionOrders: [['x','y'],['p','q']] })", ctx);
  assert.ok(started.ok, "run starts");
  const runId = started.run.id;
  vm.runInContext("AB30Store.markPracticeExposed('a', 'exp-1')", ctx);
  vm.runInContext(
    `AB30Store.submitPracticeAttempt('${runId}', { taskId: 't1', selectedOptions: ['x'], response: '' })`, ctx);
  // The R02 nav path: coordinated patch, not a whole-object serialize.
  const receipt = vm.runInContext("AB30Store.saveNavigation({ section: 'home' })", ctx);
  assert.equal(receipt.ok, true, "nav patch commits");
  const listed = vm.runInContext("AB30Store.listPracticeRuns()", ctx);
  assert.equal(listed.runs.length, 1, "run survives nav patch in-session");
  // Fresh instance over the same storage = return/reload path.
  const ctx2 = boot(storage);
  const relisted = plain(vm.runInContext("AB30Store.listPracticeRuns()", ctx2) as any);
  assert.equal(relisted.runs.length, 1, "run survives re-init");
  assert.equal(relisted.runs[0].id, runId, "same run ID");
  assert.deepEqual(relisted.runs[0].optionOrders, [["x", "y"], ["p", "q"]], "option order pinned");
  assert.ok(relisted.runs[0].attemptIds.t1.length === 1, "submitted attempt linked");
  assert.deepEqual(Object.keys(relisted.exposed), ["a"], "exposure intact");
  const ui = JSON.parse(storage.getItem(KEY_U));
  assert.ok(!("practiceRuns" in ui), "runs never written back to the ui key");
});

test("R02-OWN02: nav/progress patches preserve unknown props + version", () => {
  const storage = fakeStorage({
    [KEY_U]: JSON.stringify({ section: "home", customTheme: "dark", practiceRuns: {} }),
    [KEY_P]: JSON.stringify({ completedUnits: [], legacyBadge: 3 }),
  });
  const ctx = boot(storage);
  vm.runInContext("AB30Store.saveNavigation({ section: 'lesson' })", ctx);
  const ui = JSON.parse(storage.getItem(KEY_U));
  assert.equal(ui.section, "lesson", "patch applied");
  assert.equal(ui.customTheme, "dark", "unknown ui prop preserved");
  assert.equal(typeof ui.__rev, "number", "__rev versioned");
  vm.runInContext("AB30Store.saveProgress({ completedUnits: ['theme-1'] })", ctx);
  const progress = JSON.parse(storage.getItem(KEY_P));
  assert.deepEqual(progress.completedUnits, ["theme-1"], "progress patch applied");
  assert.equal(progress.legacyBadge, 3, "unknown progress prop preserved");
});

test("R02-OWN03: external change holds local overwrites; both stay exportable", () => {
  const storage = fakeStorage();
  const ctx = boot(storage);
  vm.runInContext(`AB30Store.noteExternalChange('${KEY_U}')`, ctx);
  const receipt = vm.runInContext("AB30Store.saveNavigation({ section: 'lesson' })", ctx);
  assert.equal(receipt.ok, false, "stale overwrite refused");
  assert.equal(receipt.code, "external-change", "honest code");
  const ui = JSON.parse(storage.getItem(KEY_U) || "{}");
  assert.ok(ui.section !== "lesson", "stored ui untouched");
  const held = plain(vm.runInContext("AB30Store.pendingHeld()", ctx) as any);
  assert.equal(held.nav.section, "lesson", "local patch held in memory");
  assert.deepEqual(held.externalDirtyKeys, [KEY_U], "dirty key named");
  const pack = vm.runInContext("AB30Store.exportAllWork()", ctx);
  assert.equal(pack.coordinator.pendingNav.section, "lesson", "held patch exportable");
  const status = vm.runInContext("AB30Store.status()", ctx);
  assert.equal(status.heldNav, true, "status surfaces the hold");
});

test("R04-CAP01: browser-local applies no character budget", () => {
  const ctx = boot(fakeStorage());
  const res = vm.runInContext("AB30Store.write('cap::big', 'x'.repeat(100000))", ctx) as any;
  assert.equal(res.ok, true, "100k chars accepted locally");
  const measure = plain(vm.runInContext(
    "AB30LearningStoreInternals.storeMeasurePayload(JSON.parse(localStorage.getItem('aboriginal-studies-30.activityResponses')), {}, {})", ctx) as any);
  assert.ok(measure.totalChars > 60000, "payload genuinely exceeds the old universal gate");
});

test("R04-CAP02: scorm-2004 profile gates at 60k with candidate + last-confirmed intact", () => {
  const storage = fakeStorage();
  const ctx: any = { console, localStorage: storage, TextEncoder };
  vm.createContext(ctx);
  vm.runInContext(storeSource, ctx, { filename: "learning-store.js" });
  vm.runInContext("AB30Store.init({ storage: localStorage, hostProfile: 'scorm-2004' });", ctx);
  vm.runInContext("AB30Store.write('cap::first', 'confirmed')", ctx);
  const res = plain(vm.runInContext("AB30Store.write('cap::big', 'x'.repeat(100000))", ctx) as any);
  assert.equal(res.ok, false, "over-budget write refused under host profile");
  assert.equal(res.code, "over-budget", "honest code");
  assert.equal(res.candidate, "x".repeat(100000), "complete candidate retained");
  const still = vm.runInContext("AB30Store.read('cap::first')", ctx);
  assert.equal(still, "confirmed", "last confirmed state intact");
});

test("R04-CAP03: unknown profile falls back to browser-local; status names host", () => {
  const storage = fakeStorage();
  const ctx: any = { console, localStorage: storage, TextEncoder };
  vm.createContext(ctx);
  vm.runInContext(storeSource, ctx, { filename: "learning-store.js" });
  vm.runInContext("AB30Store.init({ storage: localStorage, hostProfile: 'nope' });", ctx);
  const status = plain(vm.runInContext("AB30Store.status()", ctx) as any);
  assert.equal(status.host.profile, "browser-local", "safe default");
  assert.equal(status.host.acknowledged, false, "no host ack claimed");
  assert.equal(status.host.capacity, "unknown", "host capacity unknown");
});

test("R02-OWN04: v2 input passes through clean (no history growth)", () => {
  const first = boot(fakeStorage(seedFromCase("flat-alias-conflict")));
  const committed = first.localStorage._dump();
  const second = boot(fakeStorage({ ...committed }));
  const stored = JSON.parse(second.localStorage.getItem(KEY_A));
  assert.equal(stored.migrationHistory.length, 1, "clean v2 re-init appends nothing");
  assert.deepEqual(second.localStorage._dump(), committed, "clean v2 re-init writes identical bytes");
});

test("R02-OWN05: a throwing store never falls back to a direct tracked-key write", () => {
  const start = mainSource.indexOf("function saveJson(");
  const end = mainSource.indexOf("function escapeHtml(", start);
  assert.ok(start >= 0 && end > start, "production save seam found");
  const seed = { [KEY_U]: '{"section":"other-tab","__rev":7}', [KEY_P]: '{"completedUnits":["theme-1"],"__rev":7}' };
  const storage = fakeStorage(seed);
  const calls: string[] = [];
  const context: any = {
    STORAGE_KEYS: { ui: KEY_U, progress: KEY_P },
    NAV_PERSIST_PROPS: ["section"],
    PROGRESS_PERSIST_PROPS: ["completedUnits"],
    AB30Store: {
      saveNavigation: () => { throw Error("synthetic adapter failure"); },
      saveProgress: () => { throw Error("synthetic adapter failure"); },
    },
    localStorage: storage,
    flushDebouncedDrafts: () => {},
    pickPersistProps: (value: any) => value,
    storeAvailable: () => true,
    refreshSaveStatus: () => { calls.push("status"); },
  };
  vm.createContext(context);
  vm.runInContext(`let storeSaveException = false;\n${mainSource.slice(start, end)}`, context, { filename: "main-save-seam.js" });
  vm.runInContext(`saveJson('${KEY_U}', { section: 'lesson' });`, context);
  vm.runInContext(`saveJson('${KEY_P}', { completedUnits: [] });`, context);
  assert.deepEqual(storage._dump(), seed, "both tracked keys retain the other tab's exact bytes");
  assert.deepEqual(calls, ["status", "status"], "each failure updates save status");
  assert.equal(vm.runInContext("storeSaveException", context), true);
});
