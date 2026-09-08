import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { buildTopicActivityIndex, validateTopicActivityIndex, type ActivityInputs } from "./lib/biology30-course/v1/pilot2-activity-index.js";
import { biology30TopicDesignSha256 } from "./lib/biology30-course/v1/pilot2-contract.js";

const args = process.argv.slice(2);
if (args.some(arg => arg !== "--write")) throw new Error("Usage: node --import tsx scripts/audit-biology30-topic-activities.ts [--write]");
const reports = [];
for (const unit of ["B", "C", "D"]) {
  const base = `projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}`;
  const sourceFiles: Record<string, string> = {};
  const load = async (name: string) => {
    const file = `${base}/pilot2-${name}.json`, bytes = await readFile(file);
    if (name !== "contract") sourceFiles[file] = createHash("sha256").update(bytes).digest("hex");
    return JSON.parse(bytes.toString("utf8"));
  };
  const input: ActivityInputs = { contract: await load("contract"), state: await load("state-schema"), framing: await load("topic-teaching"), instruction: await load("instruction"),
    practice: await load("practice"), vocabulary: await load("vocabulary"), models: await load("models"), investigations: await load("investigations"), seminar: await load("review-seminar"), textbook: await load("textbook-guides") };
  const entries = buildTopicActivityIndex(input), inventory = validateTopicActivityIndex(entries, input.state);
  const result = { unit, role: "derived authoring contract; regenerate through the owning activity-index builder", status: "complete state identity inventory; rendered return targets and lifecycle pending",
    regenerateCommand: "node --import tsx scripts/audit-biology30-topic-activities.ts --write", topicDesignSha256: biology30TopicDesignSha256(input.contract), sourceFiles, inventory, entries, teacherDecision: null };
  if (args.includes("--write")) await writeFile(`${base}/pilot2-activity-index.json`, `${JSON.stringify(result, null, 2)}\n`);
  reports.push({ unit, ...inventory, renderedEvidence: null });
}
process.stdout.write(`${JSON.stringify(reports, null, 2)}\n`);
