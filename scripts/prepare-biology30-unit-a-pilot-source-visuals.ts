#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import { prepareBiology30UnitAPilotSourceVisuals } from "./lib/biology30-unit-a/pilot-source-visuals.ts";

function valueAfter(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const project = valueAfter("--project") ?? "biology30-unit-a-pilot";

try {
  const result = await prepareBiology30UnitAPilotSourceVisuals({ repoRoot, project });
  console.log(result.changed
    ? `Prepared ${result.report.counts.total} verified source visuals for ${project}.`
    : `Verified ${result.report.counts.total} existing source visuals for ${project}; no files changed.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
