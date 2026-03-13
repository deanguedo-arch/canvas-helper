import { getStringFlag, parseArgs } from "./lib/cli.js";
import { exportProjectToSingleHtml } from "./lib/exporter.js";
import { readDeviationAcceptanceFromCli } from "./lib/intelligence/apply/deviation-gate.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];
  const authoringAcceptance = readDeviationAcceptanceFromCli(parsedArgs);

  if (!projectSlug) {
    throw new Error('Usage: npm run export:html -- --project <slug>');
  }

  const result = await exportProjectToSingleHtml(projectSlug, {
    authoringAcceptance
  });
  console.log(`Exported "${result.projectSlug}" single HTML to ${result.outputPath} (inlined ${result.inlinedAssetCount} asset(s)).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
