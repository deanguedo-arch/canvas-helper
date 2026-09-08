import process from "node:process";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import {
  BIOLOGY30_PRODUCTION_FAMILY,
  intakeBiology30RemainingUnits
} from "./lib/biology30-course/v1/intake.js";

const KNOWN_FLAGS = ["family", "help", "h"];

function usage() {
  return [
    "Usage: npm run intake:biology30-course -- \\",
    `  --family ${BIOLOGY30_PRODUCTION_FAMILY}`,
    "",
    "Creates transactional blocked production proposals for Biology 30 Units B, C, and D.",
    "The two verified Brightspace archives remain shared and are never duplicated."
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const unknown = Object.keys(args.flags).filter((flag) => !KNOWN_FLAGS.includes(flag));
  if (unknown.length || args.positionals.length) {
    throw new Error(`Unknown arguments: ${[...unknown.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  }
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }
  const family = getStringFlag(args, "family");
  if (!family) throw new Error("--family is required.");
  const result = await intakeBiology30RemainingUnits({ repoRoot: process.cwd(), family });
  console.log("Biology 30 Units B-D production intake completed transactionally.");
  console.log(`- Shared contract: ${result.resourceDir}/family-contract.json`);
  console.log(`- Contract SHA-256: ${result.familyContractSha256}`);
  console.log(`- Projects created: ${result.projectDirs.join(", ")}`);
  console.log(`- Source inventory: ${result.sourceCatalog.items.length} items, 202 visible questions, 395 notes pages`);
  console.log("- Quality floor: 95/100 for every unit; automatic promotion disabled");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
