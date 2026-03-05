import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { analyzeProject } from "./lib/analyzer.js";
import { refreshProjectIntelligence } from "./lib/intelligence.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error('Usage: npm run analyze -- --project <slug> [--split]');
  }

  const splitWorkspace = hasFlag(parsedArgs, "split");
  const result = await analyzeProject(projectSlug, { splitWorkspace });
  const intelligence = await refreshProjectIntelligence(projectSlug, { markWorkspaceApproved: true });
  console.log(`Analyzed "${result.projectSlug}" (${result.sectionCount} sections, ${result.splitCount} split file(s)).`);
  console.log(`Refreshed prompt pack and pattern bank (${intelligence.libraryRecordCount} profile(s)).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
