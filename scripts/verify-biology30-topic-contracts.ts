import { auditBiology30Retention } from "./lib/biology30-course/v1/pilot2-retention-audit.js";
import { validateBiology30PracticeOperations } from "./lib/biology30-course/v1/pilot2-practice-operations.js";
import { auditBiology30InvestigationReviews } from "./lib/biology30-course/v1/pilot2-investigation-audit.js";
import { validateBiology30DefinitionReview } from "./lib/biology30-course/v1/pilot2-definition-review.js";
import { auditBiology30TextbookReviews } from "./lib/biology30-course/v1/pilot2-textbook-audit.js";
import { auditBiology30PracticeKeys } from "./lib/biology30-course/v1/pilot2-practice-review.js";
import { auditBiology30GraphWork } from "./lib/biology30-course/v1/pilot2-graph-audit.js";
import { readFile } from "node:fs/promises";
import { validateBiology30PassageReviews } from "./lib/biology30-course/v1/pilot2-passage-audit.js";
import { readBiology30TopicContract, type TopicUnit } from "./lib/biology30-course/v1/pilot2-contract.js";
import { auditBiology30PlanningInputs } from "./lib/biology30-course/v1/pilot2-planning-audit.js";

import { auditBiology30LearningInputs } from "./lib/biology30-course/v1/pilot2-learning-audit.js";
import { auditBiology30Instruction } from "./lib/biology30-course/v1/pilot2-instruction-audit.js";
import { auditBiology30Models } from "./lib/biology30-course/v1/pilot2-model-audit.js";

const args = process.argv.slice(2);
if (args.some(arg => arg !== "--pre-render")) throw new Error("Usage: verify:biology30-course:topic-contracts [--pre-render]");
const reports = [];
for (const unit of ["B", "C", "D"] as TopicUnit[]) {
  const { contract, report, file, sha256 } = await readBiology30TopicContract(process.cwd(), unit, args.includes("--pre-render"));
  const planning = await auditBiology30PlanningInputs(process.cwd(), contract);
  const learning = await auditBiology30LearningInputs(process.cwd(), contract);
  const practiceOperations = validateBiology30PracticeOperations(planning.input.academic, learning.input.practice);
  const definitionReview = JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}/pilot2-definition-wording-review.json`, "utf8"));
  const definitions = validateBiology30DefinitionReview(learning.input.vocabulary, definitionReview);
  const instruction = await auditBiology30Instruction(process.cwd(), contract);
  const models = await auditBiology30Models(process.cwd(), contract);
  const graphWork = await auditBiology30GraphWork(process.cwd(), contract, learning.input);
  const passageReview = JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}/pilot2-practice-passage-review.json`, "utf8"));
  const passages = validateBiology30PassageReviews(learning.input.practice, instruction.core, instruction.instruction, passageReview, args.includes("--pre-render"));
  const textbook = await auditBiology30TextbookReviews(process.cwd(), unit, instruction.core, args.includes("--pre-render"));
  const practiceKeys = await auditBiology30PracticeKeys(process.cwd(), learning.input.practice, args.includes("--pre-render"));
  const investigations = await auditBiology30InvestigationReviews(process.cwd(), unit, args.includes("--pre-render"));
  const retention = await auditBiology30Retention(process.cwd(), unit, args.includes("--pre-render"));
  const { outputs, ...modelSummary } = models.report;
  reports.push({ practiceOperations, retention, definitions, investigations, practiceKeys, textbookReview: textbook, graphWork: graphWork.report, graphWorkSources: graphWork.files, passages, models: modelSummary, modelSources: models.files, instruction: instruction.report, instructionSources: instruction.files, learning: learning.report, learningSources: learning.files, ...report, file, sha256, planning: planning.report, planningSources: planning.files });
}
console.log(JSON.stringify({ scope: "Planning structure only unless --pre-render is requested; draft validation never proves academic readiness.", reports }, null, 2));
