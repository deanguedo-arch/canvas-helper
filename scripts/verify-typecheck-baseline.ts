import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { repoRoot } from "./lib/paths.js";

const execFileAsync = promisify(execFile);
const BASELINE_PATH = path.join(repoRoot, "config", "typecheck-baseline-v1.json");

type TypecheckDiagnostic = {
  file: string;
  code: string;
  message: string;
};

type TypecheckBaseline = {
  schemaVersion: 1;
  capturedAgainstRevision: string;
  diagnostics: TypecheckDiagnostic[];
};

function diagnosticKey(diagnostic: TypecheckDiagnostic) {
  return `${diagnostic.file}\u0000${diagnostic.code}\u0000${diagnostic.message}`;
}

function compareDiagnostics(left: TypecheckDiagnostic, right: TypecheckDiagnostic) {
  return diagnosticKey(left) < diagnosticKey(right) ? -1 : diagnosticKey(left) > diagnosticKey(right) ? 1 : 0;
}

export function parseNormalizedTypecheckDiagnostics(output: string) {
  const diagnostics: TypecheckDiagnostic[] = [];
  for (const line of output.replaceAll("\r\n", "\n").split("\n")) {
    const match = line.match(/^(.+)\(\d+,\d+\): error (TS\d+):\s*(.+)$/);
    if (!match) continue;
    diagnostics.push({
      file: match[1]!.split(path.sep).join("/"),
      code: match[2]!,
      message: match[3]!.replace(/\s+/g, " ").trim()
    });
  }
  return diagnostics.sort(compareDiagnostics);
}

async function runTypecheck() {
  const tsc = path.join(repoRoot, "node_modules", "typescript", "bin", "tsc");
  try {
    const result = await execFileAsync(process.execPath, [tsc, "--noEmit", "--pretty", "false"], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024
    });
    return `${result.stdout}${result.stderr}`;
  } catch (error) {
    const result = error as { stdout?: string; stderr?: string };
    return `${result.stdout ?? ""}${result.stderr ?? ""}`;
  }
}

async function git(args: string[]) {
  const { stdout } = await execFileAsync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024
  });
  return stdout.trim();
}

async function firstResolvableRevision(candidates: readonly string[]) {
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      await git(["rev-parse", "--verify", `${candidate}^{commit}`]);
      return candidate;
    } catch {}
  }
  return null;
}

async function changedFilesForBaseline(baseline: TypecheckBaseline) {
  const base = await firstResolvableRevision([
    process.env.TYPECHECK_BASELINE_DIFF_BASE ?? "",
    baseline.capturedAgainstRevision,
    process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "",
    "origin/codex/studio-roadmap-phases",
    "codex/studio-roadmap-phases"
  ]);
  if (!base) {
    throw new Error("Typecheck baseline cannot identify the PR base. Set TYPECHECK_BASELINE_DIFF_BASE to the reviewed base revision.");
  }
  const output = await git(["diff", "--name-only", "--no-renames", `${base}...HEAD`]);
  return new Set(output.split("\n").filter(Boolean));
}

function printDifference(label: string, entries: TypecheckDiagnostic[]) {
  if (!entries.length) return;
  console.error(`${label}:`);
  for (const entry of entries) console.error(`- ${entry.file} ${entry.code}: ${entry.message}`);
}

async function main() {
  const baseline = JSON.parse(await readFile(BASELINE_PATH, "utf8")) as TypecheckBaseline;
  if (
    baseline.schemaVersion !== 1 ||
    typeof baseline.capturedAgainstRevision !== "string" ||
    !baseline.capturedAgainstRevision ||
    !Array.isArray(baseline.diagnostics)
  ) {
    throw new Error("The frozen typecheck baseline is invalid.");
  }
  const expected = [...baseline.diagnostics].sort(compareDiagnostics);
  const actual = parseNormalizedTypecheckDiagnostics(await runTypecheck());
  const expectedKeys = new Set(expected.map(diagnosticKey));
  const actualKeys = new Set(actual.map(diagnosticKey));
  const added = actual.filter((entry) => !expectedKeys.has(diagnosticKey(entry)));
  const removed = expected.filter((entry) => !actualKeys.has(diagnosticKey(entry)));
  const changedFiles = await changedFilesForBaseline(baseline);
  const baselineInChangedFiles = actual.filter((entry) => changedFiles.has(entry.file));

  if (added.length || removed.length || baselineInChangedFiles.length) {
    printDifference("Added or changed diagnostics", added);
    printDifference("Removed baseline diagnostics", removed);
    printDifference("Baseline diagnostics in files changed since the frozen baseline capture", baselineInChangedFiles);
    throw new Error("Frozen typecheck baseline verification failed. Raw typecheck remains expected to exit 2 with the reviewed legacy diagnostics.");
  }
  console.log(`Frozen typecheck baseline verified: ${actual.length} established diagnostics; no diagnostics in files changed since baseline capture.`);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
