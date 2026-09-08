import path from "node:path";
import process from "node:process";

import { recordBiology30CourseAcceptance } from "./lib/biology30-course/v1/acceptance.js";
import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";

const KNOWN_FLAGS = ["project", "acceptance", "help", "h"];

function usage() {
  return [
    "Usage: npm run record:biology30-course-acceptance -- \\",
    "  --project biology30-unit-b \\",
    "  --acceptance /absolute/path/to/unit-b-acceptance-submission.json",
    "",
    "Validates and records an explicit 95+/100 human decision for the exact blocked Unit B, C, or D build.",
    "This command does not promote, enable Studio editing, export, upload, publish, or commit."
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
  const result = await recordBiology30CourseAcceptance({
    repoRoot: process.cwd(),
    project: requiredFlag(args, "project"),
    acceptancePath: path.resolve(process.cwd(), requiredFlag(args, "acceptance"))
  });
  console.log("Biology 30 exact-build human acceptance recorded transactionally.");
  console.log(`- Candidate SHA-256: ${result.acceptedBuildSha256}`);
  console.log(`- Human score: ${result.totalScore}/100`);
  console.log(`- Canonical record: ${path.relative(process.cwd(), result.canonicalAcceptancePath)}`);
  console.log("Status: blocked human-accepted candidate awaiting separately authorized promotion/readiness.");
  console.log("Promotion, Studio editing, export, upload, publication, and commit remain unauthorized.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
