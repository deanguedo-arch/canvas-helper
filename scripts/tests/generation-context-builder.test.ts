import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  MAX_GENERATION_CONTEXT_BYTES,
  MAX_GENERATION_CONTEXT_IDS,
  buildGenerationContext,
  parseGenerationContextIds
} from "../lib/engine/context-builder.js";
import { getProjectPaths } from "../lib/paths.js";
import type { ProjectPaths } from "../lib/types.js";

const FORENSICS_RESOURCE_ID = "assignment-i0d13383d-713c-4b67-989e-833b135fa42b-assignment-47c57ef5-f797-429b-8a84-73246e9fc1d9-xml";
const FORENSICS_LESSON_ID = "unit-1--analyze-historical-crime-cases-and-or-fictional-crime-cases-that-involves-forensic-toxicology";

async function createFixture() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-generation-context-"));
  const slug = "course";
  const projectRoot = path.join(repoRoot, "projects", slug);
  const workspaceDir = path.join(projectRoot, "workspace");
  const metaDir = path.join(projectRoot, "meta");
  await Promise.all([mkdir(workspaceDir, { recursive: true }), mkdir(metaDir, { recursive: true })]);
  await writeFile(path.join(workspaceDir, "index.html"), "<main>course</main>", "utf8");
  await writeFile(
    path.join(metaDir, "project.json"),
    `${JSON.stringify(
      {
        id: slug,
        slug,
        sourcePath: path.join(repoRoot, "source.html"),
        inputKind: "html",
        brightspaceTarget: "course-page",
        previewModes: ["workspace"],
        workspaceEntrypoint: path.join(workspaceDir, "index.html"),
        rawEntrypoint: path.join(projectRoot, "raw", "original.html"),
        learningSource: "other",
        learningTrust: "auto",
        learningUpdatedAt: "2026-08-02T00:00:00.000Z",
        createdAt: "2026-08-02T00:00:00.000Z",
        updatedAt: "2026-08-02T00:00:00.000Z",
        migrationState: "migrated",
        projectType: "generated-course",
        preferredWorkflows: ["generated-course"],
        canonicalEntry: `projects/${slug}/workspace/index.html`,
        canonicalSources: [`projects/${slug}/workspace/index.html`],
        authoringStatus: "active",
        exportTargets: [{ target: "scorm", enabled: true }]
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  return {
    repoRoot,
    slug,
    metaDir,
    roots: { root: projectRoot, workspaceDir, metaDir } as ProjectPaths
  };
}

test("builds a compact source-aware context without automatic artifact stacking", async () => {
  const context = await buildGenerationContext({
    slug: "forensics35",
    roots: getProjectPaths("forensics35")
  });

  assert.match(context, /production artifact assistant/i);
  assert.match(context, /import -> normalize -> edit -> expand -> integrate -> export/);
  assert.match(context, /projects\/forensics35\/workspace\/index\.html/);
  assert.match(context, /canonical editable sources/i);
  assert.doesNotMatch(context, /"resources"\s*:\s*\[/);
  assert.doesNotMatch(context, /"originalPath"/);
  assert.ok(Buffer.byteLength(context, "utf8") <= MAX_GENERATION_CONTEXT_BYTES);
});

test("adds only explicitly selected stable-ID evidence without leaking source-machine paths", async () => {
  const context = await buildGenerationContext({
    slug: "forensics35",
    roots: getProjectPaths("forensics35"),
    contextIds: [
      "unit:unit-1",
      `resource:${FORENSICS_RESOURCE_ID}`,
      `lesson:${FORENSICS_LESSON_ID}`
    ]
  });

  assert.match(context, /## Selected unit evidence: unit-1/);
  assert.match(context, new RegExp(`## Selected resource evidence: ${FORENSICS_RESOURCE_ID}`));
  assert.match(context, new RegExp(`## Selected lesson evidence: ${FORENSICS_LESSON_ID}`));
  assert.match(context, /"relativePath"/);
  assert.match(context, /"sourceReferences"/);
  assert.doesNotMatch(context, /"originalPath"/);
  assert.doesNotMatch(context, /"packetPath"/);
  assert.ok(Buffer.byteLength(context, "utf8") <= MAX_GENERATION_CONTEXT_BYTES);
});

test("rejects malformed, duplicated, and oversized selection lists", () => {
  assert.deepEqual(parseGenerationContextIds(["unit:unit-1", "resource:resource-1"]), ["unit:unit-1", "resource:resource-1"]);
  assert.throws(() => parseGenerationContextIds(["resource:../raw/original.html"]), /Context IDs must use/);
  assert.throws(() => parseGenerationContextIds(["unit:unit-1", "unit:unit-1"]), /duplicated/);
  assert.throws(
    () => parseGenerationContextIds(Array.from({ length: MAX_GENERATION_CONTEXT_IDS + 1 }, (_, index) => `unit:unit-${index}`)),
    /At most/
  );
});

test("fails instead of truncating selected multibyte evidence past the server byte limit", async () => {
  const fixture = await createFixture();
  try {
    await writeFile(
      path.join(fixture.metaDir, "course-blueprint.json"),
      JSON.stringify({ units: [{ id: "unit-1", title: "😀".repeat(MAX_GENERATION_CONTEXT_BYTES) }], outcomes: [] }),
      "utf8"
    );

    await assert.rejects(
      buildGenerationContext({
        slug: fixture.slug,
        roots: fixture.roots,
        repoRoot: fixture.repoRoot,
        contextIds: ["unit:unit-1"]
      }),
      /UTF-8 bytes; the limit is/
    );
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("fails closed for an unknown selected ID", async () => {
  await assert.rejects(
    buildGenerationContext({
      slug: "forensics35",
      roots: getProjectPaths("forensics35"),
      contextIds: ["resource:not-a-real-resource"]
    }),
    /Unknown resource context ID/
  );
});
