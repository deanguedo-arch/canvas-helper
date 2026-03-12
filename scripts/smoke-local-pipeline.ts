import assert from "node:assert/strict";
import path from "node:path";

import { analyzeProject } from "./lib/analyzer.js";
import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import {
  exportProjectToBrightspace,
  exportProjectToBrightspacePackage,
  exportProjectToGoogleHosted,
  exportProjectToSingleHtml
} from "./lib/exporter.js";
import { fileExists, removePath } from "./lib/fs.js";
import { readCliIntelligenceOverride, refreshProjectIntelligence } from "./lib/intelligence.js";
import { importProject } from "./lib/importer.js";
import { getProjectPaths, repoRoot } from "./lib/paths.js";
import { extractProjectReferences } from "./lib/references.js";
import { verifyProjectBundle } from "./lib/verification.js";

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(getStringFlag(parsedArgs, "input") ?? path.join(repoRoot, "canvas code and references"));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? "smoke-calm-module";
  const keepProject = hasFlag(parsedArgs, "keep");
  const policyOverride = readCliIntelligenceOverride(parsedArgs);
  const projectPaths = getProjectPaths(projectSlug);

  await removePath(projectPaths.root);

  try {
    console.log(`[smoke] importing ${inputPath} -> ${projectSlug}`);
    await importProject({
      inputPath,
      slug: projectSlug,
      force: true,
      policyOverride
    });

    console.log("[smoke] analyzing workspace");
    const analysis = await analyzeProject(projectSlug);

    console.log("[smoke] extracting references");
    const references = await extractProjectReferences(projectSlug);

    console.log("[smoke] refreshing intelligence");
    const intelligence = await refreshProjectIntelligence(projectSlug, {
      markWorkspaceApproved: true,
      command: "refs",
      policyOverride
    });

    console.log("[smoke] exporting brightspace folder");
    const brightspace = await exportProjectToBrightspace(projectSlug);

    console.log("[smoke] packaging brightspace zip");
    const brightspacePackage = await exportProjectToBrightspacePackage(projectSlug);

    console.log("[smoke] exporting single html");
    const singleHtml = await exportProjectToSingleHtml(projectSlug);

    console.log("[smoke] exporting google hosted bundle");
    const googleHosted = await exportProjectToGoogleHosted(projectSlug);

    console.log("[smoke] verifying workspace and brightspace outputs");
    const workspaceVerify = await verifyProjectBundle(projectSlug, "workspace");
    const brightspaceVerify = await verifyProjectBundle(projectSlug, "brightspace");

    assert.ok(await fileExists(projectPaths.workspaceEntrypoint), "workspace entrypoint missing");
    assert.ok(await fileExists(projectPaths.manifestPath), "project manifest missing");
    assert.ok(await fileExists(projectPaths.referenceIndexPath), "reference index missing");
    assert.ok(await fileExists(projectPaths.resourceCatalogPath), "resource catalog missing");
    assert.ok(await fileExists(projectPaths.importLogPath), "import log missing");
    assert.ok(await fileExists(projectPaths.styleGuidePath), "style guide missing");
    assert.ok(await fileExists(path.join(projectPaths.metaDir, "prompt-pack.md")), "prompt pack missing");
    assert.ok(await fileExists(path.join(projectPaths.brightspaceExportDir, "index.html")), "brightspace export missing");
    assert.ok(await fileExists(brightspacePackage.zipPath), "brightspace package zip missing");
    assert.ok(await fileExists(singleHtml.outputPath), "single html export missing");
    assert.ok(await fileExists(path.join(googleHosted.exportDir, "index.html")), "google hosted export missing");
    assert.ok(await fileExists(path.join(googleHosted.exportDir, "google-hosted-bridge.js")), "google hosted bridge missing");
    assert.ok(await fileExists(path.join(googleHosted.exportDir, "firebase.json")), "google hosted firebase.json missing");
    assert.ok(
      await fileExists(path.join(googleHosted.exportDir, "firebase-config.template.json")),
      "google hosted firebase config missing"
    );
    assert.ok(await fileExists(path.join(googleHosted.exportDir, "README-deploy.md")), "google hosted deploy guide missing");
    assert.ok(references.references.length > 0, "reference extraction produced no references");
    assert.equal(workspaceVerify.missingAssets.length, 0, "workspace verification found missing assets");
    assert.equal(brightspaceVerify.missingAssets.length, 0, "brightspace verification found missing assets");

    console.log("[smoke] ok");
    console.log(`- project: ${projectSlug}`);
    console.log(`- sections: ${analysis.sectionCount}`);
    console.log(`- references: ${references.references.length}`);
    console.log(`- prompt-pack matches: ${intelligence.patternMatches}`);
    console.log(`- brightspace files: ${brightspace.fileCount}`);
    console.log(`- brightspace zip: ${brightspacePackage.zipPath}`);
    console.log(`- google hosted: ${googleHosted.exportDir}`);
    console.log(`- single html: ${singleHtml.outputPath}`);
  } finally {
    if (!keepProject) {
      await removePath(projectPaths.root);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
