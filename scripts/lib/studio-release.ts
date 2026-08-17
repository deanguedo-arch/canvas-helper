import { spawn, type SpawnOptions } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, opendir, readFile, readlink } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";

import { repoRoot } from "./paths.js";

export type StudioReleaseStep = {
  id: "focused" | "build" | "inspection-e2e" | "platform-smoke" | "project-contract";
  label: string;
  executable: string;
  args: string[];
  environment?: Record<string, string>;
  reportPath?: string;
};

export type StudioReleaseStepResult = {
  id: StudioReleaseStep["id"];
  label: string;
  command: string;
  exitCode: number;
  durationMs: number;
  passed: number | null;
  failed: number | null;
  skipped: number | null;
};

const nodeModules = path.join(repoRoot, "node_modules");
const tsxCli = path.join(nodeModules, "tsx", "dist", "cli.mjs");
const viteCli = path.join(nodeModules, "vite", "bin", "vite.js");
const playwrightCli = path.join(nodeModules, "@playwright", "test", "cli.js");

export const STUDIO_RELEASE_SOURCE_PATHS = [
  ".github/workflows/studio-direct-editing.yml",
  ".gitignore",
  "ARCHITECTURE.md",
  "CONTRIBUTING.md",
  "README.md",
  "app",
  "docs/ops/FAST_PATHS.md",
  "docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md",
  "docs/releases",
  "e2e",
  "package-lock.json",
  "package.json",
  "projects/e2e-fixture",
  "projects/e2e-studio-secondary",
  "scripts",
  "tsconfig.json"
] as const;

const STUDIO_RELEASE_FINGERPRINT_EXCLUSIONS = new Set([
  "e2e/.runtime"
]);

async function appendStudioReleaseSource(
  hash: ReturnType<typeof createHash>,
  absolutePath: string,
  relativePath: string,
  files: string[]
) {
  const metadata = await lstat(absolutePath, { bigint: false }).catch(() => null);
  if (!metadata) {
    hash.update(`missing\0${relativePath}\0`);
    return;
  }
  if (metadata.isDirectory()) {
    const directory = await opendir(absolutePath);
    const entries: string[] = [];
    for await (const entry of directory) entries.push(entry.name);
    entries.sort((left, right) => left.localeCompare(right, "en"));
    for (const entry of entries) {
      const childRelativePath = `${relativePath}/${entry}`;
      if (STUDIO_RELEASE_FINGERPRINT_EXCLUSIONS.has(childRelativePath)) continue;
      await appendStudioReleaseSource(
        hash,
        path.join(absolutePath, entry),
        childRelativePath,
        files
      );
    }
    return;
  }
  if (metadata.isSymbolicLink()) {
    hash.update(`symlink\0${relativePath}\0${await readlink(absolutePath)}\0`);
    files.push(relativePath);
    return;
  }
  if (!metadata.isFile()) return;
  hash.update(`file\0${relativePath}\0`);
  hash.update(await readFile(absolutePath));
  hash.update("\0");
  files.push(relativePath);
}

export async function fingerprintStudioReleaseSource(
  root = repoRoot,
  sourcePaths: readonly string[] = STUDIO_RELEASE_SOURCE_PATHS
) {
  const hash = createHash("sha256");
  const files: string[] = [];
  for (const sourcePath of [...sourcePaths].sort((left, right) => left.localeCompare(right, "en"))) {
    await appendStudioReleaseSource(hash, path.join(root, sourcePath), sourcePath, files);
  }
  return {
    algorithm: "sha256" as const,
    digest: hash.digest("hex"),
    files,
    sourcePaths: [...sourcePaths].sort((left, right) => left.localeCompare(right, "en"))
  };
}

export const STUDIO_FOCUSED_TEST_FILES = [
  "scripts/tests/preview-route.test.ts",
  "scripts/tests/preview-inspection.test.ts",
  "scripts/tests/preview-security.test.ts",
  "scripts/tests/review-screenshots.test.ts",
  "scripts/tests/codex-packet.test.ts",
  "scripts/tests/course-build-brief.test.ts",
  "scripts/tests/course-edit-storage.test.ts",
  "scripts/tests/course-editing.test.ts",
  "scripts/tests/codex-course.test.ts",
  "scripts/tests/course-onboarding.test.ts",
  "scripts/tests/studio-project-html-scan.test.ts",
  "scripts/tests/studio-project-continuity.test.ts",
  "scripts/tests/studio-incoming-refresh.test.ts",
  "scripts/tests/studio-quality.test.ts",
  "scripts/tests/inspection-draft.test.ts",
  "scripts/tests/studio-release-notes.test.ts",
  "scripts/tests/studio-architecture.test.ts",
  "scripts/tests/studio-release-runner.test.ts"
] as const;

export function createStudioReleaseSteps(port: number): StudioReleaseStep[] {
  const e2eEnvironment = {
    E2E_STUDIO_PORT: String(port),
  };
  const playwrightReport = (id: StudioReleaseStep["id"]) => path.join(
    repoRoot,
    ".runtime",
    `studio-release-playwright-${id}.json`
  );
  return [
    {
      id: "focused",
      label: "Focused Studio contracts",
      executable: process.execPath,
      args: [tsxCli, "--test", ...STUDIO_FOCUSED_TEST_FILES]
    },
    {
      id: "build",
      label: "Studio production build",
      executable: process.execPath,
      args: [viteCli, "build", "--config", "app/studio/vite.config.ts"]
    },
    {
      id: "inspection-e2e",
      label: "Complete Studio inspection E2E",
      executable: process.execPath,
      args: [playwrightCli, "test", "-c", "e2e/playwright.release.config.ts", "e2e/specs/inspection.spec.ts"],
      environment: { ...e2eEnvironment, STUDIO_RELEASE_PLAYWRIGHT_REPORT: playwrightReport("inspection-e2e") },
      reportPath: playwrightReport("inspection-e2e")
    },
    {
      id: "platform-smoke",
      label: "Platform smoke",
      executable: process.execPath,
      args: [playwrightCli, "test", "-c", "e2e/playwright.release.config.ts", "--grep", "@smoke"],
      environment: { ...e2eEnvironment, STUDIO_RELEASE_PLAYWRIGHT_REPORT: playwrightReport("platform-smoke") },
      reportPath: playwrightReport("platform-smoke")
    },
    {
      id: "project-contract",
      label: "Strict project contract",
      executable: process.execPath,
      args: [playwrightCli, "test", "-c", "e2e/playwright.release.config.ts", "e2e/specs/core-project-contract.spec.ts", "--grep", "@project"],
      environment: {
        ...e2eEnvironment,
        STUDIO_RELEASE_PLAYWRIGHT_REPORT: playwrightReport("project-contract"),
        E2E_PROJECT_SLUG: "e2e-fixture",
        E2E_PROJECT_MODE: "project-contract"
      },
      reportPath: playwrightReport("project-contract")
    }
  ];
}

export function summarizeStudioReleaseOutput(step: StudioReleaseStep, output: string) {
  if (step.id === "build") {
    return {
      passed: /built in|✓ built/u.test(output) ? 1 : null,
      failed: null,
      skipped: null
    };
  }
  const nodePassed = output.match(/(?:^|\n)[ℹ#]\s+pass\s+(\d+)/u);
  const nodeFailed = output.match(/(?:^|\n)[ℹ#]\s+fail\s+(\d+)/u);
  const nodeSkipped = output.match(/(?:^|\n)[ℹ#]\s+skipped\s+(\d+)/u);
  if (nodePassed || nodeFailed || nodeSkipped) {
    return {
      passed: Number(nodePassed?.[1] ?? 0),
      failed: Number(nodeFailed?.[1] ?? 0),
      skipped: Number(nodeSkipped?.[1] ?? 0)
    };
  }
  const playwrightPassed = output.match(/(\d+) passed/u);
  const playwrightFailed = output.match(/(\d+) failed/u);
  const playwrightSkipped = output.match(/(\d+) skipped/u);
  return {
    passed: playwrightPassed ? Number(playwrightPassed[1]) : null,
    failed: playwrightFailed ? Number(playwrightFailed[1]) : null,
    skipped: playwrightSkipped ? Number(playwrightSkipped[1]) : null
  };
}

export async function assertStudioReleasePortAvailable(port: number) {
  if (!Number.isInteger(port) || port < 1_024 || port > 65_535) {
    throw new Error(`Studio release port must be an integer from 1024 to 65535; received ${port}.`);
  }
  await new Promise<void>((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", () => reject(new Error(`Studio release port ${port} is already in use.`)));
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });
}

export async function reserveStudioReleasePort(preferred?: number) {
  if (preferred !== undefined && (!Number.isInteger(preferred) || preferred < 1_024 || preferred > 65_535)) {
    throw new Error(`Studio release port must be an integer from 1024 to 65535; received ${preferred}.`);
  }
  const server = createServer();
  server.unref();
  const port = await new Promise<number>((resolve, reject) => {
    server.once("error", () => reject(new Error(
      preferred === undefined
        ? "Canvas Helper could not reserve an isolated Studio release port."
        : `Studio release port ${preferred} is already in use.`
    )));
    server.listen({ host: "127.0.0.1", port: preferred ?? 0, exclusive: true }, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Canvas Helper could not reserve an isolated Studio release port."));
        return;
      }
      resolve(address.port);
    });
  });
  let released = false;
  return {
    port,
    async release() {
      if (released) return;
      released = true;
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  };
}

export type StudioReleaseSpawn = (
  executable: string,
  args: string[],
  options: SpawnOptions
) => Promise<{ exitCode: number; output: string }>;

export const spawnStudioReleaseStep: StudioReleaseSpawn = async (executable, args, options) => (
  new Promise((resolve, reject) => {
    const child = spawn(executable, args, { ...options, stdio: ["inherit", "pipe", "pipe"] });
    let output = "";
    const forward = (chunk: Buffer, target: NodeJS.WriteStream) => {
      const text = chunk.toString();
      output += text;
      target.write(text);
    };
    child.stdout?.on("data", (chunk: Buffer) => forward(chunk, process.stdout));
    child.stderr?.on("data", (chunk: Buffer) => forward(chunk, process.stderr));
    child.once("error", reject);
    child.once("exit", (code) => resolve({ exitCode: code ?? 1, output }));
  })
);

export async function runStudioReleaseSteps(
  steps: StudioReleaseStep[],
  run: StudioReleaseSpawn = spawnStudioReleaseStep,
  options: { beforeStep?: (step: StudioReleaseStep) => Promise<void> } = {}
) {
  const results: StudioReleaseStepResult[] = [];
  for (const step of steps) {
    await options.beforeStep?.(step);
    const startedAt = Date.now();
    const command = [step.executable, ...step.args].join(" ");
    process.stdout.write(`\n[Studio release] ${step.label}\n`);
    const result = await run(step.executable, step.args, {
      cwd: repoRoot,
      env: { ...process.env, ...step.environment }
    });
    let summary = summarizeStudioReleaseOutput(step, result.output);
    if (step.reportPath) {
      try {
        const { readFile } = await import("node:fs/promises");
        const report = JSON.parse(await readFile(step.reportPath, "utf8")) as {
          stats?: { expected?: number; unexpected?: number; skipped?: number };
        };
        summary = {
          passed: report.stats?.expected ?? summary.passed,
          failed: report.stats?.unexpected ?? summary.failed,
          skipped: report.stats?.skipped ?? summary.skipped
        };
      } catch {
        // The command output remains the fallback. A missing report on success
        // will be surfaced as unknown counts in the final release report.
      }
    }
    results.push({
      id: step.id,
      label: step.label,
      command,
      exitCode: result.exitCode,
      durationMs: Date.now() - startedAt,
      ...summary
    });
    if (result.exitCode !== 0) return { ok: false, results };
  }
  return { ok: true, results };
}
