import { getStringFlag, parseArgs } from "./lib/cli.js";
import { generatePromptPack } from "./lib/prompt-pack.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error("Usage: npm run pack -- --project <slug>");
  }

  const result = await generatePromptPack(projectSlug);
  console.log(`Wrote prompt pack: ${result.outputPath}`);
  console.log(`Indexed references included: ${result.indexedReferenceCount}`);
  console.log(`Pattern matches included: ${result.patternMatchCount}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
