import { getStringFlag, parseArgs } from "./lib/cli.js";
import { buildCourseBlueprint } from "./lib/course-blueprint.js";
import { readCliIntelligenceOverride, refreshProjectIntelligence } from "./lib/intelligence.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error('Usage: npm run blueprint -- --project <slug>');
  }

  const policyOverride = readCliIntelligenceOverride(parsedArgs);
  const result = await buildCourseBlueprint(projectSlug);
  await refreshProjectIntelligence(projectSlug, {
    command: "plan",
    policyOverride
  });
  console.log(`Wrote course blueprint: ${result.outputPath}`);
  console.log(`Units: ${result.blueprint.units.length}`);
  console.log(`Outcomes: ${result.blueprint.outcomes.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
