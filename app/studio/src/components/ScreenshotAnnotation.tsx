import type { ScreenshotDraft } from "../hooks/useScreenshotAnnotation";

type ScreenshotAnnotationProps = {
  drafts: ScreenshotDraft[];
  onCrop: (id: string) => void;
  onDownload: (id: string) => void;
  onDiscard: (id: string) => void;
};

export function ScreenshotAnnotation({ drafts, onCrop, onDownload, onDiscard }: ScreenshotAnnotationProps) {
  return (
    <section className="screenshot-annotation" data-testid="screenshot-annotation">
      <div className="section-header">
        <h4>Screenshots ready</h4>
        <span>{drafts.length}</span>
      </div>
      <div className="screenshot-draft-grid">
        {drafts.map((draft, index) => (
          <article key={draft.id} className="screenshot-draft" data-testid="screenshot-draft">
            <img src={draft.imageUrl} alt={`Marked course screenshot ${index + 1}`} loading="lazy" decoding="async" />
            <div className="screenshot-draft-actions">
              <button type="button" className="ghost-button compact" disabled={draft.cropped} onClick={() => onCrop(draft.id)}>
                {draft.cropped ? "Cropped" : "Crop to selection"}
              </button>
              <button type="button" className="ghost-button compact" onClick={() => onDownload(draft.id)}>
                Download
              </button>
              <button type="button" className="ghost-button compact danger" onClick={() => onDiscard(draft.id)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
