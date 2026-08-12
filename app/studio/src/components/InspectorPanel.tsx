import type { InspectionIssueCategory, InspectionResolution } from "../../../shared/inspection.js";
import type {
  ReviewSetItem,
  ReviewSetHandoffDetail,
  ReviewSetPriority,
  ReviewSetSessionSummary,
  ScreenshotDraft
} from "../lib/review-workbench";
import { InspectionPanel } from "./InspectionPanel";
import { ReviewSetPanel } from "./ReviewSetPanel";

type InspectorPanelProps = {
  inspectEnabled: boolean;
  inspectionResolution: InspectionResolution | null;
  inspectionResolving: boolean;
  inspectionTeacherNote: string;
  inspectionIssueCategory: InspectionIssueCategory;
  screenshotSupported: boolean;
  screenshotCanCapture: boolean;
  screenshotStatus: "idle" | "capturing" | "processing" | "ready" | "error";
  screenshotError: string;
  screenshots: ScreenshotDraft[];
  onInspectionTeacherNoteChange: (value: string) => void;
  onInspectionIssueCategoryChange: (value: InspectionIssueCategory) => void;
  onSaveCurrentInspection: () => void;
  reviewSetCanAddCurrent: boolean;
  reviewSetAddDisabledReason: string;
  onCaptureScreenshot: () => void;
  onCancelScreenshot: () => void;
  onCropScreenshot: (id: string) => void;
  onDownloadScreenshot: (id: string) => void;
  onDiscardScreenshot: (id: string) => void;
  reviewSetItems: ReviewSetItem[];
  reviewSessionName: string;
  activeReviewSessionId: string;
  reviewSessions: ReviewSetSessionSummary[];
  reviewSetPacketByteLength: number;
  reviewSetHandoffDetail: ReviewSetHandoffDetail;
  reviewSetStatus: string;
  reviewSetStatusTone: "neutral" | "progress" | "success" | "warning" | "error";
  reviewSetPreparing: boolean;
  reviewSetPacketReady: boolean;
  reviewSetPacketError: string;
  reviewSetManualPacket: string;
  reviewSetManualCopyVisible: boolean;
  reviewSetPersistenceError: string;
  reviewSetCaptureItemId: string;
  reviewSetRelinkItemId: string;
  reviewSetUndoLabel: string;
  onClearReviewSet: () => void;
  onRemoveReviewSetItem: (id: string) => void;
  onFocusReviewSetItem: (id: string) => void;
  onReviewSetTeacherNoteChange: (id: string, value: string) => void;
  onReviewSetMetadataChange: (id: string, input: { shortLabel?: string; priority?: ReviewSetPriority; issueCategory?: InspectionIssueCategory }) => void;
  onReorderReviewSetItem: (id: string, direction: -1 | 1) => void;
  onDuplicateReviewSetItem: (id: string) => void;
  onMoveReviewSetItem: (id: string, sessionId: string) => void;
  onAddReviewSetScreenshot: (id: string) => void;
  onRetakeReviewSetScreenshot: (itemId: string, screenshotId: string) => void;
  onCropReviewSetScreenshot: (itemId: string, screenshotId: string) => void;
  onCancelReviewSetScreenshotCapture: () => void;
  onRemoveReviewSetScreenshot: (itemId: string, screenshotId: string) => void;
  onReorderReviewSetScreenshot: (itemId: string, screenshotId: string, direction: -1 | 1) => void;
  onRelinkReviewSetItem: (id: string) => void;
  onRetryReviewSetAnchor: (id: string) => void;
  onToggleReviewSetResolved: (id: string) => void;
  onReviewSetHandoffDetailChange: (detail: ReviewSetHandoffDetail) => void;
  onCopyReviewSet: () => void;
  onUndoReviewSet: () => void;
  onReviewSessionChange: (sessionId: string) => void;
  onNewReviewSession: () => void;
  onRenameReviewSession: (name: string) => void;
  onDeleteReviewSession: () => void;
  onMergeReviewSession: (sessionId: string) => void;
  onExportReviewSetMarkdown: () => void;
  onExportReviewSetJson: () => void;
  onImportReviewSetJson: (file: File) => void;
};

export function InspectorPanel({
  inspectEnabled,
  inspectionResolution,
  inspectionResolving,
  inspectionTeacherNote,
  inspectionIssueCategory,
  screenshotSupported,
  screenshotCanCapture,
  screenshotStatus,
  screenshotError,
  screenshots,
  onInspectionTeacherNoteChange,
  onInspectionIssueCategoryChange,
  onSaveCurrentInspection,
  reviewSetCanAddCurrent,
  reviewSetAddDisabledReason,
  onCaptureScreenshot,
  onCancelScreenshot,
  onCropScreenshot,
  onDownloadScreenshot,
  onDiscardScreenshot,
  reviewSetItems,
  reviewSessionName,
  activeReviewSessionId,
  reviewSessions,
  reviewSetPacketByteLength,
  reviewSetHandoffDetail,
  reviewSetStatus,
  reviewSetStatusTone,
  reviewSetPreparing,
  reviewSetPacketReady,
  reviewSetPacketError,
  reviewSetManualPacket,
  reviewSetManualCopyVisible,
  reviewSetPersistenceError,
  reviewSetCaptureItemId,
  reviewSetRelinkItemId,
  reviewSetUndoLabel,
  onClearReviewSet,
  onRemoveReviewSetItem,
  onFocusReviewSetItem,
  onReviewSetTeacherNoteChange,
  onReviewSetMetadataChange,
  onReorderReviewSetItem,
  onDuplicateReviewSetItem,
  onMoveReviewSetItem,
  onAddReviewSetScreenshot,
  onRetakeReviewSetScreenshot,
  onCropReviewSetScreenshot,
  onCancelReviewSetScreenshotCapture,
  onRemoveReviewSetScreenshot,
  onReorderReviewSetScreenshot,
  onRelinkReviewSetItem,
  onRetryReviewSetAnchor,
  onToggleReviewSetResolved,
  onReviewSetHandoffDetailChange,
  onCopyReviewSet,
  onUndoReviewSet,
  onReviewSessionChange,
  onNewReviewSession,
  onRenameReviewSession,
  onDeleteReviewSession,
  onMergeReviewSession,
  onExportReviewSetMarkdown,
  onExportReviewSetJson,
  onImportReviewSetJson
}: InspectorPanelProps) {
  const showComposer = inspectEnabled || Boolean(inspectionResolution) || screenshots.length > 0;

  return (
    <aside className="inspector" aria-label="Annotations">
      {showComposer ? (
        <InspectionPanel
          inspectEnabled={inspectEnabled}
          resolution={inspectionResolution}
          resolving={inspectionResolving}
          teacherNote={inspectionTeacherNote}
          issueCategory={inspectionIssueCategory}
          canSave={reviewSetCanAddCurrent}
          saveDisabledReason={reviewSetAddDisabledReason}
          screenshotSupported={screenshotSupported}
          screenshotCanCapture={screenshotCanCapture}
          screenshotStatus={screenshotStatus}
          screenshotError={screenshotError}
          screenshots={screenshots}
          onTeacherNoteChange={onInspectionTeacherNoteChange}
          onIssueCategoryChange={onInspectionIssueCategoryChange}
          onSave={onSaveCurrentInspection}
          onCaptureScreenshot={onCaptureScreenshot}
          onCancelScreenshot={onCancelScreenshot}
          onCropScreenshot={onCropScreenshot}
          onDownloadScreenshot={onDownloadScreenshot}
          onDiscardScreenshot={onDiscardScreenshot}
        />
      ) : null}
      <ReviewSetPanel
        items={reviewSetItems}
        sessionName={reviewSessionName}
        activeSessionId={activeReviewSessionId}
        sessions={reviewSessions}
        packetByteLength={reviewSetPacketByteLength}
        handoffDetail={reviewSetHandoffDetail}
        status={reviewSetStatus}
        statusTone={reviewSetStatusTone}
        preparing={reviewSetPreparing}
        packetReady={reviewSetPacketReady}
        packetError={reviewSetPacketError}
        manualPacket={reviewSetManualPacket}
        manualCopyVisible={reviewSetManualCopyVisible}
        persistenceError={reviewSetPersistenceError}
        captureItemId={reviewSetCaptureItemId}
        relinkItemId={reviewSetRelinkItemId}
        undoLabel={reviewSetUndoLabel}
        onClear={onClearReviewSet}
        onRemove={onRemoveReviewSetItem}
        onFocus={onFocusReviewSetItem}
        onTeacherNoteChange={onReviewSetTeacherNoteChange}
        onMetadataChange={onReviewSetMetadataChange}
        onReorderItem={onReorderReviewSetItem}
        onDuplicateItem={onDuplicateReviewSetItem}
        onMoveItem={onMoveReviewSetItem}
        onAddScreenshot={onAddReviewSetScreenshot}
        onRetakeScreenshot={onRetakeReviewSetScreenshot}
        onCropScreenshot={onCropReviewSetScreenshot}
        onCancelScreenshotCapture={onCancelReviewSetScreenshotCapture}
        onRemoveScreenshot={onRemoveReviewSetScreenshot}
        onReorderScreenshot={onReorderReviewSetScreenshot}
        onRelinkItem={onRelinkReviewSetItem}
        onRetryAnchor={onRetryReviewSetAnchor}
        onToggleResolved={onToggleReviewSetResolved}
        onHandoffDetailChange={onReviewSetHandoffDetailChange}
        onCopy={onCopyReviewSet}
        onUndo={onUndoReviewSet}
        onSessionChange={onReviewSessionChange}
        onNewSession={onNewReviewSession}
        onRenameSession={onRenameReviewSession}
        onDeleteSession={onDeleteReviewSession}
        onMergeSession={onMergeReviewSession}
        onExportMarkdown={onExportReviewSetMarkdown}
        onExportJson={onExportReviewSetJson}
        onImportJson={onImportReviewSetJson}
      />
    </aside>
  );
}
