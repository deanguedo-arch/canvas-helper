import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { listCourseAuthoringProjects } from "./lib/course-authoring/context.js";

function usage() {
  return "Usage: npm run course:list -- [--all]";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const unknownFlags = Object.keys(args.flags).filter((flag) => !["all", "help", "h"].includes(flag));
  if (unknownFlags.length > 0 || args.positionals.length > 0 || getStringFlag(args, "all")) {
    throw new Error(`Unknown arguments: ${[...unknownFlags.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  }
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }

  const rows = await listCourseAuthoringProjects({ includeAll: hasFlag(args, "all") });
  if (rows.length === 0) {
    console.log(hasFlag(args, "all") ? "No project manifests found." : "No active migrated projects found.");
    return;
  }

  console.log("PROJECT\tREADINESS\tLIFECYCLE\tDRIVER\tDRIVER_SOURCE\tISSUES");
  for (const row of rows) {
    console.log(
      `${row.slug}\t${row.readiness}\t${row.lifecycle}\t${row.driver}\t${row.driverSource ?? "-"}\t${row.issueCount ?? "-"}`
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
