/**
 * AB30 submission-lifecycle suite — R03 (spec S-03/S-04).
 *
 * Executes the REAL learning-store.js in vm. Texts come from the package
 * fixture scripts/tests/fixtures/ab30-parity/v2-independent-responses.json
 * (exact package bytes). Import-free: plain `node --test`.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const storeSource = readFileSync(path.resolve(workspaceDir, "learning-store.js"), "utf8");
const fixture = JSON.parse(readFileSync(
  path.resolve("scripts", "tests", "fixtures", "ab30-parity", "v2-independent-responses.json"), "utf8")) as {
  first: string; revision: string; firstContentVersion: string;
};

const KEY_A = "aboriginal-studies-30.activityResponses";
const TASK = { id: "l7-independent-c", contentVersion: "ab30-v2-l7-independent-c-v1", sourceIds: ["src-7a"], stimulusId: "" };

function fakeStorage(seed?: Record<string, string>): any {
  const m = new Map<string, string>(Object.entries(seed || {}));
  return {
    getItem: (k: string): string | null => (m.has(String(k)) ? (m.get(String(k)) as string) : null),
    setItem: (k: string, v: string): void => { m.set(String(k), String(v)); },
    removeItem: (k: string): void => { m.delete(String(k)); },
  };
}

function boot(storage: any): any {
  const ctx: any = { console, localStorage: storage, TextEncoder };
  vm.createContext(ctx);
  vm.runInContext(storeSource, ctx, { filename: "learning-store.js" });
  vm.runInContext("AB30Store.init({ storage: localStorage });", ctx);
  return ctx;
}

function taskExpr(task: unknown): string {
  return `(${JSON.stringify(task)})`;
}

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

test("R03-SUB01: per-char draft, then first-save freezes the complete text", () => {
  const storage = fakeStorage();
  const ctx = boot(storage);
  for (let i = 1; i <= fixture.first.length; i++) {
    vm.runInContext(
      `AB30Store.writeDraft(${taskExpr(TASK)}, ${JSON.stringify(fixture.first.slice(0, i))})`, ctx);
  }
  const before = plain(vm.runInContext(
    `AB30Store.submissionsForTask(${JSON.stringify(TASK.id)})`, ctx) as unknown[]);
  assert.equal(before.length, 0, "a draft is not a submitted attempt");
  const res = plain(vm.runInContext(
    `AB30Store.submitFirstResponse(${taskExpr(TASK)}, 'cmd-1', ${JSON.stringify(fixture.first)})`, ctx) as any);
  assert.equal(res.ok, true, "first submit commits");
  assert.equal(res.submission.text, fixture.first, "frozen text is the complete first text");
  assert.equal(res.submission.parentAttemptId, null, "first has no parent");
  assert.equal(res.submission.evidenceKind, "first-before-comparison", "independent first");
  assert.equal(res.submission.task.contentVersion, TASK.contentVersion, "version pinned");
  assert.ok(typeof res.submission.observedAt === "string", "observed time recorded");
  // Draft stays editable and separate.
  vm.runInContext(`AB30Store.writeDraft(${taskExpr(TASK)}, ${JSON.stringify(fixture.first + " (edited)")})`, ctx);
  const after = plain(vm.runInContext(`AB30Store.submissionsForTask(${JSON.stringify(TASK.id)})`, ctx) as any[]);
  assert.equal(after.length, 1, "still one submission");
  assert.equal(after[0].text, fixture.first, "submission immutable under later drafts");
});

test("R03-SUB02: double command is idempotent; second first is refused", () => {
  const storage = fakeStorage();
  const ctx = boot(storage);
  const one = plain(vm.runInContext(
    `AB30Store.submitFirstResponse(${taskExpr(TASK)}, 'cmd-dup', 'TEXT-A')`, ctx) as any);
  const two = plain(vm.runInContext(
    `AB30Store.submitFirstResponse(${taskExpr(TASK)}, 'cmd-dup', 'TEXT-A')`, ctx) as any);
  assert.equal(two.ok, true, "retry succeeds");
  assert.equal(two.duplicate, true, "retry flagged duplicate");
  assert.equal(two.submission.id, one.submission.id, "same submission ID");
  const three = plain(vm.runInContext(
    `AB30Store.submitFirstResponse(${taskExpr(TASK)}, 'cmd-other', 'TEXT-B')`, ctx) as any);
  assert.equal(three.ok, false, "second first refused");
  assert.equal(three.code, "already-submitted", "honest code");
  assert.equal(three.submission.text, "TEXT-A", "original first preserved");
  const all = plain(vm.runInContext(`AB30Store.submissionsForTask(${JSON.stringify(TASK.id)})`, ctx) as any[]);
  assert.equal(all.length, 1, "exactly one first submission");
});

test("R03-SUB03: revision appends a complete linked text; parents enforced", () => {
  const storage = fakeStorage();
  const ctx = boot(storage);
  const first = plain(vm.runInContext(
    `AB30Store.submitFirstResponse(${taskExpr(TASK)}, 'cmd-1', ${JSON.stringify(fixture.first)})`, ctx) as any);
  const rev = plain(vm.runInContext(
    `AB30Store.submitRevision(${taskExpr(TASK)}, 'cmd-2', '${first.submission.id}', ${JSON.stringify(fixture.revision)})`, ctx) as any);
  assert.equal(rev.ok, true, "revision commits");
  assert.equal(rev.submission.text, fixture.revision, "revision text complete");
  assert.equal(rev.submission.parentAttemptId, first.submission.id, "linked to first");
  const bad = plain(vm.runInContext(
    `AB30Store.submitRevision(${taskExpr(TASK)}, 'cmd-3', 'sub:nope', 'X')`, ctx) as any);
  assert.equal(bad.ok, false, "unknown parent refused");
  assert.equal(bad.code, "unknown-parent");
  const other = plain(vm.runInContext(
    `AB30Store.submitRevision(${taskExpr({ ...TASK, id: "other-task" })} , 'cmd-4', '${first.submission.id}', 'X')`, ctx) as any);
  assert.equal(other.ok, false, "cross-task parent refused");
  assert.equal(other.code, "parent-mismatch");
  const all = plain(vm.runInContext(`AB30Store.submissionsForTask(${JSON.stringify(TASK.id)})`, ctx) as any[]);
  assert.equal(all.length, 2, "first + one revision");
  assert.equal(all[0].text, fixture.first, "first text untouched by revision");
});

test("R03-SUB04: exposure gates evidence kind; session-held marks unknown", () => {
  const storage = fakeStorage();
  const ctx = boot(storage);
  vm.runInContext(`AB30Store.recordExposure(${taskExpr(TASK)}, 'comparison-opened')`, ctx);
  const res = plain(vm.runInContext(
    `AB30Store.submitFirstResponse(${taskExpr(TASK)}, 'cmd-1', 'TEXT')`, ctx) as any);
  assert.equal(res.submission.evidenceKind, "review", "post-exposure first is review evidence");
  assert.deepEqual(res.submission.exposureIds, ["comparison-opened"], "exposure pinned");
  // Session-held path: no durable storage, exposure still recorded in session.
  const ctx2: any = { console, TextEncoder };
  vm.createContext(ctx2);
  vm.runInContext(storeSource, ctx2, { filename: "learning-store.js" });
  vm.runInContext("AB30Store.init({ storage: null });", ctx2);
  const held = plain(vm.runInContext(`AB30Store.recordExposure(${taskExpr(TASK)}, 'model-seen')`, ctx2) as any);
  assert.equal(held.ok, false, "no durable commit without storage");
  assert.equal(held.sessionHeld, true, "held in session");
});

test("R03-SUB05: failed submit appends nothing; candidate retained", () => {
  const ctx: any = { console, TextEncoder };
  vm.createContext(ctx);
  vm.runInContext(storeSource, ctx, { filename: "learning-store.js" });
  vm.runInContext("AB30Store.init({ storage: null });", ctx);
  const res = plain(vm.runInContext(
    `AB30Store.submitFirstResponse(${taskExpr(TASK)}, 'cmd-1', 'TEXT')`, ctx) as any);
  assert.equal(res.ok, false, "submit requires durable storage");
  assert.equal(res.candidate, "TEXT", "candidate returned for retry");
  const all = plain(vm.runInContext(`AB30Store.submissionsForTask(${JSON.stringify(TASK.id)})`, ctx) as unknown[]);
  assert.equal(all.length, 0, "nothing appended on failure");
});

test("R03-SUB06: submissions + exposure survive export/import round-trip", () => {
  const storage = fakeStorage();
  const ctx = boot(storage);
  vm.runInContext(`AB30Store.recordExposure(${taskExpr(TASK)}, 'comparison-opened')`, ctx);
  vm.runInContext(`AB30Store.submitFirstResponse(${taskExpr(TASK)}, 'cmd-1', 'FIRST')`, ctx);
  const pack = vm.runInContext("AB30Store.exportAllWork()", ctx) as any;
  assert.equal(pack.activity.submissions.length, 1, "export carries the submission");
  const storage2 = fakeStorage();
  const ctx2 = boot(storage2);
  vm.runInContext(`AB30Store.importAllWork(${JSON.stringify(plain(pack))})`, ctx2);
  const all = plain(vm.runInContext(`AB30Store.submissionsForTask(${JSON.stringify(TASK.id)})`, ctx2) as any[]);
  assert.equal(all.length, 1, "submission survives import");
  assert.equal(all[0].text, "FIRST", "text intact");
});
