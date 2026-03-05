import { getStringFlag, parseArgs } from "./lib/cli.js";
import { rebuildPatternBankIndex, learnProjectPatterns } from "./lib/pattern-bank.js";
import { listProjectSlugs } from "./lib/projects.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const requestedProject = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];
  const slugs = requestedProject ? [requestedProject] : await listProjectSlugs();

  if (slugs.length === 0) {
    throw new Error("No projects available to learn.");
  }

  for (const slug of slugs) {
    await learnProjectPatterns(slug);
    console.log(`Learned pattern profile: ${slug}`);
  }

  const indexResult = await rebuildPatternBankIndex();
  console.log(`Pattern library index: ${indexResult.indexPath}`);
  console.log(`Records: ${indexResult.index.records.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
