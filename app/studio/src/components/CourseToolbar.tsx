import type { ReactNode } from "react";

import { DEVICE_PRESETS, type DeviceMode, type PreviewLayoutPreferences, type PreviewMode } from "../lib/types";

type CourseToolbarProps = {
  picker: ReactNode;
  layoutPreferences: PreviewLayoutPreferences;
  previewMode: PreviewMode;
  inspectEnabled: boolean;
  inspectAvailable: boolean;
  hasWorkspacePreview: boolean;
  reviewSetCount: number;
  toolsOpen: boolean;
  onSetCompareMode: (compareMode: boolean) => void;
  onSetPreviewMode: (previewMode: PreviewMode) => void;
  onDeviceChange: (mode: PreviewMode, device: DeviceMode) => void;
  onZoomChange: (mode: PreviewMode, zoom: number) => void;
  onToggleInspect: (keyboardEntry?: boolean) => void;
  onToggleInspector: () => void;
  onToggleTools: () => void;
  onOpenWorkspacePreview: () => void;
};

function ToolbarIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="toolbar-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function CourseToolbar({
  picker,
  layoutPreferences,
  previewMode,
  inspectEnabled,
  inspectAvailable,
  hasWorkspacePreview,
  reviewSetCount,
  toolsOpen,
  onSetCompareMode,
  onSetPreviewMode,
  onDeviceChange,
  onZoomChange,
  onToggleInspect,
  onToggleInspector,
  onToggleTools,
  onOpenWorkspacePreview
}: CourseToolbarProps) {
  const activePreviewMode = layoutPreferences.compareMode ? "workspace" : previewMode;
  const zoomOptions = Array.from({ length: 17 }, (_, index) => 60 + index * 5);

  return (
    <section className="course-toolbar" aria-label="Course preview controls">
      <div className="course-toolbar-context">
        {picker}
      </div>

      <div className="course-toolbar-actions">
        <div className="course-view-controls">
          <div className="segmented-control course-layout-control" aria-label="Preview layout">
            <button
              type="button"
              className={layoutPreferences.compareMode ? "segmented-button" : "segmented-button active"}
              onClick={() => onSetCompareMode(false)}
              aria-pressed={!layoutPreferences.compareMode}
              data-testid="layout-focus-toggle"
            >
              Focus
            </button>
            <button
              type="button"
              className={layoutPreferences.compareMode ? "segmented-button active" : "segmented-button"}
              onClick={() => onSetCompareMode(true)}
              aria-pressed={layoutPreferences.compareMode}
              data-testid="layout-split-toggle"
            >
              Split
            </button>
          </div>
          {!layoutPreferences.compareMode ? (
            <div className="segmented-control course-version-control" aria-label="Course version">
              <button
                type="button"
                className={previewMode === "reference" ? "segmented-button active" : "segmented-button"}
                onClick={() => onSetPreviewMode("reference")}
                aria-pressed={previewMode === "reference"}
                data-testid="preview-reference-toggle"
              >
                Original
              </button>
              <button
                type="button"
                className={previewMode === "workspace" ? "segmented-button active" : "segmented-button"}
                onClick={() => onSetPreviewMode("workspace")}
                aria-pressed={previewMode === "workspace"}
                data-testid="preview-workspace-toggle"
              >
                Current
              </button>
            </div>
          ) : null}

          <label className="toolbar-select-field">
            <span className="sr-only">Preview device</span>
            <select
              value={layoutPreferences.devices[activePreviewMode]}
              onChange={(event) => onDeviceChange(activePreviewMode, event.target.value as DeviceMode)}
              aria-label="Preview device"
            >
              {Object.entries(DEVICE_PRESETS).map(([device, preset]) => (
                <option key={device} value={device}>{preset.label}</option>
              ))}
            </select>
          </label>

          <label className="toolbar-select-field zoom-select-field">
            <span className="sr-only">Preview zoom</span>
            <select
              value={layoutPreferences.zooms[activePreviewMode]}
              onChange={(event) => onZoomChange(activePreviewMode, Number(event.target.value))}
              aria-label="Preview zoom"
            >
              {zoomOptions.map((zoom) => <option key={zoom} value={zoom}>{zoom}%</option>)}
            </select>
          </label>
        </div>

        <div className="course-workflow-controls">
          <button
            type="button"
            className={inspectEnabled ? "toolbar-button annotate-action active" : "toolbar-button annotate-action"}
            onClick={(event) => onToggleInspect(event.detail === 0)}
            aria-pressed={inspectEnabled}
            disabled={!inspectAvailable}
            data-testid="inspect-toggle"
            title={inspectAvailable ? "Select course elements and collect notes for Codex" : "Starting isolated preview"}
          >
            <ToolbarIcon><path d="m4 16 2.4-.5 8.7-8.7-1.9-1.9-8.7 8.7L4 16Zm7.8-9.8 1.9 1.9M10.2 16h5.9" /></ToolbarIcon>
            {inspectEnabled ? "Annotating" : "Annotate"}
          </button>

          {hasWorkspacePreview ? (
            <button
              type="button"
              className="toolbar-button"
              onClick={onOpenWorkspacePreview}
              data-testid="open-workspace-preview-toggle"
              title="Open the current course in the full preview"
            >
              <ToolbarIcon><path d="M7 4H4.8A1.8 1.8 0 0 0 3 5.8v9.4A1.8 1.8 0 0 0 4.8 17h9.4a1.8 1.8 0 0 0 1.8-1.8V13M11 4h5v5M9 11l7-7" /></ToolbarIcon>
              Full preview
            </button>
          ) : (
            <button type="button" className="toolbar-button" disabled data-testid="open-workspace-preview-toggle">
              Full preview
            </button>
          )}

          <button
            type="button"
            className={layoutPreferences.inspectorOpen ? "toolbar-button review-set-action active" : "toolbar-button review-set-action"}
            onClick={onToggleInspector}
            aria-expanded={layoutPreferences.inspectorOpen}
            aria-controls="studio-review-set"
            data-testid="inspector-toggle"
          >
            <ToolbarIcon><path d="M4 4.5h12v11H4zM7 8h6M7 11h6" /></ToolbarIcon>
            Review Set
            <span className="toolbar-count">{reviewSetCount}</span>
          </button>

          <button
            type="button"
            className={toolsOpen ? "toolbar-button toolbar-tools active" : "toolbar-button toolbar-tools"}
            onClick={onToggleTools}
            aria-expanded={toolsOpen}
            aria-controls="course-tools-panel"
          >
            <ToolbarIcon><path d="M4 5h12M7 10h9M4 15h12M6 3v4M13 8v4M8 13v4" /></ToolbarIcon>
            Tools
          </button>
        </div>
      </div>
    </section>
  );
}
