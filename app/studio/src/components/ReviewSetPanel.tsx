import { utf8ByteLength, REVIEW_SET_NOTE_MAX_BYTES, type ReviewSetItem } from "../lib/review-set";

type ReviewSetPanelProps = {
  items: ReviewSetItem[];
  canAddCurrent: boolean;
  addDisabledReason: string;
  status: string;
  preparing: boolean;
  packet: string;
  packetError: string;
  copyStatus: string;
  onAddCurrent: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onTeacherNoteChange: (id: string, value: string) => void;
  onDownloadScreenshot: (id: string) => void;
  onRemoveScreenshot: (id: string) => void;
  onPrepare: () => void;
  onCopy: () => void;
};

function labelForCategory(category: string) {
  return category[0].toUpperCase() + category.slice(1);
}

function itemTitle(item: ReviewSetItem, position: number) {
  const text = item.excerpt || item.resolution.selection.tagName || "Selected element";
  return `Item ${position}: ${text}`;
}

export function ReviewSetPanel({
  items,
  canAddCurrent,
  addDisabledReason,
  status,
  preparing,
  packet,
  packetError,
  copyStatus,
  onAddCurrent,
  onClear,
  onRemove,
  onMove,
  onTeacherNoteChange,
  onDownloadScreenshot,
  onRemoveScreenshot,
  onPrepare,
  onCopy
}: ReviewSetPanelProps) {
  return (
    <section className="panel-card review-set-panel" data-testid="review-set">
      <div className="section-header">
        <div>
          <h3>Review Set</h3>
          <p className="review-set-summary">{items.length}/5 saved · temporary</p>
        </div>
        <button type="button" className="ghost-button compact" disabled={!items.length || preparing} onClick={onClear}>
          Clear set
        </button>
      </div>

      <p className="review-set-intro">
        Save up to five source-mapped workspace selections, then prepare one bounded handoff. The set stays only in this Studio session and clears when you reload, close Studio, or switch course or preview mode.
      </p>
      <div className="inspection-actions">
        <button
          type="button"
          className="ghost-button compact active-toggle"
          disabled={!canAddCurrent || preparing}
          onClick={onAddCurrent}
          data-testid="add-to-review-set"
        >
          Add current inspection
        </button>
        {!canAddCurrent ? <span className="inspection-copy-status">{addDisabledReason}</span> : null}
      </div>
      {status ? <p className="review-set-status" role="status">{status}</p> : null}

      {items.length ? (
        <ol className="review-set-items" data-testid="review-set-items">
          {items.map((item, index) => (
            <li key={item.id} className="review-set-item" data-testid="review-set-item">
              <div className="review-set-item-heading">
                <div>
                  <strong>{itemTitle(item, index + 1)}</strong>
                  <span>
                    {item.resolution.resolution} · {item.resolution.selection.tagName} · {item.request.htmlPath}
                  </span>
                </div>
                <div className="review-set-item-actions">
                  <button type="button" className="ghost-button compact" disabled={index === 0 || preparing} onClick={() => onMove(item.id, "up")}>
                    Up
                  </button>
                  <button type="button" className="ghost-button compact" disabled={index === items.length - 1 || preparing} onClick={() => onMove(item.id, "down")}>
                    Down
                  </button>
                  <button type="button" className="ghost-button compact danger" disabled={preparing} onClick={() => onRemove(item.id)}>
                    Remove
                  </button>
                </div>
              </div>

              <p className="review-set-excerpt">
                <strong>Selected text</strong>
                <span>{item.excerpt || "No visible text was available."}{item.excerptTruncated ? " (shortened)" : ""}</span>
              </p>

              <p className="review-set-excerpt">
                <strong>Change focus</strong>
                <span>{labelForCategory(item.issueCategory)}</span>
              </p>

              <label className="inspection-note">
                <span>Teacher note ({utf8ByteLength(item.teacherNote)}/{REVIEW_SET_NOTE_MAX_BYTES} bytes)</span>
                <textarea
                  value={item.teacherNote}
                  disabled={preparing}
                  onChange={(event) => onTeacherNoteChange(item.id, event.target.value)}
                  placeholder="What should Codex change here?"
                  rows={2}
                />
              </label>

              {item.screenshot ? (
                <div className="review-set-screenshot" data-testid="review-set-screenshot">
                  <img src={item.screenshot.imageUrl} alt={`Saved annotation for ${itemTitle(item, index + 1)}`} />
                  <div className="inspection-actions">
                    <button type="button" className="ghost-button compact" disabled={preparing} onClick={() => onDownloadScreenshot(item.id)}>
                      Download annotation
                    </button>
                    <button type="button" className="ghost-button compact danger" disabled={preparing} onClick={() => onRemoveScreenshot(item.id)}>
                      Remove annotation
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-state">No saved selections yet.</p>
      )}

      <div className="review-set-prepare">
        <button
          type="button"
          className="ghost-button compact active-toggle"
          disabled={!items.length || preparing}
          onClick={onPrepare}
          data-testid="prepare-review-set"
        >
          {preparing ? "Revalidating saved selections…" : "Prepare batch handoff"}
        </button>
        <span>Preparing rechecks every saved source mapping before it creates text to copy.</span>
      </div>
      {packetError ? <p className="inspection-warning">{packetError}</p> : null}
      {packet ? <pre className="inspection-packet" data-testid="review-set-packet">{packet}</pre> : null}
      <div className="inspection-actions">
        <button
          type="button"
          className="ghost-button compact active-toggle"
          disabled={!packet || Boolean(packetError) || preparing}
          onClick={onCopy}
          data-testid="copy-review-set"
        >
          Copy Review Set for Codex
        </button>
        {copyStatus ? <span className="inspection-copy-status" role="status">{copyStatus}</span> : null}
      </div>
    </section>
  );
}
