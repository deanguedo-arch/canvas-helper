import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { ensureDir, removePath } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";
import { verifyProjectBundle } from "../lib/verification.js";

function buildAssessmentDelivery(embedPath: string) {
  return `const assessmentDelivery = [
  {
    activityId: "assignment-1",
    deliveryMode: "workspace-embed",
    ctaLabel: "Open assignment",
    ctaUrl: "${embedPath}",
    embedPath: "${embedPath}"
  }
];

export default assessmentDelivery;
`;
}

test("verifyProjectBundle fails when assessment-delivery references a missing workspace embed asset", async () => {
  const slug = `verify-assessment-delivery-${Date.now()}`;
  const paths = getProjectPaths(slug);
  const embedPath = "./assets/missing-assignment.html";

  await removePath(paths.root);
  await removePath(paths.resourceDir);

  try {
    await ensureDir(paths.workspaceDir);
    await writeFile(paths.workspaceEntrypoint, "<!DOCTYPE html><html><body><main>fixture</main></body></html>\n", "utf8");
    await writeFile(path.join(paths.workspaceDir, "assessment-delivery.js"), buildAssessmentDelivery(embedPath), "utf8");

    const result = await verifyProjectBundle(slug, "workspace");

    assert.equal(result.missingWorkspaceEmbeds.length, 1);
    assert.equal(result.missingWorkspaceEmbeds[0]?.activityId, "assignment-1");
    assert.equal(result.missingWorkspaceEmbeds[0]?.embedPath, "./assets/missing-assignment.html");
  } finally {
    await removePath(paths.root);
    await removePath(paths.resourceDir);
  }
});

test("verifyProjectBundle passes when assessment-delivery workspace embed assets exist locally", async () => {
  const slug = `verify-assessment-delivery-present-${Date.now()}`;
  const paths = getProjectPaths(slug);
  const embedPath = "./assets/present-assignment.html";

  await removePath(paths.root);
  await removePath(paths.resourceDir);

  try {
    await ensureDir(paths.workspaceAssetsDir);
    await writeFile(paths.workspaceEntrypoint, "<!DOCTYPE html><html><body><main>fixture</main></body></html>\n", "utf8");
    await writeFile(path.join(paths.workspaceDir, "assessment-delivery.js"), buildAssessmentDelivery(embedPath), "utf8");
    await writeFile(path.join(paths.workspaceAssetsDir, "present-assignment.html"), "<!DOCTYPE html><html><body>assignment</body></html>\n", "utf8");

    const result = await verifyProjectBundle(slug, "workspace");

    assert.equal(result.missingWorkspaceEmbeds.length, 0);
  } finally {
    await removePath(paths.root);
    await removePath(paths.resourceDir);
  }
});
