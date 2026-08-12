import { useCallback, useEffect, useRef, useState } from "react";

import { REVIEW_SCREENSHOT_MAX_PER_ITEM } from "../../../shared/inspection.js";
import type { InspectionIssueCategory } from "../../../shared/inspection.js";
import {
  REVIEW_SET_MAX_ITEMS,
  type ReviewSetHandoffDetail,
  type ReviewSetItem,
  type ReviewSetPriority,
  type ReviewSetScreenshot,
  type ReviewSetSessionSummary
} from "../lib/review-workbench";
import { STUDIO_BRIDGE_LIMITS } from "../../../shared/studio-quality.js";

type ReviewSetPanelProps = {
  items: ReviewSetItem[];
  sessionName: string;
  activeSessionId: string;
  sessions: ReviewSetSessionSummary[];
  packetByteLength: number;
  handoffDetail: ReviewSetHandoffDetail;
  status: string;
  statusTone: "neutral" | "progress" | "success" | "warning" | "error";
  preparing: boolean;
  saving: boolean;
  packetReady: boolean;
  packetError: string;
  manualPacket: string;
  manualCopyVisible: boolean;
  copying: boolean;
  persistenceError: string;
  captureItemId: string;
  relinkItemId: string;
  undoLabel: string;
  onClear: () => void;
  onRemove: (id: string) => void;
  onFocus: (id: string) => void;
  onTeacherNoteChange: (id: string, value: string) => void;
  onMetadataChange: (id: string, input: { shortLabel?: string; priority?: ReviewSetPriority; issueCategory?: InspectionIssueCategory }) => void;
  onReorderItem: (id: string, direction: -1 | 1) => void;
  onDuplicateItem: (id: string) => void;
  onMoveItem: (id: string, sessionId: string) => void;
  onAddScreenshot: (id: string) => void;
  onRetakeScreenshot: (itemId: string, screenshotId: string) => void;
  onCropScreenshot: (itemId: string, screenshotId: string) => void;
  onCancelScreenshotCapture: () => void;
  onRemoveScreenshot: (itemId: string, screenshotId: string) => void;
  onReorderScreenshot: (itemId: string, screenshotId: string, direction: -1 | 1) => void;
  onRelinkItem: (id: string) => void;
  onRetryAnchor: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onAcceptItem: (id: string) => void;
  onReopenItem: (id: string) => void;
  onHandoffDetailChange: (detail: ReviewSetHandoffDetail) => void;
  onCopy: () => void;
  onConfirmManualSent: () => void;
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
  if (item.handoffState === "accepted") return { label: "Accepted", tone: "success" };
  if (item.handoffState === "sent") return { label: "Sent", tone: "progress" };
  if (item.handoffState === "reopened") return { label: "Follow-up", tone: "warning" };
  if (item.resolved) return { label: "Resolved", tone: "success" };
  if (item.anchorState === "missing") return { label: "Needs relink", tone: "error" };
  if (item.anchorState === "changed") return { label: "Changed", tone: "warning" };
  if (!item.teacherNote.trim()) return { label: "Needs note", tone: "warning" };
  if (item.resolution.freshness === "stale") return { label: "Stale", tone: "error" };
  if (item.resolution.freshness === "unsupported") return { label: "Needs relink", tone: "warning" };
  if (!item.screenshots.length) return { label: "No screenshot", tone: "neutral" };
  return { label: "Ready", tone: "success" };
}

function formatPacketSize(bytes: number) {
  if (!bytes) return "No handoff yet";
  return bytes < 1_000 ? `${bytes} B packet` : `${(bytes / 1_000).toFixed(1)} KB packet`;
}

export function ReviewSetPanel({
  items,
  sessionName,
  activeSessionId,
  sessions,
  packetByteLength,
  handoffDetail,
  status,
  statusTone,
  preparing,
  saving,
  packetReady,
  packetError,
  manualPacket,
  manualCopyVisible,
  copying,
  persistenceError,
  captureItemId,
  relinkItemId,
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
  onRetakeScreenshot,
  onCropScreenshot,
  onCancelScreenshotCapture,
  onRemoveScreenshot,
  onReorderScreenshot,
  onRelinkItem,
  onRetryAnchor,
  onToggleResolved,
  onAcceptItem,
  onReopenItem,
  onHandoffDetailChange,
  onCopy,
  onConfirmManualSent,
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
  const panelRef = useRef<HTMLElement | null>(null);
  const screenshotCount = items.reduce((total, item) => total + item.screenshots.length, 0);
  const openCount = items.filter((item) => !item.resolved).length;
  const sentItems = items.filter((item) => item.handoffState === "sent");
  const acceptedCount = items.filter((item) => item.handoffState === "accepted").length;
  const followUpCount = items.filter((item) => item.handoffState === "reopened").length;
  const hasHandoffHistory = items.some((item) => item.handoffState !== "draft");
  const hasProtectedHistory = items.some((item) => item.handoffState === "sent" || item.handoffState === "accepted");
  const handoffCandidateCount = items.filter((item) => !item.resolved && (item.handoffState === "draft" || item.handoffState === "reopened")).length;
  const mutationLocked = Boolean(captureItemId) || copying || saving;
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
    <section ref={panelRef} id="studio-review-set" className="panel-card review-set-panel" data-testid="review-set" tabIndex={-1} aria-labelledby="studio-review-set-heading">
      <div className="section-header review-set-header">
        <div>
          <h3 id="studio-review-set-heading">Review Set</h3>
          <p className="review-set-summary">
            {openCount} open · {items.length} of {REVIEW_SET_MAX_ITEMS} saved · {screenshotCount} screenshot{screenshotCount === 1 ? "" : "s"}
          </p>
        </div>
        <button type="button" className="ghost-button compact" disabled={!items.length || mutationLocked || hasProtectedHistory} onClick={onClear}>Clear</button>
      </div>

      <div className="review-session-bar" data-testid="review-session-bar">
        <label>
          <span>Active review</span>
          <select disabled={mutationLocked} value={activeSessionId} onChange={(event) => onSessionChange(event.target.value)} aria-label="Review session">
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>{session.name} · {session.itemCount}/{REVIEW_SET_MAX_ITEMS}</option>
            ))}
          </select>
        </label>
        <button type="button" className="ghost-button compact" disabled={mutationLocked} onClick={onNewSession}>New</button>
      </div>

      <details className="review-session-tools">
        <summary>Session tools</summary>
        <label className="review-session-name">
          <span>Name</span>
          <input
            disabled={mutationLocked}
            value={sessionName}
            maxLength={STUDIO_BRIDGE_LIMITS.reviewSessionNameCodeUnits}
            onChange={(event) => onRenameSession(event.target.value)}
            aria-label="Review session name"
          />
        </label>
        {queuedSessions.length ? (
          <div className="review-session-merge">
            <label>
              <span>Merge into active</span>
              <select disabled={mutationLocked} value={mergeSessionId} onChange={(event) => setMergeSessionId(event.target.value)} aria-label="Queued review to merge">
                {queuedSessions.map((session) => <option key={session.id} value={session.id}>{session.name} · {session.itemCount} items</option>)}
              </select>
            </label>
            <button type="button" className="ghost-button compact" disabled={!mergeSessionId || mutationLocked} onClick={() => onMergeSession(mergeSessionId)}>Merge</button>
          </div>
        ) : null}
        <button type="button" className="review-session-delete" disabled={mutationLocked || hasProtectedHistory} onClick={onDeleteSession}>
          {sessions.length > 1 ? "Delete active review" : "Clear active review"}
        </button>
      </details>

      {hasHandoffHistory ? (
        <div className="review-verification" data-testid="review-verification">
          <div>
            <strong>Verify changes</strong>
            <span>{acceptedCount} accepted · {sentItems.length} to check · {followUpCount} follow-up</span>
          </div>
          <button
            type="button"
            className="ghost-button compact"
            disabled={!sentItems.length || mutationLocked}
            onClick={() => sentItems[0] && onFocus(sentItems[0].id)}
            data-testid="verify-next-change"
          >
            {sentItems.length ? "Show next change" : "Verification complete"}
          </button>
        </div>
      ) : null}

      {items.length ? (
        <ol className="review-set-items" data-testid="review-set-items">
          {items.map((item, index) => {
            const captureRunning = captureItemId === item.id;
            const anotherCaptureRunning = Boolean(captureItemId) && !captureRunning;
            const editLocked = item.handoffState === "sent" || item.handoffState === "accepted";
            const readiness = itemReadiness(item);
            return (
              <li key={item.id} className={`review-set-item${item.resolved ? " resolved" : ""}`} data-testid="review-set-item">
                <div className="review-set-item-heading">
                  <div className="review-set-item-title">
                    <strong>{itemTitle(item, index + 1)}</strong>
                    <div className="review-item-badges">
                      <span className="review-selection-kind">{item.request.selection.selectionKind === "area" ? "Area" : "Element"}</span>
                      <span className={`review-item-readiness ${readiness.tone}`}>{readiness.label}</span>
                    </div>
                  </div>
                  <div className="review-set-item-actions">
                    <button type="button" className="icon-text-button" disabled={mutationLocked || index === 0} onClick={() => onReorderItem(item.id, -1)} aria-label={`Move annotation ${index + 1} up`}>↑</button>
                    <button type="button" className="icon-text-button" disabled={mutationLocked || index === items.length - 1} onClick={() => onReorderItem(item.id, 1)} aria-label={`Move annotation ${index + 1} down`}>↓</button>
                    <button type="button" className="ghost-button compact" disabled={mutationLocked} onClick={async (event) => {
                      const trigger = event.currentTarget;
                      onFocus(item.id);
                      window.requestAnimationFrame(() => trigger.focus());
                    }}>Show</button>
                    <button type="button" className="ghost-button compact" disabled={mutationLocked || editLocked} onClick={() => onRelinkItem(item.id)}>
                      {relinkItemId === item.id ? "Cancel relink" : "Relink"}
                    </button>
                    <button type="button" className="ghost-button compact danger" disabled={mutationLocked || editLocked} onClick={() => {
                      onRemove(item.id);
                      window.requestAnimationFrame(() => panelRef.current?.focus());
                    }}>Remove</button>
                  </div>
                </div>

                <div className="review-item-metadata">
                  <label>
                    <span>Short label</span>
                    <input
                      disabled={mutationLocked || editLocked}
                      value={item.shortLabel}
                      maxLength={STUDIO_BRIDGE_LIMITS.reviewLabelCodeUnits}
                      onChange={(event) => onMetadataChange(item.id, { shortLabel: event.target.value })}
                      placeholder="Optional label"
                    />
                  </label>
                  <label>
                    <span>Concern</span>
                    <select
                      disabled={mutationLocked || editLocked}
                      value={item.issueCategory}
                      onChange={(event) => onMetadataChange(item.id, { issueCategory: event.target.value as InspectionIssueCategory })}
                    >
                      <option value="content">Content</option>
                      <option value="interaction">Interaction</option>
                      <option value="layout">Responsive layout</option>
                      <option value="accessibility">Accessibility</option>
                      <option value="unsure">General</option>
                    </select>
                  </label>
                  <label>
                    <span>Priority</span>
                    <select
                      disabled={mutationLocked || editLocked}
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
                    disabled={mutationLocked || editLocked}
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
                          <img src={screenshot.imageUrl} alt="" loading="lazy" decoding="async" />
                          <span>{screenshotIndex + 1}</span>
                        </button>
                        <div className="review-screenshot-order">
                          <button type="button" disabled={mutationLocked || editLocked || screenshotIndex === 0} onClick={() => onReorderScreenshot(item.id, screenshot.id, -1)} aria-label={`Move screenshot ${screenshotIndex + 1} left`}>←</button>
                          <button type="button" disabled={mutationLocked || editLocked || screenshotIndex === item.screenshots.length - 1} onClick={() => onReorderScreenshot(item.id, screenshot.id, 1)} aria-label={`Move screenshot ${screenshotIndex + 1} right`}>→</button>
                        </div>
                        <div className="review-screenshot-tools">
                          <button
                            type="button"
                            disabled={mutationLocked || editLocked || screenshot.ownerNodeId !== item.request.selection.nodeId}
                            onClick={() => onRetakeScreenshot(item.id, screenshot.id)}
                          >Retake</button>
                          <button
                            type="button"
                            disabled={mutationLocked || editLocked || screenshot.cropped || screenshot.ownerNodeId !== item.request.selection.nodeId}
                            onClick={() => onCropScreenshot(item.id, screenshot.id)}
                          >{screenshot.cropped ? "Cropped" : "Crop"}</button>
                        </div>
                        <button
                          type="button"
                          className="review-set-screenshot-remove"
                          disabled={mutationLocked || editLocked}
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
                    disabled={mutationLocked || editLocked || anotherCaptureRunning || (!captureRunning && item.screenshots.length >= REVIEW_SCREENSHOT_MAX_PER_ITEM)}
                    onClick={captureRunning ? onCancelScreenshotCapture : () => onAddScreenshot(item.id)}
                  >
                    {captureRunning ? "Cancel capture" : item.screenshots.length >= REVIEW_SCREENSHOT_MAX_PER_ITEM ? "3 screenshots attached" : "Add screenshot"}
                  </button>
                  <button type="button" className="text-action" disabled={mutationLocked || editLocked || items.length >= REVIEW_SET_MAX_ITEMS} onClick={() => onDuplicateItem(item.id)}>Duplicate</button>
                  {item.anchorState !== "ready" ? (
                    <button type="button" className="text-action" disabled={mutationLocked} onClick={() => onRetryAnchor(item.id)}>Check again</button>
                  ) : null}
                  {item.handoffState === "sent" ? (
                    <>
                      <button type="button" className="text-action review-accept-action" disabled={mutationLocked} onClick={() => onAcceptItem(item.id)}>Accept change</button>
                      <button type="button" className="text-action" disabled={mutationLocked} onClick={() => onReopenItem(item.id)}>Reopen for follow-up</button>
                    </>
                  ) : item.handoffState === "accepted" ? (
                    <>
                      <button type="button" className="text-action review-accept-action" disabled>Accepted</button>
                      <button type="button" className="text-action" disabled={mutationLocked} onClick={() => onReopenItem(item.id)}>Reopen</button>
                    </>
                  ) : item.handoffState === "reopened" ? (
                    <span className="review-follow-up-label">Ready for follow-up</span>
                  ) : (
                    <button type="button" className="text-action" disabled={mutationLocked} onClick={() => onToggleResolved(item.id)}>
                      {item.resolved ? "Reopen" : "Mark resolved"}
                    </button>
                  )}
                  {queuedSessions.length ? (
                    <label className="review-move-control">
                      <span className="sr-only">Move annotation {index + 1} to another review</span>
                      <select disabled={mutationLocked || editLocked} defaultValue="" onChange={(event) => {
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
        <div className="review-set-empty" data-testid="review-set-empty">
          <p><strong>Start a focused review.</strong> Your saved notes and screenshots will stay together here.</p>
          <ol>
            <li>Turn on <strong>Annotate</strong>.</li>
            <li>Select an element or drag over an area.</li>
            <li>Add a clear note, then save the annotation.</li>
          </ol>
        </div>
      )}

      {packetError || persistenceError || status || undoLabel ? (
        <div className={`review-feedback ${status ? statusTone : packetError || persistenceError ? "error" : "neutral"}`} role="status" aria-live="polite" data-testid="review-feedback">
          <span>{status || packetError || persistenceError || "Last Review Set change can be undone."}</span>
          {undoLabel && !packetError && !persistenceError ? (
            <button type="button" className="review-feedback-undo" disabled={mutationLocked} onClick={onUndo}>{undoLabel}</button>
          ) : null}
        </div>
      ) : null}

      {handoffCandidateCount ? (
        <label className="review-handoff-detail">
          <span>Codex handoff</span>
          <select
            value={handoffDetail}
            onChange={(event) => onHandoffDetailChange(event.target.value as ReviewSetHandoffDetail)}
            disabled={mutationLocked || preparing}
            data-testid="review-handoff-detail"
          >
            <option value="compact">Compact · recommended</option>
            <option value="diagnostic">Full diagnostics</option>
          </select>
          <small>{handoffDetail === "compact"
            ? "Keeps your requests, screenshots, safe edit routes, and validation steps concise."
            : "Adds complete selection, provenance, status, and diagnostic evidence."}</small>
        </label>
      ) : null}

      {handoffCandidateCount ? (
        <div className="review-packet-summary" data-testid="review-packet-size">
          <span>{formatPacketSize(packetByteLength)}</span>
          <span>{packetReady ? `${handoffDetail === "compact" ? "Compact" : "Diagnostic"} · ready` : preparing ? "Checking sources…" : "Needs review"}</span>
        </div>
      ) : !items.length ? (
        <p className="review-copy-hint" data-testid="review-packet-size">Save an annotation to create a Codex handoff.</p>
      ) : hasHandoffHistory ? (
        <p className="review-copy-hint" data-testid="review-packet-size">Verify each sent change. Reopen anything that still needs work to create a follow-up handoff.</p>
      ) : (
        <p className="review-copy-hint" data-testid="review-packet-size">Reopen an annotation to include it in the handoff.</p>
      )}
      {!hasHandoffHistory || handoffCandidateCount ? (
        <div className="inspection-actions review-set-copy-row">
          <button type="button" className="ghost-button compact active-toggle" disabled={!packetReady || preparing || mutationLocked} onClick={onCopy} data-testid="copy-review-set">
            {copying
              ? "Copying Review Set…"
              : preparing
              ? "Getting Review Set ready…"
              : hasHandoffHistory ? "Copy Follow-up for Codex" : "Copy Review Set for Codex"}
          </button>
        </div>
      ) : null}
      <div className="review-export-actions">
        <button type="button" className="text-action" disabled={!packetReady || mutationLocked} onClick={onExportMarkdown}>Export Markdown</button>
        <button type="button" className="text-action" disabled={mutationLocked} onClick={onExportJson}>Backup JSON</button>
        <button type="button" className="text-action" disabled={mutationLocked} onClick={() => importRef.current?.click()}>Import JSON</button>
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
        <div className="review-set-manual-copy">
          <label>
            <span>Review Set packet</span>
            <textarea readOnly value={manualPacket} rows={8} data-testid="review-set-manual-packet" />
          </label>
          <button type="button" className="ghost-button compact active-toggle" disabled={mutationLocked} onClick={onConfirmManualSent} data-testid="confirm-manual-review-sent">
            I sent this to Codex
          </button>
        </div>
      ) : null}

      {expandedScreenshot ? (
        <div ref={lightboxRef} className="review-screenshot-lightbox" role="dialog" aria-modal="true" aria-label="Screenshot preview">
          <button type="button" className="review-screenshot-lightbox-backdrop" aria-label="Close screenshot preview" onClick={closeExpandedScreenshot} />
          <div className="review-screenshot-lightbox-content">
            <div className="section-header">
              <strong>Annotation {expandedScreenshot.annotationNumber}</strong>
              <button ref={lightboxCloseRef} type="button" className="ghost-button compact" onClick={closeExpandedScreenshot}>Close</button>
            </div>
            <img src={expandedScreenshot.screenshot.imageUrl} alt={`Screenshot for annotation ${expandedScreenshot.annotationNumber}`} decoding="async" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
