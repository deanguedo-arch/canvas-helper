import { useEffect, useRef } from "react";

import { CURRENT_STUDIO_RELEASE } from "../lib/studio-release-notes";

type WhatsNewPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function WhatsNewPanel({ open, onClose }: WhatsNewPanelProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const backdrop = backdropRef.current;
    const parent = backdrop?.parentElement;
    if (!backdrop || !parent) return;
    const background = Array.from(parent.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== backdrop)
      .map((element) => ({
        element,
        inert: element.inert,
        ariaHidden: element.getAttribute("aria-hidden")
      }));
    for (const { element } of background) {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    }
    return () => {
      for (const { element, inert, ariaHidden } of background) {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="studio-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={panelRef}
        className="whats-new-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
        aria-describedby="whats-new-summary"
        data-testid="whats-new-panel"
      >
        <header>
          <div>
            <span className="dialog-eyebrow">Canvas Studio {CURRENT_STUDIO_RELEASE.version}</span>
            <h2 id="whats-new-title">{CURRENT_STUDIO_RELEASE.title}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label="Close What’s New"
            data-testid="close-whats-new"
          >
            ×
          </button>
        </header>
        <p id="whats-new-summary">{CURRENT_STUDIO_RELEASE.summary}</p>
        <div className="whats-new-list">
          {CURRENT_STUDIO_RELEASE.notes.map((note, index) => (
            <article key={note.title}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{note.title}</h3>
                <p>{note.summary}</p>
              </div>
            </article>
          ))}
        </div>
        <footer>
          <span>{CURRENT_STUDIO_RELEASE.date}</span>
          <button type="button" className="primary-action" onClick={onClose}>Back to Studio</button>
        </footer>
      </section>
    </div>
  );
}
