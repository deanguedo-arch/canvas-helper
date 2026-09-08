import type { TopicContract } from "./pilot2-contract.js";
import type { TopicStateSchema } from "./pilot2-state.js";
import { topicHtml as h } from "./pilot2-render-controls.js";
export type TopicTextbookQuestion = {
  id:string;questionNumber:number;title:string;printedPage:number;physicalPage:number;continuationPhysicalPage?:number|null;chapterPdf:string;guide:string;
  teachingPartId:string;teachingTargetId:string;teachingTopicId:string;prerequisitePartIds?:string[];prerequisiteTargetIds?:string[];furtherReadingPartIds?:string[];
  preAttemptContext?:string;preAttemptSourceNotice?:string;attemptRequiredToReveal:boolean;countsForRequiredCompletion:boolean;
};
export function renderTopicTeachingLink(contract:TopicContract,partId:string,labelPrefix="Review") {
  const topic=contract.topics.find(topic=>topic.parts.some(part=>part.id===partId)),part=topic?.parts.find(part=>part.id===partId);
  if(!topic||!part)throw new Error(`Missing teaching return target: ${partId}`);
  return `<a href="#${h(topic.id)}" data-pilot2-return-route="${h(topic.id)}" data-pilot2-return-focus="${h(partId)}-teaching">${h(labelPrefix)}: ${h(part.title)}</a>`;
}
export function validateTopicTextbookQuestion(item:TopicTextbookQuestion,schema:TopicStateSchema) {
  if(!item.attemptRequiredToReveal||item.countsForRequiredCompletion||!schema.flags[`${item.id}-attempted`]||!/^assets\/textbook\/[a-z0-9-]+\.pdf$/.test(item.chapterPdf)||!Number.isInteger(item.physicalPage)||item.physicalPage<1||!Number.isInteger(item.printedPage)||!item.guide.trim())throw new Error(`Invalid textbook renderer contract: ${item.id}`);
  if(item.continuationPhysicalPage!=null&&(!Number.isInteger(item.continuationPhysicalPage)||item.continuationPhysicalPage<1))throw new Error("Invalid continuation PDF page");
}
export function renderTopicTextbookQuestion(item:TopicTextbookQuestion,contract:TopicContract,schema:TopicStateSchema) {
  validateTopicTextbookQuestion(item,schema);
  const links=[...new Set([item.teachingPartId,...item.prerequisitePartIds??[]])].map(id=>renderTopicTeachingLink(contract,id));
  return `<article class="p2-textbook" id="${h(item.id)}" tabindex="-1"><h3>Textbook question ${item.questionNumber}: ${h(item.title)}</h3><p>Optional reinforcement · Printed page ${item.printedPage}</p><p><a href="${h(item.chapterPdf)}#page=${item.physicalPage}" target="_blank" rel="noopener">Open question in the local textbook (new tab)</a>${item.continuationPhysicalPage?` · <a href="${h(item.chapterPdf)}#page=${item.continuationPhysicalPage}" target="_blank" rel="noopener">Open continuation (new tab)</a>`:""}</p>${item.preAttemptSourceNotice?`<section aria-label="Source correction"><h4>Read this correction first</h4><p>${h(item.preAttemptSourceNotice)}</p></section>`:""}${item.preAttemptContext?`<section aria-label="Context before attempting"><h4>Before you attempt</h4><p>${h(item.preAttemptContext)}</p></section>`:""}<ul>${links.map(link=>`<li>${link}</li>`).join("")}</ul><p>Attempt the textbook question in your own notes before opening the comparison guide.</p><button type="button" data-pilot2-textbook-attempt="${h(item.id)}" aria-controls="${h(item.id)}-guide" aria-expanded="false">I have attempted this question — open guide</button><p data-pilot2-textbook-status="${h(item.id)}" role="status"></p><div id="${h(item.id)}-guide" hidden><h4>Comparison guide</h4><p>${h(item.guide)}</p>${item.furtherReadingPartIds?.length?`<h4>Optional further reading</h4><ul>${item.furtherReadingPartIds.map(id=>`<li>${renderTopicTeachingLink(contract,id,"Read further")}</li>`).join("")}</ul>`:""}</div></article>`;
}
