import { useEffect, useRef } from "react";

type NewProjectPanelProps = {
  open: boolean;
  running: boolean;
  message: string;
  isError: boolean;
  onClose: () => void;
  onScan: () => void;
};

export function NewProjectPanel({
  open,
  running,
  message,
  isError,
  onClose,
  onScan
}: NewProjectPanelProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="studio-dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="new-project-panel" role="dialog" aria-modal="true" aria-labelledby="new-project-title" data-testid="new-project-panel">
        <header>
          <div>
            <span className="dialog-eyebrow">Local intake</span>
            <h2 id="new-project-title">Start a new course project</h2>
          </div>
          <button ref={closeRef} type="button" className="dialog-close" onClick={onClose} aria-label="Close New Project">×</button>
        </header>
        <p>
          Add an HTML course, exported course bundle, or supporting resources to Canvas Helper’s Intake folder. Then scan to create or refresh the project.
        </p>
        <ol className="new-project-steps">
          <li><span>1</span><div><strong>Add the source</strong><small>Keep each course or bundle together in the local Intake folder.</small></div></li>
          <li><span>2</span><div><strong>Scan intake</strong><small>Studio imports what is ready and keeps incomplete items untouched.</small></div></li>
          <li><span>3</span><div><strong>Open the course</strong><small>The new project appears in search and the course picker.</small></div></li>
        </ol>
        {message ? (
          <div className={isError ? "new-project-message error" : "new-project-message"} role="status">{message}</div>
        ) : null}
        <footer>
          <button type="button" className="secondary-action" onClick={onClose}>Not now</button>
          <button type="button" className="primary-action" onClick={onScan} disabled={running} data-testid="scan-intake-button">
            {running ? "Scanning…" : "Scan intake"}
          </button>
        </footer>
      </section>
    </div>
  );
}
