import { writeFile } from "node:fs/promises";
import { readBiology30TopicContract, type TopicUnit } from "./lib/biology30-course/v1/pilot2-contract.js";
import { auditBiology30Models } from "./lib/biology30-course/v1/pilot2-model-audit.js";
if (process.argv.slice(2).some(arg => arg !== "--write")) throw new Error("Usage: audit-biology30-topic-models [--write]");
const summaries = [];
for (const unit of ["B", "C", "D"] as TopicUnit[]) {
  const { contract } = await readBiology30TopicContract(process.cwd(), unit);
  const audit = await auditBiology30Models(process.cwd(), contract);
  const report = { ...audit.report, inputFiles: audit.files, browserEvidence: null, teacherDecision: null };
  if (process.argv.includes("--write")) await writeFile(`projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}/pilot2-model-outputs.json`, JSON.stringify(report, null, 2) + "\n");
  summaries.push({ unit, models: report.models, cases: report.cases, sharedDataBindings: report.sharedDataBindings });
}
console.log(JSON.stringify(summaries, null, 2));
