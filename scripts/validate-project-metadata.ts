import { getStringFlag, parseArgs } from "./lib/cli.js";
import { validateProjectManifestPolicy } from "./lib/project-manifest-policy.js";
import { listProjectSlugs, loadProjectManifest } from "./lib/projects.js";

function printValidationResult(
  slug: string,
  result: ReturnType<typeof validateProjectManifestPolicy>
) {
  if (result.status === "skipped-legacy") {
    console.log(`SKIP  ${slug}: migrationState is legacy (validation not enforced).`);
    return;
  }

  if (result.status === "valid") {
    console.log(`OK    ${slug}: migrated metadata is valid.`);
  } else {
    console.log(`FAIL  ${slug}: metadata validation failed.`);
  }

  for (const warning of result.warnings) {
    console.log(`WARN  ${slug}: ${warning}`);
  }
  for (const error of result.errors) {
    console.log(`ERROR ${slug}: ${error}`);
  }
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const requestedProject = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];
  const slugs = requestedProject ? [requestedProject] : await listProjectSlugs();

  if (slugs.length === 0) {
    console.log("No projects found to validate.");
    return;
  }

  let failed = false;

  for (const slug of slugs) {
    try {
      const manifest = await loadProjectManifest(slug);
      const result = validateProjectManifestPolicy(manifest);
      printValidationResult(slug, result);
      if (result.status === "invalid") {
        failed = true;
      }
    } catch (error) {
      failed = true;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`FAIL  ${slug}: could not load project metadata (${message})`);
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
