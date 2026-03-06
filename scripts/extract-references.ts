import { getStringFlag, parseArgs } from "./lib/cli.js";
import { readCliIntelligenceOverride, refreshProjectIntelligence } from "./lib/intelligence.js";
import { extractProjectReferences } from "./lib/references.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error('Usage: npm run refs -- --project <slug>');
  }

  const policyOverride = readCliIntelligenceOverride(parsedArgs);
  const result = await extractProjectReferences(projectSlug);
  await refreshProjectIntelligence(projectSlug, {
    markWorkspaceApproved: true,
    command: "refs",
    policyOverride
  });
  console.log(`Indexed ${result.references.length} reference file(s) for "${projectSlug}".`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
