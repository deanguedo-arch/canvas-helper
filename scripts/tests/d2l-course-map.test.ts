import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { buildD2LCourseMap } from "../lib/d2l-course-map.js";
import { ensureDir, fileExists, removePath, writeTextFile } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";
import { createProjectFixture, cleanupProjectFixture } from "./helpers/project-fixture.js";

const SAMPLE_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest identifier="course" xmlns="http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1">
  <metadata>
    <schema>IMS Common Cartridge</schema>
  </metadata>
  <organizations>
    <organization identifier="org">
      <item identifier="root">
        <item identifier="module-1">
          <title>Module 1</title>
          <item identifier="lesson-1" identifierref="res-lesson">
            <title>Lesson One</title>
          </item>
          <item identifier="assignment-1" identifierref="res-assignment">
            <title>Assignment One</title>
          </item>
          <item identifier="quiz-1" identifierref="res-quiz">
            <title>Quiz One</title>
          </item>
          <item identifier="pdf-1" identifierref="res-pdf">
            <title>Outline PDF</title>
          </item>
        </item>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res-lesson">
      <file href="content/lesson-1.html" />
    </resource>
    <resource identifier="res-assignment">
      <file href="assignment/a1/assignment_123.xml" />
    </resource>
    <resource identifier="res-quiz">
      <file href="quiz/q1/qti_123.xml" />
    </resource>
    <resource identifier="res-pdf">
      <file href="content/outline.pdf" />
    </resource>
  </resources>
</manifest>
`;

test("buildD2LCourseMap parses manifest structure and writes artifacts", async () => {
  const slug = `d2l-map-${Date.now()}`;
  const paths = getProjectPaths(slug);
  const manifestPath = path.join(paths.referencesRawDir, "bundle", "imsmanifest.xml");

  await createProjectFixture({ slug });
  await ensureDir(path.dirname(manifestPath));
  await writeTextFile(manifestPath, SAMPLE_MANIFEST);

  try {
    const result = await buildD2LCourseMap(slug);

    assert.equal(await fileExists(paths.d2lCourseMapPath), true);
    assert.equal(await fileExists(paths.d2lCourseMapMarkdownPath), true);
    assert.equal(result.courseMap.summary.moduleCount, 1);
    assert.equal(result.courseMap.summary.assignmentCount, 1);
    assert.equal(result.courseMap.summary.quizCount, 1);
    assert.equal(result.courseMap.summary.pdfCount, 1);
    assert.equal(result.courseMap.summary.htmlCount, 1);
  } finally {
    await cleanupProjectFixture(slug);
    await removePath(paths.resourceDir);
  }
});
