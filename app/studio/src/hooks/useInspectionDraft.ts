import { useCallback, useEffect, useReducer, useRef } from "react";

import type {
  InspectionIssueCategory,
  InspectionResolution,
  InspectionResolveRequest,
  InspectionSelection
} from "../../../shared/inspection.js";
import type { PreviewInspectPayload } from "../../../shared/preview-bridge.js";
import {
  createInspectionDraftState,
  createInspectionScopeController,
  inspectionDraftReducer
} from "../lib/inspection-draft";
import { beginStudioPerformanceMeasure } from "../lib/studio-performance";
import type { PreviewMode } from "../lib/types";

type InspectionSource = "embedded" | "standalone";

export function useInspectionDraft(initialPreviewMode: PreviewMode) {
  const [state, dispatch] = useReducer(
    inspectionDraftReducer,
    initialPreviewMode,
    createInspectionDraftState
  );
  const sourceRef = useRef<InspectionSource>("embedded");
  const scopeControllerRef = useRef<ReturnType<typeof createInspectionScopeController> | null>(null);
  if (!scopeControllerRef.current) scopeControllerRef.current = createInspectionScopeController();
  const performanceRef = useRef<ReturnType<typeof beginStudioPerformanceMeasure> | null>(null);

  const begin = useCallback((
    previewMode: PreviewMode,
    source: InspectionSource,
    selection: Pick<PreviewInspectPayload, "interactionStartedAt">
  ) => {
    performanceRef.current?.cancel();
    const performance = beginStudioPerformanceMeasure("selection-feedback", selection.interactionStartedAt);
    performanceRef.current = performance;
    const scopeRun = scopeControllerRef.current!.begin();
    sourceRef.current = source;
    dispatch({ type: "begin", previewMode });
    return {
      ...scopeRun,
      performance,
    };
  }, []);

  const commit = useCallback((
    scopeVersion: number,
    request: InspectionResolveRequest | null,
    resolution: InspectionResolution
  ) => {
    if (!scopeControllerRef.current!.complete(scopeVersion)) return false;
    dispatch({ type: "commit", request, resolution });
    return true;
  }, []);

  const finish = useCallback((scopeVersion: number) => {
    if (!scopeControllerRef.current!.complete(scopeVersion)) return false;
    dispatch({ type: "finish" });
    return true;
  }, []);

  const clearResult = useCallback((scopeVersion?: number) => {
    if (scopeVersion !== undefined && !scopeControllerRef.current!.isCurrent(scopeVersion)) return false;
    dispatch({ type: "clear-result" });
    return true;
  }, []);

  const reset = useCallback((previewMode: PreviewMode, resetTeacherInput = false) => {
    performanceRef.current?.cancel();
    performanceRef.current = null;
    scopeControllerRef.current!.reset();
    sourceRef.current = "embedded";
    dispatch({ type: "reset", previewMode, resetTeacherInput });
  }, []);

  const replaceSelection = useCallback((selection: InspectionSelection) => {
    dispatch({ type: "replace-selection", selection });
  }, []);

  const finishVisibleFeedback = useCallback(() => {
    const performance = performanceRef.current;
    if (!performance) return false;
    performance.finish();
    performanceRef.current = null;
    return true;
  }, []);

  const setTeacherNote = useCallback((value: string) => {
    dispatch({ type: "teacher-note", value });
  }, []);

  const setIssueCategory = useCallback((value: InspectionIssueCategory) => {
    dispatch({ type: "issue-category", value });
  }, []);

  const currentScopeVersion = useCallback(() => scopeControllerRef.current!.currentVersion(), []);
  const isCurrentScope = useCallback((scopeVersion: number) => scopeControllerRef.current!.isCurrent(scopeVersion), []);
  const currentSource = useCallback(() => sourceRef.current, []);

  useEffect(() => () => {
    performanceRef.current?.cancel();
    scopeControllerRef.current?.reset();
  }, []);

  return {
    ...state,
    begin,
    commit,
    finish,
    clearResult,
    reset,
    replaceSelection,
    finishVisibleFeedback,
    setTeacherNote,
    setIssueCategory,
    currentScopeVersion,
    isCurrentScope,
    currentSource
  };
}
