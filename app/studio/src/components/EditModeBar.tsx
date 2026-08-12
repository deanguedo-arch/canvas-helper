type EditModeBarProps = {
  draftCount: number;
  selectionReady: boolean;
  busy: boolean;
  onOpenDrafts: () => void;
  onDone: () => void;
};

export function EditModeBar({ draftCount, selectionReady, busy, onOpenDrafts, onDone }: EditModeBarProps) {
  return (
    <div className="annotation-mode-bar edit-mode-bar" role="toolbar" aria-label="Course edit mode" data-testid="edit-mode-bar">
      <div className="annotation-mode-copy">
        <strong>Edit mode</strong>
        <span>{selectionReady ? "This element is ready to change." : "Click text, a link, or an image in the course."}</span>
      </div>
      <div className="annotation-mode-actions">
        <button type="button" onClick={onOpenDrafts}>Draft Changes ({draftCount})</button>
        <button type="button" className="annotation-mode-done" onClick={onDone} disabled={busy}>Done</button>
      </div>
    </div>
  );
}
