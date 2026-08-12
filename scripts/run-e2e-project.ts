import { spawn } from "node:child_process";
import path from "node:path";

import { repoRoot } from "./lib/paths.js";

function parseArgs(argv: string[]) {
  const passthrough: string[] = [];
  let project = "";

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === "--project") {
      project = argv[index + 1] || "";
      index += 1;
      continue;
    }

    passthrough.push(current);
  }

  return { project, passthrough };
}

async function main() {
  const { project, passthrough } = parseArgs(process.argv.slice(2));
  if (!project) {
    throw new Error("Missing required argument: --project <slug>");
  }

  const playwrightCli = path.join(repoRoot, "node_modules", "@playwright", "test", "cli.js");
  const baseArgs = [
    playwrightCli,
    "test",
    "-c",
    process.env.E2E_PLAYWRIGHT_CONFIG || "e2e/playwright.config.ts",
    "e2e/specs/core-project-contract.spec.ts",
    "--grep",
    "@project",
    ...passthrough
  ];

  const child = spawn(process.execPath, baseArgs, {
    cwd: repoRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      E2E_PROJECT_SLUG: project,
      E2E_PROJECT_MODE: "project-contract"
    }
  });

  const exitCode: number = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });

  if (exitCode !== 0) {
    process.exitCode = exitCode;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
