import { getStringFlag, parseArgs } from "./lib/cli.js";
import { buildD2LCourseMap } from "./lib/d2l-course-map.js";
import { readCliIntelligenceOverride, refreshProjectIntelligence } from "./lib/intelligence.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error("Usage: npm run d2l-map -- --project <slug>");
  }

  const policyOverride = readCliIntelligenceOverride(parsedArgs);
  const result = await buildD2LCourseMap(projectSlug);
  await refreshProjectIntelligence(projectSlug, {
    command: "plan",
    policyOverride
  });
  console.log(`Wrote D2L course map: ${result.outputPath}`);
  console.log(`Wrote D2L course map markdown: ${result.markdownPath}`);
  console.log(`Modules: ${result.courseMap.summary.moduleCount}`);
  console.log(`Items: ${result.courseMap.summary.itemCount}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
