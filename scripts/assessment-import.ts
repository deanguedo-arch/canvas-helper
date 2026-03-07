import path from "node:path";

import { getStringFlag, parseArgs } from "./lib/cli.js";
import { collectAssessmentInputPaths, importAssessmentSources } from "./lib/assessments/index.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const inputArg = getStringFlag(parsedArgs, "input") ?? parsedArgs.positionals[0];
  const slug = getStringFlag(parsedArgs, "slug");
  const title = getStringFlag(parsedArgs, "title");

  if (!inputArg) {
    throw new Error('Usage: npm run assessment:import -- --input <file-or-dir> [--slug <slug>] [--title "Title"]');
  }

  const inputPath = path.resolve(inputArg);
  const inputPaths = await collectAssessmentInputPaths(inputPath);
  if (inputPaths.length === 0) {
    throw new Error(`No .pdf or .docx files found in ${inputPath}.`);
  }

  const item = await importAssessmentSources({
    inputPaths,
    slug,
    title
  });

  console.log(`Imported ${inputPaths.length} source file(s) into assessment "${item.slug}".`);
  console.log(`Questions: ${item.project.questions.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
