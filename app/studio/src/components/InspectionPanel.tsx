import type { InspectionResolution } from "../../../shared/inspection.js";
import type { AnnotationRect, ScreenshotAnnotation as ScreenshotAnnotationState } from "../hooks/useScreenshotAnnotation";
import { ScreenshotAnnotation } from "./ScreenshotAnnotation";

type InspectionPanelProps = {
  inspectEnabled: boolean;
  resolution: InspectionResolution | null;
  resolving: boolean;
  teacherNote: string;
  canSave: boolean;
  saveDisabledReason: string;
  screenshotSupported: boolean;
  screenshotCanCapture: boolean;
  screenshotStatus: "idle" | "capturing" | "ready" | "error";
  screenshotError: string;
  screenshot: ScreenshotAnnotationState | null;
  onTeacherNoteChange: (value: string) => void;
  onSave: () => void;
  onCaptureScreenshot: () => void;
  onScreenshotMarkerChange: (marker: AnnotationRect) => void;
  onDownloadScreenshot: () => void;
  onDiscardScreenshot: () => void;
};

function selectionLabel(resolution: InspectionResolution) {
  const visibleText = resolution.selection.visibleText.replace(/\s+/g, " ").trim();
  return visibleText || `Selected ${resolution.selection.tagName || "course element"}`;
}

export function InspectionPanel({
  inspectEnabled,
  resolution,
  resolving,
  teacherNote,
  canSave,
  saveDisabledReason,
  screenshotSupported,
  screenshotCanCapture,
  screenshotStatus,
  screenshotError,
  screenshot,
  onTeacherNoteChange,
  onSave,
  onCaptureScreenshot,
  onScreenshotMarkerChange,
  onDownloadScreenshot,
  onDiscardScreenshot
}: InspectionPanelProps) {
  return (
    <section className="panel-card inspection-panel" data-testid="inspection-panel">
      <div className="section-header">
        <h3>New annotation</h3>
        <span className={inspectEnabled ? "inspection-state enabled" : "inspection-state"}>
          {inspectEnabled ? "Inspect on" : "Inspect off"}
        </span>
      </div>

      {!inspectEnabled ? (
        <p className="empty-state">Turn on Inspect, then click anything in the course preview.</p>
      ) : null}
      {resolving ? <p className="empty-state" role="status">Getting your selection ready…</p> : null}

      {resolution ? (
        <div className="inspection-details">
          <p className="inspection-selection-summary" data-testid="inspection-selection-summary">
            <strong>Selected</strong>
            <span>{selectionLabel(resolution)}</span>
          </p>

          <label className="inspection-note">
            <span>What should change?</span>
            <textarea
              value={teacherNote}
              onChange={(event) => onTeacherNoteChange(event.target.value)}
              placeholder="Write your note for Codex…"
              rows={3}
              data-testid="inspection-teacher-note"
            />
          </label>

          <div className="inspection-actions">
            <button
              type="button"
              className="ghost-button compact active-toggle"
              disabled={!canSave}
              onClick={onSave}
              data-testid="add-to-review-set"
            >
              Save annotation
            </button>
            {!canSave && saveDisabledReason ? <span className="inspection-copy-status">{saveDisabledReason}</span> : null}
          </div>

          <div className="inspection-screenshot-option">
            <span>Add a screenshot (optional)</span>
            <div className="inspection-capture">
              <button
                type="button"
                className="ghost-button compact"
                disabled={!screenshotSupported || !screenshotCanCapture || screenshotStatus === "capturing"}
                onClick={onCaptureScreenshot}
                data-testid="capture-annotated-screenshot"
              >
                {screenshotStatus === "capturing" ? "Waiting for tab…" : "Screenshot + annotate"}
              </button>
              <span>Choose this Studio tab when your browser asks what to share.</span>
            </div>
          </div>
          {!screenshotSupported ? <p className="inspection-warning">Screenshots are not available in this browser.</p> : null}
          {screenshotError ? <p className="inspection-warning">{screenshotError}</p> : null}
          {screenshot ? (
            <ScreenshotAnnotation
              annotation={screenshot}
              onMarkerChange={onScreenshotMarkerChange}
              onDownload={onDownloadScreenshot}
              onDiscard={onDiscardScreenshot}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
