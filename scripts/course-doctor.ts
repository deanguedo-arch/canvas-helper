import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { inspectCourseAuthoringProject, renderCourseDoctorReport } from "./lib/course-authoring/context.js";

function usage() {
  return "Usage: npm run course:doctor -- --project <exact-slug>";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const unknownFlags = Object.keys(args.flags).filter((flag) => !["project", "help", "h"].includes(flag));
  if (unknownFlags.length > 0 || args.positionals.length > 0) {
    throw new Error(`Unknown arguments: ${[...unknownFlags.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  }
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }

  const slug = getStringFlag(args, "project");
  if (!slug) throw new Error("--project <exact-slug> is required.");

  const report = await inspectCourseAuthoringProject(slug);
  console.log(renderCourseDoctorReport(report));
  if (report.status !== "pass") process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
