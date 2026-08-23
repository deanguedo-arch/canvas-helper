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

export const STUDIO_PREVIEW_RECOVERY_DEADLINES_MS = {
  bridgeHandshake: 50_000,
  contentHealth: 10_000,
  contractReady: 60_000
} as const;

/**
 * Canonical Studio review limits. Browser, bridge, server, storage, and packet
 * code may re-export compatibility names, but the numbers live here only.
 * UTF-8 byte ceilings protect persisted/copied content. Code-unit ceilings
 * protect DOM inputs, bridge payload fields, and serialized localStorage text.
 */
export const STUDIO_REVIEW_LIMITS = {
  projects: 40,
  sessionsPerProject: 8,
  itemsPerSession: 5,
  screenshotsPerItem: 3,
  screenshotsPerSession: 15,
  ttlDays: 7,
  noteUtf8Bytes: 256,
  excerptUtf8Bytes: 256,
  labelUtf8Bytes: 64,
  sessionNameUtf8Bytes: 80,
  sessionNameCodeUnits: 80,
  identifierCodeUnits: 160,
  sessionIdMinCodeUnits: 16,
  sessionIdMaxCodeUnits: 80,
  repoPathCodeUnits: 1_024,
  resolutionListItems: 24,
  setStorageCodeUnits: 160_000,
  workbenchStorageCodeUnits: 1_200_000,
  screenshotTotalFiles: 150,
  screenshotTotalBytes: 100 * 1024 * 1024,
  inspectionSourceCacheEntries: 24
} as const;

export const STUDIO_SCREENSHOT_LIMITS = {
  bytes: 5 * 1024 * 1024,
  dimension: 8_192,
  pixels: 32_000_000
} as const;

export const STUDIO_BRIDGE_LIMITS = {
  messageUtf8Bytes: 64 * 1_024,
  visibleTextCodeUnits: 320,
  scrollContainers: 8,
  standaloneSessionTokenMinCodeUnits: 16,
  standaloneSessionTokenCodeUnits: 128,
  previewCapabilityTokenMinCodeUnits: 16,
  previewCapabilityTokenMaxCodeUnits: 80,
  reviewItemIdCodeUnits: 160,
  reviewNoteCodeUnits: 256,
  reviewExcerptCodeUnits: 320,
  reviewStatusCodeUnits: 240,
  reviewSessionNameCodeUnits: STUDIO_REVIEW_LIMITS.sessionNameCodeUnits,
  reviewLabelCodeUnits: 64,
  reviewPacketCodeUnits: 7_700,
  inspectRequestIdCodeUnits: 80,
  courseUrlCodeUnits: 2_048,
  elementTagCodeUnits: 48,
  elementRoleCodeUnits: 80,
  elementTestIdCodeUnits: 120,
  scrollSelectorCodeUnits: 260,
  diagnosticMessageCodeUnits: 360
} as const;

export const STUDIO_PACKET_LIMITS = {
  inspectionUtf8Bytes: 7_500,
  previewIssueUtf8Bytes: 6_000
} as const;

export const STUDIO_REVIEW_CACHE_LIMITS = {
  projects: STUDIO_REVIEW_LIMITS.projects,
  sessionsPerProject: STUDIO_REVIEW_LIMITS.sessionsPerProject,
  itemsPerSession: STUDIO_REVIEW_LIMITS.itemsPerSession,
  screenshotsPerItem: STUDIO_REVIEW_LIMITS.screenshotsPerItem,
  screenshotsPerSession: STUDIO_REVIEW_LIMITS.screenshotsPerSession,
  ttlDays: STUDIO_REVIEW_LIMITS.ttlDays
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
