import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { cleanupProjectFixture, createProjectFixture } from "./helpers/project-fixture.js";
import { writeJsonFile, removePath } from "../lib/fs.js";
import { loadBenchmarkBundle, loadBenchmarkRecord } from "../lib/benchmarks/load.js";
import { resolveProjectBenchmarkSelection } from "../lib/benchmarks/project-selection.js";
import { generatePromptPack } from "../lib/intelligence/apply/prompt-pack.js";
import {
  validateBenchmarkRecord,
  validateRecipeRecord
} from "../lib/benchmarks/validate.js";

test("validateBenchmarkRecord accepts a complete benchmark record", () => {
  const benchmark = validateBenchmarkRecord({
    id: "calm-module-2-workbook",
    label: "CALM Module 2 Workbook",
    sourceProjectSlug: "calm-module-2-activites-reference",
    status: "approved",
    tags: ["workbook", "reflection-driven", "scenario-heavy"],
    intendedUse: ["module rebuilds", "course conversion"],
    visualSystem: {
      surface: "module-2-workbook",
      palette: "hss-blue-slate",
      typography: "workbook-sans"
    },
    sectionFlow: ["learn", "apply", "reflect", "deepen"],
    activityFamilies: ["sort-and-check", "scenario-branch"],
    checkpointFamilies: ["teacher-checkpoint"],
    sourceSupportPolicy: {
      mode: "hidden-by-default"
    },
    recipeRefs: [
      {
        id: "lesson-hero",
        purpose: "section launch"
      },
      {
        id: "learn-apply-reflect",
        purpose: "default section shell"
      }
    ]
  });

  assert.equal(benchmark.id, "calm-module-2-workbook");
  assert.equal(benchmark.sourceSupportPolicy.mode, "hidden-by-default");
  assert.equal(benchmark.recipeRefs.length, 2);
});

test("validateRecipeRecord accepts a complete recipe record", () => {
  const recipe = validateRecipeRecord({
    id: "teacher-checkpoint",
    family: "checkpoint",
    inputs: ["prompt", "saveKey"],
    optionalInputs: ["hint", "successCriteria"],
    renderingRules: ["Render an amber checkpoint panel with a textarea."],
    interactionRules: ["Persist learner input with the provided save key."],
    persistenceRules: ["Store textarea values in workspace state."],
    constraints: ["Must not require source support to be visible."]
  });

  assert.equal(recipe.id, "teacher-checkpoint");
  assert.equal(recipe.family, "checkpoint");
  assert.deepEqual(recipe.inputs, ["prompt", "saveKey"]);
});

test("validateBenchmarkRecord rejects missing required fields with actionable errors", () => {
  assert.throws(
    () =>
      validateBenchmarkRecord({
        id: "",
        label: "",
        sourceProjectSlug: "",
        status: "approved",
        tags: [],
        intendedUse: [],
        visualSystem: {
          surface: "",
          palette: "",
          typography: ""
        },
        sectionFlow: [],
        activityFamilies: [],
        checkpointFamilies: [],
        sourceSupportPolicy: {
          mode: "hidden-by-default"
        },
        recipeRefs: []
      }),
    (error: unknown) => {
      assert.match(String(error), /benchmark\.id/i);
      assert.match(String(error), /benchmark\.label/i);
      assert.match(String(error), /benchmark\.visualSystem\.surface/i);
      assert.match(String(error), /benchmark\.recipeRefs/i);
      return true;
    }
  );
});

test("loadBenchmarkRecord loads a benchmark by id and resolves its recipes", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-benchmarks-"));
  const registryDir = path.join(fixtureRoot, "registry");
  const recipesDir = path.join(fixtureRoot, "recipes");

  await writeJsonFile(path.join(registryDir, "calm-module-2-workbook.json"), {
    id: "calm-module-2-workbook",
    label: "CALM Module 2 Workbook",
    sourceProjectSlug: "calm-module-2-activites-reference",
    status: "approved",
    tags: ["workbook"],
    intendedUse: ["module rebuilds"],
    visualSystem: {
      surface: "module-2-workbook",
      palette: "hss-blue-slate",
      typography: "workbook-sans"
    },
    sectionFlow: ["learn", "apply", "reflect"],
    activityFamilies: ["sort-and-check"],
    checkpointFamilies: ["teacher-checkpoint"],
    sourceSupportPolicy: {
      mode: "hidden-by-default"
    },
    recipeRefs: [
      {
        id: "lesson-hero",
        purpose: "section launch"
      },
      {
        id: "learn-apply-reflect",
        purpose: "section shell"
      }
    ]
  });

  await writeJsonFile(path.join(recipesDir, "lesson-hero.json"), {
    id: "lesson-hero",
    family: "shell",
    inputs: ["title", "summary"],
    optionalInputs: [],
    renderingRules: ["Render the section title and intro."],
    interactionRules: ["No interaction."],
    persistenceRules: ["No persistence."],
    constraints: ["Use at the top of each section."]
  });

  await writeJsonFile(path.join(recipesDir, "learn-apply-reflect.json"), {
    id: "learn-apply-reflect",
    family: "lesson-flow",
    inputs: ["learnBlocks", "practiceBlocks", "reflectionPrompt"],
    optionalInputs: ["sourceSupport"],
    renderingRules: ["Render learn, apply, and reflect in order."],
    interactionRules: ["Allow inline checks in the apply stage."],
    persistenceRules: ["Persist reflection state."],
    constraints: ["Reflection must come after application."]
  });

  try {
    const benchmark = await loadBenchmarkRecord({
      benchmarkId: "calm-module-2-workbook",
      registryDir
    });
    const bundle = await loadBenchmarkBundle({
      benchmarkId: "calm-module-2-workbook",
      registryDir,
      recipesDir
    });

    assert.equal(benchmark.id, "calm-module-2-workbook");
    assert.equal(bundle.benchmark.label, "CALM Module 2 Workbook");
    assert.deepEqual(
      bundle.recipes.map((recipe) => recipe.id),
      ["lesson-hero", "learn-apply-reflect"]
    );
  } finally {
    await removePath(fixtureRoot);
  }
});

test("loadBenchmarkBundle fails cleanly when a referenced recipe file is missing", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-benchmarks-"));
  const registryDir = path.join(fixtureRoot, "registry");
  const recipesDir = path.join(fixtureRoot, "recipes");

  await writeJsonFile(path.join(registryDir, "calm-module-2-workbook.json"), {
    id: "calm-module-2-workbook",
    label: "CALM Module 2 Workbook",
    sourceProjectSlug: "calm-module-2-activites-reference",
    status: "approved",
    tags: ["workbook"],
    intendedUse: ["module rebuilds"],
    visualSystem: {
      surface: "module-2-workbook",
      palette: "hss-blue-slate",
      typography: "workbook-sans"
    },
    sectionFlow: ["learn", "apply", "reflect"],
    activityFamilies: ["sort-and-check"],
    checkpointFamilies: ["teacher-checkpoint"],
    sourceSupportPolicy: {
      mode: "hidden-by-default"
    },
    recipeRefs: [
      {
        id: "lesson-hero",
        purpose: "section launch"
      }
    ]
  });

  try {
    await assert.rejects(
      () =>
        loadBenchmarkBundle({
          benchmarkId: "calm-module-2-workbook",
          registryDir,
          recipesDir
        }),
      /lesson-hero/i
    );
  } finally {
    await removePath(fixtureRoot);
  }
});

test("resolveProjectBenchmarkSelection loads a project's selected benchmark", async () => {
  const slug = "benchmark-selection-fixture";
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-benchmarks-"));
  const registryDir = path.join(fixtureRoot, "registry");
  const recipesDir = path.join(fixtureRoot, "recipes");

  await createProjectFixture({ slug });
  await writeJsonFile(path.join("projects", slug, "meta", "benchmark-selection.json"), {
    benchmarkId: "calm-module-2-workbook",
    sourceSupportMode: "hidden-by-default",
    notes: ["Adopt workbook surface for the study side."]
  });

  await writeJsonFile(path.join(registryDir, "calm-module-2-workbook.json"), {
    id: "calm-module-2-workbook",
    label: "CALM Module 2 Workbook",
    sourceProjectSlug: "calm-module-2-activites-reference",
    status: "approved",
    tags: ["workbook"],
    intendedUse: ["module rebuilds"],
    visualSystem: {
      surface: "module-2-workbook",
      palette: "hss-blue-slate",
      typography: "workbook-sans"
    },
    sectionFlow: ["learn", "apply", "reflect"],
    activityFamilies: ["sort-and-check"],
    checkpointFamilies: ["teacher-checkpoint"],
    sourceSupportPolicy: {
      mode: "hidden-by-default"
    },
    recipeRefs: [
      {
        id: "lesson-hero",
        purpose: "section launch"
      }
    ]
  });

  await writeJsonFile(path.join(recipesDir, "lesson-hero.json"), {
    id: "lesson-hero",
    family: "shell",
    inputs: ["title", "summary"],
    optionalInputs: [],
    renderingRules: ["Render the section title and intro."],
    interactionRules: ["No interaction."],
    persistenceRules: ["No persistence."],
    constraints: ["Use at the top of each section."]
  });

  try {
    const resolved = await resolveProjectBenchmarkSelection({
      projectSlug: slug,
      registryDir,
      recipesDir
    });

    assert.equal(resolved.selection?.benchmarkId, "calm-module-2-workbook");
    assert.equal(resolved.bundle?.benchmark.id, "calm-module-2-workbook");
    assert.deepEqual(resolved.bundle?.recipes.map((recipe) => recipe.id), ["lesson-hero"]);
  } finally {
    await cleanupProjectFixture(slug);
    await removePath(fixtureRoot);
  }
});

test("resolveProjectBenchmarkSelection returns null when a project has no selection file", async () => {
  const slug = "benchmark-selection-missing";

  await createProjectFixture({ slug });

  try {
    const resolved = await resolveProjectBenchmarkSelection({
      projectSlug: slug
    });

    assert.equal(resolved.selection, null);
    assert.equal(resolved.bundle, null);
  } finally {
    await cleanupProjectFixture(slug);
  }
});

test("resolveProjectBenchmarkSelection rejects unknown benchmark ids", async () => {
  const slug = "benchmark-selection-invalid";
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-benchmarks-"));
  const registryDir = path.join(fixtureRoot, "registry");
  const recipesDir = path.join(fixtureRoot, "recipes");

  await createProjectFixture({ slug });
  await writeJsonFile(path.join("projects", slug, "meta", "benchmark-selection.json"), {
    benchmarkId: "missing-benchmark"
  });

  try {
    await assert.rejects(
      () =>
        resolveProjectBenchmarkSelection({
          projectSlug: slug,
          registryDir,
          recipesDir
        }),
      /missing-benchmark/i
    );
  } finally {
    await cleanupProjectFixture(slug);
    await removePath(fixtureRoot);
  }
});

test("the calm-module-2-workbook benchmark is registered with workbook recipes", async () => {
  const bundle = await loadBenchmarkBundle({
    benchmarkId: "calm-module-2-workbook"
  });

  assert.equal(bundle.benchmark.sourceProjectSlug, "calm-module-2-activites-reference");
  assert.equal(bundle.benchmark.sourceSupportPolicy.mode, "hidden-by-default");
  assert.deepEqual(
    bundle.recipes.map((recipe) => recipe.id),
    ["lesson-hero", "learn-apply-reflect", "teacher-checkpoint", "source-support-drawer"]
  );
});

test("generatePromptPack includes selected benchmark context when a project opts in", async () => {
  const slug = "benchmark-prompt-pack";

  await createProjectFixture({ slug });
  await writeJsonFile(path.join("projects", slug, "meta", "benchmark-selection.json"), {
    benchmarkId: "calm-module-2-workbook",
    sourceSupportMode: "hidden-by-default",
    notes: ["Use Module 2 workbook framing for the study side."]
  });

  try {
    const result = await generatePromptPack(slug, {
      mode: "apply",
      source: "repo-default",
      collectPatternBank: false,
      collectMemoryLedger: false,
      applyPatternBankToPromptPack: false,
      applyMemoryLedgerToPromptPack: false,
      applyMemoryLedgerToRecommendations: false
    });

    const output = await readFile(result.outputPath, "utf8");
    assert.match(output, /## Selected Benchmark/i);
    assert.match(output, /calm-module-2-workbook/i);
    assert.match(output, /hidden-by-default/i);
  } finally {
    await cleanupProjectFixture(slug);
  }
});
