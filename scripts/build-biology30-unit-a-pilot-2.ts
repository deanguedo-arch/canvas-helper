import process from "node:process";

import { buildBiology30UnitAPilot2Full } from "./lib/biology30-unit-a-pilot-2/build-full.js";
import { buildBiology30UnitAPilot2ProcessCollectionIndex } from "./lib/biology30-unit-a-pilot-2/build-process-collection-index.js";
import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { PROCESS_COLLECTION_BASELINE_SHA256 } from "./lib/biology30-unit-a-pilot-2/process-collection-content.js";

const KNOWN_FLAGS = new Set(["project", "accepted-gate-1-sha", "baseline-gate-2-sha", "accepted-revision-gate-a-sha", "accepted-advanced-gate-a-sha", "baseline-advanced-gate-b-sha", "baseline-workspace-sha", "revision", "gate", "help", "h"]);

function usage() {
  return [
    "Usage: npm run build:biology30-unit-a-pilot-2 -- \\",
    "  --project biology30-unit-a-pilot-2 \\",
    "  --accepted-gate-1-sha 8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe \\",
    "  --baseline-gate-2-sha 9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7 \\",
    "  --accepted-revision-gate-a-sha 3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff \\",
    "  --accepted-advanced-gate-a-sha 3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6 \\",
    "  --revision teacher-feedback-1 \\",
    "  --gate advanced-bridge-gate-b",
    "",
    "Or build the contained Process Collection Index candidate:",
    "",
    "npm run build:biology30-unit-a-pilot-2 -- \\",
    "  --project biology30-unit-a-pilot-2 \\",
    "  --baseline-advanced-gate-b-sha 11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c \\",
    "  --gate process-collection-index",
    "",
    "Or rebuild the checkpointed final academic-review candidate:",
    "",
    "npm run build:biology30-unit-a-pilot-2 -- --project biology30-unit-a-pilot-2",
    "  --gate final-academic-review",
    "  --baseline-workspace-sha 219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc"
  ].join("\n");
}

function requiredFlag(args: ReturnType<typeof parseArgs>, name: string) {
  const value = getStringFlag(args, name);
  if (!value) throw new Error(`--${name} is required.`);
  return value;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const unknown = Object.keys(args.flags).filter((flag) => !KNOWN_FLAGS.has(flag));
  if (unknown.length || args.positionals.length) throw new Error(`Unknown arguments: ${[...unknown.map((flag) => `--${flag}`), ...args.positionals].join(" ")}`);
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }
  const gate = requiredFlag(args, "gate");
  if (gate === "process-collection-index" || gate === "final-academic-review") {
    const result = await buildBiology30UnitAPilot2ProcessCollectionIndex({
      repoRoot: process.cwd(),
      project: requiredFlag(args, "project"),
      baselineAdvancedGateBSha256: gate === "final-academic-review" ? PROCESS_COLLECTION_BASELINE_SHA256 : requiredFlag(args, "baseline-advanced-gate-b-sha"),
      baselineWorkspaceSha256: gate === "final-academic-review" ? requiredFlag(args, "baseline-workspace-sha") : undefined,
      gate
    });
    console.log(`Biology 30 Unit A Pilot 2 ${gate} was built transactionally.`);
    console.log(`- Project: ${result.projectDir}`);
    console.log(`- Workspace SHA-256: ${result.workspaceSha256}`);
    console.log(`- Workspace tree SHA-256: ${result.workspaceTreeSha256}`);
    console.log(`- Potential work records: ${result.potentialRecordCount}`);
    console.log(`- Learner state schema: version ${result.stateSchemaVersion}`);
    console.log(`- Worst-case saved state estimate: ${result.estimatedWorstCaseStateCharacters} characters`);
    console.log(`- Protected Pilot 1 / Units A-D verified unchanged: ${result.protectedProjectHashes.length}`);
    console.log(gate === "final-academic-review" ? "Status: blocked; see meta/final-academic-review.json for the current academic findings. Complete-build teacher acceptance is separate." : "Status: blocked, preview-only, Studio Edit disabled, awaiting exact-build Process Collection review.");
    return;
  }
  const result = await buildBiology30UnitAPilot2Full({
    repoRoot: process.cwd(),
    project: requiredFlag(args, "project"),
    acceptedGate1Sha256: requiredFlag(args, "accepted-gate-1-sha"),
    baselineGate2Sha256: requiredFlag(args, "baseline-gate-2-sha"),
    acceptedRevisionGateASha256: requiredFlag(args, "accepted-revision-gate-a-sha"),
    acceptedAdvancedGateASha256: requiredFlag(args, "accepted-advanced-gate-a-sha"),
    revision: requiredFlag(args, "revision"),
    gate
  });
  console.log("Biology 30 Unit A Pilot 2 Advanced Learning Bridge Gate B was built transactionally.");
  console.log(`- Project: ${result.projectDir}`);
  console.log(`- Workspace SHA-256: ${result.workspaceSha256}`);
  console.log(`- Workspace tree SHA-256: ${result.workspaceTreeSha256}`);
  console.log(`- Learner routes: ${result.learnerRouteCount}`);
  console.log(`- Practice items: ${result.practiceItemCount}`);
  console.log(`- Worst-case saved state estimate: ${result.estimatedWorstCaseStateCharacters} characters`);
  console.log(`- Protected Pilot 1 / Units A-D verified unchanged: ${result.protectedProjectHashes.length}`);
  console.log("Status: blocked, preview-only, Studio Edit disabled, awaiting exact-build Advanced Bridge Gate B review.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
