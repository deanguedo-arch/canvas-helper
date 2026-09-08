import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { emptyGraphDraft, type GraphWork } from "./lib/biology30-course/v1/pilot2-graph-work.js";
import { renderBiology30GraphSvg } from "./lib/biology30-course/v1/pilot2-graph-svg.js";

if (process.argv.length > 2) throw new Error("Usage: node --import tsx scripts/prepare-biology30-graph-figures.ts");
const root = "projects/resources/biology30-production/v1", output = `${root}/pilot2/source-review/graph-figures`;
await mkdir(output, { recursive: true });
const records = [];
for (const [unit, name] of [["b", "graph"], ["c", "graph"], ["d", "graph"], ["d", "demographic-graph"]]) {
  const source = `${root}/units/unit-${unit}/pilot2-${name}-work.json`, bytes = await readFile(source);
  const work: GraphWork = JSON.parse(bytes.toString("utf8")), draft = emptyGraphDraft(work);
  draft.g = work.graphs.map(graph => ({ a: [...graph.expectedAxes], p: graph.series.map(series => [...series.expected]) }));
  for (const [index, graph] of work.graphs.entries()) {
    const rendered = renderBiology30GraphSvg(work, index, draft, "author-model");
    if (rendered.warnings.length) throw new Error(`Authored model graph has invalid scale: ${graph.id}`);
    const file = `${output}/${graph.id}.svg`;
    await writeFile(file, rendered.svg + "\n");
    records.push({ unit: work.unit, id: graph.id, scope: name === "graph" ? "required core graph" : "optional investigation extension", file, sha256: createHash("sha256").update(rendered.svg + "\n").digest("hex"), width: rendered.width, height: rendered.height,
      source, sourceSha256: createHash("sha256").update(bytes).digest("hex"), values: rendered.values, interpretation: rendered.interpretation,
      role: "Author model-answer figure. Learner graph must render the saved draft; never use this file to fill learner entries.", visualReview: "pending", teacherDecision: null });
  }
}
await writeFile(`${output}/manifest.json`, JSON.stringify({ status: "authored source-bound SVGs; visual review and learner placement pending", records }, null, 2) + "\n");
console.log(JSON.stringify({ graphs: records.length, values: records.reduce((n, r) => n + r.values.length, 0), output }, null, 2));
