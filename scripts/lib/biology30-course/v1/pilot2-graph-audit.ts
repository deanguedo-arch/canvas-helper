import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { graphMaximumResponse, type GraphWork } from "./pilot2-graph-work.js";
import { passageDigest } from "./pilot2-passage-audit.js";
import { discreteGrowth } from "./pilot2-science.js";
import type { TopicContract } from "./pilot2-contract.js";
import type { LearningInputs } from "./pilot2-learning-audit.js";

type AuthoredGraphWork = GraphWork & { source: { kind: string; investigationId?: string; datasetSha256?: string; initial?: number; proportionalRate?: number; carryingCapacity?: number; steps?: number; requiredPartId?: string }; teacherDecision: unknown };
type Investigations = { unit: string; investigations: { id: string; dataset: { columns: string[]; rows: (string | number)[][] } }[] };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export function validateBiology30GraphWork(contract: TopicContract, work: AuthoredGraphWork, learning: LearningInputs, investigations: Investigations) {
  if (work.unit !== contract.unit || investigations.unit !== contract.unit || work.teacherDecision !== null) throw new Error("Graph unit or provisional authority drift");
  const item = learning.practice.items.find(item => item.id === work.responseId);
  if (!item || item.kind !== "constructed" || item.role !== "guided" || !item.routeId.includes("topic")) throw new Error("Required graph must use its existing guided constructed response");
  if (!Number.isSafeInteger(work.explanationLimit) || work.explanationLimit < work.modelExplanation.length * 1.2 + 20) throw new Error("Graph explanation lacks model working room");
  const ids = new Set<string>();
  for (const graph of work.graphs) {
    if (ids.has(graph.id) || !graph.title.trim() || !["line", "bar"].includes(graph.kind) || !graph.x.length || new Set(graph.x).size !== graph.x.length || !graph.series.length) throw new Error("Graph identity, form or coordinate inventory drift");
    ids.add(graph.id);
    if (graph.kind === "line" && graph.x.some((x, index) => typeof x !== "number" || !Number.isFinite(x) || index > 0 && Number(x) <= Number(graph.x[index - 1]))) throw new Error("Line graph needs ordered numerical x positions");
    if (graph.kind === "bar" && graph.x.some(x => typeof x !== "string" || !x.trim())) throw new Error("Stage bar graph needs named categories");
    const choices = [graph.xLabels, graph.yLabels, graph.maxima];
    if (choices.some(values => values.length < 2 || values.length > 5 || new Set<string | number>(values).size !== values.length) || graph.xLabels.concat(graph.yLabels).some(label => !label.trim()) || graph.maxima.some(n => !Number.isFinite(n) || n <= 0)) throw new Error("Graph axis choices missing or duplicated");
    if (graph.expectedAxes.length !== 3 || graph.expectedAxes.some((n, axis) => !Number.isSafeInteger(n) || n < 0 || n >= choices[axis].length)) throw new Error("Graph expected axis selection invalid");
    if (new Set(graph.series.map(series => series.id)).size !== graph.series.length || graph.series.some(series => !series.label.trim() || series.expected.length !== graph.x.length || series.expected.some(y => !Number.isFinite(y) || y < 0 || y > graph.maxima[graph.expectedAxes[2]]))) throw new Error("Graph source values or expected scale invalid");
  }
  const source = work.source;
  if (contract.unit === "B" || contract.unit === "C") {
    const expectedId = contract.unit === "B" ? "b-investigation-cycle-graphs" : "c-investigation-cell-observations";
    const data = investigations.investigations.find(item => item.id === expectedId)?.dataset;
    if (source.kind !== "shared-investigation-data" || source.investigationId !== expectedId || !data || passageDigest(data) !== source.datasetSha256) throw new Error("Graph source dataset changed or detached");
    const number = contract.unit === "B" ? 4 : 1;
    if (work.graphs.length !== number || work.graphs.some((graph, i) => !same(graph.x, data.rows.map(row => row[0])) || graph.series.length !== 1 || !same(graph.series[0].expected, data.rows.map(row => row[contract.unit === "B" ? i + 1 : 1])))) throw new Error("Graph values differ from supplied shared data");
  } else {
    if (source.kind !== "original-extension-of-required-worked-model" || source.initial !== 100 || source.proportionalRate !== 0.2 || source.carryingCapacity !== 500 || source.steps !== 4 || source.requiredPartId !== "d-topic-population-growth-exponential-and-logistic-models" || !item.teachingPartIds.includes(source.requiredPartId)) throw new Error("Growth construction detached from required worked model");
    const exponential = [0, 1, 2, 3, 4].map(step => Math.round(discreteGrowth(100, 0.2, step) * 10) / 10);
    const raw = [100]; for (let i = 0; i < 4; i++) raw.push(raw[i] + 0.2 * raw[i] * (1 - raw[i] / 500));
    const logistic = raw.map(value => Math.round(value * 10) / 10), graph = work.graphs[0];
    if (work.graphs.length !== 1 || graph.series.length !== 2 || !same(graph.x, [0, 1, 2, 3, 4]) || !same(graph.series[0].expected, exponential) || !same(graph.series[1].expected, logistic)) throw new Error("Growth construction changed recurrence or rounding");
  }
  const maximumResponseCharacters = graphMaximumResponse(work, learning.state.responses[work.responseId].limit);
  return { unit: contract.unit, graphs: work.graphs.length, points: work.graphs.reduce((sum, graph) => sum + graph.series.length * graph.x.length, 0), maximumResponseCharacters,
    proof: "Shared source values, complete authored graph operations and saved-field capacity only. Keyboard graph controls, full collection rendering and browser evidence remain pending." };
}
export async function auditBiology30GraphWork(repoRoot: string, contract: TopicContract, learning: LearningInputs) {
  const base = `projects/resources/biology30-production/v1/units/unit-${contract.unit.toLowerCase()}`;
  const files = [`${base}/pilot2-graph-work.json`, `${base}/pilot2-investigations.json`];
  const bytes = await Promise.all(files.map(file => readFile(path.join(repoRoot, file))));
  const [work, investigations] = bytes.map(value => JSON.parse(value.toString("utf8"))) as [AuthoredGraphWork, Investigations];
  return { work, investigations, report: validateBiology30GraphWork(contract, work, learning, investigations), files: files.map((file, i) => ({ file, sha256: createHash("sha256").update(bytes[i]).digest("hex") })) };
}
