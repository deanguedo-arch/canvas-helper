import type {
  InspectionIssueCategory,
  InspectionResolution,
  InspectionResolveRequest,
  InspectionSelection
} from "../../../shared/inspection.js";
import type { PreviewMode } from "./types";

export type InspectionDraftState = {
  resolution: InspectionResolution | null;
  request: InspectionResolveRequest | null;
  resolving: boolean;
  teacherNote: string;
  issueCategory: InspectionIssueCategory;
  previewMode: PreviewMode;
};

export type InspectionDraftAction =
  | { type: "begin"; previewMode: PreviewMode }
  | { type: "commit"; request: InspectionResolveRequest | null; resolution: InspectionResolution }
  | { type: "finish" }
  | { type: "clear-result" }
  | { type: "reset"; previewMode: PreviewMode; resetTeacherInput: boolean }
  | { type: "replace-selection"; selection: InspectionSelection }
  | { type: "teacher-note"; value: string }
  | { type: "issue-category"; value: InspectionIssueCategory };

export type InspectionScopeRun = {
  scopeVersion: number;
  signal: AbortSignal;
  isCurrent: () => boolean;
};

/**
 * Owns the lifetime of asynchronous source resolution independently from
 * React rendering. Starting a new selection, changing course, or unmounting
 * aborts the previous request and makes every older completion stale.
 */
export function createInspectionScopeController() {
  let scopeVersion = 0;
  let activeController: AbortController | null = null;

  return {
    begin(): InspectionScopeRun {
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;
      scopeVersion += 1;
      const runVersion = scopeVersion;
      return {
        scopeVersion: runVersion,
        signal: controller.signal,
        isCurrent: () => scopeVersion === runVersion && !controller.signal.aborted
      };
    },
    complete(runVersion: number) {
      if (scopeVersion !== runVersion) return false;
      activeController = null;
      return true;
    },
    reset() {
      activeController?.abort();
      activeController = null;
      scopeVersion += 1;
      return scopeVersion;
    },
    currentVersion() {
      return scopeVersion;
    },
    isCurrent(runVersion: number) {
      return scopeVersion === runVersion;
    }
  };
}

export function createInspectionDraftState(previewMode: PreviewMode): InspectionDraftState {
  return {
    resolution: null,
    request: null,
    resolving: false,
    teacherNote: "",
    issueCategory: "unsure",
    previewMode
  };
}

export function inspectionDraftReducer(
  state: InspectionDraftState,
  action: InspectionDraftAction
): InspectionDraftState {
  if (action.type === "begin") {
    return {
      ...state,
      previewMode: action.previewMode,
      resolution: null,
      request: null,
      resolving: true
    };
  }
  if (action.type === "commit") {
    return {
      ...state,
      resolution: action.resolution,
      request: action.request,
      resolving: false
    };
  }
  if (action.type === "finish") {
    return state.resolving ? { ...state, resolving: false } : state;
  }
  if (action.type === "clear-result") {
    return { ...state, resolution: null, request: null, resolving: false };
  }
  if (action.type === "reset") {
    return {
      ...state,
      previewMode: action.previewMode,
      resolution: null,
      request: null,
      resolving: false,
      teacherNote: action.resetTeacherInput ? "" : state.teacherNote,
      issueCategory: action.resetTeacherInput ? "unsure" : state.issueCategory
    };
  }
  if (action.type === "replace-selection") {
    return {
      ...state,
      resolution: state.resolution
        ? { ...state.resolution, selection: action.selection }
        : null,
      request: state.request
        ? { ...state.request, selection: action.selection }
        : null
    };
  }
  if (action.type === "teacher-note") {
    return { ...state, teacherNote: action.value };
  }
  return { ...state, issueCategory: action.value };
}
