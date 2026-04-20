import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { ensureDir, removePath } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";
import { verifyProjectBundle } from "../lib/verification.js";

function buildCourseShellData(sourceHref: string) {
  return `export default {
  projectSlug: "verification-fixture",
  modules: [
    {
      id: "module-1",
      title: "Module 1",
      activities: [
        {
          id: "lesson-1",
          title: "Lesson 1",
          moduleTitle: "Module 1",
          sourceHref: "${sourceHref}",
          resourceKind: "html",
          contentBody: "",
          contentPreview: ""
        },
        {
          id: "assessment-1",
          title: "Assignment 1",
          moduleTitle: "Module 1",
          sourceHref: "assignment/missing.xml",
          resourceKind: "assignment",
          contentBody: "This assessment is referenced in the D2L export, but the cartridge bundle on this computer did not include the source file.",
          contentPreview: "This assessment is referenced in the D2L export, but the cartridge bundle on this computer did not include the source file."
        }
      ]
    }
  ]
};
`;
}

test("verifyProjectBundle fails when course-shell lesson sources are missing from local resources", async () => {
  const slug = `verify-course-shell-${Date.now()}`;
  const paths = getProjectPaths(slug);
  const lessonHref = "content/unit-1/lesson-1.html";

  await removePath(paths.root);
  await removePath(paths.resourceDir);

  try {
    await ensureDir(paths.workspaceDir);
    await ensureDir(paths.resourceDir);
    await writeFile(paths.workspaceEntrypoint, "<!DOCTYPE html><html><body><main>fixture</main></body></html>\n", "utf8");
    await writeFile(path.join(paths.workspaceDir, "course-shell-data.js"), buildCourseShellData(lessonHref), "utf8");

    const result = await verifyProjectBundle(slug, "workspace");

    assert.equal(result.missingCourseShellResources.length, 1);
    assert.equal(result.missingCourseShellResources[0]?.activityTitle, "Lesson 1");
    assert.equal(result.missingCourseShellResources[0]?.sourceHref, lessonHref);
    assert.equal(result.declaredMissingCourseShellResources.length, 1);
    assert.equal(result.declaredMissingCourseShellResources[0]?.activityTitle, "Assignment 1");
  } finally {
    await removePath(paths.root);
    await removePath(paths.resourceDir);
  }
});

test("verifyProjectBundle passes when course-shell lesson resources exist locally", async () => {
  const slug = `verify-course-shell-present-${Date.now()}`;
  const paths = getProjectPaths(slug);
  const lessonHref = "content/unit-1/lesson-1.html";

  await removePath(paths.root);
  await removePath(paths.resourceDir);

  try {
    await ensureDir(paths.workspaceDir);
    await ensureDir(path.join(paths.resourceDir, "content", "unit-1"));
    await writeFile(paths.workspaceEntrypoint, "<!DOCTYPE html><html><body><main>fixture</main></body></html>\n", "utf8");
    await writeFile(path.join(paths.workspaceDir, "course-shell-data.js"), buildCourseShellData(lessonHref), "utf8");
    await writeFile(path.join(paths.resourceDir, "content", "unit-1", "lesson-1.html"), "<p>Lesson</p>\n", "utf8");

    const result = await verifyProjectBundle(slug, "workspace");

    assert.equal(result.missingCourseShellResources.length, 0);
    assert.equal(result.declaredMissingCourseShellResources.length, 1);
  } finally {
    await removePath(paths.root);
    await removePath(paths.resourceDir);
  }
});
