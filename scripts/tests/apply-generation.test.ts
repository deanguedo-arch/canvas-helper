import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { applyGeneration, assertGenerationWriteEligible } from "../lib/engine/apply-generation.js";
import type { ProjectPaths } from "../lib/types.js";

type FixtureOptions = {
  englishFactory?: boolean;
  legacyWindowsPath?: boolean;
  proposalOnly?: boolean;
};

async function createFixture(options: FixtureOptions = {}) {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-apply-generation-"));
  const slug = "course";
  const projectRoot = path.join(repoRoot, "projects", slug);
  const workspaceDir = path.join(projectRoot, "workspace");
  const metaDir = path.join(projectRoot, "meta");
  const indexPath = path.join(workspaceDir, "index.html");
  const rawPath = path.join(projectRoot, "raw", "original.html");
  await Promise.all([
    mkdir(workspaceDir, { recursive: true }),
    mkdir(metaDir, { recursive: true }),
    mkdir(path.dirname(rawPath), { recursive: true }),
    mkdir(path.join(projectRoot, "exports"), { recursive: true })
  ]);
  await Promise.all([
    writeFile(indexPath, "<main>original</main>", "utf8"),
    writeFile(rawPath, "<main>raw</main>", "utf8")
  ]);

  const workspaceSource = `projects/${slug}/workspace/index.html`;
  const legacyWorkspaceSource = `C:\\work\\${path.basename(repoRoot)}\\projects\\${slug}\\workspace\\index.html`;
  const proposalSource = `projects/${slug}/meta/proposal.md`;
  if (options.proposalOnly) {
    await writeFile(path.join(metaDir, "proposal.md"), "proposal source", "utf8");
  }
  if (options.englishFactory) {
    await mkdir(path.join(repoRoot, "scripts", "lib", "english-unit"), { recursive: true });
    await Promise.all([
      writeFile(path.join(metaDir, "english-unit.json"), "{}", "utf8"),
      writeFile(path.join(repoRoot, "scripts", "build-english-unit.ts"), "export {};", "utf8"),
      writeFile(path.join(repoRoot, "scripts", "lib", "english-unit", "factory-build.ts"), "export {};", "utf8"),
      writeFile(path.join(repoRoot, "scripts", "lib", "english-unit", "workspace-staging.ts"), "export {};", "utf8")
    ]);
  }

  const canonicalSource = options.proposalOnly
    ? proposalSource
    : options.legacyWindowsPath
      ? legacyWorkspaceSource
      : workspaceSource;
  const manifest = {
    id: slug,
    slug,
    sourcePath: path.join(repoRoot, "source.html"),
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["workspace"],
    workspaceEntrypoint: indexPath,
    rawEntrypoint: rawPath,
    learningSource: "other",
    learningTrust: "auto",
    learningUpdatedAt: "2026-08-02T00:00:00.000Z",
    createdAt: "2026-08-02T00:00:00.000Z",
    updatedAt: "2026-08-02T00:00:00.000Z",
    migrationState: "migrated",
    projectType: "generated-course",
    preferredWorkflows: ["generated-course"],
    canonicalEntry: canonicalSource,
    canonicalSources: [canonicalSource],
    authoringStatus: "active",
    exportTargets: [{ target: "scorm", enabled: true }],
    ...(options.englishFactory ? { regenerateCommand: `npm run build:english-unit -- --project ${slug}` } : {})
  };
  const manifestPath = path.join(metaDir, "project.json");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return {
    repoRoot,
    slug,
    indexPath,
    rawPath,
    manifestPath,
    roots: { root: projectRoot, workspaceDir, metaDir } as ProjectPaths
  };
}

function responseFor(relativePath: string, content: string) {
  return `**${relativePath}**\n\`\`\`html\n${content}\n\`\`\``;
}

test("writes only an exact declared canonical workspace file", async () => {
  const fixture = await createFixture();
  try {
    const applied = await applyGeneration({
      slug: fixture.slug,
      roots: fixture.roots,
      repoRoot: fixture.repoRoot,
      llmResponse: responseFor("workspace/index.html", "<main>updated</main>")
    });

    assert.deepEqual(applied, [{ relativePath: "workspace/index.html", content: "<main>updated</main>\n" }]);
    assert.equal(await readFile(fixture.indexPath, "utf8"), "<main>updated</main>\n");
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("validates every generated target before changing any file", async () => {
  const fixture = await createFixture();
  try {
    const response = [
      responseFor("workspace/index.html", "<main>should-not-write</main>"),
      responseFor("workspace/not-declared.html", "<main>blocked</main>")
    ].join("\n\n");

    await assert.rejects(
      applyGeneration({ slug: fixture.slug, roots: fixture.roots, repoRoot: fixture.repoRoot, llmResponse: response }),
      /not a declared canonical editable source/
    );
    assert.equal(await readFile(fixture.indexPath, "utf8"), "<main>original</main>");
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("rejects raw, exports, traversal, and non-workspace targets", async () => {
  const fixture = await createFixture();
  try {
    for (const target of [
      "workspace/../raw/original.html",
      "workspace/../exports/index.html",
      "projects/course/raw/original.html"
    ]) {
      await assert.rejects(
        applyGeneration({
          slug: fixture.slug,
          roots: fixture.roots,
          repoRoot: fixture.repoRoot,
          llmResponse: responseFor(target, "<main>blocked</main>")
        }),
        /unsafe path segment|must begin with workspace/
      );
    }
    assert.equal(await readFile(fixture.rawPath, "utf8"), "<main>raw</main>");
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("rejects a canonical workspace symlink that resolves into raw content", async () => {
  const fixture = await createFixture();
  try {
    await rm(fixture.indexPath);
    await symlink("../raw/original.html", fixture.indexPath);

    await assert.rejects(
      assertGenerationWriteEligible({ slug: fixture.slug, roots: fixture.roots, repoRoot: fixture.repoRoot }),
      /resolves outside the workspace through a symbolic link/
    );
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("keeps factory and proposal-only projects out of the automatic writer", async (t) => {
  await t.test("English factory output", async () => {
    const fixture = await createFixture({ englishFactory: true });
    try {
      await assert.rejects(
        assertGenerationWriteEligible({ slug: fixture.slug, roots: fixture.roots, repoRoot: fixture.repoRoot }),
        /proposal-only for english-factory-v1/
      );
    } finally {
      await rm(fixture.repoRoot, { recursive: true, force: true });
    }
  });

  await t.test("mixed-source proposal", async () => {
    const fixture = await createFixture({ proposalOnly: true });
    try {
      await assert.rejects(
        assertGenerationWriteEligible({ slug: fixture.slug, roots: fixture.roots, repoRoot: fixture.repoRoot }),
        /proposal-only for proposal-only-v1/
      );
    } finally {
      await rm(fixture.repoRoot, { recursive: true, force: true });
    }
  });
});

test("evaluates legacy Windows paths in memory without rewriting the manifest", async () => {
  const fixture = await createFixture({ legacyWindowsPath: true });
  try {
    await applyGeneration({
      slug: fixture.slug,
      roots: fixture.roots,
      repoRoot: fixture.repoRoot,
      llmResponse: responseFor("workspace/index.html", "<main>legacy-safe</main>")
    });

    const manifest = await readFile(fixture.manifestPath, "utf8");
    assert.match(manifest, /C:\\\\work\\\\/);
    assert.equal(await readFile(fixture.indexPath, "utf8"), "<main>legacy-safe</main>\n");
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});
