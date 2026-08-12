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
  date: "August 11, 2026",
  title: "Precision review workflow",
  summary: "A faster, steadier way to inspect any course, collect visual feedback, and hand one verified review to Codex.",
  notes: [
    {
      title: "Annotate in place",
      summary: "Select course content with a pointer or keyboard, add a plain-language note, and keep up to three marked screenshots with it."
    },
    {
      title: "Keep the review together",
      summary: "Review Sets now stay with each course, survive Studio and Full Preview changes, and can be named, reorganized, exported, or restored."
    },
    {
      title: "Recover instead of guessing",
      summary: "Blank, delayed, or unsupported pages show a useful recovery path instead of appearing to work."
    },
    {
      title: "Move with confidence",
      summary: "Keyboard focus, narrow windows, large pages, and screenshot work now share explicit accessibility and performance checks."
    }
  ]
};
