#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import { prepareBiology30UnitAPilotMedia } from "./lib/biology30-unit-a/pilot-media.ts";

function valueAfter(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requireValue(flag: string) {
  const value = valueAfter(flag);
  if (!value || value.startsWith("--")) throw new Error(`Missing required ${flag} path.`);
  return path.resolve(value);
}

const knownFlags = new Set([
  "--project",
  "--chapter-11-pptx",
  "--chapter-12-pptx",
  "--chapter-13-pptx",
  "--check-video-links"
]);
const unexpected = process.argv.slice(2).filter((argument, index, all) => argument.startsWith("--") && !knownFlags.has(argument) && all[index - 1] !== "--project");
if (unexpected.length) throw new Error(`Unknown argument: ${unexpected.join(", ")}.`);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  const result = await prepareBiology30UnitAPilotMedia({
    repoRoot,
    project: valueAfter("--project") ?? "biology30-unit-a-pilot",
    chapter11Pptx: requireValue("--chapter-11-pptx"),
    chapter12Pptx: requireValue("--chapter-12-pptx"),
    chapter13Pptx: requireValue("--chapter-13-pptx"),
    checkVideoLinks: process.argv.includes("--check-video-links")
  });
  console.log(result.changed
    ? `Prepared verified PowerPoint media sources and disposition reports for ${result.project}.`
    : `Verified existing PowerPoint media sources and disposition reports for ${result.project}; no files changed.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
