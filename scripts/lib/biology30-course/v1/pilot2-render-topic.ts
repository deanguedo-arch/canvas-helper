import {renderPresentationLessonHeader} from './pilot2-lesson-header.js';
import {renderTopicAdvanced} from './pilot2-render-advanced.js';
import {renderTopicMediaClip,type TopicMediaClip} from './pilot2-media.js';
import type { GraphWork } from "./pilot2-graph-work.js";
import type { TopicContract } from "./pilot2-contract.js";
import type { CoreTeaching, Instruction, TopicTeaching } from "./pilot2-instruction-audit.js";
import type { LearningInputs } from "./pilot2-learning-audit.js";
import type { TopicStateSchema } from "./pilot2-state.js";
import { topicHtml as h, renderTopicPractice, renderTopicWritingActivity, type RenderPractice } from "./pilot2-render-controls.js";

export type TopicFigurePanel = { id: string; src: string; width: number; height: number; alt: string; caption: string; equivalentExplanation: string; scienceReview: "passed"; useScope: "local-blocked-review"; sha256: string };
export type TopicFigure = TopicFigurePanel & {panels?:TopicFigurePanel[];comparisonGuide?:string};
export type TopicRenderInputs = { contract: TopicContract; core: CoreTeaching; instruction: Instruction; framing: TopicTeaching; state: TopicStateSchema; vocabulary: LearningInputs["vocabulary"]; practice: RenderPractice[]; figures: TopicFigure[]; graphs?: GraphWork[]; videos?: TopicMediaClip[]; timing?: {routes:{routeId:string;requiredMinutes:number}[];optionalAllocations:{id:string;minutes:number}[]}; textbookLinks?:{topicId:string;pdf:string;printedPage:number;physicalPage:number}[] };
export function renderTopicFigure(figure: TopicFigure, instance = ""):string {
  if (!/^assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:png|jpg|jpeg|webp|svg)$/.test(figure.src) || figure.src.includes("..") || !Number.isInteger(figure.width) || !Number.isInteger(figure.height) || figure.width < 1 || figure.height < 1 || !figure.alt.trim() || !figure.caption.trim() || !figure.equivalentExplanation.trim() || figure.scienceReview !== "passed" || figure.useScope !== "local-blocked-review" || !/^[a-f0-9]{64}$/.test(figure.sha256)) throw new Error(`Unresolved or unsafe figure: ${figure.id}`);
  const id = figure.id + instance;
  if(figure.panels){
    if(figure.panels.length<2||figure.panels.length>8||new Set(figure.panels.map(panel=>panel.src)).size!==figure.panels.length||figure.panels.some(panel=>'panels' in panel))throw new Error('Invalid or nested teaching figure group');
    return `<figure id="${h(id)}" class="p2-figure"><figcaption>${h(figure.caption)}</figcaption><p>${h(figure.equivalentExplanation)}</p><div class="p2-figure-panels">${figure.panels.map((panel,index)=>renderTopicFigure({...panel,id:`${id}-panel-${index+1}`})).join('')}</div>${figure.comparisonGuide?.trim()?`<details class="p2-figure-comparison"><summary>Compare interpretations after recording your observations</summary><p>${h(figure.comparisonGuide)}</p></details>`:''}</figure>`;
  }
  return `<figure id="${h(id)}" class="p2-figure"><img src="${h(figure.src)}" width="${figure.width}" height="${figure.height}" alt="${h(figure.alt)}" loading="lazy"><figcaption>${h(figure.caption)}</figcaption><p>${h(figure.equivalentExplanation)}</p><button type="button" data-pilot2-enlarge aria-haspopup="dialog" aria-label="${h(`Enlarge: ${figure.caption}`)}">Enlarge figure</button></figure>`;
}
/** Component authoring is separate from the frozen all-unit build entry point. */
export function renderBiology30Topic(topicId: string, input: TopicRenderInputs) {
  const topic = input.contract.topics.find(topic => topic.id === topicId), framing = input.framing.topics.find(topic => topic.topicId === topicId);
  if (!topic || !framing) throw new Error(`Missing topic renderer input: ${topicId}`);
  if ([input.core.unit,input.instruction.unit,input.framing.unit,input.state.unit,input.vocabulary.unit].some(unit => unit !== input.contract.unit)) throw new Error("Cross-unit renderer inputs");
  const figures = new Map(input.figures.map(figure => [figure.id, figure]));
  if (figures.size !== input.figures.length) throw new Error("Duplicate renderer figure identity");
  const content = topic.parts.map(part => {
    const core = input.core.parts.find(item => item.id === part.id), instruction = input.instruction.parts.find(item => item.partId === part.id), figure = figures.get(`${part.id}-figure`);
    if (!core || !instruction || !figure) throw new Error(`Missing complete teaching/figure input: ${part.id}`);
    const terms = core.termIntroductionIds.map(id => { const term = input.vocabulary.introducedTerms.find(term => term.id === id); if (!term || term.firstTeachingPartId !== part.id) throw new Error(`Definition renderer drift: ${id}`); return term; });
    const { workedExample: worked, stopCheck: stop, advanced } = instruction;
    if (!advanced.optional || advanced.initiallyExpanded || advanced.completionRequired || !input.state.flags[`${advanced.id}-complete`]) throw new Error(`Advanced rendering contract drift: ${part.id}`);
    return `<section class="p2-part" id="${h(part.id)}" tabindex="-1"><section class="lesson-block"><p class="section-label">Learn · Part ${topic.parts.indexOf(part)+1}</p><h2>${h(part.title)}</h2>${terms.length ? `<section id="${h(part.id)}-terms" aria-label="Terms for this explanation"><dl>${terms.map(term => `<dt id="${h(term.id)}-definition">${h(term.term)}</dt><dd>${h(term.definition)}</dd>`).join("")}</dl></section>` : ""}<div id="${h(part.id)}-teaching">${core.paragraphs.map(text => `<p>${h(text)}</p>`).join("")}</div>${renderTopicFigure(figure)}</section><section class="worked-example" id="${h(worked.id)}"><h3>Worked example</h3><p>${h(worked.prompt)}</p><ol>${worked.steps.map(step => `<li>${h(step)}</li>`).join("")}</ol><p>${h(worked.conclusion)}</p></section><section class="stop-check" id="${h(part.id)}-check"><h3>Stop and check</h3><p>${h(stop.prompt)}</p><details id="${h(stop.id)}"><summary>Compare your thinking</summary><p>${h(stop.guide)}</p></details></section>${renderTopicAdvanced(advanced,input.timing?.optionalAllocations.find(x=>x.id===advanced.id)?.minutes)}</section>`;
  }).join("");
  const walkthrough = framing.localWalkthrough.frames.map((frame,index) => {
    const figure = figures.get(frame.figureTarget);
    if (!figure) throw new Error(`Missing walkthrough illustration: ${frame.figureTarget}`);
    return `<section class="p2-walkthrough-frame"><h3>${index+1}. ${h(topic.parts[index].title)}</h3>${renderTopicFigure(figure,"-walkthrough")}<p>${h(frame.scenario)}</p><ol>${frame.orderedExplanation.map(step => `<li>${h(step)}</li>`).join("")}</ol><p>${h(frame.conclusion)}</p></section>`;
  }).join("");
  const guided = input.practice.filter(item => item.routeId === topicId && item.role === "guided");
  if (guided.length !== 2) throw new Error(`Topic needs exactly two guided questions: ${topicId}`);
  const media = framing.localWalkthrough.checkpoint;
  return `<div class="p2-topic" data-pilot2-topic="${h(topicId)}">${renderPresentationLessonHeader(topicId,input)}${content}${(input.videos??[]).filter(clip=>clip.topics.some(topic=>topic.id===topicId)).map(clip=>renderTopicMediaClip(clip,`${topicId}-video-${clip.videoId}`,topicId)).join('')}<section class="lesson-block" id="${h(topicId)}-walkthrough" tabindex="-1"><p class="section-label">See the idea in action</p><h2>Illustrated walkthrough</h2>${walkthrough}${renderTopicWritingActivity(input.state,media.responseId,"Checkpoint",media.prompt,{guide:media.comparisonGuide,flag:`${topicId}-media-attempted`,button:"Save checkpoint attempt"})}</section><section class="lesson-block retrieve-block"><p class="section-label">Retrieve</p>${renderTopicWritingActivity(input.state, framing.retrieval.responseId, "Retrieve the idea", framing.retrieval.prompt, {guide:framing.retrieval.comparisonGuide})}</section><section class="lesson-block guided-practice"><p class="section-label">Practise</p><h2>Guided practice</h2>${guided.map((item,index)=>renderTopicPractice(item,input.state,index+1,input.graphs?.find(graph=>graph.responseId===item.id))).join("")}</section><section class="lesson-block evidence-slip"><p class="section-label">Save your learning</p>${renderTopicWritingActivity(input.state,framing.evidenceSlip.responseId,"Evidence Slip",framing.evidenceSlip.prompt,{criteria:framing.evidenceSlip.criteria,flag:`${topicId}-evidence-collected`})}</section><section class="p2-completion-summary"><h2>Before you continue</h2><p>Attempt the walkthrough checkpoint, check both guided questions, and save your Evidence Slip.</p><p data-pilot2-route-status="${h(topicId)}">In progress</p></section></div>`;
}
export const TOPIC_COMPONENT_CSS = `
.p2-topic { max-width: 76ch; margin-inline: auto; }
.p2-model { max-width: 76ch; margin: 2rem auto; }
.p2-topic h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); }
.p2-topic h2 { margin-top: 2rem; font-size: 1.45rem; }
.p2-topic h3 { font-size: 1.15rem; }
.p2-topic p, .p2-topic li, .p2-topic dd { line-height: 1.65; }
.p2-topic dt { font-weight: 700; margin-top: .65rem; }
.p2-topic dd { margin: .15rem 0 .75rem; }
.p2-part, .p2-writing, .p2-practice { margin-block: 1.5rem; }
.p2-practice { border-top: 1px solid currentColor; padding-top: 1rem; }
.p2-writing label, .p2-practice label, .p2-model label, .p2-family label { display: block; }
.p2-writing textarea, .p2-practice textarea, .p2-model textarea, .p2-family textarea { display: block; width: 100%; box-sizing: border-box; font: inherit; line-height: 1.5; padding: .65rem; resize: vertical; }
.p2-model select, [data-pilot2-frayer-choice] { display: block; min-height: 44px; max-width: 100%; font: inherit; margin-block: .25rem 1rem; }
.p2-model button, .p2-family button { min-height: 44px; }
.p2-option { display: flex !important; align-items: baseline; gap: .5rem; padding: .65rem .25rem; }
.p2-topic input[type="radio"], .p2-topic input[type="checkbox"] { width: 1.25rem; height: 1.25rem; min-height: 1.25rem; padding: 0; margin: 0; vertical-align: middle; flex: 0 0 1.25rem; }
.p2-practice fieldset { min-width: 0; }
.p2-option span { min-width: 0; overflow-wrap: anywhere; }
.p2-figure { margin: 1.5rem 0; }
.p2-figure img { display: block; width: 100%; height: auto; object-fit: contain; }
.p2-figure-panels { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:1.25rem; }
.p2-figure-panels .p2-figure { min-width:0; margin:0; }
.p2-figure-panels img { width:auto; max-width:100%; }
.p2-figure svg { display: block; width: 100%; height: auto; }
[data-pilot2-graph-work] label { display: block; margin-block: .5rem; }
[data-pilot2-graph-work] [data-pilot2-graph-point], [data-pilot2-graph-work] select { font: inherit; max-width: 100%; box-sizing: border-box; }
[data-pilot2-graph-work] label > [data-pilot2-graph-point], [data-pilot2-graph-work] label > select { display: block; margin-top: .25rem; min-height: 44px; width: min(100%, 20rem); }
[data-pilot2-graph-work] textarea { display: block; width: 100%; box-sizing: border-box; font: inherit; }
.p2-graph-scroll { max-width: 100%; overflow-x: auto; }
.p2-graph-scroll svg { min-width: 640px; }
.p2-figure figcaption { margin-top: .65rem; font-weight: 600; }
.p2-table-scroll { overflow-x: auto; max-width: 100%; }
.p2-table-scroll table { border-collapse: collapse; width: 100%; }
.p2-table-scroll th, .p2-table-scroll td { padding: .65rem; border: 1px solid currentColor; text-align: left; vertical-align: top; }
.p2-table-scroll caption { text-align: left; font-weight: 600; margin-bottom: .5rem; }
.p2-topic button, .p2-topic summary { min-height: 44px; cursor: pointer; }
.p2-topic button:disabled { cursor: default; }
.p2-topic :focus-visible { outline: 3px solid currentColor; outline-offset: 3px; }
.p2-advanced { border-block: 1px solid currentColor; padding: .75rem 0; }
.p2-recovery label { display: block; margin-block: 1rem; }
.p2-recovery select { display: block; min-height: 44px; width: 100%; margin-top: .35rem; }
.p2-recovery textarea { display: block; width: 100%; box-sizing: border-box; }
@media print { .p2-topic button { display: none; } .p2-table-scroll { overflow: visible; } }
`;
