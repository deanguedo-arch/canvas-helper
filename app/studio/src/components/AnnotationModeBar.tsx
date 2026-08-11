import { REVIEW_SCREENSHOT_MAX_PER_ITEM } from "../../../shared/inspection.js";

type AnnotationModeBarProps = {
  savedCount: number;
  selectionReady: boolean;
  draftScreenshotCount: number;
  capturing: boolean;
  onCapture: () => void;
  onCancelCapture: () => void;
  onOpenReviewSet: () => void;
  onDone: () => void;
};

export function AnnotationModeBar({
  savedCount,
  selectionReady,
  draftScreenshotCount,
  capturing,
  onCapture,
  onCancelCapture,
  onOpenReviewSet,
  onDone
}: AnnotationModeBarProps) {
  return (
    <div className="annotation-mode-bar" role="toolbar" aria-label="Annotation mode" data-testid="annotation-mode-bar">
      <div className="annotation-mode-copy">
        <strong>Annotation mode</strong>
        <span>{selectionReady ? "Selection ready — add a note or screenshot." : "Click an element or drag over an area."}</span>
      </div>
      <div className="annotation-mode-actions">
        <button
          type="button"
          disabled={!capturing && (!selectionReady || draftScreenshotCount >= REVIEW_SCREENSHOT_MAX_PER_ITEM)}
          onClick={capturing ? onCancelCapture : onCapture}
          data-testid="annotation-bar-capture"
        >
          {capturing
            ? "Cancel capture"
            : `Screenshot${draftScreenshotCount ? ` (${draftScreenshotCount}/${REVIEW_SCREENSHOT_MAX_PER_ITEM})` : ""}`}
        </button>
        <button type="button" onClick={onOpenReviewSet}>
          Review Set ({savedCount})
        </button>
        <button type="button" className="annotation-mode-done" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
