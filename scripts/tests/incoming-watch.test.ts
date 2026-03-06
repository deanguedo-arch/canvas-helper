import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { listIncomingProjectFolders } from "../lib/incoming-watch.js";

function relativeFolders(rootPath: string, folderPaths: string[]) {
  return folderPaths.map((folderPath) => path.relative(rootPath, folderPath).replace(/\\/g, "/"));
}

test("listIncomingProjectFolders skips empty gemini lanes and returns real bundles", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "incoming-watch-"));
  const incomingRoot = path.join(tempDir, "_incoming");

  try {
    await mkdir(path.join(incomingRoot, "gemini"), { recursive: true });
    await mkdir(path.join(incomingRoot, "gemini", "biology-module"), { recursive: true });
    await mkdir(path.join(incomingRoot, "genpsy"), { recursive: true });

    await writeFile(path.join(incomingRoot, "gemini", ".gitkeep"), "", "utf8");
    await writeFile(path.join(incomingRoot, "gemini", "biology-module", "index.html"), "<html></html>", "utf8");
    await writeFile(path.join(incomingRoot, "genpsy", "generalpsy20.html"), "<html></html>", "utf8");

    const folders = await listIncomingProjectFolders(incomingRoot);

    assert.deepEqual(relativeFolders(incomingRoot, folders), ["gemini/biology-module", "genpsy"]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
