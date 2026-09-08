import process from "node:process";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { buildBiology30UnitAPilots } from "./lib/biology30-unit-a/build.js";

function usage() {
  return "Usage: npm run build:biology30-unit-a-pilots -- --family <stable-id> [--check-external]";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const knownFlags = ["family", "check-external", "help", "h"];
  const unknownFlags = Object.keys(args.flags).filter((flag) => !knownFlags.includes(flag));
  if (unknownFlags.length || args.positionals.length) {
    throw new Error(`Unknown arguments: ${[...unknownFlags.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  }
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }
  const family = getStringFlag(args, "family");
  if (!family) throw new Error("--family is required.");
  const result = await buildBiology30UnitAPilots({
    repoRoot: process.cwd(),
    family,
    checkExternalLinks: hasFlag(args, "check-external")
  });
  console.log(`Built ${result.variants.length} blocked Biology 30 Unit A workspaces at ${result.generatedAt}.`);
  for (const variant of result.variants) {
    console.log(
      `- ${variant.slug}: ${variant.lessonCount} lessons/stages, ${variant.responseCount} persistent responses, ${variant.copiedAssetCount} local assets, ${variant.externalLinkCount} optional links`
    );
  }
  console.log("No course was promoted or exported.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
