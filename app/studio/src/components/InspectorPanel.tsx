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
  onDownloadScreenshot: (id: string) => void;
  onDiscardScreenshot: (id: string) => void;
  reviewSetItems: ReviewSetItem[];
  reviewSetStatus: string;
  reviewSetPreparing: boolean;
  reviewSetPacketReady: boolean;
  reviewSetPacketError: string;
  reviewSetCopyStatus: string;
  reviewSetManualPacket: string;
  reviewSetPersistenceError: string;
  reviewSetCaptureItemId: string;
  onClearReviewSet: () => void;
  onRemoveReviewSetItem: (id: string) => void;
  onFocusReviewSetItem: (id: string) => void;
  onReviewSetTeacherNoteChange: (id: string, value: string) => void;
  onAddReviewSetScreenshot: (id: string) => void;
  onRemoveReviewSetScreenshot: (itemId: string, screenshotId: string) => void;
  onCopyReviewSet: () => void;
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
  onDownloadScreenshot,
  onDiscardScreenshot,
  reviewSetItems,
  reviewSetStatus,
  reviewSetPreparing,
  reviewSetPacketReady,
  reviewSetPacketError,
  reviewSetCopyStatus,
  reviewSetManualPacket,
  reviewSetPersistenceError,
  reviewSetCaptureItemId,
  onClearReviewSet,
  onRemoveReviewSetItem,
  onFocusReviewSetItem,
  onReviewSetTeacherNoteChange,
  onAddReviewSetScreenshot,
  onRemoveReviewSetScreenshot,
  onCopyReviewSet
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
          onDownloadScreenshot={onDownloadScreenshot}
          onDiscardScreenshot={onDiscardScreenshot}
        />
      ) : null}
      <ReviewSetPanel
        items={reviewSetItems}
        status={reviewSetStatus}
        preparing={reviewSetPreparing}
        packetReady={reviewSetPacketReady}
        packetError={reviewSetPacketError}
        copyStatus={reviewSetCopyStatus}
        manualPacket={reviewSetManualPacket}
        persistenceError={reviewSetPersistenceError}
        captureItemId={reviewSetCaptureItemId}
        onClear={onClearReviewSet}
        onRemove={onRemoveReviewSetItem}
        onFocus={onFocusReviewSetItem}
        onTeacherNoteChange={onReviewSetTeacherNoteChange}
        onAddScreenshot={onAddReviewSetScreenshot}
        onRemoveScreenshot={onRemoveReviewSetScreenshot}
        onCopy={onCopyReviewSet}
      />
    </aside>
  );
}
