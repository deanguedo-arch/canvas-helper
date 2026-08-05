export type CourseBuildBriefStatus = "ready" | "attention" | "proposal-only" | "blocked";

export type CourseBuildBriefIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

/**
 * A compact, server-derived summary of how one course can safely be changed.
 * It intentionally contains paths and commands only, never file contents.
 */
export type CourseBuildBrief = {
  projectSlug: string;
  status: CourseBuildBriefStatus;
  driver: string | null;
  mode: "direct" | "factory" | "proposal-only" | null;
  editableSources: string[];
  sharedSources: string[];
  generatedOutput: boolean;
  rebuildCommand: string | null;
  validationCommand: string;
  issues: CourseBuildBriefIssue[];
};
