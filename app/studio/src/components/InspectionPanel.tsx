import { INSPECTION_ISSUE_CATEGORIES, type InspectionIssueCategory, type InspectionResolution } from "../../../shared/inspection.js";
import type { AnnotationRect, ScreenshotAnnotation as ScreenshotAnnotationState } from "../hooks/useScreenshotAnnotation";
import { ScreenshotAnnotation } from "./ScreenshotAnnotation";

type InspectionPanelProps = {
  inspectEnabled: boolean;
  resolution: InspectionResolution | null;
  resolving: boolean;
  teacherNote: string;
  issueCategory: InspectionIssueCategory;
  packet: string;
  packetError: string;
  copyStatus: string;
  screenshotSupported: boolean;
  screenshotCanCapture: boolean;
  screenshotStatus: "idle" | "capturing" | "ready" | "error";
  screenshotError: string;
  screenshot: ScreenshotAnnotationState | null;
  onTeacherNoteChange: (value: string) => void;
  onIssueCategoryChange: (value: InspectionIssueCategory) => void;
  onCopyPacket: () => void;
  onCaptureScreenshot: () => void;
  onScreenshotMarkerChange: (marker: AnnotationRect) => void;
  onDownloadScreenshot: () => void;
  onDiscardScreenshot: () => void;
};

export function InspectionPanel({
  inspectEnabled,
  resolution,
  resolving,
  teacherNote,
  issueCategory,
  packet,
  packetError,
  copyStatus,
  screenshotSupported,
  screenshotCanCapture,
  screenshotStatus,
  screenshotError,
  screenshot,
  onTeacherNoteChange,
  onIssueCategoryChange,
  onCopyPacket,
  onCaptureScreenshot,
  onScreenshotMarkerChange,
  onDownloadScreenshot,
  onDiscardScreenshot
}: InspectionPanelProps) {
  return (
    <div className="panel-card inspection-panel" data-testid="inspection-panel">
      <div className="section-header">
        <h3>Inspect for Codex</h3>
        <span className={inspectEnabled ? "inspection-state enabled" : "inspection-state"}>
          {inspectEnabled ? "Selecting" : "Off"}
        </span>
      </div>

      {!inspectEnabled ? (
        <p className="empty-state">Turn on Inspect, then click a course element. Inspect blocks the course action while it is on.</p>
      ) : null}
      {resolving ? <p className="empty-state" role="status">Resolving local source ownership…</p> : null}
      {resolution ? (
        <div className="inspection-details">
          <dl>
            <div>
              <dt>Resolution</dt>
              <dd data-testid="inspection-resolution">{resolution.resolution}</dd>
            </div>
            <div>
              <dt>Freshness</dt>
              <dd>{resolution.freshness}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{resolution.artifactRole}</dd>
            </div>
          </dl>

          <p className="inspection-target">
            <strong>Primary target</strong>
            <code>
              {resolution.primaryEditTarget
                ? `${resolution.primaryEditTarget}${resolution.primaryEditLine ? `:${resolution.primaryEditLine}` : ""}`
                : "No safe edit target resolved."}
            </code>
          </p>
          {resolution.rebuildCommand ? (
            <p className="inspection-target">
              <strong>Rebuild</strong>
              <code>{resolution.rebuildCommand}</code>
            </p>
          ) : null}
          {resolution.warnings.map((warning) => (
            <p key={warning} className="inspection-warning">
              {warning}
            </p>
          ))}

          <label className="inspection-category">
            <span>What kind of change is this?</span>
            <select value={issueCategory} onChange={(event) => onIssueCategoryChange(event.target.value as InspectionIssueCategory)} data-testid="inspection-category">
              {INSPECTION_ISSUE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category[0].toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="inspection-note">
            <span>What should Codex change?</span>
            <textarea
              value={teacherNote}
              onChange={(event) => onTeacherNoteChange(event.target.value)}
              placeholder="For example: make this explanation clearer for Grade 11."
              rows={3}
              data-testid="inspection-teacher-note"
            />
          </label>

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
            <span>Your browser will ask what to share—choose this Studio tab. Canvas Helper captures one frame locally and downloads nothing until you review it.</span>
          </div>
          {!screenshotSupported ? <p className="inspection-warning">This browser does not offer tab screenshot capture.</p> : null}
          {!screenshotCanCapture ? <p className="inspection-warning">Select a source-mapped preview element before capturing a screenshot.</p> : null}
          {screenshotError ? <p className="inspection-warning">{screenshotError}</p> : null}
          {screenshot ? (
            <ScreenshotAnnotation
              annotation={screenshot}
              onMarkerChange={onScreenshotMarkerChange}
              onDownload={onDownloadScreenshot}
              onDiscard={onDiscardScreenshot}
            />
          ) : null}

          {packetError ? <p className="inspection-warning">{packetError}</p> : null}
          {packet ? <pre className="inspection-packet" data-testid="inspection-packet">{packet}</pre> : null}
          <div className="inspection-actions">
            <button
              type="button"
              className="ghost-button compact active-toggle"
              disabled={!packet || Boolean(packetError)}
              onClick={onCopyPacket}
              data-testid="copy-for-codex"
            >
              Copy for Codex
            </button>
            {copyStatus ? <span className="inspection-copy-status" role="status">{copyStatus}</span> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
