import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { listStudioHtmlFiles } from "../lib/projects.ts";

test("Studio HTML discovery skips duplicate resource trees", async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-studio-html-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const entrypoint = path.join(root, "index.html");
  await Promise.all([
    mkdir(path.join(root, "resources"), { recursive: true }),
    mkdir(path.join(root, "resources 2", "generated"), { recursive: true })
  ]);
  await Promise.all([
    writeFile(entrypoint, "<!doctype html><title>Course</title>"),
    writeFile(path.join(root, "resources", "guide.html"), "<!doctype html><title>Guide</title>"),
    writeFile(
      path.join(root, "resources 2", "generated", "duplicate.html"),
      "<!doctype html><title>Duplicate</title>"
    )
  ]);

  assert.deepEqual(await listStudioHtmlFiles(root, [entrypoint]), [
    "index.html",
    "resources/guide.html"
  ]);
});

test("Studio HTML discovery keeps the declared entrypoint when fallback scanning is bounded", async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-studio-html-bounded-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const entrypoint = path.join(root, "deep", "course.html");
  await mkdir(path.dirname(entrypoint), { recursive: true });
  await writeFile(entrypoint, "<!doctype html><title>Course</title>");

  const files = await listStudioHtmlFiles(root, [entrypoint], {
    maxEntries: 1,
    maxEntriesPerDirectory: 1,
    maxDepth: 0
  });

  assert.ok(files.includes("deep/course.html"));
});
