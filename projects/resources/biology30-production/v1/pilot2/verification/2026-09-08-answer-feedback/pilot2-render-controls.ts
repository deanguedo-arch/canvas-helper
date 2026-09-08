import { renderTopicGraphConstruction } from "./pilot2-render-graph.js";
import type { GraphWork } from "./pilot2-graph-work.js";
import type { LearningInputs } from "./pilot2-learning-audit.js";
import type { TopicStateSchema } from "./pilot2-state.js";
import { practiceOptionOrder } from "./pilot2-practice-options.js";

import { topicHtml, renderTopicDataset, type TopicDataset } from "./pilot2-render-common.js";
export { topicHtml, renderTopicDataset } from "./pilot2-render-common.js";
export type { TopicDataset } from "./pilot2-render-common.js";
export type RenderPractice = LearningInputs["practice"]["items"][number] & { dataset?: TopicDataset };
export function renderTopicResponse(schema: TopicStateSchema, id: string, label: string, invalidates: string[] = []) {
  const field = schema.responses[id];
  if (!field) throw new Error(`Unregistered renderer response: ${id}`);
  if (invalidates.some(flag => !schema.flags[flag])) throw new Error("Unknown response invalidation flag");
  // No maxlength: a restored/pasted over-limit draft must remain available for
  // copying and revision. The save engine rejects it without truncation.
  return `<label for="${topicHtml(id)}-response">${topicHtml(label)}</label><textarea id="${topicHtml(id)}-response" data-pilot2-response="${topicHtml(id)}" data-pilot2-invalidates="${topicHtml(invalidates.join(" "))}" data-testid="pilot2-response" aria-describedby="${topicHtml(id)}-capacity" rows="5"></textarea><p id="${topicHtml(id)}-capacity">Up to ${field.limit} characters can be saved in this response. Longer writing stays visible for copying and revision.</p>`;
}
export function renderTopicPractice(item: RenderPractice, schema: TopicStateSchema, number: number, graph?: GraphWork) {
  if (!schema.flags[`${item.id}-attempted`]) throw new Error(`Unregistered practice attempt: ${item.id}`);
  let answer: string, feedback: string;
  if (item.kind === "multiple-choice") {
    if (item.options?.length !== 4 || item.misconceptionFeedback?.length !== 4 || !Number.isInteger(item.correctIndex) || !schema.choices[item.id]) throw new Error(`Incomplete selected-response rendering: ${item.id}`);
    const order = practiceOptionOrder({ id: item.id, options: item.options });
    answer = `<fieldset><legend>Your answer</legend>${order.map(option => `<label class="p2-option choice-row"><input type="radio" name="${topicHtml(item.id)}" data-pilot2-choice="${topicHtml(item.id)}" value="${option.value}"><span>${topicHtml(option.text)}</span></label>`).join("")}</fieldset>`;
    feedback = item.misconceptionFeedback.map((text, index) => `<p data-pilot2-option-feedback="${index}" hidden>${index === item.correctIndex ? "Correct. " : "Review this choice. "}${topicHtml(text)}</p>`).join("");
  } else if (item.kind === "constructed" && item.modelResponse && item.comparisonFeedback) {
    if (graph && (graph.responseId !== item.id || graph.unit !== schema.unit)) throw new Error("Graph practice binding drift");
    answer = graph ? renderTopicGraphConstruction(graph) : renderTopicResponse(schema, item.id, "Your response");
    feedback = `<h4>One complete response</h4><p>${topicHtml(item.modelResponse)}</p><p>${topicHtml(item.comparisonFeedback)}</p>`;
  } else throw new Error(`Unsupported practice rendering: ${item.id}`);
  return `<article class="p2-practice practice-item" id="${topicHtml(item.id)}" tabindex="-1" data-pilot2-practice="${topicHtml(item.id)}" data-testid="pilot2-practice"><p class="practice-number">Question ${number}</p>${item.stages?.length ? `<h3>Work through this question</h3><ol class="p2-task-stages">${item.stages.map(stage => `<li><p>${topicHtml(stage)}</p></li>`).join("")}</ol>` : `<h3>${topicHtml(item.prompt)}</h3>`}${item.dataset ? renderTopicDataset(item.dataset, "Data for this question") : ""}${answer}<button type="button" data-pilot2-check="${topicHtml(item.id)}" aria-controls="${topicHtml(item.id)}-feedback" aria-expanded="false" disabled>${item.kind === "multiple-choice" ? "Check answer" : "Compare response"}</button><p data-pilot2-check-status="${topicHtml(item.id)}" role="status">Attempt the question to open the feedback.</p><div id="${topicHtml(item.id)}-feedback" data-pilot2-feedback="${topicHtml(item.id)}" class="practice-feedback" hidden>${feedback}</div></article>`;
}
export function renderTopicWritingActivity(schema: TopicStateSchema, id: string, title: string, prompt: string, options: { guide?: string; criteria?: string[]; flag?: string; button?: string; graph?: GraphWork } = {}) {
  if (options.graph && (options.graph.responseId !== id || options.graph.unit !== schema.unit)) throw new Error("Graph writing activity binding drift");
  if (options.flag && !schema.flags[options.flag]) throw new Error(`Unregistered activity flag: ${options.flag}`);
  return `<section class="p2-writing" id="${topicHtml(id)}" tabindex="-1"><h3>${topicHtml(title)}</h3><p>${topicHtml(prompt)}</p>${options.criteria ? `<ul>${options.criteria.map(text => `<li>${topicHtml(text)}</li>`).join("")}</ul>` : ""}${options.graph ? renderTopicGraphConstruction(options.graph) : renderTopicResponse(schema, id, "Your response")}${options.flag ? `<button type="button" data-pilot2-collect="${topicHtml(options.flag)}" data-pilot2-requires="${topicHtml(id)}" disabled>${topicHtml(options.button ?? "Save to Process Collection")}</button><p data-pilot2-collection-status="${topicHtml(options.flag)}" role="status"></p>` : ""}${options.guide ? `<button type="button" data-pilot2-compare="${topicHtml(id)}" aria-controls="${topicHtml(id)}-guide" aria-expanded="false" disabled>Compare your thinking</button><div id="${topicHtml(id)}-guide" hidden><p>${topicHtml(options.guide)}</p></div>` : ""}</section>`;
}
