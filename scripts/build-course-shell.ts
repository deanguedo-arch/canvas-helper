import { readFile } from "node:fs/promises";
import path from "node:path";

import { getStringFlag, parseArgs } from "./lib/cli.js";
import { buildCourseShellSourceMetadataByHref } from "./lib/course-shell-resources.js";
import { buildCourseShellPlan } from "./lib/course-shell.js";
import { ensureDir, writeTextFile } from "./lib/fs.js";
import { getProjectPaths } from "./lib/paths.js";
import { loadAssessmentMap, loadCourseBlueprint } from "./lib/course-planning-support.js";
import { loadProjectManifest } from "./lib/projects.js";
import type { D2LCourseMap, LessonPacketIndex, ReferenceIndex, ResourceCatalog } from "./lib/types.js";

async function loadOptionalJson<T>(filePath: string) {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error("Usage: npm run build:course-shell -- --project <slug>");
  }

  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);
  const blueprint = await loadCourseBlueprint(projectSlug);
  const assessmentMap = await loadAssessmentMap(projectSlug);
  const lessonPacketIndex =
    (await loadOptionalJson<LessonPacketIndex>(paths.lessonPacketsIndexPath)) ?? {
      projectId: manifest.id,
      generatedAt: new Date().toISOString(),
      lessonPackets: [],
      warnings: ["lesson-packets index missing"]
    };
  const courseMap = await loadOptionalJson<D2LCourseMap>(paths.d2lCourseMapPath);
  const referenceIndex = await loadOptionalJson<ReferenceIndex>(paths.referenceIndexPath);
  const resourceCatalog = await loadOptionalJson<ResourceCatalog>(paths.resourceCatalogPath);
  const activitySourceMetadataByHref = await buildCourseShellSourceMetadataByHref({
    referenceIndex,
    resourceCatalog
  });
  const title = courseMap?.courseTitle ?? manifest.slug;
  const plan = buildCourseShellPlan({
    projectSlug,
    courseTitle: title,
    courseSubtitle: `${title} course shell`,
    overview: "Use the reusable shell to navigate modules, complete activities in any order, and print the final report.",
    courseMap,
    blueprint,
    assessmentMap,
    lessonPacketIndex,
    activitySourceMetadataByHref
  });

  await ensureDir(paths.workspaceDir);
  const outputPath = path.join(paths.workspaceDir, "course-shell-data.js");
  await writeTextFile(outputPath, `export default ${JSON.stringify(plan, null, 2)};\n`);
  console.log(`Wrote course shell data: ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
