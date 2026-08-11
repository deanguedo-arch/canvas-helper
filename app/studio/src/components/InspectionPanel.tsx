import type { InspectionIssueCategory, InspectionResolution } from "../../../shared/inspection.js";
import type { ScreenshotDraft } from "../hooks/useScreenshotAnnotation";
import { ScreenshotAnnotation } from "./ScreenshotAnnotation";

type InspectionPanelProps = {
  inspectEnabled: boolean;
  resolution: InspectionResolution | null;
  resolving: boolean;
  teacherNote: string;
  issueCategory: InspectionIssueCategory;
  canSave: boolean;
  saveDisabledReason: string;
  screenshotSupported: boolean;
  screenshotCanCapture: boolean;
  screenshotStatus: "idle" | "capturing" | "processing" | "ready" | "error";
  screenshotError: string;
  screenshots: ScreenshotDraft[];
  onTeacherNoteChange: (value: string) => void;
  onIssueCategoryChange: (value: InspectionIssueCategory) => void;
  onSave: () => void;
  onCaptureScreenshot: () => void;
  onCancelScreenshot: () => void;
  onCropScreenshot: (id: string) => void;
  onDownloadScreenshot: (id: string) => void;
  onDiscardScreenshot: (id: string) => void;
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
  issueCategory,
  canSave,
  saveDisabledReason,
  screenshotSupported,
  screenshotCanCapture,
  screenshotStatus,
  screenshotError,
  screenshots,
  onTeacherNoteChange,
  onIssueCategoryChange,
  onSave,
  onCaptureScreenshot,
  onCancelScreenshot,
  onCropScreenshot,
  onDownloadScreenshot,
  onDiscardScreenshot
}: InspectionPanelProps) {
  return (
    <section className="panel-card inspection-panel" data-testid="inspection-panel">
      <div className="section-header">
        <h3>New annotation</h3>
        <span className={inspectEnabled ? "inspection-state enabled" : "inspection-state"}>
          {inspectEnabled ? "Annotating" : resolution ? "Draft paused" : "Off"}
        </span>
      </div>

      {!inspectEnabled ? (
        <p className="empty-state">Turn on Annotate, then click an element or drag over an area in the course.</p>
      ) : null}
      {resolving ? <p className="empty-state" role="status">Getting your selection ready…</p> : null}

      {resolution ? (
        <div className="inspection-details">
          <p className="inspection-selection-summary" data-testid="inspection-selection-summary">
            <strong>Selected {resolution.selection.selectionKind === "area" ? "area" : "element"}</strong>
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

          <label className="inspection-concern">
            <span>Concern</span>
            <select value={issueCategory} onChange={(event) => onIssueCategoryChange(event.target.value as InspectionIssueCategory)}>
              <option value="content">Content</option>
              <option value="interaction">Interaction</option>
              <option value="layout">Responsive layout</option>
              <option value="accessibility">Accessibility</option>
              <option value="unsure">General</option>
            </select>
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
            <span>Add screenshots (optional)</span>
            <div className="inspection-capture">
              <button
                type="button"
                className="ghost-button compact"
                disabled={screenshotStatus === "processing" || (screenshotStatus !== "capturing" && (!screenshotSupported || !screenshotCanCapture))}
                onClick={screenshotStatus === "capturing" ? onCancelScreenshot : onCaptureScreenshot}
                data-testid="capture-annotated-screenshot"
              >
                {screenshotStatus === "capturing"
                  ? "Cancel capture"
                  : screenshotStatus === "processing" ? "Cropping…"
                  : screenshotStatus === "error" ? "Retry screenshot" : "Capture screenshot"}
              </button>
              <span>Captures only this course preview and marks the selected area. You can attach up to three.</span>
            </div>
          </div>
          {!screenshotSupported ? <p className="inspection-warning">Screenshots are not available in this browser.</p> : null}
          {screenshotError ? <p className="inspection-warning">{screenshotError}</p> : null}
          {screenshotStatus === "ready" ? <p className="inspection-capture-status" role="status">Screenshot ready to save.</p> : null}
          {screenshots.length ? (
            <ScreenshotAnnotation
              drafts={screenshots}
              onCrop={onCropScreenshot}
              onDownload={onDownloadScreenshot}
              onDiscard={onDiscardScreenshot}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
