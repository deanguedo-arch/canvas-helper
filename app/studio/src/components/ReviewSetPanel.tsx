import { useCallback, useEffect, useRef, useState } from "react";

import { REVIEW_SCREENSHOT_MAX_PER_ITEM } from "../../../shared/inspection.js";
import { REVIEW_SET_MAX_ITEMS, type ReviewSetItem, type ReviewSetScreenshot } from "../lib/review-set";

type ReviewSetPanelProps = {
  items: ReviewSetItem[];
  status: string;
  statusTone: "neutral" | "progress" | "success" | "warning" | "error";
  preparing: boolean;
  packetReady: boolean;
  packetError: string;
  manualPacket: string;
  manualCopyVisible: boolean;
  persistenceError: string;
  captureItemId: string;
  undoLabel: string;
  onClear: () => void;
  onRemove: (id: string) => void;
  onFocus: (id: string) => void;
  onTeacherNoteChange: (id: string, value: string) => void;
  onAddScreenshot: (id: string) => void;
  onCancelScreenshotCapture: () => void;
  onRemoveScreenshot: (itemId: string, screenshotId: string) => void;
  onCopy: () => void;
  onUndo: () => void;
};

function itemTitle(item: ReviewSetItem, position: number) {
  const text = item.excerpt || item.resolution.selection.tagName || "Selected element";
  return `${position}. ${text}`;
}

export function ReviewSetPanel({
  items,
  status,
  statusTone,
  preparing,
  packetReady,
  packetError,
  manualPacket,
  manualCopyVisible,
  persistenceError,
  captureItemId,
  undoLabel,
  onClear,
  onRemove,
  onFocus,
  onTeacherNoteChange,
  onAddScreenshot,
  onCancelScreenshotCapture,
  onRemoveScreenshot,
  onCopy,
  onUndo
}: ReviewSetPanelProps) {
  const [expandedScreenshot, setExpandedScreenshot] = useState<{
    screenshot: ReviewSetScreenshot;
    annotationNumber: number;
    trigger: HTMLButtonElement;
  } | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement | null>(null);
  const screenshotCount = items.reduce((total, item) => total + item.screenshots.length, 0);
  const closeExpandedScreenshot = useCallback(() => {
    setExpandedScreenshot((current) => {
      window.requestAnimationFrame(() => current?.trigger.focus());
      return null;
    });
  }, []);

  useEffect(() => {
    if (!expandedScreenshot) return;
    lightboxCloseRef.current?.focus();
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExpandedScreenshot();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(
          lightboxRef.current?.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])") ?? []
        ).filter((element) => !element.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [closeExpandedScreenshot, expandedScreenshot]);

  return (
    <section className="panel-card review-set-panel" data-testid="review-set">
      <div className="section-header">
        <div>
          <h3>Review Set</h3>
          <p className="review-set-summary">
            {items.length} of {REVIEW_SET_MAX_ITEMS} annotations · {screenshotCount} screenshot{screenshotCount === 1 ? "" : "s"}
          </p>
        </div>
        <button type="button" className="ghost-button compact" disabled={!items.length} onClick={onClear}>
          Clear
        </button>
      </div>

      {items.length ? (
        <ol className="review-set-items" data-testid="review-set-items">
          {items.map((item, index) => {
            const captureRunning = captureItemId === item.id;
            const anotherCaptureRunning = Boolean(captureItemId) && !captureRunning;
            return (
              <li key={item.id} className="review-set-item" data-testid="review-set-item">
                <div className="review-set-item-heading">
                  <strong>{itemTitle(item, index + 1)}</strong>
                  <div className="review-set-item-actions">
                    <button type="button" className="ghost-button compact" onClick={() => onFocus(item.id)}>
                      Show
                    </button>
                    <button type="button" className="ghost-button compact danger" onClick={() => onRemove(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>

                <label className="inspection-note">
                  <span>What should change?</span>
                  <textarea
                    value={item.teacherNote}
                    onChange={(event) => onTeacherNoteChange(item.id, event.target.value)}
                    placeholder="Write your note for Codex…"
                    rows={2}
                  />
                </label>

                {item.screenshots.length ? (
                  <div className="review-set-screenshot-grid" data-testid="review-set-screenshots">
                    {item.screenshots.map((screenshot, screenshotIndex) => (
                      <div className="review-set-screenshot" key={screenshot.id} data-testid="review-set-screenshot">
                        <button
                          type="button"
                          className="review-set-screenshot-preview"
                          onClick={(event) => setExpandedScreenshot({
                            screenshot,
                            annotationNumber: index + 1,
                            trigger: event.currentTarget
                          })}
                          aria-label={`Open screenshot ${screenshotIndex + 1} for annotation ${index + 1}`}
                        >
                          <img src={screenshot.imageUrl} alt="" />
                          <span>{screenshotIndex + 1}</span>
                        </button>
                        <button
                          type="button"
                          className="review-set-screenshot-remove"
                          onClick={() => onRemoveScreenshot(item.id, screenshot.id)}
                          aria-label={`Remove screenshot ${screenshotIndex + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <button
                  type="button"
                  className="ghost-button compact review-set-add-screenshot"
                  disabled={anotherCaptureRunning || (!captureRunning && item.screenshots.length >= REVIEW_SCREENSHOT_MAX_PER_ITEM)}
                  onClick={captureRunning ? onCancelScreenshotCapture : () => onAddScreenshot(item.id)}
                >
                  {captureRunning
                    ? "Cancel capture"
                    : item.screenshots.length >= REVIEW_SCREENSHOT_MAX_PER_ITEM
                      ? "3 screenshots attached"
                      : "Add screenshot"}
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="empty-state">Select something in the course, add a note, and save it here.</p>
      )}

      {packetError || persistenceError || status || undoLabel ? (
        <div
          className={`review-feedback ${status ? statusTone : packetError || persistenceError ? "error" : "neutral"}`}
          role="status"
          aria-live="polite"
          data-testid="review-feedback"
        >
          <span>{status || packetError || persistenceError || "Last Review Set change can be undone."}</span>
          {undoLabel && !packetError && !persistenceError ? (
            <button type="button" className="review-feedback-undo" onClick={onUndo}>{undoLabel}</button>
          ) : null}
        </div>
      ) : null}
      <div className="inspection-actions review-set-copy-row">
        <button
          type="button"
          className="ghost-button compact active-toggle"
          disabled={!packetReady || preparing}
          onClick={onCopy}
          data-testid="copy-review-set"
        >
          {preparing ? "Getting Review Set ready…" : "Copy Review Set for Codex"}
        </button>
      </div>
      {manualPacket && manualCopyVisible ? (
        <label className="review-set-manual-copy">
          <span>Review Set packet</span>
          <textarea readOnly value={manualPacket} rows={8} data-testid="review-set-manual-packet" />
        </label>
      ) : null}

      {expandedScreenshot ? (
        <div ref={lightboxRef} className="review-screenshot-lightbox" role="dialog" aria-modal="true" aria-label="Screenshot preview">
          <button
            type="button"
            className="review-screenshot-lightbox-backdrop"
            aria-label="Close screenshot preview"
            onClick={closeExpandedScreenshot}
          />
          <div className="review-screenshot-lightbox-content">
            <div className="section-header">
              <strong>Annotation {expandedScreenshot.annotationNumber}</strong>
              <button ref={lightboxCloseRef} type="button" className="ghost-button compact" onClick={closeExpandedScreenshot}>
                Close
              </button>
            </div>
            <img src={expandedScreenshot.screenshot.imageUrl} alt={`Screenshot for annotation ${expandedScreenshot.annotationNumber}`} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
