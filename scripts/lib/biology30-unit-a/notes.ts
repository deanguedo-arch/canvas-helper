import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { load as loadHtml } from "cheerio";
import pdf from "pdf-parse";

import { extractPdfTextWithFallback, inspectPdfOcrSupport } from "../pdf-text.js";
import type { BiologyWorkspaceAssets } from "./assets.js";
import type {
  BiologySourceModel,
  BiologyNotesSemanticBlock,
  BiologyNotesSemanticLeafBlock,
  BiologyNotesSemanticPage,
  D2lItem,
  NotesLessonMapping,
  PreparedBiologyNotesDeck,
  PreparedBiologyNotesPage,
  WorkspaceBiologyNotesDeck
} from "./types.js";

const execFile = promisify(execFileCallback);
const EXPECTED_PAGE_COUNT = 139;
const VERIFIED_NOTES_SHA256 = "538f58fffe4aa0459dfcf49c5675948d8c7231a95a6fb2b61d7cde56e06a6035";
const COMMAND_BUFFER_BYTES = 32 * 1024 * 1024;
const CHAPTER_PAGES = {
  11: { offset: 0, first: 1, last: 66 },
  12: { offset: 66, first: 67, last: 96 },
  13: { offset: 96, first: 97, last: 139 }
} as const;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, " ");
}

function sha256Bytes(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function cleanText(value: string) {
  return value.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

type PdfLayoutTextItem = {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
};

type PdfLayoutLine = {
  text: string;
  x: number;
  maxX: number;
  y: number;
  fontSize: number;
};

type PdfLayoutPage = {
  page: number;
  width: number;
  lines: PdfLayoutLine[];
};

const BULLET_PREFIX = /^(?:[○●➢▪•◦‣►▸]|[–—-]|o(?=\s+[A-Z]))\s*/u;
const NUMBER_PREFIX = /^\d+[.)]\s+/;

function cleanInlineText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?%)])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .replace(/\s+([’'])\s*/g, "$1")
    .trim();
}

async function withoutKnownPdfParserNoise<T>(action: () => Promise<T>) {
  const original = { log: console.log, warn: console.warn, error: console.error };
  const filtered = (write: (...values: unknown[]) => void) => (...values: unknown[]) => {
    if (values.some((value) => /badly formatted number/i.test(String(value)))) return;
    write(...values);
  };
  console.log = filtered(original.log);
  console.warn = filtered(original.warn);
  console.error = filtered(original.error);
  try {
    return await action();
  } finally {
    console.log = original.log;
    console.warn = original.warn;
    console.error = original.error;
  }
}

function itemFontSize(item: PdfLayoutTextItem) {
  const horizontal = Math.hypot(item.transform[0] ?? 0, item.transform[1] ?? 0);
  const vertical = Math.hypot(item.transform[2] ?? 0, item.transform[3] ?? 0);
  return Math.max(horizontal, vertical, item.height ?? 0, 1);
}

function joinLayoutItems(items: Array<{ text: string; x: number; maxX: number; fontSize: number }>) {
  let output = "";
  let previous: (typeof items)[number] | undefined;
  for (const item of items) {
    if (!item.text.trim()) continue;
    if (previous) {
      const gap = item.x - previous.maxX;
      const explicitSpace = /\s$/.test(previous.text) || /^\s/.test(item.text);
      const punctuation = /^[,.;:!?%)’']/.test(item.text);
      if (!explicitSpace && !punctuation && gap > Math.max(1.5, Math.min(previous.fontSize, item.fontSize) * 0.12)) {
        output += " ";
      }
    }
    output += item.text;
    previous = item;
  }
  return cleanInlineText(output);
}

function buildLayoutLines(items: PdfLayoutTextItem[]) {
  const rows: Array<{ y: number; items: Array<{ text: string; x: number; maxX: number; fontSize: number }> }> = [];
  for (const item of items) {
    if (!item.str.trim()) continue;
    const y = item.transform[5] ?? 0;
    let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 1.25);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    const fontSize = itemFontSize(item);
    const x = item.transform[4] ?? 0;
    row.items.push({ text: item.str, x, maxX: x + Math.max(item.width ?? 0, 0), fontSize });
  }

  const lines: PdfLayoutLine[] = [];
  for (const row of rows.sort((left, right) => right.y - left.y)) {
    const sorted = row.items.sort((left, right) => left.x - right.x);
    let segment: typeof sorted = [];
    const flush = () => {
      if (!segment.length) return;
      const text = joinLayoutItems(segment);
      if (text && !/^[*○●➢▪•◦‣►▸]+$/u.test(text)) {
        lines.push({
          text,
          x: Math.min(...segment.map((item) => item.x)),
          maxX: Math.max(...segment.map((item) => item.maxX)),
          y: row.y,
          fontSize: Math.max(...segment.map((item) => item.fontSize))
        });
      }
      segment = [];
    };
    for (const item of sorted) {
      const previous = segment.at(-1);
      const gap = previous ? item.x - previous.maxX : 0;
      const splitGap = Math.max(22, Math.min(36, item.fontSize * 1.65));
      if (previous && gap > splitGap) flush();
      segment.push(item);
    }
    flush();
  }
  return lines;
}

async function extractPdfLayoutPages(buffer: Buffer) {
  const pages: PdfLayoutPage[] = [];
  await withoutKnownPdfParserNoise(async () =>
    pdf(buffer, {
      pagerender: async (pageData: {
        getViewport?: (scale: number) => { width: number };
        getTextContent: (options: {
          normalizeWhitespace: boolean;
          disableCombineTextItems: boolean;
        }) => Promise<{ items: PdfLayoutTextItem[] }>;
      }) => {
        const textContent = await pageData.getTextContent({
          normalizeWhitespace: false,
          disableCombineTextItems: false
        });
        const viewportWidth = pageData.getViewport?.(1).width;
        pages.push({
          page: pages.length + 1,
          width: Number.isFinite(viewportWidth) ? viewportWidth! : 720,
          lines: buildLayoutLines(textContent.items)
        });
        return "";
      }
    })
  );
  return pages;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function startsListItem(line: PdfLayoutLine) {
  return BULLET_PREFIX.test(line.text) || NUMBER_PREFIX.test(line.text);
}

function blocksTitleDetection(line: PdfLayoutLine) {
  return BULLET_PREFIX.test(line.text) || (NUMBER_PREFIX.test(line.text) && line.fontSize < 22);
}

function isReferenceText(value: string) {
  return /^(?:\*\s*)?(?:textbook\s+pages?|https?:\/\/|www\.)/i.test(value);
}

function isCalloutText(value: string) {
  return /^(?:reminder!?|example:|extra:|note:|important:|fun fact:|watch\b|\*\s*(?!textbook))/i.test(value);
}

function isSemanticHeading(line: PdfLayoutLine, bodyFontSize: number) {
  return (
    !startsListItem(line) &&
    !isReferenceText(line.text) &&
    line.text.length <= 110 &&
    line.fontSize >= Math.max(18, bodyFontSize * 1.24)
  );
}

function appendListBlock(
  blocks: BiologyNotesSemanticLeafBlock[],
  kind: "bullets" | "numbered",
  text: string
) {
  const previous = blocks.at(-1);
  if (previous?.kind === kind) previous.items.push(text);
  else blocks.push({ kind, items: [text] });
}

function collectContinuation(input: {
  lines: PdfLayoutLine[];
  start: number;
  bodyFontSize: number;
  stopAtHeading?: boolean;
}) {
  const first = input.lines[input.start];
  let text = first.text;
  let index = input.start + 1;
  let previous = first;
  for (; index < input.lines.length; index += 1) {
    const next = input.lines[index];
    const verticalGap = previous.y - next.y;
    if (startsListItem(next) || isReferenceText(next.text) || isCalloutText(next.text)) break;
    if (input.stopAtHeading !== false && isSemanticHeading(next, input.bodyFontSize)) break;
    if (verticalGap < -1 || verticalGap > Math.max(32, previous.fontSize * 2.35)) break;
    if (Math.abs(next.x - first.x) > 62 && next.x < first.x) break;
    text = cleanInlineText(`${text} ${next.text}`);
    previous = next;
  }
  return { text, nextIndex: index };
}

function parseLeafBlocks(lines: PdfLayoutLine[]): BiologyNotesSemanticLeafBlock[] {
  if (!lines.length) return [];
  const bodyFontSize = median(lines.map((line) => line.fontSize).filter((size) => size > 0)) || 14;
  const blocks: BiologyNotesSemanticLeafBlock[] = [];
  const ordered = [...lines].sort((left, right) => right.y - left.y || left.x - right.x);
  let index = 0;
  while (index < ordered.length) {
    const line = ordered[index];
    const bullet = line.text.match(BULLET_PREFIX);
    const numbered = line.text.match(NUMBER_PREFIX);
    if (bullet || numbered) {
      const continuation = collectContinuation({ lines: ordered, start: index, bodyFontSize });
      const prefix = bullet ?? numbered!;
      const itemText = cleanInlineText(continuation.text.slice(prefix[0].length));
      if (itemText) appendListBlock(blocks, bullet ? "bullets" : "numbered", itemText);
      index = continuation.nextIndex;
      continue;
    }
    if (isReferenceText(line.text)) {
      const continuation = collectContinuation({ lines: ordered, start: index, bodyFontSize, stopAtHeading: false });
      blocks.push({ kind: "reference", text: continuation.text.replace(/^\*\s*/, "") });
      index = continuation.nextIndex;
      continue;
    }
    if (isCalloutText(line.text)) {
      const continuation = collectContinuation({ lines: ordered, start: index, bodyFontSize, stopAtHeading: false });
      blocks.push({ kind: "callout", text: continuation.text.replace(/^\*\s*/, "") });
      index = continuation.nextIndex;
      continue;
    }
    if (isSemanticHeading(line, bodyFontSize)) {
      blocks.push({ kind: "heading", text: line.text });
      index += 1;
      continue;
    }
    const continuation = collectContinuation({ lines: ordered, start: index, bodyFontSize });
    if (continuation.text) blocks.push({ kind: "paragraph", text: continuation.text });
    index = continuation.nextIndex;
  }
  return blocks;
}

function semanticText(blocks: BiologyNotesSemanticBlock[]) {
  return blocks
    .flatMap((block) =>
      block.kind === "columns"
        ? block.columns.flatMap((column) => column.blocks.flatMap((entry) => ("items" in entry ? entry.items : [entry.text])))
        : "items" in block
          ? block.items
          : [block.text]
    )
    .join(" ");
}

function buildSemanticPage(input: { page: number; text: string; layout?: PdfLayoutPage }): BiologyNotesSemanticPage {
  const sourceLines = input.layout?.lines.length
    ? input.layout.lines
    : input.text
        .split(/\n+/)
        .map((text, index) => ({
          text: cleanInlineText(text),
          x: 72,
          maxX: 648,
          y: 360 - index * 20,
          fontSize: index === 0 ? 20 : 14
        }))
        .filter((line) => line.text);
  const ordered = [...sourceLines].sort((left, right) => right.y - left.y || left.x - right.x);
  const maxFontSize = Math.max(0, ...ordered.map((line) => line.fontSize));
  const first = ordered[0];
  const canStartTitle = Boolean(
    first &&
      !blocksTitleDetection(first) &&
      !isReferenceText(first.text) &&
      ((maxFontSize >= 22 && first.fontSize >= Math.max(20, maxFontSize * 0.68)) ||
        (first.fontSize >= maxFontSize - 0.5 && first.text.length <= 80))
  );
  const titleLines: PdfLayoutLine[] = [];
  if (canStartTitle) {
    const titleThreshold = maxFontSize >= 22 ? Math.max(20, maxFontSize * 0.68) : maxFontSize - 0.5;
    let previous = first;
    for (const line of ordered) {
      if (titleLines.length >= 6 || blocksTitleDetection(line) || isReferenceText(line.text)) break;
      const verticalGap = previous.y - line.y;
      if (line.fontSize < titleThreshold || (titleLines.length && verticalGap > 56)) break;
      titleLines.push(line);
      previous = line;
    }
  }
  const titleSet = new Set(titleLines);
  let bodyLines = ordered.filter((line) => !titleSet.has(line));
  let title = cleanInlineText(titleLines.map((line) => line.text).join(" "));
  if (/^chapter\s+(?:11|12|13)$/i.test(title) && bodyLines[0]?.text.length <= 80 && bodyLines[0].fontSize >= 14) {
    title = `${title}: ${bodyLines[0].text}`;
    bodyLines = bodyLines.slice(1);
  }

  const width = input.layout?.width ?? 720;
  const centre = width * 0.49;
  const left = bodyLines.filter((line) => line.x < centre && line.maxX <= width * 0.64);
  const right = bodyLines.filter((line) => line.x >= centre);
  const common = bodyLines.filter((line) => !left.includes(line) && !right.includes(line));
  const pairedRows = left.filter((line) => right.some((candidate) => Math.abs(candidate.y - line.y) <= 2)).length;
  const useColumns = left.length >= 2 && right.length >= 2 && (pairedRows >= 2 || (left.length >= 4 && right.length >= 4));
  let blocks: BiologyNotesSemanticBlock[];
  if (useColumns) {
    const highestColumnY = Math.max(...left.map((line) => line.y), ...right.map((line) => line.y));
    const lowestColumnY = Math.min(...left.map((line) => line.y), ...right.map((line) => line.y));
    const before = common.filter((line) => line.y > highestColumnY);
    const after = common.filter((line) => line.y < lowestColumnY);
    const within = common.filter((line) => line.y <= highestColumnY && line.y >= lowestColumnY);
    blocks = [
      ...parseLeafBlocks(before),
      {
        kind: "columns",
        columns: [
          { blocks: parseLeafBlocks([...left, ...within]) },
          { blocks: parseLeafBlocks(right) }
        ]
      },
      ...parseLeafBlocks(after)
    ];
  } else {
    blocks = parseLeafBlocks(bodyLines);
  }
  if (!title) title = `Source note page ${input.page}`;
  const allText = `${title} ${semanticText(blocks)}`;
  const wordCount = allText.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g)?.length ?? 0;
  return {
    title,
    titleSource: input.layout?.lines.length && titleLines.length ? "layout" : "fallback",
    blocks,
    wordCount,
    sourceVisualRecommended: blocks.length === 0 || wordCount < 18
  };
}

function verifiedSemanticPage(input: {
  title: string;
  blocks: BiologyNotesSemanticBlock[];
  sourceVisualRecommended?: boolean;
}): BiologyNotesSemanticPage {
  const allText = `${input.title} ${semanticText(input.blocks)}`;
  return {
    title: input.title,
    titleSource: "layout",
    blocks: input.blocks,
    wordCount: allText.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g)?.length ?? 0,
    sourceVisualRecommended: input.sourceVisualRecommended === true
  };
}

function verifiedSemanticOverrides(sourceSha256: string) {
  if (sourceSha256 !== VERIFIED_NOTES_SHA256) return new Map<number, BiologyNotesSemanticPage>();
  return new Map<number, BiologyNotesSemanticPage>([
    [
      12,
      verifiedSemanticPage({
        title: "Myelination",
        sourceVisualRecommended: true,
        blocks: [
          { kind: "paragraph", text: "The myelination of neurons is vital for proper signal transduction within the nervous system." },
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "Myelinated neurons" },
                  {
                    kind: "bullets",
                    items: [
                      "Increased rate of nerve impulse conduction through saltatory conduction",
                      "Make up the white matter of the brain, which is responsible for conducting nerve impulses",
                      "Capable of regenerating after injury"
                    ]
                  }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "Unmyelinated neurons" },
                  {
                    kind: "bullets",
                    items: [
                      "Slower nerve impulse conduction because the impulse travels the entire length of the axon",
                      "Make up the grey matter of the brain, which processes information and generates nerve impulses",
                      "Not capable of regenerating after injury"
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    ],
    [
      44,
      verifiedSemanticPage({
        title: "Nervous system organization",
        sourceVisualRecommended: true,
        blocks: [
          { kind: "heading", text: "Central nervous system" },
          { kind: "paragraph", text: "The central nervous system consists of the brain and spinal cord." },
          { kind: "heading", text: "Peripheral nervous system" },
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "Autonomic nervous system" },
                  { kind: "paragraph", text: "Communicates with internal organs and glands." },
                  {
                    kind: "bullets",
                    items: [
                      "Sympathetic division: arousing; fight-or-flight",
                      "Parasympathetic division: calming; rest and digest"
                    ]
                  }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "Somatic nervous system" },
                  { kind: "paragraph", text: "Communicates with sense organs and voluntary muscles." },
                  {
                    kind: "bullets",
                    items: [
                      "Sensory, or afferent, nervous system: sensory input",
                      "Motor, or efferent, nervous system: motor output"
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    ],
    [
      48,
      verifiedSemanticPage({
        title: "Sympathetic vs. parasympathetic responses",
        sourceVisualRecommended: true,
        blocks: [
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "Sympathetic division" },
                  {
                    kind: "bullets",
                    items: [
                      "Pupil dilation",
                      "Decreased saliva and nasal mucus production",
                      "Increased heart rate and arterial constriction",
                      "Bronchial relaxation",
                      "Decreased gastrointestinal motility and urine production",
                      "Increased sweating",
                      "Conversion of glycogen to glucose in the liver"
                    ]
                  }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "Parasympathetic division" },
                  {
                    kind: "bullets",
                    items: [
                      "Pupil constriction",
                      "Increased saliva and nasal mucus production",
                      "Decreased heart rate and arterial dilation",
                      "Bronchial constriction",
                      "Increased gastrointestinal motility and urine production",
                      "Normal sweating",
                      "Glycogen synthesis in the liver"
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    ],
    [
      55,
      verifiedSemanticPage({
        title: "General organization of the brain",
        sourceVisualRecommended: true,
        blocks: [
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "Forebrain" },
                  { kind: "paragraph", text: "Main structures: cerebrum, basal ganglia, hippocampus, amygdala, thalamus, and hypothalamus." },
                  { kind: "paragraph", text: "General roles: learning and memory, conscious thought, problem solving, coordination, and voluntary actions." }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "Midbrain" },
                  { kind: "paragraph", text: "Main structures: tectum and tegmentum." },
                  { kind: "paragraph", text: "General roles: relaying signals between the forebrain and hindbrain, with roles associated with vision, hearing, temperature regulation, and alertness." }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "Hindbrain" },
                  { kind: "paragraph", text: "Main structures: pons, cerebellum, and medulla." },
                  { kind: "paragraph", text: "General roles: control of breathing, heart rate, blood pressure, sleep and wake cycles, and balance." }
                ]
              }
            ]
          }
        ]
      })
    ],
    [
      60,
      verifiedSemanticPage({
        title: "Other key structures of the brain and their functions",
        sourceVisualRecommended: true,
        blocks: [
          {
            kind: "bullets",
            items: [
              "Cerebrum: sensing, thinking, learning, emotion, consciousness, and voluntary movement",
              "Corpus callosum: fibres connecting the left and right hemispheres",
              "Thalamus: relay centre for signals entering and leaving the cortex",
              "Hypothalamus: regulation of homeostasis, including hunger, thirst, and temperature control",
              "Pituitary gland: hormone release",
              "Pons: sleep and arousal",
              "Cerebellum: fine muscle movement and balance",
              "Medulla oblongata: unconscious functions such as breathing and circulation",
              "Spinal cord: transmission of information between the brain and body",
              "Amygdala, hippocampus, and reticular formation are identified as structures that will not be tested."
            ]
          }
        ]
      })
    ],
    [
      72,
      verifiedSemanticPage({
        title: "Sensory receptor types",
        sourceVisualRecommended: true,
        blocks: [
          { kind: "heading", text: "Vision" },
          { kind: "paragraph", text: "Rods and cones are electromagnetic receptors in the retina that respond to light." },
          { kind: "heading", text: "Hearing" },
          { kind: "paragraph", text: "Auditory hair cells are mechanoreceptors in the organ of Corti that respond to vibration." },
          { kind: "heading", text: "Olfaction" },
          { kind: "paragraph", text: "Olfactory nerve endings are chemoreceptors in individual neurons that respond to airborne chemicals." },
          { kind: "heading", text: "Taste" },
          { kind: "paragraph", text: "Taste cells are chemoreceptors in taste buds that respond to food chemicals." },
          { kind: "heading", text: "Touch" },
          {
            kind: "bullets",
            items: [
              "Pacinian corpuscles are mechanoreceptors in the skin that respond to pressure.",
              "Free nerve endings include nociceptors that respond to pain.",
              "Temperature receptors are thermoreceptors in the skin that respond to temperature."
            ]
          }
        ]
      })
    ],
    [
      101,
      verifiedSemanticPage({
        title: "Endocrine and nervous system feedback",
        sourceVisualRecommended: true,
        blocks: [
          { kind: "paragraph", text: "The endocrine system works with the nervous system to maintain homeostasis within the body." },
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "When hormone levels fall" },
                  { kind: "paragraph", text: "The nervous system triggers hormone release from endocrine glands, causing hormone levels to rise toward homeostasis." }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "When hormone levels rise" },
                  { kind: "paragraph", text: "The nervous system triggers endocrine glands to stop releasing hormones, causing hormone levels to fall toward homeostasis." }
                ]
              }
            ]
          },
          {
            kind: "numbered",
            items: [
              "A stimulus produces a change in a variable.",
              "A receptor detects the change.",
              "Information travels to a control centre.",
              "The control centre sends information to an effector.",
              "The effector response feeds back on the original stimulus, returning the variable toward homeostasis."
            ]
          }
        ]
      })
    ],
    [
      102,
      verifiedSemanticPage({
        title: "Nervous and endocrine system comparison",
        blocks: [
          { kind: "paragraph", text: "Although the two systems work together, the source identifies key differences in how they act." },
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "Nervous system" },
                  {
                    kind: "bullets",
                    items: [
                      "Rapid response to change",
                      "Electrical and chemical signals",
                      "Signals relayed through neurons",
                      "Affects specific locations"
                    ]
                  }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "Endocrine system" },
                  {
                    kind: "bullets",
                    items: [
                      "Sustained response to change",
                      "Hormonal signals",
                      "Signals relayed through the bloodstream",
                      "Affects whole-body functioning"
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    ],
    [
      108,
      verifiedSemanticPage({
        title: "Learning the endocrine glands and hormones",
        blocks: [
          {
            kind: "paragraph",
            text: "The source notes acknowledge that this chapter includes substantial memorization, but emphasize connecting memorization to meaning and using retention strategies such as spaced repetition."
          },
          { kind: "heading", text: "You are responsible for knowing" },
          {
            kind: "numbered",
            items: [
              "All of the listed hormones",
              "The gland that releases each hormone",
              "Each hormone’s target",
              "Each hormone’s effect"
            ]
          }
        ]
      })
    ],
    [
      112,
      verifiedSemanticPage({
        title: "Hypothalamic releasing hormones and the anterior pituitary",
        sourceVisualRecommended: true,
        blocks: [
          {
            kind: "paragraph",
            text: "Each anterior pituitary hormone is released after stimulation by a releasing hormone from the hypothalamus. The source notes indicate that only the starred hormones need to be remembered or recognized."
          },
          {
            kind: "bullets",
            items: [
              "Corticotropin-releasing hormone (CRH) stimulates release of ACTH.",
              "Thyrotropin-releasing hormone (TRH) stimulates release of TSH.",
              "Gonadotropin-releasing hormone (GnRH) stimulates release of LH and FSH.",
              "Growth hormone-releasing hormone (GHRH) stimulates release of growth hormone.",
              "Prolactin-releasing hormone (PRH) stimulates release of prolactin."
            ]
          }
        ]
      })
    ],
    [
      120,
      verifiedSemanticPage({
        title: "Summary of hypothalamic and pituitary hormones",
        sourceVisualRecommended: true,
        blocks: [
          { kind: "heading", text: "Posterior pituitary hormones" },
          {
            kind: "bullets",
            items: [
              "Antidiuretic hormone (ADH) is stored by the pituitary and targets the kidneys, sweat glands, and circulatory system to regulate water balance.",
              "Oxytocin (OT) targets the female reproductive system and triggers uterine contractions during childbirth."
            ]
          },
          { kind: "heading", text: "Anterior pituitary hormones" },
          {
            kind: "bullets",
            items: [
              "GnRH stimulates release of LH, which targets the reproductive system and stimulates production of sex hormones by the gonads.",
              "GnRH stimulates release of FSH, which targets the reproductive system and stimulates production of sperm and eggs.",
              "TRH stimulates release of TSH, which targets the thyroid gland and stimulates thyroxine release; thyroxine regulates metabolism.",
              "PRH stimulates release of prolactin (PRL), which targets the mammary glands and promotes milk production.",
              "GHRH stimulates release of growth hormone (GH), which targets the liver, bones, and muscles and supports growth and metabolic rate.",
              "CRH stimulates release of ACTH, which targets the adrenal glands and supports glucocorticoid release, metabolism, and the stress response."
            ]
          }
        ]
      })
    ],
    [
      128,
      verifiedSemanticPage({
        title: "Calcitonin and PTH as antagonistic hormones",
        sourceVisualRecommended: true,
        blocks: [
          { kind: "paragraph", text: "Calcitonin and parathyroid hormone (PTH) are antagonistic hormones: they have opposing effects." },
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "When blood calcium rises" },
                  {
                    kind: "bullets",
                    items: [
                      "The thyroid gland releases calcitonin.",
                      "Calcitonin stimulates calcium deposition in bones and reduces calcium uptake in the kidneys.",
                      "Blood calcium declines toward the set point."
                    ]
                  }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "When blood calcium falls" },
                  {
                    kind: "bullets",
                    items: [
                      "The parathyroid gland releases PTH.",
                      "PTH stimulates calcium release from bones and calcium uptake in the kidneys; active vitamin D increases calcium uptake in the intestines.",
                      "Blood calcium rises toward the set point."
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    ],
    [
      130,
      verifiedSemanticPage({
        title: "Hormones of the pancreas",
        sourceVisualRecommended: true,
        blocks: [
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "Insulin" },
                  {
                    kind: "bullets",
                    items: [
                      "Released by the beta cells of the pancreas",
                      "Released after a meal when blood sugar levels are high",
                      "Makes cells more permeable to glucose, causing cells to take in glucose and reducing blood sugar levels toward the normal range",
                      "Promotes storage of glucose as glycogen in the liver"
                    ]
                  }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "Glucagon" },
                  {
                    kind: "bullets",
                    items: [
                      "Released by the alpha cells of the pancreas",
                      "Released when blood sugar levels are low",
                      "Promotes glycogen breakdown in the liver and the release of glucose into the bloodstream, increasing blood sugar levels toward the normal range"
                    ]
                  }
                ]
              }
            ]
          },
          { kind: "callout", text: "Insulin and glucagon form another antagonistic hormone pair." }
        ]
      })
    ],
    [
      131,
      verifiedSemanticPage({
        title: "Blood glucose regulation through negative feedback",
        sourceVisualRecommended: true,
        blocks: [
          { kind: "paragraph", text: "The source diagram places normal blood glucose at 75–110 mg per 100 mL of blood and shows two balancing feedback paths." },
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "When blood glucose rises" },
                  {
                    kind: "numbered",
                    items: [
                      "Beta cells in the pancreas secrete insulin.",
                      "Insulin causes body cells to take up glucose and promotes conversion of glucose to glycogen and fat.",
                      "Glucose levels in the bloodstream decrease toward the normal range."
                    ]
                  }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "When blood glucose falls" },
                  {
                    kind: "numbered",
                    items: [
                      "Alpha cells in the pancreas secrete glucagon.",
                      "Glucagon causes glycogen in the liver and muscles to be converted to glucose.",
                      "Glucose is released into the bloodstream, returning levels toward the normal range."
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    ],
    [
      135,
      verifiedSemanticPage({
        title: "Adrenal cortex and adrenal medulla",
        sourceVisualRecommended: true,
        blocks: [
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "Adrenal cortex" },
                  {
                    kind: "bullets",
                    items: [
                      "Supports the long-term stress response",
                      "Releases hormones after stimulation by ACTH, producing a slower response",
                      "Cortisol reduces pain and inflammation and increases energy availability by decreasing glucose storage and breaking down proteins",
                      "Aldosterone increases sodium reabsorption in the kidneys, increasing water reabsorption, blood volume, and blood pressure"
                    ]
                  }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "Adrenal medulla" },
                  {
                    kind: "bullets",
                    items: [
                      "Supports the short-term stress response",
                      "Releases hormones after direct nervous-system stimulation, producing a fast response",
                      "Epinephrine and norepinephrine initiate fight-or-flight responses such as increased heart rate and breathing rate"
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    ],
    [
      136,
      verifiedSemanticPage({
        title: "Short- and long-term stress pathways",
        sourceVisualRecommended: true,
        blocks: [
          {
            kind: "columns",
            columns: [
              {
                blocks: [
                  { kind: "heading", text: "Short-term response" },
                  {
                    kind: "paragraph",
                    text: "A perceived stressor activates the hypothalamus and nervous system. Nerve impulses travel through the spinal cord to the adrenal medulla, which releases epinephrine and norepinephrine."
                  }
                ]
              },
              {
                blocks: [
                  { kind: "heading", text: "Long-term response" },
                  {
                    kind: "paragraph",
                    text: "The hypothalamus releases CRH, which stimulates corticotropic cells of the anterior pituitary to release ACTH. ACTH targets the adrenal cortex, which releases aldosterone and cortisol."
                  }
                ]
              }
            ]
          }
        ]
      })
    ]
  ]);
}

function localNotesItem(source: BiologySourceModel) {
  return source.items.find(
    (item) => item.explicitlyHidden && /unit\s+a.*nervous.*endocrine.*notes/i.test(item.title) && /\.pdf$/i.test(item.resource?.href ?? "")
  );
}

function pageNumberFromImageName(fileName: string) {
  const match = fileName.match(/-(\d+)\.(?:jpe?g)$/i);
  return match ? Number(match[1]) : undefined;
}

async function extractTextWithoutKnownParserNoise(filePath: string) {
  return withoutKnownPdfParserNoise(() => extractPdfTextWithFallback(filePath));
}

async function writeTextSvg(input: { outputPath: string; page: number; text: string }) {
  const lines = (input.text || `Source notes page ${input.page}`)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);
  const text = lines
    .map((line, index) => `<text x="64" y="${105 + index * 38}" font-size="24" fill="#202622">${escapeXml(line.slice(0, 95))}</text>`)
    .join("");
  await writeFile(
    input.outputPath,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 619" role="img" aria-labelledby="title"><title id="title">Unit A notes page ${input.page}</title><rect width="1100" height="619" fill="#f7f8f6"/><rect width="1100" height="18" fill="#244b2a"/><text x="64" y="58" font-size="20" font-family="Arial, sans-serif" fill="#526057">UNIT A SOURCE NOTES · PAGE ${input.page}</text><g font-family="Arial, sans-serif">${text}</g></svg>`,
    "utf8"
  );
}

export async function prepareBiologyNotesDeck(input: {
  source: BiologySourceModel;
  workingDir: string;
  visualMode?: "auto" | "text-svg";
}): Promise<PreparedBiologyNotesDeck> {
  const item = localNotesItem(input.source);
  if (!item?.resource?.href) throw new Error(`Source ${input.source.resource.id} is missing the complete Unit A notes PDF.`);
  const archivePath = item.resource.href.replace(/\\/g, "/");
  const entry = input.source.archive.file(archivePath);
  if (!entry) throw new Error(`Unit A notes PDF is missing from ${input.source.resource.id}: ${archivePath}`);
  await mkdir(input.workingDir, { recursive: true });
  const pdfPath = path.join(input.workingDir, "unit-a-notes.pdf");
  const pdfBytes = await entry.async("uint8array");
  const sourceSha256 = sha256Bytes(pdfBytes);
  await writeFile(pdfPath, pdfBytes);
  const extraction = await extractTextWithoutKnownParserNoise(pdfPath);
  if (extraction.issue || extraction.pageCount !== EXPECTED_PAGE_COUNT) {
    throw new Error(
      `Unit A notes extraction failed: ${extraction.issue ?? `expected ${EXPECTED_PAGE_COUNT} pages, found ${extraction.pageCount}`}`
    );
  }
  const layoutPages = await extractPdfLayoutPages(Buffer.from(pdfBytes));
  if (layoutPages.length !== EXPECTED_PAGE_COUNT) {
    throw new Error(`Unit A notes layout extraction produced ${layoutPages.length} pages instead of ${EXPECTED_PAGE_COUNT}.`);
  }
  const layoutByPage = new Map(layoutPages.map((page) => [page.page, page]));
  const textByPage = new Map(extraction.pages.map((page) => [page.page, cleanText(page.text)]));
  const imageDir = path.join(input.workingDir, "slides");
  await mkdir(imageDir, { recursive: true });
  const support = await inspectPdfOcrSupport();
  let visualMethod: PreparedBiologyNotesDeck["visualMethod"];
  let imageExtension: PreparedBiologyNotesPage["imageExtension"];
  const imageByPage = new Map<number, string>();
  if (support.pdftoppmPath && input.visualMode !== "text-svg") {
    await execFile(
      support.pdftoppmPath,
      ["-q", "-jpeg", "-r", "110", "-jpegopt", "quality=78,progressive=y,optimize=y", pdfPath, path.join(imageDir, "slide")],
      { maxBuffer: COMMAND_BUFFER_BYTES }
    );
    for (const fileName of await readdir(imageDir)) {
      const page = pageNumberFromImageName(fileName);
      if (page) imageByPage.set(page, path.join(imageDir, fileName));
    }
    visualMethod = "pdftoppm-jpeg";
    imageExtension = "jpg";
  } else {
    for (let page = 1; page <= extraction.pageCount; page += 1) {
      const outputPath = path.join(imageDir, `slide-${String(page).padStart(3, "0")}.svg`);
      await writeTextSvg({ outputPath, page, text: textByPage.get(page) ?? "" });
      imageByPage.set(page, outputPath);
    }
    visualMethod = "text-svg-fallback";
    imageExtension = "svg";
  }
  if (imageByPage.size !== EXPECTED_PAGE_COUNT) {
    throw new Error(`Unit A notes visual extraction produced ${imageByPage.size} pages instead of ${EXPECTED_PAGE_COUNT}.`);
  }

  let ocrTextPageCount = 0;
  if (support.tesseractPath) {
    for (let page = 1; page <= extraction.pageCount; page += 1) {
      if (textByPage.get(page)?.trim()) continue;
      const imagePath = imageByPage.get(page)!;
      const { stdout } = await execFile(support.tesseractPath, [imagePath, "stdout", "-l", "eng"], {
        maxBuffer: COMMAND_BUFFER_BYTES
      });
      const ocrText = cleanText(stdout);
      if (ocrText) {
        textByPage.set(page, ocrText);
        ocrTextPageCount += 1;
      }
    }
  }
  const nativeTextPageCount = extraction.pages.filter((page) => page.text.trim()).length;
  const semanticOverrides = verifiedSemanticOverrides(sourceSha256);
  const pages: PreparedBiologyNotesPage[] = Array.from({ length: extraction.pageCount }, (_value, index) => {
    const page = index + 1;
    const text = textByPage.get(page) ?? "";
    return {
      page,
      text,
      imageFilePath: imageByPage.get(page)!,
      imageExtension,
      textSource: extraction.pages.some((candidate) => candidate.page === page && candidate.text.trim())
        ? "native"
        : text
          ? "ocr"
          : "unavailable",
      semantic: semanticOverrides.get(page) ?? buildSemanticPage({ page, text, layout: layoutByPage.get(page) })
    };
  });
  let previousExplicitTitle = "Unit A notes";
  for (const page of pages) {
    if (page.semantic.titleSource === "fallback" && page.semantic.title === `Source note page ${page.page}`) {
      page.semantic.title = `${previousExplicitTitle.replace(/\s+—\s+continued$/i, "")} — continued`;
      page.semantic.titleSource = "continued";
    } else if (page.semantic.titleSource !== "continued") {
      previousExplicitTitle = page.semantic.title;
    }
  }
  return {
    sourceId: input.source.resource.id,
    sourceItemId: item.identifier,
    sourceItemTitle: item.title,
    sourceItemPathTitles: item.pathTitles,
    sourceArchivePath: archivePath,
    sourceSha256,
    pageCount: extraction.pageCount,
    nativeTextPageCount,
    ocrTextPageCount,
    verifiedSemanticOverridePages: [...semanticOverrides.keys()].sort((left, right) => left - right),
    visualMethod,
    pages
  };
}

export async function materializeBiologyNotesDeck(input: {
  prepared: PreparedBiologyNotesDeck;
  assets: BiologyWorkspaceAssets;
}): Promise<WorkspaceBiologyNotesDeck> {
  const pdfPath = await input.assets.copyArchiveAsset({
    sourceId: input.prepared.sourceId,
    archivePath: input.prepared.sourceArchivePath,
    outputName: "unit-a-notes.pdf",
    purpose: "document",
    context: "Complete local Unit A notes deck fallback"
  });
  if (!pdfPath) throw new Error(`Could not copy the Unit A notes PDF for ${input.prepared.sourceId}.`);
  const pages = [];
  for (const page of input.prepared.pages) {
    const fileName = `slide-${String(page.page).padStart(3, "0")}.${page.imageExtension}`;
    const imagePath = await input.assets.copyDerivedAsset({
      sourceId: input.prepared.sourceId,
      sourceArchivePath: `${input.prepared.sourceArchivePath}#page=${page.page}`,
      sourceFilePath: page.imageFilePath,
      workspacePath: `assets/source/${input.prepared.sourceId}/unit-a-notes-slides/${fileName}`,
      purpose: "image"
    });
    pages.push({
      page: page.page,
      text: page.text,
      imageExtension: page.imageExtension,
      textSource: page.textSource,
      semantic: page.semantic,
      imagePath
    });
  }
  return { ...input.prepared, pdfPath, pages, mappings: [] };
}

function notesChapter(value: string): 11 | 12 | 13 | undefined {
  const match = value.match(/chapter\s*(11|12|13)/i);
  const chapter = Number(match?.[1]);
  return chapter === 11 || chapter === 12 || chapter === 13 ? chapter : undefined;
}

export function notesRangeForItem(item: D2lItem): NotesLessonMapping | undefined {
  const descriptionText = loadHtml(`<body>${item.descriptionHtml}</body>`)("body").text().replace(/\s+/g, " ").trim();
  const context = [...item.pathTitles, item.title, descriptionText, item.resource?.href ?? ""].join(" ");
  const chapter = notesChapter(context);
  if (!chapter) return undefined;
  const range = descriptionText.match(/\bslides?\s+(\d+)(?:\s*[-–—]\s*(\d+))?/i);
  if (range) {
    const sourceSlideStart = Number(range[1]);
    const sourceSlideEnd = Number(range[2] ?? range[1]);
    const chapterPages = CHAPTER_PAGES[chapter];
    const pdfPageStart = chapterPages.offset + sourceSlideStart;
    const pdfPageEnd = chapterPages.offset + sourceSlideEnd;
    if (pdfPageStart < chapterPages.first || pdfPageEnd > chapterPages.last || pdfPageEnd < pdfPageStart) {
      throw new Error(`Notes range for ${item.title} is outside Chapter ${chapter}: slides ${sourceSlideStart}-${sourceSlideEnd}.`);
    }
    return {
      sourceId: "",
      sourceItemId: item.identifier,
      sourceItemTitle: item.title,
      chapter,
      sourceSlideStart,
      sourceSlideEnd,
      pdfPageStart,
      pdfPageEnd
    };
  }
  if (/unit\s+a\s+chapter\s*(?:11|12|13)\s+notes/i.test(item.title)) {
    const chapterPages = CHAPTER_PAGES[chapter];
    return {
      sourceId: "",
      sourceItemId: item.identifier,
      sourceItemTitle: item.title,
      chapter,
      sourceSlideStart: 1,
      sourceSlideEnd: 2,
      pdfPageStart: chapterPages.first,
      pdfPageEnd: Math.min(chapterPages.first + 1, chapterPages.last)
    };
  }
  return undefined;
}

function renderParagraphText(value: string) {
  if (value.length <= 420) return `<p>${escapeHtml(value)}</p>`;
  const sentences = value.split(/(?<=[.!?])\s+(?=[A-Z“])/).filter(Boolean);
  if (sentences.length < 2) return `<p>${escapeHtml(value)}</p>`;
  const paragraphs: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > 330) {
      paragraphs.push(current);
      current = sentence;
    } else {
      current = cleanInlineText(`${current} ${sentence}`);
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n");
}

function renderSemanticLeafBlock(block: BiologyNotesSemanticLeafBlock) {
  if (block.kind === "heading") return `<p class="notes-page-subheading">${escapeHtml(block.text)}</p>`;
  if (block.kind === "paragraph") return renderParagraphText(block.text);
  if (block.kind === "callout") return `<aside class="notes-page-callout" role="note">${escapeHtml(block.text)}</aside>`;
  if (block.kind === "reference") {
    return `<aside class="notes-page-reference" role="note"><strong>Source reference</strong><span>${escapeHtml(block.text)}</span></aside>`;
  }
  const listTag = block.kind === "numbered" ? "ol" : "ul";
  return `<${listTag} class="notes-${block.kind === "numbered" ? "numbered" : "bullet"}-list">${block.items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</${listTag}>`;
}

function renderSemanticBlock(block: BiologyNotesSemanticBlock) {
  if (block.kind !== "columns") return renderSemanticLeafBlock(block);
  return `<div class="notes-page-columns">${block.columns
    .map(
      (column) =>
        `<div class="notes-page-column">${column.blocks.map((entry) => renderSemanticLeafBlock(entry)).join("\n")}</div>`
    )
    .join("\n")}</div>`;
}

export function renderNotesRange(input: {
  source: BiologySourceModel;
  item: D2lItem;
  deck: WorkspaceBiologyNotesDeck;
}) {
  const parsed = notesRangeForItem(input.item);
  if (!parsed) return "";
  const mapping = { ...parsed, sourceId: input.source.resource.id };
  input.deck.mappings.push(mapping);
  const pages = input.deck.pages.filter(
    (page) => page.page >= mapping.pdfPageStart && page.page <= mapping.pdfPageEnd
  );
  if (pages.length !== mapping.pdfPageEnd - mapping.pdfPageStart + 1) {
    throw new Error(`Missing rendered Unit A notes pages for ${input.item.title}.`);
  }
  const recreatedPages = pages.map((page) => {
    const visualNote = page.semantic.blocks.length === 0
      ? `<p class="notes-visual-note">This page is primarily visual. Open the original source slide below to inspect the diagram or media reference.</p>`
      : "";
    return `<article class="notes-page-recreation" data-notes-page="${page.page}">
      <header class="notes-page-header">
        <p>Source note page ${page.page}</p>
        <h5>${escapeHtml(page.semantic.title)}</h5>
      </header>
      <div class="notes-page-body">
        ${page.semantic.blocks.map((block) => renderSemanticBlock(block)).join("\n")}
        ${visualNote}
      </div>
      <details class="notes-source-slide">
        <summary>View original source slide</summary>
        <figure>
          <img src="${escapeHtml(page.imagePath)}" alt="Original source slide for page ${page.page}: ${escapeHtml(page.semantic.title)}" loading="lazy" decoding="async">
          <figcaption>Original PDF page ${page.page}, preserved for source comparison.</figcaption>
        </figure>
      </details>
    </article>`;
  });
  return `<section class="notes-content-range" aria-label="Source notes included in ${escapeHtml(input.item.title)}">
    <header>
      <p class="notes-content-kicker">Recreated source notes</p>
      <h4>Chapter ${mapping.chapter}, source slides ${mapping.sourceSlideStart}-${mapping.sourceSlideEnd}</h4>
      <p>The content from pages ${mapping.pdfPageStart}-${mapping.pdfPageEnd} of the verified 139-page Unit A notes PDF is rebuilt below as readable course text. Each original slide remains available only as an optional source comparison.</p>
    </header>
    <div class="notes-page-sequence">${recreatedPages.join("\n")}</div>
  </section>`;
}
