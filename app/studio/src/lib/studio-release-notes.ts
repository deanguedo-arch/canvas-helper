export type StudioReleaseNote = {
  title: string;
  summary: string;
};

export type StudioRelease = {
  version: string;
  date: string;
  title: string;
  summary: string;
  notes: StudioReleaseNote[];
};

export const CURRENT_STUDIO_RELEASE: StudioRelease = {
  version: "2026.08",
  date: "August 12, 2026",
  title: "Safe course editing",
  summary: "Eligible courses can now collect, review, apply, and undo routine teacher changes directly in Studio or Full Preview.",
  notes: [
    {
      title: "Edit the course in place",
      summary: "Change supported text, links, images, alt text, captions, and curated visual styles without leaving Studio."
    },
    {
      title: "Review before applying",
      summary: "Draft Changes persist per course across Studio and Full Preview and can be edited, removed, reordered, and compared before one batch is applied."
    },
    {
      title: "Apply safely and undo",
      summary: "Studio rechecks targets, checkpoints the course, rebuilds generated courses when needed, validates the result, and can undo the last batch."
    },
    {
      title: "Keep ownership clear",
      summary: "Every edit is course-only; unsupported or unmapped content stays annotation-only, and existing exports are marked out of date until republished."
    }
  ]
};
