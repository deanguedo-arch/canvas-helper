import { readFile } from "node:fs/promises";
import path from "node:path";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
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

function collectDetectedModuleNumbers(...values: string[]) {
  const numbers = new Set<number>();
  const pattern = /\b(?:module|unit)\s*#?\s*(\d+)\b/gi;

  for (const value of values) {
    if (!value) {
      continue;
    }
    for (const match of value.matchAll(pattern)) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed)) {
        numbers.add(parsed);
      }
    }
  }

  return numbers;
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];
  const allowSingleModuleLock = hasFlag(parsedArgs, "allow-single-module-lock");

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

  if (!allowSingleModuleLock) {
    const detectedNumbers = collectDetectedModuleNumbers(
      ...(courseMap?.modules.map((module) => module.title) ?? []),
      ...blueprint.units.map((unit) => unit.title),
      ...assessmentMap.assessments.map((assessment) => assessment.name),
      ...assessmentMap.assessments.flatMap((assessment) => assessment.relatedUnitIds)
    );

    if (plan.modules.length <= 1 && detectedNumbers.size >= 2) {
      throw new Error(
        [
          `Lock-in blocked for ${projectSlug}: generated shell has ${plan.modules.length} module.`,
          `Detected numbered module evidence: ${[...detectedNumbers].sort((a, b) => a - b).join(", ")}.`,
          "Fix structure derivation first, then rerun build:course-shell.",
          "Override only if intentional: --allow-single-module-lock"
        ].join(" ")
      );
    }
  }

  await ensureDir(paths.workspaceDir);
  const outputPath = path.join(paths.workspaceDir, "course-shell-data.js");
  await writeTextFile(outputPath, `export default ${JSON.stringify(plan, null, 2)};\n`);
  console.log(`Wrote course shell data: ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
