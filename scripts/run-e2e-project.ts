import { spawn } from "node:child_process";

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

function quoteForWindowsShell(value: string) {
  return /[ \t"]/u.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
}

async function main() {
  const { project, passthrough } = parseArgs(process.argv.slice(2));
  if (!project) {
    throw new Error("Missing required argument: --project <slug>");
  }

  const baseArgs = [
    "playwright",
    "test",
    "-c",
    "e2e/playwright.config.ts",
    "e2e/specs/core-project-contract.spec.ts",
    "--grep",
    "@project",
    ...passthrough
  ];

  const child =
    process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", `npx ${baseArgs.map(quoteForWindowsShell).join(" ")}`], {
          stdio: "inherit",
          env: {
            ...process.env,
            E2E_PROJECT_SLUG: project
          }
        })
      : spawn("npx", baseArgs, {
          stdio: "inherit",
          env: {
            ...process.env,
            E2E_PROJECT_SLUG: project
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
