import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import {
  createStudioReleaseSteps,
  fingerprintStudioReleaseSource,
  reserveStudioReleasePort,
  runStudioReleaseSteps
} from "./lib/studio-release.js";
import { repoRoot } from "./lib/paths.js";

const execFileAsync = promisify(execFile);

function requestedPort() {
  const raw = process.env.STUDIO_RELEASE_PORT?.trim();
  if (!raw) return undefined;
  return Number(raw);
}

async function commandOutput(command: string, args: string[]) {
  const { stdout } = await execFileAsync(command, args, { cwd: repoRoot, encoding: "utf8" });
  return stdout.trim();
}

async function packageVersion(packageName: string) {
  const packagePath = path.join(repoRoot, "node_modules", ...packageName.split("/"), "package.json");
  const value = JSON.parse(await readFile(packagePath, "utf8")) as { version?: string };
  return value.version ?? "unknown";
}

async function main() {
  const startedAt = new Date();
  const reservation = await reserveStudioReleasePort(requestedPort());
  const port = reservation.port;
  let reservationReleased = false;
  try {
    const branch = await commandOutput("git", ["branch", "--show-current"]);
    const commit = await commandOutput("git", ["rev-parse", "HEAD"]);
    const workingTreeStatus = await commandOutput("git", ["status", "--short", "--untracked-files=all"]);
    const sourceStateBefore = await fingerprintStudioReleaseSource();
    const result = await runStudioReleaseSteps(createStudioReleaseSteps(port), undefined, {
      beforeStep: async (step) => {
        if (!reservationReleased && step.id === "inspection-e2e") {
          await reservation.release();
          reservationReleased = true;
        }
      }
    });
    const sourceStateAfter = await fingerprintStudioReleaseSource();
    const sourceChangedDuringRun = sourceStateBefore.digest !== sourceStateAfter.digest;
    const report = {
      schema: "canvas-helper-studio-release-v2",
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      branch,
      commit,
      workingTreeClean: workingTreeStatus.length === 0,
      workingTreeStatus: workingTreeStatus ? workingTreeStatus.split("\n").slice(0, 250) : [],
      sourceState: {
        algorithm: sourceStateBefore.algorithm,
        digest: sourceStateBefore.digest,
        fileCount: sourceStateBefore.files.length,
        paths: sourceStateBefore.sourcePaths
      },
      sourceChangedDuringRun,
      port,
      versions: {
        node: process.version,
        npm: await commandOutput("npm", ["--version"]),
        playwright: await packageVersion("@playwright/test"),
        vite: await packageVersion("vite"),
        tsx: await packageVersion("tsx")
      },
      ok: result.ok && !sourceChangedDuringRun,
      steps: result.results
    };
    const reportPath = path.join(repoRoot, ".runtime", "studio-release-report.json");
    await mkdir(path.dirname(reportPath), { recursive: true });
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(`\nStudio release report: ${path.relative(repoRoot, reportPath)}\n`);
    if (sourceChangedDuringRun) {
      console.error("Studio release source changed while the gate was running; rerun the gate on a stable tree.");
      process.exitCode = 1;
    } else if (!result.ok) {
      process.exitCode = result.results.at(-1)?.exitCode || 1;
    }
  } finally {
    if (!reservationReleased) await reservation.release();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
