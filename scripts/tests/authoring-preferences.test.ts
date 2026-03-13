import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { mkdtemp } from "node:fs/promises";
import os from "node:os";

import { removePath, writeJsonFile } from "../lib/fs.js";
import { createProjectFixture, cleanupProjectFixture } from "./helpers/project-fixture.js";
import { resolveAuthoringPreferences } from "../lib/intelligence/config/authoring-preferences.js";

test("resolveAuthoringPreferences loads repo defaults when no overrides exist", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "authoring-preferences-"));
  const repoPreferencesPath = path.join(tempDir, "authoring-preferences.json");

  await writeJsonFile(repoPreferencesPath, {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "hidden-by-default",
      preferredBenchmarkId: "calm-module-2-workbook"
    },
    quality: {
      maxConsecutiveParagraphBlocks: 5
    }
  });

  try {
    const resolved = await resolveAuthoringPreferences({
      repoPreferencesPath
    });

    assert.equal(resolved.preferences.flow.sourceSupportMode, "hidden-by-default");
    assert.equal(resolved.preferences.flow.preferredBenchmarkId, "calm-module-2-workbook");
    assert.equal(resolved.preferences.quality.maxConsecutiveParagraphBlocks, 5);
    assert.equal(resolved.sourceOrder[0], "repo");
  } finally {
    await removePath(tempDir);
  }
});

test("resolveAuthoringPreferences applies project overrides above repo defaults", async () => {
  const slug = "authoring-preferences-project-override";
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "authoring-preferences-"));
  const repoPreferencesPath = path.join(tempDir, "authoring-preferences.json");
  const projectPreferencesPath = path.join(tempDir, "project-authoring-preferences.json");

  await createProjectFixture({ slug });
  await writeJsonFile(repoPreferencesPath, {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "hidden-by-default"
    },
    quality: {
      maxConsecutiveParagraphBlocks: 7
    }
  });
  await writeJsonFile(projectPreferencesPath, {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "optional"
    },
    quality: {
      maxConsecutiveParagraphBlocks: 3
    }
  });

  try {
    const resolved = await resolveAuthoringPreferences({
      projectSlug: slug,
      repoPreferencesPath,
      projectPreferencesPath
    });

    assert.equal(resolved.preferences.flow.sourceSupportMode, "optional");
    assert.equal(resolved.preferences.quality.maxConsecutiveParagraphBlocks, 3);
    assert.deepEqual(resolved.sourceOrder.slice(0, 2), ["repo", "project"]);
  } finally {
    await cleanupProjectFixture(slug);
    await removePath(tempDir);
  }
});

test("resolveAuthoringPreferences applies benchmark defaults above repo but below project", async () => {
  const slug = "authoring-preferences-benchmark";
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "authoring-preferences-"));
  const repoPreferencesPath = path.join(tempDir, "authoring-preferences.json");
  const benchmarkSelectionPath = path.join(tempDir, "benchmark-selection.json");

  await createProjectFixture({ slug });
  await writeJsonFile(repoPreferencesPath, {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "visible"
    },
    quality: {
      maxConsecutiveParagraphBlocks: 8
    }
  });
  await writeJsonFile(benchmarkSelectionPath, {
    benchmarkId: "calm-module-2-workbook"
  });

  try {
    const resolved = await resolveAuthoringPreferences({
      projectSlug: slug,
      repoPreferencesPath,
      benchmarkSelectionPath
    });

    assert.equal(resolved.preferences.flow.preferredBenchmarkId, "calm-module-2-workbook");
    assert.equal(resolved.preferences.flow.sourceSupportMode, "hidden-by-default");
    assert.equal(resolved.preferences.quality.maxConsecutiveParagraphBlocks, 8);
    assert.deepEqual(resolved.sourceOrder.slice(0, 2), ["repo", "benchmark"]);
  } finally {
    await cleanupProjectFixture(slug);
    await removePath(tempDir);
  }
});

test("resolveAuthoringPreferences applies cli overrides with highest precedence", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "authoring-preferences-"));
  const repoPreferencesPath = path.join(tempDir, "authoring-preferences.json");

  await writeJsonFile(repoPreferencesPath, {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "optional"
    },
    quality: {
      maxConsecutiveParagraphBlocks: 5
    }
  });

  try {
    const resolved = await resolveAuthoringPreferences({
      repoPreferencesPath,
      cliOverride: {
        flow: {
          sourceSupportMode: "hidden-by-default"
        },
        quality: {
          maxConsecutiveParagraphBlocks: 2
        }
      }
    });

    assert.equal(resolved.preferences.flow.sourceSupportMode, "hidden-by-default");
    assert.equal(resolved.preferences.quality.maxConsecutiveParagraphBlocks, 2);
    assert.equal(resolved.sourceOrder[resolved.sourceOrder.length - 1], "cli");
  } finally {
    await removePath(tempDir);
  }
});
