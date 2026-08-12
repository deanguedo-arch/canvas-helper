import { useEffect, useState } from "react";

import type { PreviewRecoveryState } from "../lib/preview-recovery";
import type { PreviewMode } from "../lib/types";

type PreviewRecoveryPanelProps = {
  mode: PreviewMode;
  state: PreviewRecoveryState;
  onRetry: () => void;
  onOpenAnotherPage: () => void;
  onCopyIssue: () => Promise<void>;
};

export function PreviewRecoveryPanel({
  mode,
  state,
  onRetry,
  onOpenAnotherPage,
  onCopyIssue
}: PreviewRecoveryPanelProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied" | "error">("idle");

  useEffect(() => {
    setCopyStatus("idle");
  }, [state.attempt, state.code, state.phase]);

  const copy = async () => {
    if (copyStatus === "copying") return;
    setCopyStatus("copying");
    try {
      await onCopyIssue();
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  if (state.phase === "warning") {
    return (
      <div className="preview-recovery-notice" role="status" data-testid={`${mode}-preview-warning`}>
        <span>{state.message || "The page loaded, but Studio noticed an issue."}</span>
        <details>
          <summary>Details</summary>
          <PreviewTechnicalDetails state={state} />
        </details>
        <button type="button" onClick={onRetry}>Retry</button>
        <button type="button" onClick={() => void copy()} disabled={copyStatus === "copying"}>
          {copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy issue for Codex"}
        </button>
      </div>
    );
  }

  const waiting = state.phase === "idle" || state.phase === "preflight" || state.phase === "loading" || state.phase === "checking";
  if (waiting) {
    const message = state.phase === "preflight"
      ? "Checking this page before opening it."
      : state.phase === "checking"
        ? "Checking that the course content appeared."
        : "Opening the isolated course preview.";
    return (
      <div className="preview-recovery preview-recovery-waiting" role="status" data-testid={`${mode}-preview-checking`}>
        <span className="preview-recovery-spinner" aria-hidden="true" />
        <div>
          <h4>Preparing preview</h4>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  if (state.phase !== "error") return null;

  return (
    <div className="preview-recovery" role="alert" data-testid={`${mode}-preview-recovery`}>
      <div className="preview-recovery-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M12 8v4.5M12 16.25h.01M4.7 19h14.6a1.5 1.5 0 0 0 1.3-2.25L13.3 4.1a1.5 1.5 0 0 0-2.6 0L3.4 16.75A1.5 1.5 0 0 0 4.7 19Z" />
        </svg>
      </div>
      <div className="preview-recovery-copy">
        <p className="preview-recovery-eyebrow">Preview unavailable</p>
        <h4>{state.message || "Studio could not display this page."}</h4>
        <p>Your course files have not been changed.</p>
      </div>
      <div className="preview-recovery-actions">
        <button type="button" className="ghost-button compact active-toggle" onClick={onRetry}>Retry</button>
        <button type="button" className="ghost-button compact" onClick={onOpenAnotherPage}>Open another page</button>
        <button type="button" className="ghost-button compact" onClick={() => void copy()} disabled={copyStatus === "copying"}>
          {copyStatus === "copied" ? "Copied for Codex" : copyStatus === "error" ? "Copy failed" : "Copy issue for Codex"}
        </button>
      </div>
      <details className="preview-recovery-details">
        <summary>Details</summary>
        <PreviewTechnicalDetails state={state} />
      </details>
      <span className="sr-only" aria-live="polite">
        {copyStatus === "copied" ? "Preview issue copied for Codex." : copyStatus === "error" ? "Preview issue could not be copied." : ""}
      </span>
    </div>
  );
}

function PreviewTechnicalDetails({ state }: { state: PreviewRecoveryState }) {
  return (
    <div className="preview-recovery-technical">
      <p><strong>Code:</strong> {state.code}</p>
      <p><strong>Runtime:</strong> {state.runtimeFamily}</p>
      {state.details.length ? (
        <ul>
          {state.details.map((detail, index) => <li key={`${index}:${detail}`}>{detail}</li>)}
        </ul>
      ) : null}
      {state.diagnostics.length ? (
        <ul>
          {state.diagnostics.map((diagnostic, index) => (
            <li key={`${index}:${diagnostic.kind}:${diagnostic.message}`}>
              {diagnostic.kind}: {diagnostic.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
