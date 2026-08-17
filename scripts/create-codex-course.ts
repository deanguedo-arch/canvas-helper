import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { createCodexStudioCourse } from "./lib/codex-course.js";
import { repoRoot } from "./lib/paths.js";

function usage() {
  return "Usage: npm run course:create -- --slug <project-slug> --title <course title> [--course-code <code>] [--summary <summary>]";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const allowed = new Set(["slug", "title", "course-code", "summary", "help", "h"]);
  const unknown = Object.keys(args.flags).filter((flag) => !allowed.has(flag));
  if (unknown.length || args.positionals.length) {
    throw new Error(`Unknown arguments: ${[...unknown.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  }
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }

  const slug = getStringFlag(args, "slug");
  const title = getStringFlag(args, "title");
  if (!slug || !title) throw new Error("Both --slug and --title are required.");

  const result = await createCodexStudioCourse({
    repoRoot,
    slug,
    title,
    courseCode: getStringFlag(args, "course-code"),
    summary: getStringFlag(args, "summary")
  });
  console.log(`Created Studio-ready Codex course: ${result.projectSlug}`);
  console.log(`Canonical page: ${result.workspaceEntry}`);
  console.log(`Readiness: ${result.readiness}`);
  console.log(`Verify: npm run course:doctor -- --project ${result.projectSlug}`);
  console.log("Studio will add the course automatically when the local Studio server is open.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
