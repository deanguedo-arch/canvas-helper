import { validateGraphDraft, type GraphDraft, type GraphWork } from "./pilot2-graph-work.js";

const escape = (text: unknown) => String(text).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
const number = (value: number) => Number(value.toFixed(2));

/** Draw only the learner's values. Answer arrays never supply missing draft points. */
export function renderBiology30GraphSvg(work: GraphWork, graphIndex: number, draft: GraphDraft, instance = "learner") {
  validateGraphDraft(work, draft);
  const graph = work.graphs[graphIndex], drawing = draft.g[graphIndex];
  if (!graph || !drawing) throw new Error("Unknown required graph");
  const width = 960, height = 560, left = 96, right = 920, top = 108, bottom = 424;
  const maximum = drawing.a[2] === null ? null : graph.maxima[drawing.a[2]];
  const xLabel = drawing.a[0] === null ? "Horizontal label not chosen" : graph.xLabels[drawing.a[0]];
  const yLabel = drawing.a[1] === null ? "Vertical label not chosen" : graph.yLabels[drawing.a[1]];
  const numericX = graph.x.every(value => typeof value === "number");
  const xValues = graph.x as number[];
  const minimumX = numericX ? Math.min(...xValues) : 0;
  const maximumX = numericX ? Math.max(...xValues) : 0;
  const x = (index: number) => numericX
    ? left + (right - left) * (maximumX === minimumX ? 0.5 : (xValues[index] - minimumX) / (maximumX - minimumX))
    : left + (right - left) * (index + 0.5) / graph.x.length;
  const y = (value: number) => bottom - (bottom - top) * value / maximum!;
  const colours = ["#176a65", "#815022", "#3d588b", "#8c4567"];
  const warnings: string[] = [];
  const layers: string[] = [];
  const values: { series: string; x: string | number; value: number | null }[] = [];
  const description: string[] = [`${xLabel}; ${yLabel}.`, maximum === null ? "No vertical scale selected." : `Vertical scale: zero to ${maximum}.`];
  if (maximum === null) warnings.push("Choose a vertical maximum to plot the entered values.");

  graph.series.forEach((series, seriesIndex) => {
    const colour = colours[seriesIndex % colours.length];
    const dash = seriesIndex % 2 ? ' stroke-dasharray="9 5"' : "";
    layers.push(`<g data-series="${escape(series.id)}"><path d="M96 ${36 + seriesIndex * 28} h38" fill="none" stroke="${colour}" stroke-width="3"${dash}/><text x="148" y="${43 + seriesIndex * 28}" font-size="20">${escape(series.label)}</text>`);
    let line = "", connected = false;
    drawing.p[seriesIndex].forEach((value, index) => {
      values.push({ series: series.label, x: graph.x[index], value });
      description.push(`${series.label}, ${graph.x[index]}: ${value === null ? "blank" : value}.`);
      if (value === null || maximum === null) { connected = false; return; }
      if (value > maximum) {
        connected = false;
        warnings.push(`${series.label}, ${graph.x[index]}: ${value} exceeds the selected maximum ${maximum}.`);
        layers.push(`<text data-outside-scale="true" x="${number(x(index))}" y="98" text-anchor="middle" fill="#9d3025" font-size="18">↑ ${escape(value)}</text>`);
        return;
      }
      const px = number(x(index)), py = number(y(value));
      if (graph.kind === "bar") {
        const barWidth = Math.min(88, (right - left) / graph.x.length * 0.55);
        layers.push(`<rect data-point="${index}" data-value="${value}" x="${number(px - barWidth / 2)}" y="${py}" width="${barWidth}" height="${number(bottom - py)}" fill="${colour}"><title>${escape(series.label)}; ${escape(graph.x[index])}: ${value}</title></rect>`);
        if (value === 0) layers.push(`<circle data-zero="true" cx="${px}" cy="${bottom}" r="4" fill="${colour}"/><text x="${px}" y="${bottom - 10}" text-anchor="middle" font-size="18">0</text>`);
      } else {
        line += `${connected ? "L" : "M"}${px} ${py} `; connected = true;
        const title = `<title>${escape(series.label)}; ${escape(graph.x[index])}: ${value}</title>`;
        layers.push(seriesIndex % 2
          ? `<rect data-point="${index}" data-value="${value}" x="${px - 5}" y="${py - 5}" width="10" height="10" fill="white" stroke="${colour}" stroke-width="2">${title}</rect>`
          : `<circle data-point="${index}" data-value="${value}" cx="${px}" cy="${py}" r="5" fill="white" stroke="${colour}" stroke-width="2">${title}</circle>`);
      }
    });
    if (line) layers.push(`<path data-entered-line="true" d="${line.trim()}" fill="none" stroke="${colour}" stroke-width="2"${dash}/>`);
    layers.push("</g>");
  });
  const grid: string[] = [];
  if (maximum !== null) for (let tick = 0; tick <= 5; tick++) {
    const value = maximum * tick / 5, py = number(y(value));
    grid.push(`<path d="M${left} ${py}H${right}" stroke="#d9e1df"/><text x="${left - 14}" y="${py + 6}" text-anchor="end" font-size="18">${number(value)}</text>`);
  }
  graph.x.forEach((value, index) => {
    const px = number(x(index));
    const words = String(value).split("/");
    grid.push(`<path d="M${px} ${bottom}v7" stroke="#344643"/><text x="${px}" y="${bottom + 30}" text-anchor="middle" font-size="18">${words.map((word, line) => `<tspan x="${px}" dy="${line ? 22 : 0}">${escape(word)}</tspan>`).join("")}</text>`);
  });
  const titleId = `${graph.id}-${instance}-drawing-title`, descId = `${graph.id}-${instance}-drawing-description`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${escape(titleId)} ${escape(descId)}"><title id="${escape(titleId)}">${escape(graph.title)}</title><desc id="${escape(descId)}">${escape(description.join(" "))}</desc><rect width="${width}" height="${height}" fill="white"/><g font-family="Arial, Helvetica, sans-serif" fill="#233531">${grid.join("")}<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="#344643" stroke-width="2"/><text x="${(left + right) / 2}" y="524" text-anchor="middle" font-size="22">${escape(xLabel)}</text><text transform="translate(30 ${(top + bottom) / 2}) rotate(-90)" text-anchor="middle" font-size="22">${escape(yLabel)}</text>${layers.join("")}</g></svg>`;
  return { svg, values, warnings, width, height,
    interpretation: graph.kind === "line" ? "Markers show supplied positions; connecting lines guide comparison and do not establish unmeasured intermediate observations." : "Bar height shows the entered value for each category; a blank is not zero." };
}
