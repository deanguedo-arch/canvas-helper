import { useCallback, useEffect, useRef, useState } from "react";

import { REVIEW_SCREENSHOT_MAX_PER_ITEM } from "../../../shared/inspection.js";
import {
  REVIEW_SET_MAX_ITEMS,
  type ReviewSetItem,
  type ReviewSetPriority,
  type ReviewSetScreenshot
} from "../lib/review-set";
import type { ReviewSetSessionSummary } from "../lib/review-set-storage";

type ReviewSetPanelProps = {
  items: ReviewSetItem[];
  sessionName: string;
  activeSessionId: string;
  sessions: ReviewSetSessionSummary[];
  packetByteLength: number;
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
  onMetadataChange: (id: string, input: { shortLabel?: string; priority?: ReviewSetPriority }) => void;
  onReorderItem: (id: string, direction: -1 | 1) => void;
  onDuplicateItem: (id: string) => void;
  onMoveItem: (id: string, sessionId: string) => void;
  onAddScreenshot: (id: string) => void;
  onCancelScreenshotCapture: () => void;
  onRemoveScreenshot: (itemId: string, screenshotId: string) => void;
  onReorderScreenshot: (itemId: string, screenshotId: string, direction: -1 | 1) => void;
  onCopy: () => void;
  onUndo: () => void;
  onSessionChange: (sessionId: string) => void;
  onNewSession: () => void;
  onRenameSession: (name: string) => void;
  onDeleteSession: () => void;
  onMergeSession: (sessionId: string) => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
};

function itemTitle(item: ReviewSetItem, position: number) {
  const text = item.shortLabel || item.excerpt || item.resolution.selection.tagName || "Selected element";
  return `${position}. ${text}`;
}

function itemReadiness(item: ReviewSetItem) {
  if (!item.teacherNote.trim()) return { label: "Needs note", tone: "warning" };
  if (item.resolution.freshness === "stale") return { label: "Stale", tone: "error" };
  if (item.resolution.freshness === "unsupported") return { label: "Needs relink", tone: "warning" };
  if (!item.screenshots.length) return { label: "No screenshot", tone: "neutral" };
  return { label: "Ready", tone: "success" };
}

function formatPacketSize(bytes: number) {
  if (!bytes) return "Waiting for ready check";
  return bytes < 1_000 ? `${bytes} B packet` : `${(bytes / 1_000).toFixed(1)} KB packet`;
}

export function ReviewSetPanel({
  items,
  sessionName,
  activeSessionId,
  sessions,
  packetByteLength,
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
  onMetadataChange,
  onReorderItem,
  onDuplicateItem,
  onMoveItem,
  onAddScreenshot,
  onCancelScreenshotCapture,
  onRemoveScreenshot,
  onReorderScreenshot,
  onCopy,
  onUndo,
  onSessionChange,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onMergeSession,
  onExportMarkdown,
  onExportJson,
  onImportJson
}: ReviewSetPanelProps) {
  const [expandedScreenshot, setExpandedScreenshot] = useState<{
    screenshot: ReviewSetScreenshot;
    annotationNumber: number;
    trigger: HTMLButtonElement;
  } | null>(null);
  const [mergeSessionId, setMergeSessionId] = useState("");
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);
  const screenshotCount = items.reduce((total, item) => total + item.screenshots.length, 0);
  const queuedSessions = sessions.filter((session) => session.id !== activeSessionId);
  const closeExpandedScreenshot = useCallback(() => {
    setExpandedScreenshot((current) => {
      window.requestAnimationFrame(() => current?.trigger.focus());
      return null;
    });
  }, []);

  useEffect(() => {
    if (!queuedSessions.some((session) => session.id === mergeSessionId)) {
      setMergeSessionId(queuedSessions[0]?.id ?? "");
    }
  }, [mergeSessionId, queuedSessions]);

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
      <div className="section-header review-set-header">
        <div>
          <h3>Review Set</h3>
          <p className="review-set-summary">
            {items.length} of {REVIEW_SET_MAX_ITEMS} annotations · {screenshotCount} screenshot{screenshotCount === 1 ? "" : "s"}
          </p>
        </div>
        <button type="button" className="ghost-button compact" disabled={!items.length} onClick={onClear}>Clear</button>
      </div>

      <div className="review-session-bar" data-testid="review-session-bar">
        <label>
          <span>Active review</span>
          <select value={activeSessionId} onChange={(event) => onSessionChange(event.target.value)} aria-label="Review session">
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>{session.name} · {session.itemCount}/{REVIEW_SET_MAX_ITEMS}</option>
            ))}
          </select>
        </label>
        <button type="button" className="ghost-button compact" onClick={onNewSession}>New</button>
      </div>

      <details className="review-session-tools">
        <summary>Session tools</summary>
        <label className="review-session-name">
          <span>Name</span>
          <input
            value={sessionName}
            maxLength={80}
            onChange={(event) => onRenameSession(event.target.value)}
            aria-label="Review session name"
          />
        </label>
        {queuedSessions.length ? (
          <div className="review-session-merge">
            <label>
              <span>Merge into active</span>
              <select value={mergeSessionId} onChange={(event) => setMergeSessionId(event.target.value)} aria-label="Queued review to merge">
                {queuedSessions.map((session) => <option key={session.id} value={session.id}>{session.name} · {session.itemCount} items</option>)}
              </select>
            </label>
            <button type="button" className="ghost-button compact" disabled={!mergeSessionId} onClick={() => onMergeSession(mergeSessionId)}>Merge</button>
          </div>
        ) : null}
        <button type="button" className="review-session-delete" onClick={onDeleteSession}>
          {sessions.length > 1 ? "Delete active review" : "Clear active review"}
        </button>
      </details>

      {items.length ? (
        <ol className="review-set-items" data-testid="review-set-items">
          {items.map((item, index) => {
            const captureRunning = captureItemId === item.id;
            const anotherCaptureRunning = Boolean(captureItemId) && !captureRunning;
            const readiness = itemReadiness(item);
            return (
              <li key={item.id} className="review-set-item" data-testid="review-set-item">
                <div className="review-set-item-heading">
                  <div className="review-set-item-title">
                    <strong>{itemTitle(item, index + 1)}</strong>
                    <span className={`review-item-readiness ${readiness.tone}`}>{readiness.label}</span>
                  </div>
                  <div className="review-set-item-actions">
                    <button type="button" className="icon-text-button" disabled={index === 0} onClick={() => onReorderItem(item.id, -1)} aria-label={`Move annotation ${index + 1} up`}>↑</button>
                    <button type="button" className="icon-text-button" disabled={index === items.length - 1} onClick={() => onReorderItem(item.id, 1)} aria-label={`Move annotation ${index + 1} down`}>↓</button>
                    <button type="button" className="ghost-button compact" onClick={() => onFocus(item.id)}>Show</button>
                    <button type="button" className="ghost-button compact danger" onClick={() => onRemove(item.id)}>Remove</button>
                  </div>
                </div>

                <div className="review-item-metadata">
                  <label>
                    <span>Short label</span>
                    <input
                      value={item.shortLabel}
                      maxLength={64}
                      onChange={(event) => onMetadataChange(item.id, { shortLabel: event.target.value })}
                      placeholder="Optional label"
                    />
                  </label>
                  <label>
                    <span>Priority</span>
                    <select
                      value={item.priority}
                      onChange={(event) => onMetadataChange(item.id, { priority: event.target.value as ReviewSetPriority })}
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="low">Low</option>
                    </select>
                  </label>
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
                          onClick={(event) => setExpandedScreenshot({ screenshot, annotationNumber: index + 1, trigger: event.currentTarget })}
                          aria-label={`Open screenshot ${screenshotIndex + 1} for annotation ${index + 1}`}
                        >
                          <img src={screenshot.imageUrl} alt="" loading="lazy" />
                          <span>{screenshotIndex + 1}</span>
                        </button>
                        <div className="review-screenshot-order">
                          <button type="button" disabled={screenshotIndex === 0} onClick={() => onReorderScreenshot(item.id, screenshot.id, -1)} aria-label={`Move screenshot ${screenshotIndex + 1} left`}>←</button>
                          <button type="button" disabled={screenshotIndex === item.screenshots.length - 1} onClick={() => onReorderScreenshot(item.id, screenshot.id, 1)} aria-label={`Move screenshot ${screenshotIndex + 1} right`}>→</button>
                        </div>
                        <button
                          type="button"
                          className="review-set-screenshot-remove"
                          onClick={() => onRemoveScreenshot(item.id, screenshot.id)}
                          aria-label={`Remove screenshot ${screenshotIndex + 1}`}
                        >×</button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="review-item-secondary-actions">
                  <button
                    type="button"
                    className="ghost-button compact review-set-add-screenshot"
                    disabled={anotherCaptureRunning || (!captureRunning && item.screenshots.length >= REVIEW_SCREENSHOT_MAX_PER_ITEM)}
                    onClick={captureRunning ? onCancelScreenshotCapture : () => onAddScreenshot(item.id)}
                  >
                    {captureRunning ? "Cancel capture" : item.screenshots.length >= REVIEW_SCREENSHOT_MAX_PER_ITEM ? "3 screenshots attached" : "Add screenshot"}
                  </button>
                  <button type="button" className="text-action" disabled={items.length >= REVIEW_SET_MAX_ITEMS} onClick={() => onDuplicateItem(item.id)}>Duplicate</button>
                  {queuedSessions.length ? (
                    <label className="review-move-control">
                      <span className="sr-only">Move annotation {index + 1} to another review</span>
                      <select defaultValue="" onChange={(event) => {
                        if (event.target.value) onMoveItem(item.id, event.target.value);
                        event.target.value = "";
                      }} aria-label={`Move annotation ${index + 1} to another review`}>
                        <option value="">Move to…</option>
                        {queuedSessions.map((session) => <option key={session.id} value={session.id}>{session.name}</option>)}
                      </select>
                    </label>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="empty-state">Select something in the course, add a note, and save it here.</p>
      )}

      {packetError || persistenceError || status || undoLabel ? (
        <div className={`review-feedback ${status ? statusTone : packetError || persistenceError ? "error" : "neutral"}`} role="status" aria-live="polite" data-testid="review-feedback">
          <span>{status || packetError || persistenceError || "Last Review Set change can be undone."}</span>
          {undoLabel && !packetError && !persistenceError ? (
            <button type="button" className="review-feedback-undo" onClick={onUndo}>{undoLabel}</button>
          ) : null}
        </div>
      ) : null}

      <div className="review-packet-summary" data-testid="review-packet-size">
        <span>{formatPacketSize(packetByteLength)}</span>
        <span>{packetReady ? "Ready for Codex" : preparing ? "Checking sources…" : "Needs review"}</span>
      </div>
      <div className="inspection-actions review-set-copy-row">
        <button type="button" className="ghost-button compact active-toggle" disabled={!packetReady || preparing} onClick={onCopy} data-testid="copy-review-set">
          {preparing ? "Getting Review Set ready…" : "Copy Review Set for Codex"}
        </button>
      </div>
      <div className="review-export-actions">
        <button type="button" className="text-action" disabled={!packetReady} onClick={onExportMarkdown}>Export Markdown</button>
        <button type="button" className="text-action" onClick={onExportJson}>Backup JSON</button>
        <button type="button" className="text-action" onClick={() => importRef.current?.click()}>Import JSON</button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportJson(file);
            event.target.value = "";
          }}
          data-testid="review-set-import"
        />
      </div>
      {manualPacket && manualCopyVisible ? (
        <label className="review-set-manual-copy">
          <span>Review Set packet</span>
          <textarea readOnly value={manualPacket} rows={8} data-testid="review-set-manual-packet" />
        </label>
      ) : null}

      {expandedScreenshot ? (
        <div ref={lightboxRef} className="review-screenshot-lightbox" role="dialog" aria-modal="true" aria-label="Screenshot preview">
          <button type="button" className="review-screenshot-lightbox-backdrop" aria-label="Close screenshot preview" onClick={closeExpandedScreenshot} />
          <div className="review-screenshot-lightbox-content">
            <div className="section-header">
              <strong>Annotation {expandedScreenshot.annotationNumber}</strong>
              <button ref={lightboxCloseRef} type="button" className="ghost-button compact" onClick={closeExpandedScreenshot}>Close</button>
            </div>
            <img src={expandedScreenshot.screenshot.imageUrl} alt={`Screenshot for annotation ${expandedScreenshot.annotationNumber}`} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
