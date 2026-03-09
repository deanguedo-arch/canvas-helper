import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { fileExists } from "../lib/fs.js";
import {
  IncomingLockError,
  refreshResourceProjects,
  runIncomingRefresh,
  withIncomingLock
} from "../lib/incoming-intake.js";

test("withIncomingLock rejects nested use of the same lock path", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "incoming-lock-"));
  const lockPath = path.join(tempDir, "incoming.lock");

  try {
    await withIncomingLock(async () => {
      await assert.rejects(
        () => withIncomingLock(async () => undefined, lockPath),
        (error: unknown) => error instanceof IncomingLockError
      );
    }, lockPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("withIncomingLock clears a stale lock file left by a dead process", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "incoming-stale-lock-"));
  const lockPath = path.join(tempDir, "incoming.lock");

  try {
    await writeFile(
      lockPath,
      `${JSON.stringify({ pid: 999999, startedAt: "2026-03-06T00:00:00.000Z" }, null, 2)}\n`,
      "utf8"
    );

    const result = await withIncomingLock(async () => "recovered", lockPath);

    assert.equal(result, "recovered");
    assert.equal(await fileExists(lockPath), false);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("runIncomingRefresh returns an empty summary when no intake items exist", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "incoming-refresh-empty-"));
  const incomingRoot = path.join(tempDir, "incoming");
  const resourcesRoot = path.join(tempDir, "resources");

  try {
    const summary = await runIncomingRefresh({
      incomingRoot,
      resourcesRoot
    });

    assert.equal(summary.mode, "all");
    assert.equal(summary.importedProjects.length, 0);
    assert.equal(summary.syncedReferences.length, 0);
    assert.equal(summary.failures.length, 0);
    assert.equal(summary.skippedProjects.length, 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("refreshResourceProjects reports missing project manifests and leaves files in place", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "incoming-refresh-missing-resource-project-"));
  const resourceDir = path.join(tempDir, "resources", "missing-project");
  const resourceFile = path.join(resourceDir, "unit-1.pdf");

  try {
    await mkdir(resourceDir, { recursive: true });
    await writeFile(resourceFile, "pdf", "utf8");

    const summary = await refreshResourceProjects({
      resourceDirs: [resourceDir]
    });

    assert.equal(summary.syncedReferences.length, 0);
    assert.equal(summary.failures.length, 1);
    assert.match(summary.failures[0]?.message ?? "", /Project manifest not found/);
    assert.equal(summary.archivedPaths.length, 0);
    assert.equal(summary.failures[0]?.inputPath, resourceDir);
    assert.equal(await fileExists(resourceFile), true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
