import process from "node:process";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { intakeSciencePilot, type SciencePilotMode } from "./lib/science-pilot-intake.js";

function usage() {
  return "Usage: npm run intake:science-pilot -- --project <slug> --course-code <code> --title <title> --mode <conversion|generated-course> [--brightspace-zip <zip>] [--teacher-resources-zip <zip>]";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const knownFlags = ["project", "course-code", "title", "mode", "brightspace-zip", "teacher-resources-zip", "help", "h"];
  const unknownFlags = Object.keys(args.flags).filter((flag) => !knownFlags.includes(flag));
  if (unknownFlags.length || args.positionals.length) {
    throw new Error(`Unknown arguments: ${[...unknownFlags.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  }
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }

  const projectSlug = getStringFlag(args, "project");
  const courseCode = getStringFlag(args, "course-code");
  const courseTitle = getStringFlag(args, "title");
  const mode = getStringFlag(args, "mode") as SciencePilotMode | undefined;
  if (!projectSlug || !courseCode || !courseTitle || !mode) {
    throw new Error("--project, --course-code, --title, and --mode are required.");
  }
  const result = await intakeSciencePilot({
    repoRoot: process.cwd(),
    projectSlug,
    courseCode,
    courseTitle,
    mode,
    brightspaceZip: getStringFlag(args, "brightspace-zip"),
    teacherResourcesZip: getStringFlag(args, "teacher-resources-zip")
  });
  console.log(`Science pilot intake created for ${result.projectSlug}.`);
  for (const resource of result.resources) {
    console.log(`- ${resource.id}: ${resource.path} (${resource.sha256})`);
  }
  console.log(`Next file: projects/${result.projectSlug}/meta/science-pilot.json`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
