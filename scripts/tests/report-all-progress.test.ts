import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { buildReportAllOutputPaths } from "../report-all-progress.js";

test("buildReportAllOutputPaths writes into reports with timestamped and latest filenames", () => {
  const outputPaths = buildReportAllOutputPaths("C:/repo/canvas-helper", new Date("2026-04-13T16:55:00"));

  assert.equal(outputPaths.reportsDir, path.join("C:/repo/canvas-helper", "reports"));
  assert.equal(outputPaths.latestCsvPath, path.join("C:/repo/canvas-helper", "reports", "latest-progress.csv"));
  assert.equal(
    outputPaths.timestampedCsvPath,
    path.join("C:/repo/canvas-helper", "reports", "progress-2026-04-13-1655.csv")
  );
});
