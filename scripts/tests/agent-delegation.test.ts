import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtempSync, rmSync } from "node:fs";
import test from "node:test";
import { assertByteBudget, MAX_WORKER_PACKET_BYTES, MAX_WORKER_REPORT_BYTES, normalizeTaskPath, parseAgentTask } from "../lib/agent-delegation/contracts.js";
import { prepareContext } from "../lib/agent-delegation/context.js";
import { chooseRoute, museBillingVerified, nativeLunaVerified, sharedControl } from "../lib/agent-delegation/router.js";

function git(root: string, ...args: string[]): void {
  execFileSync("git", ["-C", root, ...args], { stdio: "ignore" });
}

function fixture(): { root: string; state: string; clean: () => void } {
  const root = mkdtempSync(path.join(tmpdir(), "canvas-agent-test-"));
  mkdirSync(path.join(root, "docs", "ops"), { recursive: true });
  writeFileSync(path.join(root, "AGENTS.md"), "Repo rules.\n");
  writeFileSync(path.join(root, "docs", "ops", "FAST_PATHS.md"), "Fast paths.\n");
  writeFileSync(path.join(root, "source.txt"), "original\n");
  writeFileSync(path.join(root, "other.txt"), "unrelated\n");
  git(root, "init", "-q");
  git(root, "config", "user.name", "Fixture");
  git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "add", ".");
  git(root, "commit", "-qm", "fixture");
  return { root, state: path.join(root, ".private-state"), clean: () => rmSync(root, { recursive: true, force: true }) };
}

function task(overrides: Record<string, unknown> = {}) {
  return parseAgentTask({
    schemaVersion: 1, taskId: "fixture", attemptId: "a1", workflow: "conversion", mode: "build",
    objective: "Inspect the selected source.", taskFamily: "investigation", consequenceLevel: "normal",
    allowedReadPaths: ["source.txt"], allowedWritePaths: [], contextSources: ["source.txt"],
    acceptanceCriteria: ["Report evidence."], requiredChecks: [], deferredChecks: ["rollout E2E"],
    prohibitedChanges: ["No edits."], privacyScope: "repository", ...overrides
  });
}

test("E02 unchanged dependencies reuse byte-identical stable context while task delta changes", async () => {
  const fx = fixture();
  try {
    const first = await prepareContext(task(), fx.root);
    const second = await prepareContext(task({ objective: "Inspect the same source again.", attemptId: "a2" }), fx.root);
    assert.equal(first.cache, "miss");
    assert.equal(second.cache, "hit");
    assert.equal(first.stableText, second.stableText);
    assert.notEqual(first.packet, second.packet);
  } finally { fx.clean(); }
});

test("E03/E04 relevant changes invalidate context; unrelated changes do not", async () => {
  const fx = fixture();
  try {
    const first = await prepareContext(task(), fx.root);
    writeFileSync(path.join(fx.root, "other.txt"), "changed\n");
    const unrelated = await prepareContext(task(), fx.root);
    assert.equal(unrelated.cache, "hit");
    assert.equal(unrelated.dependencyDigest, first.dependencyDigest);
    writeFileSync(path.join(fx.root, "source.txt"), "changed\n");
    const relevant = await prepareContext(task(), fx.root);
    assert.equal(relevant.cache, "miss");
    assert.notEqual(relevant.dependencyDigest, first.dependencyDigest);
    assert.deepEqual(relevant.relevantDirtyPaths, ["source.txt"]);
  } finally { fx.clean(); }
});

test("E05/E10 overflow refuses and corrupt cache recomputes", async () => {
  const fx = fixture();
  try {
    const first = await prepareContext(task(), fx.root);
    const cachePath = path.join(fx.root, ".runtime", "agent-delegation", "context", `${first.dependencyDigest}.json`);
    writeFileSync(cachePath, "{bad json\n");
    assert.equal((await prepareContext(task(), fx.root)).cache, "miss");
    assert.throws(() => assertByteBudget("é".repeat(4_001), MAX_WORKER_PACKET_BYTES, "packet"), /UTF-8 bytes/);
    assert.throws(() => assertByteBudget("é".repeat(2_001), MAX_WORKER_REPORT_BYTES, "report"), /UTF-8 bytes/);
  } finally { fx.clean(); }
});

test("E07/E08 local cache evidence never implies provider cache telemetry", async () => {
  const fx = fixture();
  try {
    const context = await prepareContext(task(), fx.root);
    assert.equal(context.cache, "miss");
    assert.equal(typeof context.dependencyDigest, "string");
    assert.equal(museBillingVerified(fx.state), false);
  } finally { fx.clean(); }
});

test("E11/E12 tiny or high-consequence tasks remain local or with Sol", async () => {
  const fx = fixture();
  try {
    const context = await prepareContext(task(), fx.root);
    assert.equal(chooseRoute(task({ taskFamily: "deterministic" }), context, fx.root, fx.state).route, "local");
    assert.equal(chooseRoute(task({ taskFamily: "small-edit" }), context, fx.root, fx.state).route, "sol");
    assert.equal(chooseRoute(task({ consequenceLevel: "high" }), context, fx.root, fx.state).route, "sol");
  } finally { fx.clean(); }
});

test("E13/E15 Luna investigation selects explicit host action and common admission blocks Muse", async () => {
  const fx = fixture();
  try {
    mkdirSync(path.join(fx.root, ".codex", "agents"), { recursive: true });
    const role = path.join(fx.root, ".codex", "agents", "luna-scout.toml");
    writeFileSync(role, "name = 'luna-scout'\n");
    mkdirSync(fx.state, { recursive: true });
    const codexVersion = execFileSync("codex", ["--version"], { encoding: "utf8" }).trim();
    writeFileSync(path.join(fx.state, "native-host-proof.json"), JSON.stringify({ schemaVersion: 1, evidenceSource: "host-runtime-event", observedAt: new Date().toISOString(), codexVersion, observedModel: "gpt-6-luna", observedEffort: "high", observedReadOnly: true, roleSha256: createHash("sha256").update(readFileSync(role)).digest("hex") }));
    assert.equal(nativeLunaVerified(fx.root, fx.state), true);
    const context = await prepareContext(task(), fx.root);
    assert.equal(chooseRoute(task(), context, fx.root, fx.state).route, "luna");
    rmSync(path.join(fx.state, "native-host-proof.json"));
    assert.equal(chooseRoute(task(), context, fx.root, fx.state).route, "luna");
    assert.equal(chooseRoute(task({ allowedWritePaths: ["source.txt"] }), context, fx.root, fx.state).route, "sol");
    const admitted = sharedControl("admit", ["--route", "luna", "--task-id", "fixture", "--attempt-id", "a1"], fx.state);
    assert.equal(admitted.admitted, true);
    assert.equal(sharedControl("admit", ["--route", "muse", "--task-id", "other", "--attempt-id", "a1"], fx.state).admitted, false);
    assert.equal(sharedControl("release", ["--token", String(admitted.token), "--worker-stopped", "true", "--outcome", "success"], fx.state).released, true);
  } finally { fx.clean(); }
});

test("E16/E24 unverified Muse billing and dirty write boundary select Sol", async () => {
  const fx = fixture();
  try {
    const bulk = task({ taskFamily: "bulk-implementation", allowedWritePaths: ["source.txt"] });
    const context = await prepareContext(bulk, fx.root);
    assert.equal(chooseRoute(bulk, context, fx.root, fx.state).reason, "muse_billing_unverified");
    writeFileSync(path.join(fx.root, "source.txt"), "dirty\n");
    const dirty = await prepareContext(bulk, fx.root);
    assert.equal(chooseRoute(bulk, dirty, fx.root, fx.state).reason, "dirty_write_boundary");
  } finally { fx.clean(); }
});

test("qualified clean non-sensitive bulk task selects file-tools-only Muse profile", async () => {
  const fx = fixture();
  try {
    mkdirSync(path.join(fx.root, "module"));
    writeFileSync(path.join(fx.root, "module", "source.txt"), "fixture\n");
    git(fx.root, "add", "module/source.txt");
    git(fx.root, "commit", "-qm", "module fixture");
    mkdirSync(fx.state, { recursive: true });
    const museVersion = execFileSync("muse", ["--version"], { encoding: "utf8" }).trim();
    writeFileSync(path.join(fx.state, "muse-billing-proof.json"), JSON.stringify({ schemaVersion: 1, source: "user-confirmed-cli-subscription", subscriptionActive: true, credentialSource: "muse-code-login", observedAt: new Date().toISOString(), museVersion }));
    writeFileSync(path.join(fx.state, "muse-isolation-proof.json"), JSON.stringify({ schemaVersion: 1, source: "live-disposable-boundary-check", profile: "muse-file-tools-only-v1", observedAt: new Date().toISOString(), museVersion, externalReadAllowed: true, sparseSourceAbsent: true, writeOutsideDenied: true, descendantStopVerified: true }));
    const bulk = task({ taskFamily: "bulk-implementation", allowedReadPaths: ["module/source.txt"], allowedWritePaths: ["module/source.txt"], contextSources: ["module/source.txt"] });
    const context = await prepareContext(bulk, fx.root);
    assert.equal(chooseRoute(bulk, context, fx.root, fx.state).route, "muse");
    assert.equal(chooseRoute(task({ ...bulk, privacyScope: "sensitive" }), context, fx.root, fx.state).route, "sol");
  } finally { fx.clean(); }
});

test("E27 malformed and symlink paths are rejected before context assembly", async () => {
  const fx = fixture();
  try {
    for (const invalid of ["../outside", "/absolute", "a/../b", ".git/config", "a\\b"]) {
      assert.throws(() => normalizeTaskPath(invalid));
    }
    assert.throws(() => normalizeTaskPath(".env.local"), /Sensitive/);
    assert.throws(() => task({ allowedWritePaths: ["projects/example/raw/index.html"] }), /Protected/);
    symlinkSync(path.join(os.tmpdir(), "outside-secret"), path.join(fx.root, "linked.txt"));
    await assert.rejects(() => prepareContext(task({ allowedReadPaths: ["linked.txt"], contextSources: ["linked.txt"] }), fx.root), /regular file/);
  } finally { fx.clean(); }
});

test("E28 sensitive scope stays with Sol and E30 deferred checks remain in packet", async () => {
  const fx = fixture();
  try {
    const sensitive = task({ privacyScope: "sensitive" });
    const context = await prepareContext(sensitive, fx.root);
    assert.equal(chooseRoute(sensitive, context, fx.root, fx.state).reason, "sensitive_scope");
    assert.match(context.packet, /rollout E2E/);
  } finally { fx.clean(); }
});

test("E32 task baseline mismatch refuses stale packet", async () => {
  const fx = fixture();
  try {
    await assert.rejects(() => prepareContext(task({ baselineSha: "0".repeat(40) }), fx.root), /baselineSha differs/);
  } finally { fx.clean(); }
});


test("adopted build continuation refuses before generic worker fallback or packet writes", async () => {
  const fx = fixture();
  try {
    const meta = path.join(fx.root, "projects", "biology-sample", "meta");
    mkdirSync(meta, { recursive: true });
    writeFileSync(path.join(meta, "exemplar-transfer.json"), JSON.stringify({ schemaVersion: 1 }));
    await assert.rejects(prepareContext(task({ projectSlug: "biology-sample" }), fx.root), /Incomplete exemplar-transfer contract/);
    assert.equal(existsSync(path.join(fx.root, ".runtime", "agent-delegation", "tasks")), false);
  } finally { fx.clean(); }
});
