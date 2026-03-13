import path from "node:path";

import { fileExists, readJsonFile } from "../fs.js";
import { repoRoot } from "../paths.js";
import type { BenchmarkRecord, RecipeRecord } from "./types.js";
import { validateBenchmarkRecord, validateRecipeRecord } from "./validate.js";

export const benchmarkRegistryDir = path.join(repoRoot, "scripts", "lib", "benchmarks", "registry");
export const benchmarkRecipesDir = path.join(repoRoot, "scripts", "lib", "benchmarks", "recipes");

type LoadBenchmarkRecordOptions = {
  benchmarkId: string;
  registryDir?: string;
};

type LoadRecipeRecordOptions = {
  recipeId: string;
  recipesDir?: string;
};

type LoadBenchmarkBundleOptions = {
  benchmarkId: string;
  registryDir?: string;
  recipesDir?: string;
};

export async function loadBenchmarkRecord(options: LoadBenchmarkRecordOptions): Promise<BenchmarkRecord> {
  const registryDir = options.registryDir ?? benchmarkRegistryDir;
  const filePath = path.join(registryDir, `${options.benchmarkId}.json`);

  if (!(await fileExists(filePath))) {
    throw new Error(`Benchmark file not found for "${options.benchmarkId}": ${filePath}`);
  }

  const input = await readJsonFile<unknown>(filePath);
  return validateBenchmarkRecord(input);
}

export async function loadRecipeRecord(options: LoadRecipeRecordOptions): Promise<RecipeRecord> {
  const recipesDir = options.recipesDir ?? benchmarkRecipesDir;
  const filePath = path.join(recipesDir, `${options.recipeId}.json`);

  if (!(await fileExists(filePath))) {
    throw new Error(`Recipe file not found for "${options.recipeId}": ${filePath}`);
  }

  const input = await readJsonFile<unknown>(filePath);
  return validateRecipeRecord(input);
}

export async function loadBenchmarkBundle(options: LoadBenchmarkBundleOptions) {
  const benchmark = await loadBenchmarkRecord({
    benchmarkId: options.benchmarkId,
    registryDir: options.registryDir
  });

  const recipes = await Promise.all(
    benchmark.recipeRefs.map((recipeRef) =>
      loadRecipeRecord({
        recipeId: recipeRef.id,
        recipesDir: options.recipesDir
      })
    )
  );

  return {
    benchmark,
    recipes
  };
}
