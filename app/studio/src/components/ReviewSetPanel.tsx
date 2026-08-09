import { REVIEW_SET_MAX_ITEMS, type ReviewSetItem } from "../lib/review-set";

type ReviewSetPanelProps = {
  items: ReviewSetItem[];
  status: string;
  preparing: boolean;
  packetReady: boolean;
  packetError: string;
  copyStatus: string;
  onClear: () => void;
  onRemove: (id: string) => void;
  onTeacherNoteChange: (id: string, value: string) => void;
  onRemoveScreenshot: (id: string) => void;
  onCopy: () => void;
};

function itemTitle(item: ReviewSetItem, position: number) {
  const text = item.excerpt || item.resolution.selection.tagName || "Selected element";
  return `${position}. ${text}`;
}

export function ReviewSetPanel({
  items,
  status,
  preparing,
  packetReady,
  packetError,
  copyStatus,
  onClear,
  onRemove,
  onTeacherNoteChange,
  onRemoveScreenshot,
  onCopy
}: ReviewSetPanelProps) {
  return (
    <section className="panel-card review-set-panel" data-testid="review-set">
      <div className="section-header">
        <div>
          <h3>Review Set</h3>
          <p className="review-set-summary">{items.length} of {REVIEW_SET_MAX_ITEMS} saved</p>
        </div>
        <button type="button" className="ghost-button compact" disabled={!items.length} onClick={onClear}>
          Clear
        </button>
      </div>

      {items.length ? (
        <ol className="review-set-items" data-testid="review-set-items">
          {items.map((item, index) => (
            <li key={item.id} className="review-set-item" data-testid="review-set-item">
              <div className="review-set-item-heading">
                <strong>{itemTitle(item, index + 1)}</strong>
                <button type="button" className="ghost-button compact danger" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
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

              {item.screenshot ? (
                <div className="review-set-screenshot" data-testid="review-set-screenshot">
                  <img src={item.screenshot.imageUrl} alt={`Screenshot for annotation ${index + 1}`} />
                  <button type="button" className="ghost-button compact danger" onClick={() => onRemoveScreenshot(item.id)}>
                    Remove screenshot
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-state">Your saved annotations will appear here.</p>
      )}

      {status ? <p className="review-set-status" role="status">{status}</p> : null}
      {packetError ? <p className="inspection-warning">{packetError}</p> : null}
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
        {copyStatus ? <span className="inspection-copy-status" role="status">{copyStatus}</span> : null}
      </div>
    </section>
  );
}
