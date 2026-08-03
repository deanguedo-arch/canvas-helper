import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runEnglishFactoryOutputTransaction } from "./factory-transaction.js";

async function writeFixtureFile(root: string, relativePath: string, content: string) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "english-factory-transaction-"));
  const projectDir = path.join(root, "projects", "english-fixture");
  const resourceDir = path.join(root, "projects", "resources", "english-fixture");
  await Promise.all([
    writeFixtureFile(projectDir, "workspace/index.html", "old learner output"),
    writeFixtureFile(projectDir, "workspace/assets/generated/runtime.js", "old runtime"),
    writeFixtureFile(projectDir, "workspace/resources/generated/old.json", "old resource"),
    writeFixtureFile(projectDir, "meta/english-unit-build.json", "old build manifest"),
    writeFixtureFile(projectDir, "meta/english-unit-mapping.json", "old mapping"),
    writeFixtureFile(projectDir, "meta/english-unit-mapping.md", "old mapping markdown"),
    writeFixtureFile(projectDir, "meta/e2e-contract.json", "old e2e"),
    writeFixtureFile(projectDir, "meta/conversion-notes.md", "old notes"),
    writeFixtureFile(projectDir, "meta/project.json", '{"reviewed":true}\n'),
    writeFixtureFile(projectDir, "meta/english-unit.json", '{"recipe":"preserve"}\n'),
    writeFixtureFile(projectDir, "workspace/components/teacher.html", "teacher component"),
    writeFixtureFile(resourceDir, "teacher/old.pdf", "old teacher resource"),
    writeFixtureFile(resourceDir, "_extracted/old.txt", "old extraction"),
    writeFixtureFile(resourceDir, "_sources/archive.zip", "canonical input remains"),
    writeFixtureFile(projectDir, "raw/source.zip", "raw input remains")
  ]);
  return { root, projectDir, resourceDir };
}

async function writeFactoryOutputs(projectDir: string, resourceDir: string) {
  await Promise.all([
    writeFixtureFile(projectDir, "workspace/index.html", "new learner output"),
    writeFixtureFile(projectDir, "workspace/assets/generated/runtime.js", "new runtime"),
    writeFixtureFile(projectDir, "workspace/resources/generated/new.json", "new resource"),
    writeFixtureFile(projectDir, "meta/english-unit-build.json", "new build manifest"),
    writeFixtureFile(projectDir, "meta/english-unit-mapping.json", "new mapping"),
    writeFixtureFile(projectDir, "meta/english-unit-mapping.md", "new mapping markdown"),
    writeFixtureFile(projectDir, "meta/e2e-contract.json", "new e2e"),
    writeFixtureFile(projectDir, "meta/conversion-notes.md", "new notes"),
    writeFixtureFile(projectDir, "meta/project.json", '{"reviewed":false}\n'),
    writeFixtureFile(resourceDir, "teacher/new.pdf", "new teacher resource"),
    writeFixtureFile(resourceDir, "_extracted/new.txt", "new extraction")
  ]);
}

test("restores all generated English factory outputs when a late metadata step fails", async () => {
  const { root, projectDir, resourceDir } = await createFixture();
  try {
    await assert.rejects(
      runEnglishFactoryOutputTransaction({
        projectDir,
        resourceDir,
        async run() {
          await writeFactoryOutputs(projectDir, resourceDir);
          throw new Error("simulated metadata failure");
        }
      }),
      /simulated metadata failure/
    );

    assert.equal(await readFile(path.join(projectDir, "workspace/index.html"), "utf8"), "old learner output");
    assert.equal(await readFile(path.join(projectDir, "workspace/assets/generated/runtime.js"), "utf8"), "old runtime");
    assert.equal(await readFile(path.join(projectDir, "workspace/resources/generated/old.json"), "utf8"), "old resource");
    assert.equal(await readFile(path.join(projectDir, "meta/project.json"), "utf8"), '{"reviewed":true}\n');
    assert.equal(await readFile(path.join(projectDir, "meta/english-unit.json"), "utf8"), '{"recipe":"preserve"}\n');
    assert.equal(await readFile(path.join(projectDir, "workspace/components/teacher.html"), "utf8"), "teacher component");
    assert.equal(await readFile(path.join(resourceDir, "teacher/old.pdf"), "utf8"), "old teacher resource");
    assert.equal(await readFile(path.join(resourceDir, "_extracted/old.txt"), "utf8"), "old extraction");
    assert.equal(await readFile(path.join(resourceDir, "_sources/archive.zip"), "utf8"), "canonical input remains");
    assert.equal(await readFile(path.join(projectDir, "raw/source.zip"), "utf8"), "raw input remains");
    const projectEntries = await readdir(projectDir);
    assert.deepEqual(projectEntries.filter((entry) => entry.startsWith(".english-factory-transaction-")), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("keeps the complete new English factory output after a successful run", async () => {
  const { root, projectDir, resourceDir } = await createFixture();
  try {
    await runEnglishFactoryOutputTransaction({
      projectDir,
      resourceDir,
      async run() {
        await writeFactoryOutputs(projectDir, resourceDir);
      }
    });

    assert.equal(await readFile(path.join(projectDir, "workspace/index.html"), "utf8"), "new learner output");
    assert.equal(await readFile(path.join(projectDir, "workspace/resources/generated/new.json"), "utf8"), "new resource");
    assert.equal(await readFile(path.join(projectDir, "meta/project.json"), "utf8"), '{"reviewed":false}\n');
    assert.equal(await readFile(path.join(resourceDir, "teacher/new.pdf"), "utf8"), "new teacher resource");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
