import { getStringFlag, parseArgs } from "./lib/cli.js";
import { exportProjectToAppsScript } from "./lib/exporter.js";
import { readDeviationAcceptanceFromCli } from "./lib/intelligence/apply/deviation-gate.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];
  const authoringAcceptance = readDeviationAcceptanceFromCli(parsedArgs);

  if (!projectSlug) {
    throw new Error('Usage: npm run export:apps-script -- --project <slug>');
  }

  const result = await exportProjectToAppsScript(projectSlug, {
    authoringAcceptance
  });

  console.log(
    `Exported "${result.projectSlug}" Apps Script package to ${result.exportDir} ` +
      `(${result.shellFileCount} shell file(s), ${result.driveAssetFileCount} drive asset file(s)).`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
