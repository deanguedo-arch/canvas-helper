import path from "node:path";

import { intakeEnglishCourse } from "./lib/english-unit/course-intake.js";
import { ensureMacbethSceneComponent } from "./lib/english-unit/macbeth-scenes.js";

type IntakeCliOptions = {
  courseId: string;
  brightspaceZip: string;
  teacherResourcesZip: string;
  repoRoot: string;
};

function usage() {
  return [
    "Usage:",
    "  tsx scripts/intake-english-course.ts --course ela20-1 --brightspace-zip <file.zip> --teacher-resources-zip <file.zip>",
    "",
    "Options:",
    "  --course <id>                  English course family (currently ela20-1)",
    "  --brightspace-zip <path>       Brightspace course export",
    "  --teacher-resources-zip <path> Teacher resource archive",
    "  --repo-root <path>             Repository root (defaults to current directory)",
    "  --refresh                      Refresh inventories/reports; recipes are always preserved",
    "  --help                         Show this help"
  ].join("\n");
}

function parseArgs(argv: string[]): IntakeCliOptions | "help" {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return "help";
    if (argument === "--refresh") continue;
    if (!argument.startsWith("--")) throw new Error(`Unexpected argument: ${argument}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${argument}`);
    values.set(argument, value);
    index += 1;
  }

  const courseId = values.get("--course");
  const brightspaceZip = values.get("--brightspace-zip");
  const teacherResourcesZip = values.get("--teacher-resources-zip");
  if (!courseId || !brightspaceZip || !teacherResourcesZip) {
    throw new Error("--course, --brightspace-zip, and --teacher-resources-zip are required.");
  }
  return {
    courseId,
    brightspaceZip: path.resolve(brightspaceZip),
    teacherResourcesZip: path.resolve(teacherResourcesZip),
    repoRoot: path.resolve(values.get("--repo-root") ?? process.cwd())
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options === "help") {
    console.log(usage());
    return;
  }
  const result = await intakeEnglishCourse(options);
  const macbeth = await ensureMacbethSceneComponent({
    projectDir: path.join(options.repoRoot, "projects", "ela20-1-shakespeare-macbeth")
  });
  console.log(
    JSON.stringify(
      {
        ...result,
        macbethSceneComponent: path.relative(options.repoRoot, macbeth.componentPath),
        macbethSceneCount: macbeth.scenes.length,
        macbethSceneComponentCreated: macbeth.created
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
