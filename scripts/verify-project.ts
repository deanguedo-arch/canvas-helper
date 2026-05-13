import path from "node:path";
import { readdir, stat } from "node:fs/promises";

import { getStringFlag, parseArgs } from "./lib/cli.js";
import { validateProjectManifestPolicy } from "./lib/project-manifest-policy.js";
import { loadProjectManifest } from "./lib/projects.js";
import { normalizeVerifyMode, verifyProjectBundle } from "./lib/verification.js";
import type { ProjectManifest } from "./lib/types.js";

async function generatedOutputExists(outputPath: string) {
  const absolutePath = path.resolve(outputPath);

  try {
    const outputStat = await stat(absolutePath);
    if (outputStat.isDirectory()) {
      return (await readdir(absolutePath)).length > 0;
    }

    return outputStat.isFile();
  } catch {
    return false;
  }
}

function hasDocxExportTarget(manifest: ProjectManifest) {
  return manifest.exportTargets?.some((target) => target.target === "docx" && target.enabled !== false) === true;
}

async function verifyGeneratedOutputProject(manifest: ProjectManifest) {
  const generatedOutputs = manifest.generatedOutputs ?? [];
  if (generatedOutputs.length === 0) {
    throw new Error("DOCX export project declares no generated outputs.");
  }

  const missingOutputs: string[] = [];
  for (const outputPath of generatedOutputs) {
    if (!(await generatedOutputExists(outputPath))) {
      missingOutputs.push(outputPath);
    }
  }

  console.log("Mode: generated-output");
  console.log(`Entry: ${manifest.canonicalEntry ?? "(none)"}`);
  console.log("");

  if (missingOutputs.length > 0) {
    console.log("Missing generated outputs (ERROR):");
    for (const outputPath of missingOutputs) {
      console.log(`- ${outputPath}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Missing generated outputs (ERROR): none");
}

function formatCourseShellResourceIssue(issue: {
  moduleTitle: string;
  activityTitle: string;
  resourceKind: string;
  sourceHref: string;
  resolvedPath: string;
}) {
  const modulePrefix = issue.moduleTitle ? `${issue.moduleTitle} > ` : "";
  return `${modulePrefix}${issue.activityTitle} [${issue.resourceKind}] -> ${issue.sourceHref} (${issue.resolvedPath})`;
}

function formatWorkspaceEmbedIssue(issue: {
  moduleTitle: string;
  activityTitle: string;
  embedPath: string;
  resolvedPath: string;
}) {
  const modulePrefix = issue.moduleTitle ? `${issue.moduleTitle} > ` : "";
  return `${modulePrefix}${issue.activityTitle} -> ${issue.embedPath} (${issue.resolvedPath})`;
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error("Usage: npm run verify -- --project <slug> [--mode workspace|raw|brightspace]");
  }

  const modeFlag = getStringFlag(parsedArgs, "mode");
  const mode = normalizeVerifyMode(modeFlag);
  const manifest = await loadProjectManifest(projectSlug);
  const manifestValidation = validateProjectManifestPolicy(manifest);
  if (manifestValidation.status === "invalid") {
    throw new Error(
      `Project metadata validation failed for "${projectSlug}":\n${manifestValidation.errors.map((line) => `- ${line}`).join("\n")}`
    );
  }

  if (manifestValidation.status === "skipped-legacy") {
    console.log("Metadata policy: skipped (legacy manifest)");
  } else {
    console.log("Metadata policy: passed");
  }

  if (manifestValidation.warnings.length > 0) {
    console.log("Metadata warnings:");
    for (const warning of manifestValidation.warnings) {
      console.log(`- ${warning}`);
    }
    console.log("");
  }

  if (!modeFlag && hasDocxExportTarget(manifest)) {
    await verifyGeneratedOutputProject(manifest);
    return;
  }

  const result = await verifyProjectBundle(projectSlug, mode);

  console.log(`Mode: ${result.mode}`);
  console.log(`Entry: ${result.entryPath}`);
  console.log("");

  if (result.missingAssets.length > 0) {
    console.log("Missing local assets (ERROR):");
    for (const item of result.missingAssets) {
      console.log(`- ${item}`);
    }
  } else {
    console.log("Missing local assets (ERROR): none");
  }

  console.log("");

  if (result.externalDependencies.length > 0) {
    console.log("External dependencies (WARN):");
    for (const item of result.externalDependencies) {
      console.log(`- ${item}`);
    }
  } else {
    console.log("External dependencies (WARN): none");
  }

  if (result.traversalWarnings.length > 0) {
    console.log("");
    console.log("Traversal refs skipped (WARN):");
    for (const item of result.traversalWarnings) {
      console.log(`- ${item}`);
    }
  }

  console.log("");

  if (result.missingWorkspaceEmbeds.length > 0) {
    console.log("Missing workspace embeds (ERROR):");
    for (const issue of result.missingWorkspaceEmbeds) {
      console.log(`- ${formatWorkspaceEmbedIssue(issue)}`);
    }
  } else {
    console.log("Missing workspace embeds (ERROR): none");
  }

  console.log("");

  if (result.missingCourseShellResources.length > 0) {
    console.log("Missing course-shell resources (ERROR):");
    for (const issue of result.missingCourseShellResources) {
      console.log(`- ${formatCourseShellResourceIssue(issue)}`);
    }
  } else {
    console.log("Missing course-shell resources (ERROR): none");
  }

  console.log("");

  if (result.declaredMissingCourseShellResources.length > 0) {
    console.log("Declared missing course-shell resources (WARN):");
    for (const issue of result.declaredMissingCourseShellResources) {
      console.log(`- ${formatCourseShellResourceIssue(issue)}`);
    }
  } else {
    console.log("Declared missing course-shell resources (WARN): none");
  }

  if (
    result.missingAssets.length > 0 ||
    result.missingWorkspaceEmbeds.length > 0 ||
    result.missingCourseShellResources.length > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
