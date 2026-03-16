import type { PreviewLayoutPreferences, PreviewMode } from "../lib/types";

type TopbarProps = {
  layoutPreferences: PreviewLayoutPreferences;
  previewMode: PreviewMode;
  learnerMode: string;
  onSetCompareMode: (compareMode: boolean) => void;
  onSetPreviewMode: (previewMode: PreviewMode) => void;
  onToggleInspector: () => void;
};

export function Topbar({
  layoutPreferences,
  previewMode,
  learnerMode,
  onSetCompareMode,
  onSetPreviewMode,
  onToggleInspector
}: TopbarProps) {
  return (
    <header className="topbar topbar-compact" data-testid="studio-topbar">
      <div className="project-summary">
        <h2>Studio</h2>
        <p className="learner-mode-pill">Learner: {learnerMode}</p>
      </div>

      <div className="topbar-actions">
        <div className="segmented-control">
          <button
            type="button"
            className={layoutPreferences.compareMode ? "segmented-button" : "segmented-button active"}
            onClick={() => onSetCompareMode(false)}
            data-testid="layout-focus-toggle"
          >
            Focus
          </button>
          <button
            type="button"
            className={layoutPreferences.compareMode ? "segmented-button active" : "segmented-button"}
            onClick={() => onSetCompareMode(true)}
            data-testid="layout-split-toggle"
          >
            Split
          </button>
        </div>

        {!layoutPreferences.compareMode ? (
          <div className="segmented-control" role="tablist" aria-label="Preview mode">
            <button
              type="button"
              className={previewMode === "reference" ? "segmented-button active" : "segmented-button"}
              onClick={() => onSetPreviewMode("reference")}
              data-testid="preview-reference-toggle"
            >
              Ref
            </button>
            <button
              type="button"
              className={previewMode === "workspace" ? "segmented-button active" : "segmented-button"}
              onClick={() => onSetPreviewMode("workspace")}
              data-testid="preview-workspace-toggle"
            >
              Workspace
            </button>
          </div>
        ) : null}

        <button
          type="button"
          className={layoutPreferences.inspectorOpen ? "ghost-button compact" : "ghost-button compact active-toggle"}
          onClick={onToggleInspector}
          data-testid="inspector-toggle"
        >
          {layoutPreferences.inspectorOpen ? "Hide Details" : "Details"}
        </button>
      </div>
    </header>
  );
}
