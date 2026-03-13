import type { CourseBlock, CourseModel, SourceTrace } from "./types.js";

export type CourseImageStatus = "draft" | "approved" | "rejected";

export type CourseImageManifestEntry = {
  id: string;
  sectionId: string;
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  status: CourseImageStatus;
  insertAfterBlockId?: string;
};

export type CourseImageManifest = {
  schemaVersion: number;
  projectSlug: string;
  images: CourseImageManifestEntry[];
};

export type ValidateCourseImageManifestOptions = {
  course: CourseModel;
  manifest: CourseImageManifest;
  existingImagePaths: Set<string>;
};

export type ApplyCourseImageManifestOptions = ValidateCourseImageManifestOptions;

export type ApplyCourseImageManifestResult = {
  course: CourseModel;
  inserted: number;
  updated: number;
  skipped: number;
};

function normalizeImagePath(value: string) {
  return value.replace(/\\/g, "/").trim();
}

function createManagedNote(imageId: string) {
  return `image-manifest:${imageId}`;
}

function hasManagedNote(source: SourceTrace | undefined, imageId: string) {
  return Boolean(source?.notes?.includes(createManagedNote(imageId)));
}

function createFigureBlock(entry: CourseImageManifestEntry, templateSource: SourceTrace): CourseBlock {
  return {
    id: `image-${entry.id}`,
    type: "figure",
    figureLabel: entry.title ?? entry.alt,
    figureDescription: entry.caption ?? "",
    figureStatus: "available",
    figureSourceUrl: normalizeImagePath(entry.src),
    source: {
      ...templateSource,
      sourceBlockId: `image-${entry.id}`,
      conversionStatus: "converted",
      notes: [...(templateSource.notes ?? []), createManagedNote(entry.id)]
    }
  };
}

function upsertSectionImageBlock(sectionBlocks: CourseBlock[], entry: CourseImageManifestEntry): {
  blocks: CourseBlock[];
  inserted: number;
  updated: number;
} {
  const existingManagedIndex = sectionBlocks.findIndex((block) => hasManagedNote(block.source, entry.id));
  const templateSource = sectionBlocks[0]?.source ?? {
    sourceType: "legacy-html",
    sourceTitle: "Image manifest",
    sourcePageStart: null,
    sourcePageEnd: null,
    sourceBlockId: null,
    conversionStatus: "converted",
    notes: []
  };
  const nextBlock = createFigureBlock(entry, templateSource);

  if (existingManagedIndex >= 0) {
    const blocks = [...sectionBlocks];
    blocks[existingManagedIndex] = nextBlock;
    return { blocks, inserted: 0, updated: 1 };
  }

  const insertAfterIndex = entry.insertAfterBlockId
    ? sectionBlocks.findIndex((block) => block.id === entry.insertAfterBlockId)
    : -1;
  if (insertAfterIndex >= 0) {
    return {
      blocks: [...sectionBlocks.slice(0, insertAfterIndex + 1), nextBlock, ...sectionBlocks.slice(insertAfterIndex + 1)],
      inserted: 1,
      updated: 0
    };
  }

  return {
    blocks: [...sectionBlocks, nextBlock],
    inserted: 1,
    updated: 0
  };
}

export function validateCourseImageManifest(options: ValidateCourseImageManifestOptions) {
  const sectionIds = new Set(options.course.sections.map((section) => section.id));
  const issues: string[] = [];

  for (const image of options.manifest.images) {
    if (image.status !== "approved") {
      continue;
    }

    if (!sectionIds.has(image.sectionId)) {
      issues.push(`Image "${image.id}" references unknown section "${image.sectionId}".`);
      continue;
    }

    const normalizedPath = normalizeImagePath(image.src);
    if (!options.existingImagePaths.has(normalizedPath)) {
      issues.push(`Image "${image.id}" source file is missing: ${normalizedPath}`);
    }
  }

  return issues;
}

export function applyCourseImageManifest(options: ApplyCourseImageManifestOptions): ApplyCourseImageManifestResult {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  const approvedImages = options.manifest.images.filter((image) => image.status === "approved");
  const bySection = new Map<string, CourseImageManifestEntry[]>();
  for (const image of approvedImages) {
    const normalizedPath = normalizeImagePath(image.src);
    if (!options.existingImagePaths.has(normalizedPath)) {
      skipped += 1;
      continue;
    }

    const normalizedEntry = { ...image, src: normalizedPath };
    bySection.set(image.sectionId, [...(bySection.get(image.sectionId) ?? []), normalizedEntry]);
  }

  skipped += options.manifest.images.filter((image) => image.status !== "approved").length;

  const course: CourseModel = {
    ...options.course,
    sections: options.course.sections.map((section) => {
      const sectionImages = bySection.get(section.id) ?? [];
      if (sectionImages.length === 0) {
        return section;
      }

      let sectionBlocks = section.blocks;
      for (const image of sectionImages) {
        const upsert = upsertSectionImageBlock(sectionBlocks, image);
        sectionBlocks = upsert.blocks;
        inserted += upsert.inserted;
        updated += upsert.updated;
      }

      return {
        ...section,
        blocks: sectionBlocks
      };
    })
  };

  return {
    course,
    inserted,
    updated,
    skipped
  };
}
