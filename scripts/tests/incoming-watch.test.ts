import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  inferSlugFromIncomingItem,
  listIncomingProjectItems,
  listResourceProjectDirs,
  listResourceSourceFiles
} from "../lib/incoming-watch.js";

function relativePaths(rootPath: string, paths: string[]) {
  return paths.map((currentPath) => path.relative(rootPath, currentPath).replace(/\\/g, "/"));
}

test("listIncomingProjectItems returns immediate folders and html/txt files only", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "incoming-watch-items-"));
  const incomingRoot = path.join(tempDir, "incoming");

  try {
    await mkdir(path.join(incomingRoot, "biology-module"), { recursive: true });
    await mkdir(path.join(incomingRoot, "nested", "child"), { recursive: true });
    await writeFile(path.join(incomingRoot, "biology-module", "index.html"), "<html></html>", "utf8");
    await writeFile(path.join(incomingRoot, "lesson.html"), "<html></html>", "utf8");
    await writeFile(path.join(incomingRoot, "notes.txt"), "notes", "utf8");
    await writeFile(path.join(incomingRoot, "ignore.pdf"), "pdf", "utf8");

    const items = await listIncomingProjectItems(incomingRoot);

    assert.deepEqual(relativePaths(incomingRoot, items), ["biology-module", "lesson.html", "nested", "notes.txt"]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("listIncomingProjectItems skips folders marked with .watch-ignore", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "incoming-watch-ignore-"));
  const incomingRoot = path.join(tempDir, "incoming");

  try {
    await mkdir(path.join(incomingRoot, "skip-me"), { recursive: true });
    await mkdir(path.join(incomingRoot, "keep-me"), { recursive: true });
    await writeFile(path.join(incomingRoot, "skip-me", ".watch-ignore"), "", "utf8");

    const items = await listIncomingProjectItems(incomingRoot);

    assert.deepEqual(relativePaths(incomingRoot, items), ["keep-me"]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("listResourceProjectDirs returns only top-level slug folders", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "resource-watch-dirs-"));
  const resourcesRoot = path.join(tempDir, "resources");
  const projectsRoot = path.join(tempDir, "projects");

  try {
    await mkdir(path.join(resourcesRoot, "genpsy-studio"), { recursive: true });
    await mkdir(path.join(resourcesRoot, "calmmodule2"), { recursive: true });
    await mkdir(path.join(resourcesRoot, "test-fixture"), { recursive: true });
    await writeFile(path.join(resourcesRoot, ".gitkeep"), "", "utf8");
    await mkdir(path.join(projectsRoot, "genpsy-studio", "meta"), { recursive: true });
    await mkdir(path.join(projectsRoot, "calmmodule2", "meta"), { recursive: true });
    await writeFile(path.join(projectsRoot, "genpsy-studio", "meta", "project.json"), "{}", "utf8");
    await writeFile(path.join(projectsRoot, "calmmodule2", "meta", "project.json"), "{}", "utf8");

    const dirs = await listResourceProjectDirs(resourcesRoot, projectsRoot);

    assert.deepEqual(relativePaths(resourcesRoot, dirs), ["calmmodule2", "genpsy-studio"]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("listResourceProjectDirs skips resource dirs marked with .watch-ignore", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "resource-watch-ignore-"));
  const resourcesRoot = path.join(tempDir, "resources");
  const projectsRoot = path.join(tempDir, "projects");

  try {
    await mkdir(path.join(resourcesRoot, "skip-me"), { recursive: true });
    await mkdir(path.join(resourcesRoot, "keep-me"), { recursive: true });
    await writeFile(path.join(resourcesRoot, "skip-me", ".watch-ignore"), "", "utf8");
    await mkdir(path.join(projectsRoot, "skip-me", "meta"), { recursive: true });
    await mkdir(path.join(projectsRoot, "keep-me", "meta"), { recursive: true });
    await writeFile(path.join(projectsRoot, "skip-me", "meta", "project.json"), "{}", "utf8");
    await writeFile(path.join(projectsRoot, "keep-me", "meta", "project.json"), "{}", "utf8");

    const dirs = await listResourceProjectDirs(resourcesRoot, projectsRoot);

    assert.deepEqual(relativePaths(resourcesRoot, dirs), ["keep-me"]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("listResourceSourceFiles ignores _extracted output files", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "resource-watch-files-"));
  const resourceDir = path.join(tempDir, "resources", "genpsy-studio");

  try {
    await mkdir(path.join(resourceDir, "_extracted"), { recursive: true });
    await writeFile(path.join(resourceDir, "unit-1.pdf"), "pdf", "utf8");
    await writeFile(path.join(resourceDir, "_extracted", "unit-1.txt"), "text", "utf8");

    const files = await listResourceSourceFiles(resourceDir);

    assert.deepEqual(relativePaths(resourceDir, files), ["unit-1.pdf"]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("inferSlugFromIncomingItem derives a project slug from files and folders", () => {
  assert.equal(inferSlugFromIncomingItem("C:\\repo\\projects\\incoming\\My Course"), "my-course");
  assert.equal(inferSlugFromIncomingItem("C:\\repo\\projects\\incoming\\Unit 1.html"), "unit-1");
});
