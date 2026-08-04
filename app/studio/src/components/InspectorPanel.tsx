import { toCursorHref } from "../lib/projects";
import type { ProjectBundle } from "../lib/types";
import type { InspectionIssueCategory, InspectionResolution } from "../../../shared/inspection.js";
import type { AnnotationRect, ScreenshotAnnotation as ScreenshotAnnotationState } from "../hooks/useScreenshotAnnotation";
import type { ReviewSetItem } from "../lib/review-set";
import { InspectionPanel } from "./InspectionPanel";
import { ReviewSetPanel } from "./ReviewSetPanel";

type InspectorPanelProps = {
  selectedProject: ProjectBundle | null;
  sourceFiles: string[];
  onCopyToClipboard: (value: string) => Promise<void>;
  inspectEnabled: boolean;
  inspectionResolution: InspectionResolution | null;
  inspectionResolving: boolean;
  inspectionTeacherNote: string;
  inspectionIssueCategory: InspectionIssueCategory;
  inspectionPacket: string;
  inspectionPacketError: string;
  inspectionCopyStatus: string;
  screenshotSupported: boolean;
  screenshotCanCapture: boolean;
  screenshotStatus: "idle" | "capturing" | "ready" | "error";
  screenshotError: string;
  screenshot: ScreenshotAnnotationState | null;
  onInspectionTeacherNoteChange: (value: string) => void;
  onInspectionIssueCategoryChange: (value: InspectionIssueCategory) => void;
  onCopyInspectionPacket: () => void;
  onCaptureScreenshot: () => void;
  onScreenshotMarkerChange: (marker: AnnotationRect) => void;
  onDownloadScreenshot: () => void;
  onDiscardScreenshot: () => void;
  reviewSetItems: ReviewSetItem[];
  reviewSetCanAddCurrent: boolean;
  reviewSetAddDisabledReason: string;
  reviewSetStatus: string;
  reviewSetPreparing: boolean;
  reviewSetPacket: string;
  reviewSetPacketError: string;
  reviewSetCopyStatus: string;
  onAddCurrentInspectionToReviewSet: () => void;
  onClearReviewSet: () => void;
  onRemoveReviewSetItem: (id: string) => void;
  onMoveReviewSetItem: (id: string, direction: "up" | "down") => void;
  onReviewSetTeacherNoteChange: (id: string, value: string) => void;
  onDownloadReviewSetScreenshot: (id: string) => void;
  onRemoveReviewSetScreenshot: (id: string) => void;
  onPrepareReviewSet: () => void;
  onCopyReviewSet: () => void;
};

export function InspectorPanel({
  selectedProject,
  sourceFiles,
  onCopyToClipboard,
  inspectEnabled,
  inspectionResolution,
  inspectionResolving,
  inspectionTeacherNote,
  inspectionIssueCategory,
  inspectionPacket,
  inspectionPacketError,
  inspectionCopyStatus,
  screenshotSupported,
  screenshotCanCapture,
  screenshotStatus,
  screenshotError,
  screenshot,
  onInspectionTeacherNoteChange,
  onInspectionIssueCategoryChange,
  onCopyInspectionPacket,
  onCaptureScreenshot,
  onScreenshotMarkerChange,
  onDownloadScreenshot,
  onDiscardScreenshot,
  reviewSetItems,
  reviewSetCanAddCurrent,
  reviewSetAddDisabledReason,
  reviewSetStatus,
  reviewSetPreparing,
  reviewSetPacket,
  reviewSetPacketError,
  reviewSetCopyStatus,
  onAddCurrentInspectionToReviewSet,
  onClearReviewSet,
  onRemoveReviewSetItem,
  onMoveReviewSetItem,
  onReviewSetTeacherNoteChange,
  onDownloadReviewSetScreenshot,
  onRemoveReviewSetScreenshot,
  onPrepareReviewSet,
  onCopyReviewSet
}: InspectorPanelProps) {
  return (
    <section className="inspector">
      <InspectionPanel
        inspectEnabled={inspectEnabled}
        resolution={inspectionResolution}
        resolving={inspectionResolving}
        teacherNote={inspectionTeacherNote}
        issueCategory={inspectionIssueCategory}
        packet={inspectionPacket}
        packetError={inspectionPacketError}
        copyStatus={inspectionCopyStatus}
        screenshotSupported={screenshotSupported}
        screenshotCanCapture={screenshotCanCapture}
        screenshotStatus={screenshotStatus}
        screenshotError={screenshotError}
        screenshot={screenshot}
        onTeacherNoteChange={onInspectionTeacherNoteChange}
        onIssueCategoryChange={onInspectionIssueCategoryChange}
        onCopyPacket={onCopyInspectionPacket}
        onCaptureScreenshot={onCaptureScreenshot}
        onScreenshotMarkerChange={onScreenshotMarkerChange}
        onDownloadScreenshot={onDownloadScreenshot}
        onDiscardScreenshot={onDiscardScreenshot}
      />
      <ReviewSetPanel
        items={reviewSetItems}
        canAddCurrent={reviewSetCanAddCurrent}
        addDisabledReason={reviewSetAddDisabledReason}
        status={reviewSetStatus}
        preparing={reviewSetPreparing}
        packet={reviewSetPacket}
        packetError={reviewSetPacketError}
        copyStatus={reviewSetCopyStatus}
        onAddCurrent={onAddCurrentInspectionToReviewSet}
        onClear={onClearReviewSet}
        onRemove={onRemoveReviewSetItem}
        onMove={onMoveReviewSetItem}
        onTeacherNoteChange={onReviewSetTeacherNoteChange}
        onDownloadScreenshot={onDownloadReviewSetScreenshot}
        onRemoveScreenshot={onRemoveReviewSetScreenshot}
        onPrepare={onPrepareReviewSet}
        onCopy={onCopyReviewSet}
      />
      <div className="panel-card">
        <div className="section-header">
          <h3>Source Files</h3>
        </div>
        {sourceFiles.length === 0 ? <p className="empty-state">No source files available yet.</p> : null}
        {sourceFiles.map((filePath) => (
          <div key={filePath} className="file-row">
            <code>{filePath}</code>
            <div className="file-actions">
              <button type="button" className="ghost-button" onClick={() => void onCopyToClipboard(filePath)}>
                Copy
              </button>
              <a className="ghost-button linkish" href={toCursorHref(filePath)}>
                Cursor
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="panel-card">
        <div className="section-header">
          <h3>Sections</h3>
        </div>
        {selectedProject?.sectionMap?.sections.length ? (
          <div className="token-list">
            {selectedProject.sectionMap.sections.map((section) => (
              <div key={section.id} className="token-card">
                <strong>{section.label}</strong>
                {section.headingText ? <span>{section.headingText}</span> : <span>{section.file}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No structured sections detected yet.</p>
        )}
      </div>

      <div className="panel-card">
        <div className="section-header">
          <h3>Resources</h3>
        </div>
        {selectedProject?.referenceIndex?.references.length ? (
          <div className="token-list">
            {selectedProject.referenceIndex.references.map((reference) => (
              <div key={reference.id} className="token-card">
                <strong>{reference.kind}</strong>
                <span>
                  {reference.extractionStatus}
                  {reference.extractionMethod ? ` via ${reference.extractionMethod}` : ""}
                </span>
                {reference.extractionIssue ? <span>{reference.extractionIssue}</span> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            Drop files into `projects/resources/&lt;project-slug&gt;/`, then use Refresh Intake.
          </p>
        )}
      </div>

      <div className="panel-card">
        <div className="section-header">
          <h3>Style Guide</h3>
        </div>
        <pre className="document-view">{selectedProject?.styleGuide ?? ""}</pre>
      </div>

      <div className="panel-card">
        <div className="section-header">
          <h3>Import Log</h3>
        </div>
        <pre className="document-view">{selectedProject?.importLog ?? ""}</pre>
      </div>
    </section>
  );
}
