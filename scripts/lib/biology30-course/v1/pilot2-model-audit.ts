import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { runBiology30TopicModel, type TopicModel } from "./pilot2-models.js";
import type { TopicContract } from "./pilot2-contract.js";
import type { TopicStateSchema } from "./pilot2-state.js";

type AuditedModel = TopicModel & {
  teachingTopicId: string; requiredForCompletion: boolean; requiredForScore: boolean;
  predictionId: string; explanationId: string; predictionPrompt: string; explanationPrompt: string;
  testFlag: string; collectionFlag: string; stages: string[]; sourceInvestigationId?: string;
  sourceBindings?: { modelPath: (string | number)[]; datasetPath: (string | number)[] }[];
};
type ModelInputs = { unit: string; models: AuditedModel[] };
type InvestigationInputs = { unit: string; investigations: { id: string; dataset: unknown }[] };
function at(value: unknown, keys: (string | number)[]): unknown {
  if (!keys.length) throw new Error("Empty model source path");
  for (const key of keys) {
    if (!value || typeof value !== "object" || !Object.hasOwn(value, key)) throw new Error("Unresolved model source path");
    value = (value as Record<string | number, unknown>)[key];
  }
  return value;
}
export function validateBiology30Models(contract: TopicContract, inputs: ModelInputs, investigations: InvestigationInputs, state: TopicStateSchema) {
  if ([inputs.unit, investigations.unit, state.unit].some(unit => unit !== contract.unit)) throw new Error("Cross-unit model inputs");
  if (inputs.models.length !== 3 || new Set(inputs.models.map(model => model.id)).size !== 3) throw new Error("Model inventory drift");
  let bindings = 0;
  const outputs = inputs.models.flatMap(model => {
    if (!model.id.startsWith(`${contract.unit.toLowerCase()}-model-`) || !contract.topics.some(topic => topic.id === model.teachingTopicId)
      || model.requiredForCompletion !== false || model.requiredForScore !== false
      || JSON.stringify(model.stages) !== JSON.stringify(["Predict", "Test", "Explain", "Save"])
      || !model.predictionPrompt?.trim() || !model.explanationPrompt?.trim()
      || !state.responses[model.predictionId] || !state.responses[model.explanationId]
      || !state.flags[model.testFlag] || !state.flags[model.collectionFlag]
      || JSON.stringify(state.choices[model.id]?.values) !== JSON.stringify(model.options)) throw new Error(`Model teaching/state drift: ${model.id}`);
    if (model.sourceInvestigationId) {
      const source = investigations.investigations.find(item => item.id === model.sourceInvestigationId);
      if (!source || !model.sourceBindings?.length) throw new Error(`Unresolved investigation binding: ${model.id}`);
      for (const binding of model.sourceBindings) {
        if (JSON.stringify(at(model, binding.modelPath)) !== JSON.stringify(at(source.dataset, binding.datasetPath))) throw new Error(`Model/investigation data drift: ${model.id}`);
        bindings++;
      }
    } else if (model.sourceBindings?.length) throw new Error("Model binding lacks source identity");
    return model.options.map(option => {
      const result = runBiology30TopicModel(model, option);
      if (!result.rows.length || result.rows.some(row => row.length !== result.columns.length) || !result.explanation.trim() || !result.limitation.trim()) throw new Error(`Incomplete model result: ${model.id}`);
      return result;
    });
  });
  return { unit: contract.unit, models: inputs.models.length, cases: outputs.length, sharedDataBindings: bindings, outputs,
    proof: "Deterministic outputs and source/state consistency; scientific source review, graph accessibility and browser interaction remain separate gates." };
}
export async function auditBiology30Models(repoRoot: string, contract: TopicContract) {
  const base = `projects/resources/biology30-production/v1/units/unit-${contract.unit.toLowerCase()}`;
  const files = ["models", "investigations", "state-schema"].map(name => `${base}/pilot2-${name}.json`);
  files.push("scripts/lib/biology30-course/v1/pilot2-models.ts", "scripts/lib/biology30-course/v1/pilot2-science.ts");
  const bytes = await Promise.all(files.map(file => readFile(path.join(repoRoot, file))));
  const [models, investigations, state] = bytes.slice(0, 3).map(data => JSON.parse(data.toString("utf8")));
  return { report: validateBiology30Models(contract, models, investigations, state), files: files.map((file, i) => ({ file, sha256: createHash("sha256").update(bytes[i]).digest("hex") })) };
}
