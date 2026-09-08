import process from "node:process";
import path from "node:path";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { promoteBiology30UnitAV2 } from "./lib/biology30-unit-a/v2/promote.js";

const KNOWN_FLAGS = ["project", "acceptance", "help", "h"];

function usage() {
  return [
    "Usage: npm run promote:biology30-unit-a-v2 -- \\",
    "  --project biology30-unit-a \\",
    "  --acceptance projects/biology30-unit-a/meta/human-acceptance.json",
    "",
    "Promotes only the exact human-accepted Biology candidate. The operation is transactional, freezes the five comparison pilots, and enables the Direct Studio workspace. It does not commit, export, upload, or publish."
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
  const result = await promoteBiology30UnitAV2({
    repoRoot: process.cwd(),
    project: requiredFlag(args, "project"),
    acceptancePath: path.resolve(process.cwd(), requiredFlag(args, "acceptance"))
  });
  console.log("Biology 30 Unit A V2 promoted transactionally.");
  console.log(`- Accepted candidate SHA-256: ${result.acceptedBuildSha256}`);
  console.log(`- Promoted workspace SHA-256: ${result.promotedWorkspaceSha256}`);
  console.log(`- Durable edit keys: ${result.editKeyCount}`);
  console.log(`- Annotation-only runtime controls: ${result.annotationOnlyCount}`);
  console.log(`- Historical pilots frozen: ${result.frozenPilotCount}`);
  console.log("Status: active Direct workspace; readiness, export, upload, publication, and commit remain separate gates.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
