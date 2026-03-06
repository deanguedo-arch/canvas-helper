import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

async function readRepoFile(relativePath: string) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

test("studio exposes the refresh intake control and status wiring", async () => {
  const [referencePickerSource, useProjectsSource, appSource, projectsSource] = await Promise.all([
    readRepoFile("app/studio/src/components/ReferencePicker.tsx"),
    readRepoFile("app/studio/src/hooks/useProjects.ts"),
    readRepoFile("app/studio/src/App.tsx"),
    readRepoFile("app/studio/src/lib/projects.ts")
  ]);

  assert.match(referencePickerSource, /Refresh Intake/);
  assert.match(referencePickerSource, /incomingRefreshRunning/);
  assert.match(referencePickerSource, /onRefreshIntake/);

  assert.match(projectsSource, /fetch\("\/api\/incoming\/refresh"/);

  assert.match(useProjectsSource, /const summary = await refreshIncomingIntake\(\);/);
  assert.match(useProjectsSource, /await refreshProjects\(\);/);
  assert.match(useProjectsSource, /setIncomingRefreshMessage\(toIncomingRefreshMessage\(summary\)\);/);

  assert.match(appSource, /onRefreshIntake=\{\(\) => void refreshIncoming\(\)\}/);
  assert.match(appSource, /incomingRefreshMessage=\{incomingRefreshMessage\}/);
});
