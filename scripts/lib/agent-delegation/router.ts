import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { AgentTask } from "./contracts.js";
import { ContextPreparation } from "./context.js";

export type Route = "local" | "sol" | "luna" | "muse";
export interface Decision { route: Route; reason: string; }

export function privateStateRoot(): string {
  return process.env.CANVAS_HELPER_AGENT_STATE_ROOT || path.join(os.homedir(), ".local", "state", "canvas-helper", "agent-router", "default");
}

export function sharedControl(action: string, args: string[] = [], root = privateStateRoot()): Record<string, unknown> {
  const script = path.resolve(".agents/skills/muse-delegate/scripts/shared_state.py");
  const output = execFileSync("python3", [script, action, "--state-root", root, ...args], { encoding: "utf8" });
  return JSON.parse(output) as Record<string, unknown>;
}

function readProof(file: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function nativeLunaVerified(repoRoot: string, stateRoot = privateStateRoot()): boolean {
  const proof = readProof(path.join(stateRoot, "native-host-proof.json"));
  if (!proof || proof.schemaVersion !== 1 || proof.evidenceSource !== "host-runtime-event" || proof.observedModel !== "gpt-6-luna" || proof.observedEffort !== "high" || proof.observedReadOnly !== true) return false;
  if (typeof proof.observedAt !== "string" || !Number.isFinite(Date.parse(proof.observedAt))) return false;
  const age = Date.now() - Date.parse(proof.observedAt);
  if (age < 0 || age >= 24 * 60 * 60 * 1_000) return false;
  let codexVersion: string;
  try {
    codexVersion = execFileSync("codex", ["--version"], { encoding: "utf8", timeout: 10_000 }).trim();
  } catch {
    return false;
  }
  if (proof.codexVersion !== codexVersion) return false;
  const configPath = path.join(repoRoot, ".codex", "agents", "luna-scout.toml");
  if (!existsSync(configPath)) return false;
  return proof.roleSha256 === createHash("sha256").update(readFileSync(configPath)).digest("hex");
}

export function museBillingBasis(stateRoot = privateStateRoot()): string | null {
  if (process.env.META_API_KEY || process.env.MODEL_API_KEY) return null;
  const proof = readProof(path.join(stateRoot, "muse-billing-proof.json"));
  if (!proof || proof.schemaVersion !== 1 || (proof.source !== "supported-provider-account-status" && proof.source !== "user-confirmed-cli-subscription") || proof.subscriptionActive !== true || proof.credentialSource !== "muse-code-login") return null;
  if (typeof proof.observedAt !== "string" || !Number.isFinite(Date.parse(proof.observedAt))) return null;
  const age = Date.now() - Date.parse(proof.observedAt);
  if (proof.source === "user-confirmed-cli-subscription") {
    try {
      const version = execFileSync("muse", ["--version"], { encoding: "utf8", timeout: 10_000 }).trim();
      return proof.museVersion === version && age >= 0 ? proof.source : null;
    } catch { return null; }
  }
  return age >= 0 && age < 24 * 60 * 60 * 1_000 ? proof.source : null;
}

export function museBillingVerified(stateRoot = privateStateRoot()): boolean {
  return museBillingBasis(stateRoot) === "supported-provider-account-status";
}

export function museBillingEligible(stateRoot = privateStateRoot()): boolean {
  return museBillingBasis(stateRoot) !== null;
}

export function museIsolationVerified(stateRoot = privateStateRoot()): boolean {
  const proof = readProof(path.join(stateRoot, "muse-isolation-proof.json"));
  if (!proof || proof.schemaVersion !== 1 || proof.source !== "live-disposable-boundary-check" || proof.profile !== "muse-file-tools-only-v1" || proof.externalReadAllowed !== true || proof.sparseSourceAbsent !== true || proof.writeOutsideDenied !== true || proof.descendantStopVerified !== true) return false;
  if (typeof proof.observedAt !== "string" || !Number.isFinite(Date.parse(proof.observedAt))) return false;
  const age = Date.now() - Date.parse(proof.observedAt);
  let version: string;
  try { version = execFileSync("muse", ["--version"], { encoding: "utf8", timeout: 10_000 }).trim(); }
  catch { return false; }
  return proof.museVersion === version && age >= 0 && age < 30 * 24 * 60 * 60 * 1_000;
}

export function sparseDirectories(task: AgentTask, repoRoot: string): string[] {
  const directories = new Set<string>();
  for (const relative of [...task.allowedReadPaths, ...task.allowedWritePaths, ...task.contextSources]) {
    const absolute = path.join(repoRoot, relative);
    let directory = path.posix.dirname(relative);
    try { if (statSync(absolute).isDirectory()) directory = relative; }
    catch { /* A new file uses its existing parent directory. */ }
    if (directory !== ".") directories.add(directory);
  }
  return [...directories].sort();
}

export function chooseRoute(task: AgentTask, context: ContextPreparation, repoRoot: string, stateRoot = privateStateRoot()): Decision {
  const shared = sharedControl("status", [], stateRoot);
  if (shared.mode === "off") return { route: "sol", reason: "routing_off" };
  if (shared.active) return { route: "sol", reason: "worker_active_or_quarantined" };
  if (task.taskFamily === "deterministic") return { route: "local", reason: "existing_script_or_direct_command" };
  if (task.taskFamily === "small-edit" || task.taskFamily === "high-consequence" || task.consequenceLevel === "high") return { route: "sol", reason: "small_or_high_consequence" };
  if (!context.projectContextAvailable) return { route: "sol", reason: "authoring_context_unavailable" };
  if (task.privacyScope === "sensitive") return { route: "sol", reason: "sensitive_scope" };
  if (task.taskFamily === "investigation") {
    if (task.allowedWritePaths.length) return { route: "sol", reason: "investigation_has_write_boundary" };
    return { route: "luna", reason: "bounded_read_only_investigation" };
  }
  if (!task.allowedWritePaths.length) return { route: "sol", reason: "missing_write_boundary" };
  if (context.relevantDirtyPaths.some((file) => task.allowedWritePaths.some((root) => file === root || file.startsWith(root + "/")))) {
    return { route: "sol", reason: "dirty_write_boundary" };
  }
  if (!museBillingEligible(stateRoot)) return { route: "sol", reason: "muse_billing_unverified" };
  if (!museIsolationVerified(stateRoot)) return { route: "sol", reason: "muse_isolation_unverified" };
  if (!sparseDirectories(task, repoRoot).length) return { route: "sol", reason: "sparse_boundary_unavailable" };
  if (shared.providerDisabled) return { route: "sol", reason: "muse_disabled" };
  const cooldown = shared.cooldown as { until?: string } | null;
  if (cooldown?.until && Date.now() < Date.parse(cooldown.until)) return { route: "sol", reason: "muse_cooldown" };
  return { route: "muse", reason: "qualified_clean_bulk_task" };
}
