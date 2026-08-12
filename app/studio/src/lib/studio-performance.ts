import {
  studioPerformanceBudget,
  type StudioPerformanceMeasure
} from "../../../shared/studio-quality.js";

export const STUDIO_PERFORMANCE_EVENT = "canvas-helper:studio-performance";

export type StudioPerformanceDetail = {
  measure: StudioPerformanceMeasure;
  durationMs: number;
  budgetMs: number;
  withinBudget: boolean;
};

export function beginStudioPerformanceMeasure(measure: StudioPerformanceMeasure, startedAtOverride?: number) {
  const usesWallClock = typeof startedAtOverride === "number" && startedAtOverride > 1_000_000_000_000;
  const currentTime = usesWallClock
    ? Date.now()
    : typeof performance !== "undefined" ? performance.now() : Date.now();
  const startedAt = typeof startedAtOverride === "number" && Number.isFinite(startedAtOverride) && startedAtOverride >= 0 && startedAtOverride <= currentTime
    ? startedAtOverride
    : currentTime;
  let settled = false;
  const finish = () => {
    if (settled) return null;
    settled = true;
    const endedAt = usesWallClock
      ? Date.now()
      : typeof performance !== "undefined" ? performance.now() : Date.now();
    const durationMs = Math.max(0, endedAt - startedAt);
    const budgetMs = studioPerformanceBudget(measure);
    const detail: StudioPerformanceDetail = {
      measure,
      durationMs,
      budgetMs,
      withinBudget: durationMs <= budgetMs
    };
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent<StudioPerformanceDetail>(STUDIO_PERFORMANCE_EVENT, { detail }));
    }
    return detail;
  };
  const cancel = () => {
    settled = true;
  };
  return { finish, cancel };
}
