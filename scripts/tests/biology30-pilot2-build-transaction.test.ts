import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { hashTopicBuildTree, transactTopicBuild } from "../lib/biology30-course/v1/pilot2-build-transaction.js";

async function fixture() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "biology-topic-transaction-"));
  const project = "biology30-unit-b", projectDir = path.join(repoRoot, "projects", project);
  await mkdir(path.join(projectDir, "workspace/assets"), { recursive: true });
  await mkdir(path.join(projectDir, "meta"));
  await writeFile(path.join(projectDir, "workspace/index.html"), "old learner fixture");
  await writeFile(path.join(projectDir, "workspace/assets/figure.svg"), "old figure fixture");
  await writeFile(path.join(projectDir, "meta/project.json"), '{"profile":"old fixture"}');
  await writeFile(path.join(projectDir, "meta/unrelated-note.md"), "preserve this dirty note");
  const expectedWorkspaceSha256 = (await hashTopicBuildTree(path.join(projectDir, "workspace"))).sha256;
  const prepare = async (stage: { workspaceDir: string; metaDir: string }) => {
    await writeFile(path.join(stage.workspaceDir, "index.html"), "new learner fixture");
    await writeFile(path.join(stage.metaDir, "project.json"), '{"profile":"new fixture"}');
  };
  const validate = async (stage: { workspaceDir: string; metaDir: string }) => {
    assert.equal(await readFile(path.join(stage.workspaceDir, "index.html"), "utf8"), "new learner fixture");
    assert.equal(await readFile(path.join(stage.metaDir, "unrelated-note.md"), "utf8"), "preserve this dirty note");
    return "fixture validation passed";
  };
  return { repoRoot, projectDir, request: { repoRoot, project, expectedWorkspaceSha256, prepare, validate } };
}

test("topic tree hashes match intake format and include assets; symlinks are refused", async () => {
  const f = await fixture();
  try {
    const tree = await hashTopicBuildTree(path.join(f.projectDir, "workspace"));
    const expected = createHash("sha256").update(tree.files.map(file => `${file.path}\0${file.sha256}\n`).join("")).digest("hex");
    assert.equal(tree.sha256, expected);
    await writeFile(path.join(f.projectDir, "workspace/assets/figure.svg"), "changed asset, same HTML");
    await assert.rejects(transactTopicBuild(f.request), /baseline drift/);
    await symlink(path.join(f.projectDir, "meta/unrelated-note.md"), path.join(f.projectDir, "workspace/link"));
    await assert.rejects(hashTopicBuildTree(path.join(f.projectDir, "workspace")), /symlink/);
  } finally { await rm(f.repoRoot, { recursive: true, force: true }); }
});

test("topic build promotes verified workspace and copied metadata together", async () => {
  const f = await fixture();
  try {
    const result = await transactTopicBuild(f.request);
    assert.equal(result.validation, "fixture validation passed");
    assert.equal(result.workspaceSha256, (await hashTopicBuildTree(path.join(f.projectDir, "workspace"))).sha256);
    assert.equal(result.metadataSha256, (await hashTopicBuildTree(path.join(f.projectDir, "meta"))).sha256);
    assert.equal(await readFile(path.join(f.projectDir, "meta/unrelated-note.md"), "utf8"), "preserve this dirty note");
    assert.deepEqual(await readdir(path.join(f.repoRoot, "projects")), ["biology30-unit-b"]);
  } finally { await rm(f.repoRoot, { recursive: true, force: true }); }
});

test("validation and intervening metadata failures leave current learner and edits intact", async () => {
  const f = await fixture();
  try {
    await assert.rejects(transactTopicBuild({ ...f.request, validate: async () => { throw new Error("fixture invalid"); } }), /fixture invalid/);
    assert.equal((await hashTopicBuildTree(path.join(f.projectDir, "workspace"))).sha256, f.request.expectedWorkspaceSha256);
    await assert.rejects(transactTopicBuild({ ...f.request, beforePromote: async (_target, index) => {
      if (index === 0) await writeFile(path.join(f.projectDir, "meta/unrelated-note.md"), "concurrent teacher edit");
    } }), /Intervening Biology meta edit/);
    assert.equal((await hashTopicBuildTree(path.join(f.projectDir, "workspace"))).sha256, f.request.expectedWorkspaceSha256);
    assert.equal(await readFile(path.join(f.projectDir, "meta/unrelated-note.md"), "utf8"), "concurrent teacher edit");
  } finally { await rm(f.repoRoot, { recursive: true, force: true }); }
});

test("a partial promotion rolls back while preserving writing made to its temporary candidate", async () => {
  const f = await fixture();
  try {
    await assert.rejects(transactTopicBuild({ ...f.request, beforePromote: async (_target, index) => {
      if (index === 1) await writeFile(path.join(f.projectDir, "workspace/index.html"), "writing during promotion");
    } }), /rolled back; recovery evidence retained/);
    assert.equal((await hashTopicBuildTree(path.join(f.projectDir, "workspace"))).sha256, f.request.expectedWorkspaceSha256);
    assert.equal(await readFile(path.join(f.projectDir, "meta/project.json"), "utf8"), '{"profile":"old fixture"}');
    const retained = (await readdir(path.join(f.repoRoot, "projects"))).find(name => name.includes("-stage-"));
    assert.ok(retained);
    assert.equal(await readFile(path.join(f.repoRoot, "projects", retained, "recovery/workspace/index.html"), "utf8"), "writing during promotion");
    assert.ok(await readFile(path.join(f.repoRoot, "projects", retained, "rollback.json"), "utf8"));
  } finally { await rm(f.repoRoot, { recursive: true, force: true }); }
});

test("a second topic transaction cannot enter while the first owns the lock", async () => {
  const f = await fixture();
  try {
    await transactTopicBuild({ ...f.request, prepare: async stage => {
      await assert.rejects(transactTopicBuild(f.request), /already locked/);
      await f.request.prepare(stage);
    } });
    await assert.rejects(transactTopicBuild({ ...f.request, project: "biology30-unit-a" }), /restricted/);
  } finally { await rm(f.repoRoot, { recursive: true, force: true }); }
});
