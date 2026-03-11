import { getStringFlag, parseArgs } from "./lib/cli.js";
import { exportProjectToScormPackage } from "./lib/exporter.js";
import { normalizeScormVersion, type ScormVersion } from "./lib/scorm.js";

function resolveScormVersion(input: string | undefined): ScormVersion {
  const normalized = normalizeScormVersion(input ?? "2004");
  if (!normalized) {
    throw new Error('Usage: npm run export:scorm -- --project <slug> [--version 2004|1.2]');
  }

  return normalized;
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];
  if (!projectSlug) {
    throw new Error('Usage: npm run export:scorm -- --project <slug> [--version 2004|1.2]');
  }

  const version = resolveScormVersion(getStringFlag(parsedArgs, "version"));
  const result = await exportProjectToScormPackage(projectSlug, version);
  console.log(
    `Exported "${result.projectSlug}" SCORM ${result.version} package to ${result.zipPath} ` +
      `(${result.fileCount} file(s) in ${result.exportDir}).`
  );
  console.log(`Tracked storage keys: ${result.storageKeys.join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
