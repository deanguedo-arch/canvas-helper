import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { mkdtemp } from "node:fs/promises";
import os from "node:os";

import { fileExists, readJsonFile, removePath, writeTextFile } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";
import { createProjectFixture, cleanupProjectFixture } from "./helpers/project-fixture.js";
import { runAuthoringDeviationGate } from "../lib/intelligence/apply/deviation-gate.js";
import type { AuthoringPreferences } from "../lib/types.js";

test("runAuthoringDeviationGate fails on blocking deviations and writes reports", async () => {
  const slug = "deviation-gate-fail";
  await createProjectFixture({
    slug,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "<body>",
      "<div class=\"source-support-panel\">Visible source support by default.</div>",
      "<p>Paragraph 1</p>",
      "<p>Paragraph 2</p>",
      "<p>Paragraph 3</p>",
      "<p>Paragraph 4</p>",
      "<p>Paragraph 5</p>",
      "</body>",
      "</html>",
      ""
    ].join("\n")
  });
  const projectPaths = getProjectPaths(slug);

  const preferences: AuthoringPreferences = {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "hidden-by-default"
    },
    rules: {
      forbid: [
        {
          id: "forbid-visible-source-support",
          description: "Source support must not be visible by default.",
          pattern: "source-support-panel"
        }
      ]
    },
    quality: {
      maxConsecutiveParagraphBlocks: 3
    },
    learning: {
      defaultScope: "repo"
    }
  };

  try {
    const result = await runAuthoringDeviationGate({
      projectSlug: slug,
      preferences,
      surfaces: [
        {
          kind: "course-html",
          filePath: projectPaths.workspaceEntrypoint
        }
      ]
    });

    assert.equal(result.pass, false);
    assert.ok(result.deviations.some((deviation) => deviation.ruleId === "forbid-visible-source-support"));
    assert.ok(await fileExists(path.join(projectPaths.metaDir, "deviation-report.json")));
    assert.ok(await fileExists(path.join(projectPaths.metaDir, "deviation-report.md")));
  } finally {
    await cleanupProjectFixture(slug);
  }
});

test("runAuthoringDeviationGate supports accepted deviations and updates preferences", async () => {
  const slug = "deviation-gate-accept";
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "deviation-gate-"));
  const repoPreferencesPath = path.join(tempDir, "authoring-preferences.json");
  await writeTextFile(
    repoPreferencesPath,
    JSON.stringify(
      {
        schemaVersion: 1,
        flow: {
          sourceSupportMode: "hidden-by-default"
        },
        rules: {
          forbid: [
            {
              id: "forbid-visible-source-support",
              description: "Source support must not be visible by default.",
              pattern: "source-support-panel"
            }
          ]
        },
        learning: {
          defaultScope: "repo"
        }
      },
      null,
      2
    )
  );

  await createProjectFixture({
    slug,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "<body>",
      "<div class=\"source-support-panel\">Visible source support by default.</div>",
      "</body>",
      "</html>",
      ""
    ].join("\n")
  });

  try {
    const result = await runAuthoringDeviationGate({
      projectSlug: slug,
      repoPreferencesPath,
      surfaces: [
        {
          kind: "course-html",
          filePath: getProjectPaths(slug).workspaceEntrypoint
        }
      ],
      acceptance: {
        acceptDeviations: ["forbid-visible-source-support"],
        because: "Allowed for this rollout",
        updatePreferences: true,
        preferenceScope: "repo"
      }
    });

    assert.equal(result.pass, true);
    assert.equal(result.acceptedDeviations.length, 1);
    const savedPreferences = await readJsonFile<AuthoringPreferences>(repoPreferencesPath);
    assert.ok(savedPreferences.rules?.accepted?.some((entry) => entry.ruleId === "forbid-visible-source-support"));
  } finally {
    await cleanupProjectFixture(slug);
    await removePath(tempDir);
  }
});

test("runAuthoringDeviationGate requires a reason when acceptance is used", async () => {
  const slug = "deviation-gate-reason-required";
  await createProjectFixture({ slug });

  try {
    await assert.rejects(
      () =>
        runAuthoringDeviationGate({
          projectSlug: slug,
          preferences: {
            schemaVersion: 1,
            flow: {
              sourceSupportMode: "hidden-by-default"
            },
            rules: {
              forbid: [
                {
                  id: "forbid-inline-source",
                  description: "No inline source cards",
                  pattern: "source-support-panel"
                }
              ]
            },
            quality: {},
            learning: {
              defaultScope: "repo"
            }
          },
          surfaces: [
            {
              kind: "course-html",
              filePath: getProjectPaths(slug).workspaceEntrypoint
            }
          ],
          acceptance: {
            acceptDeviations: ["all"],
            updatePreferences: false,
            preferenceScope: "repo"
          }
        }),
      /because/i
    );
  } finally {
    await cleanupProjectFixture(slug);
  }
});

test("runAuthoringDeviationGate reports pass when no deviations are found", async () => {
  const slug = "deviation-gate-pass";
  await createProjectFixture({
    slug,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "<body>",
      "<section class=\"lesson-shell\">Interactive section content.</section>",
      "</body>",
      "</html>",
      ""
    ].join("\n")
  });

  try {
    const result = await runAuthoringDeviationGate({
      projectSlug: slug,
      preferences: {
        schemaVersion: 1,
        flow: {
          sourceSupportMode: "hidden-by-default"
        },
        rules: {
          require: [
            {
              id: "require-lesson-shell",
              description: "Lesson shell should exist",
              pattern: "lesson-shell"
            }
          ]
        },
        quality: {},
        learning: {
          defaultScope: "repo"
        }
      },
      surfaces: [
        {
          kind: "course-html",
          filePath: getProjectPaths(slug).workspaceEntrypoint
        }
      ]
    });

    assert.equal(result.pass, true);
    assert.equal(result.deviations.length, 0);
  } finally {
    await cleanupProjectFixture(slug);
  }
});
