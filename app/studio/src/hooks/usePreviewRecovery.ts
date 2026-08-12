import { useCallback, useEffect, useRef, useState } from "react";

import type { PreviewDiagnostic } from "../../../shared/preview-bridge.js";
import {
  isPreviewPreflightResponse,
  type PreviewContentHealth
} from "../../../shared/preview-health.js";
import {
  normalizePreviewPageIdentity,
  normalizePreviewPageRouteIdentity
} from "../../../shared/preview-path.js";
import {
  createPreviewRecoveryState,
  type PreviewRecoveryState
} from "../lib/preview-recovery";
import { previewModes, type PreviewMode } from "../lib/types";
import { beginStudioPerformanceMeasure } from "../lib/studio-performance";

type PreviewModeRecord<T> = Record<PreviewMode, T>;

const emptySources: PreviewModeRecord<string> = { reference: "", workspace: "" };

function previewScope(value: string) {
  return normalizePreviewPageRouteIdentity(value)?.split("\u001f", 1)[0] ?? "";
}

function isSamePreviewScope(left: string, right: string) {
  const leftScope = previewScope(left);
  return Boolean(leftScope && leftScope === previewScope(right));
}

function hasRecoverableRuntimeFailure(state: PreviewRecoveryState) {
  return state.phase === "error" && (
    state.code === "bridge-timeout" ||
    state.code === "runtime-empty" ||
    state.code === "runtime-failure"
  );
}

export function usePreviewRecovery(options: {
  previewSources?: PreviewModeRecord<string>;
  enabled?: PreviewModeRecord<boolean>;
}) {
  const previewSources = options.previewSources ?? emptySources;
  const enabled = options.enabled ?? { reference: true, workspace: true };
  const [retryVersions, setRetryVersions] = useState<PreviewModeRecord<number>>({ reference: 0, workspace: 0 });
  const [states, setStates] = useState<PreviewModeRecord<PreviewRecoveryState>>({
    reference: createPreviewRecoveryState(),
    workspace: createPreviewRecoveryState()
  });
  const currentStates = previewModes.reduce<PreviewModeRecord<PreviewRecoveryState>>((resolved, mode) => {
    const previewUrl = enabled[mode] ? previewSources[mode] : "";
    const state = states[mode];
    resolved[mode] = state.previewUrl === previewUrl && state.attempt === retryVersions[mode]
      ? state
      : createPreviewRecoveryState(previewUrl, retryVersions[mode]);
    return resolved;
  }, { reference: createPreviewRecoveryState(), workspace: createPreviewRecoveryState() });
  const statesRef = useRef(states);
  statesRef.current = currentStates;
  const activeHrefRefs = useRef<PreviewModeRecord<string>>({ reference: "", workspace: "" });
  const timeoutRefs = useRef<PreviewModeRecord<number>>({ reference: 0, workspace: 0 });
  const performanceMeasureRefs = useRef<PreviewModeRecord<ReturnType<typeof beginStudioPerformanceMeasure> | null>>({ reference: null, workspace: null });

  const cancelPerformanceMeasure = useCallback((mode: PreviewMode) => {
    performanceMeasureRefs.current[mode]?.cancel();
    performanceMeasureRefs.current[mode] = null;
  }, []);

  const finishPerformanceMeasure = useCallback((mode: PreviewMode) => {
    performanceMeasureRefs.current[mode]?.finish();
    performanceMeasureRefs.current[mode] = null;
  }, []);

  const clearModeTimeout = useCallback((mode: PreviewMode) => {
    if (timeoutRefs.current[mode]) {
      window.clearTimeout(timeoutRefs.current[mode]);
      timeoutRefs.current[mode] = 0;
    }
  }, []);

  const scheduleTimeout = useCallback((mode: PreviewMode, previewUrl: string, attempt: number, stage: "bridge" | "content") => {
    clearModeTimeout(mode);
    timeoutRefs.current[mode] = window.setTimeout(() => {
      timeoutRefs.current[mode] = 0;
      finishPerformanceMeasure(mode);
      setStates((current) => {
        const state = current[mode];
        if (state.previewUrl !== previewUrl || state.attempt !== attempt || state.phase === "ready" || state.phase === "warning" || state.phase === "error") {
          return current;
        }
        const message = stage === "bridge"
          ? "This page opened, but Studio could not connect to it."
          : "This page opened, but its course content did not appear.";
        return {
          ...current,
          [mode]: {
            ...state,
            phase: "error",
            code: stage === "bridge" ? "bridge-timeout" : "runtime-empty",
            message,
            details: [...state.details, stage === "bridge"
              ? "The isolated preview did not complete its Studio bridge handshake."
              : "No content report arrived from the isolated preview."].slice(0, 8)
          }
        };
      });
    }, stage === "bridge" ? 8_000 : 10_000);
  }, [clearModeTimeout, finishPerformanceMeasure]);

  useEffect(() => {
    const controllers: AbortController[] = [];

    for (const mode of previewModes) {
      clearModeTimeout(mode);
      const previewUrl = previewSources[mode];
      const attempt = retryVersions[mode];
      cancelPerformanceMeasure(mode);
      if (!enabled[mode] || !previewUrl) {
        activeHrefRefs.current[mode] = "";
        setStates((current) => ({ ...current, [mode]: createPreviewRecoveryState("", attempt) }));
        continue;
      }

      const controller = new AbortController();
      controllers.push(controller);
      const performanceMeasure = beginStudioPerformanceMeasure("preview-ready");
      performanceMeasureRefs.current[mode] = performanceMeasure;
      activeHrefRefs.current[mode] = normalizePreviewPageIdentity(previewUrl) ?? "";
      setStates((current) => ({ ...current, [mode]: createPreviewRecoveryState(previewUrl, attempt) }));

      void fetch("/api/preview/preflight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previewUrl }),
        cache: "no-store",
        signal: controller.signal
      }).then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !isPreviewPreflightResponse(payload)) {
          const error = payload && typeof payload === "object" && typeof (payload as { error?: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "Studio could not check this page before opening it.";
          throw new Error(error);
        }
        setStates((current) => {
          const state = current[mode];
          if (state.previewUrl !== previewUrl || state.attempt !== attempt) return current;
          if (payload.status === "error") {
            finishPerformanceMeasure(mode);
            return {
              ...current,
              [mode]: {
                ...state,
                phase: "error",
                code: payload.code,
                message: payload.message,
                details: payload.details,
                runtimeFamily: payload.runtimeFamily
              }
            };
          }
          return {
            ...current,
            [mode]: {
              ...state,
              phase: "loading",
              code: payload.code,
              message: payload.message,
              details: payload.details,
              runtimeFamily: payload.runtimeFamily,
              preflightWarning: payload.status === "warning"
            }
          };
        });
        if (payload.status !== "error") scheduleTimeout(mode, previewUrl, attempt, "bridge");
      }).catch((error) => {
        if (controller.signal.aborted) return;
        finishPerformanceMeasure(mode);
        setStates((current) => {
          const state = current[mode];
          if (state.previewUrl !== previewUrl || state.attempt !== attempt) return current;
          return {
            ...current,
            [mode]: {
              ...state,
              phase: "error",
              code: "unreadable-page",
              message: "Studio could not safely check this page before opening it.",
              details: [error instanceof Error ? error.message : "The bounded preview check failed."]
            }
          };
        });
      });
    }

    return () => {
      controllers.forEach((controller) => controller.abort());
      previewModes.forEach((mode) => {
        cancelPerformanceMeasure(mode);
      });
    };
  }, [cancelPerformanceMeasure, clearModeTimeout, enabled.reference, enabled.workspace, finishPerformanceMeasure, previewSources.reference, previewSources.workspace, retryVersions.reference, retryVersions.workspace, scheduleTimeout]);

  useEffect(() => () => {
    previewModes.forEach(clearModeTimeout);
  }, [clearModeTimeout]);

  const markFrameLoaded = useCallback((mode: PreviewMode) => {
    setStates((current) => {
      const state = current[mode];
      if (state.phase !== "loading") return current;
      return { ...current, [mode]: { ...state, phase: "checking" } };
    });
  }, []);

  const markBridgeReady = useCallback((mode: PreviewMode, href: string) => {
    const state = statesRef.current[mode];
    const activeHref = normalizePreviewPageIdentity(href);
    if (
      !state.previewUrl ||
      !activeHref ||
      !isSamePreviewScope(state.previewUrl, activeHref) ||
      state.phase === "idle" ||
      state.phase === "preflight" ||
      (state.phase === "error" && !hasRecoverableRuntimeFailure(state))
    ) return;
    activeHrefRefs.current[mode] = activeHref;
    setStates((current) => {
      const next = current[mode];
      return next.previewUrl === state.previewUrl && next.attempt === state.attempt
        ? { ...current, [mode]: { ...next, phase: "checking", activeHref } }
        : current;
    });
    scheduleTimeout(mode, state.previewUrl, state.attempt, "content");
  }, [scheduleTimeout]);

  const markContentHealth = useCallback((mode: PreviewMode, health: PreviewContentHealth) => {
    const healthHref = normalizePreviewPageIdentity(health.href);
    const active = statesRef.current[mode];
    if (
      !healthHref ||
      !active.previewUrl ||
      active.phase === "idle" ||
      active.phase === "preflight" ||
      !isSamePreviewScope(active.previewUrl, healthHref) ||
      (activeHrefRefs.current[mode] && activeHrefRefs.current[mode] !== healthHref)
    ) return;
    clearModeTimeout(mode);
    finishPerformanceMeasure(mode);
    setStates((current) => {
      const state = current[mode];
      if (
        !state.previewUrl ||
        state.phase === "idle" ||
        state.phase === "preflight" ||
        !isSamePreviewScope(state.previewUrl, healthHref) ||
        (state.activeHref && state.activeHref !== healthHref)
      ) return current;
      if (health.status === "empty") {
        const hasRuntimeFailure = state.diagnostics.some((diagnostic) => diagnostic.kind !== "asset-error");
        return {
          ...current,
          [mode]: {
            ...state,
            phase: "error",
            code: hasRuntimeFailure ? "runtime-failure" : "runtime-empty",
            message: hasRuntimeFailure
              ? "This page could not finish loading its course content."
              : "This page opened, but its course content did not appear.",
            details: [...state.details, "No meaningful course text or visual content appeared after the page loaded."].slice(0, 8)
          }
        };
      }
      const hasIssue = state.preflightWarning || state.diagnostics.length > 0;
      return {
        ...current,
        [mode]: {
          ...state,
          phase: hasIssue ? "warning" : "ready",
          message: hasIssue
            ? state.message || "The page loaded, but Studio noticed an issue."
            : ""
        }
      };
    });
  }, [clearModeTimeout, finishPerformanceMeasure]);

  const addDiagnostic = useCallback((mode: PreviewMode, diagnostic: PreviewDiagnostic) => {
    const diagnosticHref = normalizePreviewPageIdentity(diagnostic.href);
    if (!diagnosticHref || (activeHrefRefs.current[mode] && activeHrefRefs.current[mode] !== diagnosticHref)) return;
    setStates((current) => {
      const state = current[mode];
      if (
        !state.previewUrl ||
        state.phase === "idle" ||
        state.phase === "preflight" ||
        (state.phase === "error" && !hasRecoverableRuntimeFailure(state)) ||
        !isSamePreviewScope(state.previewUrl, diagnosticHref) ||
        (state.activeHref && state.activeHref !== diagnosticHref)
      ) return current;
      const diagnostics = state.diagnostics.some((item) => item.kind === diagnostic.kind && item.message === diagnostic.message)
        ? state.diagnostics
        : [...state.diagnostics, diagnostic].slice(-5);
      return {
        ...current,
        [mode]: {
          ...state,
          diagnostics,
          phase: state.phase === "ready" ? "warning" : state.phase,
          message: state.message || "The page loaded, but Studio noticed an issue."
        }
      };
    });
  }, []);

  const markNavigation = useCallback((mode: PreviewMode, href: string) => {
    const active = statesRef.current[mode];
    const activeHref = normalizePreviewPageIdentity(href);
    if (
      !active.previewUrl ||
      !activeHref ||
      !isSamePreviewScope(active.previewUrl, activeHref) ||
      active.phase === "idle" ||
      active.phase === "preflight" ||
      (active.phase === "error" && !hasRecoverableRuntimeFailure(active))
    ) return;
    activeHrefRefs.current[mode] = activeHref;
    scheduleTimeout(mode, active.previewUrl, active.attempt, "content");
    setStates((current) => {
      const state = current[mode];
      if (
        !state.previewUrl ||
        state.phase === "idle" ||
        state.phase === "preflight" ||
        (state.phase === "error" && !hasRecoverableRuntimeFailure(state))
      ) return current;
      return {
        ...current,
        [mode]: {
          ...state,
          phase: "checking",
          activeHref,
          diagnostics: [],
          message: state.preflightWarning ? state.message : ""
        }
      };
    });
  }, [scheduleTimeout]);

  const retry = useCallback((mode: PreviewMode) => {
    clearModeTimeout(mode);
    cancelPerformanceMeasure(mode);
    setRetryVersions((current) => ({ ...current, [mode]: current[mode] + 1 }));
  }, [cancelPerformanceMeasure, clearModeTimeout]);

  return {
    states: currentStates,
    markFrameLoaded,
    markBridgeReady,
    markContentHealth,
    addDiagnostic,
    markNavigation,
    retry
  };
}
