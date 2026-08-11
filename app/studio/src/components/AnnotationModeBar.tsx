import { REVIEW_SCREENSHOT_MAX_PER_ITEM } from "../../../shared/inspection.js";

type AnnotationModeBarProps = {
  savedCount: number;
  selectionReady: boolean;
  draftScreenshotCount: number;
  capturing: boolean;
  onCapture: () => void;
  onOpenReviewSet: () => void;
  onDone: () => void;
};

export function AnnotationModeBar({
  savedCount,
  selectionReady,
  draftScreenshotCount,
  capturing,
  onCapture,
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
          disabled={!selectionReady || capturing || draftScreenshotCount >= REVIEW_SCREENSHOT_MAX_PER_ITEM}
          onClick={onCapture}
          data-testid="annotation-bar-capture"
        >
          {capturing
            ? "Capturing…"
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
