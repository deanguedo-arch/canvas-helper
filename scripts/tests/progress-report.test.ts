import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRequiredCompletionItemsFromCourseShellData,
  extractProgressSummary,
  progressDocumentToRow,
  progressRowsToCsv
} from "../lib/progress-report.js";

test("extractProgressSummary counts completed required web-app items", () => {
  const summary = extractProgressSummary({
    now: "2026-04-13T20:30:00.000Z",
    requiredItems: [
      { id: "lesson-1", required: true },
      { id: "quiz-1", required: true },
      { id: "resource-1", required: false }
    ],
    state: {
      completedActivityById: {
        "lesson-1": true,
        "resource-1": true
      },
      selectedActivityId: "lesson-1"
    }
  });

  assert.deepEqual(summary, {
    completedCount: 1,
    completedItemIds: ["lesson-1"],
    lastActivityId: "lesson-1",
    percentComplete: 50,
    requiredCount: 2,
    updatedAt: "2026-04-13T20:30:00.000Z"
  });
});

test("extractProgressSummary falls back to existing report snapshots", () => {
  const summary = extractProgressSummary({
    now: "2026-04-13T20:30:00.000Z",
    state: {
      reportSnapshot: {
        completedCount: 7,
        percentComplete: 70,
        requiredCount: 10
      }
    }
  });

  assert.equal(summary.percentComplete, 70);
  assert.equal(summary.completedCount, 7);
  assert.equal(summary.requiredCount, 10);
});

test("buildRequiredCompletionItemsFromCourseShellData excludes overview and resource items", () => {
  const items = buildRequiredCompletionItemsFromCourseShellData({
    modules: [
      {
        id: "module-1",
        title: "Module 1",
        activities: [
          { id: "overview", kind: "overview", title: "Module 1" },
          { id: "lesson-1", kind: "lesson", title: "Lesson 1" },
          { id: "quiz-1", kind: "assessment", resourceKind: "quiz", title: "Quiz 1" },
          { id: "student-resources", kind: "resource", title: "Student Resource Materials" }
        ]
      }
    ]
  });

  assert.deepEqual(
    items.map((item) => item.id),
    ["lesson-1", "quiz-1"]
  );
});

test("progressDocumentToRow and progressRowsToCsv produce report-ready rows", () => {
  const row = progressDocumentToRow("course-a", {
    name: "projects/firebase/databases/(default)/documents/projects/course-a/users/user-1",
    fields: {
      progressSummary: {
        mapValue: {
          fields: {
            completedCount: { integerValue: "3" },
            lastActivityId: { stringValue: "quiz-1" },
            percentComplete: { integerValue: "75" },
            requiredCount: { integerValue: "4" },
            updatedAt: { stringValue: "2026-04-13T20:30:00.000Z" }
          }
        }
      },
      projectSlug: { stringValue: "course-a" },
      userEmail: { stringValue: "student@example.com" },
      userId: { stringValue: "user-1" },
      userName: { stringValue: "Jane Student" }
    }
  });

  assert.equal(row.percentComplete, 75);
  assert.equal(row.completedCount, 3);
  assert.equal(row.requiredCount, 4);
  assert.match(progressRowsToCsv([row]), /Jane Student,student@example.com,user-1,course-a,75,3,4,quiz-1/);
});
