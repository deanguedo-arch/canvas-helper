import { getStringFlag, parseArgs } from "./lib/cli.js";
import { exportProjectToGoogleHosted } from "./lib/exporter.js";
import { readDeviationAcceptanceFromCli } from "./lib/intelligence/apply/deviation-gate.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];
  const authoringAcceptance = readDeviationAcceptanceFromCli(parsedArgs);

  if (!projectSlug) {
    throw new Error('Usage: npm run export:google-hosted -- --project <slug>');
  }

  const result = await exportProjectToGoogleHosted(projectSlug, {
    authoringAcceptance
  });
  console.log(
    `Exported "${result.projectSlug}" Google Hosted bundle to ${result.exportDir} ` +
      `(${result.fileCount} file(s), ${result.storageKeys.length} tracked storage key(s)).`
  );
  console.log(`Tracked storage keys: ${result.storageKeys.join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
