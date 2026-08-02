import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { buildProjectAuthoringContext, renderCourseDoctorReport } from "./lib/course-authoring/context.js";

function usage() {
  return "Usage: npm run context:project -- --project <exact-slug>";
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

  const { report, text } = await buildProjectAuthoringContext(slug);
  if (!text) {
    console.error(renderCourseDoctorReport(report));
    process.exitCode = 1;
    return;
  }
  console.log(text);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
