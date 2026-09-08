import process from "node:process";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { buildBiology30UnitAGate2 } from "./lib/biology30-unit-a/v2/gate2-build.js";

const KNOWN_FLAGS = ["project", "strict", "check-external-links", "help", "h"];

function usage() {
  return [
    "Usage: npm run build:biology30-unit-a-v2 -- \\",
    "  --project biology30-unit-a \\",
    "  --strict [--check-external-links]",
    "",
    "Builds the transactional, blocked Gate 2 full-course candidate after exact Gate 1 approval. It never promotes, exports, or enables Studio editing."
  ].join("\n");
}

function requiredFlag(args: ReturnType<typeof parseArgs>, name: string) {
  const value = getStringFlag(args, name);
  if (!value) throw new Error(`--${name} is required.`);
  return value;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const unknownFlags = Object.keys(args.flags).filter((flag) => !KNOWN_FLAGS.includes(flag));
  if (unknownFlags.length || args.positionals.length) {
    throw new Error(`Unknown arguments: ${[...unknownFlags.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  }
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }
  if (!hasFlag(args, "strict")) throw new Error("--strict is required for a Gate 2 candidate build.");
  const result = await buildBiology30UnitAGate2({
    repoRoot: process.cwd(),
    project: requiredFlag(args, "project"),
    strict: true,
    checkExternalLinks: hasFlag(args, "check-external-links")
  });
  console.log("Biology 30 Unit A V2 Gate 2 full-course candidate built transactionally.");
  console.log(`- Project: ${result.projectDir}`);
  console.log(`- Workspace: ${result.workspaceDir}/index.html`);
  console.log(`- Candidate build SHA-256: ${result.buildSha256}`);
  console.log(`- Accepted Gate 0 contract SHA-256: ${result.contractSha256}`);
  console.log(`- Learner routes: ${result.learnerRouteCount}`);
  console.log("Status: blocked and awaiting Gate 3 review of the exact build. No promotion, Studio editing, export, upload, publication, or commit occurred.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
