import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";

const PROJECT_SLUG = "biology30-unit-a";

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

async function collectTreeFiles(rootDir: string, relativeDir = ""): Promise<Array<{ path: string; size: number; sha256: string }>> {
  const entries = (await readdir(path.join(rootDir, relativeDir), { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name));
  const files: Array<{ path: string; size: number; sha256: string }> = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDir.split(path.sep).join(path.posix.sep), entry.name);
    const absolutePath = path.join(rootDir, relativePath);
    if (entry.isDirectory()) {
      files.push(...(await collectTreeFiles(rootDir, relativePath)));
      continue;
    }
    if (!entry.isFile()) throw new Error(`Figure review cannot hash unsupported workspace entry: ${absolutePath}`);
    const details = await stat(absolutePath);
    files.push({ path: relativePath, size: details.size, sha256: await sha256File(absolutePath) });
  }
  return files;
}

async function hashTree(rootDir: string) {
  const files = await collectTreeFiles(rootDir);
  const hash = createHash("sha256");
  for (const file of files) hash.update(`${file.path}\0${file.size}\0${file.sha256}\n`);
  return hash.digest("hex");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const knownFlags = new Set(["project", "help", "h"]);
  const unknown = Object.keys(args.flags).filter((flag) => !knownFlags.has(flag));
  if (unknown.length || args.positionals.length) throw new Error(`Unknown arguments: ${[...unknown.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log("Usage: npm run verify:biology30-unit-a-v2:figure-review -- --project biology30-unit-a");
    return;
  }
  const project = getStringFlag(args, "project");
  if (project !== PROJECT_SLUG) throw new Error(`--project must be ${PROJECT_SLUG}.`);
  const metaDir = path.join(process.cwd(), "projects", project, "meta");
  const [build, audit, review] = await Promise.all([
    readJson<{ buildSha256: string; figures: string[] }>(path.join(metaDir, "gate-2-build.json")),
    readJson<{ buildSha256: string; workspaceTreeSha256: string; status: string; geometry: { pass: boolean }; contactSheets: Array<{ path: string; sha256: string; figureIds: string[] }> }>(path.join(metaDir, "gate-3-figure-audit.json")),
    readJson<{ buildSha256: string; status: string; reviewer: string; openedAllContactSheets: boolean; contactSheets: Array<{ path: string; sha256: string }>; inspectedFigureIds: string[]; unresolvedFindings: string[] }>(path.join(metaDir, "gate-3-figure-visual-inspection.json"))
  ]);
  const workspaceSha256 = await hashTree(path.join(process.cwd(), "projects", project, "workspace"));
  if (audit.buildSha256 !== build.buildSha256 || review.buildSha256 !== build.buildSha256) throw new Error("Figure review is stale for the current candidate build.");
  if (workspaceSha256 !== build.buildSha256 || audit.workspaceTreeSha256 !== workspaceSha256) throw new Error("Figure review refused workspace drift from the exact audited candidate.");
  if (audit.status !== "geometry-passed-awaiting-visual-inspection" || audit.geometry.pass !== true) throw new Error("Automated figure geometry has not passed.");
  if (review.status !== "passed" || !review.reviewer.trim() || review.openedAllContactSheets !== true || review.unresolvedFindings.length) throw new Error("Figure visual inspection is incomplete or has unresolved findings.");
  if (JSON.stringify([...review.inspectedFigureIds].sort()) !== JSON.stringify([...build.figures].sort())) throw new Error("Figure visual inspection does not cover the exact candidate inventory.");
  if (JSON.stringify(review.contactSheets) !== JSON.stringify(audit.contactSheets.map(({ path: sheetPath, sha256 }) => ({ path: sheetPath, sha256 })))) throw new Error("Figure visual inspection does not name the exact audited contact sheets.");
  for (const sheet of review.contactSheets) {
    const actualSha256 = await sha256File(path.join(process.cwd(), sheet.path));
    if (actualSha256 !== sheet.sha256) throw new Error(`Figure contact sheet drift: ${sheet.path}.`);
  }
  console.log(`Biology 30 Unit A figure review verified for build ${build.buildSha256}.`);
  console.log(`- Figures visually inspected: ${review.inspectedFigureIds.length}`);
  console.log(`- Contact sheets opened: ${review.contactSheets.length}`);
  console.log(`- Reviewer: ${review.reviewer}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
