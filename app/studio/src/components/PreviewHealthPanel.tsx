import type { PreviewDiagnostic } from "../../../shared/preview-bridge.js";
import type { PreviewMode } from "../lib/types";

export type PreviewHealthEntry = PreviewDiagnostic & {
  id: string;
  mode: PreviewMode;
};

type PreviewHealthPanelProps = {
  entries: PreviewHealthEntry[];
  onClear: () => void;
};

function labelFor(kind: PreviewDiagnostic["kind"]) {
  if (kind === "asset-error") return "Asset";
  if (kind === "unhandled-rejection") return "Promise";
  return "Runtime";
}

export function PreviewHealthPanel({ entries, onClear }: PreviewHealthPanelProps) {
  return (
    <section className="panel-card preview-health" data-testid="preview-health">
      <div className="section-header">
        <div>
          <h3>Preview health</h3>
          <p>Bounded preview signals only—not a browser console.</p>
        </div>
        <button type="button" className="ghost-button compact" disabled={!entries.length} onClick={onClear}>Clear</button>
      </div>
      {entries.length ? (
        <ul className="preview-health-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <strong>{labelFor(entry.kind)} · {entry.mode}</strong>
              <span>{entry.message}</span>
            </li>
          ))}
        </ul>
      ) : <p className="empty-state">No runtime issues reported during this Studio session.</p>}
    </section>
  );
}
