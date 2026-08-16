import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

import { parseEnglishCourseManifest, parseEnglishUnitRecipe } from "./schema.js";
import {
  inspectEnglishV3DerivedRecipeDependency,
  inspectEnglishV3DonorLessonPlans,
  type EnglishDonorLessonPlan
} from "./v3-donor-lessons.js";

const MODULE_EXTENSIONS = ["", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"];

function codePointCompare(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Converts a factory input to the repository-relative form persisted in new
 * project metadata.  Factory sources outside the checkout are not portable
 * and must not be silently dropped from readiness selection.
 */
export function englishFactoryRepoRelativePath(repoRoot: string, value: string, label: string) {
  const absolute = path.isAbsolute(value) ? path.resolve(value) : path.resolve(repoRoot, value);
  const relative = path.relative(repoRoot, absolute).split(path.sep).join("/");
  if (!relative || relative === ".." || relative.startsWith("../") || path.isAbsolute(relative)) {
    throw new Error(`English factory ${label} must resolve inside this repository.`);
  }
  return relative;
}

export function englishFamilyIdFromCourseCode(courseCode: string) {
  const match = courseCode.trim().match(/^ELA\s+(\d+)-(\d+)$/i);
  if (!match) throw new Error(`Cannot resolve an English family manifest from course code ${courseCode}.`);
  return `ela${match[1]}-${match[2]}`.toLowerCase();
}

async function resolveExistingPath(repoRoot: string, value: string, label: string) {
  const relative = englishFactoryRepoRelativePath(repoRoot, value, label);
  const absolute = path.resolve(repoRoot, relative);
  try {
    const entry = await lstat(absolute);
    if (entry.isSymbolicLink()) throw new Error("symbolic links are not accepted");
    if (!entry.isFile() && !entry.isDirectory()) throw new Error("not a regular file or directory");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`English factory dependency ${relative} (${label}) cannot be resolved: ${detail}`);
  }
  return { relative, absolute };
}

async function resolveRelativeModule(fromFile: string, specifier: string) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = new Set<string>();
  for (const extension of MODULE_EXTENSIONS) candidates.add(`${base}${extension}`);
  const ext = path.extname(base);
  if (ext) {
    for (const replacement of [".ts", ".tsx", ".js", ".mjs", ".cjs"]) {
      candidates.add(`${base.slice(0, -ext.length)}${replacement}`);
    }
  }
  for (const extension of MODULE_EXTENSIONS.slice(1)) candidates.add(path.join(base, `index${extension}`));
  for (const candidate of candidates) {
    try {
      const entry = await lstat(candidate);
      if (entry.isFile() && !entry.isSymbolicLink()) return candidate;
    } catch {}
  }
  throw new Error(`English factory implementation import ${specifier} from ${fromFile} cannot be resolved.`);
}

function relativeModuleSpecifiers(source: string) {
  const matches = new Set<string>();
  for (const match of source.matchAll(/\bfrom\s*["'](\.{1,2}\/[^"']+)["']/g)) matches.add(match[1]!);
  for (const match of source.matchAll(/\bimport\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)) matches.add(match[1]!);
  for (const match of source.matchAll(/\bimport\s*["'](\.{1,2}\/[^"']+)["']/g)) matches.add(match[1]!);
  return [...matches].sort(codePointCompare);
}

async function collectImplementationClosure(input: {
  repoRoot: string;
  entry: string;
  dependencies: Set<string>;
  visited: Set<string>;
}) {
  const entry = await resolveExistingPath(input.repoRoot, input.entry, "implementation");
  if (input.visited.has(entry.relative)) return;
  input.visited.add(entry.relative);
  input.dependencies.add(entry.relative);
  const source = await readFile(entry.absolute, "utf8");
  for (const specifier of relativeModuleSpecifiers(source)) {
    const absolute = await resolveRelativeModule(entry.absolute, specifier);
    await collectImplementationClosure({
      repoRoot: input.repoRoot,
      entry: absolute,
      dependencies: input.dependencies,
      visited: input.visited
    });
  }
}

function donorPlanInputs(plan: EnglishDonorLessonPlan) {
  const entries = [plan.sourcePath];
  if (plan.kind === "recipe-v1" || plan.kind === "recipe-v2" || plan.kind === "recipe-alias-v2") {
    entries.push(plan.recipePath);
  }
  return entries;
}

/**
 * Derives every currently output-affecting English factory input from the
 * recipe and factory implementation, never from generated project metadata.
 * Failure to find one of those inputs is deliberately fatal to readiness.
 */
export async function collectEnglishFactoryDependencyPaths(input: {
  repoRoot: string;
  projectSlug: string;
}) {
  const recipePath = `projects/${input.projectSlug}/meta/english-unit.json`;
  const recipeFile = await resolveExistingPath(input.repoRoot, recipePath, "recipe");
  let recipe: ReturnType<typeof parseEnglishUnitRecipe>;
  try {
    recipe = parseEnglishUnitRecipe(JSON.parse(await readFile(recipeFile.absolute, "utf8")));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`English factory recipe ${recipePath} is invalid: ${detail}`);
  }
  if (recipe.projectSlug !== input.projectSlug) {
    throw new Error(`English factory recipe ${recipePath} declares ${recipe.projectSlug}, expected ${input.projectSlug}.`);
  }
  if (recipe.schemaVersion !== 2 && recipe.schemaVersion !== 3) {
    throw new Error(`English factory recipe ${recipePath} must use schema version 2 or 3.`);
  }

  const dependencies = new Set<string>([recipeFile.relative]);
  const add = async (value: string, label: string) => {
    dependencies.add((await resolveExistingPath(input.repoRoot, value, label)).relative);
  };
  await add(recipe.source.brightspaceZip, "Brightspace source");
  await add(recipe.source.teacherResourcesZip, "teacher resource source");

  const implementationVisited = new Set<string>();
  for (const entry of [
    "scripts/build-english-unit.ts",
    "scripts/lib/english-unit/factory-build.ts"
  ]) {
    await collectImplementationClosure({
      repoRoot: input.repoRoot,
      entry,
      dependencies,
      visited: implementationVisited
    });
  }

  if (recipe.schemaVersion === 3) {
    const familyPath = `config/english/families/${englishFamilyIdFromCourseCode(recipe.courseCode)}.json`;
    const familyFile = await resolveExistingPath(input.repoRoot, familyPath, "V3 family manifest");
    let family;
    try {
      family = parseEnglishCourseManifest(JSON.parse(await readFile(familyFile.absolute, "utf8")));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`English V3 family manifest ${familyPath} is invalid: ${detail}`);
    }
    if (family.courseCode !== recipe.courseCode || !family.units.some((unit) => unit.projectSlug === recipe.projectSlug)) {
      throw new Error(`English V3 family manifest ${familyPath} does not declare ${recipe.projectSlug} for ${recipe.courseCode}.`);
    }
    dependencies.add(familyFile.relative);
    for (const archive of family.archives.filter((entry) => entry.kind === "supplement")) {
      await add(archive.path, `V3 family supplement ${archive.id}`);
    }

    const derived = await inspectEnglishV3DerivedRecipeDependency({ repoRoot: input.repoRoot, recipe });
    if (derived) {
      await add(derived.recipePath, `derived recipe ${derived.requestedProjectSlug}`);
      await add(derived.sourcePath, `derived source ${derived.requestedProjectSlug}`);
    }
    for (const plan of await inspectEnglishV3DonorLessonPlans({ repoRoot: input.repoRoot, recipe })) {
      for (const dependency of donorPlanInputs(plan)) {
        await add(dependency, `donor input ${plan.requestedProjectSlug}`);
      }
    }
  }

  return [...dependencies].sort(codePointCompare);
}
