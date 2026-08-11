import type { InspectionResolution } from "../../../shared/inspection.js";
import type { ScreenshotDraft } from "../hooks/useScreenshotAnnotation";
import type { ReviewSetItem } from "../lib/review-set";
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
  onAddReviewSetScreenshot: (id: string) => void;
  onCancelReviewSetScreenshotCapture: () => void;
  onRemoveReviewSetScreenshot: (itemId: string, screenshotId: string) => void;
  onCopyReviewSet: () => void;
  onUndoReviewSet: () => void;
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
  onAddReviewSetScreenshot,
  onCancelReviewSetScreenshotCapture,
  onRemoveReviewSetScreenshot,
  onCopyReviewSet,
  onUndoReviewSet
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
        onAddScreenshot={onAddReviewSetScreenshot}
        onCancelScreenshotCapture={onCancelReviewSetScreenshotCapture}
        onRemoveScreenshot={onRemoveReviewSetScreenshot}
        onCopy={onCopyReviewSet}
        onUndo={onUndoReviewSet}
      />
    </aside>
  );
}
