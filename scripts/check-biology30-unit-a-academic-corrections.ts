import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { academicCorrectionBaselineDirectory, buildAcademicCorrectionReport } from "./lib/biology30-unit-a-pilot-2/academic-corrections.js";
import { ONLINE_BASELINE, onlineBaselineDirectory } from "./lib/biology30-unit-a-pilot-2/online-finalization.js";
import { createHash } from "node:crypto";

export async function checkAcademicCorrections() {
  const project = "projects/biology30-unit-a-pilot-2";
  const report = JSON.parse(await readFile(`${project}/meta/academic-corrections.json`, "utf8"));
  const before = await readFile(`${project}/${academicCorrectionBaselineDirectory}/workspace/index.html`, "utf8");
  const current = await readFile(`${project}/workspace/index.html`, "utf8");
  const currentSha=createHash("sha256").update(current).digest("hex");
  const after = report.workspaceSha256===currentSha?current:await readFile(`${project}/${onlineBaselineDirectory}/workspace/index.html`,"utf8");
  if(report.workspaceSha256!==currentSha){assert.equal(report.workspaceSha256,ONLINE_BASELINE);assert.equal(createHash("sha256").update(after).digest("hex"),ONLINE_BASELINE);}
  const historical = JSON.parse(await readFile(`${project}/${academicCorrectionBaselineDirectory}/meta/remaining-academic-review.json`, "utf8"));
  const expected = buildAcademicCorrectionReport(before, after, historical, report.generatedAt);
  assert.deepEqual(report, expected, "The correction report no longer matches the exact learner build/authored corrections");
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await checkAcademicCorrections();
  console.log(JSON.stringify({ workspaceSha256: report.workspaceSha256, counts: report.counts, status: report.status }, null, 2));
}
