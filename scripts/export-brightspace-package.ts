import { getStringFlag, parseArgs } from "./lib/cli.js";
import { exportProjectToBrightspacePackage } from "./lib/exporter.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error('Usage: npm run export:brightspace:zip -- --project <slug>');
  }

  const result = await exportProjectToBrightspacePackage(projectSlug);
  console.log(
    `Packaged "${result.projectSlug}" to ${result.zipPath} (${result.fileCount} file(s) copied to ${result.exportDir}).`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
