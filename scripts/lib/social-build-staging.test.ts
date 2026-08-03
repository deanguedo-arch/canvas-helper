import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { stageAndPromoteSocialBuild } from "./social-build-staging.js";

async function createProjectFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "canvas-social-stage-"));
  const projectDir = path.join(root, "projects", "social30-fixture");
  const projectJson = '{"slug":"social30-fixture","preserve":true}\n';
  await Promise.all([
    mkdir(path.join(projectDir, "workspace"), { recursive: true }),
    mkdir(path.join(projectDir, "meta"), { recursive: true }),
    mkdir(path.join(projectDir, "raw"), { recursive: true })
  ]);
  await Promise.all([
    writeFile(path.join(projectDir, "workspace", "index.html"), "<html><body>old workspace</body></html>"),
    writeFile(path.join(projectDir, "meta", "project.json"), projectJson),
    writeFile(path.join(projectDir, "raw", "README.md"), "raw baseline stays untouched\n")
  ]);
  return { root, projectDir, projectJson };
}

test("promotes a complete staged Social build without touching raw source or project metadata", async () => {
  const { root, projectDir, projectJson } = await createProjectFixture();
  try {
    await stageAndPromoteSocialBuild({
      projectDir,
      async buildStage({ stageWorkspaceDir, stageMetaDir }) {
        await Promise.all([
          writeFile(path.join(stageWorkspaceDir, "index.html"), "<html><body>new workspace</body></html>"),
          writeFile(path.join(stageMetaDir, "social-build.json"), '{"version":1}\n'),
          writeFile(path.join(stageMetaDir, "conversion-notes.md"), "new notes\n")
        ]);
      }
    });

    assert.match(await readFile(path.join(projectDir, "workspace", "index.html"), "utf8"), /new workspace/);
    assert.equal(await readFile(path.join(projectDir, "meta", "social-build.json"), "utf8"), '{"version":1}\n');
    assert.equal(await readFile(path.join(projectDir, "meta", "conversion-notes.md"), "utf8"), "new notes\n");
    assert.equal(await readFile(path.join(projectDir, "raw", "README.md"), "utf8"), "raw baseline stays untouched\n");
    assert.equal(await readFile(path.join(projectDir, "meta", "project.json"), "utf8"), projectJson);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("leaves the existing Social build in place when staging is incomplete", async () => {
  const { root, projectDir, projectJson } = await createProjectFixture();
  try {
    await assert.rejects(
      stageAndPromoteSocialBuild({
        projectDir,
        async buildStage({ stageMetaDir }) {
          await writeFile(path.join(stageMetaDir, "social-build.json"), '{"version":2}\n');
        }
      }),
      /index\.html/
    );

    assert.match(await readFile(path.join(projectDir, "workspace", "index.html"), "utf8"), /old workspace/);
    await assert.rejects(readFile(path.join(projectDir, "meta", "social-build.json"), "utf8"));
    assert.equal(await readFile(path.join(projectDir, "raw", "README.md"), "utf8"), "raw baseline stays untouched\n");
    assert.equal(await readFile(path.join(projectDir, "meta", "project.json"), "utf8"), projectJson);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
