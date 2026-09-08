import process from "node:process";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { intakeBiology30UnitAV2 } from "./lib/biology30-unit-a/v2/intake.js";

const KNOWN_FLAGS = ["family", "project", "help", "h"];

function usage() {
  return [
    "Usage: npm run intake:biology30-unit-a-v2 -- \\",
    "  --family biology30-unit-a-pilot \\",
    "  --project biology30-unit-a",
    "",
    "Creates one transactional, blocked Gate 0 proposal. Existing targets are never overwritten."
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
  const result = await intakeBiology30UnitAV2({
    repoRoot: process.cwd(),
    family: requiredFlag(args, "family"),
    project: requiredFlag(args, "project")
  });
  console.log("Biology 30 Unit A V2 Gate 0 intake completed transactionally.");
  console.log(`- Project: ${result.projectDir}`);
  console.log(`- Contract: ${result.resourceDir}/production-contract.json`);
  console.log(`- Contract SHA-256: ${result.contractSha256}`);
  console.log(`- Outcomes: 25; lessons planned: 17; PDF pages dispositioned: 139`);
  console.log(`- Comparison pilots verified unchanged: ${result.pilotTreeHashes.length}`);
  console.log("Status: blocked, preview-only, awaiting curriculum-map and correction-strategy approval.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
