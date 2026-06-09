import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { buildElaModernDramaProject } from "./lib/ela-modern-drama.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const zipPath = getStringFlag(parsedArgs, "zip") ?? parsedArgs.positionals[0];
  if (!zipPath) {
    throw new Error(
      'Usage: npx tsx scripts/build-ela-modern-drama.ts --zip "<path-to-d2l-export.zip>" [--nextstep-zip "<path-to-nextstep.zip>"] [--movie "<path-to-movie.mp4>"] [--slug ela30-1-modern-drama] [--force]'
    );
  }

  const result = await buildElaModernDramaProject({
    zipPath,
    nextStepZipPath: getStringFlag(parsedArgs, "nextstep-zip"),
    moviePath: getStringFlag(parsedArgs, "movie"),
    slug: getStringFlag(parsedArgs, "slug"),
    force: hasFlag(parsedArgs, "force")
  });

  console.log(`Built ${result.slug}`);
  console.log(`Lessons: ${result.lessonCount}`);
  console.log(`Workspace: ${result.workspaceEntrypoint}`);
  console.log(`Manifest: ${result.manifestPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
