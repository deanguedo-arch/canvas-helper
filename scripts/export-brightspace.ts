import { getStringFlag, parseArgs } from "./lib/cli.js";
import { exportProjectToBrightspace } from "./lib/exporter.js";
import { readDeviationAcceptanceFromCli } from "./lib/intelligence/apply/deviation-gate.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];
  const authoringAcceptance = readDeviationAcceptanceFromCli(parsedArgs);

  if (!projectSlug) {
    throw new Error('Usage: npm run export:brightspace -- --project <slug>');
  }

  const result = await exportProjectToBrightspace(projectSlug, {
    authoringAcceptance
  });
  console.log(`Exported "${result.projectSlug}" to ${result.exportDir} (${result.fileCount} file(s)).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
