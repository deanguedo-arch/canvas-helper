import process from "node:process";

import { buildBiology30ProductionUnit } from "./lib/biology30-course/v1/build.js";

function valueAfter(args: string[], flag: string) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

const args = process.argv.slice(2);
const project = valueAfter(args, "--project");
const strict = args.includes("--strict");
const checkExternalLinks = args.includes("--check-external-links");
const profile = valueAfter(args, "--profile");
const baselineWorkspaceSha256 = valueAfter(args, "--baseline-workspace-sha");
const valueFlags = new Set(["--project", "--profile", "--baseline-workspace-sha"]);
for (let i = 0; i < args.length; i++) {
  if (valueFlags.has(args[i])) {
    if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Missing value: ${args[i]}`);
    i++;
  } else if (!["--strict", "--check-external-links"].includes(args[i])) throw new Error(`Unknown Biology build argument: ${args[i]}`);
}

if (!project) {
  throw new Error("Usage: npm run build:biology30-course -- --project biology30-unit-b|biology30-unit-c|biology30-unit-d --strict [--check-external-links]");
}

const result = await buildBiology30ProductionUnit({
  repoRoot: process.cwd(),
  project,
  strict,
  checkExternalLinks,
  profile,
  baselineWorkspaceSha256
});

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
