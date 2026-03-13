import { getStringFlag, parseArgs } from "./lib/cli.js";
import { convertHss1010Project } from "./lib/conversion/hss1010.js";
import { readDeviationAcceptanceFromCli } from "./lib/intelligence/apply/deviation-gate.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0] ?? "hss1010";
  const legacyHtmlPath = getStringFlag(parsedArgs, "legacy-html");
  const authoringAcceptance = readDeviationAcceptanceFromCli(parsedArgs);

  const result = await convertHss1010Project({
    projectSlug,
    legacyHtmlPath,
    authoringAcceptance
  });

  console.log(`Converted "${result.projectSlug}" to structured section-tab workspace.`);
  console.log(`Workspace: ${result.workspaceEntrypoint}`);
  console.log(`Runtime: ${result.workspaceRuntimePath}`);
  console.log(`Course model: ${result.coursePath}`);
  console.log(`Assessment model: ${result.assessmentPath}`);
  console.log(`Source map: ${result.sourceMapPath}`);
  console.log(`Coverage: ${result.coveragePath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
