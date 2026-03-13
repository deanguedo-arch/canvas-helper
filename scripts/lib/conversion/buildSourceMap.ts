import { collectCueTerms, normalizeText } from "./detectStructures.js";
import type { CourseBlock, CourseModel, SourceChunk, SourceMapModel } from "./types.js";

type BuildSourceMapOptions = {
  projectSlug: string;
  course: CourseModel;
  sourceReferenceId: string | null;
  sourceChunks: SourceChunk[];
  generatedAt: string;
};

function scoreChunkByTerms(chunkText: string, cueTerms: string[]) {
  if (cueTerms.length === 0) {
    return 0;
  }

  const normalizedChunk = normalizeText(chunkText);
  return cueTerms.reduce((score, cueTerm) => {
    return normalizedChunk.includes(cueTerm) ? score + 1 : score;
  }, 0);
}

function matchChunks(sourceChunks: SourceChunk[], cueTerms: string[]) {
  const scored = sourceChunks
    .map((chunk) => ({
      chunk,
      score: scoreChunkByTerms(chunk.text, cueTerms)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.chunk.index - right.chunk.index);

  const bestMatches = scored.slice(0, 8).map((entry) => entry.chunk);
  return {
    chunkIds: bestMatches.map((chunk) => chunk.id),
    pages: [...new Set(bestMatches.map((chunk) => chunk.page).filter((page): page is number => page != null))]
  };
}

function getExplicitBlockMatches(block: CourseBlock, sourceChunks: SourceChunk[]) {
  const explicitPages: number[] = [];
  if (block.source.sourcePageStart != null && block.source.sourcePageEnd != null) {
    for (let page = block.source.sourcePageStart; page <= block.source.sourcePageEnd; page += 1) {
      explicitPages.push(page);
    }
  } else if (block.source.sourcePageStart != null) {
    explicitPages.push(block.source.sourcePageStart);
  }

  const pageMatchedChunkIds = sourceChunks
    .filter((chunk) => chunk.page != null && explicitPages.includes(chunk.page))
    .map((chunk) => chunk.id);
  const blockMatchedChunkIds = block.source.sourceBlockId ? [block.source.sourceBlockId] : [];
  const mappedChunkIds = [...new Set([...blockMatchedChunkIds, ...pageMatchedChunkIds])];
  return {
    chunkIds: mappedChunkIds,
    pages: [...new Set(explicitPages)]
  };
}

function buildBlockCueText(block: CourseBlock) {
  const pieces = [
    block.title ?? "",
    block.text ?? "",
    (block.items ?? []).join(" "),
    (block.headers ?? []).join(" "),
    (block.rows ?? []).flat().join(" "),
    (block.cards ?? []).map((card) => `${card.title} ${card.body}`).join(" "),
    block.figureLabel ?? "",
    block.figureDescription ?? ""
  ];

  return pieces.filter((value) => value.trim().length > 0).join(" ");
}

export function buildCourseSourceMap(options: BuildSourceMapOptions): SourceMapModel {
  const sectionMappings = options.course.sections.map((section) => {
    const cueTerms = collectCueTerms(`${section.tabLabel} ${section.title}`, 10);
    const matches = matchChunks(options.sourceChunks, cueTerms);
    const explicitPages = [
      ...new Set(
        section.blocks.flatMap((block) => {
          const blockMatches = getExplicitBlockMatches(block, options.sourceChunks);
          return blockMatches.pages;
        })
      )
    ];
    const explicitChunkIds = [
      ...new Set(
        section.blocks.flatMap((block) => {
          const blockMatches = getExplicitBlockMatches(block, options.sourceChunks);
          return blockMatches.chunkIds;
        })
      )
    ];
    return {
      sectionId: section.id,
      matchedChunkIds: [...new Set([...matches.chunkIds, ...explicitChunkIds])],
      matchedPages: [...new Set([...matches.pages, ...explicitPages])].sort((left, right) => left - right),
      cueTerms
    };
  });

  const blockMappings = options.course.sections.flatMap((section) =>
    section.blocks.map((block) => {
      const cueTerms = collectCueTerms(buildBlockCueText(block), 10);
      const explicitMatches = getExplicitBlockMatches(block, options.sourceChunks);
      const heuristicMatches = matchChunks(options.sourceChunks, cueTerms);
      const conversionStatus = block.source.conversionStatus;
      return {
        blockId: block.id,
        sectionId: section.id,
        mappedChunkIds: [...new Set([...explicitMatches.chunkIds, ...heuristicMatches.chunkIds])],
        mappedPages: [...new Set([...explicitMatches.pages, ...heuristicMatches.pages])].sort((left, right) => left - right),
        conversionStatus
      };
    })
  );

  const resolvedChunkIds = new Set([
    ...sectionMappings.flatMap((mapping) => mapping.matchedChunkIds),
    ...blockMappings.flatMap((mapping) => mapping.mappedChunkIds)
  ]);

  const unresolvedChunkIds = options.sourceChunks
    .map((chunk) => chunk.id)
    .filter((chunkId) => !resolvedChunkIds.has(chunkId));

  return {
    courseId: options.projectSlug,
    slug: options.projectSlug,
    generatedAt: options.generatedAt,
    sourceReferenceId: options.sourceReferenceId,
    sourceChunkCount: options.sourceChunks.length,
    sectionMappings,
    blockMappings,
    unresolvedChunkIds
  };
}
