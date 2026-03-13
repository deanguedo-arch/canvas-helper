import path from "node:path";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { fileExists, listFilesRecursive, readJsonFile, writeJsonFile, writeTextFile } from "./lib/fs.js";
import { getProjectPaths } from "./lib/paths.js";
import { applyCourseImageManifest, validateCourseImageManifest, type CourseImageManifest } from "./lib/conversion/course-images.js";
import { renderHss1010WorkspaceShell } from "./lib/conversion/hss1010.js";
import type { AssessmentModel, CourseModel } from "./lib/conversion/types.js";

function toPosixRelative(fromDir: string, targetPath: string) {
  return path.relative(fromDir, targetPath).replace(/\\/g, "/");
}

function buildEmptyManifest(projectSlug: string): CourseImageManifest {
  return {
    schemaVersion: 1,
    projectSlug,
    images: []
  };
}

async function collectWorkspaceImagePaths(workspaceDir: string) {
  const imageDir = path.join(workspaceDir, "assets", "images");
  if (!(await fileExists(imageDir))) {
    return new Set<string>();
  }

  const files = await listFilesRecursive(imageDir);
  const paths = new Set<string>();
  for (const filePath of files) {
    const rel = toPosixRelative(workspaceDir, filePath);
    paths.add(rel);
    paths.add(`./${rel}`);
  }
  return paths;
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0] ?? "hss1010";
  const writeTemplate = hasFlag(parsedArgs, "init");
  const projectPaths = getProjectPaths(projectSlug);
  const manifestPath = path.join(projectPaths.metaDir, "images-manifest.json");
  const coursePath = path.join(projectPaths.metaDir, "course.json");
  const workspaceCoursePath = path.join(projectPaths.workspaceDir, "data", "course.json");
  const assessmentPath = path.join(projectPaths.metaDir, "assessment.json");
  const workspaceRuntimePath = path.join(projectPaths.workspaceDir, "main.js");
  const workspaceStudyCssPath = path.join(projectPaths.workspaceDir, "hss-study.css");

  if (!(await fileExists(coursePath))) {
    throw new Error(`Course model not found: ${coursePath}`);
  }

  if (!(await fileExists(manifestPath))) {
    if (!writeTemplate) {
      throw new Error(`Image manifest not found: ${manifestPath}. Run with --init to scaffold it.`);
    }

    await writeJsonFile(manifestPath, buildEmptyManifest(projectSlug));
    console.log(`Created image manifest template at ${manifestPath}`);
    return;
  }

  const course = await readJsonFile<CourseModel>(coursePath);
  const manifest = await readJsonFile<CourseImageManifest>(manifestPath);
  const existingImagePaths = await collectWorkspaceImagePaths(projectPaths.workspaceDir);
  const issues = validateCourseImageManifest({
    course,
    manifest,
    existingImagePaths
  });

  if (issues.length > 0) {
    throw new Error(`Image manifest validation failed:\n- ${issues.join("\n- ")}`);
  }

  const applied = applyCourseImageManifest({
    course,
    manifest,
    existingImagePaths
  });

  await writeJsonFile(coursePath, applied.course);
  await writeJsonFile(workspaceCoursePath, applied.course);

  if ((await fileExists(assessmentPath)) && projectSlug.toLowerCase() === "hss1010") {
    const assessment = await readJsonFile<AssessmentModel>(assessmentPath);
    const rendered = renderHss1010WorkspaceShell({
      projectSlug,
      course: applied.course,
      assessment,
      assumeInteractiveCourse: true
    });

    await Promise.all([
      writeTextFile(projectPaths.workspaceEntrypoint, rendered.indexHtml),
      writeTextFile(workspaceRuntimePath, rendered.runtimeJs),
      writeTextFile(workspaceStudyCssPath, rendered.studyCss)
    ]);
  }

  console.log(`Synced image manifest for "${projectSlug}".`);
  console.log(`Inserted: ${applied.inserted}`);
  console.log(`Updated: ${applied.updated}`);
  console.log(`Skipped: ${applied.skipped}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
