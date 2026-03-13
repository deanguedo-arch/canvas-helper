import { load } from "cheerio";

import type { BenchmarkSourceSupportMode } from "../benchmarks/types.js";
import type { CourseBlock, CourseModel, CourseSection, SourceTrace } from "./types.js";

export type HssCompositionBenchmark = {
  benchmarkId: string;
  sourceSupportMode: BenchmarkSourceSupportMode;
  recipeIds: string[];
};

type DeterminantInsightCard = {
  number: number;
  title: string;
  detail: string;
};

type AnatomySystemCard = {
  title: string;
  detail: string;
};

const DETERMINANT_FALLBACKS: Record<number, { title: string; detail: string }> = {
  1: {
    title: "Income and Social Status",
    detail: "Income level shapes access to housing, food, safety, and recovery options."
  },
  2: {
    title: "Social Support Networks",
    detail: "Family, peers, and trusted adults reduce stress load and improve problem-solving capacity."
  },
  3: {
    title: "Education and Literacy",
    detail: "Education supports decision quality, health literacy, and long-term stability."
  },
  4: {
    title: "Employment and Working Conditions",
    detail: "Work safety, schedule pressure, and job security directly affect stress and health outcomes."
  },
  5: {
    title: "Social Environments",
    detail: "Safe, inclusive communities create conditions where healthier choices are more realistic."
  },
  6: {
    title: "Physical Environments",
    detail: "Air, water, housing quality, and transport design can protect or damage health."
  },
  7: {
    title: "Personal Health Practices and Coping Skills",
    detail: "Daily habits and stress responses influence risk exposure and resilience."
  },
  8: {
    title: "Healthy Child Development",
    detail: "Early-life conditions create durable health patterns that carry into later stages."
  },
  9: {
    title: "Biology and Genetic Endowment",
    detail: "Inherited traits can raise or lower baseline risk for specific conditions."
  },
  10: {
    title: "Health Services",
    detail: "Timely, accessible care improves prevention, treatment, and recovery outcomes."
  },
  11: {
    title: "Gender",
    detail: "Gender roles and power dynamics affect risk exposure, support access, and care pathways."
  },
  12: {
    title: "Culture",
    detail: "Cultural safety and belonging can protect health; marginalization can increase risk."
  }
};

const ANATOMY_SYSTEM_FALLBACKS: AnatomySystemCard[] = [
  { title: "Integumentary", detail: "Protects the body, supports temperature regulation, and receives external stimuli." },
  { title: "Skeletal", detail: "Provides structure, protects organs, stores minerals, and supports blood cell production." },
  { title: "Muscular", detail: "Generates movement, supports posture, and produces heat." },
  { title: "Nervous", detail: "Coordinates rapid body responses through the brain, spinal cord, and peripheral nerves." },
  { title: "Endocrine", detail: "Regulates growth, metabolism, mood, and reproduction through hormone signaling." },
  { title: "Cardiovascular", detail: "Moves oxygen, nutrients, and waste products through blood and blood vessels." },
  { title: "Lymphatic", detail: "Supports immunity, fluid balance, and fat transport from digestion." },
  { title: "Respiratory", detail: "Brings in oxygen, removes carbon dioxide, and supports acid-base balance." },
  { title: "Digestive", detail: "Breaks food down for nutrient use and removes solid waste." },
  { title: "Urinary", detail: "Maintains fluid and electrolyte balance while removing liquid waste." },
  { title: "Reproductive", detail: "Produces reproductive cells and supports reproduction." }
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractBlockText(block: CourseBlock) {
  if (typeof block.text === "string" && block.text.trim().length > 0) {
    return normalizeText(block.text);
  }

  if (typeof block.html === "string" && block.html.trim().length > 0) {
    const $ = load(block.html);
    return normalizeText($.root().text());
  }

  return "";
}

function extractHeadingFromHtml(html: string) {
  const $ = load(html);
  const headingText = $("h2, h3, h4, strong").first().text();
  return normalizeText(headingText);
}

function getBlockHeading(block: CourseBlock) {
  if (typeof block.title === "string" && block.title.trim().length > 0) {
    return normalizeText(block.title);
  }

  if (typeof block.html === "string" && block.html.trim().length > 0) {
    return extractHeadingFromHtml(block.html);
  }

  return "";
}

function getFragmentRootHtml(html: string) {
  const $ = load(html);
  const bodyChildren = $("body").children();
  if (bodyChildren.length === 1) {
    return {
      $,
      root: bodyChildren.first(),
      bodyHtml: $("body").html()?.trim() ?? ""
    };
  }

  const root = $.root().children().first();
  return {
    $,
    root,
    bodyHtml: $("body").html()?.trim() ?? ""
  };
}

function stripBlockWrapperHtml(block: CourseBlock) {
  if (!block.html) {
    return "";
  }

  const { $, root, bodyHtml } = getFragmentRootHtml(block.html);
  if (!root.length) {
    return block.html;
  }

  if (root.hasClass("read-block") || root.hasClass("ref-note") || root.hasClass("image-box")) {
    return (root.html() ?? "").trim();
  }

  return (bodyHtml || $.html(root)).trim();
}

function stripRefNotesFromHtml(html: string) {
  const $ = load(`<div data-root="1">${html}</div>`);
  $("[data-root='1'] .ref-note").remove();
  return ($("[data-root='1']").html() ?? html).trim();
}

function mergeSourceTrace(blocks: CourseBlock[]): SourceTrace {
  const pages = blocks
    .flatMap((block) => [block.source.sourcePageStart, block.source.sourcePageEnd])
    .filter((page): page is number => typeof page === "number")
    .sort((left, right) => left - right);
  const statuses = blocks.map((block) => block.source.conversionStatus);
  const notes = [...new Set(blocks.flatMap((block) => block.source.notes ?? []))];
  const sourceTitle = blocks[0]?.source.sourceTitle ?? "HSS 1010 source";
  const sourceType = blocks.some((block) => block.source.sourceType === "pdf") ? "pdf" : "legacy-html";
  const conversionStatus = statuses.includes("unresolved")
    ? "unresolved"
    : statuses.includes("placeholder")
      ? "placeholder"
      : "converted";

  return {
    sourceType,
    sourceTitle,
    sourcePageStart: pages[0] ?? null,
    sourcePageEnd: pages[pages.length - 1] ?? null,
    sourceBlockId: blocks[0]?.source.sourceBlockId ?? null,
    conversionStatus,
    notes
  };
}

function createRawHtmlBlock(id: string, html: string, sourceBlocks: CourseBlock[]): CourseBlock {
  const $ = load(html);
  return {
    id,
    type: "rawHtml",
    html,
    text: normalizeText($.root().text()),
    source: mergeSourceTrace(sourceBlocks)
  };
}

function includesHeading(block: CourseBlock, headingNeedle: string) {
  return getBlockHeading(block).toLowerCase().includes(headingNeedle.toLowerCase());
}

function includesText(block: CourseBlock, needle: string) {
  return extractBlockText(block).toLowerCase().includes(needle.toLowerCase());
}

function isSourceSupplement(block: CourseBlock) {
  return block.source.notes.includes("source-supplement");
}

function pageInRange(block: CourseBlock, startPage: number, endPage: number) {
  const page = block.source.sourcePageStart;
  return typeof page === "number" && page >= startPage && page <= endPage;
}

function summarizeDeterminantDetail(detail: string) {
  if (!detail) {
    return "";
  }

  const normalized = normalizeText(detail)
    .replace(/^[:.\-\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "";
  }

  const sentenceSplit = normalized.split(/(?<=[.!?])\s+/);
  const firstTwo = sentenceSplit.slice(0, 2).join(" ").trim();
  const capped = firstTwo.length > 220 ? `${firstTwo.slice(0, 217)}...` : firstTwo;
  return capped;
}

function extractDeterminantInsightCards(blocks: CourseBlock[]) {
  const sourceText = blocks.map(extractBlockText).filter((text) => text.length > 0).join(" ");
  const pattern = /KEY DETERMINANT\s*[–-]?\s*(\d+)\.\s*([\s\S]*?)(?=KEY DETERMINANT\s*[–-]?\s*\d+\.|$)/gi;
  const seen = new Set<number>();
  const cards: DeterminantInsightCard[] = [];

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sourceText)) !== null) {
    const number = Number(match[1]);
    if (!Number.isInteger(number) || number < 1 || number > 12 || seen.has(number)) {
      continue;
    }

    const rawSegment = normalizeText(match[2] ?? "");
    const fallback = DETERMINANT_FALLBACKS[number];
    const title = fallback?.title ?? `Determinant ${number}`;
    let detail = rawSegment;

    const titleMatch = new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i");
    detail = detail.replace(titleMatch, "");
    detail = summarizeDeterminantDetail(detail) || fallback?.detail || "Connect this determinant to a concrete health outcome.";

    cards.push({
      number,
      title,
      detail
    });
    seen.add(number);
  }

  if (cards.length < 4) {
    for (const [numberText, fallback] of Object.entries(DETERMINANT_FALLBACKS)) {
      const number = Number(numberText);
      if (seen.has(number)) {
        continue;
      }

      cards.push({
        number,
        title: fallback.title,
        detail: fallback.detail
      });
      if (cards.length >= 8) {
        break;
      }
    }
  }

  return cards.sort((left, right) => left.number - right.number);
}

function buildWellnessHero() {
  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="hss-section-hero">`,
    `<div class="max-w-3xl">`,
    `<p class="hss-kicker">Wellness Playbook</p>`,
    `<h2 class="text-4xl font-black italic tracking-tight text-slate-900">Section 1: Defining Health &amp; Wellness</h2>`,
    `<p class="mt-4 text-lg leading-8 text-slate-700">This section is standalone. It should teach you how the course defines health, how the five dimensions interact, and how determinants shape outcomes in real life.</p>`,
    `<div class="grid md:grid-cols-3 gap-4 mt-6">`,
    `<div class="practice-panel"><h3 class="text-lg font-bold text-slate-800 mb-2">Lesson 1</h3><p class="text-sm text-slate-600">Lock in exact health and wellness language so your written responses are precise.</p></div>`,
    `<div class="practice-panel"><h3 class="text-lg font-bold text-slate-800 mb-2">Lesson 2</h3><p class="text-sm text-slate-600">Trace how one wellness dimension can raise or lower another over time.</p></div>`,
    `<div class="practice-panel"><h3 class="text-lg font-bold text-slate-800 mb-2">Lesson 3</h3><p class="text-sm text-slate-600">Explain community health issues with determinants, not just personal choice language.</p></div>`,
    `</div>`,
    `</div>`,
    `<aside class="workbook-note">`,
    `<p class="text-xs font-black uppercase tracking-[0.24em]">Section Success Signal</p>`,
    `<p class="mt-3 text-sm leading-7">By the end of this tab, you should be able to explain one health issue using both a wellness dimension and a determinant of health, with clear cause-and-effect wording.</p>`,
    `<p class="mt-3 text-sm leading-7"><strong>Quality check:</strong> your explanation names the determinant, names the impacted dimension, and states what should change to improve outcomes.</p>`,
    `</aside>`,
    `</div>`,
    `</div>`
  ].join("");
}

function usesWorkbookBenchmark(benchmark: HssCompositionBenchmark | null | undefined) {
  return benchmark?.benchmarkId === "calm-module-2-workbook";
}

function benchmarkIncludesRecipe(benchmark: HssCompositionBenchmark | null | undefined, recipeId: string) {
  return benchmark?.recipeIds.includes(recipeId) ?? false;
}

function buildTeacherCheckpoint(options: {
  title: string;
  prompt: string;
  saveKey: string;
  placeholder: string;
  supportCopy: string;
}) {
  return [
    `<div class="teacher-checkpoint mt-6">`,
    `<p class="checkpoint-kicker">Teacher checkpoint</p>`,
    `<h4 class="text-xl font-black text-amber-950 mt-2">${escapeHtml(options.title)}</h4>`,
    `<label class="block text-sm font-semibold text-amber-950/90 mt-4 mb-3">${escapeHtml(options.prompt)}</label>`,
    `<textarea class="workbook-input min-h-[150px]" data-persist-key="${escapeHtml(options.saveKey)}" placeholder="${escapeHtml(
      options.placeholder
    )}"></textarea>`,
    `<p class="teacher-checkpoint-note">${escapeHtml(options.supportCopy)}</p>`,
    `</div>`
  ].join("");
}

function buildWellnessLanguageModule(definitionsBlock: CourseBlock, dimensionsBlock: CourseBlock, useTeacherCheckpoint: boolean) {
  const definitionsHtml = stripBlockWrapperHtml(definitionsBlock);
  const dimensionsHtml = stripBlockWrapperHtml(dimensionsBlock);
  const checkpointHtml = useTeacherCheckpoint
    ? buildTeacherCheckpoint({
        title: "Checkpoint: Explain the interaction",
        prompt:
          "Reflection: Which two dimensions rise or fall together most often in your own routine, and what is the cause-and-effect pattern?",
        saveKey: "wellness-balance-reflection",
        placeholder:
          "Write in full sentences. Name the dimensions, what changes first, and how the second one responds.",
        supportCopy: "Strong responses name both dimensions and explain how one choice or condition changes the other."
      })
    : [
        `<div class="practice-panel mt-6">`,
        `<label class="block text-sm font-semibold text-slate-800 mb-3">Reflection: Which two dimensions rise or fall together most often in your own routine, and what is the cause-and-effect pattern?</label>`,
        `<textarea class="workbook-input min-h-[150px]" data-persist-key="wellness-balance-reflection" placeholder="Write in full sentences. Name the dimensions, what changes first, and how the second one responds."></textarea>`,
        `</div>`
      ].join("");

  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">`,
    `<section class="clay-card p-6">`,
    `<p class="hss-mini-kicker">Teach The Core Idea</p>`,
    `<h3 class="text-3xl font-black text-slate-900 mb-4">Health is the target. Wellness is the process.</h3>`,
    `<p class="text-slate-600 leading-7 mb-6">Start with exact definitions, then move immediately into dimensional interaction. The goal is applied explanation, not memorized labels.</p>`,
    `<div class="space-y-6">`,
    `<div class="lesson-shell">${definitionsHtml}</div>`,
    `<div class="lesson-shell">${dimensionsHtml}</div>`,
    `</div>`,
    `</section>`,
    `<section class="clay-card p-6">`,
    `<div class="flex items-start gap-4 mb-5">`,
    `<div class="activity-number">1</div>`,
    `<div>`,
    `<h3 class="text-2xl font-bold text-slate-800">Practice: Wellness Balance</h3>`,
    `<p class="text-slate-600">Use lesson language right away. Pick the dimension under pressure, then justify the choice.</p>`,
    `</div>`,
    `</div>`,
    `<div class="space-y-4" data-study-activity="wellness-dimension-activity">`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A student stops sleeping well, skips meals, and relies on energy drinks to stay awake. Which dimension is under the most immediate pressure first?</span><select class="workbook-input" data-persist-key="wellness-dimension-check-1" data-correct-value="physical"><option value="">Choose the best fit</option><option value="physical">Physical wellness</option><option value="spiritual">Spiritual wellness</option><option value="social">Social wellness</option><option value="intellectual">Intellectual wellness</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A student starts understanding a tough issue after hearing a classmate's perspective and rethinking their own viewpoint. Which dimension is being stretched most directly?</span><select class="workbook-input" data-persist-key="wellness-dimension-check-2" data-correct-value="intellectual"><option value="">Choose the best fit</option><option value="emotional">Emotional wellness</option><option value="intellectual">Intellectual wellness</option><option value="physical">Physical wellness</option><option value="spiritual">Spiritual wellness</option></select></label>`,
    `</div>`,
    `<button type="button" class="study-check-button mt-6" data-study-check="wellness-dimension-activity">Check wellness choices</button>`,
    `<div class="study-check-results hidden" data-study-results="wellness-dimension-activity"></div>`,
    checkpointHtml,
    `</section>`,
    `</div>`,
    `</div>`
  ].join("");
}

function buildDeterminantInsightStudio(insights: DeterminantInsightCard[]) {
  if (insights.length === 0) {
    return "";
  }

  const featured = insights.slice(0, 12);
  const cardsHtml = featured
    .map((insight) => {
      return [
        `<article class="practice-panel">`,
        `<p class="hss-mini-kicker mb-2">Determinant ${insight.number}</p>`,
        `<h4 class="text-lg font-bold text-slate-900 mb-2">${escapeHtml(insight.title)}</h4>`,
        `<p class="text-sm text-slate-600 leading-7">${escapeHtml(insight.detail)}</p>`,
        `</article>`
      ].join("");
    })
    .join("");

  return [
    `<div class="mt-6">`,
    `<p class="hss-mini-kicker">Apply The Determinants</p>`,
    `<h4 class="text-2xl font-black text-slate-900 mb-3">Determinant Insight Studio</h4>`,
    `<p class="text-slate-600 leading-7 mb-5">Use these determinant snapshots as your reasoning bank when you answer scenario questions and assignment prompts.</p>`,
    `<div class="grid md:grid-cols-2 gap-4">`,
    cardsHtml,
    `</div>`,
    `<div class="practice-panel mt-5">`,
    `<p class="font-semibold text-slate-800 mb-3">Quick sort: choose the determinant that best fits each scenario.</p>`,
    `<div class="space-y-3" data-study-activity="determinant-insight-studio">`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A family delays treatment because there is no nearby clinic and no public transit route to specialist care.</span><select class="workbook-input" data-persist-key="determinant-insight-check-1" data-correct-value="health-services"><option value="">Choose the best fit</option><option value="culture">Culture</option><option value="health-services">Health services</option><option value="social-environment">Social environments</option><option value="biology">Biology and genetic endowment</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A learner keeps missing school because damp housing and mold trigger breathing problems.</span><select class="workbook-input" data-persist-key="determinant-insight-check-2" data-correct-value="physical-environment"><option value="">Choose the best fit</option><option value="physical-environment">Physical environments</option><option value="social-support">Social support networks</option><option value="education">Education and literacy</option><option value="gender">Gender</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A student improves coping after joining a mentoring group and having consistent adults to check in with weekly.</span><select class="workbook-input" data-persist-key="determinant-insight-check-3" data-correct-value="social-support"><option value="">Choose the best fit</option><option value="income">Income and social status</option><option value="social-support">Social support networks</option><option value="health-services">Health services</option><option value="healthy-child-development">Healthy child development</option></select></label>`,
    `</div>`,
    `<button type="button" class="study-check-button mt-4" data-study-check="determinant-insight-studio">Check insight sort</button>`,
    `<div class="study-check-results hidden" data-study-results="determinant-insight-studio"></div>`,
    `</div>`,
    `</div>`
  ].join("");
}

function buildWellnessCompletionPanels() {
  return [
    `<div class="mt-6 grid xl:grid-cols-2 gap-6">`,
    `<section class="practice-panel">`,
    `<p class="hss-mini-kicker">Section 1 Outcomes</p>`,
    `<h4 class="text-xl font-black text-slate-900 mb-3">What you should be able to do</h4>`,
    `<ul class="list-disc list-inside space-y-2 text-slate-700 leading-7">`,
    `<li>Evaluate determinants of good health in Canadian society.</li>`,
    `<li>Compare recognized international and national definitions of health and wellness.</li>`,
    `<li>Describe the twelve key determinants of health with concrete examples.</li>`,
    `<li>Explain how determinants inform evidence-based health policy decisions.</li>`,
    `</ul>`,
    `</section>`,
    `<section class="practice-panel">`,
    `<p class="hss-mini-kicker">Guiding Questions</p>`,
    `<h4 class="text-xl font-black text-slate-900 mb-3">Use these to frame your responses</h4>`,
    `<ul class="list-disc list-inside space-y-2 text-slate-700 leading-7">`,
    `<li>What does it mean to be well?</li>`,
    `<li>How does society define health?</li>`,
    `<li>What is your personal definition of health and wellness?</li>`,
    `</ul>`,
    `<label class="block text-sm font-semibold text-slate-800 mt-5 mb-3">Write your working definition in one paragraph.</label>`,
    `<textarea class="workbook-input min-h-[130px]" data-persist-key="wellness-working-definition" placeholder="Define health and wellness in your own words, then include one determinant and one dimension."></textarea>`,
    `</section>`,
    `</div>`,
    `<div class="practice-panel mt-6">`,
    `<p class="hss-mini-kicker">Determinants and Public Policy</p>`,
    `<h4 class="text-xl font-black text-slate-900 mb-3">Why this matters beyond individual choices</h4>`,
    `<p class="text-slate-700 leading-7">Canadian public health uses a population health approach because outcomes are strongly shaped by factors outside individual control. Policy decisions are used to reduce inequities created by determinants such as income, education, environment, and access to services.</p>`,
    `<label class="block text-sm font-semibold text-slate-800 mt-5 mb-3">Policy bridge: name one determinant and one policy action that could improve it.</label>`,
    `<textarea class="workbook-input min-h-[120px]" data-persist-key="wellness-policy-bridge" placeholder="Example: determinant, current barrier, policy action, and expected health effect."></textarea>`,
    `</div>`,
    `<div class="teacher-checkpoint mt-6">`,
    `<p class="checkpoint-kicker">Assignment Handoff</p>`,
    `<h4 class="text-xl font-black text-amber-950 mt-2">Complete Section 1 assignment questions 1-3</h4>`,
    `<p class="teacher-checkpoint-note mt-3">Use your determinant reasoning and policy bridge notes above when you complete the assignment responses.</p>`,
    `<label class="block text-sm font-semibold text-amber-950/90 mt-4 mb-3">Before leaving this tab, write your first draft answer focus for question 1.</label>`,
    `<textarea class="workbook-input min-h-[120px]" data-persist-key="wellness-assignment-handoff" placeholder="Write the key idea, evidence, and determinant you will use first."></textarea>`,
    `</div>`
  ].join("");
}

function buildWellnessDeterminantsModule(
  determinantsBlock: CourseBlock,
  determinantSupplements: CourseBlock[],
  useTeacherCheckpoint: boolean
) {
  const determinantsHtml = stripBlockWrapperHtml(determinantsBlock);
  const insights = extractDeterminantInsightCards([determinantsBlock, ...determinantSupplements]);
  const insightStudioHtml = buildDeterminantInsightStudio(insights);
  const completionPanelsHtml = buildWellnessCompletionPanels();

  const checkpointHtml = useTeacherCheckpoint
    ? buildTeacherCheckpoint({
        title: "Checkpoint: Bridge to the assignment",
        prompt:
          "Application bridge: Explain one real health issue from your school or community using both a determinant and a wellness dimension.",
        saveKey: "wellness-determinants-application",
        placeholder:
          "Name the issue, identify the determinant, then explain which wellness dimension it pressures most directly.",
        supportCopy:
          "A strong bridge names the issue, links it to a determinant, and explains the most affected dimension with a cause-and-effect sentence."
      })
    : [
        `<div class="practice-panel mt-6">`,
        `<label class="block text-sm font-semibold text-slate-800 mb-3">Application bridge: Explain one real health issue from your school or community using both a determinant and a wellness dimension.</label>`,
        `<textarea class="workbook-input min-h-[150px]" data-persist-key="wellness-determinants-application" placeholder="Name the issue, identify the determinant, then explain which wellness dimension it pressures most directly."></textarea>`,
        `</div>`
      ].join("");

  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">`,
    `<section class="clay-card p-6">`,
    `<p class="hss-mini-kicker">Teach The Bigger System</p>`,
    `<h3 class="text-3xl font-black text-slate-900 mb-4">The determinants explain why health outcomes are not just personal choices.</h3>`,
    `<p class="text-slate-600 leading-7 mb-6">Use determinants to explain what is shaping outcomes, then pair each determinant with the dimension that is under pressure.</p>`,
    `<div class="lesson-shell">${determinantsHtml}</div>`,
    insightStudioHtml,
    completionPanelsHtml,
    `</section>`,
    `<section class="clay-card p-6">`,
    `<div class="flex items-start gap-4 mb-5">`,
    `<div class="activity-number">2</div>`,
    `<div>`,
    `<h3 class="text-2xl font-bold text-slate-800">Practice: Determinant Check</h3>`,
    `<p class="text-slate-600">Match each situation to the determinant doing the heaviest causal work.</p>`,
    `</div>`,
    `</div>`,
    `<div class="space-y-4" data-study-activity="wellness-determinant-activity">`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A family has safe housing, reliable transportation, and enough money to buy healthy food every week. Which determinant is doing the heaviest lifting here?</span><select class="workbook-input" data-persist-key="wellness-determinant-check-1" data-correct-value="income"><option value="">Choose the best fit</option><option value="income">Income and social status</option><option value="culture">Culture</option><option value="gender">Gender</option><option value="health-services">Health services</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A teen keeps recovering from stress faster because trusted adults and close friends help problem-solve when life gets rough. Which determinant is most visible?</span><select class="workbook-input" data-persist-key="wellness-determinant-check-2" data-correct-value="support"><option value="">Choose the best fit</option><option value="support">Social support networks</option><option value="biology">Biology and genetic endowment</option><option value="gender">Gender</option><option value="employment">Employment and working conditions</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A person keeps getting sick because of poor air quality, unsafe water, and unhealthy housing conditions. Which determinant best explains the pattern?</span><select class="workbook-input" data-persist-key="wellness-determinant-check-3" data-correct-value="physical-environment"><option value="">Choose the best fit</option><option value="physical-environment">Physical environments</option><option value="child-development">Healthy child development</option><option value="culture">Culture</option><option value="personal-practices">Personal health practices and coping skills</option></select></label>`,
    `</div>`,
    `<button type="button" class="study-check-button mt-6" data-study-check="wellness-determinant-activity">Check determinant matches</button>`,
    `<div class="study-check-results hidden" data-study-results="wellness-determinant-activity"></div>`,
    checkpointHtml,
    `</section>`,
    `</div>`,
    `</div>`
  ].join("");
}

function normalizeSystemTitle(value: string) {
  return normalizeText(value)
    .replace(/^\d+\.\s*/, "")
    .replace(/^The\s+/i, "");
}

function extractAnatomySystemCards(blocks: CourseBlock[]) {
  const byTitle = new Map<string, AnatomySystemCard>();

  for (const block of blocks) {
    if (!block.html) {
      continue;
    }

    const $ = load(block.html);
    $(".anatomy-card").each((_, element) => {
      const title = normalizeSystemTitle($(element).find("strong, h4").first().text());
      const detail = normalizeText($(element).find("p").first().text());
      if (!title) {
        return;
      }
      const key = title.toLowerCase();
      if (!byTitle.has(key)) {
        byTitle.set(key, {
          title,
          detail: detail || "Use this system to explain a clear structure-function relationship."
        });
      }
    });
  }

  for (const fallback of ANATOMY_SYSTEM_FALLBACKS) {
    const key = fallback.title.toLowerCase();
    if (!byTitle.has(key)) {
      byTitle.set(key, fallback);
    }
  }

  return [...byTitle.values()].slice(0, 11);
}

function buildAnatomyHero() {
  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="hss-section-hero">`,
    `<div class="max-w-3xl">`,
    `<p class="hss-kicker">Anatomy Command Center</p>`,
    `<h2 class="text-4xl font-black italic tracking-tight text-slate-900">Section 2: Inside Out - How the Body Works</h2>`,
    `<p class="mt-4 text-lg leading-8 text-slate-700">This section should let you explain body systems, movement mechanics, and anatomy language without relying on source-page callouts.</p>`,
    `<div class="grid md:grid-cols-3 gap-4 mt-6">`,
    `<div class="practice-panel"><h3 class="text-lg font-bold text-slate-800 mb-2">Concept</h3><p class="text-sm text-slate-600">Lock in anatomy, physiology, pathology, and homeostasis terms.</p></div>`,
    `<div class="practice-panel"><h3 class="text-lg font-bold text-slate-800 mb-2">Systems</h3><p class="text-sm text-slate-600">Connect each major body system to its core function quickly and accurately.</p></div>`,
    `<div class="practice-panel"><h3 class="text-lg font-bold text-slate-800 mb-2">Movement</h3><p class="text-sm text-slate-600">Use agonist/antagonist, muscle type, and directional language in real examples.</p></div>`,
    `</div>`,
    `</div>`,
    `<aside class="workbook-note">`,
    `<p class="text-xs font-black uppercase tracking-[0.24em]">Section 2 Outcomes</p>`,
    `<ul class="mt-3 list-disc list-inside text-sm leading-7 text-indigo-950">`,
    `<li>Describe major structures and functions in human body systems.</li>`,
    `<li>Use anatomy terminology accurately when describing position and movement.</li>`,
    `<li>Explain how body systems coordinate to maintain internal balance.</li>`,
    `</ul>`,
    `<p class="text-xs font-black uppercase tracking-[0.24em] mt-4">Anatomy Guiding Questions</p>`,
    `<ul class="mt-3 list-disc list-inside text-sm leading-7 text-indigo-950">`,
    `<li>How do structure and function connect at cell, tissue, organ, and system levels?</li>`,
    `<li>What feedback mechanisms keep the body stable under stress?</li>`,
    `<li>Which systems must coordinate for safe movement and performance?</li>`,
    `</ul>`,
    `</aside>`,
    `</div>`,
    `</div>`
  ].join("");
}

function buildAnatomySystemsModule(options: {
  fundamentalsHtml: string;
  levelsHtml: string;
  systems: AnatomySystemCard[];
  useTeacherCheckpoint: boolean;
}) {
  const systemsCards = options.systems
    .map((system) => {
      return [
        `<article class="anatomy-card practice-panel">`,
        `<h4 class="text-lg font-bold text-slate-900 mb-2">${escapeHtml(system.title)}</h4>`,
        `<p class="text-sm text-slate-600 leading-7">${escapeHtml(system.detail)}</p>`,
        `</article>`
      ].join("");
    })
    .join("");

  const fundamentalsHtml = options.fundamentalsHtml
    ? `<div class="lesson-shell">${options.fundamentalsHtml}</div>`
    : `<div class="lesson-shell"><h3>Fundamental Concepts</h3><p>Anatomy studies structure, physiology studies function, and homeostasis keeps internal conditions stable through feedback loops.</p></div>`;
  const levelsHtml = options.levelsHtml
    ? `<div class="lesson-shell">${options.levelsHtml}</div>`
    : `<div class="lesson-shell"><h3>Levels of Structural Organization</h3><p>Cells form tissues, tissues form organs, and organs coordinate in systems to maintain life.</p></div>`;
  const checkpointHtml = options.useTeacherCheckpoint
    ? buildTeacherCheckpoint({
        title: "Checkpoint: Systems to Scenario",
        prompt: "Name one real-world scenario and explain which two systems are most responsible for the response.",
        saveKey: "anatomy-systems-scenario",
        placeholder: "Scenario, systems involved, and structure-function explanation.",
        supportCopy: "Strong responses identify systems and explain what each system contributes."
      })
    : [
        `<div class="practice-panel mt-6">`,
        `<label class="block text-sm font-semibold text-slate-800 mb-3">Name one real-world scenario and explain which two systems are most responsible for the response.</label>`,
        `<textarea class="workbook-input min-h-[130px]" data-persist-key="anatomy-systems-scenario" placeholder="Scenario, systems involved, and structure-function explanation."></textarea>`,
        `</div>`
      ].join("");

  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">`,
    `<section class="clay-card p-6">`,
    `<p class="hss-mini-kicker">Systems First</p>`,
    `<h3 class="text-3xl font-black text-slate-900 mb-4">Anatomy Systems Studio</h3>`,
    `<p class="text-slate-600 leading-7 mb-6">Use these cards as your fast reference set for system-level explanations.</p>`,
    fundamentalsHtml,
    levelsHtml,
    `<div class="grid md:grid-cols-2 gap-4 mt-6">${systemsCards}</div>`,
    `</section>`,
    `<section class="clay-card p-6">`,
    `<div class="flex items-start gap-4 mb-5">`,
    `<div class="activity-number">1</div>`,
    `<div>`,
    `<h3 class="text-2xl font-bold text-slate-800">Systems Match Check</h3>`,
    `<p class="text-slate-600">Match each function scenario to the best-fit system.</p>`,
    `</div>`,
    `</div>`,
    `<div class="space-y-4" data-study-activity="anatomy-systems-check">`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">Body temperature rises during exercise and sweat glands activate.</span><select class="workbook-input" data-persist-key="anatomy-systems-check-1" data-correct-value="integumentary"><option value="">Choose the best fit</option><option value="integumentary">Integumentary system</option><option value="digestive">Digestive system</option><option value="urinary">Urinary system</option><option value="reproductive">Reproductive system</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">Muscle tissue contracts to extend the elbow while the opposite muscle relaxes.</span><select class="workbook-input" data-persist-key="anatomy-systems-check-2" data-correct-value="muscular"><option value="">Choose the best fit</option><option value="muscular">Muscular system</option><option value="lymphatic">Lymphatic system</option><option value="endocrine">Endocrine system</option><option value="respiratory">Respiratory system</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">Carbon dioxide is moved out of blood and exhaled after aerobic activity.</span><select class="workbook-input" data-persist-key="anatomy-systems-check-3" data-correct-value="respiratory"><option value="">Choose the best fit</option><option value="respiratory">Respiratory system</option><option value="skeletal">Skeletal system</option><option value="integumentary">Integumentary system</option><option value="nervous">Nervous system</option></select></label>`,
    `</div>`,
    `<button type="button" class="study-check-button mt-6" data-study-check="anatomy-systems-check">Check systems match</button>`,
    `<div class="study-check-results hidden" data-study-results="anatomy-systems-check"></div>`,
    checkpointHtml,
    `</section>`,
    `</div>`,
    `</div>`
  ].join("");
}

function buildAnatomyMovementModule(options: {
  movementHtml: string;
  musclesHtml: string;
  languageHtml: string;
  useTeacherCheckpoint: boolean;
}) {
  const movementHtml = options.movementHtml
    ? `<div class="lesson-shell">${options.movementHtml}</div>`
    : `<div class="lesson-shell"><h3>Movement Mechanics</h3><p>Movement depends on coordinated muscle contraction, tendon leverage, and joint actions described with consistent anatomy language.</p></div>`;
  const musclesHtml = options.musclesHtml ? `<div class="lesson-shell mt-4">${options.musclesHtml}</div>` : "";
  const languageHtml = options.languageHtml ? `<div class="lesson-shell mt-4">${options.languageHtml}</div>` : "";
  const assignmentHandoff = [
    `<div class="teacher-checkpoint mt-6">`,
    `<p class="checkpoint-kicker">Anatomy Assignment Handoff</p>`,
    `<h4 class="text-xl font-black text-amber-950 mt-2">Prepare your Section 2 response draft</h4>`,
    `<p class="teacher-checkpoint-note mt-3">Use systems and movement language from this tab in complete cause-and-effect sentences.</p>`,
    `<label class="block text-sm font-semibold text-amber-950/90 mt-4 mb-3">Draft your first assignment response focus for Section 2.</label>`,
    `<textarea class="workbook-input min-h-[130px]" data-persist-key="anatomy-assignment-handoff" placeholder="Prompt focus, key anatomy terms, and system evidence."></textarea>`,
    `</div>`
  ].join("");
  const checkpointHtml = options.useTeacherCheckpoint
    ? buildTeacherCheckpoint({
        title: "Checkpoint: Movement Explanation",
        prompt: "Explain one movement using agonist/antagonist language and one directional term.",
        saveKey: "anatomy-movement-checkpoint",
        placeholder: "Movement, muscles involved, and anatomy term usage.",
        supportCopy: "Strong answers identify both muscles and describe the motion precisely."
      })
    : "";

  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">`,
    `<section class="clay-card p-6">`,
    `<p class="hss-mini-kicker">Movement Application</p>`,
    `<h3 class="text-3xl font-black text-slate-900 mb-4">Movement Mechanics Check</h3>`,
    `<p class="text-slate-600 leading-7 mb-6">Convert anatomy vocabulary into explanations you can use in assignment responses.</p>`,
    movementHtml,
    musclesHtml,
    languageHtml,
    `</section>`,
    `<section class="clay-card p-6">`,
    `<div class="flex items-start gap-4 mb-5">`,
    `<div class="activity-number">2</div>`,
    `<div>`,
    `<h3 class="text-2xl font-bold text-slate-800">Movement Mechanics Check</h3>`,
    `<p class="text-slate-600">Use correct muscle and position language for each scenario.</p>`,
    `</div>`,
    `</div>`,
    `<div class="space-y-4" data-study-activity="anatomy-movement-check">`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">When the elbow bends to lift a backpack, which muscle pair is most directly involved?</span><select class="workbook-input" data-persist-key="anatomy-movement-check-1" data-correct-value="biceps-triceps"><option value="">Choose the best fit</option><option value="biceps-triceps">Biceps and triceps</option><option value="quadriceps-hamstrings">Quadriceps and hamstrings</option><option value="deltoid-gastrocnemius">Deltoid and gastrocnemius</option><option value="abdominals-soleus">Abdominals and soleus</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A clinician describes a structure as being closer to the body's midline. Which directional term fits?</span><select class="workbook-input" data-persist-key="anatomy-movement-check-2" data-correct-value="medial"><option value="">Choose the best fit</option><option value="medial">Medial</option><option value="lateral">Lateral</option><option value="distal">Distal</option><option value="posterior">Posterior</option></select></label>`,
    `</div>`,
    `<button type="button" class="study-check-button mt-6" data-study-check="anatomy-movement-check">Check movement mechanics</button>`,
    `<div class="study-check-results hidden" data-study-results="anatomy-movement-check"></div>`,
    checkpointHtml,
    assignmentHandoff,
    `</section>`,
    `</div>`,
    `</div>`
  ].join("");
}

function composeWellnessSection(section: CourseSection, benchmark?: HssCompositionBenchmark | null): CourseSection {
  const alreadyComposed = section.blocks.some(
    (block) => block.type === "rawHtml" && typeof block.html === "string" && block.html.includes("module-container hss-section-flow")
  );
  if (alreadyComposed) {
    return section;
  }

  const usedBlockIds = new Set<string>();
  const takeFirst = (predicate: (block: CourseBlock) => boolean) => {
    const block = section.blocks.find((candidate) => !usedBlockIds.has(candidate.id) && predicate(candidate));
    if (!block) {
      return undefined;
    }
    usedBlockIds.add(block.id);
    return block;
  };

  const takeAll = (predicate: (block: CourseBlock) => boolean) => {
    const matches = section.blocks.filter((candidate) => !usedBlockIds.has(candidate.id) && predicate(candidate));
    for (const block of matches) {
      usedBlockIds.add(block.id);
    }
    return matches;
  };

  const referenceNote = takeFirst((block) => block.type === "referenceNote" || block.html?.includes("ref-note") === true);
  const definitionsBlock = takeFirst((block) => includesHeading(block, "Definitions"));
  const dimensionsBlock = takeFirst((block) => includesHeading(block, "5 Dimensions of Wellness"));
  const determinantsBlock = takeFirst((block) => includesHeading(block, "12 Determinants of Health"));

  if (!definitionsBlock || !dimensionsBlock || !determinantsBlock) {
    return section;
  }

  const dimensionSupplements = takeAll(
    (block) =>
      isSourceSupplement(block) &&
      (pageInRange(block, 6, 8) || includesText(block, "Dimensions of Health and Wellness") || includesText(block, "PHYSICAL"))
  );
  const determinantSupplements = takeAll(
    (block) =>
      isSourceSupplement(block) &&
      (pageInRange(block, 9, 12) || includesText(block, "What Determines Health") || includesText(block, "KEY DETERMINANT"))
  );
  const remainingSupplements = takeAll((block) => isSourceSupplement(block));

  const useWorkbookSurface = usesWorkbookBenchmark(benchmark);
  const useTeacherCheckpoint = useWorkbookSurface && benchmarkIncludesRecipe(benchmark, "teacher-checkpoint");

  const heroBlock = createRawHtmlBlock(`${section.id}-interactive-hero`, buildWellnessHero(), [
    definitionsBlock,
    dimensionsBlock,
    determinantsBlock,
    ...(referenceNote ? [referenceNote] : [])
  ]);
  const languageBlock = createRawHtmlBlock(
    `${section.id}-interactive-language`,
    buildWellnessLanguageModule(definitionsBlock, dimensionsBlock, useTeacherCheckpoint),
    [definitionsBlock, dimensionsBlock, ...dimensionSupplements]
  );
  const determinantsModule = createRawHtmlBlock(
    `${section.id}-interactive-determinants`,
    buildWellnessDeterminantsModule(determinantsBlock, [...determinantSupplements, ...remainingSupplements], useTeacherCheckpoint),
    [determinantsBlock, ...determinantSupplements, ...remainingSupplements]
  );

  return {
    ...section,
    blocks: [heroBlock, languageBlock, determinantsModule]
  };
}

function composeAnatomySection(section: CourseSection, benchmark?: HssCompositionBenchmark | null): CourseSection {
  const alreadyComposed = section.blocks.some(
    (block) => block.type === "rawHtml" && typeof block.html === "string" && block.html.includes("Anatomy Systems Studio")
  );
  if (alreadyComposed) {
    return section;
  }

  const usedBlockIds = new Set<string>();
  const takeFirst = (predicate: (block: CourseBlock) => boolean) => {
    const block = section.blocks.find((candidate) => !usedBlockIds.has(candidate.id) && predicate(candidate));
    if (!block) {
      return undefined;
    }
    usedBlockIds.add(block.id);
    return block;
  };

  const takeAll = (predicate: (block: CourseBlock) => boolean) => {
    const matches = section.blocks.filter((candidate) => !usedBlockIds.has(candidate.id) && predicate(candidate));
    for (const block of matches) {
      usedBlockIds.add(block.id);
    }
    return matches;
  };

  const fundamentalBlock = takeFirst(
    (block) => includesHeading(block, "Fundamental Concepts") || includesText(block, "Anatomy:") || includesText(block, "Homeostasis")
  );
  const levelsBlock = takeFirst(
    (block) => includesHeading(block, "Levels of Structural Organization") || (includesText(block, "Cells") && includesText(block, "Tissues"))
  );
  const systemsBlock = takeFirst(
    (block) =>
      includesHeading(block, "11 Body Systems") ||
      includesHeading(block, "11 Human Body Systems") ||
      includesText(block, "Integumentary") ||
      includesText(block, "Cardiovascular")
  );
  const movementBlock = takeFirst(
    (block) => includesHeading(block, "Deep Dive: The Muscular System") || includesText(block, "Agonist") || includesText(block, "Actin")
  );
  const musclesBlock = takeFirst(
    (block) => includesHeading(block, "Major Skeletal Muscles") || includesText(block, "Ventral (Front) View") || includesText(block, "Dorsal (Back) View")
  );
  const languageBlock = takeFirst(
    (block) => includesHeading(block, "Anatomical Language") || includesText(block, "Anatomical Position") || includesText(block, "Directional Terms")
  );

  if (!systemsBlock && !fundamentalBlock && !levelsBlock) {
    return section;
  }

  const anatomySupplements = takeAll(
    (block) =>
      isSourceSupplement(block) &&
      (pageInRange(block, 17, 31) ||
        includesText(block, "Our Bodies") ||
        includesText(block, "Classifying Muscles") ||
        includesText(block, "Describing Movement"))
  );

  const useWorkbookSurface = usesWorkbookBenchmark(benchmark);
  const useTeacherCheckpoint = useWorkbookSurface && benchmarkIncludesRecipe(benchmark, "teacher-checkpoint");
  const coreSourceBlocks = [
    ...(fundamentalBlock ? [fundamentalBlock] : []),
    ...(levelsBlock ? [levelsBlock] : []),
    ...(systemsBlock ? [systemsBlock] : []),
    ...(movementBlock ? [movementBlock] : []),
    ...(musclesBlock ? [musclesBlock] : []),
    ...(languageBlock ? [languageBlock] : []),
    ...anatomySupplements
  ];

  const fundamentalsHtml = fundamentalBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(fundamentalBlock)) : "";
  const levelsHtml = levelsBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(levelsBlock)) : "";
  const systemsCards = extractAnatomySystemCards([...(systemsBlock ? [systemsBlock] : []), ...anatomySupplements]);
  const movementHtml = movementBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(movementBlock)) : "";
  const musclesHtml = musclesBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(musclesBlock)) : "";
  const languageHtml = languageBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(languageBlock)) : "";

  const heroBlock = createRawHtmlBlock(`${section.id}-interactive-hero`, buildAnatomyHero(), coreSourceBlocks);
  const systemsModule = createRawHtmlBlock(
    `${section.id}-interactive-systems`,
    buildAnatomySystemsModule({
      fundamentalsHtml,
      levelsHtml,
      systems: systemsCards,
      useTeacherCheckpoint
    }),
    coreSourceBlocks
  );
  const movementModule = createRawHtmlBlock(
    `${section.id}-interactive-movement`,
    buildAnatomyMovementModule({
      movementHtml,
      musclesHtml,
      languageHtml,
      useTeacherCheckpoint
    }),
    coreSourceBlocks
  );

  return {
    ...section,
    blocks: [heroBlock, systemsModule, movementModule]
  };
}

function buildLifestyleHero() {
  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="hss-section-hero">`,
    `<div class="max-w-3xl">`,
    `<p class="hss-kicker">Lifestyle Action Lab</p>`,
    `<h2 class="text-4xl font-black italic tracking-tight text-slate-900">Section 3: Road Map to Wellness</h2>`,
    `<p class="mt-4 text-lg leading-8 text-slate-700">This section should help you make practical food, movement, and daily-choice decisions that you can defend with evidence.</p>`,
    `<div class="grid md:grid-cols-3 gap-4 mt-6">`,
    `<div class="practice-panel"><h3 class="text-lg font-bold text-slate-800 mb-2">Fuel</h3><p class="text-sm text-slate-600">Apply food-guide decisions to real student schedules and constraints.</p></div>`,
    `<div class="practice-panel"><h3 class="text-lg font-bold text-slate-800 mb-2">Movement</h3><p class="text-sm text-slate-600">Connect activity guidelines to manageable weekly routines.</p></div>`,
    `<div class="practice-panel"><h3 class="text-lg font-bold text-slate-800 mb-2">Decision Quality</h3><p class="text-sm text-slate-600">Filter supplement and product claims using credibility checks.</p></div>`,
    `</div>`,
    `</div>`,
    `<aside class="workbook-note">`,
    `<p class="text-xs font-black uppercase tracking-[0.24em]">Section 3 Outcomes</p>`,
    `<ul class="mt-3 list-disc list-inside text-sm leading-7 text-indigo-950">`,
    `<li>Use nutrition and activity guidance to build realistic lifestyle choices.</li>`,
    `<li>Evaluate health-product claims for credibility and safety.</li>`,
    `<li>Explain why one daily routine change would improve wellness outcomes.</li>`,
    `</ul>`,
    `<p class="text-xs font-black uppercase tracking-[0.24em] mt-4">Lifestyle Guiding Questions</p>`,
    `<ul class="mt-3 list-disc list-inside text-sm leading-7 text-indigo-950">`,
    `<li>What choice gives the biggest health return in your current routine?</li>`,
    `<li>How do you check if a nutrition or supplement claim is trustworthy?</li>`,
    `<li>What short-term action can you sustain for one full week?</li>`,
    `</ul>`,
    `</aside>`,
    `</div>`,
    `</div>`
  ].join("");
}

function buildLifestyleFuelModule(options: {
  nutritionHtml: string;
  toolsHtml: string;
  supportStudioHtml: string;
  useTeacherCheckpoint: boolean;
}) {
  const nutritionHtml = options.nutritionHtml
    ? `<div class="lesson-shell">${options.nutritionHtml}</div>`
    : `<div class="lesson-shell"><h3>Nutritional Choices</h3><p>Build meals and snacks around reliable guidance, hydration, and realistic routines.</p></div>`;
  const toolsHtml = options.toolsHtml
    ? `<div class="lesson-shell mt-4">${options.toolsHtml}</div>`
    : `<div class="lesson-shell mt-4"><h3>Nutrition Tools</h3><p>Check the source, evidence quality, and date before trusting a claim.</p></div>`;
  const checkpointHtml = options.useTeacherCheckpoint
    ? buildTeacherCheckpoint({
        title: "Checkpoint: Fuel decision defense",
        prompt: "Which fuel choice will create the biggest improvement this week, and what evidence supports it?",
        saveKey: "lifestyle-fuel-checkpoint",
        placeholder: "Name the choice, why it matters, and how you'll execute it this week.",
        supportCopy: "Strong responses connect the choice to concrete outcomes and realistic constraints."
      })
    : [
        `<div class="practice-panel mt-6">`,
        `<label class="block text-sm font-semibold text-slate-800 mb-3">Which fuel choice will create the biggest improvement this week, and what evidence supports it?</label>`,
        `<textarea class="workbook-input min-h-[140px]" data-persist-key="lifestyle-fuel-checkpoint" placeholder="Name the choice, why it matters, and how you'll execute it this week."></textarea>`,
        `</div>`
      ].join("");

  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">`,
    `<section class="clay-card p-6">`,
    `<p class="hss-mini-kicker">Lifestyle Foundations</p>`,
    `<h3 class="text-3xl font-black text-slate-900 mb-4">Fuel Decisions Lab</h3>`,
    `<p class="text-slate-600 leading-7 mb-6">Turn nutrition guidance into real daily fuel decisions you can defend with evidence.</p>`,
    nutritionHtml,
    toolsHtml,
    options.supportStudioHtml,
    `</section>`,
    `<section class="clay-card p-6">`,
    `<div class="flex items-start gap-4 mb-5">`,
    `<div class="activity-number">1</div>`,
    `<div>`,
    `<h3 class="text-2xl font-bold text-slate-800">Fuel choice simulation</h3>`,
    `<p class="text-slate-600">Practice matching realistic student scenarios to high-impact food and hydration decisions.</p>`,
    `</div>`,
    `</div>`,
    `<div class="space-y-4" data-study-activity="lifestyle-fuel-check">`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A student skips breakfast and crashes by second period. What is the best first adjustment?</span><select class="workbook-input" data-persist-key="lifestyle-fuel-check-1" data-correct-value="balanced-breakfast"><option value="">Choose the best fit</option><option value="balanced-breakfast">Add a balanced breakfast with protein + carbs + water</option><option value="energy-drink">Use an energy drink before class</option><option value="skip-lunch">Skip lunch to stay alert</option><option value="supplement-only">Take supplements instead of meals</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A learner wants more weekly movement but has limited time after school. Which plan is most realistic?</span><select class="workbook-input" data-persist-key="lifestyle-fuel-check-2" data-correct-value="short-bouts"><option value="">Choose the best fit</option><option value="short-bouts">Schedule short activity blocks across the week</option><option value="all-or-nothing">Wait for one perfect long workout</option><option value="no-plan">Rely on motivation only</option><option value="weekend-only">Do nothing until the weekend</option></select></label>`,
    `</div>`,
    `<button type="button" class="study-check-button mt-6" data-study-check="lifestyle-fuel-check">Check lifestyle choices</button>`,
    `<div class="study-check-results hidden" data-study-results="lifestyle-fuel-check"></div>`,
    checkpointHtml,
    `</section>`,
    `</div>`,
    `</div>`
  ].join("");
}

function buildLifestyleMovementModule(options: {
  activityHtml: string;
  supportStudioHtml: string;
  useTeacherCheckpoint: boolean;
}) {
  const activityHtml = options.activityHtml
    ? `<div class="lesson-shell">${options.activityHtml}</div>`
    : `<div class="lesson-shell"><h3>Physical Activity Guidelines</h3><p>Choose movement goals that are specific, trackable, and realistic for your week.</p></div>`;
  const checkpointHtml = options.useTeacherCheckpoint
    ? buildTeacherCheckpoint({
        title: "Checkpoint: Movement schedule defense",
        prompt: "What movement plan can you realistically sustain this week, and how will you protect it when schedules get busy?",
        saveKey: "lifestyle-movement-checkpoint",
        placeholder: "State your weekly pattern, likely barriers, and your backup strategy.",
        supportCopy: "Strong plans include realistic timing, contingency logic, and measurable targets."
      })
    : [
        `<div class="practice-panel mt-6">`,
        `<label class="block text-sm font-semibold text-slate-800 mb-3">What movement plan can you realistically sustain this week, and how will you protect it when schedules get busy?</label>`,
        `<textarea class="workbook-input min-h-[140px]" data-persist-key="lifestyle-movement-checkpoint" placeholder="State your weekly pattern, likely barriers, and your backup strategy."></textarea>`,
        `</div>`
      ].join("");

  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">`,
    `<section class="clay-card p-6">`,
    `<p class="hss-mini-kicker">Movement Planning</p>`,
    `<h3 class="text-3xl font-black text-slate-900 mb-4">Movement Under Real Constraints</h3>`,
    `<p class="text-slate-600 leading-7 mb-6">Build movement habits that survive workload, transport, family, and energy constraints.</p>`,
    activityHtml,
    options.supportStudioHtml,
    `</section>`,
    `<section class="clay-card p-6">`,
    `<div class="flex items-start gap-4 mb-5">`,
    `<div class="activity-number">2</div>`,
    `<div>`,
    `<h3 class="text-2xl font-bold text-slate-800">Constraint planner challenge</h3>`,
    `<p class="text-slate-600">Choose the strongest movement strategy when life conditions are not ideal.</p>`,
    `</div>`,
    `</div>`,
    `<div class="space-y-4" data-study-activity="lifestyle-movement-plan">`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A student has 30 minutes after school on weekdays and feels low energy after dinner. Best starting movement plan?</span><select class="workbook-input" data-persist-key="lifestyle-movement-plan-1" data-correct-value="short-weekday-blocks"><option value="">Choose the best fit</option><option value="short-weekday-blocks">Short weekday blocks with one longer weekend session</option><option value="all-weekend">Only one long weekend session</option><option value="wait-motivation">Wait for perfect motivation</option><option value="none">Skip movement this week</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A learner misses two planned sessions because of assignment deadlines. Best recovery move?</span><select class="workbook-input" data-persist-key="lifestyle-movement-plan-2" data-correct-value="fallback-plan"><option value="">Choose the best fit</option><option value="fallback-plan">Use a shorter fallback plan and keep continuity</option><option value="restart-next-month">Restart next month</option><option value="double-intensity">Double intensity once to compensate</option><option value="quit-plan">Quit the plan entirely</option></select></label>`,
    `</div>`,
    `<button type="button" class="study-check-button mt-6" data-study-check="lifestyle-movement-plan">Check movement planning</button>`,
    `<div class="study-check-results hidden" data-study-results="lifestyle-movement-plan"></div>`,
    checkpointHtml,
    `</section>`,
    `</div>`,
    `</div>`
  ].join("");
}

function buildLifestyleDecisionModule(options: { safetyHtml: string; useTeacherCheckpoint: boolean }) {
  const safetyHtml = options.safetyHtml
    ? `<div class="lesson-shell">${options.safetyHtml}</div>`
    : `<div class="lesson-shell"><h3>Supplements and Safety</h3><p>Check product claims, labels, and evidence before deciding to use them.</p></div>`;
  const checkpointHtml = options.useTeacherCheckpoint
    ? buildTeacherCheckpoint({
        title: "Checkpoint: Claim credibility defense",
        prompt: "Choose one product claim and explain whether you would trust it and why.",
        saveKey: "lifestyle-decision-checkpoint",
        placeholder: "Claim, evidence check, and your final decision.",
        supportCopy: "Strong responses cite credibility, evidence, and personal impact."
      })
    : "";

  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">`,
    `<section class="clay-card p-6">`,
    `<p class="hss-mini-kicker">Decision Quality</p>`,
    `<h3 class="text-3xl font-black text-slate-900 mb-4">Supplement & Claim Forensics</h3>`,
    `<p class="text-slate-600 leading-7 mb-6">Use a clear screening process before adopting products, advice, or routines.</p>`,
    safetyHtml,
    `<div class="practice-panel mt-5">`,
    `<p class="font-semibold text-slate-800 mb-3">Credibility filter: use this sequence before saying yes.</p>`,
    `<ol class="list-decimal list-inside space-y-2 text-slate-700 leading-7">`,
    `<li>Identify who is making the claim and what they gain.</li>`,
    `<li>Check for evidence quality (research, not just testimonials).</li>`,
    `<li>Verify recency and whether guidance still matches current standards.</li>`,
    `<li>Decide if the claim fits your context, goals, and safety profile.</li>`,
    `</ol>`,
    `</div>`,
    `</section>`,
    `<section class="clay-card p-6">`,
    `<div class="flex items-start gap-4 mb-5">`,
    `<div class="activity-number">2</div>`,
    `<div>`,
    `<h3 class="text-2xl font-bold text-slate-800">Claim forensics challenge</h3>`,
    `<p class="text-slate-600">Choose the strongest evidence-based response for each product or ad claim.</p>`,
    `</div>`,
    `</div>`,
    `<div class="space-y-4" data-study-activity="lifestyle-claim-forensics">`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">An ad claims a product boosts performance in one week but gives no research source. Best response?</span><select class="workbook-input" data-persist-key="lifestyle-claim-forensics-1" data-correct-value="verify-evidence"><option value="">Choose the best fit</option><option value="verify-evidence">Verify evidence and source credibility first</option><option value="buy-now">Buy immediately</option><option value="peer-follow">Use it because friends do</option><option value="ignore-all">Ignore all health guidance</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A product label includes no Natural Product Number (NPN) but promises “clinically proven” outcomes. Best interpretation?</span><select class="workbook-input" data-persist-key="lifestyle-claim-forensics-2" data-correct-value="credibility-risk"><option value="">Choose the best fit</option><option value="credibility-risk">Treat as a credibility risk and verify through trusted sources</option><option value="safe-by-default">Assume safe because it is sold online</option><option value="friend-proof">Accept because a friend recommended it</option><option value="ignore-labels">Ignore labels and focus on testimonials</option></select></label>`,
    `</div>`,
    `<button type="button" class="study-check-button mt-6" data-study-check="lifestyle-claim-forensics">Check claim forensics</button>`,
    `<div class="study-check-results hidden" data-study-results="lifestyle-claim-forensics"></div>`,
    checkpointHtml,
    `</section>`,
    `</div>`,
    `</div>`
  ].join("");
}

function buildLifestyleRiskModule(options: {
  riskHtml: string;
  useTeacherCheckpoint: boolean;
}) {
  const riskHtml = options.riskHtml
    ? `<div class="lesson-shell">${options.riskHtml}</div>`
    : `<div class="lesson-shell"><h3>Risk and Protective Factors</h3><p>Track how repeated daily choices can amplify risk or protect long-term wellness.</p></div>`;
  const checkpointHtml = options.useTeacherCheckpoint
    ? buildTeacherCheckpoint({
        title: "Checkpoint: Risk tradeoff strategy",
        prompt: "Pick one high-risk routine and explain the protective switch you would make first.",
        saveKey: "lifestyle-risk-checkpoint",
        placeholder: "Current routine, risk pathway, protective replacement, and expected outcome.",
        supportCopy: "Strong responses describe both the risk mechanism and a realistic protective replacement."
      })
    : "";

  return [
    `<div class="module-container hss-section-flow">`,
    `<div class="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">`,
    `<section class="clay-card p-6">`,
    `<p class="hss-mini-kicker">Risk Logic</p>`,
    `<h3 class="text-3xl font-black text-slate-900 mb-4">Lifestyle Risk Tradeoff Simulator</h3>`,
    `<p class="text-slate-600 leading-7 mb-6">Compare immediate convenience against longer-term health impact and build protective switches.</p>`,
    riskHtml,
    `</section>`,
    `<section class="clay-card p-6">`,
    `<div class="flex items-start gap-4 mb-5">`,
    `<div class="activity-number">4</div>`,
    `<div>`,
    `<h3 class="text-2xl font-bold text-slate-800">Risk pathway simulator</h3>`,
    `<p class="text-slate-600">Select the strongest protective decision for each lifestyle tradeoff.</p>`,
    `</div>`,
    `</div>`,
    `<div class="space-y-4" data-study-activity="lifestyle-risk-simulator">`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">You are sleeping less than 6 hours repeatedly and relying on caffeine to compensate. What is the first protective switch?</span><select class="workbook-input" data-persist-key="lifestyle-risk-simulator-1" data-correct-value="sleep-protection"><option value="">Choose the best fit</option><option value="sleep-protection">Protect a consistent sleep window before adding more stimulants</option><option value="more-caffeine">Increase caffeine intake every day</option><option value="ignore-sleep">Ignore sleep and focus only on motivation</option><option value="weekend-recovery-only">Only recover sleep on weekends</option></select></label>`,
    `<label class="branch-row"><span class="font-semibold text-slate-800">A routine includes skipped meals, sugary drinks, and low movement. Which starting move lowers risk fastest?</span><select class="workbook-input" data-persist-key="lifestyle-risk-simulator-2" data-correct-value="structured-baseline"><option value="">Choose the best fit</option><option value="structured-baseline">Set a simple baseline: regular meals + hydration + short daily movement</option><option value="extreme-cut">Use an extreme restrictive reset</option><option value="single-pill">Rely on one supplement instead of routine changes</option><option value="delay-change">Delay changes until life is less busy</option></select></label>`,
    `</div>`,
    `<button type="button" class="study-check-button mt-6" data-study-check="lifestyle-risk-simulator">Check risk tradeoffs</button>`,
    `<div class="study-check-results hidden" data-study-results="lifestyle-risk-simulator"></div>`,
    checkpointHtml,
    `</section>`,
    `</div>`,
    `</div>`
  ].join("");
}

function buildLifestyleSynthesisModule(options: {
  synthesisHtml: string;
}) {
  return [
    `<div class="module-container hss-section-flow">`,
    `<section class="clay-card p-6">`,
    `<p class="hss-mini-kicker">Evidence Synthesis</p>`,
    `<h3 class="text-3xl font-black text-slate-900 mb-4">Assignment Synthesis Studio</h3>`,
    `<p class="text-slate-600 leading-7 mb-6">Pull together evidence from fuel, movement, forensics, and risk decisions into assignment-ready responses.</p>`,
    options.synthesisHtml,
    `<div class="teacher-checkpoint mt-6">`,
    `<p class="checkpoint-kicker">Lifestyle Assignment Handoff</p>`,
    `<h4 class="text-xl font-black text-amber-950 mt-2">Prepare your Section 3 response draft</h4>`,
    `<p class="teacher-checkpoint-note mt-3">Use your completed activities to support each claim with explicit evidence and realistic action steps.</p>`,
    `<label class="block text-sm font-semibold text-amber-950/90 mt-4 mb-3">Draft your first assignment response focus for Section 3.</label>`,
    `<textarea class="workbook-input min-h-[130px]" data-persist-key="lifestyle-assignment-handoff" placeholder="Prompt focus, chosen evidence, and your action plan."></textarea>`,
    `</div>`,
    `</section>`,
    `</div>`
  ].join("");
}

function buildLifestyleSupportStudio(options: {
  title: string;
  lead: string;
  blocks: CourseBlock[];
  prompt: string;
  saveKey: string;
}) {
  const cards = options.blocks
    .map((block) => {
      const contentHtml = stripRefNotesFromHtml(stripBlockWrapperHtml(block));
      const heading = getBlockHeading(block) || "Lifestyle source expansion";
      if (!contentHtml) {
        return "";
      }

      return [
        `<article class="practice-panel">`,
        `<p class="hss-mini-kicker mb-2">Applied lesson detail</p>`,
        `<h4 class="text-lg font-black text-slate-900 mb-3">${escapeHtml(heading)}</h4>`,
        `<div class="lesson-shell">${contentHtml}</div>`,
        `</article>`
      ].join("");
    })
    .filter((entry) => entry.length > 0);

  if (cards.length === 0) {
    return "";
  }

  return [
    `<div class="mt-6">`,
    `<p class="hss-mini-kicker">Extension Studio</p>`,
    `<h4 class="text-2xl font-black text-slate-900 mb-3">${escapeHtml(options.title)}</h4>`,
    `<p class="text-slate-600 leading-7 mb-5">${escapeHtml(options.lead)}</p>`,
    `<div class="grid md:grid-cols-2 gap-4">`,
    cards.join(""),
    `</div>`,
    `<div class="practice-panel mt-5">`,
    `<label class="block text-sm font-semibold text-slate-800 mb-3">${escapeHtml(options.prompt)}</label>`,
    `<textarea class="workbook-input min-h-[140px]" data-persist-key="${escapeHtml(
      options.saveKey
    )}" placeholder="Use direct evidence from one or more extension cards above."></textarea>`,
    `</div>`,
    `</div>`
  ].join("");
}

function composeLifestyleSection(section: CourseSection, benchmark?: HssCompositionBenchmark | null): CourseSection {
  const alreadyComposed = section.blocks.some(
    (block) =>
      block.type === "rawHtml" &&
      typeof block.html === "string" &&
      (block.html.includes("Lifestyle Action Lab") || block.html.includes("Fuel Decisions Lab"))
  );
  if (alreadyComposed) {
    return section;
  }

  const usedBlockIds = new Set<string>();
  const takeFirst = (predicate: (block: CourseBlock) => boolean) => {
    const block = section.blocks.find((candidate) => !usedBlockIds.has(candidate.id) && predicate(candidate));
    if (!block) {
      return undefined;
    }
    usedBlockIds.add(block.id);
    return block;
  };

  const takeAll = (predicate: (block: CourseBlock) => boolean) => {
    const matches = section.blocks.filter((candidate) => !usedBlockIds.has(candidate.id) && predicate(candidate));
    for (const block of matches) {
      usedBlockIds.add(block.id);
    }
    return matches;
  };

  const nutritionBlock = takeFirst(
    (block) => includesHeading(block, "Nutritional Choices") || includesText(block, "Canada's Food Guide")
  );
  const toolsBlock = takeFirst((block) => includesHeading(block, "Nutrition Tools") || includesText(block, "too good to be true"));
  const activityBlock = takeFirst((block) => includesHeading(block, "Physical Activity Guidelines") || includesText(block, "Youth 12-17"));
  const safetyBlock = takeFirst((block) => includesHeading(block, "Supplements") || includesText(block, "energy drinks"));
  const riskBlock = takeFirst(
    (block) =>
      includesHeading(block, "Risk") ||
      includesHeading(block, "Protective") ||
      includesText(block, "risk factor") ||
      includesText(block, "protective factor") ||
      includesText(block, "high-risk")
  );
  const synthesisBlock = takeFirst(
    (block) =>
      includesHeading(block, "Synthesis") ||
      includesHeading(block, "Assignment") ||
      includesHeading(block, "Lifestyle Reflection") ||
      includesText(block, "assignment") ||
      includesText(block, "action plan")
  );

  if (!nutritionBlock && !toolsBlock && !activityBlock && !safetyBlock && !riskBlock && !synthesisBlock) {
    return section;
  }

  const lifestyleSupplements = takeAll(
    (block) =>
      isSourceSupplement(block) &&
      (pageInRange(block, 34, 56) ||
        includesText(block, "Food Guide") ||
        includesText(block, "Physical Activity") ||
        includesText(block, "supplements") ||
        includesText(block, "NPN"))
  );
  const remainingBlocks = takeAll(() => true);
  const extensionBlocks = [...lifestyleSupplements, ...remainingBlocks];
  const categorizeExtensionBlock = (block: CourseBlock) => {
    const searchable = `${getBlockHeading(block)} ${extractBlockText(block)}`.toLowerCase();
    if (
      searchable.includes("food guide") ||
      searchable.includes("nutrition") ||
      searchable.includes("meal") ||
      searchable.includes("hydration") ||
      searchable.includes("fuel")
    ) {
      return "fuel";
    }
    if (
      searchable.includes("physical activity") ||
      searchable.includes("movement") ||
      searchable.includes("exercise") ||
      searchable.includes("fitness") ||
      searchable.includes("youth 12-17")
    ) {
      return "movement";
    }
    if (
      searchable.includes("supplement") ||
      searchable.includes("npn") ||
      searchable.includes("claim") ||
      searchable.includes("label") ||
      searchable.includes("energy drink") ||
      searchable.includes("product")
    ) {
      return "forensics";
    }
    if (
      searchable.includes("risk") ||
      searchable.includes("protective") ||
      searchable.includes("alcohol") ||
      searchable.includes("tobacco") ||
      searchable.includes("drug") ||
      searchable.includes("sleep")
    ) {
      return "risk";
    }
    return "synthesis";
  };
  const fuelExtensionBlocks: CourseBlock[] = [];
  const movementExtensionBlocks: CourseBlock[] = [];
  const forensicsExtensionBlocks: CourseBlock[] = [];
  const riskExtensionBlocks: CourseBlock[] = [];
  const synthesisExtensionBlocks: CourseBlock[] = [];

  for (const block of extensionBlocks) {
    const category = categorizeExtensionBlock(block);
    if (category === "fuel") {
      fuelExtensionBlocks.push(block);
      continue;
    }
    if (category === "movement") {
      movementExtensionBlocks.push(block);
      continue;
    }
    if (category === "forensics") {
      forensicsExtensionBlocks.push(block);
      continue;
    }
    if (category === "risk") {
      riskExtensionBlocks.push(block);
      continue;
    }
    synthesisExtensionBlocks.push(block);
  }
  const useWorkbookSurface = usesWorkbookBenchmark(benchmark);
  const useTeacherCheckpoint = useWorkbookSurface && benchmarkIncludesRecipe(benchmark, "teacher-checkpoint");
  const sourceBlocks = Array.from(
    new Map(
      [
        ...(nutritionBlock ? [nutritionBlock] : []),
        ...(toolsBlock ? [toolsBlock] : []),
        ...(activityBlock ? [activityBlock] : []),
        ...(safetyBlock ? [safetyBlock] : []),
        ...(riskBlock ? [riskBlock] : []),
        ...(synthesisBlock ? [synthesisBlock] : []),
        ...lifestyleSupplements,
        ...remainingBlocks
      ].map((block) => [block.id, block] as const)
    ).values()
  );

  const nutritionHtml = nutritionBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(nutritionBlock)) : "";
  const toolsHtml = toolsBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(toolsBlock)) : "";
  const activityHtml = activityBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(activityBlock)) : "";
  const safetyHtml = safetyBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(safetyBlock)) : "";
  const riskHtml = riskBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(riskBlock)) : "";
  const synthesisHtml = synthesisBlock ? stripRefNotesFromHtml(stripBlockWrapperHtml(synthesisBlock)) : "";
  const fuelSupportStudioHtml = buildLifestyleSupportStudio({
    title: "Fuel extensions",
    lead: "Use these source-aligned cards to strengthen your nutrition decisions with concrete examples.",
    blocks: fuelExtensionBlocks,
    prompt: "Which fuel extension card best improves your current routine, and why?",
    saveKey: "lifestyle-fuel-extension-reflection"
  });
  const movementSupportStudioHtml = buildLifestyleSupportStudio({
    title: "Movement extensions",
    lead: "Use these cards to design activity routines that still work when schedules are tight.",
    blocks: movementExtensionBlocks,
    prompt: "Which movement extension card helps you build the most realistic weekly plan?",
    saveKey: "lifestyle-movement-extension-reflection"
  });
  const decisionSupportStudioHtml = buildLifestyleSupportStudio({
    title: "Claim and product extensions",
    lead: "Use these cards to sharpen your credibility and safety checks before accepting product claims.",
    blocks: forensicsExtensionBlocks,
    prompt: "Choose one extension card and explain how it changes your claim-evaluation process.",
    saveKey: "lifestyle-decision-extension-reflection"
  });
  const riskSupportStudioHtml = buildLifestyleSupportStudio({
    title: "Risk pathway extensions",
    lead: "Use these cards to map risk patterns and identify the strongest protective switch.",
    blocks: riskExtensionBlocks,
    prompt: "Which risk extension card best exposes a routine you should change first?",
    saveKey: "lifestyle-risk-extension-reflection"
  });
  const synthesisSupportStudioHtml = buildLifestyleSupportStudio({
    title: "Assignment evidence extensions",
    lead: "Use these cards to support your final section draft with specific, source-backed details.",
    blocks: synthesisExtensionBlocks,
    prompt: "Which extension card gives the strongest evidence for your Section 3 assignment draft?",
    saveKey: "lifestyle-synthesis-extension-reflection"
  });

  const heroBlock = createRawHtmlBlock(`${section.id}-interactive-hero`, buildLifestyleHero(), sourceBlocks);
  const fuelModule = createRawHtmlBlock(
    `${section.id}-interactive-fuel`,
    buildLifestyleFuelModule({
      nutritionHtml,
      toolsHtml,
      supportStudioHtml: fuelSupportStudioHtml,
      useTeacherCheckpoint
    }),
    sourceBlocks
  );
  const movementModule = createRawHtmlBlock(
    `${section.id}-interactive-movement`,
    buildLifestyleMovementModule({
      activityHtml,
      supportStudioHtml: movementSupportStudioHtml,
      useTeacherCheckpoint
    }),
    sourceBlocks
  );
  const decisionModule = createRawHtmlBlock(
    `${section.id}-interactive-decision`,
    buildLifestyleDecisionModule({
      safetyHtml: `${safetyHtml}${decisionSupportStudioHtml}`,
      useTeacherCheckpoint
    }),
    sourceBlocks
  );
  const riskModule = createRawHtmlBlock(
    `${section.id}-interactive-risk`,
    buildLifestyleRiskModule({
      riskHtml: `${riskHtml}${riskSupportStudioHtml}`,
      useTeacherCheckpoint
    }),
    sourceBlocks
  );
  const synthesisModule = createRawHtmlBlock(
    `${section.id}-interactive-synthesis`,
    buildLifestyleSynthesisModule({
      synthesisHtml: `${synthesisHtml || `<div class="lesson-shell"><h3>Lifestyle synthesis prompt</h3><p>Combine evidence from fuel, movement, forensics, and risk decisions into one defendable response.</p></div>`}${synthesisSupportStudioHtml}`
    }),
    sourceBlocks
  );

  return {
    ...section,
    blocks: [heroBlock, fuelModule, movementModule, decisionModule, riskModule, synthesisModule]
  };
}

export function composeInteractiveHss1010Course(
  course: CourseModel,
  benchmark?: HssCompositionBenchmark | null
): CourseModel {
  return {
    ...course,
    sections: course.sections.map((section) => {
      if (section.id === "wellness") {
        return composeWellnessSection(section, benchmark);
      }
      if (section.id === "anatomy") {
        return composeAnatomySection(section, benchmark);
      }
      if (section.id === "lifestyle") {
        return composeLifestyleSection(section, benchmark);
      }

      return section;
    })
  };
}
