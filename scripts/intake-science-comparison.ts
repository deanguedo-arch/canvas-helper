import process from "node:process";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import {
  intakeScienceComparison,
  type ScienceComparisonSynthesisStrategy,
  type ScienceComparisonTreatment
} from "./lib/science-comparison.js";

const KNOWN_FLAGS = [
  "family",
  "course-code",
  "title",
  "unit-title",
  "primary-id",
  "primary-label",
  "primary-zip",
  "reference-id",
  "reference-label",
  "reference-zip",
  "treatments",
  "synthesis",
  "help",
  "h"
];

function usage() {
  return [
    "Usage: npm run intake:science-comparison -- \\",
    "  --family <stable-id> --course-code <code> --title <title> --unit-title <title> \\",
    "  --primary-id <id> --primary-label <label> --primary-zip <zip> \\",
    "  --reference-id <id> --reference-label <label> --reference-zip <zip> \\",
    '  --treatments "faithful,optimized" --synthesis "outcome-led"'
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

  const treatments = requiredFlag(args, "treatments")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean) as ScienceComparisonTreatment[];
  const result = await intakeScienceComparison({
    repoRoot: process.cwd(),
    family: requiredFlag(args, "family"),
    courseCode: requiredFlag(args, "course-code"),
    title: requiredFlag(args, "title"),
    unitTitle: requiredFlag(args, "unit-title"),
    primaryId: requiredFlag(args, "primary-id"),
    primaryLabel: requiredFlag(args, "primary-label"),
    primaryZip: requiredFlag(args, "primary-zip"),
    referenceId: requiredFlag(args, "reference-id"),
    referenceLabel: requiredFlag(args, "reference-label"),
    referenceZip: requiredFlag(args, "reference-zip"),
    treatments,
    synthesis: requiredFlag(args, "synthesis") as ScienceComparisonSynthesisStrategy
  });

  console.log(`Science comparison intake created ${result.variants.length} blocked projects for ${result.family}.`);
  for (const resource of result.resources) {
    console.log(`- ${resource.id}: ${resource.sha256} (${resource.manifestTitle})`);
  }
  for (const variant of result.variants) console.log(`- ${variant.slug}: ${variant.label}`);
  console.log(`Next command: npm run build:biology30-unit-a-pilots -- --family ${result.family}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
