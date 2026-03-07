import { getStringFlag, parseArgs } from "./lib/cli.js";
import { exportAssessmentLibraryItemBrightspace } from "./lib/assessments/index.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const assessmentSlug = getStringFlag(parsedArgs, "assessment") ?? parsedArgs.positionals[0];

  if (!assessmentSlug) {
    throw new Error('Usage: npm run assessment:export -- --assessment <slug>');
  }

  const result = await exportAssessmentLibraryItemBrightspace(assessmentSlug);
  if (result.status !== "success") {
    const counts = new Map<string, number>();
    for (const diagnostic of result.diagnostics) {
      counts.set(diagnostic.code, (counts.get(diagnostic.code) ?? 0) + 1);
    }

    console.error(`Export failed for "${assessmentSlug}".`);
    for (const [code, count] of counts.entries()) {
      console.error(`- ${code}: ${count}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Exported ${result.fileName} for assessment "${assessmentSlug}".`);
  console.log(`Rows: ${result.rows.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
