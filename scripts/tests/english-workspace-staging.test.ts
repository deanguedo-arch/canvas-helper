import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  stageAndPromoteEnglishWorkspace,
  type EnglishFactoryOwnedPath,
  type EnglishWorkspaceBuildMetadata
} from "../lib/english-unit/workspace-staging.js";

const OWNED_PATHS: EnglishFactoryOwnedPath[] = [
  { path: "index.html", kind: "file" },
  { path: "assets/generated", kind: "directory" },
  { path: "resources/generated", kind: "directory" }
];

const METADATA: EnglishWorkspaceBuildMetadata = {
  projectSlug: "ela20-1-staging-test",
  generatedAt: "2026-07-14T12:00:00.000Z",
  profile: { id: "next-step-english", version: "1.0.0", sha256: "a".repeat(64) },
  recipe: { path: "meta/english-unit.json", sha256: "b".repeat(64) },
  sources: [{ id: "brightspace", path: "sources/brightspace.zip", sha256: "c".repeat(64) }],
  reviewItems: []
};

async function writeWorkspaceFile(workspaceDir: string, relativePath: string, content: string): Promise<void> {
  const filePath = path.join(workspaceDir, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function assertNoTransactionDirectories(projectDir: string): Promise<void> {
  const entries = await readdir(projectDir);
  assert.deepEqual(entries.filter((entry) => entry.startsWith(".english-workspace-transaction-")), []);
}

test("staged English promotion replaces only owned outputs and preserves custom sources", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "english-workspace-staging-"));
  const projectDir = path.join(tempDir, "project");
  const workspaceDir = path.join(projectDir, "workspace");
  const componentContent = "<section>Teacher-authored character tracker</section>";
  const customAssetContent = "<svg><title>Custom motif marker</title></svg>";

  try {
    await writeWorkspaceFile(workspaceDir, "index.html", "<!doctype html><html><body>Old workspace</body></html>");
    await writeWorkspaceFile(workspaceDir, "assets/generated/old.js", "old generated asset");
    await writeWorkspaceFile(workspaceDir, "resources/generated/old.json", '{"old":true}');
    await writeWorkspaceFile(workspaceDir, "components/character-tracker.html", componentContent);
    await writeWorkspaceFile(workspaceDir, "assets/custom/motif.svg", customAssetContent);
    await writeWorkspaceFile(workspaceDir, "assets/unowned/keep.txt", "not factory owned");

    const result = await stageAndPromoteEnglishWorkspace({
      workspaceDir,
      ownedPaths: OWNED_PATHS,
      metadata: METADATA,
      async buildStage({ stageDir, preservedCustomFiles }) {
        assert.equal(
          await readFile(path.join(stageDir, "components/character-tracker.html"), "utf8"),
          componentContent,
          "custom components are available to the staged renderer"
        );
        assert.equal(preservedCustomFiles.length, 2);
        await writeWorkspaceFile(
          stageDir,
          "index.html",
          '<!doctype html><html><body data-factory-build="new">New workspace</body></html>'
        );
        await writeWorkspaceFile(stageDir, "assets/generated/runtime.js", "new generated asset");
        await writeWorkspaceFile(stageDir, "resources/generated/mapping.json", '{"new":true}');
        await writeWorkspaceFile(
          stageDir,
          "components/character-tracker.html",
          "stage-local mutation must not replace canonical custom source"
        );
      },
      validateIndex({ html }) {
        assert.match(html, /data-factory-build="new"/);
      }
    });

    assert.match(await readFile(path.join(workspaceDir, "index.html"), "utf8"), /New workspace/);
    assert.equal(await fileExists(path.join(workspaceDir, "assets/generated/old.js")), false);
    assert.equal(await fileExists(path.join(workspaceDir, "resources/generated/old.json")), false);
    assert.equal(await readFile(path.join(workspaceDir, "assets/generated/runtime.js"), "utf8"), "new generated asset");
    assert.equal(await readFile(path.join(workspaceDir, "resources/generated/mapping.json"), "utf8"), '{"new":true}');
    assert.equal(await readFile(path.join(workspaceDir, "components/character-tracker.html"), "utf8"), componentContent);
    assert.equal(await readFile(path.join(workspaceDir, "assets/custom/motif.svg"), "utf8"), customAssetContent);
    assert.equal(await readFile(path.join(workspaceDir, "assets/unowned/keep.txt"), "utf8"), "not factory owned");

    assert.deepEqual(result.manifest.ownedFiles, [
      "assets/generated/runtime.js",
      "index.html",
      "resources/generated/mapping.json"
    ]);
    assert.deepEqual(result.preservedCustomFileHashes, [
      { path: "assets/custom/motif.svg", sha256: sha256(customAssetContent) },
      { path: "components/character-tracker.html", sha256: sha256(componentContent) }
    ]);
    assert.deepEqual(
      result.manifest.components,
      result.preservedCustomFileHashes.map((file) => ({ id: file.path, source: file.path, sha256: file.sha256 }))
    );
    assert.equal(result.ownedFileHashes.length, 3);
    assert.equal(result.manifest.generatedAt, "2026-07-14T12:00:00.000Z");
    await assertNoTransactionDirectories(projectDir);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("invalid staged index leaves the prior English workspace untouched", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "english-workspace-invalid-"));
  const projectDir = path.join(tempDir, "project");
  const workspaceDir = path.join(projectDir, "workspace");
  const priorIndex = "<!doctype html><html><body>Known-good workspace</body></html>";

  try {
    await writeWorkspaceFile(workspaceDir, "index.html", priorIndex);
    await writeWorkspaceFile(workspaceDir, "assets/generated/runtime.js", "known-good asset");
    await writeWorkspaceFile(workspaceDir, "resources/generated/mapping.json", '{"knownGood":true}');
    await writeWorkspaceFile(workspaceDir, "components/custom.html", "known-good custom component");

    await assert.rejects(
      stageAndPromoteEnglishWorkspace({
        workspaceDir,
        ownedPaths: OWNED_PATHS,
        metadata: METADATA,
        async buildStage({ stageDir }) {
          await writeWorkspaceFile(stageDir, "index.html", "<html><body>Incomplete staged document");
          await writeWorkspaceFile(stageDir, "assets/generated/runtime.js", "unvalidated replacement");
          await writeWorkspaceFile(stageDir, "resources/generated/mapping.json", '{"unvalidated":true}');
        }
      }),
      /not a complete HTML document/
    );

    assert.equal(await readFile(path.join(workspaceDir, "index.html"), "utf8"), priorIndex);
    assert.equal(await readFile(path.join(workspaceDir, "assets/generated/runtime.js"), "utf8"), "known-good asset");
    assert.equal(await readFile(path.join(workspaceDir, "resources/generated/mapping.json"), "utf8"), '{"knownGood":true}');
    assert.equal(await readFile(path.join(workspaceDir, "components/custom.html"), "utf8"), "known-good custom component");
    await assertNoTransactionDirectories(projectDir);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("staged build failure leaves prior output untouched and cleans its transaction", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "english-workspace-build-failure-"));
  const projectDir = path.join(tempDir, "project");
  const workspaceDir = path.join(projectDir, "workspace");

  try {
    await writeWorkspaceFile(workspaceDir, "index.html", "<!doctype html><html><body>Prior output</body></html>");
    await writeWorkspaceFile(workspaceDir, "assets/generated/runtime.js", "prior runtime");
    await writeWorkspaceFile(workspaceDir, "resources/generated/mapping.json", "prior mapping");
    await writeWorkspaceFile(workspaceDir, "assets/custom/teacher.css", "teacher customization");

    await assert.rejects(
      stageAndPromoteEnglishWorkspace({
        workspaceDir,
        ownedPaths: OWNED_PATHS,
        metadata: METADATA,
        async buildStage({ stageDir }) {
          await writeWorkspaceFile(stageDir, "index.html", "<!doctype html><html><body>Partial output</body></html>");
          throw new Error("simulated renderer failure");
        }
      }),
      /simulated renderer failure/
    );

    assert.match(await readFile(path.join(workspaceDir, "index.html"), "utf8"), /Prior output/);
    assert.equal(await readFile(path.join(workspaceDir, "assets/generated/runtime.js"), "utf8"), "prior runtime");
    assert.equal(await readFile(path.join(workspaceDir, "resources/generated/mapping.json"), "utf8"), "prior mapping");
    assert.equal(await readFile(path.join(workspaceDir, "assets/custom/teacher.css"), "utf8"), "teacher customization");
    await assertNoTransactionDirectories(projectDir);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("factory ownership declarations cannot overlap preserved custom paths", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "english-workspace-ownership-"));
  try {
    await assert.rejects(
      stageAndPromoteEnglishWorkspace({
        workspaceDir: path.join(tempDir, "workspace"),
        ownedPaths: [
          { path: "index.html", kind: "file" },
          { path: "assets/custom", kind: "directory" }
        ],
        metadata: METADATA,
        async buildStage() {
          assert.fail("unsafe ownership must be rejected before the builder runs");
        }
      }),
      /overlaps preserved custom path/
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
