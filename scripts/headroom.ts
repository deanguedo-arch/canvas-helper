import path from "node:path";
import { readFile } from "node:fs/promises";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { readCliIntelligenceOverride } from "./lib/intelligence.js";
import { resolveIntelligencePolicy } from "./lib/intelligence/config/policy.js";
import { generatePromptPack } from "./lib/prompt-pack.js";
import { fileExists } from "./lib/fs.js";
import { listProjectSlugs, loadProjectManifest } from "./lib/projects.js";

const TARGETABLE_AUTHORING_STATUSES = new Set(["active", "blocked", "ready-for-export"]);

function usage() {
  return [
    "Usage:",
    "  npm run headroom -- --project <slug>",
    "  npm run headroom -- --all",
    "  npm run headroom",
    "",
    "Notes:",
    "- No flags: uses docs/ops/ACTIVE_HANDOFF.md project slug.",
    "- Add --no-subagent to disable subagent mode when generating prompt packs.",
    "- Add --include-reference-only with --all to include archived/reference-only projects."
  ].join("\n");
}

async function resolveProjectFromActiveHandoff() {
  const handoffPath = path.join(process.cwd(), "docs", "ops", "ACTIVE_HANDOFF.md");
  if (!(await fileExists(handoffPath))) {
    throw new Error(`Active handoff not found at ${handoffPath}.`);
  }

  const content = await readFile(handoffPath, "utf8");
  const projectMatch = content.match(/^- Project:\s*(.+)\s*$/m);
  if (!projectMatch) {
    throw new Error(`Could not find "- Project:" in ${handoffPath}.`);
  }

  const project = projectMatch[1].trim();
  if (project.toLowerCase() === "repo-wide") {
    throw new Error('Active handoff project is "repo-wide". Pass --project <slug> or --all.');
  }

  return project;
}

async function resolveAllProjectTargets(includeReferenceOnly: boolean) {
  const slugs = await listProjectSlugs();
  const selected: string[] = [];

  for (const slug of slugs) {
    const manifest = await loadProjectManifest(slug);
    const status = manifest.authoringStatus;
    if (includeReferenceOnly || !status || TARGETABLE_AUTHORING_STATUSES.has(status)) {
      selected.push(slug);
    }
  }

  return selected;
}

async function resolveTargets(parsedArgs: ReturnType<typeof parseArgs>) {
  const requestedProject = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];
  if (requestedProject) {
    return [requestedProject];
  }

  if (hasFlag(parsedArgs, "all")) {
    return resolveAllProjectTargets(hasFlag(parsedArgs, "include-reference-only"));
  }

  return [await resolveProjectFromActiveHandoff()];
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  if (hasFlag(parsedArgs, "help") || hasFlag(parsedArgs, "h")) {
    console.log(usage());
    return;
  }

  const policyOverride = readCliIntelligenceOverride(parsedArgs);
  const targets = await resolveTargets(parsedArgs);
  if (targets.length === 0) {
    console.log("No projects matched the request.");
    return;
  }

  const subagentMode = !hasFlag(parsedArgs, "no-subagent");
  let failed = false;

  for (const slug of targets) {
    try {
      const policy = await resolveIntelligencePolicy(slug, policyOverride);
      const result = await generatePromptPack(slug, policy, { subagentMode });
      console.log(
        `[headroom] ${slug}: ${result.outputPath} (indexed=${result.indexedReferenceCount}, matches=${result.patternMatchCount})`
      );
    } catch (error) {
      failed = true;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[headroom] ${slug}: FAILED (${message})`);
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
    console.error("");
    console.error(usage());
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
