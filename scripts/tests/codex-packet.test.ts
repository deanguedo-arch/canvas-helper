import assert from "node:assert/strict";
import test from "node:test";

import { buildCodexPacket } from "../../app/studio/src/lib/codex-packet.ts";
import { INSPECTION_PACKET_MAX_BYTES, type InspectionResolution } from "../../app/shared/inspection.ts";

const baseResolution: InspectionResolution = {
  projectSlug: "social30-1-related-issue-1-option-2",
  previewPath: "projects/social30-1-related-issue-1-option-2/workspace/index.html",
  selection: {
    nodeId: "ch1:1234567890abcdef12345678:1",
    visibleText: "A selected course element",
    tagName: "section",
    role: "",
    testId: "lesson-card",
    geometry: { x: 0, y: 0, width: 100, height: 50 }
  },
  resolution: "bounded",
  freshness: "unverified",
  artifactRole: "generated-workspace-output",
  generated: true,
  primaryEditTarget: "scripts/build-social30-related-issues.ts",
  contributors: ["scripts/lib/next-step-course-shell.ts"],
  rebuildCommand: "npx tsx scripts/build-social30-related-issues.ts --only social30-1-related-issue-1-option-2",
  validationCommand: "npm run course:doctor -- --project social30-1-related-issue-1-option-2",
  warnings: ["The selected workspace is generated output. Do not hand-edit the displayed HTML; use the declared source and rebuild flow."]
};

test("Codex packet is bounded and preserves generated-source safety fields", () => {
  const packet = buildCodexPacket({
    resolution: baseResolution,
    teacherNote: "Please make this much clearer. ".repeat(700),
    teacherCategory: "accessibility"
  });

  assert.ok(Buffer.byteLength(packet, "utf8") <= INSPECTION_PACKET_MAX_BYTES);
  assert.match(packet, /Generated output: yes/);
  assert.match(packet, /Change focus: accessibility/);
  assert.match(packet, /Primary edit target: scripts\/build-social30-related-issues\.ts/);
  assert.match(packet, /Rebuild: npx tsx/);
  assert.doesNotMatch(packet, /\/Users\//);
});
