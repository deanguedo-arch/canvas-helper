import { getStringFlag, parseArgs } from "./lib/cli.js";
import { refreshProjectIntelligence } from "./lib/intelligence.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error("Usage: npm run learn -- --project <slug>");
  }

  const result = await refreshProjectIntelligence(projectSlug);
  console.log(`Learned profile: ${result.learnedProfilePath}`);
  console.log(`Library records: ${result.libraryRecordCount}`);
  console.log(`Prompt pack: ${result.promptPackPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
