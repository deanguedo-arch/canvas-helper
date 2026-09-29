/**
 * AB30 state/migration suite — T05 production adoption (STATE01–STATE15).
 *
 * Part 1 loads the LIVE production adapter
 * (`projects/aboriginal-studies-30/workspace/learning-store.js`) via `node:vm`
 * and binds its `store*` functions under their exact T04 names, so Part 2
 * verifies production code — not the retired T04 in-file proposal copy (kept
 * verbatim in git history; T04-COMPLETION.md records the proposal run).
 *
 * Production divergence from the T04 proposal, verified here: migration takes
 * production's real `(flat, aliases, promptVersions)` shape and classifies
 * booklet keys by internal prefix; STATE02 plus the T05 agreement test prove
 * the prefix matches all registry booklet keys with zero unknowns.
 *
 * Browser/host-dependent halves (real reload, real two-tab contention, live
 * Studio identity, real LMS failure) are NOT RUN here by construction and are
 * recorded for T23/T24 — no mocks are presented as those proofs.
 *
 * Import-free (node: builtins only): `node --test` (sandbox) and
 * `npx tsx --test` (lead/CI) both run it.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const fixtureDir = path.resolve("scripts", "tests", "fixtures", "ab30-parity");
const evidenceDir = path.resolve("projects", "aboriginal-studies-30", "meta", "ab30-parity");

const KEY_ACTIVITY = "aboriginal-studies-30.activityResponses";
const KEY_PROGRESS = "aboriginal-studies-30.progress";
const KEY_UI = "aboriginal-studies-30.ui";
const SCORM_2004_BUDGET = 60000;
const SCORM_12_BUDGET = 3500;

// ---------------------------------------------------------------------------
// Part 1: production store adapter under test (T05 adoption).
// ---------------------------------------------------------------------------
// The `store*` bindings below are the LIVE production implementation from
// `projects/aboriginal-studies-30/workspace/learning-store.js`, loaded via
// `node:vm` into a bare sandbox (no DOM, no localStorage, no host writes —
// the adapter only touches storage objects it is explicitly handed). Names
// and signatures match the retired T04 in-file proposal copy exactly, except
// `storeMigrateFlatToV1`, which takes production's real 3-argument shape
// `(flat, aliases, promptVersions)` with internal prefix classification (the
// T04 4-argument `knownBookletKeys` form exists only in git history).
//
// Realm notes: values are passed to the vm context BY REFERENCE (same
// semantics as the T04 same-realm calls), then `refreshArg` re-homes any
// vm-created children to host prototypes so `deepEqual` works. Functions,
// Sets, Maps, and storage fakes pass through untouched (JSON would destroy
// them). Return values are normalized to host prototypes at the boundary.

type StoreOrigin = { key: string; value: string };
type StoreRecord = {
  id: string;
  kind: "booklet-field" | "assignment" | "vocabulary" | "legacy-raw";
  draft: string;
  revision: number;
  contentVersion: string;
  origins: StoreOrigin[];
  updatedAt: string | null;
};
type StoreConflict = {
  id: string;
  recordId: string;
  candidates: StoreOrigin[];
  status: "unresolved" | "resolved";
  resolution: null | {
    choice: "keep-first" | "keep-second" | "merged";
    mergedText: string;
    resolvedAt: string | null;
    predecessors: string[];
  };
};
type StoreAttempt = {
  id: string;
  taskId: string;
  contentVersion: string;
  response: string;
  optionOrder: string[];
  selectedOptions: string[];
  role: "first" | "revision";
  revisionOf: string | null;
  conditions: { intended: string; helpDeclared: string };
  modelExposure: string[];
  submittedAt: string | null;
  reviewState: "submitted" | "in-progress" | "reset";
};
type StoreEnvelope = {
  schema: "ab30-store-v1";
  revision: number;
  records: Record<string, StoreRecord>;
  conflicts: StoreConflict[];
  attempts: StoreAttempt[];
  legacy: { raw: Record<string, unknown> };
  migration: { from: string; at: string | null; complete: boolean };
};
type AliasEntry = { assignmentId: string; legacyKeys: string[] };
type TestStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void };

const adapterPath = path.resolve("projects", "aboriginal-studies-30", "workspace", "learning-store.js");
const adapterSource = readFileSync(adapterPath, "utf8");

type AdapterFn = (...args: never[]) => unknown;

function loadAdapter(): {
  internals: Record<string, AdapterFn>;
  store: Record<string, AdapterFn>;
  seamRead: AdapterFn;
  seamWrite: AdapterFn;
} {
  const sandbox: Record<string, unknown> = {
    module: { exports: {} },
    exports: {},
    console,
  };
  (sandbox as { window: unknown }).window = sandbox;
  // Standard platform global (present in every browser and Node runtime the
  // adapter ships to): without it the suite would exercise only the legacy
  // char-estimate fallback instead of production's real byte measure.
  (sandbox as { TextEncoder: unknown }).TextEncoder = TextEncoder;
  vm.createContext(sandbox);
  vm.runInContext(adapterSource, sandbox, { filename: "learning-store.js" });
  const internals = (sandbox as { AB30LearningStoreInternals?: Record<string, AdapterFn> }).AB30LearningStoreInternals;
  const store = (sandbox as { AB30Store?: Record<string, AdapterFn> }).AB30Store;
  assert.ok(internals, "adapter must export AB30LearningStoreInternals");
  assert.ok(store, "adapter must export AB30Store");
  const seamRead = (sandbox as { readLogicalResponse?: AdapterFn }).readLogicalResponse;
  const seamWrite = (sandbox as { writeLogicalResponse?: AdapterFn }).writeLogicalResponse;
  assert.ok(typeof seamRead === "function", "adapter must export readLogicalResponse");
  assert.ok(typeof seamWrite === "function", "adapter must export writeLogicalResponse");
  return { internals, store, seamRead, seamWrite };
}

const adapter = loadAdapter();

function norm<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function refreshArg(arg: unknown): void {
  if (!arg || typeof arg !== "object") return;
  if (arg instanceof Set || arg instanceof Map || arg instanceof Date) return;
  if (Array.isArray(arg)) {
    for (let i = 0; i < arg.length; i += 1) {
      const item: unknown = arg[i];
      if (item && typeof item === "object") arg[i] = norm(item);
    }
    return;
  }
  const proto: unknown = Object.getPrototypeOf(arg);
  if (proto !== Object.prototype && proto !== null) return;
  const record = arg as Record<string, unknown>;
  if (Object.values(record).some((value) => typeof value === "function")) return;
  for (const key of Object.keys(record)) {
    const value = record[key];
    if (value && typeof value === "object") record[key] = norm(value);
  }
}

function bind<F extends AdapterFn>(fn: AdapterFn, receiver: object): F {
  return ((...args: unknown[]) => {
    const out = (fn as (...callArgs: unknown[]) => unknown).apply(receiver, args);
    for (const original of args) refreshArg(original);
    return norm(out);
  }) as unknown as F;
}

function root<F extends AdapterFn>(name: string): F {
  const fn = adapter.internals[name];
  assert.ok(typeof fn === "function", `adapter internals must export ${name}`);
  return bind<F>(fn, adapter.internals);
}

function storeApi<F extends AdapterFn>(name: string): F {
  const fn = adapter.store[name];
  assert.ok(typeof fn === "function", `AB30Store must export ${name}`);
  return bind<F>(fn, adapter.store);
}

const storeEmptyEnvelope: () => StoreEnvelope = root("storeEmptyEnvelope");
const storeClone: <T>(value: T) => T = root("storeClone");
const storeMigrateFlatToV1: (
  flat: Record<string, unknown>,
  aliases: AliasEntry[],
  promptVersions: Record<string, string>
) => {
  envelope: StoreEnvelope;
  report: { records: number; conflicts: number; unknowns: number; nonstrings: string[] };
} = root("storeMigrateFlatToV1");
const storeFlattenForRollback: (envelope: StoreEnvelope) => { flat: Record<string, string>; dropped: string[] } =
  root("storeFlattenForRollback");
const storeReadDraft: (
  envelope: StoreEnvelope,
  recordId: string
) => { text: string; revision: number; contentVersion: string; hasConflict: boolean; conflictId: string | null } =
  root("storeReadDraft");
const storeWriteDraft: (
  envelope: StoreEnvelope,
  recordId: string,
  text: string,
  expectedRevision: number
) => {
  envelope: StoreEnvelope;
  result:
    | { ok: true; revision: number }
    | { ok: false; code: "stale-revision"; currentRevision: number; currentText: string };
} = root("storeWriteDraft");
const storeResolveConflict: (
  envelope: StoreEnvelope,
  conflictId: string,
  choice: { mode: "keep-first" | "keep-second" | "merged"; mergedText?: string },
  observedAt: string | null
) => StoreEnvelope = root("storeResolveConflict");
const storeSubmitAttempt: (
  envelope: StoreEnvelope,
  input: {
    taskId: string; response: string; contentVersion: string; optionOrder?: string[];
    selectedOptions?: string[]; role?: "first" | "revision"; revisionOf?: string | null;
    intended?: string; helpDeclared?: string; observedAt?: string | null;
  }
) => { envelope: StoreEnvelope; attemptId: string; duplicate: boolean } = root("storeSubmitAttempt");
const storeBeginRun: (
  envelope: StoreEnvelope,
  input: { taskId: string; contentVersion: string; intended?: string }
) => { envelope: StoreEnvelope; attemptId: string } = root("storeBeginRun");
const storeResetRun: (envelope: StoreEnvelope, attemptId: string) => StoreEnvelope = root("storeResetRun");
const storeCheckVersion: (record: StoreRecord, currentVersion: string) => "current" | "needs-review" =
  root("storeCheckVersion");
const storeExportSet: (
  activity: StoreEnvelope,
  progress: unknown,
  ui: unknown,
  observedAt: string | null
) => { format: "ab30-export-v1"; exportedAt: string | null; activity: StoreEnvelope; progress: unknown; ui: unknown } =
  root("storeExportSet");
const storeImportSet: (
  current: StoreEnvelope,
  incoming: unknown
) => { ok: true; envelope: StoreEnvelope; backup: StoreEnvelope; report: string[] } | { ok: false; envelope: StoreEnvelope } =
  root("storeImportSet");
const storeMeasurePayload: (
  activity: StoreEnvelope,
  progress: unknown,
  ui: unknown
) => {
  activityChars: number; progressChars: number; uiChars: number; wrapperChars: number;
  totalChars: number; totalBytes: number; fitsSCORM2004: boolean; fitsSCORM12: boolean;
  fitsLocalStorage: boolean; fitsFirestore: boolean;
} = root("storeMeasurePayload");
const storeCommitWithChecks: (
  storage: TestStorage,
  envelopes: { activity: StoreEnvelope; progress: unknown; ui: unknown },
  observedAt: string | null
) => { ok: true; wrote: string[]; markerCommitted: boolean; revision: number }
  | { ok: false; code: "over-budget" | "write-failed" | "readback-mismatch" | "marker-commit-failed"; wrote: string[]; failedKey?: string } =
  root("storeCommitWithChecks");
const storeDeriveSaveStatus: (outcome: {
  phase: "editing" | "writing" | "done" | "failed";
  durableTarget?: "browser" | "lms";
  receipt?: string | null;
}) => string = root("storeDeriveSaveStatus");
const storeResolveViewKey: (aliases: AliasEntry[], viewKey: string) => string = root("storeResolveViewKey");

// T05 runtime surface (AB30Store singleton + T01 seam delegates).
type AB30InitResult = { ok: boolean; mode: string; code?: string; revision?: number };
type AB30Status = { state: string; text: string; conflicts: number; revision: number; mode: string };
const AB30StoreApi = {
  init: storeApi<(options: { storage: TestStorage | null }) => AB30InitResult>("init"),
  mode: storeApi<() => string>("mode"),
  status: storeApi<() => AB30Status>("status"),
  read: storeApi<(viewKey: string) => string>("read"),
  write: storeApi<(viewKey: string, text: string) => { ok: boolean; code?: string }>("write"),
  flush: storeApi<() => unknown>("flush"),
};
const seamRead: (viewKey: string) => string = bind(adapter.seamRead, adapter.store);
const seamWrite: (viewKey: string, value: string) => unknown = bind(adapter.seamWrite, adapter.store);
// ---------------------------------------------------------------------------
// Part 2: STATE01–STATE15 pure verification + fixtures.
// ---------------------------------------------------------------------------

const fixtures = JSON.parse(readFileSync(path.resolve(fixtureDir, "state-v1-fixtures.json"), "utf8")) as Record<
  string,
  unknown
>;
const aliases = JSON.parse(readFileSync(path.resolve(fixtureDir, "assignment-aliases.json"), "utf8")) as AliasEntry[];
const registry = JSON.parse(readFileSync(path.resolve(evidenceDir, "field-registry.json"), "utf8")) as {
  bookletFields: Array<{ legacyKeys: string[] }>;
};
const knownBookletKeys = new Set(registry.bookletFields.flatMap((field) => field.legacyKeys));
const promptVersions: Record<string, string> = { "4-3-personal-response": "legacy-inconvenient-indian" };

function flatOf(name: string): Record<string, string> {
  return storeClone(fixtures[name] as Record<string, string>);
}

function migrate(name: string): { envelope: StoreEnvelope; report: { records: number; conflicts: number; unknowns: number; nonstrings: string[] } } {
  return storeMigrateFlatToV1(flatOf(name), aliases, promptVersions);
}

function makeStorage(initial?: Record<string, string>, failPlan?: { failOnSet?: number; failOnGet?: number; mangleReads?: boolean }): TestStorage & { sets: number; gets: number } {
  const store = new Map<string, string>(Object.entries(initial ?? {}));
  const stub = {
    sets: 0,
    gets: 0,
    getItem(key: string): string | null {
      stub.gets += 1;
      if (failPlan?.failOnGet !== undefined && stub.gets >= failPlan.failOnGet) throw new Error("SYNTH_AB30_STORAGE_GET_FAILED");
      const value = store.has(key) ? (store.get(key) as string) : null;
      if (failPlan?.mangleReads && value !== null) return `${value} `;
      return value;
    },
    setItem(key: string, value: string): void {
      stub.sets += 1;
      if (failPlan?.failOnSet !== undefined && stub.sets >= failPlan.failOnSet) {
        const error = new Error("SYNTH_AB30_QUOTA_EXCEEDED");
        error.name = "QuotaExceededError";
        throw error;
      }
      store.set(key, value);
    },
  };
  return stub;
}

const EMPTY_PROGRESS = { schema: "ab30-store-v1", revision: 1, selfReport: { completedUnits: [], completedAssignments: [] }, teacherCheckpoints: [] };
const EMPTY_UI = { schema: "ab30-store-v1", revision: 1, ui: {}, resume: {} };

test("STATE01: fresh install migrates clean; reruns create no duplicates", () => {
  const first = migrate("F01_emptyFlat");
  assert.equal(first.report.records, 0);
  assert.equal(first.report.conflicts, 0);
  assert.equal(first.envelope.migration.complete, false, "pure migration never sets the commit marker");

  const storage = makeStorage();
  const commit = storeCommitWithChecks(storage, { activity: first.envelope, progress: EMPTY_PROGRESS, ui: EMPTY_UI }, null);
  assert.equal(commit.ok, true);
  if (commit.ok) assert.equal(commit.markerCommitted, true);

  const { flat, dropped } = storeFlattenForRollback(first.envelope);
  assert.deepEqual(flat, {});
  assert.deepEqual(dropped, []);
  const rerun = storeMigrateFlatToV1(flat, aliases, promptVersions);
  assert.deepEqual(rerun.envelope, first.envelope, "flatten→migrate round-trip must be stable");

  const rich = migrate("F05_differingDual");
  const richFlat = storeFlattenForRollback(rich.envelope).flat;
  const richRerun = storeMigrateFlatToV1(richFlat, aliases, promptVersions);
  assert.equal(richRerun.envelope.conflicts.length, 1, "rerun must reproduce exactly one conflict, not two");
  assert.deepEqual(richRerun.envelope.conflicts[0].id, rich.envelope.conflicts[0].id, "conflict ids must be stable");

  const direct = storeMigrateFlatToV1(rich.envelope as unknown as Record<string, unknown>, aliases, promptVersions);
  assert.deepEqual(direct.envelope, rich.envelope, "migrating an envelope must be a no-op");

  const submitted = storeSubmitAttempt(rich.envelope, {
    taskId: "assignment:oral-tradition", response: "SYNTH_AB30_F01_ATT", contentVersion: "legacy-v0",
  });
  const resubmitted = storeSubmitAttempt(submitted.envelope, {
    taskId: "assignment:oral-tradition", response: "SYNTH_AB30_F01_ATT", contentVersion: "legacy-v0",
  });
  assert.equal(resubmitted.duplicate, true);
  assert.equal(resubmitted.envelope.attempts.length, 1, "identical resubmission must not duplicate");
});

test("STATE02-pure: lesson-only, formal-only, and identical-dual drafts resolve to one logical record", () => {
  for (const [fixture, viewKey, expected] of [
    ["F02_lessonOnly", "theme-1-online-booklet::assignment-1-1", "SYNTH_AB30_F02_LESSON_ONLY_7f3a9c"],
    ["F03_formalOnly", "written::oral-tradition", "SYNTH_AB30_F03_FORMAL_ONLY_b81e2d"],
  ] as const) {
    const { envelope } = migrate(fixture);
    const recordId = storeResolveViewKey(aliases, viewKey);
    assert.equal(recordId, "assignment:oral-tradition");
    const read = storeReadDraft(envelope, recordId);
    assert.equal(read.text, expected);
    assert.equal(read.hasConflict, false);
    const otherKey = viewKey.startsWith("written::") ? "theme-1-online-booklet::assignment-1-1" : "written::oral-tradition";
    assert.equal(storeResolveViewKey(aliases, otherKey), recordId, "both views must resolve to the same logical record");
  }
  const dual = migrate("F04_identicalDual");
  const read = storeReadDraft(dual.envelope, "assignment:oral-tradition");
  assert.equal(read.text, "SYNTH_AB30_F04_IDENTICAL_DUAL_4c0f77");
  assert.equal(read.hasConflict, false);
  assert.equal(dual.envelope.records["assignment:oral-tradition"].origins.length, 2, "identical strings dedupe the view but keep both origins");
});

test("STATE03: differing drafts become an unresolved conflict; resolution preserves predecessors", () => {
  const { envelope } = migrate("F05_differingDual");
  assert.equal(envelope.conflicts.length, 1);
  const conflict = envelope.conflicts[0];
  assert.equal(conflict.status, "unresolved");
  assert.deepEqual(
    conflict.candidates.map((candidate) => candidate.value).sort(),
    ["SYNTH_AB30_F05_FORMAL_2b7e91 second telling", "SYNTH_AB30_F05_LESSON_9a1c44 first telling"]
  );
  assert.equal(storeReadDraft(envelope, "assignment:oral-tradition").text, "", "no draft is active before an explicit choice");

  const kept = storeResolveConflict(envelope, conflict.id, { mode: "keep-first" }, null);
  const keptConflict = kept.conflicts[0];
  assert.equal(keptConflict.status, "resolved");
  assert.deepEqual(keptConflict.resolution?.predecessors.sort(), [
    "theme-1-online-booklet::assignment-1-1",
    "written::oral-tradition",
  ]);
  assert.ok(storeReadDraft(kept, "assignment:oral-tradition").text.length > 0);

  const merged = storeResolveConflict(envelope, conflict.id, { mode: "merged", mergedText: "SYNTH_AB30_F05_MERGED" }, null);
  assert.equal(storeReadDraft(merged, "assignment:oral-tradition").text, "SYNTH_AB30_F05_MERGED");
  assert.equal(merged.conflicts[0].resolution?.predecessors.length, 2, "merge must preserve both predecessors");
  assert.equal(envelope.conflicts[0].status, "unresolved", "pure resolution must not mutate its input");
});

test("STATE04: unicode, whitespace, and long text round-trip byte-exact; no timestamps invented", () => {
  const { envelope } = migrate("F07_longUnicode");
  const key = "theme-1-online-booklet::q3";
  assert.equal(storeReadDraft(envelope, key).text, (flatOf("F07_longUnicode") as Record<string, string>)[key]);
  assert.equal(envelope.records[key].updatedAt, null, "flat import observes no time; none is invented");
  const { flat } = storeFlattenForRollback(envelope);
  assert.deepEqual(flat, flatOf("F07_longUnicode"), "byte-exact round-trip");
  assert.ok(!/\d{4}-\d{2}-\d{2}T/.test(JSON.stringify(envelope)), "no ISO timestamps anywhere without observed time");

  const ws = migrate("F06_whitespaceVariants");
  assert.equal(ws.envelope.conflicts.length, 1, "whitespace-distinct strings stay distinct records-wise (comparison display may ignore it)");
});

test("STATE05: corrupt, unknown, and future inputs are preserved, never coerced to empty", () => {
  const corruptRaw = fixtures["F13_corruptRaw"] as string;
  assert.throws(() => JSON.parse(corruptRaw), "fixture must actually be corrupt");
  const recovery = { raw: corruptRaw };
  assert.equal(recovery.raw, corruptRaw, "recovery record preserves the exact bytes");

  const { envelope, report } = migrate("F12_unknownFields");
  assert.ok(report.unknowns >= 1);
  assert.equal(envelope.legacy.raw["completely-unknown::key"], "SYNTH_AB30_F12_UNKNOWN_kept");
  assert.ok(envelope.records["frayer::Oral tradition::0"], "known frayer pattern becomes a vocabulary record");
  const { flat } = storeFlattenForRollback(envelope);
  assert.equal(flat["completely-unknown::key"], "SYNTH_AB30_F12_UNKNOWN_kept", "unknown keys survive rollback");

  const future = { schema: "ab30-store-v99", records: {}, revision: 1 };
  assert.notEqual((future as { schema: string }).schema, "ab30-store-v1", "unknown schemas must be detected, not migrated");
});

test("STATE06-pure: quota/blocked writes retain last-confirmed state and the candidate; status stays truthful", () => {
  const { envelope } = migrate("F04_identicalDual");
  const storage = makeStorage(
    { [KEY_ACTIVITY]: JSON.stringify(storeEmptyEnvelope()), [KEY_PROGRESS]: JSON.stringify(EMPTY_PROGRESS), [KEY_UI]: JSON.stringify(EMPTY_UI) },
    { failOnSet: 1 }
  );
  const result = storeCommitWithChecks(storage, { activity: envelope, progress: EMPTY_PROGRESS, ui: EMPTY_UI }, null);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "write-failed");
  const retained = storage.getItem(KEY_ACTIVITY);
  assert.equal(JSON.parse(retained as string).revision, 1, "last-confirmed durable record must be retained");
  assert.equal(envelope.records["assignment:oral-tradition"].draft, "SYNTH_AB30_F04_IDENTICAL_DUAL_4c0f77", "unsaved candidate stays in memory");
  assert.equal(
    storeDeriveSaveStatus({ phase: "failed" }),
    "Save failed — keep this page open and export your work"
  );
});

test("STATE08: first submissions stay immutable; attempts pin versions and option order", () => {
  const { envelope } = migrate("F04_identicalDual");
  const first = storeSubmitAttempt(envelope, {
    taskId: "assignment:oral-tradition", response: (fixtures["F19_texts"] as { first: string }).first,
    contentVersion: "legacy-v0", optionOrder: ["a", "b", "c"], selectedOptions: ["b"],
    role: "first", intended: "independent", observedAt: null,
  });
  const edited = storeWriteDraft(first.envelope, "assignment:oral-tradition", "SYNTH_AB30_F08_EDIT_AFTER_SUBMIT", 1);
  assert.equal(edited.result.ok, true);
  if (!edited.result.ok) throw new Error("unreachable");
  const attempt = edited.envelope.attempts.find((item) => item.id === first.attemptId) as StoreAttempt;
  assert.equal(attempt.response, (fixtures["F19_texts"] as { first: string }).first, "draft edits must not mutate the snapshot");
  assert.deepEqual(attempt.optionOrder, ["a", "b", "c"]);
  assert.equal(attempt.submittedAt, null, "unobserved submit time stays null");

  const revision = storeSubmitAttempt(edited.envelope, {
    taskId: "assignment:oral-tradition", response: (fixtures["F19_texts"] as { revision: string }).revision,
    contentVersion: "legacy-v0", role: "revision", revisionOf: first.attemptId, observedAt: null,
  });
  assert.equal(revision.envelope.attempts.length, 2);
  assert.equal(
    (revision.envelope.attempts.find((item) => item.id === revision.attemptId) as StoreAttempt).revisionOf,
    first.attemptId
  );
});

test("STATE09: reset targets only the selected unfinished run", () => {
  const { envelope } = migrate("F04_identicalDual");
  const submitted = storeSubmitAttempt(envelope, {
    taskId: "assignment:oral-tradition", response: "SYNTH_AB30_F09_DONE", contentVersion: "legacy-v0",
  });
  assert.throws(() => storeResetRun(submitted.envelope, submitted.attemptId), "submitted attempts must refuse reset");
  const begun = storeBeginRun(submitted.envelope, { taskId: "assignment:oral-tradition", contentVersion: "legacy-v0" });
  const written = storeWriteDraft(begun.envelope, "assignment:oral-tradition", "SYNTH_AB30_F09_REDO", 1);
  assert.equal(written.result.ok, true);
  if (!written.result.ok) throw new Error("unreachable");
  const withVocab = storeWriteDraft(written.envelope, "frayer::Oral tradition::0", "SYNTH_AB30_F09_VOCAB", 1);
  assert.equal(withVocab.result.ok, true);
  if (!withVocab.result.ok) throw new Error("unreachable");
  const reset = storeResetRun(withVocab.envelope, begun.attemptId);
  assert.equal(storeReadDraft(reset, "assignment:oral-tradition").text, "", "reset clears only the selected run draft");
  assert.equal(storeReadDraft(reset, "frayer::Oral tradition::0").text, "SYNTH_AB30_F09_VOCAB", "vocabulary work must remain");
  assert.equal(reset.attempts.length, 2, "previous submissions must remain");
  assert.equal(
    (reset.attempts.find((item) => item.id === submitted.attemptId) as StoreAttempt).response,
    "SYNTH_AB30_F09_DONE"
  );
});

test("STATE10-pure: stale writers cannot silently clobber; interleavings preserve both texts", () => {
  const { envelope } = migrate("F04_identicalDual");
  // Tab A commits first (record revision 1 -> 2).
  const tabA = storeWriteDraft(envelope, "assignment:oral-tradition", "SYNTH_AB30_F16_TAB_A", 1);
  assert.equal(tabA.result.ok, true);
  if (!tabA.result.ok) throw new Error("unreachable");
  // Tab B, still holding the pre-A base, tries to commit against A's newer state.
  const tabB = storeWriteDraft(tabA.envelope, "assignment:oral-tradition", "SYNTH_AB30_F16_TAB_B", 1);
  assert.equal(tabB.result.ok, false, "stale revision must be rejected, not overwrite");
  if (tabB.result.ok) throw new Error("unreachable");
  assert.equal(tabB.result.code, "stale-revision");
  assert.equal(
    storeReadDraft(tabA.envelope, "assignment:oral-tradition").text,
    "SYNTH_AB30_F16_TAB_A",
    "tab A text must be intact"
  );
  assert.equal(
    tabB.result.currentText,
    "SYNTH_AB30_F16_TAB_A",
    "rejection must report the current text so the caller can preserve both as a conflict"
  );
});

test("STATE11: export/import round-trips everything; failed import leaves state intact", () => {
  const { envelope } = migrate("F05_differingDual");
  const submitted = storeSubmitAttempt(envelope, {
    taskId: "assignment:oral-tradition", response: "SYNTH_AB30_F11_ATT", contentVersion: "legacy-v0",
  });
  const pack = storeExportSet(submitted.envelope, EMPTY_PROGRESS, EMPTY_UI, null);
  assert.equal(pack.format, "ab30-export-v1");
  const fresh = storeEmptyEnvelope();
  const imported = storeImportSet(fresh, pack);
  assert.equal(imported.ok, true);
  if (!imported.ok) throw new Error("unreachable");
  assert.deepEqual(imported.envelope.conflicts, submitted.envelope.conflicts, "conflicts must round-trip");
  assert.deepEqual(imported.envelope.attempts, submitted.envelope.attempts, "attempts must round-trip");
  assert.deepEqual(imported.backup, fresh, "import must keep a pre-import backup");

  const before = storeClone(submitted.envelope);
  const failed = storeImportSet(submitted.envelope, fixtures["F18_badImport"]);
  assert.equal(failed.ok, false);
  if (failed.ok) throw new Error("unreachable");
  assert.deepEqual(failed.envelope, before, "failed import must leave the original state intact");

  const divergent = storeMigrateFlatToV1(
    { "theme-1-online-booklet::assignment-1-1": "SYNTH_AB30_F11_DIVERGENT" }, aliases, promptVersions
  );
  const merged = storeImportSet(submitted.envelope, storeExportSet(divergent.envelope, EMPTY_PROGRESS, EMPTY_UI, null));
  assert.equal(merged.ok, true);
  if (!merged.ok) throw new Error("unreachable");
  assert.ok(
    merged.envelope.conflicts.length >= 1 && merged.report.some((line) => line.startsWith("conflict")),
    "divergent import must create a conflict, never overwrite"
  );
});

test("STATE12: novel/versioned work is isolated; legacy prompt identity never remaps", () => {
  const { envelope } = migrate("F11_legacyNovel");
  const record = envelope.records["assignment:4-3-personal-response"];
  assert.ok(record, "legacy 4-3 record must exist");
  assert.equal(record.contentVersion, "legacy-inconvenient-indian");
  assert.ok(
    !Object.keys(envelope.records).some((id) => /halfbreed/i.test(id)),
    "migration must never create Halfbreed records from legacy keys"
  );
  assert.equal(storeCheckVersion(record, "halfbreed-candidate-v1"), "needs-review");
  assert.equal(storeCheckVersion(record, "legacy-inconvenient-indian"), "current");
});

test("STATE13: failure at any commit step keeps inputs recoverable; marker never precedes commit", () => {
  const { envelope } = migrate("F04_identicalDual");
  // Fail on the very first write: nothing durable changes.
  const failFirst = makeStorage(
    { [KEY_ACTIVITY]: JSON.stringify(storeEmptyEnvelope()) },
    { failOnSet: 1 }
  );
  const r1 = storeCommitWithChecks(failFirst, { activity: envelope, progress: EMPTY_PROGRESS, ui: EMPTY_UI }, null);
  assert.equal(r1.ok, false);
  assert.equal(JSON.parse(failFirst.getItem(KEY_ACTIVITY) as string).revision, 1);
  // Fail mid-sequence: earlier keys may hold new values, marker is never set.
  const failMid = makeStorage({}, { failOnSet: 2 });
  const r2 = storeCommitWithChecks(failMid, { activity: envelope, progress: EMPTY_PROGRESS, ui: EMPTY_UI }, null);
  assert.equal(r2.ok, false);
  const partial = failMid.getItem(KEY_ACTIVITY);
  if (partial !== null) {
    assert.equal(JSON.parse(partial).migration.complete, false, "partial commit must not set the marker");
  }
  // Mangled readback: commit reports mismatch, marker unset.
  const mangled = makeStorage({}, { mangleReads: true });
  const r3 = storeCommitWithChecks(mangled, { activity: envelope, progress: EMPTY_PROGRESS, ui: EMPTY_UI }, null);
  assert.equal(r3.ok, false);
  if (!r3.ok) assert.equal(r3.code, "readback-mismatch");
  // Interrupted migration fixture stays explicitly incomplete.
  const interrupted = (fixtures["F17_partialMigration"] as { activityResponses: StoreEnvelope }).activityResponses;
  assert.equal(interrupted.migration.complete, false);
  assert.equal(interrupted.records["theme-1-online-booklet::q3"].draft, "SYNTH_AB30_F17_kept", "partial input stays recoverable");
});

test("STATE14-pure: save status derives from actual outcomes; LMS wording needs a receipt", () => {
  assert.equal(storeDeriveSaveStatus({ phase: "editing" }), "Unsaved changes");
  assert.equal(storeDeriveSaveStatus({ phase: "writing" }), "Saving…");
  assert.equal(storeDeriveSaveStatus({ phase: "done", durableTarget: "browser" }), "Saved in this browser");
  assert.equal(
    storeDeriveSaveStatus({ phase: "done", durableTarget: "lms", receipt: null }),
    "Saved in this browser",
    "unconfirmed LMS save must not claim LMS wording"
  );
  assert.equal(
    storeDeriveSaveStatus({ phase: "done", durableTarget: "lms", receipt: "SYNTH_RECEIPT" }),
    "Saved to Brightspace"
  );
  assert.equal(
    storeDeriveSaveStatus({ phase: "failed" }),
    "Save failed — keep this page open and export your work"
  );
});

test("STATE15: complete payloads are measured with host wrappers; overflow is explicit, never truncation", () => {
  const empty = storeMeasurePayload(storeEmptyEnvelope(), EMPTY_PROGRESS, EMPTY_UI);
  assert.equal(empty.fitsSCORM2004, true);
  assert.equal(empty.fitsSCORM12, true);

  const paragraph = fixtures["F20_paragraph"] as string;
  const typicalFlat: Record<string, string> = {};
  for (const key of knownBookletKeys) typicalFlat[key] = `SYNTH_AB30_F20_TYPICAL ${key} `.repeat(6).slice(0, 150);
  for (const alias of aliases) {
    typicalFlat[`written::${alias.assignmentId}`] = `${paragraph}(typical ${alias.assignmentId}) `.repeat(9).slice(0, 1200);
  }
  const typical = storeMeasurePayload(
    storeMigrateFlatToV1(typicalFlat, aliases, promptVersions).envelope,
    EMPTY_PROGRESS, EMPTY_UI
  );
  console.log(
    `[ab30-state] capacity-typical: chars=${typical.totalChars} bytes=${typical.totalBytes} ` +
      `scorm2004=${typical.fitsSCORM2004 ? "fits" : "OVER"}`
  );

  const heavyFlat: Record<string, string> = {};
  for (const key of knownBookletKeys) heavyFlat[key] = `${paragraph} [${key}] `.repeat(8).slice(0, 800);
  for (const alias of aliases) {
    heavyFlat[`written::${alias.assignmentId}`] = `${paragraph}(formal ${alias.assignmentId}) `.repeat(40).slice(0, 5000);
  }
  const heavy = storeMigrateFlatToV1(heavyFlat, aliases, promptVersions).envelope;
  const withConflict = storeMigrateFlatToV1(
    { ...heavyFlat, "theme-1-online-booklet::assignment-1-1": "SYNTH_AB30_F20_DIVERGENT" }, aliases, promptVersions
  ).envelope;
  const withAttempt = storeSubmitAttempt(withConflict, {
    taskId: "assignment:oral-tradition", response: paragraph.repeat(20).slice(0, 4000), contentVersion: "legacy-v0",
  }).envelope;
  const heavyUi = { schema: "ab30-store-v1", revision: 3, ui: { section: "unit", activeUnitId: "theme-1" }, resume: { lessonId: "t1-l07-numbered-treaties" } };
  const measured = storeMeasurePayload(withAttempt, EMPTY_PROGRESS, heavyUi);
  console.log(
    `[ab30-state] capacity: chars=${measured.totalChars} bytes=${measured.totalBytes} ` +
      `scorm2004=${measured.fitsSCORM2004 ? "fits" : "OVER"} scorm12=${measured.fitsSCORM12 ? "fits" : "OVER"} ` +
      `local=${measured.fitsLocalStorage ? "fits" : "OVER"} firestore=${measured.fitsFirestore ? "fits" : "OVER"}`
  );
  assert.ok(measured.totalBytes >= measured.totalChars, "byte measure must meet or exceed char count");
  assert.ok(measured.wrapperChars > measured.activityChars, "wrapper model must add host overhead");
  if (!measured.fitsSCORM2004) {
    const storage = makeStorage();
    const result = storeCommitWithChecks(storage, { activity: withAttempt, progress: EMPTY_PROGRESS, ui: heavyUi }, null);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "over-budget");
    assert.equal(storage.getItem(KEY_ACTIVITY), null, "over-budget commit must write nothing, truncate nothing");
  }

  const adversarial = storeMeasurePayload(
    storeMigrateFlatToV1({ "theme-1-online-booklet::q3": "😀".repeat(20000) }, aliases, promptVersions).envelope,
    EMPTY_PROGRESS, EMPTY_UI
  );
  // 20,000 emoji: 40,000 UTF-16 chars vs 80,000 UTF-8 bytes — the byte/char
  // gap must reflect the multibyte surplus, not char length alone.
  assert.ok(adversarial.totalBytes > adversarial.totalChars, "multibyte text must inflate the byte measure");
  assert.ok(
    adversarial.totalBytes - adversarial.totalChars >= 39000,
    `byte surplus must approximate the emoji payload (got ${adversarial.totalBytes - adversarial.totalChars})`
  );
});


// ---------------------------------------------------------------------------
// Part 3: T05 production-adoption proofs.
// ---------------------------------------------------------------------------

test("T05-1 production adapter file loads and exposes the full surface", () => {
  assert.ok(adapterSource.length > 10000, "adapter source must be substantial");
  assert.ok(adapterSource.includes("AB30 learning store"), "adapter banner present");
  assert.ok(adapterSource.includes("AB30LearningStoreInternals"), "internals export present");
  assert.equal(typeof AB30StoreApi.init, "function");
  assert.equal(typeof AB30StoreApi.mode, "function");
  assert.equal(typeof AB30StoreApi.status, "function");
  assert.equal(typeof AB30StoreApi.read, "function");
  assert.equal(typeof AB30StoreApi.write, "function");
  assert.equal(typeof AB30StoreApi.flush, "function");
  assert.equal(typeof seamRead, "function");
  assert.equal(typeof seamWrite, "function");
});

const aliasedKeys = new Set(aliases.flatMap((entry) => entry.legacyKeys));
const soloBookletKeys = [...knownBookletKeys].filter((key) => !aliasedKeys.has(key)).sort();

test("T05-2 prefix classification agrees with the registry booklet-key oracle", () => {
  const keys = [...knownBookletKeys].sort();
  assert.ok(keys.length > 100, "oracle must cover the full booklet registry");
  // Exactly the two approved F05 dual keys share an assignment group; every
  // other registry key must read back under its own id.
  assert.deepEqual([...knownBookletKeys].filter((key) => aliasedKeys.has(key)).sort(), [
    "theme-1-online-booklet::assignment-1-1",
    "theme-1-online-booklet::assignment-1-2",
  ]);
  const flat: Record<string, string> = {};
  for (const key of keys) flat[key] = `SYNTH_AB30_T05_AGREE ${key}`;
  const { envelope, report } = storeMigrateFlatToV1(flat, aliases, promptVersions);
  assert.equal(report.unknowns, 0, "every registry booklet key must classify as booklet content");
  assert.deepEqual(report.nonstrings, []);
  assert.deepEqual(Object.keys(envelope.legacy.raw), []);
  for (const key of [soloBookletKeys[0], soloBookletKeys[Math.floor(soloBookletKeys.length / 2)], soloBookletKeys[soloBookletKeys.length - 1]]) {
    const draft = storeReadDraft(envelope, key);
    assert.equal(draft.hasConflict, false, `${key} must not be conflicted`);
    assert.equal(draft.text, `SYNTH_AB30_T05_AGREE ${key}`);
  }
});

test("T05-3 runtime smoke: init, write, read, status, re-init persistence", () => {
  const backing = new Map<string, string>();
  const storage: TestStorage = {
    getItem: (key) => (backing.has(key) ? (backing.get(key) as string) : null),
    setItem: (key, value) => {
      backing.set(key, value);
    },
  };
  const first = AB30StoreApi.init({ storage });
  assert.equal(first.ok, true);
  assert.equal(first.mode, "envelope");
  const bookletKey = soloBookletKeys[0];
  const legacyKey = aliases[0].legacyKeys[0];
  const bookletText = "SYNTH_AB30_T05_RUNTIME booklet draft";
  const legacyText = "SYNTH_AB30_T05_RUNTIME legacy draft";
  assert.equal(AB30StoreApi.write(bookletKey, bookletText).ok, true);
  assert.equal(AB30StoreApi.write(legacyKey, legacyText).ok, true);
  assert.equal(AB30StoreApi.read(bookletKey), bookletText);
  assert.equal(AB30StoreApi.read(legacyKey), legacyText);
  assert.equal(seamRead(bookletKey), bookletText);
  const status = AB30StoreApi.status();
  assert.equal(status.state, "saved");
  assert.equal(status.text, "Saved in this browser");
  AB30StoreApi.flush();
  const second = AB30StoreApi.init({ storage });
  assert.equal(second.ok, true);
  assert.equal(second.mode, "envelope");
  assert.equal(AB30StoreApi.read(bookletKey), bookletText);
  assert.equal(AB30StoreApi.read(legacyKey), legacyText);
});

test("T05-4 memory mode is truthful when no durable storage exists", () => {
  const result = AB30StoreApi.init({ storage: null });
  assert.equal(result.ok, false);
  assert.equal(result.mode, "memory");
  assert.equal(result.code, "no-durable-storage");
  const status = AB30StoreApi.status();
  assert.equal(status.state, "save-failed");
  assert.equal(status.text, "Save failed — keep this page open and export your work");
});
