import { spawnSync, execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AgentTask, assertByteBudget, MAX_WORKER_REPORT_BYTES, parseAgentTask } from "./lib/agent-delegation/contracts.js";
import { prepareContext } from "./lib/agent-delegation/context.js";
import { chooseRoute, museBillingBasis, museBillingEligible, museBillingVerified, museIsolationVerified, nativeLunaVerified, privateStateRoot, sharedControl, sparseDirectories } from "./lib/agent-delegation/router.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeRoot = path.join(repoRoot, ".runtime", "agent-delegation");

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function taskFromArg(): AgentTask {
  const file = option("--task");
  if (!file) throw new Error("A --task <json> file is required.");
  return parseAgentTask(JSON.parse(readFileSync(path.resolve(file), "utf8")));
}

function logEvent(event: Record<string, unknown>): void {
  mkdirSync(runtimeRoot, { recursive: true });
  appendFileSync(path.join(runtimeRoot, "events.jsonl"), JSON.stringify({ schemaVersion: 1, at: new Date().toISOString(), ...event }) + "\n");
}

function commandVersion(command: string, args: string[]): string | null {
  try {
    return execFileSync(command, args, { encoding: "utf8", timeout: 10_000 }).trim().split("\n")[0] || null;
  } catch {
    return null;
  }
}

function output(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

function lunaScoutObserved(): boolean {
  const file = path.join(runtimeRoot, "events.jsonl");
  if (!existsSync(file)) return false;
  try {
    return readFileSync(file, "utf8").split("\n").filter(Boolean).some((line) => {
      const event = JSON.parse(line) as Record<string, unknown>;
      return event.kind === "completion" && event.route === "luna" && event.accepted === true;
    });
  } catch { return false; }
}

async function main(): Promise<void> {
  const action = process.argv[2];
  if (action === "doctor") {
    const billingBasis = museBillingBasis();
    output({
      schemaVersion: 1,
      codexVersion: commandVersion("codex", ["--version"]),
      museVersion: commandVersion("muse", ["--version"]),
      pythonVersion: commandVersion("python3", ["--version"]),
      projectSolMediumConfigured: existsSync(path.join(repoRoot, ".codex", "config.toml")),
      lunaScoutConfigured: existsSync(path.join(repoRoot, ".codex", "agents", "luna-scout.toml")),
      lunaScoutObserved: lunaScoutObserved(),
      nativeLunaVerified: nativeLunaVerified(repoRoot),
      museBillingVerified: museBillingVerified(),
      museBillingEligible: museBillingEligible(),
      museBillingBasis: billingBasis,
      museWriteBoundaryVerified: museIsolationVerified(),
      museOutsideReadAllowed: true,
      meteredOverridePresent: Boolean(process.env.META_API_KEY || process.env.MODEL_API_KEY),
      providerCacheTelemetry: "unavailable",
      museCredentialBilling: billingBasis ?? "unverified",
      note: "This local doctor does not make provider requests or prove effective native host permissions."
    });
    return;
  }
  if (action === "status") {
    const shared = sharedControl("status");
    output({ schemaVersion: 1, mode: shared.mode, active: shared.active, cooldown: shared.cooldown, providerDisabled: shared.providerDisabled, lunaScoutConfigured: existsSync(path.join(repoRoot, ".codex", "agents", "luna-scout.toml")), lunaScoutObserved: lunaScoutObserved(), nativeLunaVerified: nativeLunaVerified(repoRoot), museBillingVerified: museBillingVerified(), museBillingEligible: museBillingEligible(), museBillingBasis: museBillingBasis(), museWriteBoundaryVerified: museIsolationVerified(), museOutsideReadAllowed: true, providerCacheTelemetry: null });
    return;
  }
  if (action === "mode") {
    const mode = process.argv[3];
    if (mode !== "off" && mode !== "auto") throw new Error("Usage: npm run agents:mode -- off|auto");
    const state = sharedControl("mode", ["--mode", mode]);
    logEvent({ kind: "mode", mode, active: Boolean(state.active) });
    output({ mode: state.mode, active: state.active, note: state.active ? "Active work remains quarantined until the host confirms shutdown and releases ownership." : "No active delegated worker." });
    return;
  }
  if (action === "report") {
    const file = path.join(runtimeRoot, "events.jsonl");
    const events = existsSync(file) ? readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as Record<string, unknown>) : [];
    const decisions = events.filter((event) => event.kind === "decision");
    const byRoute = Object.fromEntries(["local", "sol", "luna", "muse"].map((route) => [route, decisions.filter((event) => event.route === route).length]));
    const usagePath = path.join(repoRoot, ".runtime", "muse-delegate", "usage-windows.json");
    let museObservedUsage: unknown = null;
    if (existsSync(usagePath)) {
      try {
        const ledger = JSON.parse(readFileSync(usagePath, "utf8")) as Record<string, unknown>;
        const active = ledger.activeWindow as Record<string, unknown> | null;
        const completed = Array.isArray(ledger.completedWindows) ? ledger.completedWindows as Record<string, unknown>[] : [];
        museObservedUsage = { source: "launcher-ledger", activeWindow: active ? { startedAt: active.startedAt, totals: active.totals } : null, latestCompletedWindow: completed.length ? { startedAt: completed.at(-1)?.startedAt, endedReason: completed.at(-1)?.endedReason, totals: completed.at(-1)?.totals } : null };
      } catch { museObservedUsage = { source: "launcher-ledger", error: "unreadable" }; }
    }
    output({ schemaVersion: 1, recordedDecisions: decisions.length, byRoute, acceptedResults: events.filter((event) => event.kind === "completion" && event.accepted === true).length, museObservedUsage, leadPreparationMinutes: null, leadReviewMinutes: null, correctionMinutes: null, acceptedWorkUnits: null, elapsedMinutes: null, providerCacheTelemetry: null, subscriptionAllowanceTelemetry: null, note: "Local events and launcher ledger only; no subscription capacity or provider cache savings inferred." });
    return;
  }
  if (action === "complete") {
    const task = taskFromArg();
    const resultFile = option("--result");
    if (!resultFile) throw new Error("Completion requires --result <json>.");
    const raw = readFileSync(path.resolve(resultFile), "utf8");
    assertByteBudget(raw, MAX_WORKER_REPORT_BYTES, "Worker result");
    const result = JSON.parse(raw) as Record<string, unknown>;
    if (result.schemaVersion !== 1 || !Array.isArray(result.changedPaths) || !Array.isArray(result.checksRun) || typeof result.observedProvider !== "string") {
      throw new Error("Worker result is missing required versioned evidence fields.");
    }
    const checksPassed = result.checksRun.every((check) => typeof check === "object" && check !== null && (check as Record<string, unknown>).exitCode === 0);
    if (process.argv.includes("--accept") && !checksPassed) {
      throw new Error("A worker check failed or lacks an observed zero exit code; lead acceptance is unavailable.");
    }
    const current = sharedControl("status");
    const active = current.active as Record<string, unknown> | null;
    if (!active || active.taskId !== task.taskId || active.attemptId !== task.attemptId || result.ownerGeneration !== active.ownerGeneration || result.taskId !== task.taskId || result.attemptId !== task.attemptId) {
      throw new Error("Completion does not match the active task and ownership generation.");
    }
    const workerStopped = result.workerStopped === true;
    const leadAccepted = process.argv.includes("--accept");
    if (leadAccepted && !workerStopped) throw new Error("Cannot accept a result while worker shutdown is unconfirmed.");
    const outcome = leadAccepted && result.outcome === "completed" && result.verificationStatus === "accepted" ? "success" : "failure";
    const release = sharedControl("release", ["--token", String(active.token), "--worker-stopped", String(workerStopped), "--outcome", outcome]);
    const accepted = release.released === true && outcome === "success";
    logEvent({ kind: "completion", taskId: task.taskId, attemptId: task.attemptId, route: active.route, accepted, release });
    output({ accepted, release, note: accepted ? "Lead acceptance recorded." : "No acceptance; preserve evidence and follow the reported recovery action." });
    return;
  }
  if (action === "plan" || action === "run") {
    const task = taskFromArg();
    const context = await prepareContext(task, repoRoot, runtimeRoot);
    const decision = chooseRoute(task, context, repoRoot);
    logEvent({ kind: "decision", taskId: task.taskId, attemptId: task.attemptId, route: decision.route, reason: decision.reason, localContextCache: context.cache, packetBytes: Buffer.byteLength(context.packet, "utf8") });
    if (action === "plan" || decision.route === "local" || decision.route === "sol") {
      output({ schemaVersion: 1, taskId: task.taskId, attemptId: task.attemptId, decision, packetPath: context.packetPath, packetBytes: Buffer.byteLength(context.packet, "utf8"), localContextCache: context.cache, providerCacheTelemetry: null, baselineSha: context.baselineSha, dirtyOverlayDigest: context.dirtyOverlayDigest, relevantDirtyPaths: context.relevantDirtyPaths });
      return;
    }
    if (decision.route === "luna") {
      const admission = sharedControl("admit", ["--route", "luna", "--task-id", task.taskId, "--attempt-id", task.attemptId]);
      if (admission.admitted !== true) {
        output({ decision: { route: "sol", reason: String(admission.reason) }, admission });
        return;
      }
      output({ schemaVersion: 1, decision, admission, nativeAction: { role: "luna-scout", model: "gpt-6-luna", effort: "high", packetPath: context.packetPath, permissionEnforcement: "host-dependent", instruction: "The current Codex host spawns one Luna High scout with no-edit instructions and the exact packet, then checks the working-tree boundary before and after. Parent permissions may override the role's read-only setting. Return evidence to this lead and release admission; do not start a second Codex CLI session." } });
      return;
    }
    const launch = path.join(repoRoot, ".agents", "skills", "muse-delegate", "scripts", "launch.py");
    const args = [launch, "--workspace", repoRoot, "--prompt-file", context.packetPath, "--name", task.taskId, "--task-id", task.taskId, "--attempt-id", task.attemptId, "--state-root", privateStateRoot(), "--max-model-steps", "20", "--max-wall-clock-seconds", "900", "--disable-shell", "--automatic"];
    for (const allowed of task.allowedWritePaths) args.push("--allow-path", allowed);
    for (const directory of sparseDirectories(task, repoRoot)) args.push("--sparse-path", directory);
    const run = spawnSync("python3", args, { cwd: repoRoot, stdio: "inherit" });
    if (run.error) throw run.error;
    process.exitCode = run.status ?? 1;
    return;
  }
  throw new Error("Usage: agents.ts doctor|status|plan|run|complete|report|mode");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
