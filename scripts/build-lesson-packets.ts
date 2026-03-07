import { getStringFlag, parseArgs } from "./lib/cli.js";
import { readCliIntelligenceOverride, refreshProjectIntelligence } from "./lib/intelligence.js";
import { buildLessonPackets } from "./lib/lesson-packets.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error('Usage: npm run lesson-packets -- --project <slug>');
  }

  const policyOverride = readCliIntelligenceOverride(parsedArgs);
  const result = await buildLessonPackets(projectSlug);
  await refreshProjectIntelligence(projectSlug, {
    command: "plan",
    policyOverride
  });
  console.log(`Wrote lesson packets: ${result.outputDir}`);
  console.log(`Lesson packets: ${result.lessonPacketCount}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
