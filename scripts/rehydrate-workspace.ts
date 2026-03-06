import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { readCliIntelligenceOverride } from "./lib/intelligence.js";
import { rehydrateWorkspace } from "./lib/importer.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error('Usage: npm run rehydrate -- --project <slug> [--force]');
  }

  await rehydrateWorkspace(projectSlug, hasFlag(parsedArgs, "force"), readCliIntelligenceOverride(parsedArgs));
  console.log(`Rehydrated workspace for "${projectSlug}" from raw/original.html.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
