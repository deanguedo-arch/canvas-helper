import type { InspectionResolution } from "../../../shared/inspection.js";
import type { AnnotationRect, ScreenshotAnnotation as ScreenshotAnnotationState } from "../hooks/useScreenshotAnnotation";
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
  screenshot: ScreenshotAnnotationState | null;
  onInspectionTeacherNoteChange: (value: string) => void;
  onSaveCurrentInspection: () => void;
  reviewSetCanAddCurrent: boolean;
  reviewSetAddDisabledReason: string;
  onCaptureScreenshot: () => void;
  onScreenshotMarkerChange: (marker: AnnotationRect) => void;
  onDownloadScreenshot: () => void;
  onDiscardScreenshot: () => void;
  reviewSetItems: ReviewSetItem[];
  reviewSetStatus: string;
  reviewSetPreparing: boolean;
  reviewSetPacketReady: boolean;
  reviewSetPacketError: string;
  reviewSetCopyStatus: string;
  onClearReviewSet: () => void;
  onRemoveReviewSetItem: (id: string) => void;
  onReviewSetTeacherNoteChange: (id: string, value: string) => void;
  onRemoveReviewSetScreenshot: (id: string) => void;
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
  screenshot,
  onInspectionTeacherNoteChange,
  onSaveCurrentInspection,
  reviewSetCanAddCurrent,
  reviewSetAddDisabledReason,
  onCaptureScreenshot,
  onScreenshotMarkerChange,
  onDownloadScreenshot,
  onDiscardScreenshot,
  reviewSetItems,
  reviewSetStatus,
  reviewSetPreparing,
  reviewSetPacketReady,
  reviewSetPacketError,
  reviewSetCopyStatus,
  onClearReviewSet,
  onRemoveReviewSetItem,
  onReviewSetTeacherNoteChange,
  onRemoveReviewSetScreenshot,
  onCopyReviewSet
}: InspectorPanelProps) {
  return (
    <aside className="inspector" aria-label="Annotations">
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
        screenshot={screenshot}
        onTeacherNoteChange={onInspectionTeacherNoteChange}
        onSave={onSaveCurrentInspection}
        onCaptureScreenshot={onCaptureScreenshot}
        onScreenshotMarkerChange={onScreenshotMarkerChange}
        onDownloadScreenshot={onDownloadScreenshot}
        onDiscardScreenshot={onDiscardScreenshot}
      />
      <ReviewSetPanel
        items={reviewSetItems}
        status={reviewSetStatus}
        preparing={reviewSetPreparing}
        packetReady={reviewSetPacketReady}
        packetError={reviewSetPacketError}
        copyStatus={reviewSetCopyStatus}
        onClear={onClearReviewSet}
        onRemove={onRemoveReviewSetItem}
        onTeacherNoteChange={onReviewSetTeacherNoteChange}
        onRemoveScreenshot={onRemoveReviewSetScreenshot}
        onCopy={onCopyReviewSet}
      />
    </aside>
  );
}
