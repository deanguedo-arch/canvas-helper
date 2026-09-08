export const topicHtml = (value: string | number) => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
export type TopicDataset = { columns: string[]; rows: (string | number)[][]; sourceRole?: string };
export function renderTopicDataset(data: TopicDataset, caption: string) {
  if (!data.columns.length || data.rows.some(row => row.length !== data.columns.length)) throw new Error("Dataset table column inventory drift");
  return `<div class="p2-table-scroll" role="region" aria-label="${topicHtml(caption)}" tabindex="0"><table><caption>${topicHtml(caption)}</caption><thead><tr>${data.columns.map(column => `<th scope="col">${topicHtml(column)}</th>`).join("")}</tr></thead><tbody>${data.rows.map(row => `<tr>${row.map((cell, index) => index ? `<td>${topicHtml(cell)}</td>` : `<th scope="row">${topicHtml(cell)}</th>`).join("")}</tr>`).join("")}</tbody></table></div>${data.sourceRole ? `<p>${topicHtml(data.sourceRole)}</p>` : ""}`;
}
