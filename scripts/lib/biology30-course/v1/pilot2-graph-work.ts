/** Browser-safe authored graph construction and saved-response contract. */
export type GraphWork = {
  unit: string;
  responseId: string;
  explanationLimit: number;
  modelExplanation: string;
  graphs: {
    id: string; title: string; kind: "line" | "bar";
    x: (number | string)[];
    series: { id: string; label: string; expected: number[] }[];
    xLabels: string[]; yLabels: string[]; maxima: number[];
    expectedAxes: [number, number, number];
  }[];
};
export type GraphDraft = { v: 1; k: string; g: { a: [number | null, number | null, number | null]; p: (number | null)[][] }[]; e: string };
const exactKeys = (value: object, keys: string[]) => Object.keys(value).sort().join("|") === [...keys].sort().join("|");
export function emptyGraphDraft(work: GraphWork): GraphDraft {
  return { v: 1, k: work.unit, g: work.graphs.map(graph => ({ a: [null, null, null], p: graph.series.map(() => graph.x.map(() => null)) })), e: "" };
}
export function validateGraphDraft(work: GraphWork, value: unknown): asserts value is GraphDraft {
  if (!value || typeof value !== "object" || !exactKeys(value, ["v", "k", "g", "e"])) throw new Error("Unknown graph response format; preserve the original writing");
  const draft = value as GraphDraft;
  if (draft.v !== 1 || draft.k !== work.unit || !Array.isArray(draft.g) || draft.g.length !== work.graphs.length || typeof draft.e !== "string" || draft.e.length > work.explanationLimit) throw new Error("Graph unit, inventory or explanation capacity mismatch");
  for (const [index, graph] of work.graphs.entries()) {
    const data = draft.g[index];
    if (!data || typeof data !== "object" || !exactKeys(data, ["a", "p"]) || !Array.isArray(data.a) || data.a.length !== 3 || !Array.isArray(data.p) || data.p.length !== graph.series.length) throw new Error("Graph axes or series inventory mismatch");
    const counts = [graph.xLabels.length, graph.yLabels.length, graph.maxima.length];
    if (data.a.some((choice, axis) => choice !== null && (!Number.isSafeInteger(choice) || choice < 0 || choice >= counts[axis]))) throw new Error("Unknown graph axis selection");
    for (const points of data.p) {
      if (!Array.isArray(points) || points.length !== graph.x.length) throw new Error("Graph point inventory mismatch");
      if (points.some(point => point !== null && (typeof point !== "number" || !Number.isFinite(point) || point < 0 || point > 9999.99 || Math.abs(point * 100 - Math.round(point * 100)) > 1e-7))) throw new Error("Graph values must be finite nonnegative numbers with at most two decimal places");
    }
  }
}
export function encodeGraphDraft(work: GraphWork, draft: GraphDraft, responseLimit: number): string {
  validateGraphDraft(work, draft);
  const encoded = JSON.stringify(draft);
  if (encoded.length > responseLimit) throw new Error("Graph response exceeds its saved field; keep the previous valid response and current draft");
  return encoded;
}
export function decodeGraphDraft(work: GraphWork, response: string): { kind: "graph"; draft: GraphDraft } | { kind: "preserved-writing"; original: string } {
  // Ordinary earlier prose, malformed JSON and later versions remain recoverable.
  // Never coerce them into an empty graph and overwrite their original contents.
  try {
    const value: unknown = JSON.parse(response);
    validateGraphDraft(work, value);
    return { kind: "graph", draft: value };
  } catch { return { kind: "preserved-writing", original: response }; }
}
export function compareGraphDraft(work: GraphWork, draft: GraphDraft) {
  validateGraphDraft(work, draft);
  return work.graphs.map((graph, index) => {
    const data = draft.g[index];
    return { graphId: graph.id,
      axes: data.a.map((value, axis) => value === null ? "blank" : axis === 2 ? graph.maxima[value] >= Math.max(...graph.series.flatMap(series => series.expected)) ? "fits-source-values" : "scale-too-small" : value === graph.expectedAxes[axis] ? "matches" : "compare-axis-label"),
      series: graph.series.map((series, s) => ({ id: series.id, points: data.p[s].map((point, i) => point === null ? "blank" : Math.abs(point - series.expected[i]) < 0.005 ? "matches" : "compare-source-value") })),
      outsideScale: data.a[2] === null ? [] : data.p.flatMap((values, series) => values.flatMap((point, pointIndex) => point !== null && point > graph.maxima[data.a[2]!] ? [{ series, pointIndex, value: point }] : [])) };
  });
}
/** Readable source-derived collection text, including unfinished coordinates. */
export function graphWorkText(work: GraphWork, draft: GraphDraft): string {
  validateGraphDraft(work, draft);
  return work.graphs.map((graph, index) => {
    const data = draft.g[index];
    return [graph.title, `Horizontal axis: ${data.a[0] === null ? "not selected" : graph.xLabels[data.a[0]]}`, `Vertical axis: ${data.a[1] === null ? "not selected" : graph.yLabels[data.a[1]]}`, `Vertical maximum: ${data.a[2] === null ? "not selected" : graph.maxima[data.a[2]]}`,
      ...graph.series.map((series, s) => `${series.label}: ${graph.x.map((x, i) => `${x} = ${data.p[s][i] ?? "not plotted"}`).join("; ")}`)].join("\n");
  }).concat(`Explanation: ${draft.e || "not written"}`).join("\n\n");
}
export function graphMaximumResponse(work: GraphWork, responseLimit: number) {
  const draft = emptyGraphDraft(work);
  draft.e = "x".repeat(work.explanationLimit);
  draft.g.forEach((data, index) => { data.a = work.graphs[index].expectedAxes; data.p = data.p.map(points => points.map(() => 9999.99)); });
  return encodeGraphDraft(work, draft, responseLimit).length;
}
