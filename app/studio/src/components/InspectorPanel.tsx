import type { InspectionResolution } from "../../../shared/inspection.js";
import type { ScreenshotDraft } from "../hooks/useScreenshotAnnotation";
import type { ReviewSetItem, ReviewSetPriority } from "../lib/review-set";
import type { ReviewSetSessionSummary } from "../lib/review-set-storage";
import { InspectionPanel } from "./InspectionPanel";
import { ReviewSetPanel } from "./ReviewSetPanel";

type InspectorPanelProps = {
  inspectEnabled: boolean;
  inspectionResolution: InspectionResolution | null;
  inspectionResolving: boolean;
  inspectionTeacherNote: string;
  screenshotSupported: boolean;
  screenshotCanCapture: boolean;
  screenshotStatus: "idle" | "capturing" | "ready" | "error";
  screenshotError: string;
  screenshots: ScreenshotDraft[];
  onInspectionTeacherNoteChange: (value: string) => void;
  onSaveCurrentInspection: () => void;
  reviewSetCanAddCurrent: boolean;
  reviewSetAddDisabledReason: string;
  onCaptureScreenshot: () => void;
  onCancelScreenshot: () => void;
  onDownloadScreenshot: (id: string) => void;
  onDiscardScreenshot: (id: string) => void;
  reviewSetItems: ReviewSetItem[];
  reviewSessionName: string;
  activeReviewSessionId: string;
  reviewSessions: ReviewSetSessionSummary[];
  reviewSetPacketByteLength: number;
  reviewSetStatus: string;
  reviewSetStatusTone: "neutral" | "progress" | "success" | "warning" | "error";
  reviewSetPreparing: boolean;
  reviewSetPacketReady: boolean;
  reviewSetPacketError: string;
  reviewSetManualPacket: string;
  reviewSetManualCopyVisible: boolean;
  reviewSetPersistenceError: string;
  reviewSetCaptureItemId: string;
  reviewSetUndoLabel: string;
  onClearReviewSet: () => void;
  onRemoveReviewSetItem: (id: string) => void;
  onFocusReviewSetItem: (id: string) => void;
  onReviewSetTeacherNoteChange: (id: string, value: string) => void;
  onReviewSetMetadataChange: (id: string, input: { shortLabel?: string; priority?: ReviewSetPriority }) => void;
  onReorderReviewSetItem: (id: string, direction: -1 | 1) => void;
  onDuplicateReviewSetItem: (id: string) => void;
  onMoveReviewSetItem: (id: string, sessionId: string) => void;
  onAddReviewSetScreenshot: (id: string) => void;
  onCancelReviewSetScreenshotCapture: () => void;
  onRemoveReviewSetScreenshot: (itemId: string, screenshotId: string) => void;
  onReorderReviewSetScreenshot: (itemId: string, screenshotId: string, direction: -1 | 1) => void;
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
  screenshotSupported,
  screenshotCanCapture,
  screenshotStatus,
  screenshotError,
  screenshots,
  onInspectionTeacherNoteChange,
  onSaveCurrentInspection,
  reviewSetCanAddCurrent,
  reviewSetAddDisabledReason,
  onCaptureScreenshot,
  onCancelScreenshot,
  onDownloadScreenshot,
  onDiscardScreenshot,
  reviewSetItems,
  reviewSessionName,
  activeReviewSessionId,
  reviewSessions,
  reviewSetPacketByteLength,
  reviewSetStatus,
  reviewSetStatusTone,
  reviewSetPreparing,
  reviewSetPacketReady,
  reviewSetPacketError,
  reviewSetManualPacket,
  reviewSetManualCopyVisible,
  reviewSetPersistenceError,
  reviewSetCaptureItemId,
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
  onCancelReviewSetScreenshotCapture,
  onRemoveReviewSetScreenshot,
  onReorderReviewSetScreenshot,
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
          canSave={reviewSetCanAddCurrent}
          saveDisabledReason={reviewSetAddDisabledReason}
          screenshotSupported={screenshotSupported}
          screenshotCanCapture={screenshotCanCapture}
          screenshotStatus={screenshotStatus}
          screenshotError={screenshotError}
          screenshots={screenshots}
          onTeacherNoteChange={onInspectionTeacherNoteChange}
          onSave={onSaveCurrentInspection}
          onCaptureScreenshot={onCaptureScreenshot}
          onCancelScreenshot={onCancelScreenshot}
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
        status={reviewSetStatus}
        statusTone={reviewSetStatusTone}
        preparing={reviewSetPreparing}
        packetReady={reviewSetPacketReady}
        packetError={reviewSetPacketError}
        manualPacket={reviewSetManualPacket}
        manualCopyVisible={reviewSetManualCopyVisible}
        persistenceError={reviewSetPersistenceError}
        captureItemId={reviewSetCaptureItemId}
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
        onCancelScreenshotCapture={onCancelReviewSetScreenshotCapture}
        onRemoveScreenshot={onRemoveReviewSetScreenshot}
        onReorderScreenshot={onReorderReviewSetScreenshot}
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
