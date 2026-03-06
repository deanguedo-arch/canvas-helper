import { getStringFlag, parseArgs } from "./lib/cli.js";
import { normalizeVerifyMode, verifyProjectBundle } from "./lib/verification.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error("Usage: npm run verify -- --project <slug> [--mode workspace|raw|brightspace]");
  }

  const mode = normalizeVerifyMode(getStringFlag(parsedArgs, "mode"));
  const result = await verifyProjectBundle(projectSlug, mode);

  console.log(`Mode: ${result.mode}`);
  console.log(`Entry: ${result.entryPath}`);
  console.log("");

  if (result.missingAssets.length > 0) {
    console.log("Missing local assets (ERROR):");
    for (const item of result.missingAssets) {
      console.log(`- ${item}`);
    }
  } else {
    console.log("Missing local assets (ERROR): none");
  }

  console.log("");

  if (result.externalDependencies.length > 0) {
    console.log("External dependencies (WARN):");
    for (const item of result.externalDependencies) {
      console.log(`- ${item}`);
    }
  } else {
    console.log("External dependencies (WARN): none");
  }

  if (result.traversalWarnings.length > 0) {
    console.log("");
    console.log("Traversal refs skipped (WARN):");
    for (const item of result.traversalWarnings) {
      console.log(`- ${item}`);
    }
  }

  if (result.missingAssets.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
