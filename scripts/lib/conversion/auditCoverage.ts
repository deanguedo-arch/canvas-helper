import type { CourseModel, CoverageReport, SourceChunk, SourceMapModel } from "./types.js";

type BuildCoverageOptions = {
  projectSlug: string;
  course: CourseModel;
  sourceChunks: SourceChunk[];
  sourceMap: SourceMapModel;
  generatedAt: string;
};

function uniquePages(chunks: SourceChunk[]) {
  return [...new Set(chunks.map((chunk) => chunk.page).filter((page): page is number => page != null))].sort(
    (left, right) => left - right
  );
}

export function buildCoverageReport(options: BuildCoverageOptions): CoverageReport {
  const sourcePages = uniquePages(options.sourceChunks);
  const coveredPages = [
    ...new Set(options.sourceMap.sectionMappings.flatMap((mapping) => mapping.matchedPages).filter((page) => page != null))
  ].sort((left, right) => left - right);
  const uncoveredPages = sourcePages.filter((page) => !coveredPages.includes(page));

  const convertedBlocks = options.sourceMap.blockMappings.filter((mapping) => mapping.conversionStatus === "converted").length;
  const placeholderBlocks = options.sourceMap.blockMappings.filter(
    (mapping) => mapping.conversionStatus === "placeholder"
  ).length;
  const unresolvedBlocks = options.sourceMap.blockMappings.filter((mapping) => mapping.conversionStatus === "unresolved").length;

  const sectionReports = options.course.sections.map((section) => {
    const sectionMappings = options.sourceMap.blockMappings.filter((mapping) => mapping.sectionId === section.id);
    const mappedPages = [...new Set(sectionMappings.flatMap((mapping) => mapping.mappedPages))].sort((left, right) => left - right);
    return {
      sectionId: section.id,
      title: section.title,
      mappedPageCount: mappedPages.length,
      mappedPages,
      convertedBlocks: sectionMappings.filter((mapping) => mapping.conversionStatus === "converted").length,
      placeholderBlocks: sectionMappings.filter((mapping) => mapping.conversionStatus === "placeholder").length,
      unresolvedBlocks: sectionMappings.filter((mapping) => mapping.conversionStatus === "unresolved").length
    };
  });

  const pendingFigures = options.course.sections.flatMap((section) =>
    section.blocks
      .filter((block) => block.type === "figure" && block.figureStatus === "pending")
      .map((block) => ({
        blockId: block.id,
        sectionId: section.id,
        label: block.figureLabel ?? "Figure reference",
        description: block.figureDescription ?? "",
        sourcePageStart: block.source.sourcePageStart,
        sourcePageEnd: block.source.sourcePageEnd
      }))
  );

  return {
    courseId: options.projectSlug,
    slug: options.projectSlug,
    generatedAt: options.generatedAt,
    sourcePagesTotal: sourcePages.length,
    sourcePagesCovered: coveredPages.length,
    sourcePagesUncovered: uncoveredPages,
    sourceBlocksTotal: options.sourceChunks.length,
    convertedBlocks,
    placeholderBlocks,
    unresolvedBlocks,
    unresolvedChunkIds: options.sourceMap.unresolvedChunkIds,
    pendingFigures,
    sections: sectionReports
  };
}

