export const STUDIO_PERFORMANCE_BUDGETS_MS = {
  previewReady: 2_000,
  selectionFeedback: 500,
  captureStatus: 2_500
} as const;

export const STUDIO_PERFORMANCE_DEADLINES_MS = {
  previewReady: 12_000,
  selectionFeedback: 2_000,
  captureStatus: 25_000
} as const;

export const STUDIO_REVIEW_CACHE_LIMITS = {
  projects: 40,
  sessionsPerProject: 8,
  itemsPerSession: 5,
  screenshotsPerItem: 3,
  screenshotsPerSession: 15,
  ttlDays: 7
} as const;

export type StudioPerformanceMeasure = "preview-ready" | "selection-feedback" | "capture-status";

export function studioPerformanceBudget(measure: StudioPerformanceMeasure) {
  if (measure === "preview-ready") return STUDIO_PERFORMANCE_BUDGETS_MS.previewReady;
  if (measure === "selection-feedback") return STUDIO_PERFORMANCE_BUDGETS_MS.selectionFeedback;
  return STUDIO_PERFORMANCE_BUDGETS_MS.captureStatus;
}

export function studioPerformanceDeadline(measure: StudioPerformanceMeasure) {
  if (measure === "preview-ready") return STUDIO_PERFORMANCE_DEADLINES_MS.previewReady;
  if (measure === "selection-feedback") return STUDIO_PERFORMANCE_DEADLINES_MS.selectionFeedback;
  return STUDIO_PERFORMANCE_DEADLINES_MS.captureStatus;
}
