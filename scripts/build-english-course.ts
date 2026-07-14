import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildEnglishUnit } from "./build-english-unit.js";
import { parseEnglishCourseManifest } from "./lib/english-unit/schema.js";

function parseArgs(argv: string[]) {
  const courseIndex = argv.indexOf("--course");
  const courseId = courseIndex >= 0 ? argv[courseIndex + 1] : undefined;
  if (!courseId) throw new Error("Usage: npm run build:english-course -- --course ela20-1");
  const repoIndex = argv.indexOf("--repo-root");
  return { courseId, repoRoot: path.resolve(repoIndex >= 0 ? argv[repoIndex + 1] : process.cwd()) };
}

export async function buildEnglishCourse(input: { courseId: string; repoRoot: string }) {
  const manifestPath = path.join(input.repoRoot, "config", "english", "families", `${input.courseId}.json`);
  const manifest = parseEnglishCourseManifest(JSON.parse(await readFile(manifestPath, "utf8")));
  const builds = [];
  for (const unit of manifest.units) {
    const result = await buildEnglishUnit({
      projectSlug: unit.projectSlug,
      unitId: unit.brightspaceUnitIds[0] ?? ""
    });
    builds.push({
      projectSlug: result.projectSlug,
      activityProfile: unit.activityProfile,
      lessonCount: result.report.selectedUnit.lessonCount,
      excluded: result.report.summary.excluded,
      workspaceEntry: result.workspaceEntry
    });
  }
  return { courseId: manifest.courseId, profileVersion: manifest.profileVersion, builds };
}

async function main() {
  console.log(JSON.stringify(await buildEnglishCourse(parseArgs(process.argv.slice(2))), null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
