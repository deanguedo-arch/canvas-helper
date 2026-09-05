import process from "node:process";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { createBiology30UnitAPilot2 } from "./lib/biology30-unit-a-pilot-2/create.js";

const KNOWN_FLAGS = new Set(["source", "project", "source-workspace-sha", "help", "h"]);

function usage() {
  return [
    "Usage: npm run create:biology30-unit-a-pilot-2 -- \\",
    "  --source biology30-unit-a-pilot \\",
    "  --project biology30-unit-a-pilot-2 \\",
    "  --source-workspace-sha b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee",
    "",
    "Creates one transactional, blocked Gate 0/Gate 1 project. Existing targets are never overwritten."
  ].join("\n");
}

function requiredFlag(args: ReturnType<typeof parseArgs>, name: string) {
  const value = getStringFlag(args, name);
  if (!value) throw new Error(`--${name} is required.`);
  return value;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const unknown = Object.keys(args.flags).filter((flag) => !KNOWN_FLAGS.has(flag));
  if (unknown.length || args.positionals.length) {
    throw new Error(`Unknown arguments: ${[...unknown.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  }
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }
  const result = await createBiology30UnitAPilot2({
    repoRoot: process.cwd(),
    source: requiredFlag(args, "source"),
    project: requiredFlag(args, "project"),
    sourceWorkspaceSha256: requiredFlag(args, "source-workspace-sha")
  });
  console.log("Biology 30 Unit A Pilot 2 was created transactionally.");
  console.log(`- Project: ${result.projectDir}`);
  console.log(`- Gate 1 workspace SHA-256: ${result.workspaceSha256}`);
  console.log(`- Gate 1 workspace tree SHA-256: ${result.workspaceTreeSha256}`);
  console.log(`- Learner routes available for review: ${result.gate1Routes.length}`);
  console.log(`- Protected Pilot 1 / Units A-D projects verified unchanged: ${result.protectedProjectHashes.length}`);
  console.log("Status: blocked, preview-only, Studio Edit disabled, awaiting exact-build Gate 1 teacher review.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
