import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { refreshProjectIntelligence } from "./lib/intelligence.js";
import { listProjectSlugs, updateProjectManifest } from "./lib/projects.js";
import type { LearningSource } from "./lib/types.js";

function resolveLearningSource(value: string | undefined): LearningSource {
  if (!value || value === "gemini") {
    return "gemini";
  }

  if (value === "other") {
    return "other";
  }

  throw new Error(`Invalid --source value "${value}". Expected "gemini" or "other".`);
}

function parseSlugList(value: string | undefined) {
  if (!value) {
    return [] as string[];
  }

  return [...new Set(value.split(",").map((slug) => slug.trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right)
  );
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const includeAll = hasFlag(parsedArgs, "all");
  const requestedSlugs = parseSlugList(getStringFlag(parsedArgs, "slugs"));
  const learningSource = resolveLearningSource(getStringFlag(parsedArgs, "source"));

  const slugs = includeAll ? await listProjectSlugs() : requestedSlugs;
  if (slugs.length === 0) {
    throw new Error("Usage: npm run backfill:learning -- --slugs <slug-a,slug-b> [--source gemini|other] [--all]");
  }

  const learningTrust = learningSource === "gemini" ? "curated" : "auto";
  for (const slug of slugs) {
    const timestamp = new Date().toISOString();
    await updateProjectManifest(slug, (manifest) => ({
      ...manifest,
      learningSource,
      learningTrust,
      learningUpdatedAt: timestamp,
      workspaceApprovedAt: manifest.workspaceApprovedAt ?? timestamp,
      updatedAt: timestamp
    }));
    await refreshProjectIntelligence(slug, { markWorkspaceApproved: true });
    console.log(`Backfilled "${slug}" -> source=${learningSource}, trust=${learningTrust}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
