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
  date: "August 13, 2026",
  title: "Safe course editing",
  summary: "Eligible courses can now collect, review, apply, and undo routine teacher changes directly in Studio or Full Preview.",
  notes: [
    {
      title: "See and edit in place",
      summary: "Mapped areas show the available action; use text, links, safe images, curated styles, or course rename, while unsupported content routes to Annotate."
    },
    {
      title: "Review before applying",
      summary: "Drafts persist without silent expiry, reopen across Studio and Full Preview, show visual comparisons, and support local backup."
    },
    {
      title: "Apply safely and undo",
      summary: "Studio atomically locks and journals each batch, preserves unknown crash-recovery changes, validates the settled learner result, and refuses Undo after newer work."
    },
    {
      title: "Bring the source-backed catalog forward",
      summary: "Active source-backed, new, and imported courses use explicit ownership; runtime content routes to Annotate, packages stay protected, and target inputs plus artifact bytes track exports."
    }
  ]
};
