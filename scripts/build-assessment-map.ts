import { getStringFlag, parseArgs } from "./lib/cli.js";
import { readCliIntelligenceOverride, refreshProjectIntelligence } from "./lib/intelligence.js";
import { buildAssessmentMap } from "./lib/assessment-map.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error('Usage: npm run assessment-map -- --project <slug>');
  }

  const policyOverride = readCliIntelligenceOverride(parsedArgs);
  const result = await buildAssessmentMap(projectSlug);
  await refreshProjectIntelligence(projectSlug, {
    command: "plan",
    policyOverride
  });
  console.log(`Wrote assessment map: ${result.outputPath}`);
  console.log(`Assessments: ${result.assessmentMap.assessments.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
