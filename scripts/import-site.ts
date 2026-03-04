import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { importProject } from "./lib/importer.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const inputPath = parsedArgs.positionals[0];

  if (!inputPath) {
    throw new Error('Usage: npm run import -- "<path-to-html-or-txt-or-folder>" [--slug project-slug] [--force]');
  }

  const result = await importProject({
    inputPath,
    slug: getStringFlag(parsedArgs, "slug"),
    force: hasFlag(parsedArgs, "force")
  });

  console.log(`Imported project "${result.slug}".`);
  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
